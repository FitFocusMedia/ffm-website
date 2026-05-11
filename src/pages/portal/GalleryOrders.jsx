import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { Download, Eye, CheckCircle, Clock, XCircle, RefreshCw, Search, Image, Filter, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react'

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
  const [showFilters, setShowFilters] = useState(false) // Collapsed by default on mobile
  
  // Selected order for detail view
  const [selectedOrder, setSelectedOrder] = useState(null)
  
  // Diagnostic lookup
  const [lookupEmail, setLookupEmail] = useState('')
  const [lookupResult, setLookupResult] = useState(null)
  const [lookupLoading, setLookupLoading] = useState(false)
  const [showLookup, setShowLookup] = useState(false)

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
    
    // Also load free_access orders (from CSV imports) which won't have gallery_order_items
    const { data: freeOrders } = await supabase
      .from('gallery_orders')
      .select(`
        id,
        gallery_id,
        email,
        customer_name,
        total_amount,
        status,
        delivery_type,
        athlete_first_name,
        athlete_last_name,
        athlete_number,
        notes,
        created_at,
        completed_at,
        download_token,
        delivery_email_sent,
        galleries (id, title, slug)
      `)
      .in('delivery_type', ['free_access', 'promo'])
      .order('created_at', { ascending: false })
    
    // Merge free_access/promo orders that aren't already in the main query
    const existingIds = new Set((ordersData || []).map(o => o.id))
    const mergedOrders = [...(ordersData || [])]
    for (const order of (freeOrders || [])) {
      if (!existingIds.has(order.id)) {
        mergedOrders.push(order)
      }
    }
    // Sort by created_at descending
    mergedOrders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    
    setOrders(mergedOrders)
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
  
  function formatDateShort(dateStr) {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('en-AU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const lookupOrderByEmail = async () => {
    if (!lookupEmail.trim()) return
    setLookupLoading(true)
    setLookupResult(null)
    try {
      const response = await fetch(`https://gonalgubgldgpkcekaxe.supabase.co/functions/v1/gallery_download?lookup=${encodeURIComponent(lookupEmail.trim())}`)
      const data = await response.json()
      setLookupResult(data)
    } catch (err) {
      setLookupResult({ error: err.message })
    } finally {
      setLookupLoading(false)
    }
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
  
  const activeFilterCount = [
    filterGallery !== 'all',
    filterStatus !== 'all',
    filterDateFrom,
    filterDateTo,
    searchQuery
  ].filter(Boolean).length

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
    <div className="min-h-screen bg-dark-950 text-white p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header - Mobile Optimized */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
              <Image className="w-6 h-6 md:w-8 md:h-8 text-red-500" />
              Gallery Orders
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              {filteredOrders.length} orders • {formatAmount(totalRevenue)} revenue
            </p>
          </div>
          <button
            onClick={exportCSV}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-dark-800 hover:bg-dark-700 rounded-lg transition-colors text-sm"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span> CSV
          </button>
        </div>

        {/* Filters - Collapsible on Mobile */}
        <div className="bg-dark-900 rounded-xl mb-6 overflow-hidden">
          {/* Filter Toggle Button - Mobile */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="w-full flex items-center justify-between p-4 md:hidden"
          >
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <span className="font-medium">Filters</span>
              {activeFilterCount > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {activeFilterCount}
                </span>
              )}
            </div>
            {showFilters ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
          
          {/* Filter Content - Always visible on desktop */}
          <div className={`p-4 pt-0 md:p-6 ${showFilters ? 'block' : 'hidden md:block'}`}>
            <h2 className="text-lg font-semibold mb-4 hidden md:block">Filters</h2>
            
            {/* Search First on Mobile */}
            <div className="mb-4 md:hidden">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-dark-800 border border-dark-700 rounded-lg pl-10 pr-4 py-2.5 text-white text-sm"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              {/* Gallery Filter */}
              <div>
                <label className="block text-xs md:text-sm text-gray-400 mb-1">Gallery</label>
                <select
                  value={filterGallery}
                  onChange={(e) => setFilterGallery(e.target.value)}
                  className="w-full bg-dark-800 border border-dark-700 rounded-lg px-3 py-2 text-white text-sm"
                >
                  <option value="all">All</option>
                  {galleries.map(g => (
                    <option key={g.id} value={g.id}>{g.title}</option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-xs md:text-sm text-gray-400 mb-1">Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full bg-dark-800 border border-dark-700 rounded-lg px-3 py-2 text-white text-sm"
                >
                  <option value="all">All</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>

              {/* Date From */}
              <div>
                <label className="block text-xs md:text-sm text-gray-400 mb-1">From</label>
                <input
                  type="date"
                  value={filterDateFrom}
                  onChange={(e) => setFilterDateFrom(e.target.value)}
                  className="w-full bg-dark-800 border border-dark-700 rounded-lg px-3 py-2 text-white text-sm"
                />
              </div>

              {/* Date To */}
              <div>
                <label className="block text-xs md:text-sm text-gray-400 mb-1">To</label>
                <input
                  type="date"
                  value={filterDateTo}
                  onChange={(e) => setFilterDateTo(e.target.value)}
                  className="w-full bg-dark-800 border border-dark-700 rounded-lg px-3 py-2 text-white text-sm"
                />
              </div>
            </div>

            {/* Search - Desktop */}
            <div className="mt-4 hidden md:block">
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

            {/* Diagnostic Lookup */}
            <div className="mt-4 border-t border-dark-700 pt-4">
              <button 
                onClick={() => setShowLookup(!showLookup)}
                className="text-sm text-gray-400 hover:text-white flex items-center gap-1 mb-2"
              >
                <AlertCircle className="w-4 h-4" />
                {showLookup ? 'Hide' : 'Show'} Order Lookup (by email)
              </button>
              {showLookup && (
                <div className="flex gap-2 items-start">
                  <input
                    type="email"
                    placeholder="Enter email to diagnose..."
                    value={lookupEmail}
                    onChange={(e) => setLookupEmail(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && lookupOrderByEmail()}
                    className="flex-1 bg-dark-800 border border-dark-700 rounded-lg px-3 py-2 text-white text-sm"
                  />
                  <button
                    onClick={lookupOrderByEmail}
                    disabled={lookupLoading}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
                  >
                    {lookupLoading ? '...' : 'Lookup'}
                  </button>
                </div>
              )}
              {lookupResult && (
                <div className="mt-3 p-3 bg-dark-800 rounded-lg text-sm">
                  {lookupResult.error ? (
                    <p className="text-red-400">{lookupResult.error}</p>
                  ) : lookupResult.orders?.length === 0 ? (
                    <p className="text-yellow-400">⚠️ No orders found for {lookupResult.email}</p>
                  ) : (
                    <div>
                      <p className="text-green-400 mb-2">✅ Found {lookupResult.orders.length} order(s) for {lookupResult.email}</p>
                      {lookupResult.orders.map((o, i) => (
                        <div key={i} className="border-l-2 pl-3 mb-2 last:mb-0"
                          style={{ borderColor: o.status === 'completed' ? '#22c55e' : o.status === 'pending' ? '#eab308' : '#ef4444' }}>
                          <div className="flex items-center gap-2">
                            <span className="text-white font-medium">{o.status}</span>
                            <span className="text-gray-500">•</span>
                            <span className="text-gray-400">{o.delivery_type || 'purchase'}</span>
                          </div>
                          <div className="text-gray-500 text-xs mt-1">
                            Gallery: {o.galleries?.title || 'Unknown'} • Token: {o.download_token ? '✅' : '❌ missing'}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Orders - Card Layout on Mobile, Table on Desktop */}
        <div className="bg-dark-900 rounded-xl overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-dark-800">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Customer</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Gallery</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Items</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Order</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Amount</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-800">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
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
                          {order.delivery_type === 'free_access' ? (
                            <span className="bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded text-xs">
                              Ordered
                            </span>
                          ) : order.is_package ? (
                            <span className="bg-purple-500/20 text-purple-400 px-2 py-1 rounded text-xs">
                              Package
                            </span>
                          ) : (
                            `${order.gallery_order_items?.length || 0} photos`
                          )}
                        </div>
                        {order.notes && (
                          <div className="text-xs text-gray-500 mt-0.5 truncate max-w-[120px]" title={order.notes}>
                            {order.notes}
                          </div>
                        )}
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
          
          {/* Mobile Card Layout */}
          <div className="md:hidden divide-y divide-dark-800">
            {filteredOrders.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500">
                No orders found
              </div>
            ) : (
              filteredOrders.map(order => (
                <div 
                  key={order.id} 
                  className="p-4 active:bg-dark-800/50"
                  onClick={() => setSelectedOrder(order)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-medium">{order.customer_name || 'No name'}</div>
                      <div className="text-sm text-gray-400 truncate max-w-[200px]">{order.email}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-400">{formatAmount(order.total_amount)}</div>
                      <div className="text-xs text-gray-500">{formatDateShort(order.created_at)}</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-400 truncate max-w-[150px]">
                      {order.galleries?.title || 'Unknown Gallery'}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">
                        {order.delivery_type === 'free_access' ? '✓ Ordered' : order.is_package ? 'Package' : `${order.gallery_order_items?.length || 0} photos`}
                      </span>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[order.status]}`}>
                        <StatusIcon status={order.status} />
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Order Detail Modal - Mobile Optimized */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black/70 flex items-end md:items-center justify-center z-50">
            <div className="bg-dark-900 rounded-t-2xl md:rounded-xl w-full md:max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-dark-900 p-4 md:p-6 border-b border-dark-800 z-10">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg md:text-xl font-bold">Order Details</h2>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="text-gray-400 hover:text-white p-2 -mr-2"
                  >
                    ✕
                  </button>
                </div>
              </div>
              
              <div className="p-4 md:p-6 space-y-4 md:space-y-6">
                {/* Customer Info */}
                <div>
                  <h3 className="text-xs md:text-sm font-medium text-gray-400 mb-2">Customer</h3>
                  <div className="bg-dark-800 rounded-lg p-3 md:p-4">
                    <div className="font-medium">{selectedOrder.customer_name || 'No name provided'}</div>
                    <div className="text-gray-400 text-sm break-all">{selectedOrder.email}</div>
                    {selectedOrder.athlete_first_name && (
                      <div className="text-gray-500 text-xs mt-1">
                        Athlete: {selectedOrder.athlete_first_name} {selectedOrder.athlete_last_name || ''}
                        {selectedOrder.athlete_number ? ` #${selectedOrder.athlete_number}` : ''}
                      </div>
                    )}
                  </div>
                </div>

                {/* Order Info - 2 column grid */}
                <div className="grid grid-cols-2 gap-3 md:gap-4">
                  <div>
                    <h3 className="text-xs md:text-sm font-medium text-gray-400 mb-2">Gallery</h3>
                    <div className="bg-dark-800 rounded-lg p-3 md:p-4 text-sm">
                      {selectedOrder.galleries?.title || 'Unknown'}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xs md:text-sm font-medium text-gray-400 mb-2">Amount</h3>
                    <div className="bg-dark-800 rounded-lg p-3 md:p-4 text-green-400 font-bold">
                      {formatAmount(selectedOrder.total_amount)}
                    </div>
                  </div>
                </div>

                {/* Status & Dates */}
                <div className="grid grid-cols-2 gap-3 md:gap-4">
                  <div>
                    <h3 className="text-xs md:text-sm font-medium text-gray-400 mb-2">Status</h3>
                    <div className="bg-dark-800 rounded-lg p-3 md:p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[selectedOrder.status]}`}>
                        <StatusIcon status={selectedOrder.status} />
                        {selectedOrder.status}
                      </span>
                      {selectedOrder.delivery_type === 'free_access' && (
                        <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400">
                          ✓ Ordered
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xs md:text-sm font-medium text-gray-400 mb-2">Date</h3>
                    <div className="bg-dark-800 rounded-lg p-3 md:p-4 text-sm">
                      {formatDateShort(selectedOrder.created_at)}
                      {selectedOrder.completed_at && (
                        <div className="text-xs text-gray-500 mt-1">Completed: {formatDateShort(selectedOrder.completed_at)}</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Notes / Order Details */}
                {selectedOrder.notes && (
                  <div>
                    <h3 className="text-xs md:text-sm font-medium text-gray-400 mb-2">Notes</h3>
                    <div className="bg-dark-800 rounded-lg p-3 md:p-4 text-sm text-gray-300">
                      {selectedOrder.notes}
                    </div>
                  </div>
                )}

                {/* Download Token */}
                <div>
                  <h3 className="text-xs md:text-sm font-medium text-gray-400 mb-2">Download Token</h3>
                  <div className="bg-dark-800 rounded-lg p-3 md:p-4">
                    <code className="text-xs text-yellow-400 break-all">{selectedOrder.download_token}</code>
                    <div className="text-xs text-gray-500 mt-2">
                      Expires: {formatDateShort(selectedOrder.token_expires_at)}
                    </div>
                  </div>
                </div>

                {/* Ordered Items */}
                {selectedOrder.gallery_order_items && selectedOrder.gallery_order_items.length > 0 && (
                  <div>
                    <h3 className="text-xs md:text-sm font-medium text-gray-400 mb-2">
                      Photos ({selectedOrder.gallery_order_items.length})
                    </h3>
                    <div className="bg-dark-800 rounded-lg p-3 md:p-4 space-y-2 max-h-48 overflow-y-auto">
                      {selectedOrder.gallery_order_items.map(item => (
                        <div key={item.id} className="flex items-center justify-between text-sm">
                          <span className="truncate max-w-[120px] md:max-w-none">{item.gallery_photos?.filename || 'Unknown'}</span>
                          <div className="flex items-center gap-2 md:gap-4 text-xs">
                            <span className="text-green-400">{formatAmount(item.price)}</span>
                            <span className={item.downloaded ? 'text-green-400' : 'text-gray-500'}>
                              {item.downloaded ? `✓` : '-'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Stripe Info - Collapsed on mobile */}
                {(selectedOrder.stripe_session_id || selectedOrder.stripe_payment_intent) && (
                  <div>
                    <h3 className="text-xs md:text-sm font-medium text-gray-400 mb-2">Stripe</h3>
                    <div className="bg-dark-800 rounded-lg p-3 md:p-4 text-xs space-y-1 overflow-x-auto">
                      {selectedOrder.stripe_session_id && (
                        <div className="whitespace-nowrap"><span className="text-gray-500">Session:</span> <span className="break-all">{selectedOrder.stripe_session_id}</span></div>
                      )}
                      {selectedOrder.stripe_payment_intent && (
                        <div className="whitespace-nowrap"><span className="text-gray-500">Payment:</span> <span className="break-all">{selectedOrder.stripe_payment_intent}</span></div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Bottom safe area padding for mobile */}
              <div className="h-6 md:hidden" />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
