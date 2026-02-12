// athleteData.js - Seed data for athlete portal demo

export const seedEvents = [
  {
    id: 'event-wng3-2024',
    name: "WNG 3 — Who's Next Grappling",
    date: '2024-03-15',
    venue: 'Brisbane Convention Centre',
    org_name: "Who's Next",
    created_at: '2024-03-01T10:00:00Z'
  },
  {
    id: 'event-afn8-2024',
    name: 'Aggression Fight Night 8',
    date: '2024-02-10',
    venue: 'The Fortitude Music Hall',
    org_name: 'Aggression',
    created_at: '2024-02-01T10:00:00Z'
  }
]

export const seedAthletes = [
  {
    id: 'athlete-jsmith-001',
    name: 'Jake Smith',
    email: 'jake.smith@example.com',
    sport: 'Brazilian Jiu-Jitsu',
    gym: 'Gracie Brisbane',
    created_at: '2024-01-15T08:00:00Z'
  },
  {
    id: 'athlete-mchen-002',
    name: 'Michelle Chen',
    email: 'michelle.chen@example.com',
    sport: 'MMA',
    gym: 'Integrated MMA',
    created_at: '2024-01-20T09:00:00Z'
  },
  {
    id: 'athlete-rjones-003',
    name: 'Ryan Jones',
    email: 'ryan.jones@example.com',
    sport: 'Muay Thai',
    gym: 'Roundhouse Brisbane',
    created_at: '2024-02-01T10:00:00Z'
  }
]

export const seedContent = [
  // Jake Smith - WNG 3 (VIP Package)
  {
    id: 'content-001',
    athlete_id: 'athlete-jsmith-001',
    event_id: 'event-wng3-2024',
    type: 'photo',
    title: 'Match Action - Guard Pass',
    drive_url: 'https://via.placeholder.com/1200x800/0d0d1a/e51d1d?text=Guard+Pass',
    thumbnail_url: 'https://via.placeholder.com/400x300/0d0d1a/e51d1d?text=Guard+Pass',
    package_type: 'vip',
    created_at: '2024-03-16T10:00:00Z'
  },
  {
    id: 'content-002',
    athlete_id: 'athlete-jsmith-001',
    event_id: 'event-wng3-2024',
    type: 'photo',
    title: 'Submission Attempt',
    drive_url: 'https://via.placeholder.com/1200x800/0d0d1a/e51d1d?text=Submission',
    thumbnail_url: 'https://via.placeholder.com/400x300/0d0d1a/e51d1d?text=Submission',
    package_type: 'vip',
    created_at: '2024-03-16T10:05:00Z'
  },
  {
    id: 'content-003',
    athlete_id: 'athlete-jsmith-001',
    event_id: 'event-wng3-2024',
    type: 'photo',
    title: 'Victory Moment',
    drive_url: 'https://via.placeholder.com/1200x800/0d0d1a/FFD700?text=Victory',
    thumbnail_url: 'https://via.placeholder.com/400x300/0d0d1a/FFD700?text=Victory',
    package_type: 'vip',
    created_at: '2024-03-16T10:10:00Z'
  },
  {
    id: 'content-004',
    athlete_id: 'athlete-jsmith-001',
    event_id: 'event-wng3-2024',
    type: 'photo',
    title: 'Podium Celebration',
    drive_url: 'https://via.placeholder.com/1200x800/0d0d1a/FFD700?text=Podium',
    thumbnail_url: 'https://via.placeholder.com/400x300/0d0d1a/FFD700?text=Podium',
    package_type: 'vip',
    created_at: '2024-03-16T10:15:00Z'
  },
  {
    id: 'content-005',
    athlete_id: 'athlete-jsmith-001',
    event_id: 'event-wng3-2024',
    type: 'video',
    title: 'Walkout',
    drive_url: 'https://via.placeholder.com/1920x1080/0d0d1a/e51d1d?text=Walkout+Video',
    thumbnail_url: 'https://via.placeholder.com/640x360/0d0d1a/e51d1d?text=Walkout+Video',
    package_type: 'vip',
    duration: '0:45',
    created_at: '2024-03-16T11:00:00Z'
  },
  {
    id: 'content-006',
    athlete_id: 'athlete-jsmith-001',
    event_id: 'event-wng3-2024',
    type: 'video',
    title: 'Match Highlight',
    drive_url: 'https://via.placeholder.com/1920x1080/0d0d1a/e51d1d?text=Match+Highlight',
    thumbnail_url: 'https://via.placeholder.com/640x360/0d0d1a/e51d1d?text=Match+Highlight',
    package_type: 'vip',
    duration: '2:30',
    created_at: '2024-03-16T11:05:00Z'
  },
  {
    id: 'content-007',
    athlete_id: 'athlete-jsmith-001',
    event_id: 'event-wng3-2024',
    type: 'video',
    title: 'Victory Moment',
    drive_url: 'https://via.placeholder.com/1920x1080/0d0d1a/FFD700?text=Victory+Video',
    thumbnail_url: 'https://via.placeholder.com/640x360/0d0d1a/FFD700?text=Victory+Video',
    package_type: 'vip',
    duration: '0:30',
    created_at: '2024-03-16T11:10:00Z'
  },

  // Michelle Chen - Aggression Fight Night 8 (Match Package)
  {
    id: 'content-008',
    athlete_id: 'athlete-mchen-002',
    event_id: 'event-afn8-2024',
    type: 'photo',
    title: 'Opening Exchange',
    drive_url: 'https://via.placeholder.com/1200x800/0d0d1a/e51d1d?text=Opening+Exchange',
    thumbnail_url: 'https://via.placeholder.com/400x300/0d0d1a/e51d1d?text=Opening+Exchange',
    package_type: 'match',
    created_at: '2024-02-11T10:00:00Z'
  },
  {
    id: 'content-009',
    athlete_id: 'athlete-mchen-002',
    event_id: 'event-afn8-2024',
    type: 'photo',
    title: 'Head Kick',
    drive_url: 'https://via.placeholder.com/1200x800/0d0d1a/e51d1d?text=Head+Kick',
    thumbnail_url: 'https://via.placeholder.com/400x300/0d0d1a/e51d1d?text=Head+Kick',
    package_type: 'match',
    created_at: '2024-02-11T10:05:00Z'
  },
  {
    id: 'content-010',
    athlete_id: 'athlete-mchen-002',
    event_id: 'event-afn8-2024',
    type: 'photo',
    title: 'Ground Control',
    drive_url: 'https://via.placeholder.com/1200x800/0d0d1a/e51d1d?text=Ground+Control',
    thumbnail_url: 'https://via.placeholder.com/400x300/0d0d1a/e51d1d?text=Ground+Control',
    package_type: 'match',
    created_at: '2024-02-11T10:10:00Z'
  },
  {
    id: 'content-011',
    athlete_id: 'athlete-mchen-002',
    event_id: 'event-afn8-2024',
    type: 'video',
    title: 'Match Highlight',
    drive_url: 'https://via.placeholder.com/1920x1080/0d0d1a/e51d1d?text=Match+Highlight',
    thumbnail_url: 'https://via.placeholder.com/640x360/0d0d1a/e51d1d?text=Match+Highlight',
    package_type: 'match',
    duration: '1:45',
    created_at: '2024-02-11T11:00:00Z'
  },

  // Ryan Jones - WNG 3 (Match Package)
  {
    id: 'content-012',
    athlete_id: 'athlete-rjones-003',
    event_id: 'event-wng3-2024',
    type: 'photo',
    title: 'Clinch Work',
    drive_url: 'https://via.placeholder.com/1200x800/0d0d1a/e51d1d?text=Clinch+Work',
    thumbnail_url: 'https://via.placeholder.com/400x300/0d0d1a/e51d1d?text=Clinch+Work',
    package_type: 'match',
    created_at: '2024-03-16T12:00:00Z'
  },
  {
    id: 'content-013',
    athlete_id: 'athlete-rjones-003',
    event_id: 'event-wng3-2024',
    type: 'photo',
    title: 'Knee Strike',
    drive_url: 'https://via.placeholder.com/1200x800/0d0d1a/e51d1d?text=Knee+Strike',
    thumbnail_url: 'https://via.placeholder.com/400x300/0d0d1a/e51d1d?text=Knee+Strike',
    package_type: 'match',
    created_at: '2024-03-16T12:05:00Z'
  },
  {
    id: 'content-014',
    athlete_id: 'athlete-rjones-003',
    event_id: 'event-wng3-2024',
    type: 'video',
    title: 'Match Highlight',
    drive_url: 'https://via.placeholder.com/1920x1080/0d0d1a/e51d1d?text=Match+Highlight',
    thumbnail_url: 'https://via.placeholder.com/640x360/0d0d1a/e51d1d?text=Match+Highlight',
    package_type: 'match',
    duration: '1:30',
    created_at: '2024-03-16T12:30:00Z'
  }
]

