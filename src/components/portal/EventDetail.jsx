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
    
    setOrders(ordersRes.data || [])
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
        o.customer_name?.toLowerCase() === athlete.name?.toLowerCase() ||
        o.customer_email?.toLowerCase() === athlete.email?.toLowerCase()
      ))
    
    const matchesMat = filterMat === 'all' || athlete.mat === filterMat
    
    return matchesSearch && matchesStatus && matchesMat
  })

  // Get unique mats for filter dropdown
  const uniqueMats = [...new Set(athletes.map(a => a.mat).filter(Boolean))]

  // Get athletes who have paid (match orders to athletes)
  const paidAthleteNames = new Set(
    orders.map(o => o.customer_name?.toLowerCase()).filter(Boolean)
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
              <h3 className="text-lg font-semibold">Event Orders</h3>
              
              {orders.length === 0 ? (
                <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-8 text-center text-gray-400">
                  No orders for this event yet.
                </div>
              ) : (
                <div className="bg-gray-900/50 rounded-xl border border-gray-800 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-800">
                      <tr>
                        <th className="text-left p-3">Date</th>
                        <th className="text-left p-3">Customer</th>
                        <th className="text-left p-3">Package</th>
                        <th className="text-right p-3">Amount</th>
                        <th className="text-center p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map(order => (
                        <tr key={order.id} className="border-t border-gray-800">
                          <td className="p-3 text-gray-400">
                            {new Date(order.created_at).toLocaleDateString('en-AU')}
                          </td>
                          <td className="p-3">
                            <p className="font-medium">{order.customer_name}</p>
                            <p className="text-xs text-gray-500">{order.customer_email}</p>
                          </td>
                          <td className="p-3 text-gray-400">{order.packages?.name}</td>
                          <td className="p-3 text-right">${order.amount}</td>
                          <td className="p-3 text-center">
                            <span className={`px-2 py-1 rounded text-xs ${
                              order.status === 'paid' ? 'bg-green-600' :
                              order.status === 'pending' ? 'bg-yellow-600' : 'bg-gray-600'
                            }`}>
                              {order.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
    </div>
  )
}
