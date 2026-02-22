import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { Calendar, MapPin, Clock, CreditCard, Check, Shield, AlertTriangle, Users, Navigation } from 'lucide-react'
import { getLivestreamEvent, getLivestreamSettings, createLivestreamOrder } from '../../lib/supabase'
import { trackPageView, trackGeoCheck, trackGeoBlocked, trackGeoPassed, trackPurchaseView, trackCheckoutStart } from '../../lib/analytics'
import CountdownTimer from '../../components/CountdownTimer'
import SocialShare from '../../components/SocialShare'
import MetaTags from '../../components/MetaTags'
import AddToCalendar from '../../components/AddToCalendar'

export default function EventPage() {
  const { eventId } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [event, setEvent] = useState(null)
  const [settings, setSettings] = useState({ demo_mode: false })
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState(false)
  const [error, setError] = useState(null)
  const [geoBlocked, setGeoBlocked] = useState(null)
  const [geoInfo, setGeoInfo] = useState(null)
  const [checkingGeo, setCheckingGeo] = useState(false)
  const [showLocationModal, setShowLocationModal] = useState(false)
  const [locationDenied, setLocationDenied] = useState(false)
  const [geoCheckComplete, setGeoCheckComplete] = useState(false)
  const [userLocation, setUserLocation] = useState(null) // Store for checkout
  const [agreedToTerms, setAgreedToTerms] = useState(false) // Terms checkbox
  const trackedRef = useRef({ pageView: false, geoCheck: false, purchaseView: false })

  useEffect(() => {
    loadData()
    // Track page view once
    if (!trackedRef.current.pageView) {
      trackPageView(eventId)
      trackedRef.current.pageView = true
    }
  }, [eventId])

  // Check permission status on load
  useEffect(() => {
    if (event && event.geo_blocking_enabled) {
      checkPermissionStatus()
    } else if (event && !event.geo_blocking_enabled) {
      setGeoCheckComplete(true)
      // No geo-blocking, track purchase view immediately
      if (!trackedRef.current.purchaseView) {
        trackPurchaseView(eventId)
        trackedRef.current.purchaseView = true
      }
    }
  }, [event])

  const checkPermissionStatus = async () => {
    try {
      const permission = await navigator.permissions.query({ name: 'geolocation' })
      if (permission.state === 'granted') {
        // Already granted, check location automatically
        performGeoCheck()
      } else if (permission.state === 'denied') {
        // Previously denied
        setLocationDenied(true)
        setGeoCheckComplete(true)
      } else {
        // Prompt state - show our modal first
        setShowLocationModal(true)
      }
    } catch (err) {
      // Permissions API not supported, show modal
      setShowLocationModal(true)
    }
  }

  const performGeoCheck = () => {
    setCheckingGeo(true)
    setShowLocationModal(false)
    
    // Track geo check attempt
    if (!trackedRef.current.geoCheck) {
      trackGeoCheck(eventId)
      trackedRef.current.geoCheck = true
    }
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        // Got location, now check against venue
        const userLat = position.coords.latitude
        const userLng = position.coords.longitude
        const accuracyMeters = position.coords.accuracy // GPS accuracy in meters
        
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
              user_lat: userLat,
              user_lng: userLng,
              event_id: eventId,
              bypass_token: bypassToken
            })
          })
          const data = await response.json()
          
          // If bypass was used, don't show as blocked
          if (data.bypass) {
            setGeoBlocked(false)
            setGeoInfo({ ...data, crew_bypass: true })
          } else {
            setGeoBlocked(data.blocked)
            setGeoInfo(data)
          }
          // Store user location for checkout analytics
          setUserLocation({
            lat: userLat,
            lng: userLng,
            distance_km: data.distance_km,
            accuracy_meters: accuracyMeters
          })
          // Track geo result with accuracy
          if (data.blocked) {
            trackGeoBlocked(eventId, data.distance_km, event.geo_lat, event.geo_lng, event.geo_radius_km, userLat, userLng, accuracyMeters)
          } else {
            trackGeoPassed(eventId, userLat, userLng, accuracyMeters)
            // Also track that they can now view purchase form
            if (!trackedRef.current.purchaseView) {
              trackPurchaseView(eventId)
              trackedRef.current.purchaseView = true
            }
          }
        } catch (err) {
          console.error('Geo check failed:', err)
          setGeoBlocked(false)
          // Still store location even if geo-check API failed
          setUserLocation({ lat: userLat, lng: userLng })
        } finally {
          setCheckingGeo(false)
          setGeoCheckComplete(true)
        }
      },
      (error) => {
        // User denied or error occurred
        console.error('Geolocation error:', error)
        if (error.code === error.PERMISSION_DENIED) {
          setLocationDenied(true)
        }
        setCheckingGeo(false)
        setGeoCheckComplete(true)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }

  const handleEnableLocation = () => {
    performGeoCheck()
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
    
    // Track checkout start
    trackCheckoutStart(eventId, email)

    try {
      if (settings.demo_mode) {
        // Demo mode - create order directly
        await createLivestreamOrder({
          event_id: eventId,
          email: email.toLowerCase(),
          amount: event.price,
          status: 'completed',
          payment_method: 'demo',
          completed_at: new Date().toISOString(),
          // Location analytics
          buyer_lat: userLocation?.lat,
          buyer_lng: userLocation?.lng,
          distance_from_venue_km: userLocation?.distance_km
        })
        
        // Redirect to watch page
        navigate(`/watch/${eventId}?email=${encodeURIComponent(email)}`)
      } else {
        // Live mode - redirect to Stripe via Supabase Edge Function
        const response = await fetch('https://gonalgubgldgpkcekaxe.supabase.co/functions/v1/livestream_checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            event_id: eventId, 
            email,
            // Pass location for analytics
            buyer_lat: userLocation?.lat,
            buyer_lng: userLocation?.lng,
            distance_from_venue_km: userLocation?.distance_km
          })
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

  // Location Permission Modal
  if (showLocationModal && event?.geo_blocking_enabled) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-dark-900 rounded-xl border border-dark-800 p-8 text-center">
          <Navigation className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-3">Location Verification Required</h2>
          <p className="text-gray-400 mb-4">
            To protect this event's ticket sales, we need to verify you're not at the venue location.
          </p>
          <p className="text-gray-500 text-sm mb-6">
            Online streaming is restricted within {event.geo_radius_km || 50}km of {event.venue}. 
            Your approximate location is saved with your purchase for event analytics.
          </p>
          
          {/* Terms Checkbox */}
          <label className="flex items-start gap-3 text-left mb-6 cursor-pointer">
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="mt-1 w-5 h-5 rounded border-dark-600 bg-dark-800 text-red-500 focus:ring-red-500 focus:ring-offset-dark-900"
            />
            <span className="text-gray-400 text-sm">
              I agree to the{' '}
              <a href="/privacy" target="_blank" className="text-red-500 hover:text-red-400 underline">
                Privacy Policy
              </a>{' '}
              and{' '}
              <a href="/terms" target="_blank" className="text-red-500 hover:text-red-400 underline">
                Terms of Service
              </a>
            </span>
          </label>

          <button
            onClick={handleEnableLocation}
            disabled={!agreedToTerms}
            className="w-full py-4 bg-red-500 hover:bg-red-600 disabled:bg-dark-700 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 mb-3"
          >
            <MapPin className="w-5 h-5" />
            Enable Location Access
          </button>
          <p className="text-gray-600 text-xs">
            Click "Allow" when your browser asks for permission
          </p>
        </div>
      </div>
    )
  }

  // Location Denied - show instructions
  if (locationDenied && event?.geo_blocking_enabled) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-dark-900 rounded-xl border border-dark-800 p-8 text-center">
          <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-3">Location Access Blocked</h2>
          <p className="text-gray-400 mb-4">
            Location access is required to verify you're not at the venue. Without it, we can't process your purchase.
          </p>
          <div className="bg-dark-800 rounded-lg p-4 mb-6 text-left">
            <p className="text-white font-semibold mb-2">To enable location:</p>
            <ol className="text-gray-400 text-sm space-y-2">
              <li>1. Click the 🔒 icon in your address bar</li>
              <li>2. Find "Location" and change it to "Allow"</li>
              <li>3. Click the button below to try again</li>
            </ol>
          </div>
          <button
            onClick={() => {
              setLocationDenied(false)
              setShowLocationModal(true)
            }}
            className="w-full py-4 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg transition-colors"
          >
            Try Again
          </button>
          <p className="text-gray-600 text-xs mt-4">
            We check if you're within {event.geo_radius_km || 50}km of the venue. Your approximate location is saved for analytics.
          </p>
        </div>
      </div>
    )
  }

  // Checking geo-location
  if (checkingGeo) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Verifying your location...</p>
          <p className="text-gray-600 text-sm mt-2">This only takes a moment</p>
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

  // Parse datetime as local time (strip any timezone suffix)
  // Admin enters Brisbane local time, we display Brisbane local time
  const parseAsLocalTime = (dateStr) => {
    if (!dateStr) return new Date()
    // Strip timezone suffix and parse as local time
    const stripped = dateStr.replace(/[Z+].*$/, '').replace(/\.000$/, '')
    return new Date(stripped)
  }
  
  const eventDate = parseAsLocalTime(event.start_time)
  const isLive = event.is_live || event.status === 'live'
  const isPast = event.status === 'ended' || parseAsLocalTime(event.end_time) < new Date()

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
