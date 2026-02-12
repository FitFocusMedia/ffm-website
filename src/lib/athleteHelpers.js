// athleteHelpers.js - localStorage-based data management for athlete portal

const STORAGE_KEYS = {
  PROFILES: 'ffm_athlete_profiles',
  EVENTS: 'ffm_athlete_events',
  CONTENT: 'ffm_athlete_content',
  ACCESS: 'ffm_athlete_access'
}

// Helper to get data from localStorage
const getStorage = (key) => {
  try {
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : []
  } catch (err) {
    console.error(`Error reading ${key}:`, err)
    return []
  }
}

// Helper to set data in localStorage
const setStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (err) {
    console.error(`Error writing ${key}:`, err)
  }
}

// Generate unique ID
const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// ============= ATHLETE PROFILE FUNCTIONS =============

export const getAthleteProfile = (userId) => {
  const profiles = getStorage(STORAGE_KEYS.PROFILES)
  return profiles.find(p => p.id === userId || p.email === userId)
}

export const createAthleteProfile = (profileData) => {
  const profiles = getStorage(STORAGE_KEYS.PROFILES)
  const newProfile = {
    id: generateId(),
    name: profileData.name,
    email: profileData.email,
    sport: profileData.sport || '',
    gym: profileData.gym || '',
    created_at: new Date().toISOString()
  }
  profiles.push(newProfile)
  setStorage(STORAGE_KEYS.PROFILES, profiles)
  return newProfile
}

export const updateAthleteProfile = (userId, updates) => {
  const profiles = getStorage(STORAGE_KEYS.PROFILES)
  const index = profiles.findIndex(p => p.id === userId)
  if (index !== -1) {
    profiles[index] = { ...profiles[index], ...updates }
    setStorage(STORAGE_KEYS.PROFILES, profiles)
    return profiles[index]
  }
  return null
}

export const getRegisteredAthletes = () => {
  return getStorage(STORAGE_KEYS.PROFILES)
}

// ============= EVENT FUNCTIONS =============

export const getAllEvents = () => {
  return getStorage(STORAGE_KEYS.EVENTS).sort((a, b) => 
    new Date(b.date) - new Date(a.date)
  )
}

export const getEventById = (eventId) => {
  const events = getStorage(STORAGE_KEYS.EVENTS)
  return events.find(e => e.id === eventId)
}

export const createEvent = (eventData) => {
  const events = getStorage(STORAGE_KEYS.EVENTS)
  const newEvent = {
    id: generateId(),
    name: eventData.name,
    date: eventData.date,
    venue: eventData.venue || '',
    org_name: eventData.org_name || '',
    created_at: new Date().toISOString()
  }
  events.push(newEvent)
  setStorage(STORAGE_KEYS.EVENTS, events)
  return newEvent
}

export const updateEvent = (eventId, updates) => {
  const events = getStorage(STORAGE_KEYS.EVENTS)
  const index = events.findIndex(e => e.id === eventId)
  if (index !== -1) {
    events[index] = { ...events[index], ...updates }
    setStorage(STORAGE_KEYS.EVENTS, events)
    return events[index]
  }
  return null
}

export const deleteEvent = (eventId) => {
  const events = getStorage(STORAGE_KEYS.EVENTS)
  const filtered = events.filter(e => e.id !== eventId)
  setStorage(STORAGE_KEYS.EVENTS, filtered)
}

// ============= ATHLETE EVENT ACCESS FUNCTIONS =============

export const getAthleteEvents = (userId) => {
  const access = getStorage(STORAGE_KEYS.ACCESS)
  const events = getStorage(STORAGE_KEYS.EVENTS)
  
  // Get all event IDs this athlete has access to
  const athleteAccess = access.filter(a => a.athlete_id === userId)
  const eventIds = [...new Set(athleteAccess.map(a => a.event_id))]
  
  // Get full event details
  return events
    .filter(e => eventIds.includes(e.id))
    .map(event => {
      const eventAccess = athleteAccess.find(a => a.event_id === event.id)
      return {
        ...event,
        package_type: eventAccess?.package_type || 'match',
        granted_at: eventAccess?.granted_at
      }
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date))
}

// ============= CONTENT FUNCTIONS =============

export const getEventContent = (userId, eventId) => {
  const content = getStorage(STORAGE_KEYS.CONTENT)
  const access = getStorage(STORAGE_KEYS.ACCESS)
  
  // Check if athlete has access to this event
  const hasAccess = access.some(a => 
    a.athlete_id === userId && a.event_id === eventId
  )
  
  if (!hasAccess) return []
  
  // Return all content for this event
  return content
    .filter(c => c.athlete_id === userId && c.event_id === eventId)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
}

export const getAllAthleteContent = (userId) => {
  const content = getStorage(STORAGE_KEYS.CONTENT)
  return content
    .filter(c => c.athlete_id === userId)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
}

