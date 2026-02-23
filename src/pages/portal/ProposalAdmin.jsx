import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, Search, Filter, Eye, Edit2, Trash2, Send, Copy, Check,
  FileText, Calendar, DollarSign, Building2, User, Mail, Phone,
  ChevronDown, ExternalLink, Clock, TrendingUp, AlertCircle,
  Video, Globe, Users, Award, Star, CheckCircle2, Zap
} from 'lucide-react'
import { 
  getProposals, createProposal, updateProposal, deleteProposal,
  updateProposalStatus, createLeadFromProposal, sendProposalEmail
} from '../../lib/supabase'

// Default package options
const PACKAGES = [
  { id: 'standard', name: 'Standard', description: 'Single-camera livestream coverage' },
  { id: 'premium', name: 'Premium', description: 'Multi-camera with graphics package' },
  { id: 'enterprise', name: 'Enterprise', description: 'Full production with replays & commentary' }
]

// Default inclusions by package
const DEFAULT_INCLUSIONS = {
  standard: [
    'Professional single-camera livestream',
    'Basic graphics overlay',
    'YouTube/Facebook streaming',
    'Post-event highlight reel (60-90s)'
  ],
  premium: [
    'Multi-camera setup (2-3 cameras)',
    'Professional graphics package',
    'Multi-platform streaming',
    'On-screen score/time overlays',
    'Post-event highlight reel (2-3 mins)',
    'Full event replay access'
  ],
  enterprise: [
    'Full multi-camera production (4+ cameras)',
    'Premium graphics & animations',
    'Live instant replays',
    'Commentary integration',
    'Multi-platform streaming',
    'Athlete social media clips',
    'Full event replay with chapters',
    'Dedicated production manager'
  ]
}

// Event types
const EVENT_TYPES = [
  'Combat Sports',
  'MMA',
  'Boxing',
  'BJJ/Grappling',
  'Muay Thai/Kickboxing',
  'Bodybuilding/Fitness',
  'Powerlifting',
  'CrossFit',
  'Other'
]

// Status badge colors
const STATUS_COLORS = {
  draft: 'bg-gray-500/20 text-gray-300',
  sent: 'bg-blue-500/20 text-blue-300',
  viewed: 'bg-yellow-500/20 text-yellow-300',
  accepted: 'bg-green-500/20 text-green-300',
  declined: 'bg-red-500/20 text-red-300'
}

