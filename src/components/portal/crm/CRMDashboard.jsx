import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getPipelineStats, getLeads } from '../../../lib/crmSupabase'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Clock, TrendingUp, DollarSign, Users, Filter, RefreshCw } from 'lucide-react'

const TIER_COLORS = ['#ef4444', '#f59e0b', '#3b82f6']
const STAGE_COLORS = {
  new: '#6b7280',
  contacted: '#3b82f6',
  meeting: '#8b5cf6',
  proposal: '#eab308',
  negotiating: '#f97316',
  signed: '#10b981',
  lost: '#ef4444'
}

export default function CRMDashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterTier, setFilterTier] = useState('')
  const [filterSport, setFilterSport] = useState('')
  const [filterStage, setFilterStage] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [statsData, leadsData] = await Promise.all([
        getPipelineStats(),
        getLeads()
      ])
      setStats(statsData)
      setLeads(leadsData)
    } catch (error) {
      console.error('Error loading CRM data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getFilteredLeads = () => {
    let filtered = leads
    
    if (filterTier) {
      filtered = filtered.filter(l => l.tier === parseInt(filterTier))
    }
    
    if (filterSport) {
      filtered = filtered.filter(l => l.sport?.toLowerCase().includes(filterSport.toLowerCase()))
    }
    
    if (filterStage) {
      filtered = filtered.filter(l => l.stage === filterStage)
    }
    
    return filtered
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-gray-400 text-lg">Loading CRM data...</div>
      </div>
    )
  }

  // Prepare funnel data for chart
  const funnelData = [
    { name: 'New', value: stats.stageCounts.new, color: STAGE_COLORS.new },
    { name: 'Contacted', value: stats.stageCounts.contacted, color: STAGE_COLORS.contacted },
    { name: 'Meeting', value: stats.stageCounts.meeting, color: STAGE_COLORS.meeting },
    { name: 'Proposal', value: stats.stageCounts.proposal, color: STAGE_COLORS.proposal },
    { name: 'Negotiating', value: stats.stageCounts.negotiating, color: STAGE_COLORS.negotiating },
    { name: 'Signed', value: stats.stageCounts.signed, color: STAGE_COLORS.signed }
  ]

  // Prepare tier data for pie chart
  const tierData = [
    { name: 'Tier 1', value: stats.tierCounts[1] || 0, color: TIER_COLORS[0] },
    { name: 'Tier 2', value: stats.tierCounts[2] || 0, color: TIER_COLORS[1] },
    { name: 'Tier 3', value: stats.tierCounts[3] || 0, color: TIER_COLORS[2] }
  ].filter(d => d.value > 0)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <h1 className="text-3xl font-black text-white tracking-tight">
          <span className="text-red-500">CRM</span> DASHBOARD
        </h1>
        <div className="flex gap-3">
          <button
            onClick={loadData}
            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 text-sm"
          >
            <RefreshCw size={18} />
            Refresh
          </button>
          <button
            onClick={() => navigate('/portal/pipeline/board')}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-bold transition-all hover:scale-105"
          >
            View Pipeline Board
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-[#1a1a2e] rounded-xl p-5 border border-gray-800/50">
          <div className="flex items-center gap-3 mb-3">
            <Users size={20} className="text-gray-500" />
            <div className="text-[11px] font-bold text-gray-500 tracking-widest uppercase">Total Leads</div>
          </div>
          <div className="text-3xl font-black text-white">{stats.totalLeads}</div>
        </div>

        <div className="bg-[#1a1a2e] rounded-xl p-5 border border-gray-800/50">
          <div className="flex items-center gap-3 mb-3">
            <TrendingUp size={20} className="text-pink-500" />
            <div className="text-[11px] font-bold text-gray-500 tracking-widest uppercase">Conversion Rate</div>
          </div>
          <div className="text-3xl font-black text-pink-500">{stats.conversionRate}%</div>
        </div>

        <div className="bg-[#1a1a2e] rounded-xl p-5 border border-gray-800/50">
          <div className="flex items-center gap-3 mb-3">
            <Clock size={20} className="text-purple-500" />
            <div className="text-[11px] font-bold text-gray-500 tracking-widest uppercase">Meetings This Week</div>
          </div>
          <div className="text-3xl font-black text-purple-500">{stats.meetingsThisWeek}</div>
        </div>

        <div className="bg-[#1a1a2e] rounded-xl p-5 border border-gray-800/50">
          <div className="flex items-center gap-3 mb-3">
            <DollarSign size={20} className="text-red-400" />
            <div className="text-[11px] font-bold text-gray-500 tracking-widest uppercase">Pipeline Value</div>
          </div>
          <div className="text-3xl font-black text-red-400">${(stats.pipelineValue / 1000).toFixed(0)}K</div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {/* Pipeline Funnel */}
        <div className="md:col-span-2 bg-[#1a1a2e] rounded-xl p-6 border border-gray-800/50">
          <h3 className="text-lg font-bold text-white mb-4">Pipeline Funnel</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={funnelData} layout="vertical">
              <XAxis type="number" stroke="#6b7280" />
              <YAxis dataKey="name" type="category" stroke="#6b7280" width={100} />
              <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                {funnelData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Leads by Tier */}
        <div className="bg-[#1a1a2e] rounded-xl p-6 border border-gray-800/50">
          <h3 className="text-lg font-bold text-white mb-4">Leads by Tier</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={tierData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                dataKey="value"
                label={(entry) => `${entry.name}: ${entry.value}`}
              >
                {tierData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Filters */}
      <div className="bg-[#1a1a2e] rounded-xl p-6 border border-gray-800/50 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Filter size={20} className="text-gray-500" />
          <h3 className="text-lg font-bold text-white">Quick Filters</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <select
            value={filterTier}
            onChange={(e) => setFilterTier(e.target.value)}
            className="px-4 py-3 bg-[#12122a] border border-gray-800/50 rounded-xl text-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500/40"
          >
            <option value="">All Tiers</option>
            <option value="1">Tier 1</option>
            <option value="2">Tier 2</option>
            <option value="3">Tier 3</option>
          </select>

          <select
            value={filterStage}
            onChange={(e) => setFilterStage(e.target.value)}
            className="px-4 py-3 bg-[#12122a] border border-gray-800/50 rounded-xl text-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500/40"
          >
            <option value="">All Statuses</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="meeting">Meeting Booked</option>
            <option value="proposal">Proposal Sent</option>
            <option value="negotiating">Negotiating</option>
            <option value="signed">Signed</option>
            <option value="lost">Lost</option>
          </select>

          <input
            type="text"
            value={filterSport}
            onChange={(e) => setFilterSport(e.target.value)}
            placeholder="Filter by sport..."
            className="px-4 py-3 bg-[#12122a] border border-gray-800/50 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500/40"
          />
        </div>
        {(filterTier || filterSport || filterStage) && (
          <div className="mt-4">
            <div className="text-sm text-gray-400">
              Showing {getFilteredLeads().length} of {stats.totalLeads} leads
            </div>
          </div>
        )}
      </div>

      {/* Recent Activity Feed */}
      <div className="bg-[#1a1a2e] rounded-xl p-6 border border-gray-800/50 mb-6">
        <h3 className="text-lg font-bold text-white mb-4">Recent Activity</h3>
        {stats.recentActivities.length === 0 ? (
          <div className="text-gray-500 text-center py-8">No recent activity</div>
        ) : (
          <div className="space-y-3">
            {stats.recentActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-4 p-4 bg-[#12122a] rounded-lg border border-gray-800/50 hover:border-gray-700 transition-all"
              >
                <div className="flex-shrink-0 w-10 h-10 bg-red-600/20 rounded-full flex items-center justify-center">
                  <span className="text-red-400 text-xl">{activity.type === 'Phone Call' ? '📞' : activity.type === 'Email' ? '📧' : activity.type === 'Meeting' ? '🤝' : '📝'}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-white">{activity.lead_name}</span>
                    <span className="text-gray-600">•</span>
                    <span className="text-xs font-bold text-gray-500 uppercase">{activity.type}</span>
                  </div>
                  <p className="text-sm text-gray-400 mb-1">{activity.notes}</p>
                  <div className="text-xs text-gray-600">
                    {new Date(activity.created_at).toLocaleDateString('en-AU', { 
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Follow-up Reminders */}
      <div className="bg-[#1a1a2e] rounded-xl p-6 border border-gray-800/50">
        <h3 className="text-lg font-bold text-white mb-4">Follow-up Reminders</h3>
        <div className="text-gray-500 text-center py-8">
          No pending follow-ups
          <div className="text-sm mt-2">Add activities with due dates to see reminders here</div>
        </div>
      </div>
    </div>
  )
}
