import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, MapPin, Clock, Play, Ticket } from 'lucide-react'
import { getLivestreamEvents } from '../../lib/supabase'

export default function EventsPage() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

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

  const now = new Date()
  const upcomingEvents = events.filter(e => new Date(e.start_time) > now && e.status !== 'ended')
  const liveEvents = events.filter(e => e.status === 'live' || e.is_live)
  const pastEvents = events.filter(e => e.status === 'ended' || new Date(e.end_time) < now)

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  return (
    <div className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Live Events
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-6">
            Watch live combat sports events from anywhere. Professional production, HD quality streaming.
          </p>
          <Link
            to="/my-purchases"
            className="inline-flex items-center gap-2 px-4 py-2 bg-dark-800 hover:bg-dark-700 text-white rounded-lg transition-colors"
          >
            <Ticket className="w-5 h-5" />
            My Purchases
          </Link>
        </div>

        {/* Live Now */}
        {liveEvents.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
              Live Now
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {liveEvents.map(event => (
                <EventCard key={event.id} event={event} isLive />
              ))}
            </div>
          </section>
        )}

        {/* Upcoming */}
        {upcomingEvents.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6">Upcoming Events</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingEvents.map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </section>
        )}

        {/* Past Events / Replays */}
        {pastEvents.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-white mb-6">Replays Available</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pastEvents.map(event => (
                <EventCard key={event.id} event={event} isPast />
              ))}
            </div>
          </section>
        )}

        {/* No Events */}
        {events.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-400 text-lg">No events scheduled yet. Check back soon!</p>
          </div>
        )}
      </div>
    </div>
  )
}

function EventCard({ event, isLive, isPast }) {
  const eventDate = new Date(event.start_time)
  
  return (
    <Link 
      to={`/live/${event.id}`}
      className="group bg-dark-900 rounded-xl overflow-hidden border border-dark-800 hover:border-red-500/50 transition-all"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-dark-800">
        {event.thumbnail_url ? (
          <img 
            src={event.thumbnail_url} 
            alt={event.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Play className="w-16 h-16 text-dark-600" />
          </div>
        )}
        
        {/* Status Badge */}
        {isLive && (
          <div className="absolute top-3 left-3 px-3 py-1 bg-red-500 text-white text-sm font-bold rounded-full flex items-center gap-1">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
            LIVE
          </div>
        )}
        {isPast && (
          <div className="absolute top-3 left-3 px-3 py-1 bg-dark-700 text-white text-sm font-medium rounded-full">
            Replay
          </div>
        )}
        
        {/* Price */}
        <div className="absolute bottom-3 right-3 px-3 py-1 bg-black/80 text-white font-bold rounded-lg">
          ${event.price} AUD
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-red-500 transition-colors">
          {event.title}
        </h3>
        <p className="text-gray-400 mb-4">{event.organization}</p>
        
        <div className="space-y-2 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {eventDate.toLocaleDateString('en-AU', {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            })}
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            {eventDate.toLocaleTimeString('en-AU', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            {event.venue}
          </div>
        </div>
      </div>
    </Link>
  )
}
