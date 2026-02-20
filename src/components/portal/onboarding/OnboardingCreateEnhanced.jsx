import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, 
  Plus, 
  FileText, 
  Eye, 
  Check, 
  X,
  Upload,
  AlertCircle,
  ChevronRight,
  Settings,
  Sparkles
} from 'lucide-react'
import { 
  createOnboardingSession, 
  getContracts,
  getLeadByOrgName 
} from '../../../lib/supabase'

// Import checklist config from OnboardingPortal
const checklistConfig = [
  {
    id: 'branding',
    category: 'Branding & Assets',
    icon: '✨',
    items: [
      { id: 'logo', label: 'High-resolution logo', type: 'file', priority: 'essential' },
      { id: 'brand_kit', label: 'Brand kit (colors, fonts, guidelines)', type: 'file', priority: 'important' },
      { id: 'event_graphics', label: 'Event-specific graphics/banners', type: 'file', priority: 'important' },
      { id: 'sponsor_logos', label: 'Sponsor logos for on-screen display', type: 'file', priority: 'nice' },
    ]
  },
  {
    id: 'athletes',
    category: 'Athlete Information',
    icon: '👥',
    items: [
      { id: 'registration_list', label: 'Registration list (Name, Email, Phone, Instagram)', type: 'file', priority: 'essential' },
      { id: 'notable_athletes', label: 'Notable athletes to feature', type: 'textarea', priority: 'important' },
    ]
  },
  {
    id: 'venue',
    category: 'Venue & Technical',
    icon: '📍',
    items: [
      { id: 'floor_plan', label: 'Venue floor plan (mat layout)', type: 'file', priority: 'essential' },
      { id: 'internet_specs', label: 'Internet specs (upload speed, hardwired access)', type: 'textarea', priority: 'essential' },
      { id: 'power_locations', label: 'Power outlet locations', type: 'textarea', priority: 'important' },
      { id: 'load_in_time', label: 'Load-in/crew access time', type: 'text', priority: 'important' },
      { id: 'venue_contact', label: 'Venue contact for event day', type: 'contact', priority: 'important' },
    ]
  },
  {
    id: 'event',
    category: 'Event Operations',
    icon: '📅',
    items: [
      { id: 'mat_count', label: 'Number of mats running', type: 'number', priority: 'essential' },
      { id: 'schedule', label: 'Event schedule/run sheet', type: 'file', priority: 'essential' },
      { id: 'bracket_system', label: 'Bracket/scoring system used', type: 'text', priority: 'important' },
      { id: 'match_comms_method', label: 'How match order will be communicated', type: 'textarea', priority: 'important' },
    ]
  },
  {
    id: 'social',
    category: 'Social & Promotion',
    icon: '📸',
    items: [
      { id: 'org_instagram', label: 'Organization Instagram', type: 'text', priority: 'important' },
      { id: 'org_facebook', label: 'Organization Facebook', type: 'text', priority: 'nice' },
      { id: 'org_website', label: 'Organization Website', type: 'text', priority: 'nice' },
      { id: 'existing_content', label: 'Existing footage/photos for promos', type: 'file', priority: 'nice' },
      { id: 'existing_content_links', label: 'Links to existing footage (Google Drive, Dropbox, etc.)', type: 'textarea', priority: 'nice' },
    ]
  },
]

