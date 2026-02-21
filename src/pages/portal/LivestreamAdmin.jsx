import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Eye, DollarSign, Users, Calendar, ToggleLeft, ToggleRight, Download } from 'lucide-react'
import { 
  getAllLivestreamEvents, 
  createLivestreamEvent, 
  updateLivestreamEvent, 
  deleteLivestreamEvent,
  getLivestreamOrders,
  getLivestreamSettings,
  updateLivestreamSettings,
  getOnboardingSessions,
  getContracts
} from '../../lib/supabase'
import GeoBlockingMap from '../../components/GeoBlockingMap'

export default function LivestreamAdmin() {
  const [events, setEvents] = useState([])
  const [orders, setOrders] = useState([])
  const [settings, setSettings] = useState({ demo_mode: false })
  const [loading, setLoading] = useState(true)
  const [showEventModal, setShowEventModal] = useState(false)
  const [editingEvent, setEditingEvent] = useState(null)
  const [activeTab, setActiveTab] = useState('events')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [eventsData, ordersData, settingsData] = await Promise.all([
        getAllLivestreamEvents(),
        getLivestreamOrders(),
        getLivestreamSettings()
      ])
      setEvents(eventsData || [])
      setOrders(ordersData || [])
      setSettings(settingsData || { demo_mode: false })
    } catch (err) {
      console.error('Failed to load data:', err)
    } finally {
      setLoading(false)
    }
  }

  const toggleDemoMode = async () => {
    try {
      const newSettings = await updateLivestreamSettings({ demo_mode: !settings.demo_mode })
      setSettings(newSettings)
    } catch (err) {
      console.error('Failed to toggle demo mode:', err)
    }
  }

  const handleDeleteEvent = async (id) => {
    if (!confirm('Delete this event? This cannot be undone.')) return
    try {
      await deleteLivestreamEvent(id)
      setEvents(events.filter(e => e.id !== id))
    } catch (err) {
      alert('Failed to delete event')
    }
  }

  // Stats
  const totalRevenue = orders.filter(o => o.status === 'completed').reduce((sum, o) => sum + Number(o.amount), 0)
  const totalOrders = orders.filter(o => o.status === 'completed').length
  const liveEvents = events.filter(e => e.status === 'live' || e.is_live).length

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Livestream Events</h1>
          <p className="text-gray-400">Manage PPV events and view orders</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleDemoMode}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              settings.demo_mode 
                ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30' 
                : 'bg-dark-800 text-gray-400 border border-dark-700'
            }`}
          >
            {settings.demo_mode ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
            Demo Mode {settings.demo_mode ? 'ON' : 'OFF'}
          </button>
          <button
            onClick={() => { setEditingEvent(null); setShowEventModal(true) }}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
          >
            <Plus className="w-5 h-5" />
            New Event
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-dark-900 rounded-xl p-5 border border-dark-800">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-500/10 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">${totalRevenue.toFixed(2)}</p>
              <p className="text-sm text-gray-400">Total Revenue</p>
            </div>
          </div>
        </div>
        <div className="bg-dark-900 rounded-xl p-5 border border-dark-800">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <Users className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{totalOrders}</p>
              <p className="text-sm text-gray-400">Total Orders</p>
            </div>
          </div>
        </div>
        <div className="bg-dark-900 rounded-xl p-5 border border-dark-800">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-500/10 rounded-lg">
              <Calendar className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{events.length}</p>
              <p className="text-sm text-gray-400">Total Events ({liveEvents} live)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-dark-800">
        <div className="flex gap-6">
          <button
            onClick={() => setActiveTab('events')}
            className={`pb-3 px-1 font-medium transition-colors ${
              activeTab === 'events' 
                ? 'text-red-500 border-b-2 border-red-500' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Events ({events.length})
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-3 px-1 font-medium transition-colors ${
              activeTab === 'orders' 
                ? 'text-red-500 border-b-2 border-red-500' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Orders ({orders.length})
          </button>
        </div>
      </div>

      {/* Events Tab */}
      {activeTab === 'events' && (
        <div className="space-y-4">
          {events.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              No events yet. Create your first event!
            </div>
          ) : (
            events.map(event => (
              <div key={event.id} className="bg-dark-900 rounded-xl p-5 border border-dark-800">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-white">{event.title}</h3>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                        event.status === 'live' ? 'bg-red-500 text-white' :
                        event.status === 'published' ? 'bg-green-500/20 text-green-500' :
                        event.status === 'ended' ? 'bg-gray-500/20 text-gray-400' :
                        'bg-yellow-500/20 text-yellow-500'
                      }`}>
                        {event.status || 'draft'}
                      </span>
                    </div>
                    <p className="text-gray-400 mb-2">{event.organization}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <span>{new Date(event.start_time).toLocaleDateString('en-AU')}</span>
                      <span>{event.venue}</span>
                      <span className="font-medium text-green-500">${event.price} AUD</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={`/live/${event.id}`}
                      target="_blank"
                      className="p-2 text-gray-400 hover:text-white hover:bg-dark-800 rounded-lg transition-colors"
                      title="View"
                    >
                      <Eye className="w-5 h-5" />
                    </a>
                    <button
                      onClick={() => { setEditingEvent(event); setShowEventModal(true) }}
                      className="p-2 text-gray-400 hover:text-white hover:bg-dark-800 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteEvent(event.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-dark-800 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div className="bg-dark-900 rounded-xl border border-dark-800 overflow-hidden">
          {orders.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              No orders yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-dark-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Order</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Email</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Event</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Amount</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-800">
                  {orders.map(order => (
                    <tr key={order.id} className="hover:bg-dark-800/50">
                      <td className="px-4 py-3">
                        <code className="text-xs text-gray-400">{order.id.slice(0, 8)}</code>
                      </td>
                      <td className="px-4 py-3 text-white">{order.email}</td>
                      <td className="px-4 py-3 text-gray-400">{order.event?.title || 'Unknown'}</td>
                      <td className="px-4 py-3 text-green-500 font-medium">${order.amount}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                          order.status === 'completed' ? 'bg-green-500/20 text-green-500' :
                          order.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                          'bg-red-500/20 text-red-500'
                        }`}>
                          {order.payment_method === 'demo' ? '🧪 Demo' : order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-sm">
                        {new Date(order.created_at).toLocaleString('en-AU')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Event Modal */}
      {showEventModal && (
        <EventModal
          event={editingEvent}
          onClose={() => { setShowEventModal(false); setEditingEvent(null) }}
          onSave={async (data) => {
            try {
              if (editingEvent) {
                await updateLivestreamEvent(editingEvent.id, data)
              } else {
                await createLivestreamEvent(data)
              }
              await loadData()
              setShowEventModal(false)
              setEditingEvent(null)
            } catch (err) {
              alert('Failed to save event')
            }
          }}
        />
      )}
    </div>
  )
}

function EventModal({ event, onClose, onSave }) {
  const [formData, setFormData] = useState({
    title: event?.title || '',
    organization: event?.organization || '',
    venue: event?.venue || '',
    start_time: event?.start_time?.slice(0, 16) || '',
    end_time: event?.end_time?.slice(0, 16) || '',
    price: event?.price || 29.99,
    description: event?.description || '',
    thumbnail_url: event?.thumbnail_url || '',
    ticket_url: event?.ticket_url || '',
    status: event?.status || 'draft',
    mux_playback_id: event?.mux_playback_id || '',
    geo_blocking_enabled: event?.geo_blocking_enabled || false,
    geo_lat: event?.geo_lat || null,
    geo_lng: event?.geo_lng || null,
    geo_radius_km: event?.geo_radius_km || 50,
    geo_venue_address: event?.geo_venue_address || ''
  })
  const [saving, setSaving] = useState(false)
  const [existingEvents, setExistingEvents] = useState([])
  const [loadingEvents, setLoadingEvents] = useState(true)

  // Load existing events from onboarding and contracts
  useEffect(() => {
    const loadExistingEvents = async () => {
      try {
        const [onboardingSessions, contracts] = await Promise.all([
          getOnboardingSessions(),
          getContracts()
        ])
        
        const events = []
        
        // Add onboarding sessions
        if (onboardingSessions) {
          onboardingSessions.forEach(session => {
            if (session.event_name) {
              events.push({
                id: `onboarding-${session.id}`,
                source: 'Onboarding',
                title: session.event_name,
                organization: session.org_name,
                venue: session.event_location || '',
                date: session.event_date,
                contact: session.contact_name
              })
            }
          })
        }
        
        // Add contracts
        if (contracts) {
          contracts.forEach(contract => {
            const data = contract.contract_data || {}
            if (data.event_name) {
              events.push({
                id: `contract-${contract.id}`,
                source: 'Contract',
                title: data.event_name,
                organization: contract.org_name,
                venue: data.event_location || '',
                date: data.event_date,
                contact: contract.promoter_name
              })
            }
          })
        }
        
        setExistingEvents(events)
      } catch (err) {
        console.error('Failed to load existing events:', err)
      } finally {
        setLoadingEvents(false)
      }
    }
    
    if (!event) {
      loadExistingEvents()
    } else {
      setLoadingEvents(false)
    }
  }, [event])

  const handleImportEvent = (selectedId) => {
    if (!selectedId) return
    
    const selected = existingEvents.find(e => e.id === selectedId)
    if (!selected) return
    
    // Format date for datetime-local input
    let startTime = ''
    let endTime = ''
    if (selected.date) {
      const date = new Date(selected.date)
      if (!isNaN(date.getTime())) {
        // Set default start time to 6pm
        date.setHours(18, 0, 0)
        startTime = date.toISOString().slice(0, 16)
        // Set end time to 4 hours later
        date.setHours(22, 0, 0)
        endTime = date.toISOString().slice(0, 16)
      }
    }
    
    setFormData(prev => ({
      ...prev,
      title: selected.title || prev.title,
      organization: selected.organization || prev.organization,
      venue: selected.venue || prev.venue,
      start_time: startTime || prev.start_time,
      end_time: endTime || prev.end_time
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    await onSave(formData)
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-dark-900 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-dark-800">
          <h2 className="text-xl font-bold text-white">
            {event ? 'Edit Event' : 'Create Event'}
          </h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Import from existing event */}
          {!event && existingEvents.length > 0 && (
            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <label className="block text-sm font-medium text-blue-400 mb-2 flex items-center gap-2">
                <Download className="w-4 h-4" />
                Import from existing event
              </label>
              <select
                onChange={(e) => handleImportEvent(e.target.value)}
                className="w-full px-3 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white"
                defaultValue=""
              >
                <option value="">— Select to auto-fill —</option>
                {existingEvents.map(ev => (
                  <option key={ev.id} value={ev.id}>
                    [{ev.source}] {ev.title} — {ev.organization}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Organization *</label>
              <input
                type="text"
                value={formData.organization}
                onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                className="w-full px-3 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Venue *</label>
            <input
              type="text"
              value={formData.venue}
              onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
              className="w-full px-3 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white"
              required
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Start Time *</label>
              <input
                type="datetime-local"
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                className="w-full px-3 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">End Time *</label>
              <input
                type="datetime-local"
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                className="w-full px-3 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white"
                required
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Price (AUD) *</label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="live">Live</option>
                <option value="ended">Ended</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">MUX Playback ID</label>
            <input
              type="text"
              value={formData.mux_playback_id}
              onChange={(e) => setFormData({ ...formData, mux_playback_id: e.target.value })}
              className="w-full px-3 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white"
              placeholder="Leave empty for demo"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white"
              rows={3}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Thumbnail URL</label>
              <input
                type="url"
                value={formData.thumbnail_url}
                onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                className="w-full px-3 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Ticket URL</label>
              <input
                type="url"
                value={formData.ticket_url}
                onChange={(e) => setFormData({ ...formData, ticket_url: e.target.value })}
                className="w-full px-3 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white"
              />
            </div>
          </div>

          {/* Geo-Blocking Section */}
          <div className="pt-6 border-t border-dark-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white">Geo-Blocking</h3>
                <p className="text-sm text-gray-500">Block online streaming near the venue</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.geo_blocking_enabled}
                  onChange={(e) => setFormData({ ...formData, geo_blocking_enabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-dark-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-red-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
                <span className="ml-3 text-sm font-medium text-gray-400">
                  {formData.geo_blocking_enabled ? 'Enabled' : 'Disabled'}
                </span>
              </label>
            </div>

            {formData.geo_blocking_enabled && (
              <GeoBlockingMap
                latitude={formData.geo_lat}
                longitude={formData.geo_lng}
                radius={formData.geo_radius_km}
                address={formData.geo_venue_address || formData.venue}
                onLocationChange={({ latitude, longitude, address }) => {
                  setFormData({
                    ...formData,
                    geo_lat: latitude,
                    geo_lng: longitude,
                    geo_venue_address: address || formData.venue
                  })
                }}
                onRadiusChange={(radius) => {
                  setFormData({ ...formData, geo_radius_km: radius })
                }}
              />
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-dark-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-red-500 hover:bg-red-600 disabled:bg-dark-700 text-white font-medium rounded-lg transition-colors"
            >
              {saving ? 'Saving...' : (event ? 'Update Event' : 'Create Event')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
