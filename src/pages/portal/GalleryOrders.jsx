import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { Download, Eye, CheckCircle, Clock, XCircle, RefreshCw, Search, Image } from 'lucide-react'

export default function GalleryOrders() {
  const [orders, setOrders] = useState([])
  const [galleries, setGalleries] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Filters
  const [filterGallery, setFilterGallery] = useState('all')
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
    
    // Load galleries for filter dropdown
    const { data: galleriesData } = await supabase
      .from('galleries')
      .select('id, title, slug')
      .order('created_at', { ascending: false })
    setGalleries(galleriesData || [])

    // Load orders with gallery info and order items
    const { data: ordersData } = await supabase
      .from('gallery_orders')
      .select(`
        *,
        galleries (id, title, slug),
        gallery_order_items (
          id,
          price,
          downloaded,
          download_count,
          gallery_photos (id, filename, thumbnail_path)
        )
      `)
      .order('created_at', { ascending: false })
    
    setOrders(ordersData || [])
    setLoading(false)
  }

  function getGalleryTitle(galleryId) {
    return galleries.find(g => g.id === galleryId)?.title || 'Unknown Gallery'
  }

  function formatAmount(cents) {
    return `$${(cents / 100).toFixed(2)}`
  }

  function formatDate(dateStr) {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleString('en-AU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const filteredOrders = orders.filter(order => {
    // Gallery filter
    if (filterGallery !== 'all' && order.gallery_id !== filterGallery) return false
    
    // Status filter
    if (filterStatus !== 'all' && order.status !== filterStatus) return false
    
    // Date range filter
    if (filterDateFrom && new Date(order.created_at) < new Date(filterDateFrom)) return false
    if (filterDateTo && new Date(order.created_at) > new Date(filterDateTo + 'T23:59:59')) return false
    
    // Search query (name, email)
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      const matchesName = order.customer_name?.toLowerCase().includes(q)
      const matchesEmail = order.email?.toLowerCase().includes(q)
      if (!matchesName && !matchesEmail) return false
    }
    
    return true
  })

  const totalRevenue = filteredOrders
    .filter(o => o.status === 'completed')
    .reduce((sum, o) => sum + (o.total_amount || 0), 0)

  const statusColors = {
    pending: 'bg-yellow-500/20 text-yellow-400',
    completed: 'bg-green-500/20 text-green-400',
    failed: 'bg-red-500/20 text-red-400',
    refunded: 'bg-gray-500/20 text-gray-400'
  }

  const StatusIcon = ({ status }) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />
      case 'pending': return <Clock className="w-4 h-4" />
      case 'failed': return <XCircle className="w-4 h-4" />
      case 'refunded': return <RefreshCw className="w-4 h-4" />
      default: return null
    }
  }

  function exportCSV() {
    const headers = ['Date', 'Customer', 'Email', 'Gallery', 'Items', 'Amount', 'Status', 'Download Token']
    const rows = filteredOrders.map(order => [
      formatDate(order.created_at),
      order.customer_name || '-',
      order.email,
      order.galleries?.title || getGalleryTitle(order.gallery_id),
      order.is_package ? 'Full Package' : `${order.gallery_order_items?.length || 0} photos`,
      formatAmount(order.total_amount),
      order.status,
      order.download_token
    ])
    
    const csvContent = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `gallery-orders-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Image className="w-8 h-8 text-red-500" />
              Gallery Orders
            </h1>
            <p className="text-gray-400 mt-1">
              {filteredOrders.length} orders • {formatAmount(totalRevenue)} AUD revenue
            </p>
          </div>
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-dark-800 hover:bg-dark-700 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>

        {/* Filters */}
        <div className="bg-dark-900 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Gallery Filter */}
            <div>
              <label className="block text-sm text-gray-400 mb-1">Gallery</label>
              <select
                value={filterGallery}
                onChange={(e) => setFilterGallery(e.target.value)}
                className="w-full bg-dark-800 border border-dark-700 rounded-lg px-3 py-2 text-white"
              >
                <option value="all">All Galleries</option>
                {galleries.map(g => (
                  <option key={g.id} value={g.id}>{g.title}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm text-gray-400 mb-1">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full bg-dark-800 border border-dark-700 rounded-lg px-3 py-2 text-white"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
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
                className="w-full bg-dark-800 border border-dark-700 rounded-lg px-3 py-2 text-white"
              />
            </div>

            {/* Date To */}
            <div>
              <label className="block text-sm text-gray-400 mb-1">To Date</label>
              <input
                type="date"
                value={filterDateTo}
                onChange={(e) => setFilterDateTo(e.target.value)}
                className="w-full bg-dark-800 border border-dark-700 rounded-lg px-3 py-2 text-white"
              />
            </div>
          </div>

          {/* Search */}
          <div className="mt-4">
            <label className="block text-sm text-gray-400 mb-1">Search (Name, Email)</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-dark-800 border border-dark-700 rounded-lg pl-10 pr-4 py-2 text-white"
              />
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-dark-900 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-dark-800">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Date</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Customer</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Gallery</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Items</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Amount</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-800">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                    No orders found
                  </td>
                </tr>
              ) : (
                filteredOrders.map(order => (
                  <tr key={order.id} className="hover:bg-dark-800/50 transition-colors">
                    <td className="px-4 py-4">
                      <div className="text-sm">{formatDate(order.created_at).split(',')[0]}</div>
                      <div className="text-xs text-gray-500">{formatDate(order.created_at).split(',')[1]}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-medium">{order.customer_name || '-'}</div>
                      <div className="text-sm text-gray-400">{order.email}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm">{order.galleries?.title || getGalleryTitle(order.gallery_id)}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm">
                        {order.is_package ? (
                          <span className="bg-purple-500/20 text-purple-400 px-2 py-1 rounded text-xs">
                            Full Package
                          </span>
                        ) : (
                          `${order.gallery_order_items?.length || 0} photos`
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-semibold text-green-400">{formatAmount(order.total_amount)}</div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[order.status]}`}>
                        <StatusIcon status={order.status} />
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="text-blue-400 hover:text-blue-300 text-sm"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Order Detail Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
            <div className="bg-dark-900 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-dark-800">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold">Order Details</h2>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="text-gray-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Customer Info */}
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-2">Customer</h3>
                  <div className="bg-dark-800 rounded-lg p-4">
                    <div className="font-medium">{selectedOrder.customer_name || 'No name provided'}</div>
                    <div className="text-gray-400">{selectedOrder.email}</div>
                  </div>
                </div>

                {/* Order Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-2">Gallery</h3>
                    <div className="bg-dark-800 rounded-lg p-4">
                      {selectedOrder.galleries?.title || 'Unknown'}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-2">Amount</h3>
                    <div className="bg-dark-800 rounded-lg p-4 text-green-400 font-bold">
                      {formatAmount(selectedOrder.total_amount)}
                    </div>
                  </div>
                </div>

                {/* Status & Dates */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-2">Status</h3>
                    <div className="bg-dark-800 rounded-lg p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[selectedOrder.status]}`}>
                        <StatusIcon status={selectedOrder.status} />
                        {selectedOrder.status}
                      </span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-2">Order Date</h3>
                    <div className="bg-dark-800 rounded-lg p-4">
                      {formatDate(selectedOrder.created_at)}
                    </div>
                  </div>
                </div>

                {/* Download Token */}
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-2">Download Token</h3>
                  <div className="bg-dark-800 rounded-lg p-4">
                    <code className="text-xs text-yellow-400 break-all">{selectedOrder.download_token}</code>
                    <div className="text-xs text-gray-500 mt-2">
                      Expires: {formatDate(selectedOrder.token_expires_at)}
                    </div>
                  </div>
                </div>

                {/* Ordered Items */}
                {selectedOrder.gallery_order_items && selectedOrder.gallery_order_items.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-2">
                      Ordered Photos ({selectedOrder.gallery_order_items.length})
                    </h3>
                    <div className="bg-dark-800 rounded-lg p-4 space-y-2">
                      {selectedOrder.gallery_order_items.map(item => (
                        <div key={item.id} className="flex items-center justify-between text-sm">
                          <span>{item.gallery_photos?.filename || 'Unknown photo'}</span>
                          <div className="flex items-center gap-4">
                            <span className="text-green-400">{formatAmount(item.price)}</span>
                            <span className={item.downloaded ? 'text-green-400' : 'text-gray-500'}>
                              {item.downloaded ? `Downloaded (${item.download_count}x)` : 'Not downloaded'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Stripe Info */}
                {(selectedOrder.stripe_session_id || selectedOrder.stripe_payment_intent) && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-2">Stripe</h3>
                    <div className="bg-dark-800 rounded-lg p-4 text-xs space-y-1">
                      {selectedOrder.stripe_session_id && (
                        <div><span className="text-gray-500">Session:</span> {selectedOrder.stripe_session_id}</div>
                      )}
                      {selectedOrder.stripe_payment_intent && (
                        <div><span className="text-gray-500">Payment Intent:</span> {selectedOrder.stripe_payment_intent}</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
