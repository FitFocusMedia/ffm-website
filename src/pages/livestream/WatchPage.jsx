import { useState, useEffect, useRef } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import { Calendar, MapPin, AlertCircle, RefreshCw, Clock, Bell, Play, Sparkles, Lock, Mail, Users, Tv } from 'lucide-react'
import { 
  supabase,
  getLivestreamEvent, 
  getLivestreamOrderByEmail,
  createLivestreamSession,
  updateSessionHeartbeat,
  getEventStreams
} from '../../lib/supabase'
import { getDirectImageUrl } from '../../lib/imageUtils'
import { trackPurchaseComplete } from '../../lib/analytics'
import PremiumCountdown from '../../components/PremiumCountdown'
import PremiumPlayer from '../../components/PremiumPlayer'
import LiveIndicator, { SocialProofBanner } from '../../components/LiveIndicator'
import ViewerCount from '../../components/ViewerCount'
import StreamSelector, { StreamSelectorCompact } from '../../components/StreamSelector'

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
  const [checkingAccess, setCheckingAccess] = useState(true)
  const [startingSoon, setStartingSoon] = useState(false)
  const [viewerCount, setViewerCount] = useState(0)
  const heartbeatRef = useRef(null)
  const startingSoonRef = useRef(null)
  
  // Multi-stream support
  const [streams, setStreams] = useState([])
  const [selectedStream, setSelectedStream] = useState(null)

  useEffect(() => {
    loadEvent()
    return () => {
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current)
      }
    }
  }, [eventId])

  // Check geo-blocking and bypass token after event loads
  useEffect(() => {
    if (event) {
      const bypassToken = searchParams.get('bypass')
      if (bypassToken || event.geo_blocking_enabled) {
        checkGeoBlocking()
      } else {
        setCheckingAccess(false)
      }
    }
  }, [event])

  const checkGeoBlocking = async () => {
    try {
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
      
      if (data.bypass) {
        setGeoBlocked(false)
        setGeoInfo({ ...data, crew_bypass: true })
        setHasAccess(true)
        setEmail('crew@bypass')
      } else {
        setGeoBlocked(data.blocked)
        setGeoInfo(data)
      }
    } catch (err) {
      console.error('Geo check failed:', err)
      setGeoBlocked(false)
    } finally {
      setCheckingAccess(false)
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

  // Poll for live status when event time has passed but not marked live
  useEffect(() => {
    if (!event) return
    
    const parseTime = (dateStr) => {
      if (!dateStr) return new Date()
      const stripped = dateStr.replace(/[Z+].*$/, '').replace(/\.000$/, '')
      return new Date(stripped)
    }
    
    const eventDate = parseTime(event.start_time)
    const isLive = event.is_live || event.status === 'live'
    const eventTimeHasPassed = new Date() >= eventDate
    const previewMode = searchParams.get('preview') === 'player'
    
    if (eventTimeHasPassed && !isLive && !previewMode) {
      setStartingSoon(true)
      
      startingSoonRef.current = setInterval(async () => {
        try {
          const freshEvent = await getLivestreamEvent(eventId)
          if (freshEvent?.is_live || freshEvent?.status === 'live') {
            clearInterval(startingSoonRef.current)
            setEvent(freshEvent)
            setStartingSoon(false)
          }
        } catch (err) {
          console.error('Failed to check event status:', err)
        }
      }, 15000)
      
      return () => {
        if (startingSoonRef.current) {
          clearInterval(startingSoonRef.current)
        }
      }
    } else {
      setStartingSoon(false)
    }
  }, [event, eventId, searchParams])

  const loadEvent = async () => {
    try {
      const data = await getLivestreamEvent(eventId)
      setEvent(data)
      
      // Load streams if multi-stream event
      if (data?.is_multi_stream) {
        try {
          const eventStreams = await getEventStreams(eventId)
          setStreams(eventStreams || [])
          // Select default stream or first stream
          const defaultStream = eventStreams?.find(s => s.is_default) || eventStreams?.[0]
          if (defaultStream) {
            setSelectedStream(defaultStream)
          }
        } catch (streamErr) {
          console.error('Failed to load streams:', streamErr)
        }
      }
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
      const stripeSessionId = searchParams.get('session_id')
      
      // Try to find order directly first (works for demo mode + completed Stripe orders)
      let order = await getLivestreamOrderByEmail(eventId, emailToVerify)
      
      // If no order found and we have a Stripe session, try to verify via edge function
      if (!order && stripeSessionId) {
        try {
          const { data: verifyData } = await supabase.functions.invoke('verify-payment', {
            body: { 
              session_id: stripeSessionId, 
              event_id: eventId, 
              email: emailToVerify 
            }
          })
          
          if (verifyData?.verified) {
            // Refetch order after verification
            order = await getLivestreamOrderByEmail(eventId, emailToVerify)
          }
        } catch (verifyErr) {
          console.warn('Payment verification edge function failed:', verifyErr)
          // Continue - we'll check order below
        }
      }
      
      if (!order) {
        setError('No purchase found for this email. Please check your email or purchase access.')
        setHasAccess(false)
        return
      }

      const session = await createLivestreamSession({
        event_id: eventId,
        order_id: order.id,
        email: emailToVerify.toLowerCase()
      })

      setSessionToken(session.token)
      setHasAccess(true)
      setEmail(emailToVerify)
      
      if (stripeSessionId) {
        trackPurchaseComplete(eventId, emailToVerify)
      }
      
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

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-dark-700 border-t-red-500 mx-auto"></div>
            <Play className="absolute inset-0 m-auto w-6 h-6 text-red-500" />
          </div>
          <p className="text-gray-400 mt-4">Loading stream...</p>
        </div>
      </div>
    )
  }

  if (error && !event) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Event Not Found</h2>
          <p className="text-gray-400">{error}</p>
        </div>
      </div>
    )
  }

  // Geo-blocked
  if (geoBlocked) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full relative">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 blur-2xl rounded-3xl"></div>
          
          <div className="relative bg-dark-900/95 backdrop-blur-xl rounded-2xl border border-dark-700/50 p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-yellow-500/20 to-orange-500/20 flex items-center justify-center">
              <MapPin className="w-10 h-10 text-yellow-500" />
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-2">Location Restricted</h2>
            <p className="text-gray-400 mb-4">
              Online streaming is not available within {event.geo_radius_km || 50}km of the venue.
            </p>
            {geoInfo?.user_location && (
              <p className="text-gray-500 text-sm mb-4">
                Distance from venue: <span className="text-white font-semibold">{geoInfo.distance_km}km</span>
              </p>
            )}
            
            <div className="bg-dark-800/50 rounded-xl p-4 mb-6 border border-dark-700/50">
              <p className="text-gray-400 text-sm mb-2">Watch live in person at:</p>
              <p className="text-white font-semibold">{event.venue}</p>
            </div>
            
            {event.ticket_url && (
              <a
                href={event.ticket_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold rounded-xl transition-all duration-300 shadow-lg shadow-red-500/25"
              >
                <Play className="w-5 h-5" />
                Get Tickets
              </a>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Session ended - watching elsewhere
  if (sessionEnded) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full relative">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 blur-2xl rounded-3xl"></div>
          
          <div className="relative bg-dark-900/95 backdrop-blur-xl rounded-2xl border border-dark-700/50 p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-yellow-500/20 to-orange-500/20 flex items-center justify-center">
              <AlertCircle className="w-10 h-10 text-yellow-500" />
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-2">Session Ended</h2>
            <p className="text-gray-400 mb-6">
              This stream is now playing on another device. Only one active viewing session is allowed per purchase.
            </p>
            
            <button
              onClick={() => verifyAccess(email)}
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold rounded-xl transition-all duration-300 shadow-lg shadow-red-500/25"
            >
              <RefreshCw className="w-5 h-5" />
              Watch Here Instead
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Still checking for bypass token
  if (checkingAccess) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-dark-700 border-t-red-500 mx-auto"></div>
            <Lock className="absolute inset-0 m-auto w-6 h-6 text-red-500" />
          </div>
          <p className="text-gray-400 mt-4">Checking access...</p>
        </div>
      </div>
    )
  }

  // Need to verify access - Premium Login Form
  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full relative">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-orange-500/10 blur-2xl rounded-3xl"></div>
          
          <div className="relative bg-dark-900/95 backdrop-blur-xl rounded-2xl border border-dark-700/50 overflow-hidden">
            {/* Header with thumbnail */}
            {event.thumbnail_url && (
              <div className="relative h-32 overflow-hidden">
                <img 
                  src={getDirectImageUrl(event.thumbnail_url)} 
                  alt={event.title}
                  className="w-full h-full object-cover opacity-50"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark-900 to-transparent"></div>
              </div>
            )}
            
            <div className="p-8">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white mb-1">{event.title}</h2>
                <p className="text-gray-400">{event.organization}</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Enter Your Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full pl-12 pr-4 py-4 bg-dark-800/50 border border-dark-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all duration-300"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    Use the email from your purchase
                  </p>
                </div>

                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}

                <button
                  onClick={() => verifyAccess()}
                  disabled={verifying || !email}
                  className="w-full py-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:from-dark-700 disabled:to-dark-700 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-red-500/25 disabled:shadow-none"
                >
                  {verifying ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      Verifying...
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5" />
                      Watch Stream
                    </>
                  )}
                </button>

                <div className="text-center pt-4 border-t border-dark-800">
                  <p className="text-gray-500 text-sm mb-2">Don't have access?</p>
                  <Link 
                    to={`/live/${eventId}`}
                    className="text-red-500 hover:text-red-400 font-semibold transition-colors"
                  >
                    Purchase Access — ${event.price} AUD
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Parse datetime as local time
  const parseAsLocalTime = (dateStr) => {
    if (!dateStr) return new Date()
    const stripped = dateStr.replace(/[Z+].*$/, '').replace(/\.000$/, '')
    return new Date(stripped)
  }

  const eventDate = parseAsLocalTime(event.start_time)
  const isLive = event.is_live || event.status === 'live'
  const previewMode = searchParams.get('preview') === 'player'
  const eventTimeHasPassed = new Date() >= eventDate
  const eventNotStarted = !isLive && !eventTimeHasPassed && !previewMode

  // Premium Waiting Room
  if (eventNotStarted) {
    return (
      <div className="min-h-screen bg-dark-950">
        <div className="w-full bg-gradient-to-b from-dark-900 to-dark-950">
          <div className="max-w-4xl mx-auto px-4 py-16 text-center">
            {/* Thumbnail with overlay */}
            {event.thumbnail_url && (
              <div className="relative max-w-2xl mx-auto mb-8 rounded-2xl overflow-hidden shadow-2xl shadow-red-500/10 group">
                <img 
                  src={getDirectImageUrl(event.thumbnail_url)} 
                  alt={event.title}
                  className="w-full aspect-video object-cover opacity-80 transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/50 to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
                    <Clock className="w-10 h-10 text-white" />
                  </div>
                </div>
              </div>
            )}

            <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/20 text-yellow-500 rounded-full text-sm font-medium mb-6 border border-yellow-500/30">
              <Sparkles className="w-4 h-4" />
              Waiting Room
            </div>

            <h1 className="text-3xl md:text-5xl font-bold text-white mb-3">
              {event.title}
            </h1>
            <p className="text-xl text-gray-400 mb-8">{event.organization}</p>

            {/* Premium Countdown */}
            <div className="bg-dark-800/30 backdrop-blur-sm rounded-2xl p-8 max-w-xl mx-auto mb-8 border border-dark-700/50">
              <PremiumCountdown 
                targetDate={event.start_time}
                onComplete={() => loadEvent()}
              />
            </div>

            {/* Event Info */}
            <div className="flex flex-wrap justify-center gap-6 text-gray-400 mb-8">
              <div className="flex items-center gap-2 bg-dark-800/30 px-4 py-2 rounded-xl border border-dark-700/30">
                <Calendar className="w-5 h-5 text-red-500" />
                {eventDate.toLocaleDateString('en-AU', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long'
                })}
              </div>
              <div className="flex items-center gap-2 bg-dark-800/30 px-4 py-2 rounded-xl border border-dark-700/30">
                <Clock className="w-5 h-5 text-red-500" />
                {eventDate.toLocaleTimeString('en-AU', {
                  hour: '2-digit',
                  minute: '2-digit'
                })} AEST
              </div>
              <div className="flex items-center gap-2 bg-dark-800/30 px-4 py-2 rounded-xl border border-dark-700/30">
                <MapPin className="w-5 h-5 text-red-500" />
                {event.venue}
              </div>
            </div>

            {/* Notification prompt */}
            <div className="bg-dark-800/30 backdrop-blur-sm rounded-2xl p-6 max-w-md mx-auto border border-dark-700/50">
              <Bell className="w-10 h-10 text-red-500 mx-auto mb-3" />
              <p className="text-white font-semibold mb-2">Don't miss the start!</p>
              <p className="text-gray-400 text-sm mb-4">
                Keep this tab open — it will automatically refresh when the event goes live.
              </p>
              <p className="text-gray-600 text-xs flex items-center justify-center gap-1">
                <Users className="w-3 h-3" />
                Logged in as: {email}
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Starting Soon - Premium
  const eventStartingSoon = eventTimeHasPassed && !isLive && !previewMode
  
  if (eventStartingSoon) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full relative">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 blur-2xl rounded-3xl animate-pulse"></div>
          
          <div className="relative bg-dark-900/95 backdrop-blur-xl rounded-2xl border border-dark-700/50 p-8 text-center">
            {event.thumbnail_url && (
              <div className="relative max-w-sm mx-auto mb-6 rounded-xl overflow-hidden">
                <img 
                  src={getDirectImageUrl(event.thumbnail_url)} 
                  alt={event.title}
                  className="w-full aspect-video object-cover opacity-60"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-dark-700 border-t-red-500"></div>
                </div>
              </div>
            )}
            
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/20 text-yellow-500 rounded-full text-sm font-medium mb-4 border border-yellow-500/30 animate-pulse">
              <Sparkles className="w-4 h-4" />
              Starting Soon
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-2">{event.title}</h2>
            <p className="text-gray-400 mb-6">
              The event is about to begin. The stream will start momentarily.
            </p>
            <p className="text-gray-500 text-sm">
              This page will automatically refresh when the stream goes live.
            </p>
            <p className="text-gray-600 text-xs mt-4 flex items-center justify-center gap-1">
              <Users className="w-3 h-3" />
              Logged in as: {email}
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Determine which playback ID to use (selected stream or event default)
  const activePlaybackId = selectedStream?.mux_playback_id || event.mux_playback_id || 'demo-playback-id'
  const isMultiStream = streams.length > 1
  
  // Has access - Show Premium Player
  return (
    <div className="min-h-screen bg-dark-950">
      {/* Preview Mode Banner */}
      {previewMode && (
        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black px-4 py-2 text-center text-sm font-medium">
          🎨 Preview Mode — This is how the player page will look. No stream is playing.
        </div>
      )}
      
      {/* Multi-Stream Selector Banner */}
      {isMultiStream && (
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 text-center text-sm font-medium flex items-center justify-center gap-2">
          <Tv className="w-4 h-4" />
          Multiple Streams Available — Currently watching: <strong>{selectedStream?.name || 'Stream 1'}</strong>
        </div>
      )}
      
      {/* Premium Player */}
      <div className="w-full bg-black">
        <div className="max-w-6xl mx-auto">
          {/* Stream Selector (above player on mobile, overlay on desktop) */}
          {isMultiStream && (
            <div className="md:hidden">
              <StreamSelector 
                streams={streams}
                selectedStream={selectedStream}
                onSelect={setSelectedStream}
                isLive={isLive}
              />
            </div>
          )}
          
          <div className="relative">
            <PremiumPlayer
              playbackId={activePlaybackId}
              title={selectedStream ? `${event.title} - ${selectedStream.name}` : event.title}
              poster={getDirectImageUrl(event.thumbnail_url || event.player_poster_url)}
              isLive={isLive || selectedStream?.status === 'live'}
              viewerEmail={email}
              onShare={() => {
                if (navigator.share) {
                  navigator.share({
                    title: event.title,
                    text: `Watch ${event.title} live!`,
                    url: window.location.href
                  })
                }
              }}
            />
            
            {/* Desktop stream selector overlay */}
            {isMultiStream && (
              <div className="hidden md:block absolute bottom-4 left-4 z-10">
                <StreamSelectorCompact
                  streams={streams}
                  selectedStream={selectedStream}
                  onSelect={setSelectedStream}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Event Info - Premium Layout */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Title and Live Indicator */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                {event.title}
              </h1>
              <LiveIndicator isLive={isLive} viewerCount={viewerCount} />
              {geoInfo?.crew_bypass && (
                <span className="px-3 py-1 bg-green-500/20 text-green-400 text-sm font-medium rounded-full border border-green-500/30">
                  Crew Access
                </span>
              )}
            </div>
            <p className="text-gray-400">{event.organization}</p>
          </div>
          
          {/* Viewer Count - shows when live */}
          {isLive && <ViewerCount eventId={eventId} />}
        </div>

        {/* Event Details */}
        <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-8">
          <div className="flex items-center gap-2 bg-dark-800/30 px-4 py-2 rounded-xl border border-dark-700/30">
            <Calendar className="w-4 h-4 text-red-500" />
            {eventDate.toLocaleDateString('en-AU', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}
          </div>
          <div className="flex items-center gap-2 bg-dark-800/30 px-4 py-2 rounded-xl border border-dark-700/30">
            <MapPin className="w-4 h-4 text-red-500" />
            {event.venue}
          </div>
        </div>

        {/* Description */}
        {event.description && (
          <div className="bg-dark-800/20 rounded-2xl p-6 border border-dark-700/30">
            <h3 className="text-lg font-semibold text-white mb-3">About This Event</h3>
            <p className="text-gray-400 leading-relaxed">{event.description}</p>
          </div>
        )}
      </div>
    </div>
  )
}