export default function ProposalAdmin() {
  const [proposals, setProposals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingProposal, setEditingProposal] = useState(null)
  const [copiedSlug, setCopiedSlug] = useState(null)
  const [emailModal, setEmailModal] = useState(null) // Proposal to send email for
  const [sendingEmail, setSendingEmail] = useState(false)

  // Load proposals
  useEffect(() => {
    loadProposals()
  }, [])

  async function loadProposals() {
    try {
      setLoading(true)
      const data = await getProposals()
      setProposals(data || [])
    } catch (err) {
      console.error('Error loading proposals:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Filter proposals
  const filteredProposals = proposals.filter(p => {
    const matchesSearch = 
      p.org_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.contact_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.event_name?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  // Copy proposal link
  function copyProposalLink(slug) {
    const url = `${window.location.origin}/#/proposals/${slug}`
    navigator.clipboard.writeText(url)
    setCopiedSlug(slug)
    setTimeout(() => setCopiedSlug(null), 2000)
  }

  // Handle status change
  async function handleStatusChange(id, newStatus) {
    try {
      await updateProposalStatus(id, newStatus)
      setProposals(prev => prev.map(p => 
        p.id === id ? { ...p, status: newStatus } : p
      ))
    } catch (err) {
      console.error('Error updating status:', err)
    }
  }

  // Handle delete
  async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this proposal?')) return
    
    try {
      await deleteProposal(id)
      setProposals(prev => prev.filter(p => p.id !== id))
    } catch (err) {
      console.error('Error deleting proposal:', err)
    }
  }

  // Handle send email
  async function handleSendEmail(proposalId, customMessage = '') {
    setSendingEmail(true)
    try {
      await sendProposalEmail(proposalId, null, customMessage)
      // Update local state to reflect sent status
      setProposals(prev => prev.map(p => 
        p.id === proposalId ? { ...p, status: 'sent', sent_at: new Date().toISOString() } : p
      ))
      setEmailModal(null)
      alert('Email sent successfully!')
    } catch (err) {
      console.error('Error sending email:', err)
      alert('Failed to send email: ' + err.message)
    } finally {
      setSendingEmail(false)
    }
  }

  // Stats
  const stats = {
    total: proposals.length,
    sent: proposals.filter(p => p.status === 'sent').length,
    viewed: proposals.filter(p => p.status === 'viewed').length,
    accepted: proposals.filter(p => p.status === 'accepted').length,
    totalViews: proposals.reduce((sum, p) => sum + (p.views || 0), 0)
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Proposal Generator</h1>
            <p className="text-gray-400 mt-1">Create and manage custom proposals for prospects</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-orange-600 rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            <Plus size={20} />
            New Proposal
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <StatCard label="Total" value={stats.total} icon={FileText} />
          <StatCard label="Sent" value={stats.sent} icon={Send} color="blue" />
          <StatCard label="Viewed" value={stats.viewed} icon={Eye} color="yellow" />
          <StatCard label="Accepted" value={stats.accepted} icon={Check} color="green" />
          <StatCard label="Total Views" value={stats.totalViews} icon={TrendingUp} color="purple" />
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search proposals..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-red-500/50"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-red-500/50"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="viewed">Viewed</option>
            <option value="accepted">Accepted</option>
            <option value="declined">Declined</option>
          </select>
        </div>

        {/* Proposals List */}
        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading proposals...</div>
        ) : error ? (
          <div className="text-center py-12 text-red-400">{error}</div>
        ) : filteredProposals.length === 0 ? (
          <div className="text-center py-12">
            <FileText size={48} className="mx-auto text-gray-600 mb-4" />
            <p className="text-gray-400">No proposals found</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 text-red-400 hover:text-red-300"
            >
              Create your first proposal
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredProposals.map(proposal => (
              <ProposalCard
                key={proposal.id}
                proposal={proposal}
                onEdit={() => setEditingProposal(proposal)}
                onDelete={() => handleDelete(proposal.id)}
                onCopyLink={() => copyProposalLink(proposal.slug)}
                onStatusChange={(status) => handleStatusChange(proposal.id, status)}
                onSendEmail={() => setEmailModal(proposal)}
                copied={copiedSlug === proposal.slug}
              />
            ))}
          </div>
        )}

        {/* Create/Edit Modal */}
        <AnimatePresence>
          {(showCreateModal || editingProposal) && (
            <ProposalModal
              proposal={editingProposal}
              onClose={() => {
                setShowCreateModal(false)
                setEditingProposal(null)
              }}
              onSave={async (data) => {
                if (editingProposal) {
                  await updateProposal(editingProposal.id, data)
                } else {
                  await createProposal(data)
                }
                loadProposals()
                setShowCreateModal(false)
                setEditingProposal(null)
              }}
            />
          )}
        </AnimatePresence>

        {/* Send Email Modal */}
        <AnimatePresence>
          {emailModal && (
            <SendEmailModal
              proposal={emailModal}
              sending={sendingEmail}
              onClose={() => setEmailModal(null)}
              onSend={(customMessage) => handleSendEmail(emailModal.id, customMessage)}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// Stat Card Component
function StatCard({ label, value, icon: Icon, color = 'gray' }) {
  const colors = {
    gray: 'from-gray-600 to-gray-700',
    blue: 'from-blue-600 to-blue-700',
    yellow: 'from-yellow-600 to-yellow-700',
    green: 'from-green-600 to-green-700',
    purple: 'from-purple-600 to-purple-700'
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg bg-gradient-to-br ${colors[color]}`}>
          <Icon size={20} />
        </div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-sm text-gray-400">{label}</p>
        </div>
      </div>
    </div>
  )
}

// Proposal Card Component
function ProposalCard({ proposal, onEdit, onDelete, onCopyLink, onStatusChange, onSendEmail, copied }) {
  const [showStatusMenu, setShowStatusMenu] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-white/20 transition-colors"
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Main Info */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-xl font-semibold">{proposal.org_name}</h3>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[proposal.status]}`}>
              {proposal.status}
            </span>
          </div>
          
          <div className="flex flex-wrap gap-4 text-sm text-gray-400">
            {proposal.event_name && (
              <span className="flex items-center gap-1">
                <Calendar size={14} />
                {proposal.event_name}
              </span>
            )}
            {proposal.contact_name && (
              <span className="flex items-center gap-1">
                <User size={14} />
                {proposal.contact_name}
              </span>
            )}
            {proposal.price && (
              <span className="flex items-center gap-1">
                <DollarSign size={14} />
                ${proposal.price.toLocaleString()}
              </span>
            )}
            {proposal.views > 0 && (
              <span className="flex items-center gap-1">
                <Eye size={14} />
                {proposal.views} view{proposal.views !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Status Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowStatusMenu(!showStatusMenu)}
              className="flex items-center gap-1 px-3 py-1.5 bg-white/5 rounded-lg hover:bg-white/10 transition-colors text-sm"
            >
              Status
              <ChevronDown size={14} />
            </button>
            {showStatusMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowStatusMenu(false)} />
                <div className="absolute right-0 top-full mt-1 bg-[#1a1a2e] border border-white/10 rounded-lg shadow-xl z-20 min-w-[120px]">
                  {['draft', 'sent', 'viewed', 'accepted', 'declined'].map(status => (
                    <button
                      key={status}
                      onClick={() => {
                        onStatusChange(status)
                        setShowStatusMenu(false)
                      }}
                      className={`w-full text-left px-3 py-2 hover:bg-white/5 text-sm capitalize ${
                        proposal.status === status ? 'text-red-400' : ''
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Send Email */}
          {proposal.contact_email && (
            <button
              onClick={onSendEmail}
              className="p-2 bg-white/5 rounded-lg hover:bg-blue-500/20 hover:text-blue-400 transition-colors"
              title={`Send to ${proposal.contact_email}`}
            >
              <Send size={18} />
            </button>
          )}

          {/* Copy Link */}
          <button
            onClick={onCopyLink}
            className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
            title="Copy proposal link"
          >
            {copied ? <Check size={18} className="text-green-400" /> : <Copy size={18} />}
          </button>

          {/* View */}
          <a
            href={`/#/proposals/${proposal.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
            title="View proposal"
          >
            <ExternalLink size={18} />
          </a>

          {/* Edit */}
          <button
            onClick={onEdit}
            className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
            title="Edit proposal"
          >
            <Edit2 size={18} />
          </button>

          {/* Delete */}
          <button
            onClick={onDelete}
            className="p-2 bg-white/5 rounded-lg hover:bg-red-500/20 hover:text-red-400 transition-colors"
            title="Delete proposal"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

// Create/Edit Modal Component with Live Preview
function ProposalModal({ proposal, onClose, onSave }) {
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('form') // 'form' or 'preview' for mobile
  const [form, setForm] = useState({
    org_name: proposal?.org_name || '',
    contact_name: proposal?.contact_name || '',
    contact_email: proposal?.contact_email || '',
    contact_phone: proposal?.contact_phone || '',
    event_name: proposal?.event_name || '',
    event_date: proposal?.event_date || '',
    event_type: proposal?.event_type || 'Combat Sports',
    package: proposal?.package || 'premium',
    price: proposal?.price || '',
    inclusions: proposal?.inclusions || DEFAULT_INCLUSIONS.premium,
    custom_notes: proposal?.custom_notes || '',
    status: proposal?.status || 'draft'
  })

  // Update inclusions when package changes
  function handlePackageChange(pkg) {
    setForm(prev => ({
      ...prev,
      package: pkg,
      inclusions: DEFAULT_INCLUSIONS[pkg] || []
    }))
  }

  // Add custom inclusion
  function addInclusion() {
    setForm(prev => ({
      ...prev,
      inclusions: [...(prev.inclusions || []), '']
    }))
  }

  // Update inclusion
  function updateInclusion(index, value) {
    setForm(prev => ({
      ...prev,
      inclusions: prev.inclusions.map((inc, i) => i === index ? value : inc)
    }))
  }

  // Remove inclusion
  function removeInclusion(index) {
    setForm(prev => ({
      ...prev,
      inclusions: prev.inclusions.filter((_, i) => i !== index)
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    try {
      await onSave({
        ...form,
        price: form.price ? parseFloat(form.price) : null,
        inclusions: form.inclusions.filter(inc => inc.trim())
      })
    } catch (err) {
      console.error('Error saving proposal:', err)
      alert('Error saving proposal: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/90 flex items-stretch z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.98, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.98, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        className="flex flex-col lg:flex-row w-full h-full"
      >
        {/* Mobile Tab Switcher */}
        <div className="lg:hidden flex border-b border-white/10 bg-[#12121a]">
          <button
            onClick={() => setActiveTab('form')}
            className={`flex-1 py-3 text-center font-medium ${activeTab === 'form' ? 'text-red-400 border-b-2 border-red-400' : 'text-gray-400'}`}
          >
            Edit Form
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`flex-1 py-3 text-center font-medium ${activeTab === 'preview' ? 'text-red-400 border-b-2 border-red-400' : 'text-gray-400'}`}
          >
            Live Preview
          </button>
        </div>

        {/* Left: Form */}
        <div className={`lg:w-1/2 bg-[#12121a] flex flex-col overflow-hidden ${activeTab === 'form' ? 'flex' : 'hidden lg:flex'}`}>
          <form onSubmit={handleSubmit} className="flex flex-col h-full">
            {/* Header */}
            <div className="shrink-0 border-b border-white/10 p-4 lg:p-6 flex items-center justify-between">
              <h2 className="text-xl lg:text-2xl font-bold">
                {proposal ? 'Edit Proposal' : 'Create New Proposal'}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Form Content */}
            <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6">
              {/* Organization Details */}
              <section>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Building2 size={20} className="text-red-400" />
                  Organization Details
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Organization Name *</label>
                    <input
                      type="text"
                      required
                      value={form.org_name}
                      onChange={e => setForm(prev => ({ ...prev, org_name: e.target.value }))}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-red-500/50"
                      placeholder="e.g., Inception Fight Series"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Event Type</label>
                    <select
                      value={form.event_type}
                      onChange={e => setForm(prev => ({ ...prev, event_type: e.target.value }))}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-red-500/50"
                    >
                      {EVENT_TYPES.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </section>

              {/* Contact Details */}
              <section>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <User size={20} className="text-red-400" />
                  Contact Details
                </h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Contact Name</label>
                    <input
                      type="text"
                      value={form.contact_name}
                      onChange={e => setForm(prev => ({ ...prev, contact_name: e.target.value }))}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-red-500/50"
                      placeholder="John Smith"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Email</label>
                    <input
                      type="email"
                      value={form.contact_email}
                      onChange={e => setForm(prev => ({ ...prev, contact_email: e.target.value }))}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-red-500/50"
                      placeholder="john@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Phone</label>
                    <input
                      type="tel"
                      value={form.contact_phone}
                      onChange={e => setForm(prev => ({ ...prev, contact_phone: e.target.value }))}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-red-500/50"
                      placeholder="0400 000 000"
                    />
                  </div>
                </div>
              </section>

              {/* Event Details */}
              <section>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Calendar size={20} className="text-red-400" />
                  Event Details
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Event Name</label>
                    <input
                      type="text"
                      value={form.event_name}
                      onChange={e => setForm(prev => ({ ...prev, event_name: e.target.value }))}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-red-500/50"
                      placeholder="e.g., Fight Night 12"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Event Date</label>
                    <input
                      type="date"
                      value={form.event_date}
                      onChange={e => setForm(prev => ({ ...prev, event_date: e.target.value }))}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-red-500/50"
                    />
                  </div>
                </div>
              </section>

              {/* Package & Pricing */}
              <section>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <DollarSign size={20} className="text-red-400" />
                  Package & Pricing
                </h3>
                
                {/* Package Selection */}
                <div className="grid md:grid-cols-3 gap-3 mb-4">
                  {PACKAGES.map(pkg => (
                    <button
                      key={pkg.id}
                      type="button"
                      onClick={() => handlePackageChange(pkg.id)}
                      className={`p-3 rounded-xl border-2 text-left transition-all ${
                        form.package === pkg.id
                          ? 'border-red-500 bg-red-500/10'
                          : 'border-white/10 hover:border-white/20'
                      }`}
                    >
                      <p className="font-semibold text-sm">{pkg.name}</p>
                      <p className="text-xs text-gray-400 mt-1">{pkg.description}</p>
                    </button>
                  ))}
                </div>

                {/* Price */}
                <div className="max-w-xs">
                  <label className="block text-sm text-gray-400 mb-1">Price (AUD)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                    <input
                      type="number"
                      value={form.price}
                      onChange={e => setForm(prev => ({ ...prev, price: e.target.value }))}
                      className="w-full pl-8 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-red-500/50"
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Leave blank for "Contact for pricing"</p>
                </div>
              </section>

              {/* Inclusions */}
              <section>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <CheckCircle2 size={20} className="text-red-400" />
                  What's Included
                </h3>
                <div className="space-y-2">
                  {(form.inclusions || []).map((inclusion, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={inclusion}
                        onChange={e => updateInclusion(index, e.target.value)}
                        className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-red-500/50 text-sm"
                        placeholder="Inclusion item..."
                      />
                      <button
                        type="button"
                        onClick={() => removeInclusion(index)}
                        className="p-2 text-gray-400 hover:text-red-400"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addInclusion}
                    className="text-sm text-red-400 hover:text-red-300 flex items-center gap-1"
                  >
                    <Plus size={16} />
                    Add inclusion
                  </button>
                </div>
              </section>

              {/* Custom Notes */}
              <section>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <FileText size={20} className="text-red-400" />
                  Custom Notes
                </h3>
                <textarea
                  value={form.custom_notes}
                  onChange={e => setForm(prev => ({ ...prev, custom_notes: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-red-500/50 resize-none text-sm"
                  placeholder="Any additional notes or custom terms..."
                />
              </section>

              {/* Status */}
              <section>
                <label className="block text-sm text-gray-400 mb-1">Status</label>
                <select
                  value={form.status}
                  onChange={e => setForm(prev => ({ ...prev, status: e.target.value }))}
                  className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-red-500/50"
                >
                  <option value="draft">Draft</option>
                  <option value="sent">Sent</option>
                  <option value="viewed">Viewed</option>
                  <option value="accepted">Accepted</option>
                  <option value="declined">Declined</option>
                </select>
              </section>
            </div>

            {/* Footer */}
            <div className="shrink-0 border-t border-white/10 p-4 lg:p-6 flex justify-end gap-4 bg-[#12121a]">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || !form.org_name}
                className="px-6 py-2 bg-gradient-to-r from-red-600 to-orange-600 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {saving ? 'Saving...' : (proposal ? 'Update Proposal' : 'Create Proposal')}
              </button>
            </div>
          </form>
        </div>

        {/* Right: Live Preview */}
        <div className={`lg:w-1/2 bg-[#0a0a0f] flex flex-col overflow-hidden border-l border-white/10 ${activeTab === 'preview' ? 'flex' : 'hidden lg:flex'}`}>
          {/* Preview Header */}
          <div className="shrink-0 border-b border-white/10 p-4 lg:p-6 bg-[#0a0a0f]">
            <div className="flex items-center gap-2 text-gray-400">
              <Eye size={18} />
              <span className="font-medium">Live Preview</span>
              <span className="text-xs text-gray-500 ml-auto">Updates as you type</span>
            </div>
          </div>

          {/* Preview Content */}
          <div className="flex-1 overflow-y-auto">
            <ProposalPreview form={form} />
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// Live Preview Component (matches ProposalView)
function ProposalPreview({ form }) {
  const STATS = [
    { value: '25+', label: 'Events', icon: Video },
    { value: '4', label: 'Countries', icon: Globe },
    { value: '50K+', label: 'Viewers', icon: Users },
    { value: '100%', label: 'Satisfaction', icon: Award }
  ]

  return (
    <div className="min-h-full bg-[#0a0a0f] text-white">
      {/* Hero Section */}
      <section className="relative py-12 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-red-600/10 via-transparent to-transparent" />
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-red-600/20 rounded-full blur-3xl" />
        
        <div className="max-w-2xl mx-auto text-center relative z-10">
          <p className="text-red-400 font-medium mb-3 tracking-wide text-sm">
            PREPARED FOR
          </p>
          <h1 className="text-2xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
            {form.org_name || 'Organization Name'}
          </h1>
          
          {(form.event_name || form.event_date) && (
            <p className="text-lg text-gray-300 mb-6">
              {form.event_name || 'Event Name'}
              {form.event_date && (
                <span className="text-gray-500"> • {new Date(form.event_date).toLocaleDateString('en-AU', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</span>
              )}
            </p>
          )}

          <p className="text-sm text-gray-400 max-w-xl mx-auto">
            Professional livestream production that brings your events to audiences worldwide — 
            at zero upfront cost to you.
          </p>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-4 border-y border-white/10 bg-white/5">
        <div className="max-w-4xl mx-auto px-6">
          <div className="grid grid-cols-4 gap-4">
            {STATS.map((stat, i) => (
              <div key={i} className="text-center">
                <stat.icon className="w-4 h-4 mx-auto mb-1 text-red-400" />
                <p className="text-lg font-bold">{stat.value}</p>
                <p className="text-xs text-gray-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Package Details */}
      <section className="py-8 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-2xl p-6">
            {/* Package Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 pb-6 border-b border-white/10">
              <div>
                <p className="text-red-400 font-medium mb-1 text-sm">YOUR PACKAGE</p>
                <h2 className="text-xl font-bold capitalize">
                  {form.package || 'Custom'} Package
                </h2>
                {form.event_type && (
                  <p className="text-gray-400 text-sm mt-1">{form.event_type}</p>
                )}
              </div>
              
              {/* Price */}
              <div className="text-right">
                {form.price ? (
                  <>
                    <p className="text-2xl font-bold text-white">
                      ${parseFloat(form.price).toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-400">AUD</p>
                  </>
                ) : (
                  <p className="text-lg font-medium text-gray-300">Contact for pricing</p>
                )}
              </div>
            </div>

            {/* Inclusions */}
            {form.inclusions && form.inclusions.filter(i => i.trim()).length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <CheckCircle2 className="text-green-400" size={16} />
                  What's Included
                </h3>
                <ul className="grid md:grid-cols-2 gap-2">
                  {form.inclusions.filter(i => i.trim()).map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                      <span className="text-gray-300">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Custom Notes */}
            {form.custom_notes && (
              <div className="bg-white/5 rounded-xl p-4 mb-6">
                <h3 className="font-semibold mb-2 text-sm">Additional Notes</h3>
                <p className="text-gray-300 whitespace-pre-wrap text-sm">{form.custom_notes}</p>
              </div>
            )}

            {/* Zero Cost Model */}
            <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-500/30 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <DollarSign className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-green-400 mb-1">
                    Zero Upfront Cost Model
                  </h3>
                  <p className="text-gray-300 text-xs">
                    FFM operates on a revenue-share model. You pay nothing upfront — 
                    we earn through pay-per-view ticket sales.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-8 px-6 bg-white/5">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-lg font-bold text-center mb-6">How It Works</h2>
          
          <div className="grid grid-cols-3 gap-4">
            {[
              { step: '1', title: 'We Produce', icon: Video },
              { step: '2', title: 'Fans Watch', icon: Users },
              { step: '3', title: 'You Earn', icon: TrendingUp }
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="w-10 h-10 mx-auto mb-2 bg-gradient-to-br from-red-600 to-orange-600 rounded-xl flex items-center justify-center">
                  <item.icon size={18} />
                </div>
                <h3 className="text-sm font-semibold">{item.title}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-8 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-gradient-to-br from-red-600/20 to-orange-600/20 border border-red-500/30 rounded-2xl p-6 text-center">
            <h2 className="text-xl font-bold mb-2">Ready to Get Started?</h2>
            <p className="text-gray-300 mb-4 text-sm">
              Let's discuss how we can bring professional livestream production to {form.org_name || 'your organization'}.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-orange-600 rounded-xl font-medium text-sm">
                <Phone size={16} />
                0411 934 935
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-xl font-medium text-sm">
                <Mail size={16} />
                Email Us
              </div>
            </div>

            {form.contact_name && (
              <p className="mt-4 text-xs text-gray-400">
                Prepared for {form.contact_name}
                {form.contact_email && ` (${form.contact_email})`}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-4 px-6 border-t border-white/10 text-center text-gray-400 text-xs">
        <p>© {new Date().getFullYear()} Fit Focus Media</p>
      </footer>
    </div>
  )
}

// Send Email Modal Component
function SendEmailModal({ proposal, sending, onClose, onSend }) {
  const [customMessage, setCustomMessage] = useState('')

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        className="bg-[#12121a] border border-white/10 rounded-2xl max-w-md w-full p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-blue-500/20 rounded-xl">
            <Send size={24} className="text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Send Proposal</h2>
            <p className="text-sm text-gray-400">Email to {proposal.contact_email}</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Proposal Summary */}
          <div className="bg-white/5 rounded-xl p-4">
            <p className="font-semibold">{proposal.org_name}</p>
            {proposal.event_name && (
              <p className="text-sm text-gray-400">{proposal.event_name}</p>
            )}
            {proposal.price && (
              <p className="text-lg font-bold text-red-400 mt-2">
                ${proposal.price.toLocaleString()} AUD
              </p>
            )}
          </div>

          {/* Custom Message */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Add a personal message (optional)
            </label>
            <textarea
              value={customMessage}
              onChange={e => setCustomMessage(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-blue-500/50 resize-none text-sm"
              placeholder="e.g., Looking forward to working with you on this event..."
            />
          </div>

          {/* Sent Before Notice */}
          {proposal.sent_at && (
            <div className="flex items-center gap-2 text-sm text-yellow-400 bg-yellow-500/10 rounded-lg px-3 py-2">
              <Clock size={16} />
              Previously sent {new Date(proposal.sent_at).toLocaleDateString()}
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onSend(customMessage)}
            disabled={sending}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {sending ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send size={18} />
                Send Email
              </>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
