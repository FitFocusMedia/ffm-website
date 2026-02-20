import { useState } from 'react'
import { 
  ChevronDown, ChevronUp, Image, File, FileText, 
  ExternalLink, Download, Play, Music, Archive
} from 'lucide-react'

// Checklist structure (same as client portal)
const checklistConfig = [
  {
    id: 'branding',
    category: 'Branding & Assets',
    icon: '✨',
    items: [
      { id: 'logo', label: 'High-resolution logo', type: 'file' },
      { id: 'brand_kit', label: 'Brand kit (colors, fonts, guidelines)', type: 'file' },
      { id: 'event_graphics', label: 'Event-specific graphics/banners', type: 'file' },
      { id: 'sponsor_logos', label: 'Sponsor logos for on-screen display', type: 'file' },
    ]
  },
  {
    id: 'athletes',
    category: 'Athlete Information',
    icon: '👥',
    items: [
      { id: 'registration_list', label: 'Registration list', type: 'file' },
      { id: 'notable_athletes', label: 'Notable athletes to feature', type: 'textarea' },
    ]
  },
  {
    id: 'venue',
    category: 'Venue & Technical',
    icon: '📍',
    items: [
      { id: 'floor_plan', label: 'Venue floor plan', type: 'file' },
      { id: 'internet_specs', label: 'Internet specs', type: 'textarea' },
      { id: 'power_locations', label: 'Power outlet locations', type: 'textarea' },
      { id: 'load_in_time', label: 'Load-in/crew access time', type: 'text' },
      { id: 'venue_contact', label: 'Venue contact for event day', type: 'contact' },
    ]
  },
  {
    id: 'event',
    category: 'Event Operations',
    icon: '📅',
    items: [
      { id: 'mat_count', label: 'Number of mats running', type: 'number' },
      { id: 'schedule', label: 'Event schedule/run sheet', type: 'file' },
      { id: 'bracket_system', label: 'Bracket/scoring system used', type: 'text' },
      { id: 'match_comms_method', label: 'How match order will be communicated', type: 'textarea' },
    ]
  },
  {
    id: 'social',
    category: 'Social & Promotion',
    icon: '📸',
    items: [
      { id: 'org_instagram', label: 'Organization Instagram', type: 'text' },
      { id: 'org_facebook', label: 'Organization Facebook', type: 'text' },
      { id: 'org_website', label: 'Organization Website', type: 'text' },
      { id: 'existing_content', label: 'Existing footage/photos for promos', type: 'file' },
      { id: 'existing_content_links', label: 'Links to existing footage', type: 'textarea' },
    ]
  },
]

// Get file icon and type
const getFileInfo = (url) => {
  if (!url) return { icon: File, type: 'file', isImage: false }
  
  const lower = url.toLowerCase()
  
  // Images
  if (lower.match(/\.(jpg|jpeg|png|gif|webp|svg|bmp)(\?|$)/i)) {
    return { icon: Image, type: 'image', isImage: true }
  }
  // Videos
  if (lower.match(/\.(mp4|mov|avi|webm|mkv)(\?|$)/i)) {
    return { icon: Play, type: 'video', isImage: false }
  }
  // Audio
  if (lower.match(/\.(mp3|wav|aac|ogg|m4a)(\?|$)/i)) {
    return { icon: Music, type: 'audio', isImage: false }
  }
  // Documents
  if (lower.match(/\.(pdf|doc|docx|xls|xlsx|ppt|pptx|txt|csv)(\?|$)/i)) {
    return { icon: FileText, type: 'document', isImage: false }
  }
  // Archives
  if (lower.match(/\.(zip|rar|7z|tar|gz)(\?|$)/i)) {
    return { icon: Archive, type: 'archive', isImage: false }
  }
  
  return { icon: File, type: 'file', isImage: false }
}