export default function OnboardingCreateEnhanced() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1) // 1: Contract Selection, 2: Customize Checklist, 3: Preview & Confirm
  const [contracts, setContracts] = useState([])
  const [selectedContract, setSelectedContract] = useState(null)
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  
  // Form data (pre-filled from contract)
  const [formData, setFormData] = useState({
    orgName: '',
    contactName: '',
    email: '',
    phone: '',
    eventName: '',
    eventDate: '',
    eventLocation: '',
    contractId: '',
    // Pre-filled social from CRM
    orgInstagram: '',
    orgFacebook: '',
    orgWebsite: ''
  })
  
  // Checklist customization
  const [checklistItems, setChecklistItems] = useState(() => {
    // Initialize all items as enabled with default priorities
    const items = {}
    checklistConfig.forEach(cat => {
      items[cat.id] = {}
      cat.items.forEach(item => {
        items[cat.id][item.id] = {
          enabled: true,
          priority: item.priority,
          alreadyHave: false,
          prefilledValue: '' // For pre-filled data
        }
      })
    })
    return items
  })
  
  const [errors, setErrors] = useState({})

  useEffect(() => {
    loadContracts()
  }, [])

  const loadContracts = async () => {
    try {
      const data = await getContracts()
      const signedContracts = data.filter(c => c.status === 'signed')
      setContracts(signedContracts)
    } catch (error) {
      console.error('Error loading contracts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleContractSelect = async (e) => {
    const contractId = e.target.value
    if (!contractId) {
      setSelectedContract(null)
      resetForm()
      return
    }

    const contract = contracts.find(c => c.id === contractId)
    if (!contract) return

    setSelectedContract(contract)
    const contractData = contract.contract_data || {}

    // Try to get CRM data for additional info
    let crmLead = null
    try {
      crmLead = await getLeadByOrgName(contract.org_name)
    } catch (err) {
      console.log('No CRM lead found:', err)
    }

    const crmContact = crmLead?.contact || {}

    // Auto-populate form
    setFormData({
      orgName: contract.org_name || '',
      contactName: contract.promoter_name || contract.contact_name || '',
      email: contract.promoter_email || contract.contact_email || '',
      phone: contract.promoter_phone || contract.contact_phone || '',
      eventName: contractData.event_name || '',
      eventDate: contractData.event_date || '',
      eventLocation: contractData.event_location || contractData.venue || '',
      contractId: contract.id,
      // Social data from CRM first, then contract
      orgInstagram: formatInstagram(crmContact.instagram || contractData.org_instagram || ''),
      orgFacebook: formatFacebook(crmContact.facebook || contractData.org_facebook || ''),
      orgWebsite: crmContact.website || contractData.org_website || ''
    })

    // Pre-fill social fields in checklist
    updateChecklistPrefill('social', 'org_instagram', formatInstagram(crmContact.instagram || contractData.org_instagram || ''))
    updateChecklistPrefill('social', 'org_facebook', formatFacebook(crmContact.facebook || contractData.org_facebook || ''))
    updateChecklistPrefill('social', 'org_website', crmContact.website || contractData.org_website || '')
  }

  const formatInstagram = (value) => {
    if (!value) return ''
    return value.startsWith('@') ? value : `@${value}`
  }

  const formatFacebook = (value) => {
    if (!value) return ''
    if (value.startsWith('http')) return value
    const handle = value.replace(/^@/, '').replace(/^\//, '')
    return `https://facebook.com/${handle}`
  }

  const resetForm = () => {
    setFormData({
      orgName: '', contactName: '', email: '', phone: '',
      eventName: '', eventDate: '', eventLocation: '', contractId: '',
      orgInstagram: '', orgFacebook: '', orgWebsite: ''
    })
  }

  const updateChecklistPrefill = (categoryId, itemId, value) => {
    setChecklistItems(prev => ({
      ...prev,
      [categoryId]: {
        ...prev[categoryId],
        [itemId]: {
          ...prev[categoryId][itemId],
          prefilledValue: value
        }
      }
    }))
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const toggleChecklistItem = (categoryId, itemId) => {
    setChecklistItems(prev => ({
      ...prev,
      [categoryId]: {
        ...prev[categoryId],
        [itemId]: {
          ...prev[categoryId][itemId],
          enabled: !prev[categoryId][itemId].enabled
        }
      }
    }))
  }

  const toggleAlreadyHave = (categoryId, itemId) => {
    setChecklistItems(prev => ({
      ...prev,
      [categoryId]: {
        ...prev[categoryId],
        [itemId]: {
          ...prev[categoryId][itemId],
          alreadyHave: !prev[categoryId][itemId].alreadyHave
        }
      }
    }))
  }

  const updatePriority = (categoryId, itemId, priority) => {
    setChecklistItems(prev => ({
      ...prev,
      [categoryId]: {
        ...prev[categoryId],
        [itemId]: {
          ...prev[categoryId][itemId],
          priority: priority
        }
      }
    }))
  }

  const validateStep1 = () => {
    const newErrors = {}
    
    if (!formData.orgName.trim()) {
      newErrors.orgName = 'Organization name is required'
    }
    if (!formData.contactName.trim()) {
      newErrors.contactName = 'Contact name is required'
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }
    if (!formData.eventDate) {
      newErrors.eventDate = 'Event date is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (step === 1) {
      if (validateStep1()) {
        setStep(2)
      }
    } else if (step === 2) {
      setStep(3)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    } else {
      navigate('/portal/onboarding')
    }
  }

  const handleCreate = async () => {
    setCreating(true)
    try {
      // Build collected_data with pre-filled values
      const collectedData = {}
      
      checklistConfig.forEach(cat => {
        cat.items.forEach(item => {
          const itemConfig = checklistItems[cat.id][item.id]
          if (itemConfig.enabled && itemConfig.prefilledValue) {
            if (!collectedData[cat.id]) {
              collectedData[cat.id] = {}
            }
            collectedData[cat.id][item.id] = itemConfig.prefilledValue
          }
        })
      })

      // Build checklist_config with enabled/disabled items and priorities
      const checklistConfig_custom = {}
      Object.keys(checklistItems).forEach(catId => {
        checklistConfig_custom[catId] = {}
        Object.keys(checklistItems[catId]).forEach(itemId => {
          checklistConfig_custom[catId][itemId] = {
            enabled: checklistItems[catId][itemId].enabled,
            priority: checklistItems[catId][itemId].priority,
            alreadyHave: checklistItems[catId][itemId].alreadyHave
          }
        })
      })

      const sessionData = {
        org_name: formData.orgName,
        contact_name: formData.contactName,
        contact_email: formData.email,
        contact_phone: formData.phone,
        event_name: formData.eventName,
        event_date: formData.eventDate,
        event_location: formData.eventLocation,
        contract_id: formData.contractId || null,
        collected_data: collectedData,
        checklist_config: checklistConfig_custom
      }

      const newSession = await createOnboardingSession(sessionData)
      
      // Navigate to the new session detail view
      navigate(`/portal/onboarding/${newSession.id}`)
    } catch (error) {
      console.error('Error creating onboarding:', error)
      alert('Failed to create onboarding session: ' + error.message)
    } finally {
      setCreating(false)
    }
  }

  const getPriorityBadge = (priority) => {
    const styles = {
      essential: 'bg-red-500/20 text-red-400 border-red-500/30',
      important: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      nice: 'bg-green-500/20 text-green-400 border-green-500/30'
    }
    const labels = { 
      essential: 'Essential', 
      important: 'Important', 
      nice: 'Nice to have' 
    }
    return (
      <span className={`text-xs px-2 py-1 rounded-full border ${styles[priority]}`}>
        {labels[priority]}
      </span>
    )
  }

  const getEnabledCount = () => {
    let enabled = 0
    let total = 0
    Object.keys(checklistItems).forEach(catId => {
      Object.keys(checklistItems[catId]).forEach(itemId => {
        total++
        if (checklistItems[catId][itemId].enabled) enabled++
      })
    })
    return { enabled, total }
  }

  const counts = getEnabledCount()

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0d0d1a] to-[#1a1a2e] flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0d0d1a] to-[#1a1a2e] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft size={20} />
          Back
        </button>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-4">
            {[
              { num: 1, label: 'Contract & Details' },
              { num: 2, label: 'Customize Checklist' },
              { num: 3, label: 'Preview & Confirm' }
            ].map((s, i) => (
              <div key={s.num} className="flex items-center gap-4">
                <div className={`flex items-center gap-3 ${step >= s.num ? 'opacity-100' : 'opacity-40'}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 ${
                    step >= s.num 
                      ? 'bg-red-500 border-red-500 text-white' 
                      : 'bg-transparent border-gray-600 text-gray-600'
                  }`}>
                    {step > s.num ? <Check size={20} /> : s.num}
                  </div>
                  <div className="hidden sm:block">
                    <div className="text-sm font-medium text-white">{s.label}</div>
                  </div>
                </div>
                {i < 2 && (
                  <ChevronRight size={20} className={step > s.num ? 'text-red-500' : 'text-gray-600'} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Form/Checklist Config */}
          <div className="lg:col-span-2">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="bg-gradient-to-br from-[#1a1a2e] to-[#16162a] border border-gray-800/50 rounded-xl p-6"
            >
              {/* Step 1: Contract Selection & Basic Info */}
              {step === 1 && (
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
                      <FileText className="text-red-500" size={24} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-white">Contract & Details</h2>
                      <p className="text-gray-400">Select contract or enter details manually</p>
                    </div>
                  </div>

                  <div className="space-y-5">
                    {/* Contract Selection */}
                    {contracts.length > 0 && (
                      <div>
                        <label className="block text-sm font-bold text-white mb-2">
                          <Sparkles className="inline mr-2" size={16} />
                          Link to Existing Contract (Auto-fill)
                        </label>
                        <select
                          value={selectedContract?.id || ''}
                          onChange={handleContractSelect}
                          className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors"
                        >
                          <option value="">Create from scratch</option>
                          <optgroup label="Signed Contracts">
                            {contracts.map(contract => (
                              <option key={contract.id} value={contract.id}>
                                {contract.org_name} - {contract.promoter_name || contract.contact_name}
                              </option>
                            ))}
                          </optgroup>
                        </select>
                        {selectedContract && (
                          <p className="text-sm text-green-400 mt-2 flex items-center gap-2">
                            <Check size={16} /> Contract data loaded! Review and edit below.
                          </p>
                        )}
                      </div>
                    )}

                    {/* Organization Name */}
                    <div>
                      <label htmlFor="orgName" className="block text-sm font-bold text-white mb-2">
                        Organization Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="orgName"
                        name="orgName"
                        value={formData.orgName}
                        onChange={handleChange}
                        placeholder="e.g., Eternal MMA"
                        className={`w-full bg-gray-900/50 border rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none transition-colors ${
                          errors.orgName ? 'border-red-500' : 'border-gray-700 focus:border-red-500'
                        }`}
                      />
                      {errors.orgName && (
                        <p className="text-red-400 text-sm mt-1">{errors.orgName}</p>
                      )}
                    </div>

                    {/* Contact Name */}
                    <div>
                      <label htmlFor="contactName" className="block text-sm font-bold text-white mb-2">
                        Contact Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="contactName"
                        name="contactName"
                        value={formData.contactName}
                        onChange={handleChange}
                        placeholder="Primary contact person"
                        className={`w-full bg-gray-900/50 border rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none transition-colors ${
                          errors.contactName ? 'border-red-500' : 'border-gray-700 focus:border-red-500'
                        }`}
                      />
                      {errors.contactName && (
                        <p className="text-red-400 text-sm mt-1">{errors.contactName}</p>
                      )}
                    </div>

                    {/* Email & Phone */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="email" className="block text-sm font-bold text-white mb-2">
                          Email <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="contact@org.com"
                          className={`w-full bg-gray-900/50 border rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none transition-colors ${
                            errors.email ? 'border-red-500' : 'border-gray-700 focus:border-red-500'
                          }`}
                        />
                        {errors.email && (
                          <p className="text-red-400 text-sm mt-1">{errors.email}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="phone" className="block text-sm font-bold text-white mb-2">
                          Phone
                        </label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="0400 000 000"
                          className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors"
                        />
                      </div>
                    </div>

                    {/* Event Name */}
                    <div>
                      <label htmlFor="eventName" className="block text-sm font-bold text-white mb-2">
                        Event Name
                      </label>
                      <input
                        type="text"
                        id="eventName"
                        name="eventName"
                        value={formData.eventName}
                        onChange={handleChange}
                        placeholder="e.g., Summer Showdown 2026"
                        className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors"
                      />
                    </div>

                    {/* Event Date & Location */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="eventDate" className="block text-sm font-bold text-white mb-2">
                          Event Date <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          id="eventDate"
                          name="eventDate"
                          value={formData.eventDate}
                          onChange={handleChange}
                          className={`w-full bg-gray-900/50 border rounded-lg px-4 py-3 text-white focus:outline-none transition-colors ${
                            errors.eventDate ? 'border-red-500' : 'border-gray-700 focus:border-red-500'
                          }`}
                        />
                        {errors.eventDate && (
                          <p className="text-red-400 text-sm mt-1">{errors.eventDate}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="eventLocation" className="block text-sm font-bold text-white mb-2">
                          Event Location
                        </label>
                        <input
                          type="text"
                          id="eventLocation"
                          name="eventLocation"
                          value={formData.eventLocation}
                          onChange={handleChange}
                          placeholder="e.g., Brisbane Convention Centre"
                          className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Customize Checklist */}
              {step === 2 && (
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
                      <Settings className="text-red-500" size={24} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-white">Customize Checklist</h2>
                      <p className="text-gray-400">Toggle items, set priorities, mark what they already have</p>
                    </div>
                  </div>

                  <div className="mb-6 bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                    <p className="text-blue-200 text-sm flex items-start gap-2">
                      <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
                      <span>
                        <strong>Disabled items won't show to the client.</strong> Use "Already Have" to pre-check items they've provided. 
                        Change priorities to indicate urgency.
                      </span>
                    </p>
                  </div>

                  <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                    {checklistConfig.map(category => (
                      <div key={category.id} className="bg-gray-900/50 rounded-lg border border-gray-700">
                        <div className="px-4 py-3 border-b border-gray-700 bg-gray-800/50">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{category.icon}</span>
                            <h3 className="font-bold text-white">{category.category}</h3>
                            <span className="text-sm text-gray-400 ml-auto">
                              {category.items.filter(item => checklistItems[category.id][item.id].enabled).length}/{category.items.length} enabled
                            </span>
                          </div>
                        </div>
                        <div className="p-4 space-y-3">
                          {category.items.map(item => {
                            const config = checklistItems[category.id][item.id]
                            return (
                              <div 
                                key={item.id} 
                                className={`p-3 rounded-lg border transition-all ${
                                  config.enabled 
                                    ? 'bg-gray-800/50 border-gray-700' 
                                    : 'bg-gray-900/30 border-gray-800 opacity-50'
                                }`}
                              >
                                <div className="flex items-start gap-3">
                                  {/* Enable/Disable Toggle */}
                                  <button
                                    onClick={() => toggleChecklistItem(category.id, item.id)}
                                    className={`flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                                      config.enabled 
                                        ? 'bg-red-500 border-red-500' 
                                        : 'bg-transparent border-gray-600'
                                    }`}
                                  >
                                    {config.enabled && <Check size={16} className="text-white" />}
                                  </button>

                                  <div className="flex-1">
                                    <div className="flex items-center justify-between mb-2">
                                      <span className={`font-medium ${config.enabled ? 'text-white' : 'text-gray-500'}`}>
                                        {item.label}
                                      </span>
                                      {config.prefilledValue && (
                                        <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full border border-green-500/30">
                                          Pre-filled ✓
                                        </span>
                                      )}
                                    </div>

                                    {config.enabled && (
                                      <div className="flex items-center gap-2 mt-2">
                                        {/* Priority Selector */}
                                        <select
                                          value={config.priority}
                                          onChange={(e) => updatePriority(category.id, item.id, e.target.value)}
                                          className="text-xs bg-gray-900 border border-gray-700 rounded px-2 py-1 text-white focus:outline-none focus:border-red-500"
                                        >
                                          <option value="essential">Essential</option>
                                          <option value="important">Important</option>
                                          <option value="nice">Nice to have</option>
                                        </select>

                                        {/* Already Have Toggle */}
                                        <button
                                          onClick={() => toggleAlreadyHave(category.id, item.id)}
                                          className={`text-xs px-3 py-1 rounded border transition-colors ${
                                            config.alreadyHave 
                                              ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                                              : 'bg-gray-900 text-gray-400 border-gray-700'
                                          }`}
                                        >
                                          {config.alreadyHave ? '✓ Already Have' : 'Mark as "Already Have"'}
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 3: Preview & Confirm */}
              {step === 3 && (
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
                      <Eye className="text-red-500" size={24} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-white">Review & Confirm</h2>
                      <p className="text-gray-400">Everything looks good? Create the onboarding session!</p>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="space-y-4 mb-6">
                    <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                      <h3 className="font-bold text-white mb-3">Organization Details</h3>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-gray-500">Organization:</span>
                          <div className="text-white font-medium">{formData.orgName}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Contact:</span>
                          <div className="text-white font-medium">{formData.contactName}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Email:</span>
                          <div className="text-white font-medium">{formData.email}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Phone:</span>
                          <div className="text-white font-medium">{formData.phone || 'Not provided'}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Event:</span>
                          <div className="text-white font-medium">{formData.eventName || 'Not specified'}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Date:</span>
                          <div className="text-white font-medium">{formData.eventDate}</div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                      <h3 className="font-bold text-white mb-3">Checklist Configuration</h3>
                      <div className="grid grid-cols-3 gap-3 text-center">
                        <div>
                          <div className="text-2xl font-bold text-green-500">{counts.enabled}</div>
                          <div className="text-xs text-gray-500">Enabled Items</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-gray-500">{counts.total - counts.enabled}</div>
                          <div className="text-xs text-gray-500">Disabled Items</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-blue-500">
                            {Object.keys(checklistItems).reduce((sum, catId) => 
                              sum + Object.keys(checklistItems[catId]).filter(itemId => 
                                checklistItems[catId][itemId].prefilledValue
                              ).length, 0
                            )}
                          </div>
                          <div className="text-xs text-gray-500">Pre-filled</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Warning if too many disabled */}
                  {counts.enabled < counts.total / 2 && (
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-6">
                      <p className="text-yellow-200 text-sm flex items-start gap-2">
                        <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
                        <span>
                          You've disabled more than half the checklist items. Make sure this is intentional — 
                          clients need these details for quality coverage.
                        </span>
                      </p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>

            {/* Navigation Buttons */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleBack}
                className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-all font-medium border border-gray-700"
              >
                {step === 1 ? 'Cancel' : 'Back'}
              </button>
              {step < 3 ? (
                <button
                  onClick={handleNext}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-bold rounded-lg transition-all shadow-lg shadow-red-500/20 flex items-center justify-center gap-2"
                >
                  Next Step
                  <ChevronRight size={20} />
                </button>
              ) : (
                <button
                  onClick={handleCreate}
                  disabled={creating}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 disabled:from-gray-600 disabled:to-gray-500 text-white font-bold rounded-lg transition-all shadow-lg shadow-green-500/20 flex items-center justify-center gap-2"
                >
                  {creating ? (
                    <>
                      <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus size={20} />
                      Create Onboarding Session
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Right Column: Live Preview */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <div className="bg-gradient-to-br from-[#1a1a2e] to-[#16162a] border border-gray-800/50 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Eye size={20} className="text-red-500" />
                  <h3 className="font-bold text-white">Client Preview</h3>
                </div>
                <p className="text-xs text-gray-500 mb-4">This is what {formData.orgName || 'the client'} will see</p>

                {/* Mini Preview */}
                <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
                  {/* Preview Header */}
                  <div className="bg-gray-800 px-3 py-2 border-b border-gray-700">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-red-500 rounded-lg"></div>
                      <div>
                        <div className="text-xs font-semibold text-white">Fit Focus Media</div>
                        <div className="text-[10px] text-gray-500">{formData.orgName || 'Organization'}</div>
                      </div>
                    </div>
                  </div>

                  {/* Preview Content */}
                  <div className="p-4 space-y-3 max-h-[500px] overflow-y-auto">
                    <div className="text-sm">
                      <div className="text-gray-500 text-xs mb-2">Event Details</div>
                      <div className="text-white font-medium">{formData.eventName || 'Event Name'}</div>
                      <div className="text-gray-400 text-xs">{formData.eventDate || 'Date not set'}</div>
                    </div>

                    <div className="border-t border-gray-800 pt-3">
                      <div className="text-xs text-gray-500 mb-2">
                        Checklist ({counts.enabled} items)
                      </div>
                      {checklistConfig.map(category => {
                        const enabledItems = category.items.filter(item => 
                          checklistItems[category.id][item.id].enabled
                        )
                        if (enabledItems.length === 0) return null
                        
                        return (
                          <div key={category.id} className="mb-3">
                            <div className="text-xs font-medium text-white flex items-center gap-2 mb-1">
                              <span>{category.icon}</span>
                              {category.category}
                            </div>
                            <div className="space-y-1">
                              {enabledItems.map(item => {
                                const config = checklistItems[category.id][item.id]
                                return (
                                  <div key={item.id} className="flex items-center gap-2 text-xs">
                                    <div className={`w-3 h-3 rounded border ${
                                      config.alreadyHave 
                                        ? 'bg-green-500 border-green-500' 
                                        : 'border-gray-600'
                                    }`}>
                                      {config.alreadyHave && <Check size={10} className="text-white" />}
                                    </div>
                                    <span className={`flex-1 ${config.alreadyHave ? 'text-gray-500 line-through' : 'text-gray-400'}`}>
                                      {item.label}
                                    </span>
                                    {config.prefilledValue && (
                                      <span className="text-green-400">✓</span>
                                    )}
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-gray-900/50 rounded p-2 text-center border border-gray-800">
                    <div className="text-lg font-bold text-red-500">{counts.enabled}</div>
                    <div className="text-gray-500">Items to collect</div>
                  </div>
                  <div className="bg-gray-900/50 rounded p-2 text-center border border-gray-800">
                    <div className="text-lg font-bold text-green-500">
                      {Object.keys(checklistItems).reduce((sum, catId) => 
                        sum + Object.keys(checklistItems[catId]).filter(itemId => 
                          checklistItems[catId][itemId].prefilledValue || checklistItems[catId][itemId].alreadyHave
                        ).length, 0
                      )}
                    </div>
                    <div className="text-gray-500">Pre-filled/Have</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
