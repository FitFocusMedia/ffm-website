import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import EventBrief from '../../components/portal/EventBrief'

export default function CrewManagement() {
  const [events, setEvents] = useState([])
  const [crewMembers, setCrewMembers] = useState([])
  const [equipment, setEquipment] = useState([])
  const [loading, setLoading] = useState(true)
  
  // View mode: 'grid' | 'list' | 'calendar'
  const [viewMode, setViewMode] = useState('grid')
  const [showBrief, setShowBrief] = useState(null)
  
  // Modals
  const [showEventModal, setShowEventModal] = useState(false)
  const [showCrewModal, setShowCrewModal] = useState(false)
  const [showEquipmentModal, setShowEquipmentModal] = useState(false)
  const [showEventDetail, setShowEventDetail] = useState(null)
  
  // Form data
  const [editingEvent, setEditingEvent] = useState(null)
  const [editingCrew, setEditingCrew] = useState(null)
  const [editingEquipment, setEditingEquipment] = useState(null)
  
  const [eventForm, setEventForm] = useState({
    name: '', client: '', date: '', location: '', status: 'tentative', notes: '',
    crew_ids: [], equipment_ids: [],
    flight_links: '', accommodation_links: '', rental_links: ''
  })
  const [crewForm, setCrewForm] = useState({ name: '', role: '', phone: '', email: '' })
  const [equipmentForm, setEquipmentForm] = useState({ name: '', category: 'Camera', quantity: 1, notes: '' })
  
  // Filter
  const [filter, setFilter] = useState('upcoming')
  
  // Calendar state
  const [calendarMonth, setCalendarMonth] = useState(new Date())

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    
    const [eventsRes, crewRes, equipRes] = await Promise.all([
      supabase.from('production_events').select('*').order('date', { ascending: true }),
      supabase.from('crew_members').select('*').order('name'),
      supabase.from('equipment_inventory').select('*').order('category, name')
    ])
    
    setEvents(eventsRes.data || [])
    setCrewMembers(crewRes.data || [])
    setEquipment(equipRes.data || [])
    setLoading(false)
  }

  // Stats
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const upcomingCount = events.filter(e => new Date(e.date) >= now && e.status !== 'cancelled').length
  const thisMonthCount = events.filter(e => {
    const d = new Date(e.date)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() && e.status !== 'cancelled'
  }).length
  const needsCrewCount = events.filter(e => new Date(e.date) >= now && (!e.crew_ids || e.crew_ids.length === 0)).length

  // Filtered events
  const filteredEvents = events.filter(e => {
    const eventDate = new Date(e.date)
    if (filter === 'upcoming') return eventDate >= now && e.status !== 'completed' && e.status !== 'cancelled'
    if (filter === 'completed') return e.status === 'completed'
    if (filter === 'thisMonth') {
      return eventDate.getMonth() === now.getMonth() && eventDate.getFullYear() === now.getFullYear()
    }
    return true
  })

  // ============ EVENT CRUD ============
  async function saveEvent(e) {
    e.preventDefault()
    
    const data = {
      name: eventForm.name,
      client: eventForm.client,
      date: eventForm.date,
      location: eventForm.location,
      status: eventForm.status,
      notes: eventForm.notes,
      crew_ids: eventForm.crew_ids,
      equipment_ids: eventForm.equipment_ids,
      flight_links: eventForm.flight_links.split(',').map(s => s.trim()).filter(Boolean),
      accommodation_links: eventForm.accommodation_links.split(',').map(s => s.trim()).filter(Boolean),
      rental_links: eventForm.rental_links.split(',').map(s => s.trim()).filter(Boolean)
    }

    if (editingEvent) {
      await supabase.from('production_events').update(data).eq('id', editingEvent.id)
    } else {
      await supabase.from('production_events').insert([data])
    }
    
    setShowEventModal(false)
    setEditingEvent(null)
    resetEventForm()
    loadData()
  }

  async function deleteEvent(id) {
    if (!confirm('Delete this event? This cannot be undone.')) return
    await supabase.from('production_events').delete().eq('id', id)
    setShowEventDetail(null)
    loadData()
  }

  function openEditEvent(event) {
    setEditingEvent(event)
    setEventForm({
      name: event.name,
      client: event.client,
      date: event.date,
      location: event.location || '',
      status: event.status,
      notes: event.notes || '',
      crew_ids: event.crew_ids || [],
      equipment_ids: event.equipment_ids || [],
      flight_links: (event.flight_links || []).join(', '),
      accommodation_links: (event.accommodation_links || []).join(', '),
      rental_links: (event.rental_links || []).join(', ')
    })
    setShowEventModal(true)
  }

  function resetEventForm() {
    setEventForm({
      name: '', client: '', date: '', location: '', status: 'tentative', notes: '',
      crew_ids: [], equipment_ids: [],
      flight_links: '', accommodation_links: '', rental_links: ''
    })
  }

  // ============ CREW CRUD ============
  async function saveCrew(e) {
    e.preventDefault()
    
    if (editingCrew) {
      await supabase.from('crew_members').update(crewForm).eq('id', editingCrew.id)
    } else {
      await supabase.from('crew_members').insert([crewForm])
    }
    
    setShowCrewModal(false)
    setEditingCrew(null)
    setCrewForm({ name: '', role: '', phone: '', email: '' })
    loadData()
  }

  function openEditCrew(crew) {
    setEditingCrew(crew)
    setCrewForm({
      name: crew.name,
      role: crew.role || '',
      phone: crew.phone || '',
      email: crew.email || ''
    })
    setShowCrewModal(true)
  }

  async function deleteCrew(id) {
    if (!confirm('Delete this crew member?')) return
    await supabase.from('crew_members').delete().eq('id', id)
    loadData()
  }

  // ============ EQUIPMENT CRUD ============
  async function saveEquipment(e) {
    e.preventDefault()
    
    if (editingEquipment) {
      await supabase.from('equipment_inventory').update(equipmentForm).eq('id', editingEquipment.id)
    } else {
      await supabase.from('equipment_inventory').insert([equipmentForm])
    }
    
    setShowEquipmentModal(false)
    setEditingEquipment(null)
    setEquipmentForm({ name: '', category: 'Camera', quantity: 1, notes: '' })
    loadData()
  }

  function openEditEquipment(eq) {
    setEditingEquipment(eq)
    setEquipmentForm({
      name: eq.name,
      category: eq.category || 'Camera',
      quantity: eq.quantity || 1,
      notes: eq.notes || ''
    })
    setShowEquipmentModal(true)
  }

  async function deleteEquipment(id) {
    if (!confirm('Delete this equipment?')) return
    await supabase.from('equipment_inventory').delete().eq('id', id)
    loadData()
  }

  // ============ QUICK ASSIGN ============
  async function quickAssignCrew(eventId, crewId, assign) {
    const event = events.find(e => e.id === eventId)
    if (!event) return
    
    const newIds = assign
      ? [...(event.crew_ids || []), crewId]
      : (event.crew_ids || []).filter(id => id !== crewId)
    
    await supabase.from('production_events').update({ crew_ids: newIds }).eq('id', eventId)
    loadData()
    
    // Update detail view if open
    if (showEventDetail?.id === eventId) {
      setShowEventDetail({ ...showEventDetail, crew_ids: newIds })
    }
  }

  async function quickAssignEquipment(eventId, equipId, assign) {
    const event = events.find(e => e.id === eventId)
    if (!event) return
    
    const newIds = assign
      ? [...(event.equipment_ids || []), equipId]
      : (event.equipment_ids || []).filter(id => id !== equipId)
    
    await supabase.from('production_events').update({ equipment_ids: newIds }).eq('id', eventId)
    loadData()
    
    if (showEventDetail?.id === eventId) {
      setShowEventDetail({ ...showEventDetail, equipment_ids: newIds })
    }
  }

  // ============ HELPERS ============
  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-AU', { 
      weekday: 'short', day: 'numeric', month: 'short'
    })
  }

  function formatDateLong(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-AU', { 
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    })
  }

  function getCrewByIds(ids) {
    return (ids || []).map(id => crewMembers.find(c => c.id === id)).filter(Boolean)
  }

  function getEquipmentByIds(ids) {
    return (ids || []).map(id => equipment.find(e => e.id === id)).filter(Boolean)
  }

  function getDaysUntil(dateStr) {
    const days = Math.ceil((new Date(dateStr) - now) / (1000 * 60 * 60 * 24))
    if (days === 0) return 'Today'
    if (days === 1) return 'Tomorrow'
    if (days < 0) return `${Math.abs(days)}d ago`
    return `${days}d`
  }

  const statusColors = {
    confirmed: 'bg-green-500',
    tentative: 'bg-yellow-500',
    completed: 'bg-gray-500',
    cancelled: 'bg-red-500'
  }

  const statusBorderColors = {
    confirmed: 'border-green-500/30',
    tentative: 'border-yellow-500/30',
    completed: 'border-gray-500/30',
    cancelled: 'border-red-500/30'
  }

  const categories = ['Camera', 'Lens', 'Audio', 'Lighting', 'Support', 'Monitor', 'Power', 'Media', 'Transport', 'Other']

  // ============ CALENDAR HELPERS ============
  function getCalendarDays() {
    const year = calendarMonth.getFullYear()
    const month = calendarMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startPadding = firstDay.getDay()
    
    const days = []
    
    // Previous month padding
    for (let i = startPadding - 1; i >= 0; i--) {
      const d = new Date(year, month, -i)
      days.push({ date: d, isCurrentMonth: false })
    }
    
    // Current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push({ date: new Date(year, month, i), isCurrentMonth: true })
    }
    
    // Next month padding
    const remaining = 42 - days.length
    for (let i = 1; i <= remaining; i++) {
      days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false })
    }
    
    return days
  }

  function getEventsForDate(date) {
    const dateStr = date.toISOString().split('T')[0]
    return events.filter(e => e.date === dateStr)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header - Mobile Responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Crew & Logistics</h1>
          <p className="text-gray-400 text-sm mt-1">Manage teams, equipment, and travel for events</p>
        </div>
        <button 
          onClick={() => { resetEventForm(); setEditingEvent(null); setShowEventModal(true) }}
          className="bg-orange-600 hover:bg-orange-700 px-4 py-2.5 rounded-lg font-medium flex items-center justify-center sm:justify-start"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Event
        </button>
      </div>

      {/* Stats - Mobile: 2x2 grid, Desktop: 4 cols */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
          <div className="text-2xl sm:text-3xl font-bold text-orange-500">{upcomingCount}</div>
          <div className="text-gray-400 text-xs sm:text-sm">Upcoming Events</div>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
          <div className="text-2xl sm:text-3xl font-bold text-green-500">{crewMembers.length}</div>
          <div className="text-gray-400 text-xs sm:text-sm">Crew Members</div>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
          <div className="text-2xl sm:text-3xl font-bold text-blue-500">{equipment.length}</div>
          <div className="text-gray-400 text-xs sm:text-sm">Equipment Items</div>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
          <div className={`text-2xl sm:text-3xl font-bold ${needsCrewCount > 0 ? 'text-red-500' : 'text-purple-500'}`}>
            {needsCrewCount > 0 ? needsCrewCount : thisMonthCount}
          </div>
          <div className="text-gray-400 text-xs sm:text-sm">
            {needsCrewCount > 0 ? '⚠️ Need Crew' : 'This Month'}
          </div>
        </div>
      </div>

      {/* Filter & View Toggle - Scrollable on mobile */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center overflow-x-auto pb-2 sm:pb-0 -mx-1 px-1">
          <span className="text-gray-400 text-sm mr-3 whitespace-nowrap">Filter:</span>
          <div className="flex space-x-2">
            {[
              { key: 'upcoming', label: 'Upcoming' },
              { key: 'all', label: 'All' },
              { key: 'thisMonth', label: 'This Month' },
              { key: 'completed', label: 'Completed' }
            ].map(f => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition ${
                  filter === f.key 
                    ? 'bg-orange-600 text-white' 
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
        
        {/* View Toggle */}
        <div className="flex items-center space-x-1 bg-gray-800 rounded-lg p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded ${viewMode === 'grid' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'}`}
            title="Grid View"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded ${viewMode === 'list' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'}`}
            title="List View"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`p-2 rounded ${viewMode === 'calendar' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'}`}
            title="Calendar View"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </button>
        </div>
      </div>

      {/* GRID VIEW */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredEvents.map(event => (
            <div 
              key={event.id}
              onClick={() => setShowEventDetail(event)}
              className={`bg-gray-800/50 rounded-xl border ${statusBorderColors[event.status]} p-4 sm:p-5 hover:border-orange-500/50 transition cursor-pointer`}
            >
              <div className="flex items-start justify-between mb-3">
                <span className={`${statusColors[event.status]} px-2 py-0.5 rounded text-xs font-medium capitalize`}>
                  {event.status}
                </span>
                <div className="text-right">
                  <span className="text-gray-400 text-sm">{formatDate(event.date)}</span>
                  <div className={`text-xs ${new Date(event.date) < now ? 'text-gray-500' : 'text-orange-400'}`}>
                    {getDaysUntil(event.date)}
                  </div>
                </div>
              </div>
              <h3 className="font-bold text-white mb-1 line-clamp-1">{event.name}</h3>
              <p className="text-orange-500 text-sm mb-3">{event.client}</p>
              {event.location && (
                <p className="text-gray-400 text-sm mb-3 flex items-center">
                  <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  <span className="truncate">{event.location}</span>
                </p>
              )}
              <div className="flex items-center flex-wrap gap-2 text-xs">
                <span className={`px-2 py-1 rounded ${(event.crew_ids?.length || 0) > 0 ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-500'}`}>
                  👥 {event.crew_ids?.length || 0} crew
                </span>
                <span className={`px-2 py-1 rounded ${(event.equipment_ids?.length || 0) > 0 ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-700 text-gray-500'}`}>
                  📷 {event.equipment_ids?.length || 0} items
                </span>
                {((event.flight_links?.length || 0) + (event.accommodation_links?.length || 0) + (event.rental_links?.length || 0)) > 0 && (
                  <span className="px-2 py-1 rounded bg-purple-500/20 text-purple-400">✈️ Travel</span>
                )}
              </div>
            </div>
          ))}
          {filteredEvents.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-500">
              <p>No events found.</p>
            </div>
          )}
        </div>
      )}

      {/* LIST VIEW */}
      {viewMode === 'list' && (
        <div className="bg-gray-800/30 rounded-xl border border-gray-700/50 overflow-hidden">
          {/* Mobile-friendly table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead className="bg-gray-800/50">
                <tr className="text-left text-gray-400 text-xs uppercase">
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Event</th>
                  <th className="px-4 py-3 hidden sm:table-cell">Client</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-center">Crew</th>
                  <th className="px-4 py-3 text-center">Gear</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/50">
                {filteredEvents.map(event => (
                  <tr 
                    key={event.id}
                    onClick={() => setShowEventDetail(event)}
                    className="hover:bg-gray-800/50 cursor-pointer transition"
                  >
                    <td className="px-4 py-3">
                      <div className="text-white text-sm">{formatDate(event.date)}</div>
                      <div className={`text-xs ${new Date(event.date) < now ? 'text-gray-500' : 'text-orange-400'}`}>
                        {getDaysUntil(event.date)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-white">{event.name}</div>
                      <div className="text-sm text-gray-400 sm:hidden">{event.client}</div>
                    </td>
                    <td className="px-4 py-3 text-orange-500 text-sm hidden sm:table-cell">{event.client}</td>
                    <td className="px-4 py-3">
                      <span className={`${statusColors[event.status]} px-2 py-0.5 rounded text-xs font-medium capitalize`}>
                        {event.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-sm ${(event.crew_ids?.length || 0) > 0 ? 'text-green-400' : 'text-gray-500'}`}>
                        {event.crew_ids?.length || 0}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-sm ${(event.equipment_ids?.length || 0) > 0 ? 'text-blue-400' : 'text-gray-500'}`}>
                        {event.equipment_ids?.length || 0}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredEvents.length === 0 && (
            <div className="text-center py-12 text-gray-500">No events found.</div>
          )}
        </div>
      )}

      {/* CALENDAR VIEW */}
      {viewMode === 'calendar' && (
        <div className="bg-gray-800/30 rounded-xl border border-gray-700/50 p-4">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-4">
            <button 
              onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1))}
              className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h3 className="text-lg font-bold text-white">
              {calendarMonth.toLocaleDateString('en-AU', { month: 'long', year: 'numeric' })}
            </h3>
            <button 
              onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1))}
              className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-xs text-gray-500 py-2 font-medium">
                {day}
              </div>
            ))}
            {getCalendarDays().map((day, i) => {
              const dayEvents = getEventsForDate(day.date)
              const isToday = day.date.toDateString() === new Date().toDateString()
              return (
                <div 
                  key={i}
                  className={`min-h-[80px] sm:min-h-[100px] p-1 border border-gray-700/30 rounded ${
                    day.isCurrentMonth ? 'bg-gray-800/30' : 'bg-gray-900/30'
                  } ${isToday ? 'ring-2 ring-orange-500' : ''}`}
                >
                  <div className={`text-xs mb-1 ${day.isCurrentMonth ? 'text-gray-400' : 'text-gray-600'} ${isToday ? 'text-orange-500 font-bold' : ''}`}>
                    {day.date.getDate()}
                  </div>
                  <div className="space-y-1">
                    {dayEvents.slice(0, 2).map(event => (
                      <div
                        key={event.id}
                        onClick={(e) => { e.stopPropagation(); setShowEventDetail(event) }}
                        className={`text-xs px-1 py-0.5 rounded truncate cursor-pointer ${statusColors[event.status]} text-white`}
                      >
                        {event.name}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-xs text-gray-500 px-1">+{dayEvents.length - 2} more</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Crew & Equipment Sections - Stack on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Crew Members */}
        <div className="bg-gray-800/30 rounded-xl border border-gray-700/50 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">👥 Crew Members</h3>
            <button 
              onClick={() => { setEditingCrew(null); setCrewForm({ name: '', role: '', phone: '', email: '' }); setShowCrewModal(true) }} 
              className="text-orange-500 hover:text-orange-400 text-sm font-medium"
            >
              + Add
            </button>
          </div>
          <div className="space-y-2">
            {crewMembers.map(crew => (
              <div 
                key={crew.id} 
                className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 cursor-pointer transition"
                onClick={() => openEditCrew(crew)}
              >
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-white">{crew.name}</div>
                  <div className="text-sm text-gray-400 truncate">{crew.role || 'No role assigned'}</div>
                </div>
                <div className="flex items-center space-x-2 ml-2">
                  {crew.phone && (
                    <a href={`tel:${crew.phone}`} onClick={e => e.stopPropagation()} className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded">
                      📞
                    </a>
                  )}
                  {crew.email && (
                    <a href={`mailto:${crew.email}`} onClick={e => e.stopPropagation()} className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded">
                      ✉️
                    </a>
                  )}
                  <button 
                    onClick={e => { e.stopPropagation(); deleteCrew(crew.id) }} 
                    className="p-2 text-red-500/50 hover:text-red-500 hover:bg-red-500/10 rounded"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
            {crewMembers.length === 0 && (
              <p className="text-gray-500 text-center py-8">No crew members yet. Click "+ Add" to add one.</p>
            )}
          </div>
        </div>

        {/* Equipment */}
        <div className="bg-gray-800/30 rounded-xl border border-gray-700/50 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">📷 Equipment</h3>
            <button 
              onClick={() => { setEditingEquipment(null); setEquipmentForm({ name: '', category: 'Camera', quantity: 1, notes: '' }); setShowEquipmentModal(true) }} 
              className="text-blue-500 hover:text-blue-400 text-sm font-medium"
            >
              + Add
            </button>
          </div>
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {categories.filter(cat => equipment.some(e => e.category === cat)).map(cat => (
              <div key={cat}>
                <div className="text-xs text-gray-500 uppercase tracking-wide mb-2 sticky top-0 bg-gray-800/90 py-1">{cat}</div>
                {equipment.filter(e => e.category === cat).map(eq => (
                  <div 
                    key={eq.id} 
                    className="flex items-center justify-between p-2 bg-gray-700/30 rounded mb-1 hover:bg-gray-700/50 cursor-pointer transition"
                    onClick={() => openEditEquipment(eq)}
                  >
                    <span className="text-white text-sm">{eq.name}</span>
                    <div className="flex items-center space-x-3">
                      <span className="text-sm text-gray-400">×{eq.quantity}</span>
                      <button 
                        onClick={e => { e.stopPropagation(); deleteEquipment(eq.id) }} 
                        className="text-red-500/50 hover:text-red-500 text-xs"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ))}
            {equipment.length === 0 && (
              <p className="text-gray-500 text-center py-8">No equipment yet. Click "+ Add" to add some.</p>
            )}
          </div>
        </div>
      </div>

      {/* ============ MODALS ============ */}

      {/* Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black/80 flex items-start sm:items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-gray-800 rounded-xl w-full max-w-2xl my-4">
            <div className="p-4 sm:p-6 border-b border-gray-700 flex items-center justify-between sticky top-0 bg-gray-800 rounded-t-xl">
              <h3 className="text-xl font-bold text-white">{editingEvent ? 'Edit Event' : 'New Event'}</h3>
              <button onClick={() => setShowEventModal(false)} className="text-gray-400 hover:text-white text-2xl leading-none">&times;</button>
            </div>
            <form onSubmit={saveEvent} className="p-4 sm:p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Event Name *</label>
                  <input type="text" required value={eventForm.name} onChange={e => setEventForm({...eventForm, name: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:border-orange-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Client *</label>
                  <input type="text" required value={eventForm.client} onChange={e => setEventForm({...eventForm, client: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:border-orange-500 focus:outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Date *</label>
                  <input type="date" required value={eventForm.date} onChange={e => setEventForm({...eventForm, date: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:border-orange-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Status</label>
                  <select value={eventForm.status} onChange={e => setEventForm({...eventForm, status: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:border-orange-500 focus:outline-none">
                    <option value="tentative">Tentative</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Location</label>
                <input type="text" value={eventForm.location} onChange={e => setEventForm({...eventForm, location: e.target.value})}
                  placeholder="Venue, City" className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:border-orange-500 focus:outline-none" />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Notes</label>
                <textarea rows="2" value={eventForm.notes} onChange={e => setEventForm({...eventForm, notes: e.target.value})}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:border-orange-500 focus:outline-none resize-none" />
              </div>

              {/* Crew Assignment */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Assign Crew</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-32 overflow-y-auto bg-gray-900/50 rounded-lg p-2">
                  {crewMembers.map(crew => (
                    <label key={crew.id} className="flex items-center space-x-2 p-2 bg-gray-700/30 rounded cursor-pointer hover:bg-gray-700/50">
                      <input type="checkbox" checked={eventForm.crew_ids.includes(crew.id)}
                        onChange={e => {
                          const ids = e.target.checked 
                            ? [...eventForm.crew_ids, crew.id]
                            : eventForm.crew_ids.filter(id => id !== crew.id)
                          setEventForm({...eventForm, crew_ids: ids})
                        }}
                        className="rounded border-gray-600 text-orange-500 focus:ring-orange-500" />
                      <span className="text-white text-sm">{crew.name}</span>
                    </label>
                  ))}
                  {crewMembers.length === 0 && <p className="text-gray-500 text-sm col-span-2 text-center py-2">No crew members to assign</p>}
                </div>
              </div>

              {/* Equipment Assignment */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Assign Equipment</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto bg-gray-900/50 rounded-lg p-2">
                  {equipment.map(eq => (
                    <label key={eq.id} className="flex items-center space-x-2 p-2 bg-gray-700/30 rounded cursor-pointer hover:bg-gray-700/50">
                      <input type="checkbox" checked={eventForm.equipment_ids.includes(eq.id)}
                        onChange={e => {
                          const ids = e.target.checked 
                            ? [...eventForm.equipment_ids, eq.id]
                            : eventForm.equipment_ids.filter(id => id !== eq.id)
                          setEventForm({...eventForm, equipment_ids: ids})
                        }}
                        className="rounded border-gray-600 text-blue-500 focus:ring-blue-500" />
                      <span className="text-sm text-white truncate">{eq.name}</span>
                    </label>
                  ))}
                  {equipment.length === 0 && <p className="text-gray-500 text-sm col-span-2 text-center py-2">No equipment to assign</p>}
                </div>
              </div>

              {/* Travel Links */}
              <div className="border-t border-gray-700 pt-4">
                <h4 className="font-medium text-white mb-3">✈️ Travel & Logistics</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Flight Links</label>
                    <input type="text" value={eventForm.flight_links} onChange={e => setEventForm({...eventForm, flight_links: e.target.value})}
                      placeholder="Comma-separated URLs" className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white text-sm focus:border-orange-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Accommodation Links</label>
                    <input type="text" value={eventForm.accommodation_links} onChange={e => setEventForm({...eventForm, accommodation_links: e.target.value})}
                      placeholder="Comma-separated URLs" className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white text-sm focus:border-orange-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Rental Car Links</label>
                    <input type="text" value={eventForm.rental_links} onChange={e => setEventForm({...eventForm, rental_links: e.target.value})}
                      placeholder="Comma-separated URLs" className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white text-sm focus:border-orange-500 focus:outline-none" />
                  </div>
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowEventModal(false)} className="px-4 py-2.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-white">Cancel</button>
                <button type="submit" className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 rounded-lg font-medium text-white">
                  {editingEvent ? 'Save Changes' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Event Detail Modal */}
      {showEventDetail && (
        <div className="fixed inset-0 bg-black/80 flex items-start sm:items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-gray-800 rounded-xl w-full max-w-3xl my-4">
            <div className="p-4 sm:p-6 border-b border-gray-700 flex items-center justify-between sticky top-0 bg-gray-800 rounded-t-xl">
              <div>
                <h3 className="text-xl font-bold text-white">{showEventDetail.name}</h3>
                <p className="text-orange-500 text-sm">{showEventDetail.client}</p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => { setShowBrief(showEventDetail); setShowEventDetail(null) }}
                  className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded text-sm font-medium flex items-center gap-1"
                >
                  📋 Brief
                </button>
                <button 
                  onClick={() => { openEditEvent(showEventDetail); setShowEventDetail(null) }} 
                  className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 rounded text-sm font-medium"
                >
                  Edit
                </button>
                <button onClick={() => setShowEventDetail(null)} className="text-gray-400 hover:text-white text-2xl leading-none">&times;</button>
              </div>
            </div>
            <div className="p-4 sm:p-6 space-y-6">
              {/* Event Info */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <span className="text-gray-500 text-xs uppercase">Date</span>
                  <p className="font-medium text-white">{formatDateLong(showEventDetail.date)}</p>
                  <p className={`text-sm ${new Date(showEventDetail.date) < now ? 'text-gray-500' : 'text-orange-400'}`}>
                    {getDaysUntil(showEventDetail.date)}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500 text-xs uppercase">Location</span>
                  <p className="font-medium text-white">{showEventDetail.location || 'TBD'}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-xs uppercase">Status</span>
                  <p><span className={`${statusColors[showEventDetail.status]} px-2 py-0.5 rounded text-xs font-medium capitalize`}>{showEventDetail.status}</span></p>
                </div>
              </div>

              {showEventDetail.notes && (
                <div>
                  <span className="text-gray-500 text-xs uppercase">Notes</span>
                  <p className="mt-1 text-gray-300 text-sm">{showEventDetail.notes}</p>
                </div>
              )}

              {/* Quick Assign Crew */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-white">👥 Crew ({getCrewByIds(showEventDetail.crew_ids).length})</h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {crewMembers.map(crew => {
                    const isAssigned = (showEventDetail.crew_ids || []).includes(crew.id)
                    return (
                      <div 
                        key={crew.id}
                        onClick={() => quickAssignCrew(showEventDetail.id, crew.id, !isAssigned)}
                        className={`p-3 rounded-lg cursor-pointer transition flex items-center justify-between ${
                          isAssigned 
                            ? 'bg-green-500/20 border border-green-500/50' 
                            : 'bg-gray-700/30 border border-gray-700 hover:border-gray-600'
                        }`}
                      >
                        <div>
                          <span className="text-white">{crew.name}</span>
                          <span className="text-gray-400 text-sm ml-2">{crew.role}</span>
                        </div>
                        {isAssigned ? (
                          <span className="text-green-400 text-sm">✓ Assigned</span>
                        ) : (
                          <span className="text-gray-500 text-sm">+ Add</span>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Quick Assign Equipment */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-white">📷 Equipment ({getEquipmentByIds(showEventDetail.equipment_ids).length})</h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                  {equipment.map(eq => {
                    const isAssigned = (showEventDetail.equipment_ids || []).includes(eq.id)
                    return (
                      <div 
                        key={eq.id}
                        onClick={() => quickAssignEquipment(showEventDetail.id, eq.id, !isAssigned)}
                        className={`p-2 rounded-lg cursor-pointer transition flex items-center justify-between ${
                          isAssigned 
                            ? 'bg-blue-500/20 border border-blue-500/50' 
                            : 'bg-gray-700/30 border border-gray-700 hover:border-gray-600'
                        }`}
                      >
                        <span className="text-white text-sm truncate">{eq.name}</span>
                        {isAssigned ? (
                          <span className="text-blue-400 text-xs ml-2">✓</span>
                        ) : (
                          <span className="text-gray-500 text-xs ml-2">+</span>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Travel */}
              <div className="border-t border-gray-700 pt-4">
                <h4 className="font-medium text-white mb-4">✈️ Travel & Logistics</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <span className="text-gray-500 text-xs uppercase">Flights</span>
                    {showEventDetail.flight_links?.length ? showEventDetail.flight_links.map((f, i) => (
                      <a key={i} href={f} target="_blank" rel="noopener noreferrer" className="block text-blue-400 hover:underline text-sm truncate mt-1">🔗 Flight {i + 1}</a>
                    )) : <p className="text-gray-600 text-sm mt-1">None added</p>}
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs uppercase">Accommodation</span>
                    {showEventDetail.accommodation_links?.length ? showEventDetail.accommodation_links.map((a, i) => (
                      <a key={i} href={a} target="_blank" rel="noopener noreferrer" className="block text-blue-400 hover:underline text-sm truncate mt-1">🔗 Booking {i + 1}</a>
                    )) : <p className="text-gray-600 text-sm mt-1">None added</p>}
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs uppercase">Rental Cars</span>
                    {showEventDetail.rental_links?.length ? showEventDetail.rental_links.map((r, i) => (
                      <a key={i} href={r} target="_blank" rel="noopener noreferrer" className="block text-blue-400 hover:underline text-sm truncate mt-1">🔗 Rental {i + 1}</a>
                    )) : <p className="text-gray-600 text-sm mt-1">None added</p>}
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-gray-700">
                <button onClick={() => deleteEvent(showEventDetail.id)} className="px-4 py-2 text-red-500 hover:bg-red-500/10 rounded-lg text-sm">
                  🗑️ Delete Event
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Crew Modal */}
      {showCrewModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl w-full max-w-md">
            <div className="p-4 sm:p-6 border-b border-gray-700 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">{editingCrew ? 'Edit Crew Member' : 'Add Crew Member'}</h3>
              <button onClick={() => setShowCrewModal(false)} className="text-gray-400 hover:text-white text-2xl leading-none">&times;</button>
            </div>
            <form onSubmit={saveCrew} className="p-4 sm:p-6 space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Name *</label>
                <input type="text" required value={crewForm.name} onChange={e => setCrewForm({...crewForm, name: e.target.value})}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:border-orange-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Role</label>
                <input type="text" value={crewForm.role} onChange={e => setCrewForm({...crewForm, role: e.target.value})}
                  placeholder="e.g. Camera Operator, Director, Audio" className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:border-orange-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Phone</label>
                <input type="tel" value={crewForm.phone} onChange={e => setCrewForm({...crewForm, phone: e.target.value})}
                  placeholder="0400 000 000" className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:border-orange-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Email</label>
                <input type="email" value={crewForm.email} onChange={e => setCrewForm({...crewForm, email: e.target.value})}
                  placeholder="name@email.com" className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:border-orange-500 focus:outline-none" />
              </div>
              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowCrewModal(false)} className="px-4 py-2.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-white">Cancel</button>
                <button type="submit" className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 rounded-lg font-medium text-white">
                  {editingCrew ? 'Save Changes' : 'Add Crew'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Production Brief */}
      {showBrief && (
        <EventBrief
          event={showBrief}
          crew={crewMembers}
          equipment={equipment}
          onClose={() => setShowBrief(null)}
        />
      )}

      {/* Equipment Modal */}
      {showEquipmentModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl w-full max-w-md">
            <div className="p-4 sm:p-6 border-b border-gray-700 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">{editingEquipment ? 'Edit Equipment' : 'Add Equipment'}</h3>
              <button onClick={() => setShowEquipmentModal(false)} className="text-gray-400 hover:text-white text-2xl leading-none">&times;</button>
            </div>
            <form onSubmit={saveEquipment} className="p-4 sm:p-6 space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Equipment Name *</label>
                <input type="text" required value={equipmentForm.name} onChange={e => setEquipmentForm({...equipmentForm, name: e.target.value})}
                  placeholder="e.g. Sony FX6" className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:border-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Category</label>
                <select value={equipmentForm.category} onChange={e => setEquipmentForm({...equipmentForm, category: e.target.value})}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:border-blue-500 focus:outline-none">
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Quantity</label>
                <input type="number" min="1" value={equipmentForm.quantity} onChange={e => setEquipmentForm({...equipmentForm, quantity: parseInt(e.target.value) || 1})}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:border-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Notes</label>
                <input type="text" value={equipmentForm.notes || ''} onChange={e => setEquipmentForm({...equipmentForm, notes: e.target.value})}
                  placeholder="Serial number, condition, etc." className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:border-blue-500 focus:outline-none" />
              </div>
              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowEquipmentModal(false)} className="px-4 py-2.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-white">Cancel</button>
                <button type="submit" className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium text-white">
                  {editingEquipment ? 'Save Changes' : 'Add Equipment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
