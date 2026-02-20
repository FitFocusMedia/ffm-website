import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { 
  getOnboardingSessionByToken, 
  updateOnboardingByToken, 
  submitOnboardingSession,
  uploadOnboardingFile 
} from '../../lib/supabase'

// Checklist structure with input types
const checklistConfig = [
  {
    id: 'branding',
    category: 'Branding & Assets',
    icon: '✨',
    items: [
      { id: 'logo', label: 'High-resolution logo', type: 'file', accept: 'image/*,.svg,.ai,.eps', priority: 'essential' },
      { id: 'brand_kit', label: 'Brand kit (colors, fonts, guidelines)', type: 'file', accept: '.pdf,.zip,image/*', priority: 'important' },
      { id: 'event_graphics', label: 'Event-specific graphics/banners', type: 'file', accept: 'image/*,.pdf,.zip', priority: 'important' },
      { id: 'sponsor_logos', label: 'Sponsor logos for on-screen display', type: 'file', accept: 'image/*,.zip', priority: 'nice' },
    ]
  },
  {
    id: 'athletes',
    category: 'Athlete Information',
    icon: '👥',
    items: [
      { id: 'registration_list', label: 'Registration list (Name, Email, Phone)', type: 'file', accept: '.csv,.xlsx,.xls,.pdf', priority: 'essential' },
      { id: 'instagram_handles', label: 'Athlete Instagram handles', type: 'textarea', placeholder: 'List athlete handles, one per line...', priority: 'essential' },
      { id: 'notable_athletes', label: 'Notable athletes to feature', type: 'textarea', placeholder: 'Champions, rising stars, fan favorites...', priority: 'important' },
    ]
  },
  {
    id: 'venue',
    category: 'Venue & Technical',
    icon: '📍',
    items: [
      { id: 'floor_plan', label: 'Venue floor plan (mat layout)', type: 'file', accept: 'image/*,.pdf', priority: 'essential' },
      { id: 'internet_specs', label: 'Internet specs (upload speed, hardwired access)', type: 'textarea', placeholder: 'e.g., 100Mbps up/down, ethernet available at...', priority: 'essential' },
      { id: 'power_locations', label: 'Power outlet locations', type: 'textarea', placeholder: 'Describe where power is available...', priority: 'important' },
      { id: 'load_in_time', label: 'Load-in/crew access time', type: 'text', placeholder: 'e.g., 6:00 AM', priority: 'important' },
      { id: 'venue_contact', label: 'Venue contact for event day', type: 'contact', priority: 'important' },
    ]
  },
  {
    id: 'event',
    category: 'Event Operations',
    icon: '📅',
    items: [
      { id: 'mat_count', label: 'Number of mats running', type: 'number', placeholder: 'e.g., 4', priority: 'essential' },
      { id: 'schedule', label: 'Event schedule/run sheet', type: 'file', accept: '.pdf,.doc,.docx,image/*', priority: 'essential' },
      { id: 'bracket_system', label: 'Bracket/scoring system used', type: 'text', placeholder: 'e.g., Smoothcomp, FloArena...', priority: 'important' },
      { id: 'match_comms_method', label: 'How match order will be communicated', type: 'textarea', placeholder: 'e.g., WhatsApp group, printed sheets...', priority: 'important' },
    ]
  },
  {
    id: 'social',
    category: 'Social & Promotion',
    icon: '📸',
    items: [
      { id: 'org_instagram', label: 'Organization Instagram', type: 'text', placeholder: '@yourorg', priority: 'important' },
      { id: 'org_facebook', label: 'Organization Facebook', type: 'text', placeholder: 'facebook.com/yourorg', priority: 'nice' },
      { id: 'org_website', label: 'Organization Website', type: 'text', placeholder: 'https://...', priority: 'nice' },
      { id: 'existing_content', label: 'Existing footage/photos for promos', type: 'file', accept: 'image/*,video/*,.zip', priority: 'nice' },
      { id: 'existing_content_links', label: 'Links to existing footage (Google Drive, Dropbox, etc.)', type: 'textarea', placeholder: 'Paste links to your existing footage, one per line...', priority: 'nice' },
    ]
  },
]

