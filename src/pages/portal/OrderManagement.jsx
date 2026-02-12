import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { Link } from 'react-router-dom'

export default function OrderManagement() {
  const [orders, setOrders] = useState([])
  const [organizations, setOrganizations] = useState([])
  const [events, setEvents] = useState([])
  const [packages, setPackages] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Filters
  const [filterOrg, setFilterOrg] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterDateFrom, setFilterDateFrom] = useState('')
  const [filterDateTo, setFilterDateTo] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  
  // Selected order for detail view
  const [selectedOrder, setSelectedOrder] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    
    // Load organizations
    const { data: orgsData } = await supabase
      .from('organizations')
      .select('*')
      .order('name')
    setOrganizations(orgsData || [])

    // Load events
    const { data: eventsData } = await supabase
      .from('events')
      .select('*')
      .order('date', { ascending: false })
    setEvents(eventsData || [])

    // Load packages
    const { data: packagesData } = await supabase
      .from('packages')
      .select('*')
      .order('name')
    setPackages(packagesData || [])

    // Load orders with all details
    const { data: ordersData } = await supabase
      .from('content_orders')
      .select('*')
      .order('created_at', { ascending: false })
    
    setOrders(ordersData || [])
    setLoading(false)
  }

  async function markAsDelivered(orderId) {
    const { error } = await supabase
      .from('content_orders')
      .update({ 
        status: 'delivered',
        delivered_at: new Date().toISOString()
      })
      .eq('id', orderId)

    if (!error) {
      loadData() // Reload to show updated status
    } else {
      alert('Failed to update order status')
    }
  }

  function getOrgName(orgId) {
    return organizations.find(o => o.id === orgId)?.name || 'Unknown'
  }

  function getEventName(eventId) {
    return events.find(e => e.id === eventId)?.name || 'Unknown'
  }

  function getPackageName(pkgId) {
    return packages.find(p => p.id === pkgId)?.name || 'Unknown'
  }

  const filteredOrders = orders.filter(order => {
    // Organization filter
    if (filterOrg !== 'all' && order.organization_id !== filterOrg) return false
    
    // Status filter
    if (filterStatus !== 'all' && order.status !== filterStatus) return false
    
    // Date range filter
    if (filterDateFrom && new Date(order.created_at) < new Date(filterDateFrom)) return false
    if (filterDateTo && new Date(order.created_at) > new Date(filterDateTo + 'T23:59:59')) return false
    
    // Search query (name, email, phone)
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      const fullName = `${order.first_name} ${order.last_name}`.toLowerCase()
      const email = order.email?.toLowerCase() || ''
      const phone = order.phone?.toLowerCase() || ''
      
      if (!fullName.includes(q) && !email.includes(q) && !phone.includes(q)) return false
    }
    
    return true
  })

  const totalRevenue = filteredOrders
    .filter(o => o.status === 'paid' || o.status === 'delivered')
    .reduce((sum, o) => sum + (parseFloat(o.amount) || 0), 0)

  function exportCSV() {
    const headers = ['Date', 'Customer', 'Email', 'Phone', 'Organization', 'Event', 'Package', 'Amount', 'Status']
    const rows = filteredOrders.map(o => [
      new Date(o.created_at).toLocaleDateString(),
      `${o.first_name} ${o.last_name}`,
      o.email,
      o.phone || '',
      getOrgName(o.organization_id),
      getEventName(o.event_id),
      getPackageName(o.package_id),
      o.amount,
      o.status
    ])
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-gray-400">Loading orders...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Order Management</h1>
            <p className="text-gray-400 mt-1">{filteredOrders.length} orders • ${totalRevenue.toFixed(2)} AUD revenue</p>
          </div>
          <button
            onClick={exportCSV}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 flex items-center gap-2"
          >
            <span>📥</span>
            Export CSV
          </button>
        </div>

        {/* Filters */}
        <div className="bg-gray-900 rounded-lg p-6 mb-6 border border-gray-800">
          <h2 className="text-lg font-semibold mb-4">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Organization */}
            <div>
              <label className="block text-sm text-gray-400 mb-1">Organization</label>
              <select
                value={filterOrg}
                onChange={(e) => setFilterOrg(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg"
              >
                <option value="all">All Organizations</option>
                {organizations.map(org => (
                  <option key={org.id} value={org.id}>{org.name}</option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm text-gray-400 mb-1">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="processing">Processing</option>
                <option value="delivered">Delivered</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>

            {/* Date From */}
            <div>
              <label className="block text-sm text-gray-400 mb-1">From Date</label>
              <input
                type="date"
                value={filterDateFrom}
                onChange={(e) => setFilterDateFrom(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg"
              />
            </div>

            {/* Date To */}
            <div>
              <label className="block text-sm text-gray-400 mb-1">To Date</label>
              <input
                type="date"
                value={filterDateTo}
                onChange={(e) => setFilterDateTo(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg"
              />
            </div>
          </div>

          {/* Search */}
          <div className="mt-4">
            <label className="block text-sm text-gray-400 mb-1">Search (Name, Email, Phone)</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search orders..."
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg"
            />
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-gray-900 rounded-lg overflow-hidden border border-gray-800">
          <table className="w-full">
            <thead className="bg-gray-800">
              <tr>
                <th className="text-left p-4 text-sm font-semibold">Date</th>
                <th className="text-left p-4 text-sm font-semibold">Customer</th>
                <th className="text-left p-4 text-sm font-semibold">Organization</th>
                <th className="text-left p-4 text-sm font-semibold">Event</th>
                <th className="text-left p-4 text-sm font-semibold">Package</th>
                <th className="text-right p-4 text-sm font-semibold">Amount</th>
                <th className="text-center p-4 text-sm font-semibold">Status</th>
                <th className="text-center p-4 text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center p-8 text-gray-500">
                    No orders found
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="border-t border-gray-800 hover:bg-gray-800/50">
                    <td className="p-4 text-sm">
                      {new Date(order.created_at).toLocaleDateString()}
                      <div className="text-xs text-gray-500">
                        {new Date(order.created_at).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium">{order.first_name} {order.last_name}</div>
                      <div className="text-sm text-gray-400">{order.email}</div>
                      {order.phone && <div className="text-xs text-gray-500">{order.phone}</div>}
                    </td>
                    <td className="p-4 text-sm">{getOrgName(order.organization_id)}</td>
                    <td className="p-4 text-sm">{getEventName(order.event_id)}</td>
                    <td className="p-4 text-sm">{getPackageName(order.package_id)}</td>
                    <td className="p-4 text-right font-semibold">${order.amount}</td>
                    <td className="p-4 text-center">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        order.status === 'delivered' ? 'bg-green-500/20 text-green-400' :
                        order.status === 'paid' ? 'bg-blue-500/20 text-blue-400' :
                        order.status === 'processing' ? 'bg-yellow-500/20 text-yellow-400' :
                        order.status === 'refunded' ? 'bg-red-500/20 text-red-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="text-blue-400 hover:text-blue-300 text-sm mr-3"
                      >
                        View
                      </button>
                      {order.status === 'paid' && (
                        <button
                          onClick={() => markAsDelivered(order.id)}
                          className="text-green-400 hover:text-green-300 text-sm"
                        >
                          Mark Delivered
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setSelectedOrder(null)}>
          <div className="bg-gray-900 rounded-lg max-w-2xl w-full p-6 border border-gray-800" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Order Details</h2>
              <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-white">
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Customer Info */}
              <div className="bg-gray-800/50 rounded-lg p-4">
                <h3 className="font-semibold mb-3 text-red-500">Customer Information</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-400">Name:</span>
                    <div className="font-medium">{selectedOrder.first_name} {selectedOrder.last_name}</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Email:</span>
                    <div className="font-medium">{selectedOrder.email}</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Phone:</span>
                    <div className="font-medium">{selectedOrder.phone || 'N/A'}</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Instagram:</span>
                    <div className="font-medium">@{selectedOrder.instagram || 'N/A'}</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Division:</span>
                    <div className="font-medium">{selectedOrder.division || 'N/A'}</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Coach:</span>
                    <div className="font-medium">{selectedOrder.coach_name || 'N/A'} (@{selectedOrder.coach_instagram || 'N/A'})</div>
                  </div>
                </div>
              </div>

              {/* Order Info */}
              <div className="bg-gray-800/50 rounded-lg p-4">
                <h3 className="font-semibold mb-3 text-red-500">Order Information</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-400">Organization:</span>
                    <div className="font-medium">{getOrgName(selectedOrder.organization_id)}</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Event:</span>
                    <div className="font-medium">{getEventName(selectedOrder.event_id)}</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Package:</span>
                    <div className="font-medium">{getPackageName(selectedOrder.package_id)}</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Amount:</span>
                    <div className="font-medium text-lg">${selectedOrder.amount} {selectedOrder.currency}</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Status:</span>
                    <div className="font-medium">{selectedOrder.status}</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Order Date:</span>
                    <div className="font-medium">{new Date(selectedOrder.created_at).toLocaleString()}</div>
                  </div>
                  {selectedOrder.paid_at && (
                    <div>
                      <span className="text-gray-400">Paid At:</span>
                      <div className="font-medium">{new Date(selectedOrder.paid_at).toLocaleString()}</div>
                    </div>
                  )}
                  {selectedOrder.delivered_at && (
                    <div>
                      <span className="text-gray-400">Delivered At:</span>
                      <div className="font-medium">{new Date(selectedOrder.delivered_at).toLocaleString()}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Info */}
              <div className="bg-gray-800/50 rounded-lg p-4">
                <h3 className="font-semibold mb-3 text-red-500">Payment Information</h3>
                <div className="text-sm space-y-2">
                  <div>
                    <span className="text-gray-400">Stripe Session ID:</span>
                    <div className="font-mono text-xs break-all">{selectedOrder.stripe_session_id}</div>
                  </div>
                  {selectedOrder.stripe_payment_id && (
                    <div>
                      <span className="text-gray-400">Payment Intent ID:</span>
                      <div className="font-mono text-xs break-all">{selectedOrder.stripe_payment_id}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                {selectedOrder.status === 'paid' && (
                  <button
                    onClick={() => {
                      markAsDelivered(selectedOrder.id)
                      setSelectedOrder(null)
                    }}
                    className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-medium"
                  >
                    Mark as Delivered
                  </button>
                )}
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
