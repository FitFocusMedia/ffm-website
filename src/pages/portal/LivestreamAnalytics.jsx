import { useState, useEffect } from 'react'
import { TrendingUp, DollarSign, ShoppingCart, Users, Calendar, BarChart3, RefreshCw, Download, Filter, X } from 'lucide-react'
import { supabase } from '../../lib/supabase'

export default function LivestreamAnalytics() {
  const [loading, setLoading] = useState(true)
  const [events, setEvents] = useState([])
  const [orders, setOrders] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [lastRefresh, setLastRefresh] = useState(new Date())
  const [dateRange, setDateRange] = useState('all') // all, 7d, 30d, 90d
  const [statusFilter, setStatusFilter] = useState('all') // all, published, live, ended
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    loadData()
    
    if (autoRefresh) {
      const interval = setInterval(() => {
        loadData()
      }, 30000) // Refresh every 30s
      
      return () => clearInterval(interval)
    }
  }, [autoRefresh, dateRange, statusFilter])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Load events
      let eventsQuery = supabase
        .from('livestream_events')
        .select('*, organizations(id, name, display_name)')
        .order('start_time', { ascending: false })
      
      if (statusFilter !== 'all') {
        eventsQuery = eventsQuery.eq('status', statusFilter)
      }
      
      const { data: eventsData, error: eventsError } = await eventsQuery
      if (eventsError) throw eventsError
      
      // Load orders
      const { data: ordersData, error: ordersError } = await supabase
        .from('livestream_orders')
        .select('*')
        .eq('status', 'completed')
      
      if (ordersError) throw ordersError
      
      // Calculate analytics
      const analytics = calculateAnalytics(eventsData || [], ordersData || [])
      
      setEvents(eventsData || [])
      setOrders(ordersData || [])
      setAnalytics(analytics)
      setLastRefresh(new Date())
    } catch (err) {
      console.error('Failed to load analytics:', err)
    } finally {
      setLoading(false)
    }
  }

  const calculateAnalytics = (events, orders) => {
    // Overall stats
    const totalRevenue = orders.reduce((sum, o) => sum + parseFloat(o.amount || 0), 0)
    const totalPurchases = orders.length
    
    // Group orders by event
    const eventStats = events.map(event => {
      const eventOrders = orders.filter(o => o.event_id === event.id)
      const revenue = eventOrders.reduce((sum, o) => sum + parseFloat(o.amount || 0), 0)
      const purchases = eventOrders.length
      
      return {
        ...event,
        purchases,
        revenue,
        avgOrderValue: purchases > 0 ? revenue / purchases : 0
      }
    })
    
    // Sort by revenue
    eventStats.sort((a, b) => b.revenue - a.revenue)
    
    // Revenue by day (last 30 days)
    const revenueByDay = {}
    orders.forEach(order => {
      const date = new Date(order.created_at).toISOString().split('T')[0]
      revenueByDay[date] = (revenueByDay[date] || 0) + parseFloat(order.amount || 0)
    })
    
    const dailyRevenue = Object.entries(revenueByDay)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-30)
    
    return {
      totalRevenue,
      totalPurchases,
      totalEvents: events.length,
      avgOrderValue: totalPurchases > 0 ? totalRevenue / totalPurchases : 0,
      eventStats,
      dailyRevenue
    }
  }

  const exportCSV = () => {
    if (!analytics) return
    
    const csv = [
      ['Event', 'Organization', 'Purchases', 'Revenue', 'Avg Order Value', 'Status'].join(','),
      ...analytics.eventStats.map(e => [
        `"${e.title}"`,
        `"${e.organizations?.display_name || e.organization}"`,
        e.purchases,
        `$${e.revenue.toFixed(2)}`,
        `$${e.avgOrderValue.toFixed(2)}`,
        e.status
      ].join(','))
    ].join('\n')
    
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `livestream-analytics-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  if (loading && !analytics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-red-500" />
              Livestream Analytics
            </h1>
            <p className="text-gray-400">Real-time performance metrics and insights</p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg text-gray-300 flex items-center gap-2 transition-all border border-gray-700"
            >
              <Filter className="w-4 h-4" />
              {showFilters ? 'Hide' : 'Show'} Filters
            </button>
            
            {/* Export */}
            <button
              onClick={exportCSV}
              className="px-4 py-2 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg text-gray-300 flex items-center gap-2 transition-all border border-gray-700"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
            
            {/* Refresh */}
            <button
              onClick={loadData}
              disabled={loading}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white flex items-center gap-2 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mb-6 p-4 bg-gray-800/30 backdrop-blur-md rounded-lg border border-gray-700">
            <div className="flex flex-wrap gap-4">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="all">All Events</option>
                  <option value="published">Published</option>
                  <option value="live">Live</option>
                  <option value="ended">Ended</option>
                </select>
              </div>
              
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Auto-Refresh</label>
                <button
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  className={`px-4 py-2 rounded-lg border transition-all ${
                    autoRefresh 
                      ? 'bg-red-600 border-red-500 text-white' 
                      : 'bg-gray-900 border-gray-700 text-gray-400'
                  }`}
                >
                  {autoRefresh ? 'ON (30s)' : 'OFF'}
                </button>
              </div>
              
              <div className="flex-1"></div>
              
              <div className="text-sm text-gray-500 self-end">
                Last updated: {lastRefresh.toLocaleTimeString()}
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-red-500/20 to-red-600/10 backdrop-blur-md rounded-xl p-6 border border-red-500/20">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-8 h-8 text-red-400" />
              <span className="text-2xl">💰</span>
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              ${analytics?.totalRevenue.toFixed(2)}
            </div>
            <div className="text-sm text-gray-400">Total Revenue</div>
          </div>

          <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 backdrop-blur-md rounded-xl p-6 border border-blue-500/20">
            <div className="flex items-center justify-between mb-2">
              <ShoppingCart className="w-8 h-8 text-blue-400" />
              <span className="text-2xl">🎟️</span>
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {analytics?.totalPurchases}
            </div>
            <div className="text-sm text-gray-400">Total Purchases</div>
          </div>

          <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 backdrop-blur-md rounded-xl p-6 border border-green-500/20">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="w-8 h-8 text-green-400" />
              <span className="text-2xl">📅</span>
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {analytics?.totalEvents}
            </div>
            <div className="text-sm text-gray-400">Total Events</div>
          </div>

          <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 backdrop-blur-md rounded-xl p-6 border border-purple-500/20">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 text-purple-400" />
              <span className="text-2xl">📊</span>
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              ${analytics?.avgOrderValue.toFixed(2)}
            </div>
            <div className="text-sm text-gray-400">Avg Order Value</div>
          </div>
        </div>

        {/* Event Performance Table */}
        <div className="bg-gray-800/30 backdrop-blur-md rounded-xl border border-gray-700 overflow-hidden mb-8">
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-red-500" />
              Event Performance
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Event</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Organization</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Purchases</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Revenue</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Avg Order</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {analytics?.eventStats.map(event => (
                  <tr key={event.id} className="hover:bg-gray-700/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">{event.title}</div>
                      <div className="text-xs text-gray-400">
                        {new Date(event.start_time).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {event.organizations?.display_name || event.organization}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm font-medium text-white">{event.purchases}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm font-bold text-green-400">${event.revenue.toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm text-gray-300">${event.avgOrderValue.toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        event.status === 'live' ? 'bg-green-500/20 text-green-400' :
                        event.status === 'published' ? 'bg-blue-500/20 text-blue-400' :
                        event.status === 'ended' ? 'bg-gray-500/20 text-gray-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {event.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {analytics?.eventStats.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No events found
            </div>
          )}
        </div>

        {/* Daily Revenue Chart */}
        <div className="bg-gray-800/30 backdrop-blur-md rounded-xl border border-gray-700 p-6">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-red-500" />
            Revenue Trend (Last 30 Days)
          </h2>
          
          {analytics?.dailyRevenue && analytics.dailyRevenue.length > 0 ? (
            <div className="space-y-2">
              {analytics.dailyRevenue.map(([date, revenue]) => {
                const maxRevenue = Math.max(...analytics.dailyRevenue.map(d => d[1]))
                const percentage = (revenue / maxRevenue) * 100
                
                return (
                  <div key={date} className="flex items-center gap-4">
                    <div className="text-xs text-gray-400 w-24">
                      {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                    <div className="flex-1 bg-gray-700/30 rounded-full h-8 overflow-hidden relative">
                      <div 
                        className="bg-gradient-to-r from-red-500 to-red-600 h-full rounded-full transition-all duration-500 flex items-center px-3"
                        style={{ width: `${percentage}%` }}
                      >
                        {revenue > 0 && (
                          <span className="text-xs font-medium text-white whitespace-nowrap">
                            ${revenue.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              No revenue data available
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
