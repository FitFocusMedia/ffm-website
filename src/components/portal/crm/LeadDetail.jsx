import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getLead, updateLead, getActivities, addActivity } from '../../../lib/crmSupabase'
import { 
  ArrowLeft, Phone, Mail, Globe, Instagram, Facebook, MapPin, Trophy, 
  Calendar, DollarSign, Tag, Shield, Edit2, Save, X, Plus, RefreshCw 
} from 'lucide-react'

const STAGE_OPTIONS = [
  { value: 'new', label: 'New', color: 'bg-gray-600' },
  { value: 'contacted', label: 'Contacted', color: 'bg-blue-600' },
  { value: 'meeting', label: 'Meeting Booked', color: 'bg-purple-600' },
  { value: 'proposal', label: 'Proposal Sent', color: 'bg-yellow-600' },
  { value: 'negotiating', label: 'Negotiating', color: 'bg-orange-600' },
  { value: 'signed', label: 'Signed', color: 'bg-green-600' },
  { value: 'lost', label: 'Lost', color: 'bg-red-600' }
]

const ACTIVITY_TYPES = [
  { value: 'Phone Call', icon: '📞' },
  { value: 'Email', icon: '📧' },
  { value: 'Meeting', icon: '🤝' },
  { value: 'Note', icon: '📝' },
  { value: 'Follow-up', icon: '🔔' }
]

