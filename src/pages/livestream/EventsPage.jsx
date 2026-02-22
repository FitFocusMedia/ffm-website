import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, MapPin, Clock, Play, Ticket, Search, ChevronRight, ChevronLeft, X } from 'lucide-react'
import { getLivestreamEvents } from '../../lib/supabase'

// Countdown Timer Component
function CountdownTimer({ targetDate }) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(targetDate))

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(targetDate))
    }, 1000)
    return () => clearInterval(timer)
  }, [targetDate])

  function calculateTimeLeft(date) {
    const difference = new Date(date) - new Date()
    if (difference <= 0) return null
    
    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60)
    }
  }

  if (!timeLeft) return <span className="text-green-400 font-bold">Starting Soon!</span>

  return (
    <div className="flex gap-3 md:gap-4">
      {[
        { value: timeLeft.days, label: 'DAYS' },
        { value: timeLeft.hours, label: 'HRS' },
        { value: timeLeft.minutes, label: 'MIN' },
        { value: timeLeft.seconds, label: 'SEC' }
      ].map((item, i) => (
        <div key={i} className="text-center">
          <div className="bg-dark-800/80 backdrop-blur-sm rounded-lg px-3 py-2 md:px-4 md:py-3 min-w-[50px] md:min-w-[70px]">
            <span className="text-2xl md:text-4xl font-bold text-white tabular-nums">
              {String(item.value).padStart(2, '0')}
            </span>
          </div>
          <span className="text-[10px] md:text-xs text-gray-400 mt-1 block">{item.label}</span>
        </div>
      ))}
    </div>
  )
}