export const getAthleteStats = (userId) => {
  const content = getStorage(STORAGE_KEYS.CONTENT)
  const events = getAthleteEvents(userId)
  
  const athleteContent = content.filter(c => c.athlete_id === userId)
  const photos = athleteContent.filter(c => c.type === 'photo')
  const videos = athleteContent.filter(c => c.type === 'video')
  
  // Determine active package (most recent)
  const activePackage = events.length > 0 ? events[0].package_type : null
  
  return {
    totalEvents: events.length,
    totalPhotos: photos.length,
    totalVideos: videos.length,
    activePackage: activePackage
  }
}

// ============= ADMIN: ASSIGN CONTENT =============

export const assignContent = (athleteId, eventId, contentItems, packageType) => {
  const content = getStorage(STORAGE_KEYS.CONTENT)
  const access = getStorage(STORAGE_KEYS.ACCESS)
  
  // Create content records
  const newContent = contentItems.map(item => ({
    id: generateId(),
    athlete_id: athleteId,
    event_id: eventId,
    type: item.type, // 'photo' or 'video'
    title: item.title || '',
    drive_url: item.drive_url,
    thumbnail_url: item.thumbnail_url || item.drive_url,
    package_type: packageType,
    duration: item.duration || null, // for videos
    created_at: new Date().toISOString()
  }))
  
  content.push(...newContent)
  setStorage(STORAGE_KEYS.CONTENT, content)
  
  // Grant access to event
  const existingAccess = access.find(a => 
    a.athlete_id === athleteId && a.event_id === eventId
  )
  
  if (!existingAccess) {
    access.push({
      athlete_id: athleteId,
      event_id: eventId,
      package_type: packageType,
      granted_at: new Date().toISOString()
    })
    setStorage(STORAGE_KEYS.ACCESS, access)
  }
  
  return newContent
}

// ============= ADMIN: CONTENT MANAGEMENT =============

export const getContentByEvent = (eventId) => {
  const content = getStorage(STORAGE_KEYS.CONTENT)
  return content.filter(c => c.event_id === eventId)
}

export const getAthleteContentStats = (athleteId) => {
  const content = getStorage(STORAGE_KEYS.CONTENT)
  const athleteContent = content.filter(c => c.athlete_id === athleteId)
  const events = getAthleteEvents(athleteId)
  
  return {
    totalEvents: events.length,
    totalPhotos: athleteContent.filter(c => c.type === 'photo').length,
    totalVideos: athleteContent.filter(c => c.type === 'video').length,
    packages: events.map(e => e.package_type)
  }
}

export const deleteContent = (contentId) => {
  const content = getStorage(STORAGE_KEYS.CONTENT)
  const filtered = content.filter(c => c.id !== contentId)
  setStorage(STORAGE_KEYS.CONTENT, filtered)
}

export const revokeAccess = (athleteId, eventId) => {
  const access = getStorage(STORAGE_KEYS.ACCESS)
  const filtered = access.filter(a => 
    !(a.athlete_id === athleteId && a.event_id === eventId)
  )
  setStorage(STORAGE_KEYS.ACCESS, filtered)
  
  // Also remove content for this athlete/event
  const content = getStorage(STORAGE_KEYS.CONTENT)
  const filteredContent = content.filter(c =>
    !(c.athlete_id === athleteId && c.event_id === eventId)
  )
  setStorage(STORAGE_KEYS.CONTENT, filteredContent)
}

// ============= UTILITY FUNCTIONS =============

export const getPackageLabel = (packageType) => {
  const labels = {
    'vip': 'VIP Package',
    'match': 'Match Package',
    'season': 'Season Pass'
  }
  return labels[packageType] || packageType
}

export const getPackageColor = (packageType) => {
  const colors = {
    'vip': 'from-yellow-500/20 to-amber-600/20 border-yellow-500/30',
    'match': 'from-blue-500/20 to-cyan-600/20 border-blue-500/30',
    'season': 'from-purple-500/20 to-pink-600/20 border-purple-500/30'
  }
  return colors[packageType] || 'from-gray-500/20 to-gray-600/20 border-gray-500/30'
}

export const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-AU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Convert Google Drive URL to direct download link
export const getDriveDownloadUrl = (url) => {
  // Extract file ID from various Drive URL formats
  const patterns = [
    /\/file\/d\/([a-zA-Z0-9_-]+)/,
    /id=([a-zA-Z0-9_-]+)/,
    /\/d\/([a-zA-Z0-9_-]+)/
  ]
  
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) {
      return `https://drive.google.com/uc?export=download&id=${match[1]}`
    }
  }
  
  return url // Return original if no pattern matches
}

// Convert Google Drive URL to thumbnail
export const getDriveThumbnailUrl = (url, size = 500) => {
  const patterns = [
    /\/file\/d\/([a-zA-Z0-9_-]+)/,
    /id=([a-zA-Z0-9_-]+)/,
    /\/d\/([a-zA-Z0-9_-]+)/
  ]
  
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) {
      return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w${size}`
    }
  }
  
  return url
}
