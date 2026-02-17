import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export default function CrewManagement() {
  const [events, setEvents] = useState([])
  const [crewMembers, setCrewMembers] = useState([])
  const [equipment, setEquipment] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Modals
  const [showEventModal, setShowEventModal] = useState(false)
  const [showCrewModal, setShowCrewModal] = useState(false)
  const [showEquipmentModal, setShowEquipmentModal] = useState(false)
  const [showEventDetail, setShowEventDetail] = useState(null)
  
  // Form data
  const [editingEvent, setEditingEvent] = useState(null)
  const [eventForm, setEventForm] = useState({
    name: '', client: '', date: '', location: '', status: 'tentative', notes: '',
    crew_ids: [], equipment_ids: [],
    flight_links: '', accommodation_links: '', rental_links: ''
  })
  const [crewForm, setCrewForm] = useState({ name: '', role: '', phone: '', email: '' })
  const [equipmentForm, setEquipmentForm] = useState({ name: '', category: 'Camera', quantity: 1 })
  
  // Filter
  const [filter, setFilter] = useState('all')

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
  const upcomingCount = events.filter(e => new Date(e.date) >= now && e.status !== 'cancelled').length
  const thisMonthCount = events.filter(e => {
    const d = new Date(e.date)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).length

  // Filtered events
  const filteredEvents = events.filter(e => {
    if (filter === 'upcoming') return new Date(e.date) >= now && e.status !== 'completed'
    if (filter === 'completed') return e.status === 'completed'
    return true
  })

  // Event CRUD
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

  // Crew CRUD
  async function saveCrew(e) {
    e.preventDefault()
    await supabase.from('crew_members').insert([crewForm])
    setShowCrewModal(false)
    setCrewForm({ name: '', role: '', phone: '', email: '' })
    loadData()
  }

  async function deleteCrew(id) {
    if (!confirm('Delete this crew member?')) return
    await supabase.from('crew_members').delete().eq('id', id)
    loadData()
  }

  // Equipment CRUD
  async function saveEquipment(e) {
    e.preventDefault()
    await supabase.from('equipment_inventory').insert([equipmentForm])
    setShowEquipmentModal(false)
    setEquipmentForm({ name: '', category: 'Camera', quantity: 1 })
    loadData()
  }

  async function deleteEquipment(id) {
    if (!confirm('Delete this equipment?')) return
    await supabase.from('equipment_inventory').delete().eq('id', id)
    loadData()
  }

  // Helpers
  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-AU', { 
      weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' 
    })
  }

  function getCrewByIds(ids) {
    return (ids || []).map(id => crewMembers.find(c => c.id === id)).filter(Boolean)
  }

  function getEquipmentByIds(ids) {
    return (ids || []).map(id => equipment.find(e => e.id === id)).filter(Boolean)
  }

  const statusColors = {
    confirmed: 'bg-green-500',
    tentative: 'bg-yellow-500',
    completed: 'bg-gray-500',
    cancelled: 'bg-red-500'
  }

  const categories = ['Camera', 'Lens', 'Audio', 'Lighting', 'Support', 'Monitor/Recorder', 'Power', 'Media', 'Transport', 'Other']

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-400">Loading...</div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Crew & Logistics</h1>
          <p className="text-gray-400 mt-1">Manage teams, equipment, and travel for events</p>
        </div>
        <button 
          onClick={() => { resetEventForm(); setEditingEvent(null); setShowEventModal(true) }}
          className="bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded-lg font-medium flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Event
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="text-2xl font-bold text-orange-500">{upcomingCount}</div>
          <div className="text-gray-400 text-sm">Upcoming Events</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="text-2xl font-bold text-green-500">{crewMembers.length}</div>
          <div className="text-gray-400 text-sm">Crew Members</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="text-2xl font-bold text-blue-500">{equipment.length}</div>
          <div className="text-gray-400 text-sm">Equipment Items</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="text-2xl font-bold text-purple-500">{thisMonthCount}</div>
          <div className="text-gray-400 text-sm">This Month</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Events</h2>
        <div className="flex space-x-2">
          {['all', 'upcoming', 'completed'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded text-sm capitalize ${filter === f ? 'bg-orange-600' : 'bg-gray-700 hover:bg-gray-600'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map(event => (
          <div 
            key={event.id}
            onClick={() => setShowEventDetail(event)}
            className="bg-gray-800 rounded-xl border border-gray-700 p-5 hover:border-orange-500 transition cursor-pointer"
          >
            <div className="flex items-start justify-between mb-3">
              <span className={`${statusColors[event.status]} px-2 py-1 rounded text-xs font-medium capitalize`}>
                {event.status}
              </span>
              <span className="text-gray-400 text-sm">{formatDate(event.date)}</span>
            </div>
            <h3 className="font-bold text-lg text-white mb-1">{event.name}</h3>
            <p className="text-orange-500 text-sm mb-3">{event.client}</p>
            {event.location && (
              <p className="text-gray-400 text-sm mb-3">
                <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {event.location}
              </p>
            )}
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>👥 {(event.crew_ids || []).length} crew</span>
              <span>📷 {(event.equipment_ids || []).length} items</span>
              {((event.flight_links?.length || 0) + (event.accommodation_links?.length || 0) + (event.rental_links?.length || 0)) > 0 && (
                <span className="text-purple-400">✈️ Travel</span>
              )}
            </div>
          </div>
        ))}
        {filteredEvents.length === 0 && (
          <div className="col-span-3 text-center py-12 text-gray-500">
            <p>No events found. Click "New Event" to create one.</p>
          </div>
        )}
      </div>

      {/* Crew & Equipment Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Crew Members */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">👥 Crew Members</h3>
            <button onClick={() => setShowCrewModal(true)} className="text-orange-500 hover:text-orange-400 text-sm">
              + Add
            </button>
          </div>
          <div className="space-y-3">
            {crewMembers.map(crew => (
              <div key={crew.id} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                <div>
                  <div className="font-medium text-white">{crew.name}</div>
                  <div className="text-sm text-gray-400">{crew.role || 'No role'}</div>
                </div>
                <div className="flex items-center space-x-2">
                  {crew.phone && <a href={`tel:${crew.phone}`} className="text-gray-400 hover:text-white">📞</a>}
                  {crew.email && <a href={`mailto:${crew.email}`} className="text-gray-400 hover:text-white">✉️</a>}
                  <button onClick={() => deleteCrew(crew.id)} className="text-red-500 hover:text-red-400 ml-2">🗑️</button>
                </div>
              </div>
            ))}
            {crewMembers.length === 0 && <p className="text-gray-500 text-center py-4">No crew members yet.</p>}
          </div>
        </div>

        {/* Equipment */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">📷 Equipment</h3>
            <button onClick={() => setShowEquipmentModal(true)} className="text-blue-500 hover:text-blue-400 text-sm">
              + Add
            </button>
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {categories.filter(cat => equipment.some(e => e.category === cat)).map(cat => (
              <div key={cat} className="mb-3">
                <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">{cat}</div>
                {equipment.filter(e => e.category === cat).map(eq => (
                  <div key={eq.id} className="flex items-center justify-between p-2 bg-gray-700/30 rounded mb-1">
                    <span className="text-white">{eq.name}</span>
                    <div className="flex items-center space-x-3">
                      <span className="text-sm text-gray-400">×{eq.quantity}</span>
                      <button onClick={() => deleteEquipment(eq.id)} className="text-red-500 hover:text-red-400 text-xs">🗑️</button>
                    </div>
                  </div>
                ))}
              </div>
            ))}
            {equipment.length === 0 && <p className="text-gray-500 text-center py-4">No equipment yet.</p>}
          </div>
        </div>
      </div>

      {/* Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-700 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">{editingEvent ? 'Edit Event' : 'New Event'}</h3>
              <button onClick={() => setShowEventModal(false)} className="text-gray-400 hover:text-white text-xl">✕</button>
            </div>
            <form onSubmit={saveEvent} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Event Name *</label>
                  <input type="text" required value={eventForm.name} onChange={e => setEventForm({...eventForm, name: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Client *</label>
                  <input type="text" required value={eventForm.client} onChange={e => setEventForm({...eventForm, client: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Date *</label>
                  <input type="date" required value={eventForm.date} onChange={e => setEventForm({...eventForm, date: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Status</label>
                  <select value={eventForm.status} onChange={e => setEventForm({...eventForm, status: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white">
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
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white" />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Notes</label>
                <textarea rows="2" value={eventForm.notes} onChange={e => setEventForm({...eventForm, notes: e.target.value})}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white" />
              </div>

              {/* Crew Assignment */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Assigned Crew</label>
                <div className="grid grid-cols-2 gap-2">
                  {crewMembers.map(crew => (
                    <label key={crew.id} className="flex items-center space-x-2 p-2 bg-gray-700/50 rounded cursor-pointer hover:bg-gray-700">
                      <input type="checkbox" checked={eventForm.crew_ids.includes(crew.id)}
                        onChange={e => {
                          const ids = e.target.checked 
                            ? [...eventForm.crew_ids, crew.id]
                            : eventForm.crew_ids.filter(id => id !== crew.id)
                          setEventForm({...eventForm, crew_ids: ids})
                        }}
                        className="rounded" />
                      <span className="text-white">{crew.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Equipment Assignment */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Required Equipment</label>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                  {equipment.map(eq => (
                    <label key={eq.id} className="flex items-center space-x-2 p-2 bg-gray-700/50 rounded cursor-pointer hover:bg-gray-700">
                      <input type="checkbox" checked={eventForm.equipment_ids.includes(eq.id)}
                        onChange={e => {
                          const ids = e.target.checked 
                            ? [...eventForm.equipment_ids, eq.id]
                            : eventForm.equipment_ids.filter(id => id !== eq.id)
                          setEventForm({...eventForm, equipment_ids: ids})
                        }}
                        className="rounded" />
                      <span className="text-sm text-white">{eq.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Travel Links */}
              <div className="border-t border-gray-700 pt-4">
                <h4 className="font-medium text-white mb-3">✈️ Travel & Logistics</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Flight Links (comma separated)</label>
                    <input type="text" value={eventForm.flight_links} onChange={e => setEventForm({...eventForm, flight_links: e.target.value})}
                      placeholder="https://..." className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Accommodation Links</label>
                    <input type="text" value={eventForm.accommodation_links} onChange={e => setEventForm({...eventForm, accommodation_links: e.target.value})}
                      placeholder="https://..." className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Rental Car Links</label>
                    <input type="text" value={eventForm.rental_links} onChange={e => setEventForm({...eventForm, rental_links: e.target.value})}
                      placeholder="https://..." className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white text-sm" />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={() => setShowEventModal(false)} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg font-medium text-white">Save Event</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Event Detail Modal */}
      {showEventDetail && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-700 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">{showEventDetail.name}</h3>
              <div className="flex items-center space-x-3">
                <button onClick={() => { openEditEvent(showEventDetail); setShowEventDetail(null) }} className="text-orange-500 hover:text-orange-400">Edit</button>
                <button onClick={() => setShowEventDetail(null)} className="text-gray-400 hover:text-white text-xl">✕</button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-400 text-sm">Client</span>
                  <p className="font-medium text-orange-500">{showEventDetail.client}</p>
                </div>
                <div>
                  <span className="text-gray-400 text-sm">Date</span>
                  <p className="font-medium text-white">{formatDate(showEventDetail.date)}</p>
                </div>
                <div>
                  <span className="text-gray-400 text-sm">Location</span>
                  <p className="font-medium text-white">{showEventDetail.location || 'TBD'}</p>
                </div>
                <div>
                  <span className="text-gray-400 text-sm">Status</span>
                  <p><span className={`${statusColors[showEventDetail.status]} px-2 py-1 rounded text-xs font-medium capitalize`}>{showEventDetail.status}</span></p>
                </div>
              </div>

              {showEventDetail.notes && (
                <div>
                  <span className="text-gray-400 text-sm">Notes</span>
                  <p className="mt-1 text-gray-300">{showEventDetail.notes}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-white mb-3">👥 Assigned Crew ({getCrewByIds(showEventDetail.crew_ids).length})</h4>
                  <div className="space-y-2">
                    {getCrewByIds(showEventDetail.crew_ids).map(c => (
                      <div key={c.id} className="p-2 bg-gray-700/50 rounded flex items-center justify-between">
                        <span className="text-white">{c.name}</span>
                        <span className="text-sm text-gray-400">{c.role || ''}</span>
                      </div>
                    ))}
                    {getCrewByIds(showEventDetail.crew_ids).length === 0 && <p className="text-gray-500 text-sm">No crew assigned</p>}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-white mb-3">📷 Equipment ({getEquipmentByIds(showEventDetail.equipment_ids).length})</h4>
                  <div className="space-y-2">
                    {getEquipmentByIds(showEventDetail.equipment_ids).map(e => (
                      <div key={e.id} className="p-2 bg-gray-700/50 rounded flex items-center justify-between">
                        <span className="text-white">{e.name}</span>
                        <span className="text-xs text-gray-400">{e.category}</span>
                      </div>
                    ))}
                    {getEquipmentByIds(showEventDetail.equipment_ids).length === 0 && <p className="text-gray-500 text-sm">No equipment assigned</p>}
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-700 pt-6">
                <h4 className="font-medium text-white mb-4">✈️ Travel & Logistics</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <span className="text-gray-400 text-sm">Flights</span>
                    {showEventDetail.flight_links?.length ? showEventDetail.flight_links.map((f, i) => (
                      <a key={i} href={f} target="_blank" rel="noopener noreferrer" className="block text-blue-400 hover:underline text-sm truncate mt-1">🔗 {f}</a>
                    )) : <p className="text-gray-500 text-sm mt-1">None</p>}
                  </div>
                  <div>
                    <span className="text-gray-400 text-sm">Accommodation</span>
                    {showEventDetail.accommodation_links?.length ? showEventDetail.accommodation_links.map((a, i) => (
                      <a key={i} href={a} target="_blank" rel="noopener noreferrer" className="block text-blue-400 hover:underline text-sm truncate mt-1">🔗 {a}</a>
                    )) : <p className="text-gray-500 text-sm mt-1">None</p>}
                  </div>
                  <div>
                    <span className="text-gray-400 text-sm">Rental Cars</span>
                    {showEventDetail.rental_links?.length ? showEventDetail.rental_links.map((r, i) => (
                      <a key={i} href={r} target="_blank" rel="noopener noreferrer" className="block text-blue-400 hover:underline text-sm truncate mt-1">🔗 {r}</a>
                    )) : <p className="text-gray-500 text-sm mt-1">None</p>}
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-gray-700">
                <button onClick={() => deleteEvent(showEventDetail.id)} className="px-4 py-2 text-red-500 hover:bg-red-500/10 rounded-lg">
                  🗑️ Delete Event
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Crew Modal */}
      {showCrewModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-700 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Add Crew Member</h3>
              <button onClick={() => setShowCrewModal(false)} className="text-gray-400 hover:text-white text-xl">✕</button>
            </div>
            <form onSubmit={saveCrew} className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Name *</label>
                <input type="text" required value={crewForm.name} onChange={e => setCrewForm({...crewForm, name: e.target.value})}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Role</label>
                <input type="text" value={crewForm.role} onChange={e => setCrewForm({...crewForm, role: e.target.value})}
                  placeholder="e.g. Camera Operator" className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Phone</label>
                <input type="tel" value={crewForm.phone} onChange={e => setCrewForm({...crewForm, phone: e.target.value})}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Email</label>
                <input type="email" value={crewForm.email} onChange={e => setCrewForm({...crewForm, email: e.target.value})}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white" />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={() => setShowCrewModal(false)} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg font-medium text-white">Add Crew</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Equipment Modal */}
      {showEquipmentModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-700 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Add Equipment</h3>
              <button onClick={() => setShowEquipmentModal(false)} className="text-gray-400 hover:text-white text-xl">✕</button>
            </div>
            <form onSubmit={saveEquipment} className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Equipment Name *</label>
                <input type="text" required value={equipmentForm.name} onChange={e => setEquipmentForm({...equipmentForm, name: e.target.value})}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Category</label>
                <select value={equipmentForm.category} onChange={e => setEquipmentForm({...equipmentForm, category: e.target.value})}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white">
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Quantity</label>
                <input type="number" min="1" value={equipmentForm.quantity} onChange={e => setEquipmentForm({...equipmentForm, quantity: parseInt(e.target.value) || 1})}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white" />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={() => setShowEquipmentModal(false)} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium text-white">Add Equipment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