// Horizontal Scroll Row Component
function EventRow({ title, events, icon, accentColor = 'red' }) {
  const scrollRef = useState(null)
  
  if (!events || events.length === 0) return null

  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-4 px-1">
        <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
          {icon}
          {title}
        </h2>
        {events.length > 3 && (
          <span className="text-sm text-gray-500">{events.length} events</span>
        )}
      </div>
      
      <div className="relative group">
        <div 
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {events.map(event => (
            <div key={event.id} className="flex-shrink-0 w-[280px] md:w-[320px] snap-start">
              <EventCard event={event} compact />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// Enhanced Event Card
function EventCard({ event, featured = false, compact = false }) {
  const eventDate = new Date(event.start_time)
  const now = new Date()
  const isLive = event.status === 'live' || event.is_live
  const isPast = event.status === 'ended' || new Date(event.end_time) < now
  const isUpcoming = !isLive && !isPast
  
  // Time until event
  const hoursUntil = Math.floor((eventDate - now) / (1000 * 60 * 60))
  const isToday = eventDate.toDateString() === now.toDateString()
  const isTomorrow = eventDate.toDateString() === new Date(now.getTime() + 86400000).toDateString()
  const isThisWeek = hoursUntil > 0 && hoursUntil < 168

  if (featured) {
    return (
      <Link to={`/live/${event.id}`} className="block group">
        <div className="relative rounded-2xl overflow-hidden aspect-[21/9] md:aspect-[21/8]">
          {/* Background Image */}
          <div className="absolute inset-0">
            {event.thumbnail_url ? (
              <img 
                src={event.thumbnail_url} 
                alt={event.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-red-900 to-dark-900" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent" />
          </div>
          
          {/* Content */}
          <div className="absolute inset-0 p-6 md:p-10 flex flex-col justify-end">
            {/* Status Badge */}
            <div className="mb-3">
              {isLive && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-500 text-white text-sm font-bold rounded-full">
                  <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                  LIVE NOW
                </span>
              )}
              {isUpcoming && isToday && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500 text-black text-sm font-bold rounded-full">
                  TODAY
                </span>
              )}
              {isUpcoming && isTomorrow && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500 text-white text-sm font-bold rounded-full">
                  TOMORROW
                </span>
              )}
            </div>
            
            {/* Event Info */}
            <p className="text-red-400 font-semibold text-sm md:text-base mb-1">{event.organization}</p>
            <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-3 group-hover:text-red-400 transition-colors">
              {event.title}
            </h2>
            
            <div className="flex flex-wrap items-center gap-4 text-sm md:text-base text-gray-300 mb-4">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {eventDate.toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short' })}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {eventDate.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' })}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                {event.venue}
              </span>
            </div>
            
            {/* Countdown or CTA */}
            <div className="flex items-end justify-between gap-4">
              {isUpcoming && <CountdownTimer targetDate={event.start_time} />}
              {isLive && (
                <span className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg transition-colors flex items-center gap-2">
                  <Play className="w-5 h-5 fill-current" />
                  Watch Now
                </span>
              )}
              
              <div className="ml-auto">
                <span className="text-3xl md:text-4xl font-bold text-white">${event.price}</span>
                <span className="text-gray-400 ml-1">AUD</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    )
  }
  
  return (
    <Link 
      to={`/live/${event.id}`}
      className={`group bg-dark-900 rounded-xl overflow-hidden border border-dark-800 hover:border-red-500/50 hover:shadow-lg hover:shadow-red-500/10 transition-all duration-300 ${compact ? '' : ''}`}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-dark-800 overflow-hidden">
        {event.thumbnail_url ? (
          <img 
            src={event.thumbnail_url} 
            alt={event.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-dark-800 to-dark-900">
            <Play className="w-12 h-12 text-dark-600" />
          </div>
        )}
        
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity transform scale-90 group-hover:scale-100">
            <div className="w-14 h-14 rounded-full bg-red-500/90 flex items-center justify-center">
              <Play className="w-6 h-6 text-white fill-current ml-1" />
            </div>
          </div>
        </div>
        
        {/* Status Badge */}
        {isLive && (
          <div className="absolute top-3 left-3 px-2.5 py-1 bg-red-500 text-white text-xs font-bold rounded-full flex items-center gap-1.5 shadow-lg">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
            LIVE
          </div>
        )}
        {isPast && event.mux_playback_id && (
          <div className="absolute top-3 left-3 px-2.5 py-1 bg-green-600 text-white text-xs font-medium rounded-full shadow-lg">
            Replay
          </div>
        )}
        {isUpcoming && isToday && (
          <div className="absolute top-3 left-3 px-2.5 py-1 bg-amber-500 text-black text-xs font-bold rounded-full shadow-lg">
            TODAY
          </div>
        )}
        {isUpcoming && isTomorrow && (
          <div className="absolute top-3 left-3 px-2.5 py-1 bg-blue-500 text-white text-xs font-bold rounded-full shadow-lg">
            TOMORROW
          </div>
        )}
        
        {/* Price Tag */}
        <div className="absolute bottom-3 right-3 px-2.5 py-1 bg-black/80 backdrop-blur-sm text-white font-bold text-sm rounded-lg">
          ${event.price}
        </div>
        
        {/* Organization Badge */}
        <div className="absolute bottom-3 left-3 px-2.5 py-1 bg-dark-900/80 backdrop-blur-sm text-gray-300 text-xs font-medium rounded-lg">
          {event.organization}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-lg font-bold text-white mb-2 group-hover:text-red-400 transition-colors line-clamp-1">
          {event.title}
        </h3>
        
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {eventDate.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {eventDate.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </Link>
  )
}

export default function EventsPage() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedOrg, setSelectedOrg] = useState('all')

  useEffect(() => {
    loadEvents()
  }, [])

  const loadEvents = async () => {
    try {
      const data = await getLivestreamEvents()
      setEvents(data || [])
    } catch (err) {
      setError('Failed to load events')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Get unique organizations
  const organizations = useMemo(() => {
    const orgs = [...new Set(events.map(e => e.organization).filter(Boolean))]
    return orgs.sort()
  }, [events])

  // Filter events
  const filteredEvents = useMemo(() => {
    let filtered = events
    
    // Filter by organization
    if (selectedOrg !== 'all') {
      filtered = filtered.filter(e => e.organization === selectedOrg)
    }
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(e => 
        e.title?.toLowerCase().includes(query) ||
        e.organization?.toLowerCase().includes(query) ||
        e.venue?.toLowerCase().includes(query)
      )
    }
    
    return filtered
  }, [events, selectedOrg, searchQuery])

  // Categorize events
  const now = new Date()
  const liveEvents = filteredEvents.filter(e => e.status === 'live' || e.is_live)
  const upcomingEvents = filteredEvents.filter(e => {
    const start = new Date(e.start_time)
    return start > now && e.status !== 'ended' && e.status !== 'live' && !e.is_live
  }).sort((a, b) => new Date(a.start_time) - new Date(b.start_time))
  
  const thisWeekEvents = upcomingEvents.filter(e => {
    const hoursUntil = (new Date(e.start_time) - now) / (1000 * 60 * 60)
    return hoursUntil <= 168
  })
  
  const laterEvents = upcomingEvents.filter(e => {
    const hoursUntil = (new Date(e.start_time) - now) / (1000 * 60 * 60)
    return hoursUntil > 168
  })
  
  const pastEvents = filteredEvents.filter(e => 
    e.status === 'ended' || new Date(e.end_time) < now
  ).sort((a, b) => new Date(b.start_time) - new Date(a.start_time))

  // Featured event (next upcoming or current live)
  const featuredEvent = liveEvents[0] || upcomingEvents[0]

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-dark-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading events...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-dark-950">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            onClick={loadEvents}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-950">
      {/* Hero Section with Featured Event */}
      {featuredEvent && !searchQuery && selectedOrg === 'all' && (
        <section className="px-4 pt-8 pb-6">
          <div className="max-w-7xl mx-auto">
            <EventCard event={featuredEvent} featured />
          </div>
        </section>
      )}

      {/* Search & Filters */}
      <div className="sticky top-0 z-20 bg-dark-950/95 backdrop-blur-md border-b border-dark-800">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder="Search events, organizations, venues..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-dark-800 border border-dark-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            
            {/* Organization Filter */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              <button
                onClick={() => setSelectedOrg('all')}
                className={`flex-shrink-0 px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedOrg === 'all'
                    ? 'bg-red-500 text-white'
                    : 'bg-dark-800 text-gray-400 hover:bg-dark-700 hover:text-white'
                }`}
              >
                All Events
              </button>
              {organizations.map(org => (
                <button
                  key={org}
                  onClick={() => setSelectedOrg(org)}
                  className={`flex-shrink-0 px-4 py-2 rounded-lg font-medium transition-all ${
                    selectedOrg === org
                      ? 'bg-red-500 text-white'
                      : 'bg-dark-800 text-gray-400 hover:bg-dark-700 hover:text-white'
                  }`}
                >
                  {org}
                </button>
              ))}
            </div>
            
            {/* My Purchases Link */}
            <Link
              to="/my-purchases"
              className="flex-shrink-0 flex items-center justify-center gap-2 px-4 py-2 bg-dark-800 hover:bg-dark-700 text-white rounded-lg transition-colors"
            >
              <Ticket className="w-5 h-5" />
              <span className="hidden sm:inline">My Purchases</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Events Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search Results View */}
        {(searchQuery || selectedOrg !== 'all') && (
          <div className="mb-6">
            <p className="text-gray-400">
              {filteredEvents.length} {filteredEvents.length === 1 ? 'event' : 'events'} found
              {searchQuery && <span> for "{searchQuery}"</span>}
              {selectedOrg !== 'all' && <span> in {selectedOrg}</span>}
            </p>
          </div>
        )}

        {/* Live Now - Full Width Cards */}
        {liveEvents.length > 0 && (
          <section className="mb-10">
            <h2 className="text-xl md:text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
              Live Now
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {liveEvents.map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </section>
        )}

        {/* This Week - Horizontal Scroll */}
        {thisWeekEvents.length > 0 && !searchQuery && (
          <EventRow 
            title="This Week" 
            events={thisWeekEvents}
            icon={<Calendar className="w-5 h-5 text-amber-500" />}
          />
        )}

        {/* Coming Soon - Horizontal Scroll */}
        {laterEvents.length > 0 && !searchQuery && (
          <EventRow 
            title="Coming Soon" 
            events={laterEvents}
            icon={<Clock className="w-5 h-5 text-blue-500" />}
          />
        )}

        {/* All Upcoming (when searching/filtering) */}
        {(searchQuery || selectedOrg !== 'all') && upcomingEvents.length > 0 && (
          <section className="mb-10">
            <h2 className="text-xl md:text-2xl font-bold text-white mb-4">Upcoming Events</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingEvents.map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </section>
        )}

        {/* Replays - Horizontal Scroll */}
        {pastEvents.length > 0 && (
          <EventRow 
            title="Replays Available" 
            events={pastEvents.filter(e => e.mux_playback_id)}
            icon={<Play className="w-5 h-5 text-green-500" />}
          />
        )}

        {/* No Events */}
        {filteredEvents.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-dark-800 flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-600" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No events found</h3>
            <p className="text-gray-400 mb-6">
              {searchQuery 
                ? `No events match "${searchQuery}"`
                : selectedOrg !== 'all'
                  ? `No events from ${selectedOrg}`
                  : 'No events scheduled yet. Check back soon!'
              }
            </p>
            {(searchQuery || selectedOrg !== 'all') && (
              <button
                onClick={() => { setSearchQuery(''); setSelectedOrg('all'); }}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
