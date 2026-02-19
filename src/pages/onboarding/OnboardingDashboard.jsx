import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  getOnboardingSessions, 
  createOnboardingSession, 
  createOnboardingFromContract,
  markOnboardingReviewed,
  deleteOnboardingSession,
  getContracts
} from '../../lib/supabase'

export default function OnboardingDashboard() {
  const navigate = useNavigate()
  const [sessions, setSessions] = useState([])
  const [contracts, setContracts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedSession, setSelectedSession] = useState(null)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showContractModal, setShowContractModal] = useState(false)
  const [creating, setCreating] = useState(false)
  
  // New session form
  const [newSession, setNewSession] = useState({
    org_name: '',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    event_name: '',
    event_date: '',
    event_location: ''
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [sessionsData, contractsData] = await Promise.all([
        getOnboardingSessions(),
        getContracts()
      ])
      setSessions(sessionsData || [])
      setContracts(contractsData || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateSession = async (e) => {
    e.preventDefault()
    setCreating(true)
    try {
      const data = await createOnboardingSession(newSession)
      setSessions(prev => [data, ...prev])
      setShowCreateModal(false)
      setNewSession({
        org_name: '', contact_name: '', contact_email: '', contact_phone: '',
        event_name: '', event_date: '', event_location: ''
      })
    } catch (err) {
      alert('Error: ' + err.message)
    } finally {
      setCreating(false)
    }
  }

  const handleCreateFromContract = async (contractId) => {
    try {
      const data = await createOnboardingFromContract(contractId)
      setSessions(prev => [data, ...prev])
      setShowContractModal(false)
      alert('Onboarding session created!')
    } catch (err) {
      alert('Error: ' + err.message)
    }
  }

  const handleMarkReviewed = async (sessionId) => {
    try {
      await markOnboardingReviewed(sessionId, 'Brandon Hibbs')
      await loadData()
      setSelectedSession(null)
    } catch (err) {
      alert('Error: ' + err.message)
    }
  }

  const handleDeleteSession = async (sessionId) => {
    if (!confirm('Are you sure you want to delete this onboarding session? This cannot be undone.')) {
      return
    }
    try {
      await deleteOnboardingSession(sessionId)
      setSessions(prev => prev.filter(s => s.id !== sessionId))
      setSelectedSession(null)
      alert('Session deleted successfully')
    } catch (err) {
      alert('Error deleting session: ' + err.message)
    }
  }

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-500/20 text-yellow-400',
      in_progress: 'bg-blue-500/20 text-blue-400',
      submitted: 'bg-green-500/20 text-green-400',
      reviewed: 'bg-purple-500/20 text-purple-400'
    }
    const labels = {
      pending: 'Pending',
      in_progress: 'In Progress',
      submitted: 'Submitted',
      reviewed: 'Reviewed'
    }
    return (
      <span className={`text-xs px-2 py-1 rounded-full ${styles[status] || styles.pending}`}>
        {labels[status] || 'Unknown'}
      </span>
    )
  }

  const getCompletionPercent = (session) => {
    const progress = session.checklist_progress || {}
    const total = 18
    const completed = Object.values(progress).filter(v => v).length
    return Math.round((completed / total) * 100)
  }

  const filteredSessions = sessions.filter(s => {
    if (filter !== 'all' && s.status !== filter) return false
    if (search && !s.org_name?.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const portalUrl = (token) => {
    const base = window.location.origin
    return `${base}/#/onboarding/${token}`
  }

  const signedContracts = contracts.filter(c => c.status === 'signed')

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/portal/contracts')}
              className="text-gray-400 hover:text-white"
            >
              ← Back
            </button>
            <h1 className="text-xl font-bold">Partner Onboarding</h1>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setShowContractModal(true)}
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2"
            >
              📄 From Contract
            </button>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2"
            >
              ➕ New Session
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Total', value: sessions.length, color: 'orange' },
            { label: 'Pending', value: sessions.filter(s => s.status === 'pending').length, color: 'yellow' },
            { label: 'Submitted', value: sessions.filter(s => s.status === 'submitted').length, color: 'green' },
            { label: 'Reviewed', value: sessions.filter(s => s.status === 'reviewed').length, color: 'purple' },
          ].map((stat, i) => (
            <div key={i} className="bg-gray-800 rounded-xl p-4 border border-gray-700">
              <div className={`text-3xl font-bold text-${stat.color}-500`}>{stat.value}</div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-6xl mx-auto px-4 mb-6">
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Search organizations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 max-w-xs px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-orange-500 focus:outline-none"
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-orange-500 focus:outline-none"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="submitted">Submitted</option>
            <option value="reviewed">Reviewed</option>
          </select>
        </div>
      </div>

      {/* Sessions List */}
      <div className="max-w-6xl mx-auto px-4 pb-12">
        {filteredSessions.length === 0 ? (
          <div className="bg-gray-800 rounded-xl p-12 text-center border border-gray-700">
            <div className="text-4xl mb-4">📋</div>
            <p className="text-gray-400">No onboarding sessions found</p>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="mt-4 bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg text-sm"
            >
              Create First Session
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredSessions.map((session) => (
              <div
                key={session.id}
                onClick={() => setSelectedSession(session)}
                className="bg-gray-800 rounded-xl p-5 border border-gray-700 hover:border-gray-600 cursor-pointer transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{session.org_name}</h3>
                      {getStatusBadge(session.status)}
                    </div>
                    <div className="flex gap-4 text-sm text-gray-500">
                      {session.event_name && <span>📅 {session.event_name}</span>}
                      {session.contact_name && <span>👤 {session.contact_name}</span>}
                      {session.event_date && <span>🗓 {new Date(session.event_date).toLocaleDateString()}</span>}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-orange-500">{getCompletionPercent(session)}%</div>
                    <div className="text-xs text-gray-500">Complete</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Session Detail Modal */}
      {selectedSession && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedSession(null)}
        >
          <div
            className="bg-gray-800 rounded-2xl max-w-xl w-full max-h-[90vh] overflow-auto border border-gray-700"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-700 flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold mb-2">{selectedSession.org_name}</h2>
                {getStatusBadge(selectedSession.status)}
              </div>
              <button onClick={() => setSelectedSession(null)} className="text-gray-500 hover:text-white text-xl">✕</button>
            </div>

            <div className="p-6 space-y-6">
              {/* Event Info */}
              <div>
                <h4 className="text-xs text-gray-500 uppercase mb-2">Event Details</h4>
                <div className="space-y-1 text-sm">
                  {selectedSession.event_name && <p><strong>Event:</strong> {selectedSession.event_name}</p>}
                  {selectedSession.event_date && <p><strong>Date:</strong> {new Date(selectedSession.event_date).toLocaleDateString()}</p>}
                  {selectedSession.event_location && <p><strong>Location:</strong> {selectedSession.event_location}</p>}
                </div>
              </div>

              {/* Contact Info */}
              <div>
                <h4 className="text-xs text-gray-500 uppercase mb-2">Contact</h4>
                <div className="space-y-1 text-sm">
                  {selectedSession.contact_name && <p><strong>Name:</strong> {selectedSession.contact_name}</p>}
                  {selectedSession.contact_email && (
                    <p><strong>Email:</strong> <a href={`mailto:${selectedSession.contact_email}`} className="text-orange-500">{selectedSession.contact_email}</a></p>
                  )}
                  {selectedSession.contact_phone && (
                    <p><strong>Phone:</strong> <a href={`tel:${selectedSession.contact_phone}`} className="text-orange-500">{selectedSession.contact_phone}</a></p>
                  )}
                </div>
              </div>

              {/* Progress */}
              <div>
                <h4 className="text-xs text-gray-500 uppercase mb-2">Progress</h4>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-orange-500"
                      style={{ width: `${getCompletionPercent(selectedSession)}%` }}
                    />
                  </div>
                  <span className="font-bold text-orange-500">{getCompletionPercent(selectedSession)}%</span>
                </div>
              </div>

              {/* Collected Data */}
              {selectedSession.collected_data && Object.keys(selectedSession.collected_data).length > 0 && (
                <div>
                  <h4 className="text-xs text-gray-500 uppercase mb-2">Collected Information</h4>
                  <pre className="bg-gray-900 p-3 rounded-lg text-xs overflow-auto max-h-40 text-gray-400">
                    {JSON.stringify(selectedSession.collected_data, null, 2)}
                  </pre>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-700">
                <a 
                  href={portalUrl(selectedSession.share_token)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm"
                >
                  🔗 View Portal
                </a>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(portalUrl(selectedSession.share_token))
                    alert('Link copied!')
                  }}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm"
                >
                  📋 Copy Link
                </button>
                {selectedSession.status === 'submitted' && (
                  <button
                    onClick={() => handleMarkReviewed(selectedSession.id)}
                    className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg text-sm"
                  >
                    ✓ Mark Reviewed
                  </button>
                )}
                <button
                  onClick={() => handleDeleteSession(selectedSession.id)}
                  className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg text-sm"
                >
                  🗑 Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Session Modal */}
      {showCreateModal && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowCreateModal(false)}
        >
          <div
            className="bg-gray-800 rounded-2xl max-w-md w-full border border-gray-700"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-700">
              <h2 className="text-lg font-bold">Create Onboarding Session</h2>
            </div>
            <form onSubmit={handleCreateSession} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Organization Name *</label>
                  <input
                    required
                    value={newSession.org_name}
                    onChange={(e) => setNewSession({ ...newSession, org_name: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-orange-500 focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Contact Name</label>
                    <input
                      value={newSession.contact_name}
                      onChange={(e) => setNewSession({ ...newSession, contact_name: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-orange-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Contact Email</label>
                    <input
                      type="email"
                      value={newSession.contact_email}
                      onChange={(e) => setNewSession({ ...newSession, contact_email: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-orange-500 focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Event Name</label>
                  <input
                    value={newSession.event_name}
                    onChange={(e) => setNewSession({ ...newSession, event_name: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-orange-500 focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Event Date</label>
                    <input
                      type="date"
                      value={newSession.event_date}
                      onChange={(e) => setNewSession({ ...newSession, event_date: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-orange-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Location</label>
                    <input
                      value={newSession.event_location}
                      onChange={(e) => setNewSession({ ...newSession, event_location: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-orange-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg disabled:opacity-50"
                >
                  {creating ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create From Contract Modal */}
      {showContractModal && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowContractModal(false)}
        >
          <div
            className="bg-gray-800 rounded-2xl max-w-md w-full border border-gray-700"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-700">
              <h2 className="text-lg font-bold">Create From Signed Contract</h2>
            </div>
            <div className="p-6">
              {signedContracts.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No signed contracts available</p>
              ) : (
                <div className="space-y-2 max-h-80 overflow-auto">
                  {signedContracts.map((contract) => {
                    const hasSession = sessions.some(s => s.contract_id === contract.id)
                    return (
                      <button
                        key={contract.id}
                        onClick={() => !hasSession && handleCreateFromContract(contract.id)}
                        disabled={hasSession}
                        className={`w-full p-4 rounded-xl text-left transition-colors ${
                          hasSession 
                            ? 'bg-gray-700/50 cursor-not-allowed opacity-50' 
                            : 'bg-gray-700 hover:bg-gray-600'
                        }`}
                      >
                        <div className="font-medium">{contract.org_name}</div>
                        <div className="text-sm text-gray-400">{contract.promoter_name}</div>
                        {hasSession && <div className="text-xs text-orange-500 mt-1">Session already exists</div>}
                      </button>
                    )
                  })}
                </div>
              )}
              <button
                onClick={() => setShowContractModal(false)}
                className="w-full mt-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
