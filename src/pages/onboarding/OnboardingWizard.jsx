import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createOnboardingSession, createOnboardingFromContract, getContracts, updateOnboardingSession } from '../../lib/supabase'

// Default checklist structure
const defaultChecklistConfig = [
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

const fieldTypes = [
  { value: 'text', label: 'Text Input' },
  { value: 'textarea', label: 'Long Text (Textarea)' },
  { value: 'file', label: 'File Upload' },
  { value: 'number', label: 'Number Input' },
  { value: 'contact', label: 'Contact Info (Name/Phone/Email)' },
]

const priorityLevels = [
  { value: 'essential', label: 'Essential', color: 'red' },
  { value: 'important', label: 'Important', color: 'yellow' },
  { value: 'nice', label: 'Nice to have', color: 'green' },
]

export default function OnboardingWizard({ onClose, onComplete }) {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [contracts, setContracts] = useState([])
  const [loadingContracts, setLoadingContracts] = useState(false)

  // Step 1: Basic Details
  const [detailsMode, setDetailsMode] = useState('manual') // 'manual' or 'contract'
  const [selectedContractId, setSelectedContractId] = useState(null)
  const [basicDetails, setBasicDetails] = useState({
    org_name: '',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    event_name: '',
    event_date: '',
    event_location: ''
  })

  // Step 2: Checklist Customization
  const [checklistConfig, setChecklistConfig] = useState(JSON.parse(JSON.stringify(defaultChecklistConfig)))
  const [editingField, setEditingField] = useState(null) // { categoryId, itemId }
  const [addingCustomField, setAddingCustomField] = useState(null) // categoryId or null
  const [customFieldForm, setCustomFieldForm] = useState({
    label: '',
    type: 'text',
    priority: 'important'
  })

  // Load contracts when switching to contract mode
  const loadContracts = async () => {
    setLoadingContracts(true)
    try {
      const data = await getContracts()
      setContracts(data.filter(c => c.status === 'signed'))
    } catch (err) {
      console.error('Failed to load contracts:', err)
    } finally {
      setLoadingContracts(false)
    }
  }

  // Handle contract selection
  const handleContractSelect = (contractId) => {
    setSelectedContractId(contractId)
    const contract = contracts.find(c => c.id === contractId)
    if (contract) {
      const contractData = contract.contract_data || {}
      setBasicDetails({
        org_name: contract.org_name || '',
        contact_name: contract.promoter_name || '',
        contact_email: contract.promoter_email || '',
        contact_phone: contract.promoter_phone || '',
        event_name: contractData.event_name || '',
        event_date: contractData.event_date || '',
        event_location: contractData.event_location || ''
      })
    }
  }

  // Toggle field enabled/disabled
  const toggleFieldEnabled = (categoryId, itemId) => {
    setChecklistConfig(prev => prev.map(cat => {
      if (cat.id !== categoryId) return cat
      return {
        ...cat,
        items: cat.items.map(item => {
          if (item.id !== itemId) return item
          return { ...item, enabled: item.enabled === false ? true : false }
        })
      }
    }))
  }

  // Toggle "Already Have"
  const toggleAlreadyHave = (categoryId, itemId) => {
    setChecklistConfig(prev => prev.map(cat => {
      if (cat.id !== categoryId) return cat
      return {
        ...cat,
        items: cat.items.map(item => {
          if (item.id !== itemId) return item
          return { ...item, alreadyHave: !item.alreadyHave }
        })
      }
    }))
  }

  // Update field priority
  const updateFieldPriority = (categoryId, itemId, priority) => {
    setChecklistConfig(prev => prev.map(cat => {
      if (cat.id !== categoryId) return cat
      return {
        ...cat,
        items: cat.items.map(item => {
          if (item.id !== itemId) return item
          return { ...item, priority }
        })
      }
    }))
  }

  // Start editing a field
  const startEditField = (categoryId, itemId) => {
    const category = checklistConfig.find(c => c.id === categoryId)
    const item = category?.items.find(i => i.id === itemId)
    if (item) {
      setEditingField({ categoryId, itemId })
      setCustomFieldForm({
        label: item.label,
        type: item.type,
        priority: item.priority
      })
    }
  }

  // Save edited field
  const saveEditedField = () => {
    if (!editingField) return
    const { categoryId, itemId } = editingField
    
    setChecklistConfig(prev => prev.map(cat => {
      if (cat.id !== categoryId) return cat
      return {
        ...cat,
        items: cat.items.map(item => {
          if (item.id !== itemId) return item
          return {
            ...item,
            label: customFieldForm.label,
            type: customFieldForm.type,
            priority: customFieldForm.priority
          }
        })
      }
    }))
    
    setEditingField(null)
    setCustomFieldForm({ label: '', type: 'text', priority: 'important' })
  }

  // Remove field
  const removeField = (categoryId, itemId) => {
    if (!confirm('Are you sure you want to remove this field? This cannot be undone.')) return
    
    setChecklistConfig(prev => prev.map(cat => {
      if (cat.id !== categoryId) return cat
      return {
        ...cat,
        items: cat.items.filter(item => item.id !== itemId)
      }
    }))
  }

  // Start adding custom field
  const startAddCustomField = (categoryId) => {
    setAddingCustomField(categoryId)
    setCustomFieldForm({ label: '', type: 'text', priority: 'important' })
  }

  // Add custom field
  const addCustomField = () => {
    if (!addingCustomField || !customFieldForm.label.trim()) return
    
    const newId = `custom_${Date.now()}`
    
    setChecklistConfig(prev => prev.map(cat => {
      if (cat.id !== addingCustomField) return cat
      return {
        ...cat,
        items: [
          ...cat.items,
          {
            id: newId,
            label: customFieldForm.label,
            type: customFieldForm.type,
            priority: customFieldForm.priority,
            isCustom: true,
            enabled: true
          }
        ]
      }
    }))
    
    setAddingCustomField(null)
    setCustomFieldForm({ label: '', type: 'text', priority: 'important' })
  }

  // Format checklist_config for Supabase
  const formatChecklistConfigForDB = () => {
    const config = {}
    checklistConfig.forEach(category => {
      config[category.id] = {}
      category.items.forEach(item => {
        config[category.id][item.id] = {
          enabled: item.enabled !== false,
          priority: item.priority,
          alreadyHave: item.alreadyHave || false,
          label: item.label,
          type: item.type,
          isCustom: item.isCustom || false
        }
      })
    })
    return config
  }

  // Create session
  const handleCreate = async () => {
    setLoading(true)
    try {
      let sessionData
      
      if (detailsMode === 'contract' && selectedContractId) {
        // Use contract creation with custom checklist
        sessionData = await createOnboardingFromContract(selectedContractId)
        // Update with custom checklist
        await updateOnboardingSession(sessionData.id, {
          checklist_config: formatChecklistConfigForDB()
        })
      } else {
        // Manual creation
        sessionData = await createOnboardingSession({
          ...basicDetails,
          checklist_config: formatChecklistConfigForDB()
        })
      }
      
      if (onComplete) onComplete(sessionData)
      if (onClose) onClose()
    } catch (err) {
      alert('Error creating session: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const canProceedStep1 = detailsMode === 'contract' 
    ? selectedContractId !== null
    : basicDetails.org_name.trim() !== ''

  const getPriorityBadge = (priority) => {
    const config = priorityLevels.find(p => p.value === priority)
    return (
      <span className={`text-xs px-2 py-1 rounded-full bg-${config.color}-500/20 text-${config.color}-400`}>
        {config.label}
      </span>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-auto border border-gray-700">
        {/* Header */}
        <div className="sticky top-0 bg-gray-800 border-b border-gray-700 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-xl font-bold text-white">Create Onboarding Session</h2>
            <p className="text-sm text-gray-400">Step {currentStep} of 3</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-xl">✕</button>
        </div>

        {/* Progress Bar */}
        <div className="bg-gray-900 h-2">
          <div 
            className="h-full bg-orange-500 transition-all duration-300"
            style={{ width: `${(currentStep / 3) * 100}%` }}
          />
        </div>

        {/* Step Content */}
        <div className="p-6">
          {/* STEP 1: Contract & Details */}
          {currentStep === 1 && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Choose Your Setup Method</h3>
              
              {/* Mode Selection */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <button
                  onClick={() => setDetailsMode('manual')}
                  className={`p-4 rounded-xl border-2 transition-colors ${
                    detailsMode === 'manual'
                      ? 'border-orange-500 bg-orange-500/10'
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <div className="text-3xl mb-2">✏️</div>
                  <div className="font-semibold text-white">Manual Entry</div>
                  <div className="text-xs text-gray-400">Enter details from scratch</div>
                </button>
                <button
                  onClick={() => {
                    setDetailsMode('contract')
                    if (contracts.length === 0) loadContracts()
                  }}
                  className={`p-4 rounded-xl border-2 transition-colors ${
                    detailsMode === 'contract'
                      ? 'border-orange-500 bg-orange-500/10'
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <div className="text-3xl mb-2">📄</div>
                  <div className="font-semibold text-white">From Contract</div>
                  <div className="text-xs text-gray-400">Pre-fill from signed contract</div>
                </button>
              </div>

              {/* Manual Entry Form */}
              {detailsMode === 'manual' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Organization Name *</label>
                    <input
                      required
                      value={basicDetails.org_name}
                      onChange={(e) => setBasicDetails({ ...basicDetails, org_name: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-orange-500 focus:outline-none"
                      placeholder="e.g., Queensland BJJ Championships"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Contact Name</label>
                      <input
                        value={basicDetails.contact_name}
                        onChange={(e) => setBasicDetails({ ...basicDetails, contact_name: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-orange-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Contact Email</label>
                      <input
                        type="email"
                        value={basicDetails.contact_email}
                        onChange={(e) => setBasicDetails({ ...basicDetails, contact_email: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-orange-500 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Contact Phone</label>
                    <input
                      type="tel"
                      value={basicDetails.contact_phone}
                      onChange={(e) => setBasicDetails({ ...basicDetails, contact_phone: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-orange-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Event Name</label>
                    <input
                      value={basicDetails.event_name}
                      onChange={(e) => setBasicDetails({ ...basicDetails, event_name: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-orange-500 focus:outline-none"
                      placeholder="e.g., QLD State Championships 2026"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Event Date</label>
                      <input
                        type="date"
                        value={basicDetails.event_date}
                        onChange={(e) => setBasicDetails({ ...basicDetails, event_date: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-orange-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Event Location</label>
                      <input
                        value={basicDetails.event_location}
                        onChange={(e) => setBasicDetails({ ...basicDetails, event_location: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-orange-500 focus:outline-none"
                        placeholder="e.g., Brisbane Convention Centre"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Contract Selection */}
              {detailsMode === 'contract' && (
                <div>
                  {loadingContracts ? (
                    <div className="text-center py-8">
                      <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full mx-auto"></div>
                    </div>
                  ) : contracts.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-400">No signed contracts available</p>
                      <button
                        onClick={() => setDetailsMode('manual')}
                        className="mt-4 text-orange-500 hover:underline"
                      >
                        Switch to manual entry
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-96 overflow-auto">
                      {contracts.map((contract) => (
                        <button
                          key={contract.id}
                          onClick={() => handleContractSelect(contract.id)}
                          className={`w-full p-4 rounded-xl text-left transition-colors ${
                            selectedContractId === contract.id
                              ? 'bg-orange-500/20 border-2 border-orange-500'
                              : 'bg-gray-700 border-2 border-transparent hover:bg-gray-600'
                          }`}
                        >
                          <div className="font-medium text-white">{contract.org_name}</div>
                          <div className="text-sm text-gray-400">{contract.promoter_name}</div>
                          {contract.contract_data?.event_name && (
                            <div className="text-xs text-orange-500 mt-1">{contract.contract_data.event_name}</div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* STEP 2: Customize Checklist */}
          {currentStep === 2 && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Customize Checklist</h3>
              <p className="text-sm text-gray-400 mb-6">
                Enable/disable fields, adjust priorities, add custom fields, or remove items you don't need
              </p>

              <div className="space-y-4">
                {checklistConfig.map((category) => (
                  <div key={category.id} className="bg-gray-900 rounded-xl border border-gray-700 overflow-hidden">
                    {/* Category Header */}
                    <div className="bg-gray-800 p-4 flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center text-xl">
                        {category.icon}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-white">{category.category}</div>
                        <div className="text-xs text-gray-500">{category.items.length} items</div>
                      </div>
                    </div>

                    {/* Items */}
                    <div className="p-4 space-y-3">
                      {category.items.map((item) => (
                        <div
                          key={item.id}
                          className={`p-3 rounded-lg border transition-colors ${
                            item.enabled === false
                              ? 'bg-gray-800/50 border-gray-700 opacity-50'
                              : 'bg-gray-800 border-gray-700'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <input
                                  type="checkbox"
                                  checked={item.enabled !== false}
                                  onChange={() => toggleFieldEnabled(category.id, item.id)}
                                  className="w-4 h-4 rounded border-gray-600 text-orange-500 focus:ring-orange-500"
                                />
                                {editingField?.categoryId === category.id && editingField?.itemId === item.id ? (
                                  <input
                                    value={customFieldForm.label}
                                    onChange={(e) => setCustomFieldForm({ ...customFieldForm, label: e.target.value })}
                                    className="flex-1 px-2 py-1 bg-gray-900 border border-orange-500 rounded text-white text-sm"
                                    autoFocus
                                  />
                                ) : (
                                  <span className={`font-medium ${item.enabled === false ? 'text-gray-500' : 'text-white'}`}>
                                    {item.label}
                                  </span>
                                )}
                                {item.isCustom && (
                                  <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full">
                                    Custom
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-2 text-xs ml-6">
                                <span className="text-gray-500">Type:</span>
                                {editingField?.categoryId === category.id && editingField?.itemId === item.id ? (
                                  <select
                                    value={customFieldForm.type}
                                    onChange={(e) => setCustomFieldForm({ ...customFieldForm, type: e.target.value })}
                                    className="px-2 py-1 bg-gray-900 border border-gray-700 rounded text-white text-xs"
                                  >
                                    {fieldTypes.map(ft => (
                                      <option key={ft.value} value={ft.value}>{ft.label}</option>
                                    ))}
                                  </select>
                                ) : (
                                  <span className="text-gray-400">{fieldTypes.find(ft => ft.value === item.type)?.label || item.type}</span>
                                )}

                                <span className="text-gray-500 ml-3">Priority:</span>
                                {editingField?.categoryId === category.id && editingField?.itemId === item.id ? (
                                  <select
                                    value={customFieldForm.priority}
                                    onChange={(e) => setCustomFieldForm({ ...customFieldForm, priority: e.target.value })}
                                    className="px-2 py-1 bg-gray-900 border border-gray-700 rounded text-white text-xs"
                                  >
                                    {priorityLevels.map(pl => (
                                      <option key={pl.value} value={pl.value}>{pl.label}</option>
                                    ))}
                                  </select>
                                ) : (
                                  <select
                                    value={item.priority}
                                    onChange={(e) => updateFieldPriority(category.id, item.id, e.target.value)}
                                    className="px-2 py-1 bg-gray-900 border border-gray-700 rounded text-white text-xs"
                                    disabled={item.enabled === false}
                                  >
                                    {priorityLevels.map(pl => (
                                      <option key={pl.value} value={pl.value}>{pl.label}</option>
                                    ))}
                                  </select>
                                )}

                                <label className="flex items-center gap-1 ml-3 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={item.alreadyHave || false}
                                    onChange={() => toggleAlreadyHave(category.id, item.id)}
                                    className="w-3 h-3 rounded border-gray-600 text-blue-500 focus:ring-blue-500"
                                    disabled={item.enabled === false}
                                  />
                                  <span className="text-gray-400">Already Have</span>
                                </label>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-1">
                              {editingField?.categoryId === category.id && editingField?.itemId === item.id ? (
                                <>
                                  <button
                                    onClick={saveEditedField}
                                    className="p-1 text-green-500 hover:bg-green-500/20 rounded"
                                    title="Save"
                                  >
                                    ✓
                                  </button>
                                  <button
                                    onClick={() => setEditingField(null)}
                                    className="p-1 text-gray-500 hover:bg-gray-700 rounded"
                                    title="Cancel"
                                  >
                                    ✕
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() => startEditField(category.id, item.id)}
                                    className="p-1 text-gray-500 hover:bg-gray-700 rounded"
                                    title="Edit"
                                  >
                                    ✏️
                                  </button>
                                  <button
                                    onClick={() => removeField(category.id, item.id)}
                                    className="p-1 text-red-500 hover:bg-red-500/20 rounded"
                                    title="Remove"
                                  >
                                    🗑
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Add Custom Field */}
                      {addingCustomField === category.id ? (
                        <div className="p-3 bg-orange-500/10 border border-orange-500 rounded-lg">
                          <div className="space-y-3">
                            <input
                              value={customFieldForm.label}
                              onChange={(e) => setCustomFieldForm({ ...customFieldForm, label: e.target.value })}
                              placeholder="Field label..."
                              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white"
                              autoFocus
                            />
                            <div className="grid grid-cols-2 gap-2">
                              <select
                                value={customFieldForm.type}
                                onChange={(e) => setCustomFieldForm({ ...customFieldForm, type: e.target.value })}
                                className="px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white"
                              >
                                {fieldTypes.map(ft => (
                                  <option key={ft.value} value={ft.value}>{ft.label}</option>
                                ))}
                              </select>
                              <select
                                value={customFieldForm.priority}
                                onChange={(e) => setCustomFieldForm({ ...customFieldForm, priority: e.target.value })}
                                className="px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white"
                              >
                                {priorityLevels.map(pl => (
                                  <option key={pl.value} value={pl.value}>{pl.label}</option>
                                ))}
                              </select>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={addCustomField}
                                disabled={!customFieldForm.label.trim()}
                                className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white py-2 rounded"
                              >
                                Add Field
                              </button>
                              <button
                                onClick={() => setAddingCustomField(null)}
                                className="px-4 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => startAddCustomField(category.id)}
                          className="w-full p-3 border-2 border-dashed border-gray-600 hover:border-orange-500 rounded-lg text-gray-400 hover:text-orange-500 transition-colors"
                        >
                          + Add Custom Field
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: Preview & Confirm */}
          {currentStep === 3 && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Review & Confirm</h3>

              {/* Session Details */}
              <div className="bg-gray-900 rounded-xl p-4 mb-4 border border-gray-700">
                <h4 className="text-sm font-semibold text-gray-400 mb-3">SESSION DETAILS</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Organization:</span>
                    <span className="text-white font-medium">{basicDetails.org_name}</span>
                  </div>
                  {basicDetails.event_name && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Event:</span>
                      <span className="text-white">{basicDetails.event_name}</span>
                    </div>
                  )}
                  {basicDetails.contact_name && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Contact:</span>
                      <span className="text-white">{basicDetails.contact_name}</span>
                    </div>
                  )}
                  {basicDetails.event_date && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Date:</span>
                      <span className="text-white">{new Date(basicDetails.event_date).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Checklist Summary */}
              <div className="bg-gray-900 rounded-xl p-4 border border-gray-700">
                <h4 className="text-sm font-semibold text-gray-400 mb-3">CHECKLIST SUMMARY</h4>
                <div className="space-y-3">
                  {checklistConfig.map(category => {
                    const enabledItems = category.items.filter(i => i.enabled !== false)
                    const customItems = enabledItems.filter(i => i.isCustom)
                    const alreadyHaveItems = enabledItems.filter(i => i.alreadyHave)
                    
                    return (
                      <div key={category.id} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span>{category.icon}</span>
                          <span className="text-white">{category.category}</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs">
                          <span className="text-gray-500">{enabledItems.length} items</span>
                          {customItems.length > 0 && (
                            <span className="bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full">
                              {customItems.length} custom
                            </span>
                          )}
                          {alreadyHaveItems.length > 0 && (
                            <span className="bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">
                              {alreadyHaveItems.length} pre-filled
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-gray-800 border-t border-gray-700 px-6 py-4 flex justify-between">
          <button
            onClick={() => currentStep > 1 && setCurrentStep(currentStep - 1)}
            disabled={currentStep === 1}
            className="px-6 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            ← Back
          </button>
          
          {currentStep < 3 ? (
            <button
              onClick={() => setCurrentStep(currentStep + 1)}
              disabled={currentStep === 1 && !canProceedStep1}
              className="px-6 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              Next →
            </button>
          ) : (
            <button
              onClick={handleCreate}
              disabled={loading}
              className="px-6 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                  Creating...
                </>
              ) : (
                <>
                  ✓ Create Session
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
