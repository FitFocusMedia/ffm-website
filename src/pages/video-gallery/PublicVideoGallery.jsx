import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { ShoppingCart, Check, X, Loader2, Play, Pause, Volume2, VolumeX, ChevronUp, ChevronDown, Heart } from 'lucide-react'
import { supabase } from '../../lib/supabase'

/**
 * PublicVideoGallery - TikTok-style swipe video gallery for purchasing clips
 * Full-screen vertical scroll, double-tap to add to cart
 */
export default function PublicVideoGallery() {
  const { slug } = useParams()
  const [searchParams] = useSearchParams()
  const [gallery, setGallery] = useState(null)
  const [clips, setClips] = useState([])
  const [selectedClips, setSelectedClips] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showCheckout, setShowCheckout] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [filterCategory, setFilterCategory] = useState('All')
  const [categories, setCategories] = useState(['All'])
  const [showCategoryTabs, setShowCategoryTabs] = useState(true)
  
  const containerRef = useRef(null)
  const lastScrollY = useRef(0)
  const touchStartY = useRef(0)

  // Check for cancelled checkout
  const cancelled = searchParams.get('cancelled')

  useEffect(() => {
    if (slug) loadGallery()
  }, [slug])

  // Hide category tabs on scroll down, show on scroll up
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setShowCategoryTabs(false)
      } else {
        setShowCategoryTabs(true)
      }
      lastScrollY.current = currentScrollY
    }
    
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const loadGallery = async () => {
    try {
      // Get gallery
      const { data: galleryData, error: galleryError } = await supabase
        .from('video_galleries')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .single()

      if (galleryError) throw galleryError
      setGallery(galleryData)

      // Get clips
      const { data: clipsData, error: clipsError } = await supabase
        .from('video_clips')
        .select('*')
        .eq('gallery_id', galleryData.id)
        .order('sort_order', { ascending: true })

      if (clipsError) throw clipsError

      // Get signed URLs for clips
      const clipsWithUrls = await Promise.all(clipsData.map(async (clip) => {
        const urls = {}
        
        if (clip.preview_path) {
          const { data: previewUrl } = await supabase.storage
            .from('video-clips')
            .createSignedUrl(clip.preview_path, 3600)
          urls.preview_url = previewUrl?.signedUrl
        } else if (clip.original_path) {
          // Use original as preview if no preview generated
          const { data: origUrl } = await supabase.storage
            .from('video-clips')
            .createSignedUrl(clip.original_path, 3600)
          urls.preview_url = origUrl?.signedUrl
        }
        
        if (clip.thumbnail_path) {
          const { data: thumbUrl } = await supabase.storage
            .from('video-clips')
            .createSignedUrl(clip.thumbnail_path, 3600)
          urls.thumbnail_url = thumbUrl?.signedUrl
        }
        
        return {
          ...clip,
          ...urls,
          price: clip.price || galleryData.price_per_clip
        }
      }))

      setClips(clipsWithUrls)
      
      // Extract unique categories
      const uniqueCategories = ['All', ...new Set(
        clipsData
          .map(c => c.category || 'Main')
          .filter(c => c && c !== 'All')
      )]
      setCategories(uniqueCategories)
    } catch (err) {
      console.error('Load gallery error:', err)
      setError('Video gallery not found')
    } finally {
      setLoading(false)
    }
  }

  const toggleClip = (clipId) => {
    setSelectedClips(prev => {
      const next = new Set(prev)
      if (next.has(clipId)) {
        next.delete(clipId)
      } else {
        next.add(clipId)
      }
      return next
    })
  }

  const filteredClips = clips.filter(
    clip => filterCategory === 'All' || (clip.category || 'Main') === filterCategory
  )

  const totalPrice = Array.from(selectedClips).reduce((sum, clipId) => {
    const clip = clips.find(c => c.id === clipId)
    return sum + (clip?.price || 0)
  }, 0)

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <p>{error}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className={`fixed top-0 left-0 right-0 z-30 bg-gradient-to-b from-black/80 to-transparent p-4 transition-all duration-300 ${
        showCategoryTabs ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full'
      }`}>
        <h1 className="text-xl font-bold text-center">{gallery?.title}</h1>
        <p className="text-sm text-gray-400 text-center">${(gallery?.price_per_clip / 100).toFixed(2)} per clip</p>
        
        {/* Category Tabs */}
        {categories.length > 1 && (
          <div className="mt-3 flex gap-2 overflow-x-auto pb-2 scrollbar-hide justify-center">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  filterCategory === cat
                    ? 'bg-red-500 text-white'
                    : 'bg-white/10 text-gray-300'
                }`}
              >
                {cat}
                <span className="ml-1 text-xs opacity-70">
                  ({cat === 'All' 
                    ? clips.length 
                    : clips.filter(c => (c.category || 'Main') === cat).length
                  })
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Video Feed */}
      <div ref={containerRef} className="snap-y snap-mandatory h-screen overflow-y-scroll">
        {filteredClips.map((clip, index) => (
          <VideoClipCard
            key={clip.id}
            clip={clip}
            isSelected={selectedClips.has(clip.id)}
            onToggle={() => toggleClip(clip.id)}
            isActive={index === currentIndex}
            onVisible={() => setCurrentIndex(index)}
          />
        ))}
      </div>

      {/* Cart Button */}
      {selectedClips.size > 0 && (
        <button
          onClick={() => setShowCheckout(true)}
          className="fixed bottom-6 right-6 z-40 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full font-semibold shadow-lg flex items-center gap-2 transition-all"
        >
          <ShoppingCart className="w-5 h-5" />
          <span>{selectedClips.size} clips</span>
          <span className="bg-white/20 px-2 py-0.5 rounded-full text-sm">
            ${(totalPrice / 100).toFixed(2)}
          </span>
        </button>
      )}

      {/* Checkout Modal */}
      {showCheckout && (
        <CheckoutModal
          gallery={gallery}
          clips={clips}
          selectedClips={selectedClips}
          totalPrice={totalPrice}
          onClose={() => setShowCheckout(false)}
          onRemoveClip={toggleClip}
        />
      )}

      {/* Cancelled Message */}
      {cancelled && (
        <div className="fixed top-20 left-4 right-4 z-50 bg-yellow-600 text-white p-3 rounded-lg text-center">
          Checkout was cancelled. Your selections are still saved.
        </div>
      )}
    </div>
  )
}

function VideoClipCard({ clip, isSelected, onToggle, isActive, onVisible }) {
  const videoRef = useRef(null)
  const cardRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [showControls, setShowControls] = useState(true)
  const lastTapRef = useRef(0)

  // Intersection observer to detect when clip is visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          onVisible()
          // Auto-play when visible
          if (videoRef.current) {
            videoRef.current.play().catch(() => {})
            setIsPlaying(true)
          }
        } else {
          // Pause when not visible
          if (videoRef.current) {
            videoRef.current.pause()
            setIsPlaying(false)
          }
        }
      },
      { threshold: 0.5 }
    )

    if (cardRef.current) {
      observer.observe(cardRef.current)
    }

    return () => observer.disconnect()
  }, [onVisible])

  const handleTap = (e) => {
    const now = Date.now()
    const DOUBLE_TAP_DELAY = 300

    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      // Double tap - add to cart
      onToggle()
      lastTapRef.current = 0
    } else {
      // Single tap - toggle play/pause
      lastTapRef.current = now
      setTimeout(() => {
        if (lastTapRef.current !== 0) {
          if (videoRef.current) {
            if (isPlaying) {
              videoRef.current.pause()
              setIsPlaying(false)
            } else {
              videoRef.current.play()
              setIsPlaying(true)
            }
          }
          lastTapRef.current = 0
        }
      }, DOUBLE_TAP_DELAY)
    }
  }

  const toggleMute = (e) => {
    e.stopPropagation()
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted
      setIsMuted(videoRef.current.muted)
    }
  }

  const formatDuration = (seconds) => {
    if (!seconds) return ''
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div
      ref={cardRef}
      className="snap-start h-screen w-full relative flex items-center justify-center bg-black"
      onClick={handleTap}
    >
      {/* Video */}
      <video
        ref={videoRef}
        src={clip.preview_url}
        poster={clip.thumbnail_url}
        className="h-full w-full object-contain"
        loop
        muted={isMuted}
        playsInline
        preload="metadata"
      />

      {/* Selection Indicator */}
      {isSelected && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <div className="bg-red-500 rounded-full p-4 animate-ping-once">
            <Heart className="w-12 h-12 text-white fill-white" />
          </div>
        </div>
      )}

      {/* Right Side Actions */}
      <div className="absolute right-4 bottom-32 flex flex-col items-center gap-6">
        {/* Add to Cart */}
        <button
          onClick={(e) => { e.stopPropagation(); onToggle(); }}
          className={`p-3 rounded-full transition-all ${
            isSelected 
              ? 'bg-red-500 text-white scale-110' 
              : 'bg-white/20 text-white hover:bg-white/30'
          }`}
        >
          {isSelected ? (
            <Check className="w-7 h-7" />
          ) : (
            <ShoppingCart className="w-7 h-7" />
          )}
        </button>
        <span className="text-xs text-white/80">
          {isSelected ? 'Added' : 'Add'}
        </span>

        {/* Mute Toggle */}
        <button
          onClick={toggleMute}
          className="p-3 rounded-full bg-white/20 text-white hover:bg-white/30"
        >
          {isMuted ? (
            <VolumeX className="w-6 h-6" />
          ) : (
            <Volume2 className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Bottom Info */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-white font-medium">{clip.title || clip.filename}</p>
            {clip.category && clip.category !== 'Main' && (
              <span className="inline-block mt-1 px-2 py-0.5 bg-red-500/80 text-white text-xs rounded">
                {clip.category}
              </span>
            )}
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-white">${(clip.price / 100).toFixed(2)}</p>
            {clip.duration_seconds && (
              <p className="text-sm text-gray-400">{formatDuration(clip.duration_seconds)}</p>
            )}
          </div>
        </div>
        <p className="text-sm text-gray-400 mt-2">Double-tap to add to cart</p>
      </div>

      {/* Play/Pause Indicator */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-black/50 rounded-full p-4">
            <Play className="w-12 h-12 text-white" />
          </div>
        </div>
      )}
    </div>
  )
}

function CheckoutModal({ gallery, clips, selectedClips, totalPrice, onClose, onRemoveClip }) {
  const [email, setEmail] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [purchasing, setPurchasing] = useState(false)

  const selectedClipsList = clips.filter(c => selectedClips.has(c.id))

  const handleCheckout = async () => {
    if (!email) {
      alert('Please enter your email')
      return
    }

    setPurchasing(true)

    try {
      // Create order
      const { data: order, error: orderError } = await supabase
        .from('video_orders')
        .insert({
          gallery_id: gallery.id,
          email,
          customer_name: customerName || null,
          total_amount: totalPrice,
          status: 'pending'
        })
        .select()
        .single()

      if (orderError) throw orderError

      // Create order items
      const orderItems = selectedClipsList.map(clip => ({
        order_id: order.id,
        clip_id: clip.id,
        price: clip.price
      }))

      const { error: itemsError } = await supabase
        .from('video_order_items')
        .insert(orderItems)

      if (itemsError) throw itemsError

      // Create Stripe checkout session
      const { data: checkoutData, error: checkoutError } = await supabase.functions.invoke('video-checkout', {
        body: {
          orderId: order.id,
          galleryId: gallery.id,
          email,
          clips: selectedClipsList.map(c => ({ id: c.id, price: c.price, name: c.title || c.filename })),
          totalAmount: totalPrice,
          successUrl: `${window.location.origin}/video-gallery/${gallery.slug}/success?order=${order.id}`,
          cancelUrl: `${window.location.origin}/video-gallery/${gallery.slug}?cancelled=true`
        }
      })

      if (checkoutError) throw checkoutError

      // Redirect to Stripe
      if (checkoutData?.url) {
        window.location.href = checkoutData.url
      }
    } catch (err) {
      console.error('Checkout error:', err)
      alert('Checkout failed. Please try again.')
      setPurchasing(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-end md:items-center justify-center">
      <div className="bg-dark-800 w-full md:max-w-lg md:rounded-xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-dark-700">
          <h2 className="text-xl font-bold text-white">Your Cart</h2>
          <button onClick={onClose} className="p-2 hover:bg-dark-700 rounded-lg">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Clips List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {selectedClipsList.map(clip => (
            <div key={clip.id} className="flex items-center gap-3 bg-dark-900 rounded-lg p-3">
              <div className="w-20 h-12 bg-dark-700 rounded overflow-hidden flex-shrink-0">
                {clip.thumbnail_url ? (
                  <img src={clip.thumbnail_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Play className="w-6 h-6 text-gray-600" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white truncate">{clip.title || clip.filename}</p>
                <p className="text-sm text-gray-400">${(clip.price / 100).toFixed(2)}</p>
              </div>
              <button
                onClick={() => onRemoveClip(clip.id)}
                className="p-2 hover:bg-dark-700 rounded-lg"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          ))}
        </div>

        {/* Checkout Form */}
        <div className="p-4 border-t border-dark-700 space-y-3">
          <input
            type="email"
            placeholder="Email address *"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-dark-900 border border-dark-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
          />
          <input
            type="text"
            placeholder="Name (optional)"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="w-full bg-dark-900 border border-dark-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
          />

          <div className="flex items-center justify-between text-lg font-semibold">
            <span className="text-gray-400">Total:</span>
            <span className="text-white">${(totalPrice / 100).toFixed(2)} AUD</span>
          </div>

          <button
            onClick={handleCheckout}
            disabled={purchasing || !email}
            className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white py-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
          >
            {purchasing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <ShoppingCart className="w-5 h-5" />
                Checkout with Stripe
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
