import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Calendar, MapPin, Play, Mail, LogOut, Ticket, Clock, Camera, Download, Image } from 'lucide-react'
import { 
  getCurrentUser, 
  getSession, 
  signOut, 
  sendMagicLink,
  getAllUserPurchases,
  onAuthStateChange,
  syncUserProfile
} from '../../lib/supabase'
import { getDirectImageUrl } from '../../lib/imageUtils'

export default function MyPurchasesPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [user, setUser] = useState(null)
  const [purchases, setPurchases] = useState([])
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [sendingLink, setSendingLink] = useState(false)
  const [linkSent, setLinkSent] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Check if user is authenticated
    checkAuth()
    
    // Listen for auth changes (magic link callback)
    const { data: { subscription } } = onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user)
        // Sync user profile (creates if needed, links auth, links past orders)
        try {
          await syncUserProfile(session.user.id, session.user.email)
        } catch (err) {
          console.error('Failed to sync profile:', err)
        }
        loadPurchases(session.user.email)
        
        // HashRouter fix: If we landed on root with access_token, navigate to my-purchases
        if (window.location.hash.includes('access_token') || window.location.hash === '#' || window.location.hash === '#/') {
          navigate('/my-purchases', { replace: true })
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        setPurchases([])
      }
    })

    return () => subscription.unsubscribe()
  }, [navigate])

  const checkAuth = async () => {
    try {
      const session = await getSession()
      if (session?.user) {
        setUser(session.user)
        // Ensure profile is synced
        try {
          await syncUserProfile(session.user.id, session.user.email)
        } catch (err) {
          console.error('Failed to sync profile:', err)
        }
        await loadPurchases(session.user.email)
      }
    } catch (err) {
      console.error('Auth check failed:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadPurchases = async (userEmail) => {
    try {
      const data = await getAllUserPurchases(userEmail)
      setPurchases(data || [])
    } catch (err) {
      console.error('Failed to load purchases:', err)
      setError('Failed to load your purchases')
    }
  }

  const handleSendMagicLink = async (e) => {
    e.preventDefault()
    if (!email) return
    
    setSendingLink(true)
    setError(null)
    
    try {
      // Don't include hash route - Supabase appends #access_token which conflicts with HashRouter
      // AuthContext handles redirect to /my-purchases after sign-in
      await sendMagicLink(email, window.location.origin)
      setLinkSent(true)
    } catch (err) {
      // Show actual Supabase error for debugging
      const errorMsg = err?.message || err?.error_description || 'Unknown error'
      setError(`Failed to send login link: ${errorMsg}`)
      console.error('Magic link error:', err)
    } finally {
      setSendingLink(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    setUser(null)
    setPurchases([])
  }

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-AU', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const formatTime = (dateStr) => {
    return new Date(dateStr).toLocaleTimeString('en-AU', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const isEventLive = (event) => {
    const now = new Date()
    const start = new Date(event.start_time)
    const end = new Date(event.end_time)
    return now >= start && now <= end && event.is_live
  }

  const isEventUpcoming = (event) => {
    return new Date(event.start_time) > new Date()
  }

  const isEventPast = (event) => {
    return new Date(event.end_time) < new Date()
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    )
  }

  // Not logged in - show login form
  if (!user) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <Ticket className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-white mb-2">My Purchases</h1>
            <p className="text-gray-400">
              Enter your email to access your purchased events
            </p>
          </div>

          {linkSent ? (
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6 text-center">
              <Mail className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-white mb-2">Check Your Email!</h2>
              <p className="text-gray-400 mb-4">
                We've sent a login link to <span className="text-white font-medium">{email}</span>
              </p>
              <p className="text-sm text-gray-500">
                Click the link in your email to access your purchases. The link expires in 1 hour.
              </p>
              <button
                onClick={() => setLinkSent(false)}
                className="mt-4 text-red-500 hover:text-red-400 text-sm"
              >
                Use a different email
              </button>
            </div>
          ) : (
            <form onSubmit={handleSendMagicLink} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>

              {error && (
                <div className="text-red-500 text-sm">{error}</div>
              )}

              <button
                type="submit"
                disabled={sendingLink || !email}
                className="w-full py-3 bg-red-500 hover:bg-red-600 disabled:bg-dark-700 disabled:text-gray-500 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {sendingLink ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="w-5 h-5" />
                    Send Login Link
                  </>
                )}
              </button>

              <p className="text-sm text-gray-500 text-center">
                No password needed! We'll email you a secure login link.
              </p>
            </form>
          )}
        </div>
      </div>
    )
  }

  // Logged in - show purchases
  return (
    <div className="min-h-screen bg-dark-950">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">My Purchases</h1>
            <p className="text-gray-400">{user.email}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>

        {/* Purchases List */}
        {purchases.length === 0 ? (
          <div className="text-center py-16">
            <Ticket className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">No Purchases Yet</h2>
            <p className="text-gray-400 mb-6">
              You haven't purchased any events or photos yet.
            </p>
            <button
              onClick={() => navigate('/live')}
              className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors"
            >
              Browse Events
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {purchases.map((purchase) => {
              // Gallery/Photo purchase
              if (purchase.type === 'gallery') {
                const gallery = purchase.gallery
                const isPackage = purchase.is_package
                const photoCount = purchase.photoCount || 0
                const downloadUrl = `/gallery/download/${purchase.download_token}`
                const tokenExpired = purchase.token_expires_at && new Date(purchase.token_expires_at) < new Date()
                
                // Get first photo's thumbnail for preview
                const firstItem = purchase.items?.[0]
                const thumbnailPath = firstItem?.photo?.thumbnail_path
                const thumbnailUrl = thumbnailPath 
                  ? `https://gonalgubgldgpkcekaxe.supabase.co/storage/v1/object/public/galleries/${thumbnailPath}`
                  : null
                
                return (
                  <div
                    key={purchase.id}
                    className="bg-dark-900 rounded-xl border border-dark-800 overflow-hidden hover:border-dark-700 transition-colors"
                  >
                    <div className="flex flex-col md:flex-row">
                      {/* Photo Thumbnail/Preview */}
                      <div className="md:w-48 h-32 md:h-auto flex-shrink-0 bg-gradient-to-br from-purple-900/50 to-pink-900/50 flex items-center justify-center overflow-hidden">
                        {thumbnailUrl ? (
                          <img 
                            src={thumbnailUrl} 
                            alt={gallery?.title || 'Photo'} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Camera className="w-16 h-16 text-purple-400/60" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 p-5">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <h3 className="text-lg font-bold text-white">{gallery?.title || 'Photo Gallery'}</h3>
                              <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs font-medium rounded-full flex items-center gap-1">
                                <Image className="w-3 h-3" />
                                Photos
                              </span>
                            </div>
                            <p className="text-gray-400 text-sm mb-3">
                              {isPackage ? 'Full Gallery Package' : `${photoCount} photo${photoCount !== 1 ? 's' : ''}`}
                            </p>
                            
                            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                              {tokenExpired ? (
                                <div className="flex items-center gap-1 text-amber-500">
                                  <Clock className="w-4 h-4" />
                                  Download link expired
                                </div>
                              ) : (
                                <div className="flex items-center gap-1">
                                  <Download className="w-4 h-4" />
                                  Download available
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Download Button */}
                          <button
                            onClick={() => navigate(downloadUrl)}
                            disabled={tokenExpired}
                            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors w-full sm:w-auto ${
                              tokenExpired 
                                ? 'bg-dark-700 text-gray-500 cursor-not-allowed' 
                                : 'bg-purple-600 hover:bg-purple-700 text-white'
                            }`}
                          >
                            <Download className="w-5 h-5" />
                            {tokenExpired ? 'Expired' : 'Download'}
                          </button>
                        </div>

                        {/* Purchase Info */}
                        <div className="mt-4 pt-4 border-t border-dark-800 flex items-center justify-between text-sm">
                          <span className="text-gray-500">
                            Purchased {formatDate(purchase.created_at)}
                          </span>
                          <span className="text-green-500 font-medium">
                            ${(purchase.total_amount / 100).toFixed(2)} AUD
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              }
              
              // Livestream purchase
              const event = purchase.event
              if (!event) return null // Skip if event data is missing
              
              const live = isEventLive(event)
              const upcoming = isEventUpcoming(event)
              const past = isEventPast(event)

              return (
                <div
                  key={purchase.id}
                  className="bg-dark-900 rounded-xl border border-dark-800 overflow-hidden hover:border-dark-700 transition-colors"
                >
                  <div className="flex flex-col md:flex-row">
                    {/* Thumbnail */}
                    {event.thumbnail_url && (
                      <div className="md:w-48 h-32 md:h-auto flex-shrink-0">
                        <img
                          src={getDirectImageUrl(event.thumbnail_url)}
                          alt={event.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-bold text-white">{event.title}</h3>
                            {live && (
                              <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                                LIVE
                              </span>
                            )}
                            {upcoming && (
                              <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs font-medium rounded-full">
                                Upcoming
                              </span>
                            )}
                            {past && !event.mux_playback_id && (
                              <span className="px-2 py-0.5 bg-gray-500/20 text-gray-400 text-xs font-medium rounded-full">
                                Ended
                              </span>
                            )}
                            {past && event.mux_playback_id && (
                              <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs font-medium rounded-full">
                                Replay Available
                              </span>
                            )}
                          </div>
                          <p className="text-gray-400 text-sm mb-3">{event.org_display_name || event.organization}</p>
                          
                          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {formatDate(event.start_time)}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {formatTime(event.start_time)}
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {event.venue}
                            </div>
                          </div>
                        </div>

                        {/* Watch Button */}
                        {(live || upcoming || event.mux_playback_id) && (
                          <button
                            onClick={() => navigate(`/watch/${event.id}?email=${encodeURIComponent(user.email)}`)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors flex-shrink-0 ${
                              live
                                ? 'bg-red-500 hover:bg-red-600 text-white'
                                : 'bg-dark-800 hover:bg-dark-700 text-white'
                            }`}
                          >
                            <Play className="w-5 h-5" />
                            {live ? 'Watch Live' : upcoming ? 'Watch' : 'Replay'}
                          </button>
                        )}
                      </div>

                      {/* Purchase Info */}
                      <div className="mt-4 pt-4 border-t border-dark-800 flex items-center justify-between text-sm">
                        <span className="text-gray-500">
                          Purchased {formatDate(purchase.created_at)}
                        </span>
                        <span className="text-green-500 font-medium">
                          ${purchase.amount} AUD
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
