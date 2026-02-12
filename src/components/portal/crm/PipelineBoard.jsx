import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getLeads, updateLead, getPipelineStats } from '../../../lib/crmSupabase'
import { ArrowLeft, MapPin, Trophy, TrendingUp, DollarSign, Users, Calendar, RefreshCw } from 'lucide-react'

const COLUMNS = [
  { id: 'new', name: 'New', color: 'bg-gray-600', textColor: 'text-gray-300' },
  { id: 'contacted', name: 'Contacted', color: 'bg-blue-600', textColor: 'text-blue-400' },
  { id: 'meeting', name: 'Meeting Booked', color: 'bg-purple-600', textColor: 'text-purple-400' },
  { id: 'proposal', name: 'Proposal Sent', color: 'bg-yellow-600', textColor: 'text-yellow-400' },
  { id: 'negotiating', name: 'Negotiating', color: 'bg-orange-600', textColor: 'text-orange-400' },
  { id: 'signed', name: 'Signed', color: 'bg-green-600', textColor: 'text-green-400' },
  { id: 'lost', name: 'Lost', color: 'bg-red-600', textColor: 'text-red-400' }
]

function LeadCard({ lead, onDragStart }) {
  const navigate = useNavigate()

  const getPriorityColor = (score) => {
    if (score >= 80) return 'bg-red-600 text-red-100'
    if (score >= 60) return 'bg-orange-600 text-orange-100'
    return 'bg-gray-600 text-gray-100'
  }

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onClick={() => navigate(`/portal/pipeline/leads/${lead.id}`)}
      className="bg-[#12122a] rounded-lg p-4 border border-gray-800/50 hover:border-gray-700 cursor-move hover:bg-[#16162e] transition-all group"
    >
      {/* Org Name */}
      <h4 className="font-bold text-white group-hover:text-red-400 transition-colors mb-2 line-clamp-2">
        {lead.org_name}
      </h4>

      {/* Sport & Location */}
      <div className="space-y-1.5 mb-3">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Trophy size={14} />
          <span className="truncate">{lead.sport}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <MapPin size={14} />
          <span className="truncate">{lead.location}</span>
        </div>
      </div>

      {/* Priority Score Badge */}
      <div className="flex items-center justify-between mb-3">
        <span className={`px-2 py-1 rounded text-xs font-bold ${getPriorityColor(lead.priority_score)}`}>
          Priority: {lead.priority_score}
        </span>
        <span className="text-xs font-bold text-gray-600 uppercase">
          Tier {lead.tier}
        </span>
      </div>

      {/* Last Activity & Next Action */}
      <div className="pt-3 border-t border-gray-800/50 space-y-1">
        <div className="text-xs text-gray-600">
          <span className="font-bold">Last Contact:</span> {lead.last_contact ? new Date(lead.last_contact).toLocaleDateString('en-AU') : 'Never'}
        </div>
        {lead.revenue_potential && (
          <div className="text-xs text-green-400 font-medium">
            {lead.revenue_potential}
          </div>
        )}
      </div>
    </div>
  )
}

function Column({ column, leads, onDrop, onDragOver }) {
  return (
    <div
      onDrop={onDrop}
      onDragOver={onDragOver}
      className="flex flex-col min-h-[500px]"
    >
      {/* Column Header */}
      <div className={`${column.color} rounded-t-xl px-4 py-3 mb-3`}>
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-white text-sm uppercase tracking-wider">
            {column.name}
          </h3>
          <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs font-bold text-white">
            {leads.length}
          </span>
        </div>
      </div>

      {/* Cards */}
      <div className="flex-1 space-y-3 px-2">
        {leads.length === 0 ? (
          <div className="text-center text-gray-600 text-sm py-8">
            No leads
          </div>
        ) : (
          leads.map(lead => (
            <LeadCard
              key={lead.id}
              lead={lead}
              onDragStart={(e) => {
                e.dataTransfer.effectAllowed = 'move'
                e.dataTransfer.setData('leadId', lead.id)
              }}
            />
          ))
        )}
      </div>
    </div>
  )
}

export default function PipelineBoard() {
  const navigate = useNavigate()
  const [leads, setLeads] = useState([])
  const [stats, setStats] = useState({ totalLeads: 0, activeLeads: 0, meetingsThisWeek: 0, pipelineValue: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [allLeads, pipelineStats] = await Promise.all([
        getLeads(),
        getPipelineStats()
      ])
      setLeads(allLeads)
      setStats({
        totalLeads: pipelineStats.totalLeads,
        activeLeads: pipelineStats.activeLeads,
        meetingsThisWeek: pipelineStats.meetingsThisWeek,
        pipelineValue: pipelineStats.pipelineValue
      })
    } catch (error) {
      console.error('Error loading pipeline data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDrop = async (e, columnId) => {
    e.preventDefault()
    const leadId = e.dataTransfer.getData('leadId')
    
    if (leadId) {
      try {
        await updateLead(leadId, { stage: columnId })
        await loadData()
      } catch (error) {
        console.error('Error updating lead:', error)
      }
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const getLeadsByStage = (stage) => {
    return leads.filter(lead => lead.stage === stage)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-gray-400 text-lg">Loading pipeline...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0d0d1a] pb-8">
      {/* Header */}
      <div className="bg-[#1a1a2e] border-b border-gray-800/50 mb-6">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/portal/pipeline')}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft size={24} />
              </button>
              <h1 className="text-3xl font-black text-white tracking-tight">
                <span className="text-red-500">PIPELINE</span> BOARD
              </h1>
            </div>
            <button
              onClick={loadData}
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 text-sm"
            >
              <RefreshCw size={18} />
              Refresh
            </button>
          </div>

          {/* Top Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#12122a] rounded-xl p-4 border border-gray-800/50">
              <div className="flex items-center gap-2 mb-2">
                <Users size={18} className="text-gray-500" />
                <div className="text-[10px] font-bold text-gray-500 tracking-widest uppercase">Total Leads</div>
              </div>
              <div className="text-2xl font-black text-white">{stats.totalLeads}</div>
            </div>

            <div className="bg-[#12122a] rounded-xl p-4 border border-gray-800/50">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={18} className="text-pink-500" />
                <div className="text-[10px] font-bold text-gray-500 tracking-widest uppercase">Active Pipeline</div>
              </div>
              <div className="text-2xl font-black text-pink-500">{stats.activeLeads}</div>
            </div>

            <div className="bg-[#12122a] rounded-xl p-4 border border-gray-800/50">
              <div className="flex items-center gap-2 mb-2">
                <Calendar size={18} className="text-purple-500" />
                <div className="text-[10px] font-bold text-gray-500 tracking-widest uppercase">Meetings This Week</div>
              </div>
              <div className="text-2xl font-black text-purple-500">{stats.meetingsThisWeek}</div>
            </div>

            <div className="bg-[#12122a] rounded-xl p-4 border border-gray-800/50">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign size={18} className="text-red-400" />
                <div className="text-[10px] font-bold text-gray-500 tracking-widest uppercase">Pipeline Value</div>
              </div>
              <div className="text-2xl font-black text-red-400">${(stats.pipelineValue / 1000).toFixed(0)}K</div>
            </div>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-4">
          {COLUMNS.map(column => (
            <Column
              key={column.id}
              column={column}
              leads={getLeadsByStage(column.id)}
              onDrop={(e) => handleDrop(e, column.id)}
              onDragOver={handleDragOver}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
