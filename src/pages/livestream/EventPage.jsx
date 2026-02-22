import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { Calendar, MapPin, Clock, AlertTriangle, Navigation, Play, Users, Star, Sparkles } from 'lucide-react'
import { getLivestreamEvent, getLivestreamSettings, createLivestreamOrder } from '../../lib/supabase'
import { trackPageView, trackGeoCheck, trackGeoBlocked, trackGeoPassed, trackPurchaseView, trackCheckoutStart } from '../../lib/analytics'
import PremiumCountdown from '../../components/PremiumCountdown'
import PremiumPurchaseCard from '../../components/PremiumPurchaseCard'
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
  const [userLocation, setUserLocation] = useState(null)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const trackedRef = useRef({ pageView: false, geoCheck: false, purchaseView: false })

  useEffect(() => {
    loadData()
    if (!trackedRef.current.pageView) {
      trackPageView(eventId)
      trackedRef.current.pageView = true
    }
  }, [eventId])

  useEffect(() => {
    if (event && event.geo_blocking_enabled) {
      checkPermissionStatus()
    } else if (event && !event.geo_blocking_enabled) {
      setGeoCheckComplete(true)
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
        performGeoCheck()
      } else if (permission.state === 'denied') {
        setLocationDenied(true)
        setGeoCheckComplete(true)
      } else {
        setShowLocationModal(true)
      }
    } catch (err) {
      setShowLocationModal(true)
    }
  }

  const performGeoCheck = () => {
    setCheckingGeo(true)
    setShowLocationModal(false)
    
    if (!trackedRef.current.geoCheck) {
      trackGeoCheck(eventId)
      trackedRef.current.geoCheck = true
    }
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const userLat = position.coords.latitude
        const userLng = position.coords.longitude
        const accuracyMeters = position.coords.accuracy
        
        try {
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
          
          if (data.bypass) {
            setGeoBlocked(false)
            setGeoInfo({ ...data, crew_bypass: true })
          } else {
            setGeoBlocked(data.blocked)
            setGeoInfo(data)
          }
          setUserLocation({
            lat: userLat,
            lng: userLng,
            distance_km: data.distance_km,
            accuracy_meters: accuracyMeters
          })
          if (data.blocked) {
            trackGeoBlocked(eventId, data.distance_km, event.geo_lat, event.geo_lng, event.geo_radius_km, userLat, userLng, accuracyMeters)
          } else {
            trackGeoPassed(eventId, userLat, userLng, accuracyMeters)
            if (!trackedRef.current.purchaseView) {
              trackPurchaseView(eventId)
              trackedRef.current.purchaseView = true
            }
          }
        } catch (err) {
          console.error('Geo check failed:', err)
          setGeoBlocked(false)
          setUserLocation({ lat: userLat, lng: userLng })
        } finally {
          setCheckingGeo(false)
          setGeoCheckComplete(true)
        }
      },
      (error) => {
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
    if (e) e.preventDefault()
    if (!email) {
      setError('Please enter your email')
      return
    }

    setPurchasing(true)
    setError(null)
    trackCheckoutStart(eventId, email)

    try {
      if (settings.demo_mode) {
        await createLivestreamOrder({
          event_id: eventId,
          email: email.toLowerCase(),
          amount: event.price,
          currency: 'AUD',
          status: 'completed',
          payment_method: 'demo',
          completed_at: new Date().toISOString(),
          buyer_lat: userLocation?.lat,
          buyer_lng: userLocation?.lng,
          distance_from_venue_km: userLocation?.distance_km
        })
        navigate(`/watch/${eventId}?email=${encodeURIComponent(email)}`)
      } else {
        const response = await fetch('https://gonalgubgldgpkcekaxe.supabase.co/functions/v1/livestream_checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            event_id: eventId, 
            email,
            buyer_lat: userLocation?.lat,
            buyer_lng: userLocation?.lng,
            distance_from_venue_km: userLocation?.distance_km
          })
        })
        
        const data = await response.json()
        if (data.demo && data.redirect) {
          window.location.href = data.redirect
        } else if (data.url) {
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

  // Loading State
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-dark-700 border-t-red-500 mx-auto"></div>
            <Sparkles className="absolute inset-0 m-auto w-6 h-6 text-red-500 animate-pulse" />
          </div>
          <p className="text-gray-400 mt-4">Loading event...</p>
        </div>
      </div>
    )
  }

  if (error && !event) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Event Not Found</h2>
          <p className="text-gray-400">{error}</p>
        </div>
      </div>
    )
  }

  // Location Permission Modal (Premium)
  if (showLocationModal && event?.geo_blocking_enabled) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full relative">
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-orange-500/20 blur-2xl rounded-3xl"></div>
          
          <div className="relative bg-dark-900/95 backdrop-blur-xl rounded-2xl border border-dark-700/50 p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-red-500/20 to-orange-500/20 flex items-center justify-center">
              <Navigation className="w-10 h-10 text-red-500" />
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-3">Location Verification</h2>
            <p className="text-gray-400 mb-4">
              To protect ticket sales at the venue, we verify your location before streaming.
            </p>
            <p className="text-gray-500 text-sm mb-6">
              Online streaming is restricted within {event.geo_radius_km || 50}km of {event.venue}.
            </p>
            
            <label className="flex items-start gap-3 text-left mb-6 cursor-pointer group">
              <div className="relative mt-1">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="w-5 h-5 rounded border-dark-600 bg-dark-800 text-red-500 focus:ring-red-500 focus:ring-offset-dark-900 cursor-pointer"
                />
              </div>
              <span className="text-gray-400 text-sm group-hover:text-gray-300 transition-colors">
                I agree to the{' '}
                <a href="/#/privacy" target="_blank" className="text-red-500 hover:text-red-400 underline">
                  Privacy Policy
                </a>{' '}
                and{' '}
                <a href="/#/terms" target="_blank" className="text-red-500 hover:text-red-400 underline">
                  Terms of Service
                </a>
              </span>
            </label>

            <button
              onClick={handleEnableLocation}
              disabled={!agreedToTerms}
              className="w-full py-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:from-dark-700 disabled:to-dark-700 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-red-500/25 disabled:shadow-none"
            >
              <MapPin className="w-5 h-5" />
              Enable Location Access
            </button>
            <p className="text-gray-600 text-xs mt-4">
              Click "Allow" when your browser asks for permission
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Location Denied
  if (locationDenied && event?.geo_blocking_enabled) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-dark-900/95 backdrop-blur-xl rounded-2xl border border-dark-700/50 p-8 text-center">
          <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-3">Location Access Blocked</h2>
          <p className="text-gray-400 mb-4">
            Location access is required to verify you're not at the venue.
          </p>
          <div className="bg-dark-800/50 rounded-xl p-4 mb-6 text-left border border-dark-700/50">
            <p className="text-white font-semibold mb-2">To enable location:</p>
            <ol className="text-gray-400 text-sm space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-red-500 font-bold">1.</span>
                Click the 🔒 icon in your address bar
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 font-bold">2.</span>
                Find "Location" and change it to "Allow"
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 font-bold">3.</span>
                Click the button below to try again
              </li>
            </ol>
          </div>
          <button
            onClick={() => {
              setLocationDenied(false)
              setShowLocationModal(true)
            }}
            className="w-full py-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold rounded-xl transition-all duration-300 shadow-lg shadow-red-500/25"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  // Checking geo-location
  if (checkingGeo) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-dark-700 border-t-red-500 mx-auto"></div>
            <MapPin className="absolute inset-0 m-auto w-6 h-6 text-red-500" />
          </div>
          <p className="text-gray-400 mt-4">Verifying your location...</p>
          <p className="text-gray-600 text-sm mt-2">This only takes a moment</p>
        </div>
      </div>
    )
  }

  // Geo-blocked
  if (geoBlocked) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full relative">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 blur-2xl rounded-3xl"></div>
          
          <div className="relative bg-dark-900/95 backdrop-blur-xl rounded-2xl border border-dark-700/50 p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-yellow-500/20 to-orange-500/20 flex items-center justify-center">
              <MapPin className="w-10 h-10 text-yellow-500" />
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-2">You're Close to the Venue!</h2>
            <p className="text-gray-400 mb-4">
              Online streaming is not available within {event.geo_radius_km || 50}km of the venue.
            </p>
            {geoInfo?.user_location && (
              <p className="text-gray-500 text-sm mb-4">
                Distance from venue: <span className="text-white font-semibold">{geoInfo.distance_km}km</span>
              </p>
            )}
            
            <div className="bg-dark-800/50 rounded-xl p-4 mb-6 border border-dark-700/50">
              <p className="text-gray-400 text-sm mb-2">Great news — watch live in person!</p>
              <p className="text-white font-semibold">{event.venue}</p>
            </div>
            
            {event.ticket_url ? (
              <a
                href={event.ticket_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold rounded-xl transition-all duration-300 shadow-lg shadow-red-500/25"
              >
                <Play className="w-5 h-5" />
                Get Tickets
              </a>
            ) : (
              <p className="text-gray-500">Contact the venue for ticket information.</p>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Parse datetime
  const parseAsLocalTime = (dateStr) => {
    if (!dateStr) return new Date()
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
      
      <div className="py-12 md:py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-5 gap-8 lg:gap-12">
            {/* Event Details - Left Column */}
            <div className="lg:col-span-3 space-y-6">
              {/* Hero Thumbnail */}
              <div className="relative aspect-video bg-dark-800 rounded-2xl overflow-hidden group">
                {event.thumbnail_url ? (
                  <img 
                    src={event.thumbnail_url} 
                    alt={event.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-dark-800 to-dark-900">
                    <span className="text-8xl">🎬</span>
                  </div>
                )}
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-transparent to-transparent opacity-60"></div>
                
                {/* Live Badge */}
                {isLive && (
                  <div className="absolute top-4 left-4">
                    <div className="px-4 py-2 bg-red-500 text-white font-bold rounded-full flex items-center gap-2 shadow-lg shadow-red-500/50">
                      <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                      LIVE NOW
                    </div>
                  </div>
                )}
                
                {/* Category/Organization Badge */}
                <div className="absolute bottom-4 left-4">
                  <span className="px-3 py-1 bg-dark-900/80 backdrop-blur-sm text-white text-sm font-medium rounded-full border border-dark-700/50">
                    {event.organization}
                  </span>
                </div>
              </div>

              {/* Title & Actions */}
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                    {event.title}
                  </h1>
                  <div className="flex items-center gap-3 text-gray-400">
                    <Users className="w-4 h-4" />
                    <span>{event.organization}</span>
                    {geoInfo?.crew_bypass && (
                      <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs font-medium rounded-full">
                        Crew Access
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <AddToCalendar event={event} />
                  <SocialShare 
                    title={`Watch ${event.title} Live!`}
                    description={`${event.organization} - ${eventDate.toLocaleDateString('en-AU')}`}
                  />
                </div>
              </div>

              {/* Premium Countdown - Before event starts */}
              {!isLive && !isPast && (
                <div className="p-6 md:p-8 bg-dark-800/30 rounded-2xl border border-dark-700/50 backdrop-blur-sm">
                  <PremiumCountdown 
                    targetDate={event.start_time}
                    onComplete={() => loadData()}
                  />
                </div>
              )}

              {/* Event Info Cards */}
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="flex items-center gap-4 p-4 bg-dark-800/30 rounded-xl border border-dark-700/30">
                  <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-red-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Date</p>
                    <p className="text-white font-medium">
                      {eventDate.toLocaleDateString('en-AU', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short'
                      })}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 p-4 bg-dark-800/30 rounded-xl border border-dark-700/30">
                  <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-red-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Time</p>
                    <p className="text-white font-medium">
                      {eventDate.toLocaleTimeString('en-AU', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })} AEST
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 p-4 bg-dark-800/30 rounded-xl border border-dark-700/30 sm:col-span-1">
                  <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-red-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Venue</p>
                    <p className="text-white font-medium truncate">{event.venue}</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              {event.description && (
                <div className="p-6 bg-dark-800/20 rounded-2xl border border-dark-700/30">
                  <div className="flex items-center gap-2 mb-3">
                    <Star className="w-5 h-5 text-red-500" />
                    <h3 className="text-lg font-semibold text-white">About This Event</h3>
                  </div>
                  <p className="text-gray-400 leading-relaxed">{event.description}</p>
                </div>
              )}
            </div>

            {/* Purchase Card - Right Column */}
            <div className="lg:col-span-2">
              <div className="sticky top-24">
                <PremiumPurchaseCard
                  price={event.price}
                  currency="AUD"
                  email={email}
                  onEmailChange={setEmail}
                  onPurchase={handlePurchase}
                  purchasing={purchasing}
                  error={error}
                  demoMode={settings.demo_mode}
                  isLive={isLive}
                  isPast={isPast}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
