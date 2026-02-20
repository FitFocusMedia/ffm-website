import { useState, useEffect } from 'react'
import { updateOnboardingSession } from '../../../lib/supabase'

// Checklist structure (shared with OnboardingPortal)
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

export default function OnboardingEditModal({ session, onClose, onSave }) {
  const [activeTab, setActiveTab] = useState('checklist') // checklist | data
  const [saving, setSaving] = useState(false)
  
  // Checklist configuration (enable/disable, priorities, already have)
  const [checklistItems, setChecklistItems] = useState({})
  
  // Collected data (what the client provided)
  const [collectedData, setCollectedData] = useState({})
  
  // Admin notes for items
  const [adminNotes, setAdminNotes] = useState({})
  
  // Manual completion overrides
  const [manualCompletions, setManualCompletions] = useState({})

  // Initialize state from session
  useEffect(() => {
    if (!session) return
    
    // Initialize checklist items from session config or defaults
    const items = {}
    checklistConfig.forEach(cat => {
      items[cat.id] = {}
      cat.items.forEach(item => {
        const sessionConfig = session.checklist_config?.[cat.id]?.[item.id] || {}
        items[cat.id][item.id] = {
          enabled: sessionConfig.enabled !== false,
          priority: sessionConfig.priority || item.priority,
          alreadyHave: sessionConfig.alreadyHave || false
        }
      })
    })
    setChecklistItems(items)
    
    // Initialize collected data
    setCollectedData(session.collected_data || {})
    
    // Initialize admin notes
    setAdminNotes(session.admin_item_notes || {})
    
    // Initialize manual completions
    setManualCompletions(session.manual_completions || {})
  }, [session])

  const toggleEnabled = (categoryId, itemId) => {
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
          priority
        }
      }
    }))
  }

  const updateAdminNote = (categoryId, itemId, note) => {
    setAdminNotes(prev => ({
      ...prev,
      [`${categoryId}.${itemId}`]: note
    }))
  }

  const toggleManualComplete = (categoryId, itemId) => {
    const key = `${categoryId}.${itemId}`
    setManualCompletions(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const updateCollectedDataValue = (categoryId, itemId, value) => {
    setCollectedData(prev => ({
      ...prev,
      [categoryId]: {
        ...(prev[categoryId] || {}),
        [itemId]: value
      }
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const updates = {
        checklist_config: checklistItems,
        collected_data: collectedData,
        admin_item_notes: adminNotes,
        manual_completions: manualCompletions
      }
      
      await updateOnboardingSession(session.id, updates)
      
      if (onSave) {
        onSave(updates)
      }
      
      onClose()
    } catch (error) {
      console.error('Error saving:', error)
      alert('Failed to save changes: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const getItemStatus = (categoryId, itemId) => {
    const catData = collectedData[categoryId] || {}
    const hasData = catData[itemId] || catData[`${itemId}_url`]
    const manuallyComplete = manualCompletions[`${categoryId}.${itemId}`]
    const alreadyHave = checklistItems[categoryId]?.[itemId]?.alreadyHave
    
    if (manuallyComplete) return { status: 'manual', label: 'Manually Complete', color: 'blue' }
    if (hasData) return { status: 'complete', label: 'Client Provided', color: 'green' }
    if (alreadyHave) return { status: 'already', label: 'Already Have', color: 'purple' }
    return { status: 'pending', label: 'Pending', color: 'gray' }
  }

  if (!session) return null

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-gray-800 rounded-2xl w-full max-w-5xl my-8 border border-gray-700 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-700 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold mb-2 text-white">Edit Session</h2>
            <p className="text-gray-400">{session.org_name}</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-xl">✕</button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-700">
          <div className="flex gap-1 px-6">
            {[
              { id: 'checklist', label: 'Checklist Config', icon: '⚙️' },
              { id: 'data', label: 'Collected Data', icon: '📝' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 ${
                  activeTab === tab.id 
                    ? 'border-orange-500 text-white' 
                    : 'border-transparent text-gray-500 hover:text-white'
                }`}
              >
                <span>{tab.icon}</span> {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[600px] overflow-y-auto">
          {activeTab === 'checklist' && (
            <div className="space-y-6">
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <p className="text-blue-200 text-sm">
                  <strong>💡 What this does:</strong> Configure what items the client sees, set priorities, 
                  mark items as "already have", and add internal notes for your team.
                </p>
              </div>

              {checklistConfig.map(category => (
                <div key={category.id} className="bg-gray-900/50 rounded-lg border border-gray-700">
                  <div className="px-4 py-3 border-b border-gray-700 bg-gray-800/50">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{category.icon}</span>
                      <h3 className="font-bold text-white">{category.category}</h3>
                    </div>
                  </div>
                  <div className="p-4 space-y-4">
                    {category.items.map(item => {
                      const config = checklistItems[category.id]?.[item.id] || {}
                      const itemStatus = getItemStatus(category.id, item.id)
                      const note = adminNotes[`${category.id}.${item.id}`] || ''
                      
                      return (
                        <div 
                          key={item.id} 
                          className={`p-4 rounded-lg border transition-all ${
                            config.enabled 
                              ? 'bg-gray-800/50 border-gray-700' 
                              : 'bg-gray-900/30 border-gray-800 opacity-60'
                          }`}
                        >
                          {/* Item Header */}
                          <div className="flex items-start gap-3 mb-3">
                            {/* Enable/Disable Toggle */}
                            <button
                              onClick={() => toggleEnabled(category.id, item.id)}
                              className={`flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                                config.enabled 
                                  ? 'bg-orange-500 border-orange-500' 
                                  : 'bg-transparent border-gray-600'
                              }`}
                            >
                              {config.enabled && <span className="text-white text-sm">✓</span>}
                            </button>

                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <span className={`font-medium ${config.enabled ? 'text-white' : 'text-gray-500'}`}>
                                  {item.label}
                                </span>
                                <span className={`text-xs px-2 py-1 rounded-full bg-${itemStatus.color}-500/20 text-${itemStatus.color}-400 border border-${itemStatus.color}-500/30`}>
                                  {itemStatus.label}
                                </span>
                              </div>

                              {config.enabled && (
                                <div className="space-y-3">
                                  {/* Controls */}
                                  <div className="flex flex-wrap items-center gap-2">
                                    {/* Priority Selector */}
                                    <select
                                      value={config.priority}
                                      onChange={(e) => updatePriority(category.id, item.id, e.target.value)}
                                      className="text-xs bg-gray-900 border border-gray-700 rounded px-2 py-1 text-white focus:outline-none focus:border-orange-500"
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
                                          ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' 
                                          : 'bg-gray-900 text-gray-400 border-gray-700'
                                      }`}
                                    >
                                      {config.alreadyHave ? '✓ Already Have' : 'Mark "Already Have"'}
                                    </button>

                                    {/* Manual Complete Toggle */}
                                    <button
                                      onClick={() => toggleManualComplete(category.id, item.id)}
                                      className={`text-xs px-3 py-1 rounded border transition-colors ${
                                        manualCompletions[`${category.id}.${item.id}`]
                                          ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' 
                                          : 'bg-gray-900 text-gray-400 border-gray-700'
                                      }`}
                                    >
                                      {manualCompletions[`${category.id}.${item.id}`] ? '✓ Manually Complete' : 'Mark Complete'}
                                    </button>
                                  </div>

                                  {/* Admin Notes */}
                                  <div>
                                    <label className="block text-xs text-gray-500 mb-1">
                                      Internal Note (not visible to client)
                                    </label>
                                    <textarea
                                      value={note}
                                      onChange={(e) => updateAdminNote(category.id, item.id, e.target.value)}
                                      placeholder="e.g., Client sent logo via email - see Drive folder"
                                      rows={2}
                                      className="w-full text-sm bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500 resize-none"
                                    />
                                  </div>
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
          )}

          {activeTab === 'data' && (
            <div className="space-y-6">
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                <p className="text-yellow-200 text-sm">
                  <strong>⚠️ Caution:</strong> You're editing data the client submitted. Only modify if you need to 
                  correct errors or add information on their behalf.
                </p>
              </div>

              {checklistConfig.map(category => {
                const catData = collectedData[category.id] || {}
                
                return (
                  <div key={category.id} className="bg-gray-900/50 rounded-lg border border-gray-700">
                    <div className="px-4 py-3 border-b border-gray-700 bg-gray-800/50">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{category.icon}</span>
                        <h3 className="font-bold text-white">{category.category}</h3>
                      </div>
                    </div>
                    <div className="p-4 space-y-4">
                      {category.items
                        .filter(item => checklistItems[category.id]?.[item.id]?.enabled !== false)
                        .map(item => {
                          const value = catData[item.id] || ''
                          const urlValue = catData[`${item.id}_url`] || ''
                          
                          return (
                            <div key={item.id} className="p-3 rounded-lg bg-gray-800/50 border border-gray-700">
                              <label className="block text-sm font-medium text-white mb-2">
                                {item.label}
                              </label>
                              
                              {item.type === 'file' && (
                                <div>
                                  <input
                                    type="text"
                                    value={urlValue}
                                    onChange={(e) => updateCollectedDataValue(category.id, `${item.id}_url`, e.target.value)}
                                    placeholder="File URL (if uploaded)"
                                    className="w-full text-sm bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500"
                                  />
                                  {urlValue && (
                                    <a 
                                      href={urlValue} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-xs text-orange-500 hover:underline mt-1 inline-block"
                                    >
                                      View uploaded file →
                                    </a>
                                  )}
                                </div>
                              )}
                              
                              {item.type === 'text' && (
                                <input
                                  type="text"
                                  value={value}
                                  onChange={(e) => updateCollectedDataValue(category.id, item.id, e.target.value)}
                                  placeholder={item.placeholder || ''}
                                  className="w-full text-sm bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500"
                                />
                              )}
                              
                              {item.type === 'number' && (
                                <input
                                  type="number"
                                  value={value}
                                  onChange={(e) => updateCollectedDataValue(category.id, item.id, e.target.value)}
                                  placeholder={item.placeholder || ''}
                                  className="w-full text-sm bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500"
                                />
                              )}
                              
                              {item.type === 'textarea' && (
                                <textarea
                                  value={value}
                                  onChange={(e) => updateCollectedDataValue(category.id, item.id, e.target.value)}
                                  placeholder={item.placeholder || ''}
                                  rows={3}
                                  className="w-full text-sm bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500 resize-none"
                                />
                              )}
                              
                              {item.type === 'contact' && (
                                <div className="space-y-2">
                                  <input
                                    type="text"
                                    value={catData[`${item.id}_name`] || ''}
                                    onChange={(e) => updateCollectedDataValue(category.id, `${item.id}_name`, e.target.value)}
                                    placeholder="Contact name"
                                    className="w-full text-sm bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500"
                                  />
                                  <input
                                    type="tel"
                                    value={catData[`${item.id}_phone`] || ''}
                                    onChange={(e) => updateCollectedDataValue(category.id, `${item.id}_phone`, e.target.value)}
                                    placeholder="Phone number"
                                    className="w-full text-sm bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500"
                                  />
                                  <input
                                    type="email"
                                    value={catData[`${item.id}_email`] || ''}
                                    onChange={(e) => updateCollectedDataValue(category.id, `${item.id}_email`, e.target.value)}
                                    placeholder="Email address"
                                    className="w-full text-sm bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500"
                                  />
                                </div>
                              )}
                            </div>
                          )
                        })}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-700 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-600 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            {saving ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                Saving...
              </>
            ) : (
              <>💾 Save Changes</>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
