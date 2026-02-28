import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { Search, Users, MapPin, Clock, Check, Camera, RefreshCw, Upload, Download, Filter, AlertCircle, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react'

export default function AthleteTracker() {
  const [orders, setOrders] = useState([])
  const [athletes, setAthletes] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterMat, setFilterMat] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('priority')
  const [importData, setImportData] = useState('')
  const [showImport, setShowImport] = useState(false)
  const [eventInfo, setEventInfo] = useState({
    name: 'South East QLD Championship 2026',
    date: 'March 1, 2026',
    athletes: 674,
    smoothcompUrl: 'https://afbjj.smoothcomp.com/en/event/28136'
  })

  // Load data from localStorage and Supabase
  useEffect(() => {
    const savedAthletes = localStorage.getItem('athlete-tracker-athletes')
    if (savedAthletes) setAthletes(JSON.parse(savedAthletes))
    fetchOrders()
  }, [])

  // Save athletes to localStorage when data changes
  useEffect(() => {
    if (athletes.length > 0) {
      localStorage.setItem('athlete-tracker-athletes', JSON.stringify(athletes))
    }
  }, [athletes])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('photo_orders')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching orders:', error)
        setOrders([])
      } else {
        setOrders(data || [])
      }
    } catch (err) {
      console.error('Fetch error:', err)
      setOrders([])
    }
    setLoading(false)
  }

  // Parse Smoothcomp data from pasted text
  const parseImportData = () => {
    if (!importData.trim()) return

    const lines = importData.split('\n').filter(l => l.trim())
    const newAthletes = []

    lines.forEach((line, index) => {
      const parts = line.split('|').map(p => p.trim())
      if (parts.length >= 1 && parts[0]) {
        const athlete = {
          id: Date.now() + index,
          name: parts[0],
          division: parts[1] || '',
          mat: parts[2] || 'TBD',
          time: parts[3] || 'TBD',
          academy: parts[4] || '',
          captured: false
        }
        newAthletes.push(athlete)
      }
    })

    setAthletes(prev => [...prev, ...newAthletes])
    setImportData('')
    setShowImport(false)
    alert(`Imported ${newAthletes.length} athletes!`)
  }

  // Match orders to athletes
  const getMatchedData = () => {
    return athletes.map(athlete => {
      const matchingOrder = orders.find(order => 
        order.athlete_name?.toLowerCase().includes(athlete.name.toLowerCase()) ||
        athlete.name.toLowerCase().includes(order.athlete_name?.toLowerCase() || '')
      )
      return {
        ...athlete,
        hasOrder: !!matchingOrder,
        order: matchingOrder
      }
    })
  }

  // Filter athletes
  const getFilteredAthletes = () => {
    let filtered = getMatchedData()

    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      filtered = filtered.filter(a => 
        a.name.toLowerCase().includes(search) ||
        a.division?.toLowerCase().includes(search) ||
        a.academy?.toLowerCase().includes(search)
      )
    }

    if (filterMat !== 'all') {
      filtered = filtered.filter(a => a.mat === filterMat)
    }

    if (filterStatus === 'ordered') {
      filtered = filtered.filter(a => a.hasOrder)
    } else if (filterStatus === 'captured') {
      filtered = filtered.filter(a => a.captured)
    } else if (filterStatus === 'pending') {
      filtered = filtered.filter(a => a.hasOrder && !a.captured)
    }

    return filtered
  }

  // Toggle captured
  const toggleCaptured = (athleteId) => {
    setAthletes(prev => prev.map(a => 
      a.id === athleteId ? { ...a, captured: !a.captured } : a
    ))
  }

  // Stats
  const stats = {
    totalAthletes: athletes.length,
    totalOrders: orders.length,
    orderedAthletes: getMatchedData().filter(a => a.hasOrder).length,
    capturedCount: athletes.filter(a => a.captured).length,
    pendingCapture: getMatchedData().filter(a => a.hasOrder && !a.captured).length
  }

  // Unique mats
  const mats = [...new Set(athletes.map(a => a.mat).filter(m => m && m !== 'TBD'))]

  // Timeline data
  const getTimelineData = () => {
    const orderedAthletes = getMatchedData().filter(a => a.hasOrder)
    const grouped = {}
    
    orderedAthletes.forEach(a => {
      const time = a.time || 'Unscheduled'
      if (!grouped[time]) grouped[time] = []
      grouped[time].push(a)
    })

    return Object.entries(grouped).sort((a, b) => {
      if (a[0] === 'Unscheduled') return 1
      if (b[0] === 'Unscheduled') return -1
      return a[0].localeCompare(b[0])
    })
  }

  return (
    <div className="min-h-screen bg-dark-950 text-white p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
              <Camera className="w-6 h-6 md:w-8 md:h-8 text-red-500" />
              Athlete Tracker
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              {eventInfo.name} • {eventInfo.date}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <a 
              href={eventInfo.smoothcompUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 bg-dark-800 hover:bg-dark-700 rounded-lg text-sm transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Smoothcomp
            </a>
            <button 
              onClick={fetchOrders}
              className="flex items-center gap-2 px-3 py-2 bg-dark-800 hover:bg-dark-700 rounded-lg text-sm transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <button 
              onClick={() => setShowImport(!showImport)}
              className="flex items-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm transition-colors"
            >
              <Upload className="w-4 h-4" />
              Import
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-dark-900 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-gray-400" />
              <div>
                <div className="text-2xl font-bold">{stats.totalAthletes}</div>
                <div className="text-xs text-gray-500">Athletes</div>
              </div>
            </div>
          </div>
          <div className="bg-dark-900 rounded-xl p-4 border border-green-500/30">
            <div className="flex items-center gap-3">
              <Camera className="w-5 h-5 text-green-400" />
              <div>
                <div className="text-2xl font-bold text-green-400">{stats.totalOrders}</div>
                <div className="text-xs text-gray-500">Orders</div>
              </div>
            </div>
          </div>
          <div className="bg-dark-900 rounded-xl p-4 border border-yellow-500/30">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-400" />
              <div>
                <div className="text-2xl font-bold text-yellow-400">{stats.pendingCapture}</div>
                <div className="text-xs text-gray-500">To Capture</div>
              </div>
            </div>
          </div>
          <div className="bg-dark-900 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <Check className="w-5 h-5 text-gray-400" />
              <div>
                <div className="text-2xl font-bold">{stats.capturedCount}</div>
                <div className="text-xs text-gray-500">Captured</div>
              </div>
            </div>
          </div>
        </div>

        {/* Import Section - Collapsible */}
        {showImport && (
          <div className="bg-dark-900 rounded-xl p-4 md:p-6 mb-6">
            <h2 className="text-lg font-semibold mb-3">Import Athlete Data</h2>
            <p className="text-gray-400 text-sm mb-3">
              Paste athlete data. Format: <code className="bg-dark-800 px-2 py-0.5 rounded">Name | Division | Mat | Time | Academy</code>
            </p>
            <textarea
              value={importData}
              onChange={(e) => setImportData(e.target.value)}
              placeholder={`Tex Williams | Boys Gi / White | Mat 1 | 9:30 AM | Southside BJJ
Enzo Jundam | Boys Gi / White | Mat 1 | 9:45 AM | Alliance`}
              className="w-full bg-dark-800 border border-dark-700 rounded-lg p-3 text-sm font-mono h-32 md:h-48 resize-none"
            />
            <div className="flex gap-2 mt-3">
              <button 
                onClick={parseImportData}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm transition-colors"
              >
                <Upload className="w-4 h-4" />
                Import Athletes
              </button>
              <button 
                onClick={() => {
                  if (confirm('Clear all athlete data?')) {
                    setAthletes([])
                    localStorage.removeItem('athlete-tracker-athletes')
                  }
                }}
                className="px-4 py-2 bg-dark-700 hover:bg-dark-600 rounded-lg text-sm transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 mb-4 overflow-x-auto pb-2">
          {['priority', 'all', 'timeline', 'orders'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab 
                  ? 'bg-red-600 text-white' 
                  : 'bg-dark-800 text-gray-400 hover:bg-dark-700'
              }`}
            >
              {tab === 'priority' && `🎯 Priority (${stats.pendingCapture})`}
              {tab === 'all' && `All (${stats.totalAthletes})`}
              {tab === 'timeline' && '📅 Timeline'}
              {tab === 'orders' && `Orders (${stats.totalOrders})`}
            </button>
          ))}
        </div>

        {/* Priority Tab */}
        {activeTab === 'priority' && (
          <div>
            {stats.pendingCapture === 0 ? (
              <div className="bg-dark-900 rounded-xl p-8 text-center">
                <Check className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <h3 className="text-lg font-semibold mb-2">All caught up!</h3>
                <p className="text-gray-400">No athletes pending capture.</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {getMatchedData().filter(a => a.hasOrder && !a.captured).map(athlete => (
                  <div key={athlete.id} className="bg-dark-900 rounded-xl p-4 border-l-4 border-yellow-500">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg truncate">{athlete.name}</h3>
                        <p className="text-gray-400 text-sm truncate">{athlete.division}</p>
                        <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" /> {athlete.mat}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" /> {athlete.time}
                          </span>
                          {athlete.order && (
                            <span className="text-green-400 font-medium">
                              💰 ${athlete.order.amount} {athlete.order.package}
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => toggleCaptured(athlete.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-medium transition-colors shrink-0"
                      >
                        <Camera className="w-4 h-4" />
                        <span className="hidden sm:inline">Captured</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* All Athletes Tab */}
        {activeTab === 'all' && (
          <div>
            {/* Filters */}
            <div className="flex flex-wrap gap-3 mb-4">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search athlete, division..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-dark-800 border border-dark-700 rounded-lg pl-10 pr-4 py-2 text-sm"
                />
              </div>
              <select 
                value={filterMat} 
                onChange={(e) => setFilterMat(e.target.value)}
                className="bg-dark-800 border border-dark-700 rounded-lg px-3 py-2 text-sm"
              >
                <option value="all">All Mats</option>
                {mats.map(mat => (
                  <option key={mat} value={mat}>{mat}</option>
                ))}
              </select>
              <select 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-dark-800 border border-dark-700 rounded-lg px-3 py-2 text-sm"
              >
                <option value="all">All</option>
                <option value="ordered">With Orders</option>
                <option value="pending">Pending</option>
                <option value="captured">Captured</option>
              </select>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-2">
              {getFilteredAthletes().length === 0 ? (
                <div className="bg-dark-900 rounded-xl p-8 text-center text-gray-500">
                  {athletes.length === 0 ? 'No athletes imported yet. Click Import to add.' : 'No athletes match filters.'}
                </div>
              ) : (
                getFilteredAthletes().map(athlete => (
                  <div 
                    key={athlete.id} 
                    className={`bg-dark-900 rounded-lg p-3 ${athlete.hasOrder ? 'border-l-4 border-green-500' : ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{athlete.name}</div>
                        <div className="text-xs text-gray-500 flex gap-2">
                          <span>{athlete.mat}</span>
                          <span>{athlete.time}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {athlete.hasOrder && (
                          <span className="text-green-400 text-xs">${athlete.order?.amount}</span>
                        )}
                        {athlete.hasOrder && (
                          <button
                            onClick={() => toggleCaptured(athlete.id)}
                            className={`p-2 rounded-full ${athlete.captured ? 'bg-green-600' : 'bg-dark-700'}`}
                          >
                            {athlete.captured ? <Check className="w-4 h-4" /> : <Camera className="w-4 h-4" />}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block bg-dark-900 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-dark-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Athlete</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Division</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Mat</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Time</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Order</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-800">
                  {getFilteredAthletes().length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                        {athletes.length === 0 ? 'No athletes imported. Click Import to add.' : 'No athletes match filters.'}
                      </td>
                    </tr>
                  ) : (
                    getFilteredAthletes().map(athlete => (
                      <tr key={athlete.id} className={athlete.hasOrder ? 'bg-green-500/5' : ''}>
                        <td className="px-4 py-3 font-medium">{athlete.name}</td>
                        <td className="px-4 py-3 text-sm text-gray-400 max-w-[200px] truncate">{athlete.division}</td>
                        <td className="px-4 py-3 text-sm">{athlete.mat}</td>
                        <td className="px-4 py-3 text-sm">{athlete.time}</td>
                        <td className="px-4 py-3">
                          {athlete.hasOrder ? (
                            <span className="text-green-400 text-sm font-medium">
                              ${athlete.order?.amount}
                            </span>
                          ) : (
                            <span className="text-gray-600">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {athlete.captured ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">
                              <Check className="w-3 h-3" /> Done
                            </span>
                          ) : athlete.hasOrder ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs">
                              <Clock className="w-3 h-3" /> Pending
                            </span>
                          ) : (
                            <span className="text-gray-600 text-xs">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {athlete.hasOrder && (
                            <button
                              onClick={() => toggleCaptured(athlete.id)}
                              className={`px-3 py-1 rounded text-xs font-medium ${
                                athlete.captured 
                                  ? 'bg-gray-700 hover:bg-gray-600' 
                                  : 'bg-green-600 hover:bg-green-700'
                              }`}
                            >
                              {athlete.captured ? 'Undo' : 'Capture'}
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
        )}

        {/* Timeline Tab */}
        {activeTab === 'timeline' && (
          <div>
            {getTimelineData().length === 0 ? (
              <div className="bg-dark-900 rounded-xl p-8 text-center text-gray-500">
                No ordered athletes with scheduled times yet.
              </div>
            ) : (
              <div className="space-y-4">
                {getTimelineData().map(([time, timeAthletes]) => (
                  <div key={time} className="bg-dark-900 rounded-xl overflow-hidden">
                    <div className="bg-dark-800 px-4 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="font-semibold">{time}</span>
                      </div>
                      <span className="text-sm text-gray-500">{timeAthletes.length} athletes</span>
                    </div>
                    <div className="divide-y divide-dark-800">
                      {timeAthletes.map(athlete => (
                        <div key={athlete.id} className="px-4 py-3 flex items-center justify-between">
                          <div>
                            <div className="font-medium">{athlete.name}</div>
                            <div className="text-sm text-gray-500">{athlete.mat} • {athlete.division}</div>
                          </div>
                          <button
                            onClick={() => toggleCaptured(athlete.id)}
                            className={`p-2 rounded-full ${
                              athlete.captured ? 'bg-green-600' : 'bg-dark-700 hover:bg-dark-600'
                            }`}
                          >
                            {athlete.captured ? <Check className="w-4 h-4" /> : <Camera className="w-4 h-4" />}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="bg-dark-900 rounded-xl overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-500 mx-auto"></div>
              </div>
            ) : orders.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No photo pack orders yet. Orders will appear here once customers purchase.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-dark-800">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Athlete</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Email</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Package</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Amount</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dark-800">
                    {orders.map(order => (
                      <tr key={order.id}>
                        <td className="px-4 py-3 font-medium">{order.athlete_name}</td>
                        <td className="px-4 py-3 text-sm text-gray-400">{order.email}</td>
                        <td className="px-4 py-3 text-sm">{order.package}</td>
                        <td className="px-4 py-3 text-green-400 font-medium">${order.amount}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {new Date(order.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
