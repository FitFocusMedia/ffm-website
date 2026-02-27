import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Eye, DollarSign, Users, Calendar, ToggleLeft, ToggleRight, Download, Radio, Copy, ExternalLink, BarChart3, MapPin, TrendingUp, Shield, RefreshCw, Film, Tag, Archive, Play, StopCircle, Tv, Layers, DoorOpen, DoorClosed } from 'lucide-react'
import { 
  getAllLivestreamEvents, 
  createLivestreamEvent, 
  updateLivestreamEvent, 
  deleteLivestreamEvent,
  getLivestreamOrders,
  getLivestreamSettings,
  updateLivestreamSettings,
  getContentManagementEvents,
  getEventStreams,
  createEventStream,
  updateEventStream,
  deleteEventStream,
  updateEventMultiStreamFlag,
  supabase
} from '../../lib/supabase'
import GeoBlockingMap from '../../components/GeoBlockingMap'
import StreamStatusBadge from '../../components/StreamStatusBadge'

export default function LivestreamAdmin() {
  const [events, setEvents] = useState([])
  const [orders, setOrders] = useState([])
  const [settings, setSettings] = useState({ demo_mode: false })
  const [loading, setLoading] = useState(true)
  const [showEventModal, setShowEventModal] = useState(false)
  const [editingEvent, setEditingEvent] = useState(null)
  const [activeTab, setActiveTab] = useState('events')
  const [analytics, setAnalytics] = useState({ funnel: [], blockedLocations: [], recentEvents: [] })
  const [selectedEventForAnalytics, setSelectedEventForAnalytics] = useState('all')
  const [recordings, setRecordings] = useState([])
  const [loadingRecordings, setLoadingRecordings] = useState(false)
  const [eventFilter, setEventFilter] = useState('all') // all, upcoming, live, ended

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
      
      // Load analytics data
      await loadAnalytics()
    } catch (err) {
      console.error('Failed to load data:', err)
    } finally {
      setLoading(false)
    }
  }
  
  const loadAnalytics = async (eventId = null) => {
    try {
      // Get funnel summary
      let funnelQuery = supabase.from('livestream_funnel_summary').select('*')
      if (eventId && eventId !== 'all') {
        funnelQuery = funnelQuery.eq('event_id', eventId)
      }
      const { data: funnelData } = await funnelQuery
      
      // Get blocked locations
      let blockedQuery = supabase.from('livestream_blocked_locations').select('*').limit(50)
      if (eventId && eventId !== 'all') {
        blockedQuery = blockedQuery.eq('event_id', eventId)
      }
      const { data: blockedData } = await blockedQuery
      
      // Get recent events
      let recentQuery = supabase
        .from('livestream_analytics')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100)
      if (eventId && eventId !== 'all') {
        recentQuery = recentQuery.eq('event_id', eventId)
      }
      const { data: recentData } = await recentQuery
      
      setAnalytics({
        funnel: funnelData || [],
        blockedLocations: blockedData || [],
        recentEvents: recentData || []
      })
    } catch (err) {
      console.error('Failed to load analytics:', err)
    }
  }

  const loadRecordings = async () => {
    setLoadingRecordings(true)
    try {
      const { data, error } = await supabase.functions.invoke('mux-assets', {
        body: { action: 'list' }
      })
      if (error) throw error
      setRecordings(data?.assets || [])
    } catch (err) {
      console.error('Failed to load recordings:', err)
    } finally {
      setLoadingRecordings(false)
    }
  }

  const endStream = async (eventId) => {
    if (!confirm('End this stream? This will finalize the recording.')) return
    try {
      // Update event status
      await updateLivestreamEvent(eventId, { 
        status: 'ended', 
        is_live: false,
        ended_at: new Date().toISOString()
      })
      // Optionally disable MUX stream
      const event = events.find(e => e.id === eventId)
      if (event?.mux_stream_id) {
        await supabase.functions.invoke('mux-stream', {
          body: { action: 'disable', stream_id: event.mux_stream_id }
        })
      }
      loadData()
    } catch (err) {
      console.error('Failed to end stream:', err)
      alert('Failed to end stream')
    }
  }

  const toggleDemoMode = async () => {
    try {
      const newMode = !settings.demo_mode
      const data = await updateLivestreamSettings({ demo_mode: newMode })
      if (data) {
        setSettings(data)
      }
    } catch (err) {
      console.error('Failed to toggle demo mode:', err)
      alert('Failed to toggle demo mode: ' + err.message)
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
          <button
            onClick={() => { setActiveTab('analytics'); loadAnalytics(selectedEventForAnalytics); }}
            className={`pb-3 px-1 font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'analytics' 
                ? 'text-red-500 border-b-2 border-red-500' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <BarChart3 size={16} /> Analytics
          </button>
          <button
            onClick={() => { setActiveTab('recordings'); loadRecordings(); }}
            className={`pb-3 px-1 font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'recordings' 
                ? 'text-red-500 border-b-2 border-red-500' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Film size={16} /> Recordings
          </button>
        </div>
      </div>

      {/* Event Filter */}
      {activeTab === 'events' && (
        <div className="flex gap-2">
          {['all', 'upcoming', 'live', 'ended'].map(filter => (
            <button
              key={filter}
              onClick={() => setEventFilter(filter)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                eventFilter === filter
                  ? 'bg-red-500 text-white'
                  : 'bg-dark-800 text-gray-400 hover:text-white'
              }`}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>
      )}

      {/* Events Tab */}
      {activeTab === 'events' && (
        <div className="space-y-4">
          {events.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              No events yet. Create your first event!
            </div>
          ) : (
            events
              .filter(event => {
                if (eventFilter === 'all') return true
                if (eventFilter === 'live') return event.is_live || event.status === 'live'
                if (eventFilter === 'ended') return event.status === 'ended'
                if (eventFilter === 'upcoming') return !event.is_live && event.status !== 'ended' && new Date(event.start_time) > new Date()
                return true
              })
              .map(event => (
              <div key={event.id} className="bg-dark-900 rounded-xl p-5 border border-dark-800">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="text-lg font-bold text-white">{event.title}</h3>
                      <StreamStatusBadge event={event} compact />
                      <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                        event.status === 'live' ? 'bg-red-500 text-white' :
                        event.status === 'published' ? 'bg-green-500/20 text-green-500' :
                        event.status === 'ended' ? 'bg-gray-500/20 text-gray-400' :
                        'bg-yellow-500/20 text-yellow-500'
                      }`}>
                        {event.status || 'draft'}
                      </span>
                      {event.category && (
                        <span className="px-2 py-0.5 text-xs font-medium rounded bg-purple-500/20 text-purple-400 flex items-center gap-1">
                          <Tag className="w-3 h-3" />
                          {event.category}
                        </span>
                      )}
                      {event.vod_enabled && (
                        <span className="px-2 py-0.5 text-xs font-medium rounded bg-blue-500/20 text-blue-400">
                          VOD
                        </span>
                      )}
                    </div>
                    <p className="text-gray-400 mb-2">{event.org_display_name || event.organization}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <span>{new Date(event.start_time).toLocaleDateString('en-AU')}</span>
                      <span>{event.venue}</span>
                      <span className="font-medium text-green-500">${event.price} AUD</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {/* Open/Close Doors */}
                    {event.status !== 'ended' && (
                      <button
                        onClick={async () => {
                          const newDoorsOpen = !event.doors_open
                          await updateLivestreamEvent(event.id, { 
                            doors_open: newDoorsOpen
                          })
                          loadData()
                        }}
                        className={`p-2 rounded-lg transition-colors ${
                          event.doors_open 
                            ? 'text-green-500 bg-green-500/20 hover:bg-green-500/30' 
                            : 'text-gray-400 hover:text-green-500 hover:bg-dark-800'
                        }`}
                        title={event.doors_open ? 'Close Doors (block viewers)' : 'Open Doors (allow viewers)'}
                      >
                        {event.doors_open ? <DoorOpen className="w-5 h-5" /> : <DoorClosed className="w-5 h-5" />}
                      </button>
                    )}
                    {/* Go Live Toggle - legacy, now mainly for status display */}
                    {event.status !== 'ended' ? (
                      <button
                        onClick={async () => {
                          const newStatus = event.is_live ? false : true
                          await updateLivestreamEvent(event.id, { 
                            is_live: newStatus,
                            status: newStatus ? 'live' : 'published'
                          })
                          loadData()
                        }}
                        className={`p-2 rounded-lg transition-colors ${
                          event.is_live 
                            ? 'text-red-500 bg-red-500/20 hover:bg-red-500/30' 
                            : 'text-gray-400 hover:text-red-500 hover:bg-dark-800'
                        }`}
                        title={event.is_live ? 'Stop Live' : 'Go Live'}
                      >
                        <Radio className="w-5 h-5" />
                      </button>
                    ) : (
                      <span className="p-2 text-gray-600" title="Event Ended">
                        <Archive className="w-5 h-5" />
                      </span>
                    )}
                    {/* End Stream (archive) */}
                    {(event.is_live || event.status === 'live' || event.status === 'published') && (
                      <button
                        onClick={() => endStream(event.id)}
                        className="p-2 text-gray-400 hover:text-orange-500 hover:bg-dark-800 rounded-lg transition-colors"
                        title="End & Archive Stream"
                      >
                        <StopCircle className="w-5 h-5" />
                      </button>
                    )}
                    {/* Copy Link */}
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`https://fitfocusmedia.com.au/#/live/${event.id}`)
                        alert('Event link copied!')
                      }}
                      className="p-2 text-gray-400 hover:text-white hover:bg-dark-800 rounded-lg transition-colors"
                      title="Copy Link"
                    >
                      <Copy className="w-5 h-5" />
                    </button>
                    {/* View */}
                    <a
                      href={`#/live/${event.id}`}
                      target="_blank"
                      className="p-2 text-gray-400 hover:text-white hover:bg-dark-800 rounded-lg transition-colors"
                      title="View Event Page"
                    >
                      <Eye className="w-5 h-5" />
                    </a>
                    {/* Edit */}
                    <button
                      onClick={() => { setEditingEvent(event); setShowEventModal(true) }}
                      className="p-2 text-gray-400 hover:text-white hover:bg-dark-800 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    {/* Delete */}
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
          {/* Orders Header with Export */}
          {orders.length > 0 && (
            <div className="flex items-center justify-between px-4 py-3 border-b border-dark-800">
              <p className="text-sm text-gray-400">
                {orders.filter(o => o.status === 'completed').length} completed orders
                <span className="text-green-500 ml-2">
                  ${orders.filter(o => o.status === 'completed').reduce((sum, o) => sum + parseFloat(o.amount || 0), 0).toFixed(2)} total
                </span>
              </p>
              <button
                onClick={() => {
                  const headers = ['Order ID', 'Email', 'Event', 'Amount', 'Status', 'Date', 'Payment Method']
                  const rows = orders.map(o => [
                    o.id,
                    o.email,
                    o.event?.title || '',
                    o.amount,
                    o.status,
                    new Date(o.created_at).toLocaleString('en-AU'),
                    o.payment_method || 'stripe'
                  ])
                  const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
                  const blob = new Blob([csv], { type: 'text/csv' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = `livestream-orders-${new Date().toISOString().slice(0, 10)}.csv`
                  a.click()
                  URL.revokeObjectURL(url)
                }}
                className="flex items-center gap-2 px-3 py-1.5 bg-dark-800 hover:bg-dark-700 text-gray-300 hover:text-white rounded-lg text-sm transition-colors"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            </div>
          )}
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

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Event Filter */}
          <div className="flex items-center gap-4">
            <label className="text-gray-400">Filter by Event:</label>
            <select
              value={selectedEventForAnalytics}
              onChange={(e) => { setSelectedEventForAnalytics(e.target.value); loadAnalytics(e.target.value); }}
              className="bg-dark-800 border border-dark-700 rounded-lg px-3 py-2 text-white"
            >
              <option value="all">All Events</option>
              {events.map(e => (
                <option key={e.id} value={e.id}>{e.title}</option>
              ))}
            </select>
          </div>

          {/* Funnel Overview */}
          <div className="bg-dark-900 rounded-xl border border-dark-800 p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="text-red-500" /> Conversion Funnel
            </h3>
            {analytics.funnel.length === 0 ? (
              <p className="text-gray-400">No analytics data yet. Data will appear after users visit event pages.</p>
            ) : (
              <div className="space-y-4">
                {analytics.funnel.map((f, i) => {
                  const eventTitle = events.find(e => e.id === f.event_id)?.title || 'Unknown Event'
                  return (
                    <div key={i} className="bg-dark-800 rounded-lg p-4">
                      <h4 className="font-medium text-white mb-3">{eventTitle}</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 text-center">
                        <div>
                          <p className="text-2xl font-bold text-white">{f.page_views || 0}</p>
                          <p className="text-xs text-gray-400">Page Views</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-yellow-500">{f.geo_blocked || 0}</p>
                          <p className="text-xs text-gray-400">Geo Blocked</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-green-500">{f.geo_passed || 0}</p>
                          <p className="text-xs text-gray-400">Geo Passed</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-blue-500">{f.purchase_views || 0}</p>
                          <p className="text-xs text-gray-400">Saw Checkout</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-purple-500">{f.checkout_starts || 0}</p>
                          <p className="text-xs text-gray-400">Started Checkout</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-green-400">{f.purchases || 0}</p>
                          <p className="text-xs text-gray-400">Purchased</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-red-500">{f.checkout_conversion_pct || 0}%</p>
                          <p className="text-xs text-gray-400">Conversion</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Blocked Locations */}
          <div className="bg-dark-900 rounded-xl border border-dark-800 p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <MapPin className="text-yellow-500" /> Blocked User Locations
            </h3>
            {analytics.blockedLocations.length === 0 ? (
              <p className="text-gray-400">No blocked users yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-dark-800">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-400">City</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-400">Region</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-400">Country</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-400">Blocked Count</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-400">Avg Distance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dark-800">
                    {analytics.blockedLocations.map((loc, i) => (
                      <tr key={i} className="hover:bg-dark-800/50">
                        <td className="px-4 py-2 text-white">{loc.city || '—'}</td>
                        <td className="px-4 py-2 text-gray-400">{loc.region || '—'}</td>
                        <td className="px-4 py-2 text-gray-400">{loc.country || '—'}</td>
                        <td className="px-4 py-2 text-yellow-500 font-medium">{loc.blocked_count}</td>
                        <td className="px-4 py-2 text-gray-400">{loc.avg_distance_km ? `${loc.avg_distance_km}km` : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Recent Events Log */}
          <div className="bg-dark-900 rounded-xl border border-dark-800 p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <BarChart3 className="text-blue-500" /> Recent Activity (Last 100)
            </h3>
            {analytics.recentEvents.length === 0 ? (
              <p className="text-gray-400">No recent activity.</p>
            ) : (
              <div className="overflow-x-auto max-h-96 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-dark-800 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-400">Time</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-400">Event Type</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-400">Device</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-400">Location</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-400">Accuracy</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-400">Email</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dark-800">
                    {analytics.recentEvents.map((evt, i) => (
                      <tr key={i} className="hover:bg-dark-800/50">
                        <td className="px-3 py-2 text-gray-400 whitespace-nowrap">
                          {new Date(evt.created_at).toLocaleString('en-AU', { 
                            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                          })}
                        </td>
                        <td className="px-3 py-2">
                          <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                            evt.event_type === 'purchase_complete' ? 'bg-green-500/20 text-green-500' :
                            evt.event_type === 'geo_blocked' ? 'bg-yellow-500/20 text-yellow-500' :
                            evt.event_type === 'geo_passed' ? 'bg-blue-500/20 text-blue-500' :
                            evt.event_type === 'checkout_start' ? 'bg-purple-500/20 text-purple-500' :
                            'bg-gray-500/20 text-gray-400'
                          }`}>
                            {evt.event_type}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-gray-400">{evt.device_type || '—'}</td>
                        <td className="px-3 py-2 text-gray-400">
                          {evt.latitude && evt.longitude 
                            ? `${evt.latitude.toFixed(4)}, ${evt.longitude.toFixed(4)}`
                            : '—'}
                        </td>
                        <td className="px-3 py-2 text-gray-400">
                          {evt.accuracy_meters ? `±${Math.round(evt.accuracy_meters)}m` : '—'}
                        </td>
                        <td className="px-3 py-2 text-gray-400">{evt.customer_email || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recordings Tab */}
      {activeTab === 'recordings' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-gray-400">Video recordings from your livestreams</p>
            <button
              onClick={loadRecordings}
              className="flex items-center gap-2 px-3 py-1.5 bg-dark-800 hover:bg-dark-700 text-gray-300 rounded-lg text-sm transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>

          {loadingRecordings ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-500"></div>
            </div>
          ) : recordings.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Film className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No recordings yet.</p>
              <p className="text-sm">Recordings appear here after streams end.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {recordings.map(rec => (
                <div key={rec.id} className="bg-dark-900 rounded-xl p-5 border border-dark-800">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      {rec.thumbnail_url ? (
                        <img src={rec.thumbnail_url} alt="" className="w-32 h-20 object-cover rounded-lg" />
                      ) : (
                        <div className="w-32 h-20 bg-dark-800 rounded-lg flex items-center justify-center">
                          <Film className="w-8 h-8 text-gray-600" />
                        </div>
                      )}
                      <div>
                        <h4 className="font-medium text-white">{rec.event_title || 'Untitled Recording'}</h4>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-400 mt-1">
                          <span>{rec.duration ? `${Math.floor(rec.duration / 60)}m ${Math.round(rec.duration % 60)}s` : '—'}</span>
                          <span>{rec.created_at ? new Date(rec.created_at * 1000).toLocaleDateString('en-AU') : '—'}</span>
                          <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                            rec.status === 'ready' ? 'bg-green-500/20 text-green-500' :
                            rec.status === 'preparing' ? 'bg-yellow-500/20 text-yellow-500' :
                            'bg-gray-500/20 text-gray-400'
                          }`}>
                            {rec.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {rec.playback_id && rec.status === 'ready' && (
                        <>
                          <a
                            href={`https://stream.mux.com/${rec.playback_id}.m3u8`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-3 py-2 bg-dark-800 hover:bg-dark-700 text-gray-300 rounded-lg text-sm transition-colors"
                          >
                            <Play className="w-4 h-4" />
                            Preview
                          </a>
                          <a
                            href={`https://stream.mux.com/${rec.playback_id}/high.mp4`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm transition-colors"
                          >
                            <Download className="w-4 h-4" />
                            Download MP4
                          </a>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
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
              let eventId = editingEvent?.id
              
              // Remove fields that might not exist in database (keep VOD fields)
              const { 
                category, 
                crew_bypass_token, 
                bypass_created_at, 
                geo_venue_address,
                ...cleanData 
              } = data
              
              // Convert empty timestamp strings to null (Postgres rejects empty strings for timestamps)
              if (cleanData.start_time === '') cleanData.start_time = null
              if (cleanData.end_time === '') cleanData.end_time = null
              if (cleanData.vod_available_until === '') cleanData.vod_available_until = null
              
              // Convert empty numeric strings to null (Postgres rejects empty strings for numeric)
              if (cleanData.vod_price === '' || cleanData.vod_price === undefined) cleanData.vod_price = null
              if (cleanData.price === '' || cleanData.price === undefined) cleanData.price = null
              
              if (editingEvent) {
                await updateLivestreamEvent(editingEvent.id, cleanData)
              } else {
                // Create new event
                const newEvent = await createLivestreamEvent(cleanData)
                eventId = newEvent.id
                
                // Auto-create MUX stream for new events
                try {
                  const { data: muxData, error: muxErr } = await supabase.functions.invoke('mux-stream', {
                    body: { action: 'create', event_id: eventId }
                  })
                  if (muxErr) {
                    console.error('MUX stream creation failed:', muxErr)
                  } else if (muxData?.stream_key) {
                    // Copy stream key to clipboard
                    const obsConfig = `Server: ${muxData.rtmp_url}\nStream Key: ${muxData.stream_key}`
                    navigator.clipboard.writeText(muxData.stream_key).then(() => {
                      alert(`MUX Stream Created! ✅\n\nStream Key copied to clipboard!\n\nFor OBS:\n• Server: ${muxData.rtmp_url}\n• Stream Key: (already copied)\n\nJust paste (Cmd+V) in OBS Stream Key field.`)
                    }).catch(() => {
                      // Fallback: use prompt so they can copy
                      prompt('MUX Stream Created! Copy this Stream Key:', muxData.stream_key)
                    })
                  }
                } catch (muxErr) {
                  console.error('MUX stream creation failed:', muxErr)
                }
              }
              
              await loadData()
              setShowEventModal(false)
              setEditingEvent(null)
            } catch (err) {
              console.error('Save event error:', err)
              alert(`Failed to save event: ${err.message || err}`)
            }
          }}
        />
      )}
    </div>
  )
}

function EventModal({ event: initialEvent, onClose, onSave }) {
  const [event, setEvent] = useState(initialEvent)
  const [formData, setFormData] = useState({
    title: initialEvent?.title || '',
    organization: initialEvent?.organization || '',
    organization_id: initialEvent?.organization_id || null,
    venue: initialEvent?.venue || '',
    start_time: initialEvent?.start_time?.slice(0, 16) || '',
    end_time: initialEvent?.end_time?.slice(0, 16) || '',
    price: initialEvent?.price || 29.99,
    description: initialEvent?.description || '',
    category: initialEvent?.category || '',
    thumbnail_url: initialEvent?.thumbnail_url || '',
    player_poster_url: initialEvent?.player_poster_url || '',
    ticket_url: initialEvent?.ticket_url || '',
    vod_enabled: initialEvent?.vod_enabled ?? true,  // Default ON for new events
    vod_asset_id: initialEvent?.vod_asset_id || '',
    vod_playback_id: initialEvent?.vod_playback_id || '',
    vod_price: initialEvent?.vod_price || '',
    vod_available_until: initialEvent?.vod_available_until || '',  // Auto-calculated from end_time
    status: initialEvent?.status || 'draft',
    mux_playback_id: initialEvent?.mux_playback_id || '',
    mux_stream_key: initialEvent?.mux_stream_key || '',
    geo_blocking_enabled: initialEvent?.geo_blocking_enabled || false,
    geo_lat: initialEvent?.geo_lat || null,
    geo_lng: initialEvent?.geo_lng || null,
    geo_radius_km: initialEvent?.geo_radius_km || 50,
    geo_venue_address: initialEvent?.geo_venue_address || '',
    crew_bypass_token: initialEvent?.crew_bypass_token || null,
    bypass_created_at: initialEvent?.bypass_created_at || null
  })
  const [saving, setSaving] = useState(false)
  const [existingEvents, setExistingEvents] = useState([])
  const [loadingEvents, setLoadingEvents] = useState(true)
  
  // Reload event data from database (used after multi-stream conversion)
  const loadEvent = async () => {
    if (!initialEvent?.id) return
    try {
      const { data, error } = await supabase
        .from('livestream_events')
        .select('*')
        .eq('id', initialEvent.id)
        .single()
      if (data && !error) {
        setEvent(data)
        // Update form data for fields that may have changed
        setFormData(prev => ({
          ...prev,
          mux_playback_id: data.mux_playback_id || '',
          mux_stream_key: data.mux_stream_key || ''
        }))
      }
    } catch (err) {
      console.error('Failed to reload event:', err)
    }
  }

  // Load existing events from Content Management (events table)
  // Also check livestream_events for existing venue data (ONE SOURCE OF TRUTH)
  useEffect(() => {
    const loadExistingEvents = async () => {
      try {
        const contentEvents = await getContentManagementEvents()
        
        // Also load existing livestream events to get their venue data
        const livestreamEvents = await getAllLivestreamEvents()
        
        const events = contentEvents.map(evt => {
          // Check if there's an existing livestream event with matching title
          // Use its venue data if found (it's the source of truth for full addresses)
          const existingLivestream = livestreamEvents.find(le => 
            le.title?.toLowerCase().trim() === evt.name?.toLowerCase().trim()
          )
          
          return {
            id: `content-${evt.id}`,
            source: 'Content',
            title: evt.name,
            organization: evt.org_display_name,
            organizationId: evt.organization_id,
            // Use venue from existing livestream event if available, otherwise fall back to content location
            venue: existingLivestream?.venue || evt.location || '',
            geo_venue_address: existingLivestream?.geo_venue_address || '',
            date: evt.date,
            status: evt.status
          }
        })
        
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

  // Helper to format date for datetime-local input (local time, not UTC)
  const formatLocalDatetime = (date) => {
    const pad = (n) => n.toString().padStart(2, '0')
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
  }

  const handleImportEvent = (selectedId) => {
    if (!selectedId) return
    
    const selected = existingEvents.find(e => e.id === selectedId)
    if (!selected) return
    
    // Format date for datetime-local input (must be LOCAL time, not UTC)
    let startTime = ''
    let endTime = ''
    if (selected.date) {
      const date = new Date(selected.date)
      if (!isNaN(date.getTime())) {
        // Set default start time to 6pm LOCAL
        date.setHours(18, 0, 0, 0)
        startTime = formatLocalDatetime(date)
        // Set end time to 4 hours later (10pm LOCAL)
        date.setHours(22, 0, 0, 0)
        endTime = formatLocalDatetime(date)
      }
    }
    
    setFormData(prev => ({
      ...prev,
      title: selected.title || prev.title,
      organization: selected.organization || prev.organization,
      organization_id: selected.organizationId || prev.organization_id,
      venue: selected.venue || prev.venue,
      geo_venue_address: selected.geo_venue_address || selected.venue || prev.geo_venue_address,
      start_time: startTime || prev.start_time,
      end_time: endTime || prev.end_time
    }))
  }

  const normalizeUrl = (url) => {
    if (!url || url.trim() === '') return ''
    const trimmed = url.trim()
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return trimmed
    }
    return 'https://' + trimmed
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    const normalizedData = {
      ...formData,
      thumbnail_url: normalizeUrl(formData.thumbnail_url),
      ticket_url: normalizeUrl(formData.ticket_url)
    }
    await onSave(normalizedData)
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
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Organization (Legal Name) *</label>
              <input
                type="text"
                value={formData.organization}
                onChange={(e) => setFormData(prev => ({ ...prev, organization: e.target.value }))}
                className="w-full px-3 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white"
                placeholder="Queensland Brazilian Jiu Jitsu Circuit Pty Ltd"
                required
              />
            </div>
          </div>
          <p className="text-xs text-gray-500 -mt-2">Display name is set in Content → Organizations</p>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Venue *</label>
            <input
              type="text"
              value={formData.venue}
              onChange={(e) => setFormData(prev => ({ ...prev, venue: e.target.value }))}
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
                onChange={(e) => setFormData(prev => ({ ...prev, start_time: e.target.value }))}
                className="w-full px-3 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">End Time *</label>
              <input
                type="datetime-local"
                value={formData.end_time}
                onChange={(e) => {
                  const endTime = e.target.value
                  // Auto-calculate VOD expiry as 7 days after end time
                  let vodExpiry = ''
                  if (endTime) {
                    const endDate = new Date(endTime)
                    endDate.setDate(endDate.getDate() + 7)
                    vodExpiry = endDate.toISOString()
                  }
                  setFormData(prev => ({ 
                    ...prev, 
                    end_time: endTime,
                    vod_available_until: prev.vod_available_until || vodExpiry  // Only set if not already set
                  }))
                }}
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
                onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                className="w-full px-3 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="live">Live</option>
                <option value="ended">Ended</option>
              </select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white"
              >
                <option value="">Select Category</option>
                <option value="boxing">Boxing</option>
                <option value="mma">MMA</option>
                <option value="kickboxing">Kickboxing</option>
                <option value="muay-thai">Muay Thai</option>
                <option value="bjj">BJJ / Grappling</option>
                <option value="wrestling">Wrestling</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="flex items-center gap-3">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.vod_enabled}
                  onChange={(e) => setFormData(prev => ({ ...prev, vod_enabled: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-dark-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-red-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
              </label>
              <div>
                <span className="text-sm font-medium text-gray-300">VOD Replay</span>
                <p className="text-xs text-gray-500">Allow replay after event ends</p>
              </div>
            </div>
          </div>

          {/* VOD Configuration - shown when VOD is enabled */}
          {formData.vod_enabled && (
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 space-y-4">
              <h4 className="text-sm font-medium text-blue-400 flex items-center gap-2">
                <Film className="w-4 h-4" />
                VOD Replay Settings
              </h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">VOD Price (leave empty = same as live)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.vod_price}
                    onChange={(e) => setFormData(prev => ({ ...prev, vod_price: e.target.value }))}
                    className="w-full px-3 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white"
                    placeholder="e.g., 19.99"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">VOD Available Until (optional)</label>
                  <input
                    type="datetime-local"
                    value={formData.vod_available_until ? formData.vod_available_until.slice(0, 16) : ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, vod_available_until: e.target.value ? new Date(e.target.value).toISOString() : '' }))}
                    className="w-full px-3 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white"
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">VOD Asset ID (from MUX)</label>
                  <input
                    type="text"
                    value={formData.vod_asset_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, vod_asset_id: e.target.value }))}
                    className="w-full px-3 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white"
                    placeholder="Auto-linked after event ends"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">VOD Playback ID</label>
                  <input
                    type="text"
                    value={formData.vod_playback_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, vod_playback_id: e.target.value }))}
                    className="w-full px-3 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white"
                    placeholder="Auto-linked after event ends"
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500">
                VOD assets are automatically created by MUX when the livestream ends. 
                Live ticket purchasers automatically get VOD access.
              </p>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">MUX Playback ID</label>
              <input
                type="text"
                value={formData.mux_playback_id}
                onChange={(e) => setFormData(prev => ({ ...prev, mux_playback_id: e.target.value }))}
                className="w-full px-3 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white"
                placeholder="Auto-generated on create"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">MUX Stream Key (for OBS)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.mux_stream_key}
                  readOnly
                  className="flex-1 px-3 py-2 bg-dark-900 border border-dark-700 rounded-lg text-gray-400 font-mono text-sm"
                  placeholder={formData.mux_stream_key ? '' : 'Click Generate to create'}
                />
                {formData.mux_stream_key ? (
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(formData.mux_stream_key)
                      alert('Stream Key copied!')
                    }}
                    className="px-3 py-2 bg-dark-700 hover:bg-dark-600 text-white rounded-lg transition-colors"
                  >
                    Copy
                  </button>
                ) : event?.id && (
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        const { data: muxData, error } = await supabase.functions.invoke('mux-stream', {
                          body: { action: 'create', event_id: event.id }
                        })
                        if (error) {
                          alert('Failed to create stream: ' + error.message)
                          return
                        }
                        if (muxData?.stream_key) {
                          setFormData(prev => ({
                            ...prev,
                            mux_stream_key: muxData.stream_key,
                            mux_playback_id: muxData.playback_id
                          }))
                          navigator.clipboard.writeText(muxData.stream_key)
                          alert('MUX Stream created! Stream Key copied to clipboard.')
                        }
                      } catch (err) {
                        alert('Failed to create stream: ' + err.message)
                      }
                    }}
                    className="px-3 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors whitespace-nowrap"
                  >
                    Generate
                  </button>
                )}
              </div>
              <p className="text-sm text-amber-400 mt-1 font-medium">📡 RTMP Server: rtmps://global-live.mux.com:443/app</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white"
              rows={3}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Thumbnail URL</label>
              <input
                type="text"
                value={formData.thumbnail_url}
                onChange={(e) => setFormData(prev => ({ ...prev, thumbnail_url: e.target.value }))}
                className="w-full px-3 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white"
                placeholder="For event cards"
              />
              <p className="text-xs text-gray-500 mt-1">Used on event listing cards</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Player Poster URL</label>
              <input
                type="text"
                value={formData.player_poster_url}
                onChange={(e) => setFormData(prev => ({ ...prev, player_poster_url: e.target.value }))}
                className="w-full px-3 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white"
                placeholder="For video player (optional)"
              />
              <p className="text-xs text-gray-500 mt-1">Shows before/after stream. Falls back to thumbnail if empty.</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Ticket URL</label>
            <input
              type="text"
              value={formData.ticket_url}
              onChange={(e) => setFormData(prev => ({ ...prev, ticket_url: e.target.value }))}
              className="w-full px-3 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white"
              placeholder="www.instagram.com/fitfocusmedia"
            />
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
                  onChange={(e) => setFormData(prev => ({ ...prev, geo_blocking_enabled: e.target.checked }))}
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
                  setFormData(prev => ({ ...prev, geo_radius_km: radius }))
                }}
              />
            )}

            {/* Crew Bypass Access - for admin/crew monitoring */}
            {event?.id && (
              <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="w-5 h-5 text-blue-500" />
                  <h4 className="font-semibold text-white">Crew Access</h4>
                </div>
                <p className="text-sm text-gray-400 mb-4">
                  Generate a bypass link for crew members at the venue who need to access the stream.
                </p>
                
                {formData.crew_bypass_token ? (
                  <div className="space-y-4">
                    {/* Live Stream Link */}
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1">📡 Live Stream (for monitoring during event)</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          readOnly
                          value={`https://fitfocusmedia.com.au/#/watch/${event.id}?bypass=${formData.crew_bypass_token}`}
                          className="flex-1 px-3 py-2 bg-dark-900 border border-dark-700 rounded-lg text-gray-400 font-mono text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(`https://fitfocusmedia.com.au/#/watch/${event.id}?bypass=${formData.crew_bypass_token}`)
                            alert('Live stream link copied!')
                          }}
                          className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
                          title="Copy Link"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Preview Player Link */}
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1">🎨 Preview Player (for design testing before event)</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          readOnly
                          value={`https://fitfocusmedia.com.au/#/watch/${event.id}?bypass=${formData.crew_bypass_token}&preview=player`}
                          className="flex-1 px-3 py-2 bg-dark-900 border border-dark-700 rounded-lg text-gray-400 font-mono text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(`https://fitfocusmedia.com.au/#/watch/${event.id}?bypass=${formData.crew_bypass_token}&preview=player`)
                            alert('Preview player link copied!')
                          }}
                          className="px-3 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors"
                          title="Copy Link"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-2 border-t border-dark-700">
                      <p className="text-xs text-gray-500">
                        Created: {formData.bypass_created_at ? new Date(formData.bypass_created_at).toLocaleString('en-AU') : 'Unknown'}
                      </p>
                      <button
                        type="button"
                        onClick={async () => {
                          if (!confirm('Regenerate bypass token? Both links will stop working immediately.')) return
                          const newToken = crypto.randomUUID()
                          const now = new Date().toISOString()
                          await updateLivestreamEvent(event.id, { 
                            crew_bypass_token: newToken,
                            bypass_created_at: now
                          })
                          setFormData(prev => ({ 
                            ...prev, 
                            crew_bypass_token: newToken,
                            bypass_created_at: now
                          }))
                          alert('New bypass token generated!')
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 bg-yellow-600 hover:bg-yellow-500 text-white text-sm rounded-lg transition-colors"
                      >
                        <RefreshCw className="w-3 h-3" />
                        Regenerate
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={async () => {
                      const newToken = crypto.randomUUID()
                      const now = new Date().toISOString()
                      await updateLivestreamEvent(event.id, { 
                        crew_bypass_token: newToken,
                        bypass_created_at: now
                      })
                      setFormData(prev => ({ 
                        ...prev, 
                        crew_bypass_token: newToken,
                        bypass_created_at: now
                      }))
                      // Auto-copy to clipboard
                      navigator.clipboard.writeText(`https://fitfocusmedia.com.au/#/watch/${event.id}?bypass=${newToken}`)
                      alert('Crew bypass link generated and copied to clipboard!')
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
                  >
                    <Shield className="w-4 h-4" />
                    Generate Crew Bypass Link
                  </button>
                )}
              </div>
            )}
          </div>
          
          {/* Multi-Stream Section */}
          {event?.id && (
            <MultiStreamManager eventId={event.id} event={event} onEventUpdate={loadEvent} />
          )}

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

// Multi-Stream Manager Component
function MultiStreamManager({ eventId, event, onEventUpdate }) {
  const [streams, setStreams] = useState([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [converting, setConverting] = useState(false)
  const [newStreamName, setNewStreamName] = useState('')
  const [convertStreamName, setConvertStreamName] = useState('')
  const [showConvertModal, setShowConvertModal] = useState(false)
  const [expandedStream, setExpandedStream] = useState(null)

  // Check if event has existing single stream that can be converted
  const hasExistingSingleStream = event?.mux_stream_id && !event?.is_multi_stream
  
  useEffect(() => {
    loadStreams()
  }, [eventId])

  const loadStreams = async () => {
    try {
      const data = await getEventStreams(eventId)
      setStreams(data || [])
    } catch (err) {
      console.error('Failed to load streams:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddStream = async () => {
    if (!newStreamName.trim()) return
    setAdding(true)
    try {
      // Step 1: Create stream entry in database first (without MUX data)
      const streamData = {
        event_id: eventId,
        name: newStreamName.trim(),
        display_order: streams.length,
        is_default: streams.length === 0
      }
      const newStream = await createEventStream(streamData)
      
      // Update event's multi-stream flag
      if (streams.length === 0) {
        await updateEventMultiStreamFlag(eventId, true)
      }
      
      // Step 2: Now create MUX stream with the new stream_id
      let muxData = null
      try {
        const muxResponse = await fetch('https://gonalgubgldgpkcekaxe.supabase.co/functions/v1/mux-stream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            action: 'create',
            stream_id: newStream.id,
            stream_name: newStreamName.trim(),
            event_id: eventId 
          })
        })
        
        if (muxResponse.ok) {
          muxData = await muxResponse.json()
          console.log('MUX stream created:', muxData)
        } else {
          const errText = await muxResponse.text()
          console.warn('Failed to auto-create MUX stream:', errText)
        }
      } catch (muxErr) {
        console.warn('MUX stream creation failed:', muxErr)
      }
      
      setNewStreamName('')
      await loadStreams()
      
      // Show success message with stream key if created
      if (muxData?.stream_key) {
        navigator.clipboard.writeText(muxData.stream_key)
        alert(`✅ Stream "${newStreamName.trim()}" created!\n\nRTMP Server: rtmps://global-live.mux.com:443/app\nStream Key: ${muxData.stream_key}\n\n(Stream key copied to clipboard)`)
      } else {
        alert(`✅ Stream "${newStreamName.trim()}" added!\n\nClick "Generate MUX Stream Key" to get the stream key.`)
      }
    } catch (err) {
      console.error('Failed to add stream:', err)
      alert('Failed to add stream: ' + err.message)
    } finally {
      setAdding(false)
    }
  }

  const handleDeleteStream = async (streamId) => {
    if (!confirm('Delete this stream? This cannot be undone.')) return
    try {
      await deleteEventStream(streamId)
      
      // Update multi-stream flag if no streams left
      if (streams.length <= 1) {
        await updateEventMultiStreamFlag(eventId, false)
      }
      
      await loadStreams()
    } catch (err) {
      console.error('Failed to delete stream:', err)
      alert('Failed to delete stream')
    }
  }

  const handleGenerateStreamKey = async (stream) => {
    try {
      const response = await fetch('https://gonalgubgldgpkcekaxe.supabase.co/functions/v1/mux-stream/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: stream.name,
          event_id: eventId 
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        alert('Failed to create MUX stream: ' + (errorData.error || 'Unknown error'))
        return
      }
      
      const muxData = await response.json()
      
      if (muxData?.mux_stream_key) {
        // Update stream with MUX credentials
        await updateEventStream(stream.id, {
          mux_stream_key: muxData.mux_stream_key,
          mux_playback_id: muxData.mux_playback_id,
          mux_stream_id: muxData.mux_stream_id,
          status: 'idle'
        })
        
        // Copy to clipboard
        navigator.clipboard.writeText(muxData.mux_stream_key)
        alert(`✅ Stream Key for ${stream.name} created and copied!\n\nServer: rtmps://global-live.mux.com:443/app\nStream Key: ${muxData.mux_stream_key}`)
        
        await loadStreams()
      }
    } catch (err) {
      console.error('Failed to generate stream key:', err)
      alert('Failed to generate stream key: ' + err.message)
    }
  }

  const handleSetDefault = async (streamId) => {
    try {
      // Clear default from all streams
      for (const s of streams) {
        if (s.is_default) {
          await updateEventStream(s.id, { is_default: false })
        }
      }
      // Set new default
      await updateEventStream(streamId, { is_default: true })
      await loadStreams()
    } catch (err) {
      console.error('Failed to set default stream:', err)
    }
  }

  const handleConvertToMultiStream = async () => {
    if (!convertStreamName.trim()) {
      alert('Please enter a name for the existing stream')
      return
    }
    
    setConverting(true)
    try {
      // Call edge function to migrate the existing stream
      const { data, error } = await supabase.functions.invoke('mux-stream', {
        body: {
          action: 'migrate',
          event_id: eventId,
          stream_name: convertStreamName.trim()
        }
      })
      
      if (error) {
        throw new Error(error.message || 'Migration failed')
      }
      
      if (data?.error) {
        throw new Error(data.error)
      }
      
      setShowConvertModal(false)
      setConvertStreamName('')
      
      // Reload streams and event data
      await loadStreams()
      if (onEventUpdate) {
        await onEventUpdate()
      }
      
      alert(`Successfully converted to multi-stream! "${convertStreamName.trim()}" is now your first stream.`)
    } catch (err) {
      console.error('Failed to convert to multi-stream:', err)
      alert('Failed to convert: ' + err.message)
    } finally {
      setConverting(false)
    }
  }

  return (
    <div className="pt-6 border-t border-dark-800">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-purple-500" />
          <h3 className="text-lg font-semibold text-white">Multi-Stream</h3>
          {streams.length > 0 && (
            <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs font-medium rounded-full">
              {streams.length} stream{streams.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>
      
      <p className="text-sm text-gray-500 mb-4">
        Add multiple streams for events with multiple mats/stages. Each stream gets its own OBS stream key.
      </p>

      {/* Convert Existing Stream Banner */}
      {hasExistingSingleStream && streams.length === 0 && (
        <div className="mb-4 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-500/20 rounded-lg">
              <Tv className="w-5 h-5 text-amber-500" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-amber-400 mb-1">Existing Stream Detected</h4>
              <p className="text-sm text-gray-400 mb-3">
                This event has a stream key already generated. To add multiple streams, convert it to multi-stream mode first.
              </p>
              <button
                type="button"
                onClick={() => setShowConvertModal(true)}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
              >
                <Layers className="w-4 h-4" />
                Convert to Multi-Stream
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Convert Modal */}
      {showConvertModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-dark-900 rounded-xl border border-dark-700 p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-white mb-2">Convert to Multi-Stream</h3>
            <p className="text-sm text-gray-400 mb-4">
              Name your existing stream. This will become the first stream in multi-stream mode.
            </p>
            <input
              type="text"
              value={convertStreamName}
              onChange={(e) => setConvertStreamName(e.target.value)}
              placeholder="e.g., Main Stage, Mat 1, Ring A"
              className="w-full px-3 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white placeholder-gray-500 mb-4"
              autoFocus
            />
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => { setShowConvertModal(false); setConvertStreamName('') }}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConvertToMultiStream}
                disabled={converting || !convertStreamName.trim()}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 disabled:bg-dark-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
              >
                {converting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    Converting...
                  </>
                ) : (
                  <>
                    <Layers className="w-4 h-4" />
                    Convert
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Stream Form */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={newStreamName}
          onChange={(e) => setNewStreamName(e.target.value)}
          placeholder="Stream name (e.g., Mat 1, Main Stage)"
          className="flex-1 px-3 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white placeholder-gray-500"
        />
        <button
          type="button"
          onClick={handleAddStream}
          disabled={adding || !newStreamName.trim()}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:bg-dark-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
        >
          {adding ? (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
          Add
        </button>
      </div>

      {/* Streams List */}
      {loading ? (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-purple-500 border-t-transparent mx-auto" />
        </div>
      ) : streams.length === 0 ? (
        <div className="text-center py-6 text-gray-500 bg-dark-800/50 rounded-lg border border-dashed border-dark-700">
          <Tv className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>No streams configured yet.</p>
          <p className="text-sm">Add streams above for multi-mat/stage events.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {streams.map((stream, index) => (
            <div 
              key={stream.id}
              className={`bg-dark-800 rounded-lg border ${stream.is_default ? 'border-purple-500/50' : 'border-dark-700'} overflow-hidden`}
            >
              {/* Stream Header */}
              <div 
                className="flex items-center justify-between p-3 cursor-pointer hover:bg-dark-700/50"
                onClick={() => setExpandedStream(expandedStream === stream.id ? null : stream.id)}
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-purple-500/20 rounded-lg">
                    <Radio className="w-4 h-4 text-purple-500" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white">{stream.name}</span>
                      {stream.is_default && (
                        <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded">Default</span>
                      )}
                      {stream.mux_stream_key && (
                        <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded">Ready</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      {stream.mux_stream_key ? 'Stream key configured' : 'No stream key yet'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!stream.is_default && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleSetDefault(stream.id) }}
                      className="px-2 py-1 text-xs text-gray-400 hover:text-purple-400 transition-colors"
                    >
                      Set Default
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleDeleteStream(stream.id) }}
                    className="p-1.5 text-gray-500 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {/* Expanded Stream Details */}
              {expandedStream === stream.id && (
                <div className="px-3 pb-3 pt-0 space-y-3 border-t border-dark-700">
                  {stream.mux_stream_key ? (
                    <>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Stream Key (for OBS)</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            readOnly
                            value={stream.mux_stream_key}
                            className="flex-1 px-3 py-2 bg-dark-900 border border-dark-700 rounded-lg text-gray-400 font-mono text-xs"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(stream.mux_stream_key)
                              alert('Stream key copied!')
                            }}
                            className="px-3 py-2 bg-dark-700 hover:bg-dark-600 text-white rounded-lg transition-colors"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Playback ID</label>
                        <input
                          type="text"
                          readOnly
                          value={stream.mux_playback_id || '—'}
                          className="w-full px-3 py-2 bg-dark-900 border border-dark-700 rounded-lg text-gray-400 font-mono text-xs"
                        />
                      </div>
                      <p className="text-xs text-amber-400 font-medium">
                        📡 RTMP Server: rtmps://global-live.mux.com:443/app
                      </p>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleGenerateStreamKey(stream)}
                      className="w-full px-4 py-3 bg-green-600 hover:bg-green-500 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <Play className="w-4 h-4" />
                      Generate MUX Stream Key
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      {streams.length > 0 && (
        <p className="text-xs text-gray-500 mt-3">
          💡 Viewers will see a stream selector to switch between streams during the event.
        </p>
      )}
    </div>
  )
}