export const seedAccess = [
  {
    athlete_id: 'athlete-jsmith-001',
    event_id: 'event-wng3-2024',
    package_type: 'vip',
    granted_at: '2024-03-16T09:00:00Z'
  },
  {
    athlete_id: 'athlete-mchen-002',
    event_id: 'event-afn8-2024',
    package_type: 'match',
    granted_at: '2024-02-11T09:00:00Z'
  },
  {
    athlete_id: 'athlete-rjones-003',
    event_id: 'event-wng3-2024',
    package_type: 'match',
    granted_at: '2024-03-16T09:00:00Z'
  }
]

// Load seed data into localStorage
export const loadSeedData = () => {
  const profiles = localStorage.getItem('ffm_athlete_profiles')
  const events = localStorage.getItem('ffm_athlete_events')
  const content = localStorage.getItem('ffm_athlete_content')
  const access = localStorage.getItem('ffm_athlete_access')

  // Only load if data doesn't exist
  if (!profiles) {
    localStorage.setItem('ffm_athlete_profiles', JSON.stringify(seedAthletes))
  }
  if (!events) {
    localStorage.setItem('ffm_athlete_events', JSON.stringify(seedEvents))
  }
  if (!content) {
    localStorage.setItem('ffm_athlete_content', JSON.stringify(seedContent))
  }
  if (!access) {
    localStorage.setItem('ffm_athlete_access', JSON.stringify(seedAccess))
  }

  console.log('✅ Athlete portal seed data loaded')
}

// Force reload seed data (for testing)
export const reloadSeedData = () => {
  localStorage.setItem('ffm_athlete_profiles', JSON.stringify(seedAthletes))
  localStorage.setItem('ffm_athlete_events', JSON.stringify(seedEvents))
  localStorage.setItem('ffm_athlete_content', JSON.stringify(seedContent))
  localStorage.setItem('ffm_athlete_access', JSON.stringify(seedAccess))
  console.log('✅ Athlete portal seed data reloaded')
}