const timelineSteps = [
  { id: 1, title: 'Information Gathering', description: 'Complete the checklist so we can prepare everything perfectly', duration: 'Week 1-2' },
  { id: 2, title: 'Pre-Production', description: 'We create custom graphics, overlays, and streaming layouts', duration: 'Week 2-3' },
  { id: 3, title: 'Technical Setup', description: 'Site visit (if needed), equipment prep, streaming tests', duration: 'Week 3-4' },
  { id: 4, title: 'Athlete Outreach', description: 'We contact athletes about media packages and content options', duration: 'Week 3-4' },
  { id: 5, title: 'Event Day', description: 'Our crew arrives, sets up, and delivers world-class coverage', duration: 'Show Time!' },
]

export default function OnboardingPortal() {
  const { token } = useParams()
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [expandedCategories, setExpandedCategories] = useState(new Set(['branding']))
  const [showWelcome, setShowWelcome] = useState(true)
  const [activeSection, setActiveSection] = useState('checklist')
  const [saving, setSaving] = useState(false)
  const [uploadingFile, setUploadingFile] = useState(null)
  const [formData, setFormData] = useState({})
  const [uploadedFiles, setUploadedFiles] = useState({})
  const [submitted, setSubmitted] = useState(false)

  // Load session data
  useEffect(() => {
    if (!token) {
      setLoading(false)
      setError('No onboarding session found. Please use the link provided by Fit Focus Media.')
      return
    }
    loadSession()
  }, [token])

  const loadSession = async () => {
    try {
      const data = await getOnboardingSessionByToken(token)
      setSession(data)
      setFormData(data.collected_data || {})
      if (data.status === 'submitted' || data.status === 'reviewed') {
        setSubmitted(true)
        setShowWelcome(false)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Auto-save progress
  const saveProgress = useCallback(async (newData) => {
    if (!session || !token) return
    setSaving(true)
    try {
      await updateOnboardingByToken(token, { 
        collected_data: newData,
        checklist_progress: calculateProgress(newData)
      })
    } catch (err) {
      console.error('Save error:', err)
    } finally {
      setSaving(false)
    }
  }, [session, token])

  // Calculate progress
  const calculateProgress = (data) => {
    const progress = {}
    checklistConfig.forEach(cat => {
      cat.items.forEach(item => {
        const catData = data[cat.id] || {}
        const value = catData[item.id] || catData[`${item.id}_url`]
        progress[`${cat.id}.${item.id}`] = !!value && value !== ''
      })
    })
    return progress
  }

  // Handle text/textarea input change
  const handleInputChange = (categoryId, itemId, value) => {
    const newData = {
      ...formData,
      [categoryId]: {
        ...(formData[categoryId] || {}),
        [itemId]: value
      }
    }
    setFormData(newData)
    
    // Debounced save
    clearTimeout(window.saveTimeout)
    window.saveTimeout = setTimeout(() => saveProgress(newData), 1000)
  }

  // File size limit (20MB)
  const MAX_FILE_SIZE = 20 * 1024 * 1024

  // Handle file upload
  const handleFileUpload = async (categoryId, itemId, files) => {
    if (!files || files.length === 0 || !session) return
    
    // Check file size
    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        const sizeMB = (file.size / (1024 * 1024)).toFixed(1)
        alert(
          `📁 "${file.name}" is ${sizeMB}MB — too large for direct upload.\n\n` +
          `For files over 20MB, please:\n` +
          `1. Upload to Google Drive, Dropbox, or similar\n` +
          `2. Paste the share link in the "Links to existing footage" field below\n\n` +
          `This helps us keep the system fast and reliable! 🚀`
        )
        return
      }
    }
    
    setUploadingFile(`${categoryId}.${itemId}`)
    
    try {
      for (const file of files) {
        const result = await uploadOnboardingFile(session.id, categoryId, itemId, file)
        
        // Update local state
        setUploadedFiles(prev => ({
          ...prev,
          [`${categoryId}.${itemId}`]: [
            ...(prev[`${categoryId}.${itemId}`] || []),
            { name: file.name, url: result.url, id: result.file.id }
          ]
        }))
        
        // Update form data with URL
        const newData = {
          ...formData,
          [categoryId]: {
            ...(formData[categoryId] || {}),
            [`${itemId}_url`]: result.url
          }
        }
        setFormData(newData)
        saveProgress(newData)
      }
    } catch (err) {
      console.error('Upload error:', err)
      alert('Upload failed: ' + err.message)
    } finally {
      setUploadingFile(null)
    }
  }

  // Submit onboarding
  const handleSubmit = async () => {
    if (!session) return
    
    try {
      await submitOnboardingSession(session.id)
      setSubmitted(true)
      setActiveSection('submitted')
    } catch (err) {
      console.error('Submit error:', err)
      alert('Submission failed: ' + err.message)
    }
  }

  // Get completion stats
  const getCompletionStats = () => {
    let completed = 0
    let total = 0
    
    checklistConfig.forEach(cat => {
      cat.items.forEach(item => {
        total++
        const catData = formData[cat.id] || {}
        const value = catData[item.id] || catData[`${item.id}_url`]
        if (value && value !== '') completed++
      })
    })
    
    return { completed, total, percent: Math.round((completed / total) * 100) }
  }

  const stats = getCompletionStats()

  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev => {
      const next = new Set(prev)
      if (next.has(categoryId)) next.delete(categoryId)
      else next.add(categoryId)
      return next
    })
  }

  const getPriorityBadge = (priority) => {
    const styles = {
      essential: 'bg-red-500/20 text-red-400',
      important: 'bg-yellow-500/20 text-yellow-400',
      nice: 'bg-green-500/20 text-green-400'
    }
    const labels = { essential: 'Essential', important: 'Important', nice: 'Nice to have' }
    return <span className={`text-xs px-2 py-1 rounded-full ${styles[priority]}`}>{labels[priority]}</span>
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your onboarding portal...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error && !session) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-2xl p-8 max-w-md text-center border border-gray-700">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-white mb-2">Session Not Found</h2>
          <p className="text-gray-400">{error}</p>
        </div>
      </div>
    )
  }

  // Submitted state
  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-2xl p-10 max-w-lg text-center border border-gray-700">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">✅</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-4">Thank You! 🎉</h1>
          <p className="text-gray-400 mb-6">
            Your onboarding information has been submitted successfully. 
            The Fit Focus Media team will review everything and be in touch shortly.
          </p>
          <p className="text-gray-500 text-sm">
            Questions? Contact <a href="mailto:brandon@fitfocusmedia.com.au" className="text-orange-500 hover:underline">brandon@fitfocusmedia.com.au</a>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Welcome Modal */}
      {showWelcome && session && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-2xl p-8 max-w-md text-center border border-orange-500/30 shadow-xl shadow-orange-500/10">
            <div className="w-20 h-20 bg-orange-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">🏆</span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Welcome, {session.org_name}! 🎉
            </h1>
            <p className="text-orange-500 font-medium mb-4">{session.event_name}</p>
            <p className="text-gray-400 mb-6">
              We're thrilled to partner with you! This portal will guide you through 
              everything we need to deliver world-class coverage.
            </p>
            <button 
              onClick={() => setShowWelcome(false)}
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-3 rounded-full transition-colors flex items-center gap-2 mx-auto"
            >
              Let's Get Started →
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 bg-gray-900/95 backdrop-blur-lg border-b border-gray-800">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="/ffm-logo.jpg" 
              alt="Fit Focus Media" 
              className="w-10 h-10 rounded-xl object-cover"
            />
            <div>
              <div className="font-semibold text-white">Fit Focus Media</div>
              <div className="text-xs text-gray-500">{session?.org_name || 'Partner Onboarding'}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {saving && <span className="text-orange-500 text-sm animate-pulse">Saving...</span>}
            <div className="bg-orange-500/20 text-orange-500 px-3 py-1 rounded-full text-sm font-semibold">
              {stats.percent}% Complete
            </div>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-gray-800/50">
        <div className="max-w-3xl mx-auto px-4">
          <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-orange-500 to-orange-400 transition-all duration-500"
              style={{ width: `${stats.percent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-800">
        <div className="max-w-3xl mx-auto px-4">
          <div className="flex gap-1">
            {[
              { id: 'checklist', label: 'What We Need', icon: '✓' },
              { id: 'timeline', label: "What's Next", icon: '⏱' },
              { id: 'contact', label: 'Get In Touch', icon: '✉️' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 ${
                  activeSection === tab.id 
                    ? 'border-orange-500 text-white' 
                    : 'border-transparent text-gray-500 hover:text-white'
                }`}
              >
                <span>{tab.icon}</span> {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Checklist Section */}
        {activeSection === 'checklist' && (
          <div>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Information Checklist</h2>
              <p className="text-gray-400">Upload files and provide details for the best coverage</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-8">
              <div className="bg-gray-800 rounded-xl p-4 text-center border border-gray-700">
                <div className="text-2xl font-bold text-orange-500">{stats.completed}</div>
                <div className="text-xs text-gray-500">Completed</div>
              </div>
              <div className="bg-gray-800 rounded-xl p-4 text-center border border-gray-700">
                <div className="text-2xl font-bold text-yellow-500">{stats.total - stats.completed}</div>
                <div className="text-xs text-gray-500">Remaining</div>
              </div>
              <div className="bg-gray-800 rounded-xl p-4 text-center border border-gray-700">
                <div className="text-2xl font-bold text-green-500">{stats.total}</div>
                <div className="text-xs text-gray-500">Total</div>
              </div>
            </div>

            {/* Categories */}
            <div className="space-y-3">
              {checklistConfig.map((category) => {
                const catData = formData[category.id] || {}
                const categoryCompleted = category.items.filter(item => {
                  const value = catData[item.id] || catData[`${item.id}_url`]
                  return value && value !== ''
                }).length
                const isExpanded = expandedCategories.has(category.id)
                
                return (
                  <div key={category.id} className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                    {/* Category Header */}
                    <button
                      onClick={() => toggleCategory(category.id)}
                      className="w-full flex items-center justify-between p-4 hover:bg-gray-700/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center text-xl">
                          {category.icon}
                        </div>
                        <div className="text-left">
                          <div className="font-semibold text-white">{category.category}</div>
                          <div className="text-sm text-gray-500">{categoryCompleted}/{category.items.length} completed</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-20 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-orange-500 transition-all duration-300"
                            style={{ width: `${(categoryCompleted / category.items.length) * 100}%` }}
                          />
                        </div>
                        <span className={`text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
                      </div>
                    </button>

                    {/* Items */}
                    {isExpanded && (
                      <div className="border-t border-gray-700 p-4 space-y-4">
                        {category.items.map((item) => {
                          const value = catData[item.id] || catData[`${item.id}_url`] || ''
                          const isComplete = value !== ''
                          const isUploading = uploadingFile === `${category.id}.${item.id}`
                          const files = uploadedFiles[`${category.id}.${item.id}`] || []
                          
                          return (
                            <div
                              key={item.id}
                              className={`p-4 rounded-xl border ${isComplete ? 'bg-orange-500/5 border-orange-500/30' : 'bg-gray-900/50 border-gray-700'}`}
                            >
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center text-xs ${
                                    isComplete ? 'bg-orange-500 border-orange-500 text-white' : 'border-gray-600'
                                  }`}>
                                    {isComplete && '✓'}
                                  </div>
                                  <span className="font-medium text-white">{item.label}</span>
                                </div>
                                {getPriorityBadge(item.priority)}
                              </div>
                              
                              {/* Input based on type */}
                              {item.type === 'file' && (
                                <div>
                                  <label className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-600 rounded-xl cursor-pointer hover:border-orange-500/50 transition-colors">
                                    {isUploading ? (
                                      <span className="animate-spin">⏳</span>
                                    ) : (
                                      <span className="text-orange-500">📁</span>
                                    )}
                                    <span className="text-gray-400">
                                      {isUploading ? 'Uploading...' : 'Click to upload'}
                                    </span>
                                    <input
                                      type="file"
                                      accept={item.accept}
                                      onChange={(e) => handleFileUpload(category.id, item.id, e.target.files)}
                                      className="hidden"
                                      disabled={isUploading}
                                    />
                                  </label>
                                  {(files.length > 0 || value) && (
                                    <div className="mt-2 space-y-1">
                                      {files.map((f, i) => (
                                        <div key={i} className="flex items-center gap-2 p-2 bg-orange-500/10 rounded-lg text-sm">
                                          <span className="text-orange-500">✓</span>
                                          <span className="flex-1 text-white truncate">{f.name}</span>
                                          <a href={f.url} target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:underline">View</a>
                                        </div>
                                      ))}
                                      {value && files.length === 0 && (
                                        <div className="flex items-center gap-2 p-2 bg-orange-500/10 rounded-lg text-sm">
                                          <span className="text-orange-500">✓</span>
                                          <span className="text-white">File uploaded</span>
                                          <a href={value} target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:underline ml-auto">View</a>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              )}
                              
                              {item.type === 'text' && (
                                <input
                                  type="text"
                                  value={value}
                                  onChange={(e) => handleInputChange(category.id, item.id, e.target.value)}
                                  placeholder={item.placeholder}
                                  className="w-full p-3 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-orange-500 focus:outline-none"
                                />
                              )}
                              
                              {item.type === 'number' && (
                                <input
                                  type="number"
                                  value={value}
                                  onChange={(e) => handleInputChange(category.id, item.id, e.target.value)}
                                  placeholder={item.placeholder}
                                  className="w-full p-3 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-orange-500 focus:outline-none"
                                />
                              )}
                              
                              {item.type === 'textarea' && (
                                <textarea
                                  value={value}
                                  onChange={(e) => handleInputChange(category.id, item.id, e.target.value)}
                                  placeholder={item.placeholder}
                                  rows={3}
                                  className="w-full p-3 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-orange-500 focus:outline-none resize-none"
                                />
                              )}
                              
                              {item.type === 'contact' && (
                                <div className="space-y-2">
                                  <input
                                    type="text"
                                    value={catData[`${item.id}_name`] || ''}
                                    onChange={(e) => handleInputChange(category.id, `${item.id}_name`, e.target.value)}
                                    placeholder="Contact name"
                                    className="w-full p-3 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-orange-500 focus:outline-none"
                                  />
                                  <input
                                    type="tel"
                                    value={catData[`${item.id}_phone`] || ''}
                                    onChange={(e) => handleInputChange(category.id, `${item.id}_phone`, e.target.value)}
                                    placeholder="Phone number"
                                    className="w-full p-3 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-orange-500 focus:outline-none"
                                  />
                                  <input
                                    type="email"
                                    value={catData[`${item.id}_email`] || ''}
                                    onChange={(e) => handleInputChange(category.id, `${item.id}_email`, e.target.value)}
                                    placeholder="Email address"
                                    className="w-full p-3 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-orange-500 focus:outline-none"
                                  />
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Submit Button */}
            <div className="mt-8 text-center">
              <button
                onClick={handleSubmit}
                disabled={stats.completed === 0}
                className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold px-8 py-4 rounded-full transition-colors inline-flex items-center gap-2"
              >
                <span>📨</span> Submit Onboarding Information
              </button>
              <p className="text-gray-500 text-sm mt-3">
                You can submit anytime — we'll reach out if we need anything else
              </p>
            </div>
          </div>
        )}

        {/* Timeline Section */}
        {activeSection === 'timeline' && (
          <div>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">What Happens Next</h2>
              <p className="text-gray-400">Here's our process from signup to showtime</p>
            </div>

            <div className="relative">
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-orange-500 to-orange-500/20" />
              <div className="space-y-6">
                {timelineSteps.map((step) => (
                  <div key={step.id} className="flex gap-6">
                    <div className="w-16 h-16 bg-gray-800 rounded-2xl border-2 border-orange-500 flex items-center justify-center text-orange-500 text-2xl font-bold relative z-10">
                      {step.id}
                    </div>
                    <div className="flex-1 bg-gray-800 rounded-xl p-5 border border-gray-700">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-semibold text-white">{step.title}</h3>
                        <span className="text-xs bg-orange-500/20 text-orange-500 px-2 py-1 rounded-full">
                          {step.duration}
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Contact Section */}
        {activeSection === 'contact' && (
          <div>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Get In Touch</h2>
              <p className="text-gray-400">Have questions? We're here to help</p>
            </div>

            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-orange-500/20 rounded-2xl flex items-center justify-center text-3xl">
                  📹
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">Brandon Hibbs</h3>
                  <p className="text-gray-400">Founder, Fit Focus Media</p>
                </div>
              </div>

              <div className="space-y-3">
                <a href="mailto:brandon@fitfocusmedia.com.au" className="flex items-center gap-3 p-4 bg-gray-900 rounded-xl hover:bg-gray-700 transition-colors">
                  <span className="text-orange-500">✉️</span>
                  <span className="text-white">brandon@fitfocusmedia.com.au</span>
                </a>
                <a href="tel:0411934935" className="flex items-center gap-3 p-4 bg-gray-900 rounded-xl hover:bg-gray-700 transition-colors">
                  <span className="text-orange-500">📞</span>
                  <span className="text-white">0411 934 935</span>
                </a>
                <a href="https://instagram.com/fitfocusmedia" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 bg-gray-900 rounded-xl hover:bg-gray-700 transition-colors">
                  <span className="text-orange-500">📸</span>
                  <span className="text-white">@fitfocusmedia</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-6 text-center">
        <p className="text-gray-600 text-sm">© 2026 Fit Focus Media. All rights reserved.</p>
        <p className="text-gray-700 text-xs mt-1">Delivering world-class event coverage across Australia 🇦🇺</p>
      </footer>
    </div>
  )
}
// Deploy Fri Feb 20 10:36:33 AEST 2026
