import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getContracts } from '../../lib/supabase'
import { getStatusIcon } from '../../lib/contractHelpers'

const statusBadgeStyles = {
  draft: 'bg-gray-700 text-gray-200',
  sent: 'bg-blue-600/20 text-blue-400 border border-blue-500/30',
  viewed: 'bg-yellow-600/20 text-yellow-400 border border-yellow-500/30',
  signed: 'bg-green-600/20 text-green-400 border border-green-500/30',
  expired: 'bg-red-600/20 text-red-400 border border-red-500/30',
}

export default function ContractDashboard() {
  const [contracts, setContracts] = useState([])
  const [filteredContracts, setFilteredContracts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [sortBy, setSortBy] = useState('created_desc')
  const [stats, setStats] = useState({ total: 0, signedThisMonth: 0, pending: 0, value: 0 })
  const navigate = useNavigate()

  useEffect(() => { loadContracts() }, [])
  useEffect(() => { filterAndSortContracts() }, [contracts, searchTerm, statusFilter, sortBy])

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
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(c =>
        (c.org_name || '').toLowerCase().includes(term) ||
        (c.promoter_name || '').toLowerCase().includes(term) ||
        (c.promoter_email || '').toLowerCase().includes(term)
      )
    }
    if (statusFilter) {
      filtered = filtered.filter(c => c.status === statusFilter)
    }
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'created_asc': return new Date(a.created_at) - new Date(b.created_at)
        case 'created_desc': return new Date(b.created_at) - new Date(a.created_at)
        case 'org_name': return (a.org_name || '').localeCompare(b.org_name || '')
        case 'status': return (a.status || '').localeCompare(b.status || '')
        default: return 0
      }
    })
    setFilteredContracts(filtered)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-gray-400 text-lg">Loading contracts...</div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-black text-white tracking-tight">
          <span className="text-red-500">CONTRACT</span> MANAGEMENT
        </h1>
        <button
          onClick={() => navigate('/portal/contracts/new')}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-bold transition-all hover:scale-105 flex items-center gap-2"
        >
          <span className="text-lg">+</span> Create New Contract
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'TOTAL CONTRACTS', value: stats.total, color: 'text-white' },
          { label: 'SIGNED THIS MONTH', value: stats.signedThisMonth, color: 'text-pink-500' },
          { label: 'PENDING SIGNATURES', value: stats.pending, color: 'text-pink-500' },
          { label: 'TOTAL VALUE', value: `$${stats.value.toLocaleString()}`, color: 'text-red-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-[#1a1a2e] rounded-xl p-5 border border-gray-800/50">
            <div className="text-[11px] font-bold text-gray-500 tracking-widest uppercase mb-3">{label}</div>
            <div className={`text-3xl font-black ${color}`}>{value}</div>
          </div>
        ))}
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by organization name..."
          className="flex-1 px-4 py-3 bg-[#1a1a2e] border border-gray-800/50 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500/40"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-3 bg-[#1a1a2e] border border-gray-800/50 rounded-xl text-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500/40 min-w-[160px]"
        >
          <option value="">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="sent">Sent</option>
          <option value="viewed">Viewed</option>
          <option value="signed">Signed</option>
          <option value="expired">Expired</option>
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-3 bg-[#1a1a2e] border border-gray-800/50 rounded-xl text-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500/40 min-w-[160px]"
        >
          <option value="created_desc">Newest First</option>
          <option value="created_asc">Oldest First</option>
          <option value="org_name">Organization A-Z</option>
          <option value="status">Status</option>
        </select>
      </div>

      {/* Contract List */}
      {filteredContracts.length === 0 ? (
        <div className="bg-[#1a1a2e] rounded-xl p-12 text-center border border-gray-800/50">
          <div className="text-6xl mb-4">📄</div>
          <h3 className="text-xl font-bold text-white mb-2">
            {contracts.length === 0 ? 'No Contracts Yet' : 'No Contracts Found'}
          </h3>
          <p className="text-gray-500 mb-6">
            {contracts.length === 0 ? 'Create your first contract to get started' : 'Try adjusting your search or filters'}
          </p>
          {contracts.length === 0 && (
            <button
              onClick={() => navigate('/portal/contracts/new')}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-bold transition-all"
            >
              Create New Contract
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredContracts.map(contract => {
            const eventDate = contract.contract_data?.event_date
              ? new Date(contract.contract_data.event_date).toLocaleDateString('en-AU')
              : 'Not set'
            const createdDate = new Date(contract.created_at).toLocaleDateString('en-AU')

            return (
              <div
                key={contract.id}
                onClick={() => navigate(`/portal/contracts/${contract.id}`)}
                className="bg-[#1a1a2e] rounded-xl p-5 border-l-4 border-l-red-600 border border-gray-800/50 hover:border-gray-700 cursor-pointer transition-all hover:bg-[#1f1f35] group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white group-hover:text-red-400 transition-colors">
                      {contract.org_name || 'Untitled Contract'}
                    </h3>
                    <div className="flex flex-wrap gap-x-6 gap-y-1 mt-2 text-sm">
                      <div>
                        <span className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">Promoter</span>
                        <div className="text-gray-300">{contract.promoter_name || 'N/A'}</div>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">Event Date</span>
                        <div className="text-gray-300">{eventDate}</div>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">Created</span>
                        <div className="text-gray-300">{createdDate}</div>
                      </div>
                    </div>
                  </div>
                  <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${statusBadgeStyles[contract.status] || 'bg-gray-700 text-gray-300'}`}>
                    {getStatusIcon(contract.status)} {contract.status}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
