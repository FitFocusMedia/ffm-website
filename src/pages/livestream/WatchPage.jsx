import { useState, useEffect, useRef } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import { Calendar, MapPin, AlertCircle, RefreshCw } from 'lucide-react'
import MuxPlayer from '@mux/mux-player-react'
import { 
  getLivestreamEvent, 
  getLivestreamOrderByEmail,
  createLivestreamSession,
  updateSessionHeartbeat 
} from '../../lib/supabase'

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
  const heartbeatRef = useRef(null)

  useEffect(() => {
    loadEvent()
    return () => {
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current)
      }
    }
  }, [eventId])

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
      // Check for valid order
      const order = await getLivestreamOrderByEmail(eventId, emailToVerify)
      
      if (!order) {
        setError('No purchase found for this email. Please check your email or purchase access.')
        setHasAccess(false)
        return
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
