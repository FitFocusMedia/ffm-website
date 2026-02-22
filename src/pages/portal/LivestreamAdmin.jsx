import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Eye, DollarSign, Users, Calendar, ToggleLeft, ToggleRight, Download, Radio, Copy, ExternalLink, BarChart3, MapPin, TrendingUp, Shield, RefreshCw, Film, Tag, Archive, Play, StopCircle } from 'lucide-react'
import { 
  getAllLivestreamEvents, 
  createLivestreamEvent, 
  updateLivestreamEvent, 
  deleteLivestreamEvent,
  getLivestreamOrders,
  getLivestreamSettings,
  updateLivestreamSettings,
  getOnboardingSessions,
  getContracts,
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
                    <p className="text-gray-400 mb-2">{event.organization}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <span>{new Date(event.start_time).toLocaleDateString('en-AU')}</span>
                      <span>{event.venue}</span>
                      <span className="font-medium text-green-500">${event.price} AUD</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {/* Go Live Toggle */}
                    {/* Go Live / End Stream */}
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
              
              // Remove fields that might not exist in database
              const { 
                category, 
                crew_bypass_token, 
                bypass_created_at, 
                player_poster_url,
                vod_enabled,
                geo_venue_address,
                ...cleanData 
              } = data
              
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

function EventModal({ event, onClose, onSave }) {
  const [formData, setFormData] = useState({
    title: event?.title || '',
    organization: event?.organization || '',
    venue: event?.venue || '',
    start_time: event?.start_time?.slice(0, 16) || '',
    end_time: event?.end_time?.slice(0, 16) || '',
    price: event?.price || 29.99,
    description: event?.description || '',
    category: event?.category || '',
    thumbnail_url: event?.thumbnail_url || '',
    player_poster_url: event?.player_poster_url || '',
    ticket_url: event?.ticket_url || '',
    vod_enabled: event?.vod_enabled || false,
    status: event?.status || 'draft',
    mux_playback_id: event?.mux_playback_id || '',
    mux_stream_key: event?.mux_stream_key || '',
    geo_blocking_enabled: event?.geo_blocking_enabled || false,
    geo_lat: event?.geo_lat || null,
    geo_lng: event?.geo_lng || null,
    geo_radius_km: event?.geo_radius_km || 50,
    geo_venue_address: event?.geo_venue_address || '',
    crew_bypass_token: event?.crew_bypass_token || null,
    bypass_created_at: event?.bypass_created_at || null
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

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
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
                  onChange={(e) => setFormData({ ...formData, vod_enabled: e.target.checked })}
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

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">MUX Playback ID</label>
              <input
                type="text"
                value={formData.mux_playback_id}
                onChange={(e) => setFormData({ ...formData, mux_playback_id: e.target.value })}
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
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
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
                onChange={(e) => setFormData({ ...formData, player_poster_url: e.target.value })}
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
              onChange={(e) => setFormData({ ...formData, ticket_url: e.target.value })}
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
