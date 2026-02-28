import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

/**
 * EventDetail - Detailed view for a single event
 * Sub-tabs: Details | Athletes | Run Sheet | Gallery
 */
export default function EventDetail({ event, organization, onBack, onEventUpdate }) {
  const [activeTab, setActiveTab] = useState('details')
  const [loading, setLoading] = useState(true)
  
  // Event data
  const [eventData, setEventData] = useState(event)
  const [orders, setOrders] = useState([])
  const [galleries, setGalleries] = useState([])
  const [galleryPhotos, setGalleryPhotos] = useState([])
  
  // Athletes / Run Sheet data
  const [athletes, setAthletes] = useState([])
  const [importText, setImportText] = useState('')
  const [showImportModal, setShowImportModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterMat, setFilterMat] = useState('all')
  
  // Editing state
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({})
  
  // Match card modal state
  const [showMatchCardModal, setShowMatchCardModal] = useState(false)
  const [selectedOrderForCard, setSelectedOrderForCard] = useState(null)
  const [uploadingCard, setUploadingCard] = useState(false)
  const [extractingData, setExtractingData] = useState(false)

  useEffect(() => {
    loadEventData()
  }, [event.id])

  async function loadEventData() {
    setLoading(true)
    
    const [ordersRes, galleriesRes, athletesRes] = await Promise.all([
      supabase
        .from('content_orders')
        .select('*, packages(name)')
        .eq('event_id', event.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('galleries')
        .select('*, gallery_photos(count)')
        .eq('event_id', event.id),
      supabase
        .from('event_athletes')
        .select('*')
        .eq('event_id', event.id)
        .order('competition_time', { ascending: true })
    ])
    
    // Generate signed URLs for match cards (private bucket)
    const ordersWithSignedUrls = await Promise.all(
      (ordersRes.data || []).map(async (order) => {
        if (order.match_card_url && !order.match_card_url.startsWith('http')) {
          const { data } = await supabase.storage
            .from('match-cards')
            .createSignedUrl(order.match_card_url, 3600)
          return { ...order, match_card_signed_url: data?.signedUrl }
        }
        // Legacy: if it's already a full URL, use as-is
        return { ...order, match_card_signed_url: order.match_card_url }
      })
    )
    
    setOrders(ordersWithSignedUrls)
    setGalleries(galleriesRes.data || [])
    setAthletes(athletesRes.data || [])
    
    setLoading(false)
  }

  // Parse Smoothcomp import format: Name | Division | Mat | Time | Academy
  function parseImportData(text) {
    const lines = text.trim().split('\n').filter(line => line.trim())
    const parsed = []
    
    for (const line of lines) {
      const parts = line.split('|').map(p => p.trim())
      if (parts.length >= 1) {
        parsed.push({
          name: parts[0] || '',
          division: parts[1] || '',
          mat: parts[2] || '',
          competition_time: parts[3] || '',
          academy: parts[4] || '',
          event_id: event.id,
          status: 'pending',
          captured: false
        })
      }
    }
    
    return parsed
  }

  async function importAthletes() {
    const parsed = parseImportData(importText)
    if (parsed.length === 0) {
      alert('No valid athlete data found')
      return
    }
    
    const { error } = await supabase.from('event_athletes').insert(parsed)
    
    if (error) {
      alert('Error importing athletes: ' + error.message)
    } else {
      setShowImportModal(false)
      setImportText('')
      loadEventData()
    }
  }

  async function toggleCaptured(athleteId, currentStatus) {
    const { error } = await supabase
      .from('event_athletes')
      .update({ captured: !currentStatus, captured_at: !currentStatus ? new Date().toISOString() : null })
      .eq('id', athleteId)
    
    if (!error) {
      setAthletes(prev => prev.map(a => 
        a.id === athleteId ? { ...a, captured: !currentStatus } : a
      ))
    }
  }

  async function deleteAthlete(athleteId) {
    if (!confirm('Delete this athlete?')) return
    
    const { error } = await supabase.from('event_athletes').delete().eq('id', athleteId)
    if (!error) {
      setAthletes(prev => prev.filter(a => a.id !== athleteId))
    }
  }

  async function clearAllAthletes() {
    if (!confirm('Delete ALL athletes for this event? This cannot be undone.')) return
    
    const { error } = await supabase.from('event_athletes').delete().eq('event_id', event.id)
    if (!error) {
      setAthletes([])
    }
  }

  // Match Card Functions
  async function uploadMatchCard(file) {
    if (!file || !selectedOrderForCard) return
    
    setUploadingCard(true)
    
    try {
      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${selectedOrderForCard.id}-${Date.now()}.${fileExt}`
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('match-cards')
        .upload(fileName, file)
      
      if (uploadError) throw uploadError
      
      // Store just the file path (not full URL) for private bucket
      const matchCardPath = fileName
      
      // Update order with match card path
      const { error: updateError } = await supabase
        .from('content_orders')
        .update({ match_card_url: matchCardPath })
        .eq('id', selectedOrderForCard.id)
      
      if (updateError) throw updateError
      
      // Get signed URL for display
      const { data: signedData } = await supabase.storage
        .from('match-cards')
        .createSignedUrl(matchCardPath, 3600)
      
      const displayUrl = signedData?.signedUrl
      
      // Update local state with signed URL for immediate display
      setOrders(prev => prev.map(o => 
        o.id === selectedOrderForCard.id 
          ? { ...o, match_card_url: matchCardPath, match_card_signed_url: displayUrl }
          : o
      ))
      
      // Now extract data from the image using signed URL
      await extractMatchCardData(displayUrl, selectedOrderForCard.id)
      
      setShowMatchCardModal(false)
      setSelectedOrderForCard(null)
      
    } catch (error) {
      console.error('Upload error:', error)
      alert('Error uploading match card: ' + error.message)
    } finally {
      setUploadingCard(false)
    }
  }

  async function extractMatchCardData(imageUrl, orderId) {
    setExtractingData(true)
    
    try {
      // Call Edge Function to extract data using Claude Vision
      const { data, error } = await supabase.functions.invoke('extract-match-card', {
        body: { imageUrl, orderId }
      })
      
      if (error) {
        console.error('Extraction error:', error)
        // Still save the image even if extraction fails
        return
      }
      
      // Update order with extracted data
      const { error: updateError } = await supabase
        .from('content_orders')
        .update({ match_card_data: data })
        .eq('id', orderId)
      
      if (!updateError) {
        setOrders(prev => prev.map(o => 
          o.id === orderId 
            ? { ...o, match_card_data: data }
            : o
        ))
        
        // Also create/update athlete record if we extracted enough data
        if (data.mat || data.time || data.division) {
          const order = orders.find(o => o.id === orderId)
          if (order) {
            await createOrUpdateAthleteFromOrder(order, data)
          }
        }
      }
    } catch (error) {
      console.error('Extraction error:', error)
    } finally {
      setExtractingData(false)
    }
  }

  async function deleteMatchCard(order) {
    if (!confirm('Remove this match card?')) return
    
    try {
      // Delete from storage if it's a path (not legacy URL)
      if (order.match_card_url && !order.match_card_url.startsWith('http')) {
        await supabase.storage
          .from('match-cards')
          .remove([order.match_card_url])
      }
      
      // Clear from database
      await supabase
        .from('content_orders')
        .update({ match_card_url: null, match_card_data: null })
        .eq('id', order.id)
      
      // Update local state
      setOrders(prev => prev.map(o => 
        o.id === order.id 
          ? { ...o, match_card_url: null, match_card_signed_url: null, match_card_data: null }
          : o
      ))
    } catch (error) {
      console.error('Delete error:', error)
      alert('Error removing match card')
    }
  }

  async function createOrUpdateAthleteFromOrder(order, extractedData) {
    const athleteName = `${order.first_name || ''} ${order.last_name || ''}`.trim()
    
    // Check if athlete already exists
    const { data: existing } = await supabase
      .from('event_athletes')
      .select('id')
      .eq('event_id', event.id)
      .ilike('name', athleteName)
      .single()
    
    const athleteData = {
      event_id: event.id,
      name: athleteName,
      division: extractedData.division || null,
      mat: extractedData.mat || null,
      competition_time: extractedData.time || null,
      email: order.email || null,
      status: 'pending',
      captured: false
    }
    
    if (existing) {
      await supabase
        .from('event_athletes')
        .update(athleteData)
        .eq('id', existing.id)
    } else {
      await supabase
        .from('event_athletes')
        .insert(athleteData)
    }
    
    // Refresh athletes list
    loadEventData()
  }

  function openMatchCardModal(order) {
    setSelectedOrderForCard(order)
    setShowMatchCardModal(true)
  }

  async function saveEventDetails() {
    const { error } = await supabase
      .from('events')
      .update(editForm)
      .eq('id', event.id)
    
    if (error) {
      alert('Error saving: ' + error.message)
    } else {
      setEventData({ ...eventData, ...editForm })
      setIsEditing(false)
      if (onEventUpdate) onEventUpdate()
    }
  }

  // Filter athletes
  const filteredAthletes = athletes.filter(athlete => {
    const matchesSearch = !searchQuery || 
      athlete.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      athlete.academy?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      athlete.division?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = filterStatus === 'all' ||
      (filterStatus === 'captured' && athlete.captured) ||
      (filterStatus === 'pending' && !athlete.captured) ||
      (filterStatus === 'paid' && orders.some(o => 
        `${o.first_name} ${o.last_name}`.toLowerCase() === athlete.name?.toLowerCase() ||
        o.email?.toLowerCase() === athlete.email?.toLowerCase()
      ))
    
    const matchesMat = filterMat === 'all' || athlete.mat === filterMat
    
    return matchesSearch && matchesStatus && matchesMat
  })

  // Get unique mats for filter dropdown
  const uniqueMats = [...new Set(athletes.map(a => a.mat).filter(Boolean))]

  // Get athletes who have paid (match orders to athletes)
  const paidAthleteNames = new Set(
    orders.map(o => `${o.first_name || ''} ${o.last_name || ''}`.toLowerCase().trim()).filter(Boolean)
  )
  
  // Priority queue: paid but not captured
  const priorityQueue = athletes.filter(a => 
    paidAthleteNames.has(a.name?.toLowerCase()) && !a.captured
  ).sort((a, b) => {
    // Sort by competition time
    if (a.competition_time && b.competition_time) {
      return a.competition_time.localeCompare(b.competition_time)
    }
    return 0
  })

  const tabs = [
    { id: 'details', label: 'Details' },
    { id: 'athletes', label: `Athletes (${athletes.length})` },
    { id: 'runsheet', label: 'Run Sheet' },
    { id: 'gallery', label: `Gallery (${galleries.length})` },
    { id: 'orders', label: `Orders (${orders.length})` }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Events
          </button>
        </div>
        <div className="text-right">
          <span className={`px-3 py-1 rounded text-sm ${
            eventData.status === 'upcoming' ? 'bg-blue-600' :
            eventData.status === 'active' ? 'bg-green-600' : 'bg-gray-600'
          }`}>
            {eventData.status}
          </span>
        </div>
      </div>

      {/* Event Title */}
      <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-6">
        <h1 className="text-2xl font-bold">{eventData.name}</h1>
        <p className="text-gray-400 mt-1">
          {eventData.date && new Date(eventData.date).toLocaleDateString('en-AU', { 
            weekday: 'long', 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric' 
          })}
          {eventData.location && ` • ${eventData.location}`}
        </p>
        <p className="text-sm text-gray-500 mt-1">{organization?.name}</p>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-2 border-b border-gray-700 pb-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-t-lg transition-colors ${
              activeTab === tab.id 
                ? 'bg-red-600 text-white' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading...</div>
      ) : (
        <>
          {/* DETAILS TAB */}
          {activeTab === 'details' && (
            <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-6 space-y-4">
              {isEditing ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Event Name</label>
                      <input
                        type="text"
                        value={editForm.name || ''}
                        onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Date</label>
                      <input
                        type="date"
                        value={editForm.date?.split('T')[0] || ''}
                        onChange={e => setEditForm({ ...editForm, date: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm text-gray-400 mb-1">Location</label>
                      <input
                        type="text"
                        value={editForm.location || ''}
                        onChange={e => setEditForm({ ...editForm, location: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Status</label>
                      <select
                        value={editForm.status || 'upcoming'}
                        onChange={e => setEditForm({ ...editForm, status: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg"
                      >
                        <option value="upcoming">Upcoming</option>
                        <option value="active">Active</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Active</label>
                      <select
                        value={editForm.active ? 'true' : 'false'}
                        onChange={e => setEditForm({ ...editForm, active: e.target.value === 'true' })}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg"
                      >
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-4">
                    <button
                      onClick={saveEventDetails}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg"
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-gray-400">Event Name</span>
                      <p className="font-medium">{eventData.name}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-400">Date</span>
                      <p className="font-medium">
                        {eventData.date && new Date(eventData.date).toLocaleDateString('en-AU')}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <span className="text-sm text-gray-400">Location</span>
                      <p className="font-medium">{eventData.location || 'Not set'}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => { setEditForm(eventData); setIsEditing(true) }}
                    className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
                  >
                    Edit Details
                  </button>
                </>
              )}
            </div>
          )}

          {/* ATHLETES TAB */}
          {activeTab === 'athletes' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Search athletes..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg w-64"
                  />
                  <select
                    value={filterMat}
                    onChange={e => setFilterMat(e.target.value)}
                    className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg"
                  >
                    <option value="all">All Mats</option>
                    {uniqueMats.map(mat => (
                      <option key={mat} value={mat}>Mat {mat}</option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowImportModal(true)}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg"
                  >
                    Import from Smoothcomp
                  </button>
                  {athletes.length > 0 && (
                    <button
                      onClick={clearAllAthletes}
                      className="px-4 py-2 bg-red-900 hover:bg-red-800 rounded-lg text-sm"
                    >
                      Clear All
                    </button>
                  )}
                </div>
              </div>

              {athletes.length === 0 ? (
                <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-8 text-center text-gray-400">
                  <p>No athletes imported yet.</p>
                  <p className="text-sm mt-2">Import from Smoothcomp to get started.</p>
                </div>
              ) : (
                <div className="bg-gray-900/50 rounded-xl border border-gray-800 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-800">
                      <tr>
                        <th className="text-left p-3">Name</th>
                        <th className="text-left p-3">Division</th>
                        <th className="text-center p-3">Mat</th>
                        <th className="text-center p-3">Time</th>
                        <th className="text-left p-3">Academy</th>
                        <th className="text-center p-3">Paid</th>
                        <th className="text-center p-3">Captured</th>
                        <th className="text-right p-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAthletes.map(athlete => {
                        const hasPaid = paidAthleteNames.has(athlete.name?.toLowerCase())
                        return (
                          <tr key={athlete.id} className={`border-t border-gray-800 ${hasPaid && !athlete.captured ? 'bg-yellow-900/20' : ''}`}>
                            <td className="p-3 font-medium">{athlete.name}</td>
                            <td className="p-3 text-gray-400">{athlete.division}</td>
                            <td className="p-3 text-center">{athlete.mat}</td>
                            <td className="p-3 text-center text-gray-400">{athlete.competition_time}</td>
                            <td className="p-3 text-gray-400">{athlete.academy}</td>
                            <td className="p-3 text-center">
                              {hasPaid ? (
                                <span className="text-green-400">💰</span>
                              ) : (
                                <span className="text-gray-600">-</span>
                              )}
                            </td>
                            <td className="p-3 text-center">
                              <button
                                onClick={() => toggleCaptured(athlete.id, athlete.captured)}
                                className={`px-2 py-1 rounded text-xs ${
                                  athlete.captured ? 'bg-green-600' : 'bg-gray-600 hover:bg-gray-500'
                                }`}
                              >
                                {athlete.captured ? '✓' : '○'}
                              </button>
                            </td>
                            <td className="p-3 text-right">
                              <button
                                onClick={() => deleteAthlete(athlete.id)}
                                className="text-red-400 hover:text-red-300"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* RUN SHEET TAB */}
          {activeTab === 'runsheet' && (
            <div className="space-y-6">
              {/* Priority Queue */}
              <div className="bg-yellow-900/20 border border-yellow-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-yellow-400 mb-4">
                  🔥 Priority Queue ({priorityQueue.length})
                </h3>
                <p className="text-sm text-gray-400 mb-4">
                  Athletes who have PAID but not yet been photographed. Capture these first!
                </p>
                
                {priorityQueue.length === 0 ? (
                  <p className="text-gray-500 italic">No pending captures. All paid athletes have been photographed!</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {priorityQueue.map(athlete => (
                      <div 
                        key={athlete.id}
                        className="bg-gray-800 rounded-lg p-4 border border-yellow-700"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold">{athlete.name}</p>
                            <p className="text-sm text-gray-400">{athlete.division}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              Mat {athlete.mat} • {athlete.competition_time}
                            </p>
                          </div>
                          <button
                            onClick={() => toggleCaptured(athlete.id, false)}
                            className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm"
                          >
                            Mark Captured
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-4 text-center">
                  <p className="text-3xl font-bold">{athletes.length}</p>
                  <p className="text-sm text-gray-400">Total Athletes</p>
                </div>
                <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-4 text-center">
                  <p className="text-3xl font-bold text-green-400">{orders.length}</p>
                  <p className="text-sm text-gray-400">Orders</p>
                </div>
                <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-4 text-center">
                  <p className="text-3xl font-bold text-yellow-400">{priorityQueue.length}</p>
                  <p className="text-sm text-gray-400">Pending Captures</p>
                </div>
                <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-4 text-center">
                  <p className="text-3xl font-bold text-blue-400">
                    {athletes.filter(a => a.captured).length}
                  </p>
                  <p className="text-sm text-gray-400">Captured</p>
                </div>
              </div>

              {/* Timeline View */}
              <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-6">
                <h3 className="text-lg font-semibold mb-4">Timeline View</h3>
                
                {athletes.length === 0 ? (
                  <p className="text-gray-500 italic">Import athletes to see the timeline.</p>
                ) : (
                  <div className="space-y-2">
                    {Object.entries(
                      athletes.reduce((acc, athlete) => {
                        const time = athlete.competition_time || 'No Time Set'
                        if (!acc[time]) acc[time] = []
                        acc[time].push(athlete)
                        return acc
                      }, {})
                    ).sort(([a], [b]) => a.localeCompare(b)).map(([time, timeAthletes]) => (
                      <div key={time} className="border-l-2 border-gray-700 pl-4 py-2">
                        <p className="font-semibold text-gray-300">{time}</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {timeAthletes.map(athlete => {
                            const hasPaid = paidAthleteNames.has(athlete.name?.toLowerCase())
                            return (
                              <span
                                key={athlete.id}
                                className={`px-3 py-1 rounded text-sm ${
                                  athlete.captured 
                                    ? 'bg-green-900/50 text-green-400 line-through' 
                                    : hasPaid 
                                      ? 'bg-yellow-900/50 text-yellow-400 font-semibold'
                                      : 'bg-gray-800 text-gray-400'
                                }`}
                              >
                                {athlete.name}
                                {hasPaid && !athlete.captured && ' 💰'}
                              </span>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* GALLERY TAB */}
          {activeTab === 'gallery' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Event Galleries</h3>
                <a
                  href={`#/portal/galleries?event=${event.id}&org=${organization?.id}`}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg"
                >
                  Manage Galleries
                </a>
              </div>
              
              {galleries.length === 0 ? (
                <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-8 text-center text-gray-400">
                  No galleries for this event yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {galleries.map(gallery => (
                    <div key={gallery.id} className="bg-gray-900/50 rounded-xl border border-gray-800 p-4">
                      <h4 className="font-semibold">{gallery.title}</h4>
                      <p className="text-sm text-gray-400 mt-1">{gallery.description}</p>
                      <div className="flex gap-4 mt-3 text-sm text-gray-500">
                        <span>{gallery.gallery_photos?.[0]?.count || 0} photos</span>
                        <span>{gallery.access_type}</span>
                      </div>
                      <a
                        href={`#/gallery/${gallery.slug}`}
                        target="_blank"
                        className="inline-block mt-3 text-sm text-blue-400 hover:text-blue-300"
                      >
                        View Gallery →
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ORDERS TAB */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Event Orders</h3>
                <p className="text-sm text-gray-400">
                  Click "Link Match Card" to upload Smoothcomp screenshots
                </p>
              </div>
              
              {orders.length === 0 ? (
                <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-8 text-center text-gray-400">
                  No orders for this event yet.
                </div>
              ) : (
                <div className="grid gap-4">
                  {orders.map(order => (
                    <div key={order.id} className="bg-gray-900/50 rounded-xl border border-gray-800 p-4">
                      <div className="flex gap-4">
                        {/* Match Card Preview */}
                        <div className="flex-shrink-0">
                          {order.match_card_url ? (
                            <div className="relative group">
                              <img 
                                src={order.match_card_signed_url || order.match_card_url} 
                                alt="Match Card"
                                className="w-24 h-32 object-cover rounded-lg cursor-pointer hover:opacity-80"
                                onClick={() => openMatchCardModal(order)}
                              />
                              <button
                                onClick={(e) => { e.stopPropagation(); deleteMatchCard(order); }}
                                className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-700 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Remove card"
                              >
                                ×
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => openMatchCardModal(order)}
                              className="w-24 h-32 bg-gray-800 rounded-lg border-2 border-dashed border-gray-600 hover:border-red-500 flex flex-col items-center justify-center text-gray-500 hover:text-red-400 transition-colors"
                            >
                              <svg className="w-8 h-8 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span className="text-xs">Add Card</span>
                            </button>
                          )}
                        </div>
                        
                        {/* Order Details */}
                        <div className="flex-grow">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-semibold text-lg">{order.first_name} {order.last_name}</p>
                              <p className="text-sm text-gray-400">{order.email}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-green-400">${order.amount}</p>
                              <span className={`px-2 py-1 rounded text-xs ${
                                order.status === 'paid' ? 'bg-green-600' :
                                order.status === 'pending' ? 'bg-yellow-600' : 'bg-gray-600'
                              }`}>
                                {order.status}
                              </span>
                            </div>
                          </div>
                          
                          <div className="mt-2 flex gap-4 text-sm text-gray-400">
                            <span>{order.packages?.name}</span>
                            <span>•</span>
                            <span>{new Date(order.created_at).toLocaleDateString('en-AU')}</span>
                          </div>
                          
                          {/* Extracted Match Card Data */}
                          {order.match_card_data && Object.keys(order.match_card_data).length > 0 && (
                            <div className="mt-3 flex gap-3 flex-wrap">
                              {order.match_card_data.mat && (
                                <span className="px-2 py-1 bg-blue-900/50 text-blue-300 rounded text-sm">
                                  Mat {order.match_card_data.mat}
                                </span>
                              )}
                              {order.match_card_data.time && (
                                <span className="px-2 py-1 bg-purple-900/50 text-purple-300 rounded text-sm">
                                  {order.match_card_data.time}
                                </span>
                              )}
                              {order.match_card_data.division && (
                                <span className="px-2 py-1 bg-green-900/50 text-green-300 rounded text-sm">
                                  {order.match_card_data.division}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl border border-gray-700 p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Import Athletes from Smoothcomp</h3>
            
            <p className="text-sm text-gray-400 mb-4">
              Paste athlete data in this format (one per line):<br/>
              <code className="bg-gray-800 px-2 py-1 rounded text-xs">
                Name | Division | Mat | Time | Academy
              </code>
            </p>
            
            <textarea
              value={importText}
              onChange={e => setImportText(e.target.value)}
              placeholder="John Smith | Adult Blue Belt | 1 | 09:30 | Gracie Barra..."
              className="w-full h-64 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg font-mono text-sm"
            />
            
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => { setShowImportModal(false); setImportText('') }}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={importAthletes}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg"
              >
                Import {parseImportData(importText).length} Athletes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Match Card Upload Modal */}
      {showMatchCardModal && selectedOrderForCard && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl border border-gray-700 p-6 w-full max-w-lg">
            <h3 className="text-lg font-semibold mb-4">
              Link Match Card for {selectedOrderForCard.first_name} {selectedOrderForCard.last_name}
            </h3>
            
            <p className="text-sm text-gray-400 mb-4">
              Upload a screenshot of the athlete's Smoothcomp match card. 
              We'll extract their mat number, competition time, and division automatically.
            </p>
            
            {/* Current Match Card Preview */}
            {selectedOrderForCard.match_card_url && (
              <div className="mb-4">
                <p className="text-sm text-gray-400 mb-2">Current Match Card:</p>
                <img 
                  src={selectedOrderForCard.match_card_url} 
                  alt="Current Match Card"
                  className="w-full max-h-64 object-contain rounded-lg border border-gray-700"
                />
                {selectedOrderForCard.match_card_data && Object.keys(selectedOrderForCard.match_card_data).length > 0 && (
                  <div className="mt-2 flex gap-2 flex-wrap">
                    {selectedOrderForCard.match_card_data.mat && (
                      <span className="px-2 py-1 bg-blue-900/50 text-blue-300 rounded text-sm">
                        Mat {selectedOrderForCard.match_card_data.mat}
                      </span>
                    )}
                    {selectedOrderForCard.match_card_data.time && (
                      <span className="px-2 py-1 bg-purple-900/50 text-purple-300 rounded text-sm">
                        {selectedOrderForCard.match_card_data.time}
                      </span>
                    )}
                    {selectedOrderForCard.match_card_data.division && (
                      <span className="px-2 py-1 bg-green-900/50 text-green-300 rounded text-sm">
                        {selectedOrderForCard.match_card_data.division}
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}
            
            {/* Upload Area */}
            <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) uploadMatchCard(file)
                }}
                className="hidden"
                id="match-card-upload"
                disabled={uploadingCard || extractingData}
              />
              <label 
                htmlFor="match-card-upload"
                className={`cursor-pointer ${uploadingCard || extractingData ? 'opacity-50' : ''}`}
              >
                {uploadingCard ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="animate-spin w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full"></div>
                    <span className="text-gray-400">Uploading...</span>
                  </div>
                ) : extractingData ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                    <span className="text-gray-400">Extracting data with AI...</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <span className="text-gray-400">Click to upload or drag & drop</span>
                    <span className="text-xs text-gray-500">PNG, JPG up to 10MB</span>
                  </div>
                )}
              </label>
            </div>
            
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => { setShowMatchCardModal(false); setSelectedOrderForCard(null) }}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
                disabled={uploadingCard || extractingData}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
