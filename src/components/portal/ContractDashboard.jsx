import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getContracts } from '../../lib/supabase'
import { getStatusIcon, getStatusBadgeClass } from '../../lib/contractHelpers'

export default function ContractDashboard() {
  const [contracts, setContracts] = useState([])
  const [filteredContracts, setFilteredContracts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [sortBy, setSortBy] = useState('created_desc')
  const [stats, setStats] = useState({ total: 0, signedThisMonth: 0, pending: 0, value: 0 })
  const navigate = useNavigate()

  useEffect(() => {
    loadContracts()
  }, [])

  useEffect(() => {
    filterAndSortContracts()
  }, [contracts, searchTerm, statusFilter, sortBy])

  const loadContracts = async () => {
    try {
      const data = await getContracts()
      setContracts(data)
      calculateStats(data)
    } catch (error) {
      console.error('Error loading contracts:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (allContracts) => {
    const now = new Date()
    const thisMonthSigned = allContracts.filter(c => {
      if (c.status !== 'signed') return false
      const created = new Date(c.created_at)
      return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear()
    })

    const pending = allContracts.filter(c => c.status === 'sent' || c.status === 'viewed')

    // Calculate rough value estimate
    const totalValue = allContracts.reduce((sum, c) => {
      const vipPrice = c.contract_data?.vip_price || 0
      const athletes = c.contract_data?.expected_athletes || 0
      return sum + (vipPrice * athletes * 0.3)
    }, 0)

    setStats({
      total: allContracts.length,
      signedThisMonth: thisMonthSigned.length,
      pending: pending.length,
      value: Math.round(totalValue)
    })
  }

  const filterAndSortContracts = () => {
    let filtered = [...contracts]

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(c =>
        (c.org_name || '').toLowerCase().includes(term) ||
        (c.promoter_name || '').toLowerCase().includes(term) ||
        (c.promoter_email || '').toLowerCase().includes(term)
      )
    }

    // Status filter
    if (statusFilter) {
      filtered = filtered.filter(c => c.status === statusFilter)
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'created_asc':
          return new Date(a.created_at) - new Date(b.created_at)
        case 'created_desc':
          return new Date(b.created_at) - new Date(a.created_at)
        case 'org_name':
          return (a.org_name || '').localeCompare(b.org_name || '')
        case 'status':
          return (a.status || '').localeCompare(b.status || '')
        default:
          return 0
      }
    })

    setFilteredContracts(filtered)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white text-xl">Loading contracts...</div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white">Contract Dashboard</h1>
        <button
          onClick={() => navigate('/portal/contracts/new')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          + New Contract
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-dark-900 rounded-lg p-6 border border-gray-800">
          <div className="text-gray-400 text-sm mb-2">Total Contracts</div>
          <div className="text-3xl font-bold text-white">{stats.total}</div>
        </div>

        <div className="bg-dark-900 rounded-lg p-6 border border-gray-800">
          <div className="text-gray-400 text-sm mb-2">Signed This Month</div>
          <div className="text-3xl font-bold text-green-500">{stats.signedThisMonth}</div>
        </div>

        <div className="bg-dark-900 rounded-lg p-6 border border-gray-800">
          <div className="text-gray-400 text-sm mb-2">Pending Signature</div>
          <div className="text-3xl font-bold text-yellow-500">{stats.pending}</div>
        </div>

        <div className="bg-dark-900 rounded-lg p-6 border border-gray-800">
          <div className="text-gray-400 text-sm mb-2">Est. Pipeline Value</div>
          <div className="text-3xl font-bold text-blue-500">${stats.value.toLocaleString()}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-dark-900 rounded-lg p-6 border border-gray-800 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Search</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full px-4 py-2 bg-dark-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 bg-dark-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="viewed">Viewed</option>
              <option value="signed">Signed</option>
              <option value="expired">Expired</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-2 bg-dark-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="created_desc">Newest First</option>
              <option value="created_asc">Oldest First</option>
              <option value="org_name">Organization Name</option>
              <option value="status">Status</option>
            </select>
          </div>
        </div>
      </div>

      {/* Contract List */}
      {filteredContracts.length === 0 ? (
        <div className="bg-dark-900 rounded-lg p-12 text-center border border-gray-800">
          <div className="text-6xl mb-4">📄</div>
          <h3 className="text-xl font-bold text-white mb-2">
            {contracts.length === 0 ? 'No Contracts Yet' : 'No Contracts Found'}
          </h3>
          <p className="text-gray-400 mb-6">
            {contracts.length === 0
              ? 'Create your first contract to get started'
              : 'Try adjusting your search or filters'}
          </p>
          {contracts.length === 0 && (
            <button
              onClick={() => navigate('/portal/contracts/new')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Create New Contract
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredContracts.map(contract => (
            <div
              key={contract.id}
              onClick={() => navigate(`/portal/contracts/${contract.id}`)}
              className="bg-dark-900 rounded-lg p-6 border border-gray-800 hover:border-gray-700 cursor-pointer transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">
                    {contract.org_name || 'Untitled Contract'}
                  </h3>
                  <p className="text-gray-400">{contract.promoter_name || 'No promoter name'}</p>
                </div>
                <span className={getStatusBadgeClass(contract.status)}>
                  {getStatusIcon(contract.status)} {contract.status}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="text-gray-500 mb-1">Event Date</div>
                  <div className="text-white">
                    {contract.contract_data?.event_date
                      ? new Date(contract.contract_data.event_date).toLocaleDateString()
                      : 'Not set'}
                  </div>
                </div>

                <div>
                  <div className="text-gray-500 mb-1">Created</div>
                  <div className="text-white">
                    {new Date(contract.created_at).toLocaleDateString()}
                  </div>
                </div>

                <div>
                  <div className="text-gray-500 mb-1">Contact</div>
                  <div className="text-white">{contract.promoter_email || 'No email'}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
