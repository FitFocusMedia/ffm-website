import { useState, useEffect, useRef } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import { Calendar, MapPin, AlertCircle, RefreshCw, Clock, Bell } from 'lucide-react'
import MuxPlayer from '@mux/mux-player-react'
import { 
  getLivestreamEvent, 
  getLivestreamOrderByEmail,
  createLivestreamSession,
  updateSessionHeartbeat 
} from '../../lib/supabase'
import { trackPurchaseComplete } from '../../lib/analytics'
import CountdownTimer from '../../components/CountdownTimer'
import ViewerCount from '../../components/ViewerCount'

export default function WatchPage() {
  const { eventId } = useParams()
  const [searchParams] = useSearchParams()
  const [event, setEvent] = useState(null)
  const [email, setEmail] = useState(searchParams.get('email') || '')
  const [sessionToken, setSessionToken] = useState(null)
  const [hasAccess, setHasAccess] = useState(false)
  const [loading, setLoading] = useState(true)
  const [verifying, setVerifying] = useState(false)
  const [error, setError] = useState(null)
  const [sessionEnded, setSessionEnded] = useState(false)
  const [geoBlocked, setGeoBlocked] = useState(null)
  const [geoInfo, setGeoInfo] = useState(null)
  const heartbeatRef = useRef(null)

  useEffect(() => {
    loadEvent()
    return () => {
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current)
      }
    }
  }, [eventId])

  // Check geo-blocking after event loads
  useEffect(() => {
    if (event && event.geo_blocking_enabled) {
      checkGeoBlocking()
    }
  }, [event])

  const checkGeoBlocking = async () => {
    try {
      // Check for crew bypass token in URL
      const bypassToken = searchParams.get('bypass')
      
      const response = await fetch('https://gonalgubgldgpkcekaxe.supabase.co/functions/v1/geo-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          venue_lat: event.geo_lat,
          venue_lng: event.geo_lng,
          radius_km: event.geo_radius_km || 50,
          event_id: eventId,
          bypass_token: bypassToken
        })
      })
      const data = await response.json()
      
      // If bypass was used, grant full access (skip purchase check too)
      if (data.bypass) {
        setGeoBlocked(false)
        setGeoInfo({ ...data, crew_bypass: true })
        setHasAccess(true) // Crew bypass grants viewing access
        setEmail('crew@bypass')
      } else {
        setGeoBlocked(data.blocked)
        setGeoInfo(data)
      }
    } catch (err) {
      console.error('Geo check failed:', err)
      setGeoBlocked(false) // Allow access if geo check fails
    }
  }

  // Auto-verify if email in URL
  useEffect(() => {
    const urlEmail = searchParams.get('email')
    if (urlEmail && event && !hasAccess) {
      verifyAccess(urlEmail)
    }
  }, [event, searchParams])

  // Heartbeat to keep session alive
  useEffect(() => {
    if (sessionToken && hasAccess) {
      heartbeatRef.current = setInterval(async () => {
        try {
          const session = await updateSessionHeartbeat(sessionToken)
          if (!session) {
            setSessionEnded(true)
            setHasAccess(false)
            clearInterval(heartbeatRef.current)
          }
        } catch (err) {
          console.error('Heartbeat failed:', err)
        }
      }, 30000)
    }
    return () => {
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current)
      }
    }
  }, [sessionToken, hasAccess])

  const loadEvent = async () => {
    try {
      const data = await getLivestreamEvent(eventId)
      setEvent(data)
    } catch (err) {
      setError('Event not found')
    } finally {
      setLoading(false)
    }
  }

  const verifyAccess = async (emailToVerify = email) => {
    if (!emailToVerify) {
      setError('Please enter your email')
      return
    }

    setVerifying(true)
    setError(null)
    setSessionEnded(false)

    try {
      // Check for Stripe session_id in URL (redirect from checkout)
      const stripeSessionId = searchParams.get('session_id')
      
      // Verify payment via Edge Function
      const verifyResponse = await fetch('https://gonalgubgldgpkcekaxe.supabase.co/functions/v1/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          session_id: stripeSessionId, 
          event_id: eventId, 
          email: emailToVerify 
        })
      })
      const verifyData = await verifyResponse.json()
      
      if (!verifyData.verified) {
        // Fallback to direct order check
        const order = await getLivestreamOrderByEmail(eventId, emailToVerify)
        if (!order) {
          setError('No purchase found for this email. Please check your email or purchase access.')
          setHasAccess(false)
          return
        }
      }

      // Create viewing session
      const session = await createLivestreamSession({
        event_id: eventId,
        order_id: order.id,
        email: emailToVerify.toLowerCase()
      })

      setSessionToken(session.token)
      setHasAccess(true)
      setEmail(emailToVerify)
      
      // Track purchase complete if this is from Stripe redirect (new purchase)
      if (stripeSessionId) {
        trackPurchaseComplete(eventId, emailToVerify)
      }
      
      // Store in localStorage for page refresh
      localStorage.setItem(`livestream_session_${eventId}`, session.token)
      localStorage.setItem(`livestream_email_${eventId}`, emailToVerify)
    } catch (err) {
      console.error('Verify error:', err)
      setError('Failed to verify access. Please try again.')
      setHasAccess(false)
    } finally {
      setVerifying(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    )
  }

  if (error && !event) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  // Geo-blocked
  if (geoBlocked) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-dark-900 rounded-xl p-8 text-center">
          <MapPin className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Location Restricted</h2>
          <p className="text-gray-400 mb-4">
            Online streaming is not available within {event.geo_radius_km || 50}km of the venue.
          </p>
          {geoInfo?.user_location && (
            <p className="text-gray-500 text-sm mb-4">
              Your location: {geoInfo.user_location.city}, {geoInfo.user_location.country}<br/>
              Distance from venue: {geoInfo.distance_km}km
            </p>
          )}
          <p className="text-gray-400 mb-6">
            This event is available to watch in person at:
          </p>
          <p className="text-white font-semibold mb-6">{event.venue}</p>
          {event.ticket_url && (
            <a
              href={event.ticket_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg transition-colors"
            >
              Get Tickets
            </a>
          )}
        </div>
      </div>
    )
  }

  // Session ended - watching elsewhere
  if (sessionEnded) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-dark-900 rounded-xl p-8 text-center">
          <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Session Ended</h2>
          <p className="text-gray-400 mb-6">
            This stream is now playing on another device. Only one active viewing session is allowed per purchase.
          </p>
          <button
            onClick={() => verifyAccess(email)}
            className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 mx-auto"
          >
            <RefreshCw className="w-5 h-5" />
            Watch Here Instead
          </button>
        </div>
      </div>
    )
  }

  // Need to verify access
  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-dark-900 rounded-xl p-8">
          <h2 className="text-2xl font-bold text-white mb-2 text-center">{event.title}</h2>
          <p className="text-gray-400 text-center mb-6">{event.organization}</p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Enter Your Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Use the email address from your purchase
              </p>
            </div>

            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}

            <button
              onClick={() => verifyAccess()}
              disabled={verifying || !email}
              className="w-full py-3 bg-red-500 hover:bg-red-600 disabled:bg-dark-700 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors"
            >
              {verifying ? 'Verifying...' : 'Watch Stream'}
            </button>

            <div className="text-center pt-4 border-t border-dark-800">
              <p className="text-gray-500 text-sm mb-2">Don't have access?</p>
              <Link 
                to={`/live/${eventId}`}
                className="text-red-500 hover:text-red-400 font-medium"
              >
                Purchase Access — ${event.price} AUD
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Has access - show player
  const eventDate = new Date(event.start_time)
  const isLive = event.is_live || event.status === 'live'
  const eventNotStarted = !isLive && new Date() < eventDate

  // Waiting Room - event hasn't started yet
  if (eventNotStarted) {
    return (
      <div className="min-h-screen bg-dark-950">
        {/* Waiting Room Header */}
        <div className="w-full bg-gradient-to-b from-dark-900 to-dark-950">
          <div className="max-w-4xl mx-auto px-4 py-16 text-center">
            {/* Thumbnail */}
            {event.thumbnail_url && (
              <div className="relative max-w-2xl mx-auto mb-8 rounded-xl overflow-hidden shadow-2xl">
                <img 
                  src={event.thumbnail_url} 
                  alt={event.title}
                  className="w-full aspect-video object-cover opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-transparent to-transparent" />
              </div>
            )}

            <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/20 text-yellow-500 rounded-full text-sm font-medium mb-6">
              <Clock className="w-4 h-4" />
              Waiting Room
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
              {event.title}
            </h1>
            <p className="text-xl text-gray-400 mb-8">{event.organization}</p>

            {/* Countdown */}
            <div className="bg-dark-800/50 rounded-2xl p-8 max-w-xl mx-auto mb-8 border border-dark-700">
              <CountdownTimer 
                targetDate={event.start_time}
                onComplete={() => window.location.reload()}
              />
            </div>

            {/* Event Info */}
            <div className="flex flex-wrap justify-center gap-6 text-gray-400 mb-8">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-red-500" />
                {eventDate.toLocaleDateString('en-AU', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long'
                })}
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-red-500" />
                {eventDate.toLocaleTimeString('en-AU', {
                  hour: '2-digit',
                  minute: '2-digit'
                })} AEST
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-red-500" />
                {event.venue}
              </div>
            </div>

            {/* Notification prompt */}
            <div className="bg-dark-800 rounded-xl p-6 max-w-md mx-auto border border-dark-700">
              <Bell className="w-8 h-8 text-red-500 mx-auto mb-3" />
              <p className="text-white font-medium mb-2">Don't miss the start!</p>
              <p className="text-gray-400 text-sm mb-4">
                Keep this tab open — it will automatically refresh when the event goes live.
              </p>
              <p className="text-gray-500 text-xs">
                Logged in as: {email}
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-950">
      {/* Player */}
      <div className="w-full bg-black">
        <div className="max-w-6xl mx-auto">
          <MuxPlayer
            playbackId={event.mux_playback_id || 'demo-playback-id'}
            metadata={{
              video_title: event.title,
              viewer_user_id: email
            }}
            streamType={isLive ? 'live' : 'on-demand'}
            autoPlay
            className="w-full aspect-video"
          />
        </div>
      </div>

      {/* Event Info */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                {event.title}
              </h1>
              {isLive && (
                <span className="px-3 py-1 bg-red-500 text-white text-sm font-bold rounded-full flex items-center gap-1">
                  <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                  LIVE
                </span>
              )}
            </div>
            <p className="text-gray-400">{event.organization}</p>
          </div>
          {/* Viewer Count - shows when live */}
          {isLive && <ViewerCount eventId={eventId} />}
        </div>

        <div className="flex flex-wrap gap-6 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {eventDate.toLocaleDateString('en-AU', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            {event.venue}
          </div>
        </div>

        {event.description && (
          <div className="mt-8 pt-8 border-t border-dark-800">
            <h3 className="text-lg font-semibold text-white mb-3">About This Event</h3>
            <p className="text-gray-400">{event.description}</p>
          </div>
        )}
      </div>
    </div>
  )
}
