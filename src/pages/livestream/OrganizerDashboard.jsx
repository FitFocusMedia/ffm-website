import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { DollarSign, Users, Clock, TrendingUp, Share2, Copy, ExternalLink, Calendar, MapPin, Tag, Check, RefreshCw, Mail } from 'lucide-react'
import { supabase } from '../../lib/supabase'

export default function OrganizerDashboard() {
  const { token } = useParams()
  const navigate = useNavigate()
  const [event, setEvent] = useState(null)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [lastRefresh, setLastRefresh] = useState(new Date())

  useEffect(() => {
    loadData()
  }, [token])

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return
    const interval = setInterval(() => {
      loadData(true)
    }, 30000)
    return () => clearInterval(interval)
  }, [autoRefresh])

  const loadData = async (silent = false) => {
    if (!silent) setLoading(true)
    setError(null)

    try {
      // Get event by organizer token
      const { data: eventData, error: eventError } = await supabase
        .from('livestream_events')
        .select('*')
        .eq('organizer_token', token)
        .single()

      if (eventError || !eventData) {
        throw new Error('Invalid organizer link or event not found')
      }

      setEvent(eventData)

      // Get orders for this event
      const { data: ordersData, error: ordersError } = await supabase
        .from('livestream_orders')
        .select('*')
        .eq('event_id', eventData.id)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false })

      if (ordersError) throw ordersError

      setOrders(ordersData || [])
      setLastRefresh(new Date())
    } catch (err) {
      console.error('Failed to load organizer data:', err)
      setError(err.message)
    } finally {
      if (!silent) setLoading(false)
    }
  }

  const copyLink = (url) => {
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-red-900/20 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-400">Loading event data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-red-900/20 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 text-center border border-red-500/20">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <ExternalLink className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            Go to Homepage
          </button>
        </div>
      </div>
    )
  }

  const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.amount), 0)
  const totalPurchases = orders.length
  const eventDate = new Date(event.event_date)
  const now = new Date()
  const hoursUntilEvent = Math.max(0, Math.floor((eventDate - now) / (1000 * 60 * 60)))
  const eventHappened = now > eventDate
  const eventUrl = `${window.location.origin}/live/${event.id}`

  // Calculate revenue share (if set in event)
  const organizerShare = event.revenue_share_percent ? (totalRevenue * event.revenue_share_percent / 100) : totalRevenue

  // Group orders by hour for sparkline
  const ordersByHour = orders.reduce((acc, order) => {
    const hour = new Date(order.completed_at).getHours()
    acc[hour] = (acc[hour] || 0) + 1
    return acc
  }, {})

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-red-900/20">
      {/* Header */}
      <div className="bg-gray-800/30 backdrop-blur-xl border-b border-gray-700/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Organizer Dashboard</h1>
                <p className="text-sm text-gray-400">Real-time event analytics</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-right text-sm">
                <div className="text-gray-400">Last updated</div>
                <div className="text-white font-medium">{lastRefresh.toLocaleTimeString()}</div>
              </div>
              <button
                onClick={() => loadData(false)}
                className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
                title="Refresh now"
              >
                <RefreshCw className="w-5 h-5 text-gray-400" />
              </button>
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  autoRefresh
                    ? 'bg-green-600/20 text-green-400 border border-green-600/30'
                    : 'bg-gray-700/50 text-gray-400 border border-gray-600/30'
                }`}
              >
                {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Event Header */}
        <div className="bg-gradient-to-r from-red-600/10 to-red-600/5 backdrop-blur-xl rounded-2xl p-8 border border-red-500/20">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="inline-block px-3 py-1 bg-red-600/20 text-red-400 text-sm font-medium rounded-full mb-3">
                {event.organization}
              </div>
              <h2 className="text-4xl font-bold text-white mb-2">{event.title}</h2>
              <div className="flex flex-wrap items-center gap-4 text-gray-300">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-red-400" />
                  <span>{eventDate.toLocaleDateString('en-AU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5 text-red-400" />
                  <span>{event.venue}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Tag className="w-5 h-5 text-red-400" />
                  <span>${event.price} AUD</span>
                </div>
              </div>
            </div>
            {!eventHappened && (
              <div className="text-right">
                <div className="text-sm text-gray-400 mb-1">Time until event</div>
                <div className="text-5xl font-bold text-white">{hoursUntilEvent}h</div>
              </div>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Purchases */}
          <div className="bg-gray-800/30 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50 hover:border-red-500/30 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
              <div className="text-3xl font-bold text-white">{totalPurchases}</div>
            </div>
            <div className="text-gray-400 text-sm">Total Purchases</div>
          </div>

          {/* Total Revenue */}
          <div className="bg-gray-800/30 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50 hover:border-red-500/30 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-600/20 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-400" />
              </div>
              <div className="text-3xl font-bold text-white">${totalRevenue.toFixed(2)}</div>
            </div>
            <div className="text-gray-400 text-sm">Total Revenue</div>
          </div>

          {/* Your Share */}
          <div className="bg-gray-800/30 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50 hover:border-red-500/30 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-600/20 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-400" />
              </div>
              <div className="text-3xl font-bold text-white">${organizerShare.toFixed(2)}</div>
            </div>
            <div className="text-gray-400 text-sm">
              Your Share {event.revenue_share_percent && `(${event.revenue_share_percent}%)`}
            </div>
          </div>
        </div>

        {/* Share Links */}
        <div className="bg-gray-800/30 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50">
          <div className="flex items-center space-x-3 mb-4">
            <Share2 className="w-6 h-6 text-red-400" />
            <h3 className="text-xl font-bold text-white">Share Event</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Event Page URL</label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={eventUrl}
                  readOnly
                  className="flex-1 bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-red-500"
                />
                <button
                  onClick={() => copyLink(eventUrl)}
                  className="px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center space-x-2"
                >
                  {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <a
                href={eventUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-gray-700/50 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center space-x-2"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Open Event Page</span>
              </a>
            </div>
          </div>
        </div>

        {/* Recent Purchases */}
        <div className="bg-gray-800/30 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Mail className="w-6 h-6 text-red-400" />
              <h3 className="text-xl font-bold text-white">Recent Purchases</h3>
            </div>
            <div className="text-sm text-gray-400">{orders.length} total</div>
          </div>
          {orders.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg mb-2">No purchases yet</p>
              <p className="text-gray-500 text-sm">Sales will appear here in real-time</p>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.slice(0, 10).map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg border border-gray-700/50"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-green-600/20 rounded-full flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <div className="text-white font-medium">{order.email}</div>
                      <div className="text-sm text-gray-400">
                        {new Date(order.completed_at).toLocaleString('en-AU', {
                          month: 'short',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-bold">${parseFloat(order.amount).toFixed(2)}</div>
                    <div className="text-xs text-green-400">Completed</div>
                  </div>
                </div>
              ))}
              {orders.length > 10 && (
                <div className="text-center text-sm text-gray-400 pt-4">
                  + {orders.length - 10} more purchases
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 py-4">
          <p>Powered by Fit Focus Media • This page auto-refreshes every 30 seconds</p>
        </div>
      </div>
    </div>
  )
}
