import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Calendar, MapPin, Clock, CreditCard, Check, Shield } from 'lucide-react'
import { getLivestreamEvent, getLivestreamSettings, createLivestreamOrder } from '../../lib/supabase'

export default function EventPage() {
  const { eventId } = useParams()
  const navigate = useNavigate()
  const [event, setEvent] = useState(null)
  const [settings, setSettings] = useState({ demo_mode: false })
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadData()
  }, [eventId])

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
        // Live mode - redirect to Stripe
        // TODO: Implement Stripe checkout via API
        const response = await fetch('/api/livestream/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ eventId, email })
        })
        
        const data = await response.json()
        if (data.checkoutUrl) {
          window.location.href = data.checkoutUrl
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

  const eventDate = new Date(event.start_time)
  const isLive = event.is_live || event.status === 'live'
  const isPast = event.status === 'ended' || new Date(event.end_time) < new Date()

  return (
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
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              {event.title}
            </h1>
            <p className="text-xl text-gray-400 mb-6">{event.organization}</p>

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
  )
}