// Get filename from URL
const getFileName = (url) => {
  if (!url) return 'File'
  try {
    const urlObj = new URL(url)
    const path = urlObj.pathname
    const fileName = path.split('/').pop()
    // Decode URI and limit length
    const decoded = decodeURIComponent(fileName)
    return decoded.length > 40 ? decoded.substring(0, 37) + '...' : decoded
  } catch {
    return 'File'
  }
}

// File preview component
function FilePreview({ url, label }) {
  const { icon: Icon, type, isImage } = getFileInfo(url)
  const fileName = getFileName(url)
  
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block"
    >
      <div className="border border-gray-700 rounded-xl overflow-hidden hover:border-orange-500/50 transition-all">
        {/* Preview area */}
        <div className="bg-gray-900 aspect-video flex items-center justify-center relative overflow-hidden">
          {isImage ? (
            <img 
              src={url} 
              alt={label}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              onError={(e) => {
                e.target.style.display = 'none'
                e.target.nextSibling.style.display = 'flex'
              }}
            />
          ) : null}
          <div 
            className={`flex flex-col items-center justify-center text-gray-500 ${isImage ? 'hidden' : ''}`}
            style={isImage ? { display: 'none' } : {}}
          >
            <Icon size={48} className="mb-2" />
            <span className="text-xs uppercase tracking-wide">{type}</span>
          </div>
          
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <div className="bg-orange-500 text-white p-2 rounded-full">
              <ExternalLink size={20} />
            </div>
          </div>
        </div>
        
        {/* File name */}
        <div className="p-3 bg-gray-800">
          <p className="text-sm text-white truncate">{fileName}</p>
          <p className="text-xs text-gray-500 mt-1">{label}</p>
        </div>
      </div>
    </a>
  )
}

