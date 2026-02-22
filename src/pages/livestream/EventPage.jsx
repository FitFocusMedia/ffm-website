import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Calendar, MapPin, Clock, CreditCard, Check, Shield, AlertTriangle, Users } from 'lucide-react'
import { getLivestreamEvent, getLivestreamSettings, createLivestreamOrder } from '../../lib/supabase'
import CountdownTimer from '../../components/CountdownTimer'
import SocialShare from '../../components/SocialShare'
import MetaTags from '../../components/MetaTags'
import AddToCalendar from '../../components/AddToCalendar'

export default function EventPage() {
  const { eventId } = useParams()
  const navigate = useNavigate()
  const [event, setEvent] = useState(null)
  const [settings, setSettings] = useState({ demo_mode: false })
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState(false)
  const [error, setError] = useState(null)
  const [geoBlocked, setGeoBlocked] = useState(null)
  const [geoInfo, setGeoInfo] = useState(null)
  const [checkingGeo, setCheckingGeo] = useState(false)

  useEffect(() => {
    loadData()
  }, [eventId])

  // Check geo-blocking after event loads
  useEffect(() => {
    if (event && event.geo_blocking_enabled) {
      checkGeoBlocking()
    }
  }, [event])

  const checkGeoBlocking = async () => {
    setCheckingGeo(true)
    try {
      const response = await fetch('https://gonalgubgldgpkcekaxe.supabase.co/functions/v1/geo-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          venue_lat: event.geo_lat,
          venue_lng: event.geo_lng,
          radius_km: event.geo_radius_km || 50
        })
      })
      const data = await response.json()
      setGeoBlocked(data.blocked)
      setGeoInfo(data)
    } catch (err) {
      console.error('Geo check failed:', err)
      setGeoBlocked(false)
    } finally {
      setCheckingGeo(false)
    }
  }

  const loadData = async () => {
    try {
      const [eventData, settingsData] = await Promise.all([
        getLivestreamEvent(eventId),
        getLivestreamSettings()
      ])
      setEvent(eventData)
      setSettings(settingsData || { demo_mode: false })
    } catch (err) {
      setError('Event not found')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handlePurchase = async (e) => {
    e.preventDefault()
    if (!email) {
      setError('Please enter your email')
      return
    }

    setPurchasing(true)
    setError(null)

    try {
      if (settings.demo_mode) {
        // Demo mode - create order directly
        await createLivestreamOrder({
          event_id: eventId,
          email: email.toLowerCase(),
          amount: event.price,
          status: 'completed',
          payment_method: 'demo',
          completed_at: new Date().toISOString()
        })
        
        // Redirect to watch page
        navigate(`/watch/${eventId}?email=${encodeURIComponent(email)}`)
      } else {
        // Live mode - redirect to Stripe via Supabase Edge Function
        const response = await fetch('https://gonalgubgldgpkcekaxe.supabase.co/functions/v1/livestream-checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ event_id: eventId, email })
        })
        
        const data = await response.json()
        if (data.demo && data.redirect) {
          // Demo mode - direct redirect
          window.location.href = data.redirect
        } else if (data.url) {
          // Stripe checkout URL
          window.location.href = data.url
        } else {
          throw new Error(data.error || 'Checkout failed')
        }
      }
    } catch (err) {
      setError(err.message || 'Purchase failed. Please try again.')
    } finally {
      setPurchasing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    )
  }

  if (error && !event) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  // Checking geo-location
  if (checkingGeo) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Checking your location...</p>
        </div>
      </div>
    )
  }

  // Geo-blocked - show tickets instead
  if (geoBlocked) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-dark-900 rounded-xl p-8 text-center">
          <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">You're Close to the Venue!</h2>
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
            Great news — you can watch this event live in person!
          </p>
          <p className="text-white font-semibold mb-6">{event.venue}</p>
          {event.ticket_url ? (
            <a
              href={event.ticket_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg transition-colors"
            >
              Get Tickets
            </a>
          ) : (
            <p className="text-gray-500">Contact the venue for ticket information.</p>
          )}
        </div>
      </div>
    )
  }

  const eventDate = new Date(event.start_time)
  const isLive = event.is_live || event.status === 'live'
  const isPast = event.status === 'ended' || new Date(event.end_time) < new Date()

  return (
    <>
      <MetaTags 
        title={`${event.title} - ${event.organization}`}
        description={`Watch ${event.title} live! ${eventDate.toLocaleDateString('en-AU')} at ${event.venue}. Stream access $${event.price} AUD.`}
        image={event.thumbnail_url}
        type="video.other"
      />
    <div className="py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Event Details */}
          <div className="lg:col-span-3">
            {/* Thumbnail */}
            <div className="relative aspect-video bg-dark-800 rounded-xl overflow-hidden mb-6">
              {event.thumbnail_url ? (
                <img 
                  src={event.thumbnail_url} 
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-dark-800 to-dark-900">
                  <span className="text-6xl">🎬</span>
                </div>
              )}
              
              {isLive && (
                <div className="absolute top-4 left-4 px-4 py-2 bg-red-500 text-white font-bold rounded-full flex items-center gap-2">
                  <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                  LIVE NOW
                </div>
              )}
            </div>

            {/* Title & Org */}
            <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                  {event.title}
                </h1>
                <p className="text-xl text-gray-400">{event.organization}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <AddToCalendar event={event} />
                <SocialShare 
                  title={`Watch ${event.title} Live!`}
                  description={`${event.organization} - ${eventDate.toLocaleDateString('en-AU')}`}
                />
              </div>
            </div>

            {/* Countdown Timer - show if event hasn't started */}
            {!isLive && !isPast && (
              <div className="mb-8 p-6 bg-dark-800/50 rounded-xl border border-dark-700">
                <CountdownTimer 
                  targetDate={event.start_time}
                  onComplete={() => window.location.reload()}
                />
              </div>
            )}

            {/* Event Info */}
            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              <div className="flex items-center gap-3 text-gray-300">
                <Calendar className="w-5 h-5 text-red-500" />
                {eventDate.toLocaleDateString('en-AU', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <Clock className="w-5 h-5 text-red-500" />
                {eventDate.toLocaleTimeString('en-AU', {
                  hour: '2-digit',
                  minute: '2-digit'
                })} AEST
              </div>
              <div className="flex items-center gap-3 text-gray-300 sm:col-span-2">
                <MapPin className="w-5 h-5 text-red-500" />
                {event.venue}
              </div>
            </div>

            {/* Description */}
            {event.description && (
              <div className="prose prose-invert max-w-none">
                <h3 className="text-xl font-semibold text-white mb-3">About This Event</h3>
                <p className="text-gray-400">{event.description}</p>
              </div>
            )}
          </div>

          {/* Purchase Card */}
          <div className="lg:col-span-2">
            <div className="sticky top-24 bg-dark-900 rounded-xl border border-dark-800 p-6">
              <div className="text-center mb-6">
                <p className="text-gray-400 mb-1">Stream Access</p>
                <p className="text-4xl font-bold text-white">${event.price} <span className="text-lg text-gray-400">AUD</span></p>
              </div>

              <form onSubmit={handlePurchase} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Your access link will be sent here
                  </p>
                </div>

                {error && (
                  <p className="text-red-500 text-sm">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={purchasing || !email}
                  className="w-full py-4 bg-red-500 hover:bg-red-600 disabled:bg-dark-700 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {purchasing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      {isPast ? 'Buy Replay Access' : isLive ? 'Watch Now' : 'Buy Access'}
                    </>
                  )}
                </button>
              </form>

              {/* Benefits */}
              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-3 text-sm text-gray-400">
                  <Check className="w-4 h-4 text-green-500" />
                  Instant access after payment
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-400">
                  <Check className="w-4 h-4 text-green-500" />
                  Watch live + replay for 7 days
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-400">
                  <Check className="w-4 h-4 text-green-500" />
                  HD quality streaming
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-400">
                  <Shield className="w-4 h-4 text-green-500" />
                  Secure payment via Stripe
                </div>
              </div>

              {settings.demo_mode && (
                <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <p className="text-yellow-500 text-xs text-center">
                    🧪 Demo Mode — No payment required
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}
