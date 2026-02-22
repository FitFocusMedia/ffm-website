import { useState, useEffect } from 'react'
import { Users, DollarSign, TrendingUp, Globe, Clock, Eye } from 'lucide-react'
import { supabase } from '../lib/supabase'

/**
 * Event Analytics Component
 * Shows key metrics for a livestream event:
 * - Total orders / revenue
 * - Geographic distribution
 * - Viewing stats (when integrated with MUX Data)
 */
export default function EventAnalytics({ eventId, event }) {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (eventId) {
      loadOrders()
    }
  }, [eventId])

  const loadOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('livestream_orders')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false })

      if (!error) {
        setOrders(data || [])
      }
    } catch (err) {
      console.error('Failed to load orders:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-24 bg-dark-800 rounded-lg"></div>
        <div className="h-24 bg-dark-800 rounded-lg"></div>
      </div>
    )
  }

  // Calculate stats
  const completedOrders = orders.filter(o => o.status === 'completed')
  const totalRevenue = completedOrders.reduce((sum, o) => sum + (parseFloat(o.amount) || 0), 0)
  const uniqueEmails = new Set(completedOrders.map(o => o.email.toLowerCase())).size
  
  // Group by hour for purchase timeline
  const purchasesByHour = completedOrders.reduce((acc, order) => {
    const hour = new Date(order.created_at).toISOString().slice(0, 13)
    acc[hour] = (acc[hour] || 0) + 1
    return acc
  }, {})

  const StatCard = ({ icon: Icon, label, value, subtext, color = 'red' }) => (
    <div className="bg-dark-800 rounded-lg p-4 border border-dark-700">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg bg-${color}-500/20`}>
          <Icon className={`w-5 h-5 text-${color}-500`} />
        </div>
        <div>
          <p className="text-sm text-gray-400">{label}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
          {subtext && <p className="text-xs text-gray-500">{subtext}</p>}
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard 
          icon={Users} 
          label="Tickets Sold" 
          value={completedOrders.length}
          subtext={`${uniqueEmails} unique`}
          color="blue"
        />
        <StatCard 
          icon={DollarSign} 
          label="Revenue" 
          value={`$${totalRevenue.toFixed(2)}`}
          subtext={`$${event?.price || 0} per ticket`}
          color="green"
        />
        <StatCard 
          icon={TrendingUp} 
          label="Avg Order Value" 
          value={`$${completedOrders.length > 0 ? (totalRevenue / completedOrders.length).toFixed(2) : '0'}`}
          color="purple"
        />
        <StatCard 
          icon={Eye} 
          label="Pending" 
          value={orders.filter(o => o.status === 'pending').length}
          subtext="Incomplete checkouts"
          color="yellow"
        />
      </div>

      {/* Recent Orders */}
      {completedOrders.length > 0 && (
        <div className="bg-dark-800 rounded-lg border border-dark-700 overflow-hidden">
          <div className="px-4 py-3 border-b border-dark-700">
            <h3 className="font-semibold text-white">Recent Orders</h3>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {completedOrders.slice(0, 10).map(order => (
              <div key={order.id} className="px-4 py-3 border-b border-dark-700/50 flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">{order.email}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(order.created_at).toLocaleString('en-AU')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-green-500 font-medium">${parseFloat(order.amount).toFixed(2)}</p>
                  <p className="text-xs text-gray-500">{order.payment_method || 'stripe'}</p>
                </div>
              </div>
            ))}
          </div>
          {completedOrders.length > 10 && (
            <div className="px-4 py-2 bg-dark-900 text-center">
              <p className="text-sm text-gray-500">
                +{completedOrders.length - 10} more orders
              </p>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {completedOrders.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No orders yet for this event</p>
          <p className="text-sm">Share your event link to start selling!</p>
        </div>
      )}
    </div>
  )
}
