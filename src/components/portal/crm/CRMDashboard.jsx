import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getPipelineStats, getLeads } from '../../../lib/crmSupabase'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Clock, TrendingUp, DollarSign, Users, Filter, RefreshCw } from 'lucide-react'
import FollowUpScheduler from './FollowUpScheduler'

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
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          <span className="text-red-500">CRM</span> DASHBOARD
        </h1>
        <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
          <button
            onClick={loadData}
            className="bg-gray-700 hover:bg-gray-600 text-white px-3 sm:px-4 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2 text-xs sm:text-sm flex-1 sm:flex-none"
          >
            <RefreshCw size={16} className="sm:w-[18px] sm:h-[18px]" />
            Refresh
          </button>
          <button
            onClick={() => navigate('/portal/pipeline/board')}
            className="bg-red-600 hover:bg-red-700 text-white px-4 sm:px-6 py-2 rounded-lg font-bold transition-all hover:scale-105 text-xs sm:text-sm flex-1 sm:flex-none whitespace-nowrap"
          >
            View Pipeline Board
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div className="bg-[#1a1a2e] rounded-xl p-3 sm:p-5 border border-gray-800/50">
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
            <Users size={16} className="text-gray-500 sm:w-5 sm:h-5" />
            <div className="text-[9px] sm:text-[11px] font-bold text-gray-500 tracking-wider sm:tracking-widest uppercase">Total Leads</div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">{stats.totalLeads}</div>
        </div>

        <div className="bg-[#1a1a2e] rounded-xl p-3 sm:p-5 border border-gray-800/50">
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
            <TrendingUp size={16} className="text-pink-500 sm:w-5 sm:h-5" />
            <div className="text-[9px] sm:text-[11px] font-bold text-gray-500 tracking-wider sm:tracking-widest uppercase">Conversion</div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-pink-500">{stats.conversionRate}%</div>
        </div>

        <div className="bg-[#1a1a2e] rounded-xl p-3 sm:p-5 border border-gray-800/50">
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
            <Clock size={16} className="text-purple-500 sm:w-5 sm:h-5" />
            <div className="text-[9px] sm:text-[11px] font-bold text-gray-500 tracking-wider sm:tracking-widest uppercase">Meetings</div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-purple-500">{stats.meetingsThisWeek}</div>
        </div>

        <div className="bg-[#1a1a2e] rounded-xl p-3 sm:p-5 border border-gray-800/50">
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
            <DollarSign size={16} className="text-red-400 sm:w-5 sm:h-5" />
            <div className="text-[9px] sm:text-[11px] font-bold text-gray-500 tracking-wider sm:tracking-widest uppercase">Pipeline</div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-red-400">${(stats.pipelineValue / 1000).toFixed(0)}K</div>
        </div>
      </div>

      {/* Follow-Up Scheduler Section */}
      <div className="mb-6 sm:mb-8">
        <FollowUpScheduler />
      </div>

      {/* Charts Row - hidden on mobile, shown on tablets and up */}
      <div className="hidden sm:grid md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {/* Pipeline Funnel */}
        <div className="md:col-span-2 bg-[#1a1a2e] rounded-xl p-4 sm:p-6 border border-gray-800/50">
          <h3 className="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4">Pipeline Funnel</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={funnelData} layout="vertical">
              <XAxis type="number" stroke="#6b7280" />
              <YAxis dataKey="name" type="category" stroke="#6b7280" width={80} tick={{ fontSize: 12 }} />
              <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                {funnelData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Leads by Tier */}
        <div className="bg-[#1a1a2e] rounded-xl p-4 sm:p-6 border border-gray-800/50">
          <h3 className="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4">Leads by Tier</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={tierData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={75}
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
      <div className="bg-[#1a1a2e] rounded-xl p-4 sm:p-6 border border-gray-800/50 mb-4 sm:mb-6">
        <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
          <Filter size={16} className="text-gray-500 sm:w-5 sm:h-5" />
          <h3 className="text-base sm:text-lg font-bold text-white">Quick Filters</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4">
          <select
            value={filterTier}
            onChange={(e) => setFilterTier(e.target.value)}
            className="px-3 sm:px-4 py-2 sm:py-3 bg-[#12122a] border border-gray-800/50 rounded-lg sm:rounded-xl text-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/40"
          >
            <option value="">All Tiers</option>
            <option value="1">Tier 1</option>
            <option value="2">Tier 2</option>
            <option value="3">Tier 3</option>
          </select>

          <select
            value={filterStage}
            onChange={(e) => setFilterStage(e.target.value)}
            className="px-3 sm:px-4 py-2 sm:py-3 bg-[#12122a] border border-gray-800/50 rounded-lg sm:rounded-xl text-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/40"
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
            className="col-span-2 sm:col-span-1 px-3 sm:px-4 py-2 sm:py-3 bg-[#12122a] border border-gray-800/50 rounded-lg sm:rounded-xl text-white placeholder-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/40"
          />
        </div>
        {(filterTier || filterSport || filterStage) && (
          <div className="mt-3 sm:mt-4">
            <div className="text-xs sm:text-sm text-gray-400">
              Showing {getFilteredLeads().length} of {stats.totalLeads} leads
            </div>
          </div>
        )}
      </div>

      {/* Recent Activity Feed */}
      <div className="bg-[#1a1a2e] rounded-xl p-4 sm:p-6 border border-gray-800/50 mb-4 sm:mb-6">
        <h3 className="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4">Recent Activity</h3>
        {stats.recentActivities.length === 0 ? (
          <div className="text-gray-500 text-center py-6 sm:py-8 text-sm">No recent activity</div>
        ) : (
          <div className="space-y-2 sm:space-y-3">
            {stats.recentActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-[#12122a] rounded-lg border border-gray-800/50 hover:border-gray-700 transition-all"
              >
                <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-red-600/20 rounded-full flex items-center justify-center">
                  <span className="text-red-400 text-base sm:text-xl">{activity.type === 'Phone Call' ? '📞' : activity.type === 'Email' ? '📧' : activity.type === 'Meeting' ? '🤝' : '📝'}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-bold text-white text-sm sm:text-base">{activity.lead_name}</span>
                    <span className="text-gray-600">•</span>
                    <span className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase">{activity.type}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-400 mb-1 line-clamp-2">{activity.notes}</p>
                  <div className="text-[10px] sm:text-xs text-gray-600">
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
      <div className="bg-[#1a1a2e] rounded-xl p-4 sm:p-6 border border-gray-800/50">
        <h3 className="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4">Follow-up Reminders</h3>
        <div className="text-gray-500 text-center py-6 sm:py-8 text-sm">
          No pending follow-ups
          <div className="text-xs sm:text-sm mt-2">Add activities with due dates to see reminders here</div>
        </div>
      </div>
    </div>
  )
}
