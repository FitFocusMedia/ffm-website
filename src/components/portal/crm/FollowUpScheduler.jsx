import { useState, useEffect } from 'react'
import { Calendar, Clock, AlertCircle, CheckCircle, Mail } from 'lucide-react'
import { getLeads } from '../../../lib/crmSupabase'

/**
 * Follow-Up Scheduler Component
 * Implements the 5-Touch Strategy from research:
 * - Touch 1: Initial outreach
 * - Touch 2: +3 days (value-add)
 * - Touch 3: +5 days (social proof)
 * - Touch 4: +5 days (meeting request)
 * - Touch 5: +7 days (permission to close)
 */

const TOUCH_SCHEDULE = [
  { touch: 1, name: 'Initial Outreach', daysAfterPrevious: 0, type: 'initial' },
  { touch: 2, name: 'Value-Add Follow-up', daysAfterPrevious: 3, type: 'value' },
  { touch: 3, name: 'Social Proof', daysAfterPrevious: 5, type: 'proof' },
  { touch: 4, name: 'Meeting Request', daysAfterPrevious: 5, type: 'meeting' },
  { touch: 5, name: 'Permission to Close', daysAfterPrevious: 7, type: 'breakup' }
]

function calculateNextTouch(lastContact, currentTouch = 1) {
  if (!lastContact) return null
  
  const lastDate = new Date(lastContact)
  const nextTouch = TOUCH_SCHEDULE[currentTouch]
  
  if (!nextTouch) return null // All touches complete
  
  // Calculate cumulative days
  let cumulativeDays = 0
  for (let i = 1; i <= currentTouch; i++) {
    cumulativeDays += TOUCH_SCHEDULE[i].daysAfterPrevious
  }
  
  const dueDate = new Date(lastDate)
  dueDate.setDate(dueDate.getDate() + cumulativeDays)
  
  return {
    touch: nextTouch.touch,
    name: nextTouch.name,
    type: nextTouch.type,
    dueDate,
    daysUntilDue: Math.ceil((dueDate - new Date()) / (1000 * 60 * 60 * 24))
  }
}

function getFollowUpStatus(lead) {
  // Determine current touch based on activities or stage
  let currentTouch = 1
  
  // If stage is 'contacted', assume Touch 1 is done
  if (lead.stage === 'contacted' || lead.stage === 'meeting' || lead.stage === 'proposal') {
    currentTouch = 1
  }
  
  // Calculate next touch
  const nextTouch = calculateNextTouch(lead.last_contact, currentTouch)
  
  if (!nextTouch) {
    return { status: 'complete', ...lead }
  }
  
  const { daysUntilDue } = nextTouch
  
  let status = 'upcoming'
  if (daysUntilDue < 0) status = 'overdue'
  else if (daysUntilDue === 0) status = 'today'
  else if (daysUntilDue <= 2) status = 'soon'
  
  return {
    ...lead,
    nextTouch,
    status,
    daysUntilDue
  }
}

export default function FollowUpScheduler() {
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all, overdue, today, soon
  
  useEffect(() => {
    loadLeads()
  }, [])
  
  const loadLeads = async () => {
    setLoading(true)
    try {
      const data = await getLeads()
      // Only show leads in active follow-up stages (new, contacted, meeting)
      const activeLeads = data.filter(l => 
        ['new', 'contacted', 'meeting'].includes(l.stage) && l.last_contact
      )
      setLeads(activeLeads.map(getFollowUpStatus))
    } catch (error) {
      console.error('Error loading leads:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const getFilteredLeads = () => {
    if (filter === 'all') return leads
    return leads.filter(l => l.status === filter)
  }
  
  const filteredLeads = getFilteredLeads()
  const overdueCount = leads.filter(l => l.status === 'overdue').length
  const todayCount = leads.filter(l => l.status === 'today').length
  const soonCount = leads.filter(l => l.status === 'soon').length
  
  if (loading) {
    return <div className="text-gray-400">Loading follow-ups...</div>
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Follow-Up Scheduler</h2>
          <p className="text-gray-400 text-sm mt-1">5-Touch outreach strategy tracker</p>
        </div>
        
        {/* Summary Stats */}
        <div className="flex gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-500">{overdueCount}</div>
            <div className="text-xs text-gray-400">Overdue</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-500">{todayCount}</div>
            <div className="text-xs text-gray-400">Today</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-500">{soonCount}</div>
            <div className="text-xs text-gray-400">Soon</div>
          </div>
        </div>
      </div>
      
      {/* Filters */}
      <div className="flex gap-2">
        {['all', 'overdue', 'today', 'soon', 'upcoming'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === f
                ? 'bg-red-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>
      
      {/* Follow-Up List */}
      {filteredLeads.length === 0 ? (
        <div className="bg-gray-800 rounded-lg p-8 text-center text-gray-400">
          <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500" />
          <p>No follow-ups {filter !== 'all' ? filter : 'needed'}!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredLeads.map(lead => (
            <div
              key={lead.id}
              className={`bg-gray-800 rounded-lg p-4 border-l-4 ${
                lead.status === 'overdue' ? 'border-red-500' :
                lead.status === 'today' ? 'border-yellow-500' :
                lead.status === 'soon' ? 'border-blue-500' :
                'border-gray-600'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-white">{lead.org_name}</h3>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      lead.tier === 1 ? 'bg-red-900 text-red-200' :
                      lead.tier === 2 ? 'bg-yellow-900 text-yellow-200' :
                      'bg-blue-900 text-blue-200'
                    }`}>
                      Tier {lead.tier}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-6 text-sm text-gray-400">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      <span>Touch {lead.nextTouch.touch}: {lead.nextTouch.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>Due: {lead.nextTouch.dueDate.toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span className={
                        lead.status === 'overdue' ? 'text-red-400 font-medium' :
                        lead.status === 'today' ? 'text-yellow-400 font-medium' :
                        'text-gray-400'
                      }>
                        {lead.daysUntilDue === 0 ? 'Today' :
                         lead.daysUntilDue < 0 ? `${Math.abs(lead.daysUntilDue)} days overdue` :
                         `In ${lead.daysUntilDue} days`}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  {lead.status === 'overdue' && (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  )}
                  <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all">
                    Send Follow-Up
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Legend */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-sm font-bold text-white mb-3">5-Touch Strategy Timeline</h3>
        <div className="space-y-2 text-sm">
          {TOUCH_SCHEDULE.map((touch, idx) => (
            <div key={touch.touch} className="flex items-center gap-3 text-gray-400">
              <span className="font-mono text-xs bg-gray-700 px-2 py-1 rounded">T{touch.touch}</span>
              <span className="flex-1">{touch.name}</span>
              <span className="text-xs">
                {idx === 0 ? 'Initial' : `+${touch.daysAfterPrevious} days`}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-3 pt-3 border-t border-gray-700 text-xs text-gray-500">
          💡 Research shows 80% of sales happen between Touch 5-12. Don't give up early!
        </div>
      </div>
    </div>
  )
}