// Text value component
function TextValue({ value, isUrl }) {
  if (!value) return <span className="text-gray-500 italic">Not provided</span>
  
  // Handle arrays (like _links)
  if (Array.isArray(value)) {
    if (value.length === 0) return <span className="text-gray-500 italic">No links provided</span>
    return (
      <div className="space-y-1">
        {value.map((link, i) => (
          <a 
            key={i}
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 break-all flex items-center gap-1 block"
          >
            🔗 {link.includes('drive.google') ? 'Google Drive' : link.includes('dropbox') ? 'Dropbox' : 'External'} link
            <ExternalLink size={14} />
          </a>
        ))}
      </div>
    )
  }
  
  // Check if it's a URL
  if (isUrl || value.startsWith('http://') || value.startsWith('https://')) {
    return (
      <a 
        href={value.startsWith('http') ? value : `https://${value}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-orange-500 hover:text-orange-400 break-all flex items-center gap-1"
      >
        {value}
        <ExternalLink size={14} />
      </a>
    )
  }
  
  // Multi-line text
  if (value.includes('\n')) {
    return <p className="text-white whitespace-pre-wrap">{value}</p>
  }
  
  return <span className="text-white">{value}</span>
}

// Contact display component
function ContactValue({ data, itemId }) {
  const name = data[`${itemId}_name`]
  const phone = data[`${itemId}_phone`]
  const email = data[`${itemId}_email`]
  
  if (!name && !phone && !email) {
    return <span className="text-gray-500 italic">Not provided</span>
  }
  
  return (
    <div className="space-y-1">
      {name && <p className="text-white font-medium">{name}</p>}
      {phone && (
        <a href={`tel:${phone}`} className="text-orange-500 hover:text-orange-400 block">
          📞 {phone}
        </a>
      )}
      {email && (
        <a href={`mailto:${email}`} className="text-orange-500 hover:text-orange-400 block">
          ✉️ {email}
        </a>
      )}
    </div>
  )
}

export default function CollectedDataView({ data, files = [], checklistConfig: customConfig }) {
  const [expandedCategories, setExpandedCategories] = useState(
    new Set(checklistConfig.map(c => c.id)) // All expanded by default
  )
  
  const config = customConfig || checklistConfig
  
  // Helper: Look up the label for a file type from checklist config
  const getFieldLabel = (categoryId, fileType) => {
    const category = config.find(c => c.id === categoryId)
    if (!category) return null
    const item = category.items.find(i => i.id === fileType)
    return item?.label || null
  }
  
  // Group files by category from the onboarding_files table
  const filesByCategory = {}
  for (const file of files) {
    if (!file.category) continue
    if (!filesByCategory[file.category]) {
      filesByCategory[file.category] = []
    }
    
    // Look up the proper label from checklist config using file_type
    const fieldLabel = getFieldLabel(file.category, file.file_type)
    
    filesByCategory[file.category].push({
      id: file.file_type || file.id,
      label: fieldLabel || file.file_type || 'Uploaded file', // Use config label, fallback to file_type, then generic
      url: file.drive_file_url || file.public_url, // Prefer Drive URL
      fileName: file.file_name,
      mimeType: file.mime_type
    })
  }
  
  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev => {
      const next = new Set(prev)
      if (next.has(categoryId)) next.delete(categoryId)
      else next.add(categoryId)
      return next
    })
  }
  
  // Check if category has any data
  const categoryHasData = (categoryId) => {
    // Check if there are files for this category
    if (filesByCategory[categoryId]?.length > 0) return true
    // Check collected_data
    const catData = data?.[categoryId]
    if (!catData) return false
    return Object.values(catData).some(v => v && v !== '')
  }
  
  // Count completed items in category
  const getCategoryStats = (category) => {
    const catData = data?.[category.id] || {}
    const catFiles = filesByCategory[category.id] || []
    let completed = 0
    let total = category.items.length
    
    // Get unique file types that have files uploaded
    const fileTypesWithFiles = new Set(catFiles.map(f => f.id))
    
    category.items.forEach(item => {
      // For file items, check if we have any files for this type
      if (item.type === 'file') {
        if (fileTypesWithFiles.has(item.id) || catData[`${item.id}_url`]) {
          completed++
        }
      } else if (item.type === 'contact') {
        // For contact type, check if any field is filled
        if (catData[`${item.id}_name`] || catData[`${item.id}_phone`] || catData[`${item.id}_email`]) {
          completed++
        }
      } else {
        const value = catData[item.id]
        if (value && value !== '') {
          completed++
        }
      }
    })
    
    return { completed, total }
  }
  
  if (!data || Object.keys(data).length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No information collected yet</p>
      </div>
    )
  }
  
  return (
    <div className="space-y-4">
      {config.map((category) => {
        const catData = data[category.id] || {}
        const isExpanded = expandedCategories.has(category.id)
        const hasData = categoryHasData(category.id)
        const stats = getCategoryStats(category)
        
        // Get files for this category from the files prop (onboarding_files table)
        // This shows ALL files uploaded, not just the last one per field
        const categoryFiles = filesByCategory[category.id] || []
        
        // Fallback: also check collected_data for any URLs not in onboarding_files
        const collectedDataFiles = category.items
          .filter(item => item.type === 'file')
          .map(item => ({
            ...item,
            url: catData[`${item.id}_url`] || catData[item.id]
          }))
          .filter(f => f.url && f.url.startsWith('http'))
          // Only include if not already in categoryFiles
          .filter(f => !categoryFiles.some(cf => cf.url === f.url))
        
        // Combine: prefer files from onboarding_files table, add any extras from collected_data
        const allFiles = [...categoryFiles, ...collectedDataFiles]
        
        // Collect all text items
        const textItems = category.items.filter(item => item.type !== 'file')
        
        return (
          <div 
            key={category.id}
            className={`border rounded-xl overflow-hidden transition-colors ${
              hasData ? 'border-gray-700 bg-gray-800/50' : 'border-gray-800 bg-gray-900/30'
            }`}
          >
            {/* Category Header */}
            <button
              onClick={() => toggleCategory(category.id)}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-700/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{category.icon}</span>
                <div className="text-left">
                  <h3 className="font-semibold text-white">{category.category}</h3>
                  <p className="text-xs text-gray-500">{stats.completed}/{stats.total} items provided</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {stats.completed === stats.total ? (
                  <span className="text-green-400 text-sm">✓ Complete</span>
                ) : stats.completed > 0 ? (
                  <span className="text-yellow-400 text-sm">{stats.completed}/{stats.total}</span>
                ) : (
                  <span className="text-gray-500 text-sm">Empty</span>
                )}
                {isExpanded ? (
                  <ChevronUp size={20} className="text-gray-400" />
                ) : (
                  <ChevronDown size={20} className="text-gray-400" />
                )}
              </div>
            </button>
            
            {/* Category Content */}
            {isExpanded && (
              <div className="border-t border-gray-700 p-4">
                {/* Files Grid */}
                {allFiles.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-xs text-gray-500 uppercase mb-3">Files ({allFiles.length})</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {allFiles.map((file, idx) => (
                        <FilePreview 
                          key={file.id || idx}
                          url={file.url}
                          label={file.fileName || file.label}
                        />
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Text Fields */}
                {textItems.length > 0 && (
                  <div className={allFiles.length > 0 ? 'mt-4 pt-4 border-t border-gray-700' : ''}>
                    <h4 className="text-xs text-gray-500 uppercase mb-3">Details</h4>
                    <div className="space-y-4">
                      {textItems.map((item) => {
                        const value = catData[item.id]
                        const hasValue = item.type === 'contact' 
                          ? (catData[`${item.id}_name`] || catData[`${item.id}_phone`] || catData[`${item.id}_email`])
                          : (value && value !== '')
                        
                        return (
                          <div 
                            key={item.id}
                            className={`${hasValue ? '' : 'opacity-50'}`}
                          >
                            <label className="text-sm text-gray-400 block mb-1">
                              {item.label}
                            </label>
                            {item.type === 'contact' ? (
                              <ContactValue data={catData} itemId={item.id} />
                            ) : (
                              <TextValue 
                                value={value}
                                isUrl={item.id.includes('website') || item.id.includes('facebook') || item.id.includes('instagram')}
                              />
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
                
                {/* External Links (Drive/Dropbox) */}
                {Object.entries(catData)
                  .filter(([key, value]) => key.endsWith('_links') && Array.isArray(value) && value.length > 0)
                  .length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <h4 className="text-xs text-gray-500 uppercase mb-3">External Links</h4>
                    <div className="space-y-4">
                      {Object.entries(catData)
                        .filter(([key, value]) => key.endsWith('_links') && Array.isArray(value) && value.length > 0)
                        .map(([key, links]) => {
                          // Find the label from the checklist config
                          const baseItemId = key.replace(/_links$/, '')
                          const item = category.items.find(i => i.id === baseItemId)
                          const label = item?.label || baseItemId.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
                          
                          return (
                            <div key={key}>
                              <label className="text-sm text-gray-400 block mb-1">
                                {label} (external links)
                              </label>
                              <div className="space-y-1">
                                {links.map((link, i) => (
                                  <a 
                                    key={i}
                                    href={link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-400 hover:text-blue-300 break-all flex items-center gap-2 p-2 bg-blue-500/10 rounded-lg text-sm"
                                  >
                                    <span>🔗</span>
                                    <span className="flex-1 truncate">
                                      {link.includes('drive.google') ? 'Google Drive' : link.includes('dropbox') ? 'Dropbox' : 'External'} link
                                    </span>
                                    <ExternalLink size={14} />
                                  </a>
                                ))}
                              </div>
                            </div>
                          )
                        })}
                    </div>
                  </div>
                )}
                
                {/* Empty state */}
                {allFiles.length === 0 && textItems.every(item => {
                  const value = catData[item.id]
                  return item.type === 'contact' 
                    ? !(catData[`${item.id}_name`] || catData[`${item.id}_phone`] || catData[`${item.id}_email`])
                    : !value || value === ''
                }) && (
                  <p className="text-gray-500 text-center py-4 italic">
                    No information provided for this category
                  </p>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