export default function LeadDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [lead, setLead] = useState(null)
  const [activities, setActivities] = useState([])
  const [editing, setEditing] = useState(false)
  const [editedLead, setEditedLead] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  // Activity form state
  const [showActivityForm, setShowActivityForm] = useState(false)
  const [activityType, setActivityType] = useState('Phone Call')
  const [activityNotes, setActivityNotes] = useState('')

  useEffect(() => {
    if (id) {
      loadLead()
    }
  }, [id])

  const loadLead = async () => {
    setLoading(true)
    try {
      const [loadedLead, loadedActivities] = await Promise.all([
        getLead(id),
        getActivities(id)
      ])
      if (loadedLead) {
        setLead(loadedLead)
        setEditedLead(loadedLead)
        setActivities(loadedActivities)
      }
    } catch (error) {
      console.error('Error loading lead:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-gray-400 text-lg">Loading lead...</div>
      </div>
    )
  }

  if (!lead) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-gray-400 text-lg">Lead not found</div>
      </div>
    )
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateLead(id, editedLead)
      setLead(editedLead)
      setEditing(false)
    } catch (error) {
      console.error('Error saving lead:', error)
      alert('Error saving lead')
    } finally {
      setSaving(false)
    }
  }

  const handleAddActivity = async () => {
    if (!activityNotes.trim()) {
      alert('Please enter activity notes')
      return
    }

    try {
      await addActivity(id, {
        type: activityType,
        notes: activityNotes
      })

      // Reload activities
      const newActivities = await getActivities(id)
      setActivities(newActivities)

      // Reset form
      setActivityNotes('')
      setShowActivityForm(false)
    } catch (error) {
      console.error('Error adding activity:', error)
      alert('Error adding activity')
    }
  }

  const handleQuickAction = async (action) => {
    try {
      await addActivity(id, {
        type: action,
        notes: `Quick ${action.toLowerCase()} logged`
      })
      const newActivities = await getActivities(id)
      setActivities(newActivities)
    } catch (error) {
      console.error('Error logging activity:', error)
    }
  }

  const stageColor = STAGE_OPTIONS.find(s => s.value === lead.stage)?.color || 'bg-gray-600'

  return (
    <div className="min-h-screen bg-[#0d0d1a]">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1a1a2e] to-[#16162a] border-b border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/portal/pipeline/board')}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft size={24} />
              </button>
              <div>
                <h1 className="text-3xl font-black text-white tracking-tight">
                  {lead.org_name}
                </h1>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-sm text-gray-400">{lead.sport}</span>
                  <span className="text-gray-700">•</span>
                  <span className="text-sm text-gray-400">{lead.location}</span>
                  <span className="text-gray-700">•</span>
                  <span className="text-sm text-gray-400">{lead.type}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className={`${stageColor} px-4 py-2 rounded-lg text-white text-sm font-bold uppercase`}>
                {STAGE_OPTIONS.find(s => s.value === lead.stage)?.label || lead.stage}
              </span>
              {!editing ? (
                <button
                  onClick={() => setEditing(true)}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2"
                >
                  <Edit2 size={16} /> Edit
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    <Save size={16} /> {saving ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={() => {
                      setEditing(false)
                      setEditedLead(lead)
                    }}
                    className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2"
                  >
                    <X size={16} /> Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Priority & Tier */}
          <div className="flex items-center gap-4">
            <div className="bg-red-600/20 border border-red-500/30 px-3 py-1 rounded-full">
              <span className="text-red-400 font-bold text-sm">Priority: {lead.priority_score}</span>
            </div>
            <div className="bg-blue-600/20 border border-blue-500/30 px-3 py-1 rounded-full">
              <span className="text-blue-400 font-bold text-sm">Tier {lead.tier}</span>
            </div>
            <div className={`${lead.verification_status === 'verified' ? 'bg-green-600/20 border-green-500/30 text-green-400' : 'bg-yellow-600/20 border-yellow-500/30 text-yellow-400'} border px-3 py-1 rounded-full`}>
              <span className="font-bold text-sm flex items-center gap-1">
                <Shield size={14} /> {lead.verification_status}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Contact & Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Info */}
            <div className="bg-[#1a1a2e] rounded-xl p-6 border border-gray-800/50">
              <h3 className="text-lg font-bold text-white mb-4">Contact Information</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {lead.contact?.email && (
                  <a
                    href={`mailto:${lead.contact.email}`}
                    className="flex items-center gap-3 p-3 bg-[#12122a] rounded-lg border border-gray-800/50 hover:border-red-500/30 transition-all group"
                  >
                    <Mail size={20} className="text-gray-500 group-hover:text-red-400" />
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] font-bold text-gray-600 uppercase mb-0.5">Email</div>
                      <div className="text-sm text-gray-300 group-hover:text-red-400 truncate">{lead.contact.email}</div>
                    </div>
                  </a>
                )}

                {lead.contact?.phone && (
                  <a
                    href={`tel:${lead.contact.phone}`}
                    className="flex items-center gap-3 p-3 bg-[#12122a] rounded-lg border border-gray-800/50 hover:border-red-500/30 transition-all group"
                  >
                    <Phone size={20} className="text-gray-500 group-hover:text-red-400" />
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] font-bold text-gray-600 uppercase mb-0.5">Phone</div>
                      <div className="text-sm text-gray-300 group-hover:text-red-400">{lead.contact.phone}</div>
                    </div>
                  </a>
                )}

                {lead.contact?.website && (
                  <a
                    href={lead.contact.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-[#12122a] rounded-lg border border-gray-800/50 hover:border-red-500/30 transition-all group"
                  >
                    <Globe size={20} className="text-gray-500 group-hover:text-red-400" />
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] font-bold text-gray-600 uppercase mb-0.5">Website</div>
                      <div className="text-sm text-gray-300 group-hover:text-red-400 truncate">{lead.contact.website}</div>
                    </div>
                  </a>
                )}

                {lead.contact?.instagram && (
                  <a
                    href={`https://instagram.com/${lead.contact.instagram.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-[#12122a] rounded-lg border border-gray-800/50 hover:border-red-500/30 transition-all group"
                  >
                    <Instagram size={20} className="text-gray-500 group-hover:text-red-400" />
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] font-bold text-gray-600 uppercase mb-0.5">Instagram</div>
                      <div className="text-sm text-gray-300 group-hover:text-red-400">{lead.contact.instagram}</div>
                    </div>
                  </a>
                )}
              </div>

              {lead.contact?.decision_maker && (
                <div className="mt-4 p-3 bg-[#12122a] rounded-lg border border-gray-800/50">
                  <div className="text-[10px] font-bold text-gray-600 uppercase mb-1">Decision Maker</div>
                  <div className="flex items-center gap-3">
                    {lead.contact.avatar && (
                      <img 
                        src={lead.contact.avatar} 
                        alt={lead.contact.decision_maker}
                        className="w-12 h-12 rounded-full object-cover border-2 border-gray-700"
                      />
                    )}
                    <div className="text-white font-bold">{lead.contact.decision_maker}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Event Info */}
            <div className="bg-[#1a1a2e] rounded-xl p-6 border border-gray-800/50">
              <h3 className="text-lg font-bold text-white mb-4">Event Information</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Calendar size={20} className="text-gray-500 mt-0.5" />
                  <div>
                    <div className="text-[10px] font-bold text-gray-600 uppercase mb-1">Frequency</div>
                    <div className="text-gray-300">{lead.events?.frequency || 'Not specified'}</div>
                  </div>
                </div>

                {lead.events?.upcoming?.length > 0 && (
                  <div className="flex items-start gap-3">
                    <Trophy size={20} className="text-gray-500 mt-0.5" />
                    <div>
                      <div className="text-[10px] font-bold text-gray-600 uppercase mb-1">Upcoming Events</div>
                      <div className="text-gray-300 space-y-1">
                        {lead.events.upcoming.map((event, i) => (
                          <div key={i}>{event}</div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <MapPin size={20} className="text-gray-500 mt-0.5" />
                  <div>
                    <div className="text-[10px] font-bold text-gray-600 uppercase mb-1">Typical Venue</div>
                    <div className="text-gray-300">{lead.events?.typical_venue || 'Not specified'}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Media & Revenue */}
            <div className="bg-[#1a1a2e] rounded-xl p-6 border border-gray-800/50">
              <h3 className="text-lg font-bold text-white mb-4">Media & Revenue Assessment</h3>
              <div className="space-y-4">
                <div>
                  <div className="text-[10px] font-bold text-gray-600 uppercase mb-2">Media Quality</div>
                  <div className="text-gray-300 text-sm">{lead.media_quality || 'Not assessed'}</div>
                </div>
                <div className="flex items-center gap-3">
                  <DollarSign size={20} className="text-green-500" />
                  <div>
                    <div className="text-[10px] font-bold text-gray-600 uppercase mb-1">Revenue Potential</div>
                    <div className="text-green-400 font-bold">{lead.revenue_potential || 'TBD'}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="bg-[#1a1a2e] rounded-xl p-6 border border-gray-800/50">
              <h3 className="text-lg font-bold text-white mb-4">Internal Notes</h3>
              {editing ? (
                <textarea
                  value={editedLead.notes || ''}
                  onChange={(e) => setEditedLead({ ...editedLead, notes: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 bg-[#12122a] border border-gray-800/50 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500/40"
                />
              ) : (
                <div className="text-gray-300 text-sm whitespace-pre-wrap">{lead.notes || 'No notes'}</div>
              )}
            </div>

            {/* Activity Timeline */}
            <div className="bg-[#1a1a2e] rounded-xl p-6 border border-gray-800/50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Activity Timeline</h3>
                <button
                  onClick={() => setShowActivityForm(!showActivityForm)}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 text-sm"
                >
                  <Plus size={16} /> Add Activity
                </button>
              </div>

              {/* Add Activity Form */}
              {showActivityForm && (
                <div className="mb-6 p-4 bg-[#12122a] rounded-lg border border-gray-800/50">
                  <div className="grid gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Activity Type</label>
                      <select
                        value={activityType}
                        onChange={(e) => setActivityType(e.target.value)}
                        className="w-full px-4 py-3 bg-[#1a1a2e] border border-gray-800/50 rounded-xl text-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500/40"
                      >
                        {ACTIVITY_TYPES.map(type => (
                          <option key={type.value} value={type.value}>
                            {type.icon} {type.value}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Notes</label>
                      <textarea
                        value={activityNotes}
                        onChange={(e) => setActivityNotes(e.target.value)}
                        rows={3}
                        placeholder="What happened?"
                        className="w-full px-4 py-3 bg-[#1a1a2e] border border-gray-800/50 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500/40"
                      />
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={handleAddActivity}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-all"
                      >
                        Add Activity
                      </button>
                      <button
                        onClick={() => setShowActivityForm(false)}
                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg font-medium transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Activity List */}
              {activities.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  No activities yet. Add your first activity above.
                </div>
              ) : (
                <div className="space-y-3">
                  {activities.map(activity => {
                    const actType = ACTIVITY_TYPES.find(t => t.value === activity.type)
                    return (
                      <div
                        key={activity.id}
                        className="flex items-start gap-4 p-4 bg-[#12122a] rounded-lg border border-gray-800/50"
                      >
                        <div className="flex-shrink-0 w-10 h-10 bg-red-600/20 rounded-full flex items-center justify-center text-xl">
                          {actType?.icon || '📝'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold text-gray-500 uppercase">{activity.type}</span>
                            <span className="text-gray-700">•</span>
                            <span className="text-xs text-gray-600">
                              {new Date(activity.created_at).toLocaleDateString('en-AU', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </span>
                          </div>
                          <p className="text-sm text-gray-300">{activity.notes}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Quick Actions & Status */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-[#1a1a2e] rounded-xl p-6 border border-gray-800/50">
              <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={() => handleQuickAction('Phone Call')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
                >
                  <Phone size={18} /> Log Call
                </button>
                <button
                  onClick={() => navigate('/portal/outreach')}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
                >
                  <Mail size={18} /> Send Email
                </button>
                <button
                  onClick={() => handleQuickAction('Meeting')}
                  className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
                >
                  <Calendar size={18} /> Schedule Meeting
                </button>
                <button
                  onClick={() => setShowActivityForm(true)}
                  className="w-full bg-gray-700 hover:bg-gray-600 text-white px-4 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
                >
                  <Plus size={18} /> Add Note
                </button>
              </div>
            </div>

            {/* Change Status */}
            {editing && (
              <div className="bg-[#1a1a2e] rounded-xl p-6 border border-gray-800/50">
                <h3 className="text-lg font-bold text-white mb-4">Change Stage</h3>
                <select
                  value={editedLead.stage}
                  onChange={(e) => setEditedLead({ ...editedLead, stage: e.target.value })}
                  className="w-full px-4 py-3 bg-[#12122a] border border-gray-800/50 rounded-xl text-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500/40"
                >
                  {STAGE_OPTIONS.map(stage => (
                    <option key={stage.value} value={stage.value}>
                      {stage.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Tags */}
            <div className="bg-[#1a1a2e] rounded-xl p-6 border border-gray-800/50">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Tag size={18} /> Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {lead.tags?.map((tag, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-xs font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
