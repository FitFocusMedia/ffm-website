import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { ShoppingCart, Download, Check, X, Loader2, Tag, ChevronLeft, ChevronRight, Plus, Minus, Heart, ChevronUp, ChevronDown } from 'lucide-react'
import { supabase } from '../../lib/supabase'

// Tiered pricing calculation (matches backend logic)
function calculateTieredPrice(quantity, pricingTiers, defaultPrice) {
  if (!pricingTiers || !Array.isArray(pricingTiers) || pricingTiers.length === 0) {
    return {
      total: quantity * defaultPrice,
      breakdown: [{ qty: quantity, price: defaultPrice, subtotal: quantity * defaultPrice }],
      savings: 0
    }
  }
  
  const sortedTiers = [...pricingTiers].sort((a, b) => a.min_qty - b.min_qty)
  let remaining = quantity
  let total = 0
  const breakdown = []
  
  for (const tier of sortedTiers) {
    if (remaining <= 0) break
    
    const tierMin = tier.min_qty
    const tierMax = tier.max_qty || Infinity
    const tierPrice = tier.price_per_photo
    
    const tierCapacity = tierMax === Infinity ? remaining : (tierMax - tierMin + 1)
    const qtyInTier = Math.min(remaining, tierCapacity)
    
    if (qtyInTier > 0) {
      const subtotal = qtyInTier * tierPrice
      total += subtotal
      breakdown.push({
        tier: `${tierMin}-${tierMax === Infinity ? '+' : tierMax}`,
        qty: qtyInTier,
        price: tierPrice,
        subtotal
      })
      remaining -= qtyInTier
    }
  }
  
  if (remaining > 0) {
    const subtotal = remaining * defaultPrice
    total += subtotal
    breakdown.push({
      tier: 'standard',
      qty: remaining,
      price: defaultPrice,
      subtotal
    })
  }
  
  const flatTotal = quantity * defaultPrice
  const savings = flatTotal - total
  
  return { total, breakdown, savings, flatTotal }
}

export default function GalleryPage() {
  const { slug } = useParams()
  const [searchParams] = useSearchParams()
  const [gallery, setGallery] = useState(null)
  const [photos, setPhotos] = useState([])
  const [selectedPhotos, setSelectedPhotos] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showCheckout, setShowCheckout] = useState(false)
  const [purchasing, setPurchasing] = useState(false)
  const [lightboxPhoto, setLightboxPhoto] = useState(null)
  
  // Tutorial state (mobile only)
  const [tutorialStep, setTutorialStep] = useState(0) // 0=not started, 1=tap image, 2=swipe, 3=double-tap, 4=done
  const [tutorialPhotoToRemove, setTutorialPhotoToRemove] = useState(null)

  // Check for cancelled checkout
  const cancelled = searchParams.get('cancelled')
  
  // Check if tutorial should show (mobile + first time)
  useEffect(() => {
    const isMobile = window.innerWidth < 768
    const hasSeenTutorial = localStorage.getItem('gallery_tutorial_seen')
    if (isMobile && !hasSeenTutorial && photos.length > 0) {
      setTutorialStep(1) // Start tutorial
    }
  }, [photos])
  
  // Tutorial cleanup effect - remove demo photo after tutorial completes
  useEffect(() => {
    if (tutorialStep === 4 && tutorialPhotoToRemove) {
      const timer = setTimeout(() => {
        setSelectedPhotos(prev => {
          const newSet = new Set(prev)
          newSet.delete(tutorialPhotoToRemove)
          return newSet
        })
        setTutorialPhotoToRemove(null)
        setTutorialStep(0)
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [tutorialStep, tutorialPhotoToRemove])

  useEffect(() => {
    loadGallery()
  }, [slug])

  const loadGallery = async () => {
    try {
      // Get gallery
      const { data: galleryData, error: galleryError } = await supabase
        .from('galleries')
        .select(`
          id, title, description, slug, price_per_photo, package_price, package_enabled,
          pricing_tiers, tiered_pricing_enabled,
          organizations(id, name, display_name)
        `)
        .eq('slug', slug)
        .eq('status', 'published')
        .single()

      if (galleryError) throw galleryError
      setGallery(galleryData)

      // Get photos with signed URLs
      const { data: photosData, error: photosError } = await supabase
        .from('gallery_photos')
        .select('id, filename, width, height, price, sort_order, watermarked_path, thumbnail_path')
        .eq('gallery_id', galleryData.id)
        .order('sort_order', { ascending: true })

      if (photosError) throw photosError

      // Generate signed URLs - PUBLIC gallery uses watermarked images ONLY
      const photosWithUrls = await Promise.all(photosData.map(async (photo) => {
        const { data: wmUrl } = await supabase.storage
          .from('galleries')
          .createSignedUrl(photo.watermarked_path, 3600)

        return {
          ...photo,
          watermarked_url: wmUrl?.signedUrl,
          // Public gallery: use watermarked for both grid and lightbox
          // Clean thumbnails are admin-only
          thumbnail_url: wmUrl?.signedUrl,
          price: photo.price || galleryData.price_per_photo
        }
      }))

      setPhotos(photosWithUrls)
    } catch (err) {
      console.error('Load gallery error:', err)
      setError('Gallery not found')
    } finally {
      setLoading(false)
    }
  }

  const togglePhoto = (photoId) => {
    const newSelected = new Set(selectedPhotos)
    if (newSelected.has(photoId)) {
      newSelected.delete(photoId)
    } else {
      newSelected.add(photoId)
    }
    setSelectedPhotos(newSelected)
  }

  const selectAll = () => {
    setSelectedPhotos(new Set(photos.map(p => p.id)))
  }

  const clearSelection = () => {
    setSelectedPhotos(new Set())
  }

  // Calculate pricing with tiered discounts
  const priceCalc = useMemo(() => {
    const quantity = selectedPhotos.size
    if (quantity === 0 || !gallery) {
      return { total: 0, savings: 0, breakdown: [], flatTotal: 0 }
    }
    
    // Check if tiered pricing is enabled
    if (gallery.tiered_pricing_enabled && gallery.pricing_tiers?.length > 0) {
      return calculateTieredPrice(quantity, gallery.pricing_tiers, gallery.price_per_photo)
    }
    
    // Flat pricing
    const total = quantity * gallery.price_per_photo
    return { total, savings: 0, breakdown: [], flatTotal: total }
  }, [selectedPhotos.size, gallery])

  const getTotal = () => priceCalc.total

  const handleCheckout = async (email, customerName, isPackage = false) => {
    setPurchasing(true)
    setError(null)

    try {
      const response = await fetch('https://gonalgubgldgpkcekaxe.supabase.co/functions/v1/gallery_checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gallery_slug: slug,
          email,
          customer_name: customerName,
          photo_ids: isPackage ? [] : Array.from(selectedPhotos),
          is_package: isPackage
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Checkout failed')
      }

      if (data.checkout_url) {
        window.location.href = data.checkout_url
      }
    } catch (err) {
      console.error('Checkout error:', err)
      setError(err.message)
    } finally {
      setPurchasing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
      </div>
    )
  }

  if (error && !gallery) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Gallery Not Found</h2>
          <p className="text-gray-400">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">{gallery.title}</h1>
          {gallery.livestream_events && (
            <p className="text-gray-400">{gallery.livestream_events.title}</p>
          )}
          {gallery.description && (
            <p className="text-gray-300 mt-4">{gallery.description}</p>
          )}
        </div>

        {cancelled && (
          <div className="mb-6 p-4 bg-yellow-500/20 border border-yellow-500/50 rounded-lg text-yellow-300">
            Checkout was cancelled. Your selection is still saved.
          </div>
        )}

        {/* Pricing Info */}
        <div className="mb-6 space-y-3">
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="bg-dark-800 px-4 py-2 rounded-lg">
              <span className="text-gray-400">Per Photo:</span>
              <span className="text-white ml-2 font-semibold">
                ${(gallery.price_per_photo / 100).toFixed(2)}
              </span>
            </div>
            {gallery.package_enabled && gallery.package_price && (
              <div className="bg-dark-800 px-4 py-2 rounded-lg">
                <span className="text-gray-400">All Photos:</span>
                <span className="text-green-400 ml-2 font-semibold">
                  ${(gallery.package_price / 100).toFixed(2)}
                </span>
                <span className="text-gray-500 ml-1">(save ${((photos.length * gallery.price_per_photo - gallery.package_price) / 100).toFixed(2)})</span>
              </div>
            )}
          </div>
          
          {/* Volume Discounts */}
          {gallery.tiered_pricing_enabled && gallery.pricing_tiers?.length > 0 && (
            <div className="bg-gradient-to-r from-green-500/10 to-green-500/5 border border-green-500/30 rounded-lg p-4">
              <div className="flex items-center gap-2 text-green-400 font-semibold mb-3">
                <Tag className="w-4 h-4" />
                Volume Discounts
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 text-sm">
                {gallery.pricing_tiers.map((tier, i) => (
                  <div key={i} className="bg-dark-800/50 rounded px-3 py-2">
                    <span className="text-gray-400">
                      {tier.max_qty ? `${tier.min_qty}-${tier.max_qty}` : `${tier.min_qty}+`} photos:
                    </span>
                    <span className="text-white ml-2 font-semibold">
                      ${(tier.price_per_photo / 100).toFixed(2)} each
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Selection Controls */}
        <div className="mb-6 flex flex-wrap items-center gap-4">
          <button
            onClick={selectAll}
            className="text-sm text-gray-400 hover:text-white"
          >
            Select All ({photos.length})
          </button>
          {selectedPhotos.size > 0 && (
            <>
              <button
                onClick={clearSelection}
                className="text-sm text-gray-400 hover:text-white"
              >
                Clear Selection
              </button>
              <span className="text-white">
                {selectedPhotos.size} selected · ${(priceCalc.total / 100).toFixed(2)}
                {priceCalc.savings > 0 && (
                  <span className="text-green-400 ml-2">
                    (saving ${(priceCalc.savings / 100).toFixed(2)})
                  </span>
                )}
              </span>
            </>
          )}
        </div>

        {/* Photo Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 md:gap-4 mb-24 md:mb-8">
          {photos.map((photo, index) => (
            <div
              key={photo.id}
              className={`relative group cursor-pointer rounded-lg overflow-hidden transition-transform active:scale-98 ${
                selectedPhotos.has(photo.id) ? 'ring-2 ring-red-500' : ''
              } ${tutorialStep === 1 && index === 0 ? 'ring-2 ring-white animate-pulse z-10' : ''}`}
              onClick={() => {
                setLightboxPhoto(photo)
                if (tutorialStep === 1) setTutorialStep(2)
              }}
            >
              <img
                src={photo.thumbnail_url || photo.watermarked_url}
                alt={photo.filename}
                className="w-full aspect-square object-cover"
                loading="lazy"
              />
              
              {/* Selection Indicator */}
              <div className={`absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                selectedPhotos.has(photo.id)
                  ? 'bg-red-500 text-white'
                  : 'bg-black/40 text-white md:opacity-0 md:group-hover:opacity-100'
              }`}>
                {selectedPhotos.has(photo.id) ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
              </div>
              
              {/* Quick add button (tap without opening fullscreen) */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  togglePhoto(photo.id)
                }}
                className={`absolute top-2 left-2 w-7 h-7 rounded-full flex items-center justify-center transition-all md:opacity-0 md:group-hover:opacity-100 ${
                  selectedPhotos.has(photo.id)
                    ? 'bg-green-500 text-white'
                    : 'bg-black/40 text-white'
                }`}
              >
                <ShoppingCart className="w-3.5 h-3.5" />
              </button>

              {/* Price */}
              <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs font-medium">
                ${(photo.price / 100).toFixed(2)}
              </div>
            </div>
          ))}
        </div>

        {/* Sleek Floating Cart - Mobile Optimized */}
        {(selectedPhotos.size > 0 || gallery.package_enabled) && (
          <div className="fixed bottom-0 left-0 right-0 md:bottom-4 md:left-auto md:right-8 md:w-96 z-40">
            {/* Mobile: Slim pill bar */}
            <div className="md:hidden bg-dark-900/95 backdrop-blur-lg border-t border-dark-700 px-4 py-3 safe-area-pb">
              <div className="flex items-center gap-3">
                {/* Cart indicator pill */}
                <div className="flex items-center gap-2 bg-dark-700 rounded-full px-3 py-1.5">
                  <ShoppingCart className="w-4 h-4 text-red-500" />
                  <span className="text-white font-semibold text-sm">{selectedPhotos.size}</span>
                </div>
                
                {/* Price */}
                <div className="flex-1 text-right">
                  {priceCalc.savings > 0 && (
                    <span className="text-gray-500 text-xs line-through mr-2">
                      ${(priceCalc.flatTotal / 100).toFixed(2)}
                    </span>
                  )}
                  <span className="text-white font-bold">${(priceCalc.total / 100).toFixed(2)}</span>
                </div>
                
                {/* Checkout button */}
                <button
                  onClick={() => setShowCheckout(true)}
                  disabled={selectedPhotos.size === 0}
                  className="bg-red-500 hover:bg-red-600 disabled:bg-gray-600 text-white font-semibold px-5 py-2 rounded-full transition-all active:scale-95"
                >
                  Checkout
                </button>
              </div>
              
              {/* Buy All option */}
              {gallery.package_enabled && gallery.package_price && (
                <button
                  onClick={() => {
                    selectAll()
                    setShowCheckout(true)
                  }}
                  className="w-full mt-2 bg-green-600/20 border border-green-500/50 text-green-400 font-semibold py-2 rounded-full text-sm transition-all active:scale-98"
                >
                  Buy All {photos.length} Photos - ${(gallery.package_price / 100).toFixed(2)}
                </button>
              )}
            </div>
            
            {/* Desktop: Card style */}
            <div className="hidden md:block bg-dark-800 rounded-xl shadow-2xl p-4 border border-dark-700">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-red-500" />
                  <span className="text-white font-semibold">
                    {selectedPhotos.size} photos selected
                  </span>
                </div>
                <span className="text-white font-bold">
                  ${(priceCalc.total / 100).toFixed(2)}
                </span>
              </div>
              
              {priceCalc.savings > 0 && (
                <div className="flex items-center justify-between mb-3 text-sm">
                  <span className="text-gray-400">
                    <span className="line-through">${(priceCalc.flatTotal / 100).toFixed(2)}</span>
                  </span>
                  <span className="text-green-400 font-semibold">
                    Volume discount: -${(priceCalc.savings / 100).toFixed(2)}
                  </span>
                </div>
              )}

              <button
                onClick={() => setShowCheckout(true)}
                disabled={selectedPhotos.size === 0}
                className="w-full bg-red-500 hover:bg-red-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors"
              >
                Checkout
              </button>

              {gallery.package_enabled && gallery.package_price && (
                <button
                  onClick={() => {
                    selectAll()
                    setShowCheckout(true)
                  }}
                  className="w-full mt-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition-colors"
                >
                  Buy All Photos - ${(gallery.package_price / 100).toFixed(2)}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Checkout Modal */}
        {showCheckout && (
          <CheckoutModal
            gallery={gallery}
            selectedCount={selectedPhotos.size}
            priceCalc={priceCalc}
            isPackage={selectedPhotos.size === photos.length && gallery.package_enabled}
            packagePrice={gallery.package_price}
            onClose={() => setShowCheckout(false)}
            onCheckout={handleCheckout}
            purchasing={purchasing}
            error={error}
          />
        )}

        {/* Tutorial Overlay - Step 1: Tap to view */}
        {tutorialStep === 1 && photos.length > 0 && (
          <div className="fixed inset-0 bg-black/60 z-30 flex items-start justify-center pt-40 pointer-events-none md:hidden">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mx-4 text-center animate-bounce-slow">
              <div className="text-4xl mb-3">👆</div>
              <p className="text-white text-lg font-semibold">Tap a photo to view</p>
              <p className="text-white/70 text-sm mt-1">Open the fullscreen gallery</p>
            </div>
          </div>
        )}

        {/* Lightbox */}
        {lightboxPhoto && (
          <Lightbox
            photos={photos}
            currentPhoto={lightboxPhoto}
            selectedPhotos={selectedPhotos}
            onClose={() => {
              setLightboxPhoto(null)
              // If closing during tutorial, reset
              if (tutorialStep > 0 && tutorialStep < 4) {
                setTutorialStep(0)
              }
            }}
            onNavigate={setLightboxPhoto}
            onToggleSelect={togglePhoto}
            pricePerPhoto={gallery.price_per_photo}
            tutorialStep={tutorialStep}
            onTutorialStep={(step, photoId) => {
              setTutorialStep(step)
              // Tutorial complete - save to localStorage and trigger cleanup
              if (step === 4 && photoId) {
                localStorage.setItem('gallery_tutorial_seen', 'true')
                setTutorialPhotoToRemove(photoId) // This triggers the cleanup useEffect
              }
            }}
          />
        )}
      </div>
    </div>
  )
}

function CheckoutModal({ gallery, selectedCount, priceCalc, isPackage, packagePrice, onClose, onCheckout, purchasing, error }) {
  const [email, setEmail] = useState('')
  const [customerName, setCustomerName] = useState('')

  const finalTotal = isPackage && packagePrice ? packagePrice : priceCalc.total

  const handleSubmit = (e) => {
    e.preventDefault()
    onCheckout(email, customerName, isPackage && packagePrice)
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-dark-800 rounded-xl max-w-md w-full p-6">
        <h2 className="text-xl font-bold text-white mb-4">Complete Purchase</h2>
        
        <div className="mb-6 p-4 bg-dark-700 rounded-lg">
          <div className="flex justify-between text-gray-300 mb-2">
            <span>{selectedCount} photos</span>
            <span>${(priceCalc.flatTotal / 100).toFixed(2)}</span>
          </div>
          
          {/* Volume Discount */}
          {priceCalc.savings > 0 && !isPackage && (
            <div className="flex justify-between text-green-400 mb-2">
              <span>Volume Discount</span>
              <span>-${(priceCalc.savings / 100).toFixed(2)}</span>
            </div>
          )}
          
          {/* Package Discount */}
          {isPackage && packagePrice && priceCalc.flatTotal > packagePrice && (
            <div className="flex justify-between text-green-400 mb-2">
              <span>Package Discount</span>
              <span>-${((priceCalc.flatTotal - packagePrice) / 100).toFixed(2)}</span>
            </div>
          )}
          
          <div className="flex justify-between text-white font-bold mt-2 pt-2 border-t border-dark-600">
            <span>Total</span>
            <span>${(finalTotal / 100).toFixed(2)} AUD</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-400 mb-1">Email *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-dark-700 text-white rounded-lg px-4 py-3 border border-dark-600 focus:border-red-500 focus:outline-none"
              placeholder="your@email.com"
              required
            />
            <p className="text-gray-500 text-xs mt-1">Download link will be sent here</p>
          </div>

          <div>
            <label className="block text-gray-400 mb-1">Name (optional)</label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full bg-dark-700 text-white rounded-lg px-4 py-3 border border-dark-600 focus:border-red-500 focus:outline-none"
              placeholder="Your name"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-dark-600 hover:bg-dark-500 text-white py-3 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={purchasing || !email}
              className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-gray-600 text-white py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {purchasing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>Pay ${(finalTotal / 100).toFixed(2)}</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// TikTok-style fullscreen viewer with vertical swipe and double-tap to cart
function Lightbox({ photos, currentPhoto, selectedPhotos, onClose, onNavigate, onToggleSelect, pricePerPhoto, tutorialStep = 0, onTutorialStep }) {
  const currentIndex = photos.findIndex(p => p.id === currentPhoto.id)
  const isSelected = selectedPhotos.has(currentPhoto.id)
  const containerRef = useRef(null)
  
  // Simple swipe state
  const [dragY, setDragY] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [touchStartY, setTouchStartY] = useState(0)
  const [hasSwipedInTutorial, setHasSwipedInTutorial] = useState(false)
  
  // Double-tap detection
  const [lastTap, setLastTap] = useState(0)
  const [showHeartAnimation, setShowHeartAnimation] = useState(false)
  const [heartPosition, setHeartPosition] = useState({ x: 0, y: 0 })
  
  // Get adjacent photos for peek preview
  const prevPhoto = currentIndex > 0 ? photos[currentIndex - 1] : null
  const nextPhoto = currentIndex < photos.length - 1 ? photos[currentIndex + 1] : null
  
  // Lock body scroll
  useEffect(() => {
    const scrollY = window.scrollY
    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollY}px`
    document.body.style.left = '0'
    document.body.style.right = '0'
    document.body.style.overflow = 'hidden'
    
    return () => {
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.left = ''
      document.body.style.right = ''
      document.body.style.overflow = ''
      window.scrollTo(0, scrollY)
    }
  }, [])
  
  // Navigation functions
  const goNext = useCallback(() => {
    if (currentIndex < photos.length - 1) {
      onNavigate(photos[currentIndex + 1])
    }
  }, [currentIndex, photos, onNavigate])
  
  const goPrev = useCallback(() => {
    if (currentIndex > 0) {
      onNavigate(photos[currentIndex - 1])
    }
  }, [currentIndex, photos, onNavigate])
  
  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); goNext() }
      else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { e.preventDefault(); goPrev() }
      else if (e.key === 'Escape') onClose()
      else if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); onToggleSelect(currentPhoto.id) }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [goNext, goPrev, onClose, onToggleSelect, currentPhoto.id])
  
  // Touch handlers - direct 1:1 tracking
  const onTouchStart = (e) => {
    setTouchStartY(e.touches[0].clientY)
    setIsDragging(true)
    setDragY(0)
  }
  
  const onTouchMove = (e) => {
    if (!isDragging) return
    const deltaY = e.touches[0].clientY - touchStartY
    setDragY(deltaY)
  }
  
  const onTouchEnd = () => {
    setIsDragging(false)
    const threshold = 80
    
    if (dragY < -threshold && nextPhoto) {
      goNext()
      // Tutorial: user swiped, advance to step 3
      if (tutorialStep === 2 && !hasSwipedInTutorial) {
        setHasSwipedInTutorial(true)
        onTutorialStep?.(3)
      }
    } else if (dragY > threshold && prevPhoto) {
      goPrev()
      // Tutorial: user swiped, advance to step 3
      if (tutorialStep === 2 && !hasSwipedInTutorial) {
        setHasSwipedInTutorial(true)
        onTutorialStep?.(3)
      }
    }
    setDragY(0)
  }
  
  // Double-tap handler
  const handleTap = (e) => {
    const now = Date.now()
    if (now - lastTap < 300) {
      const rect = e.currentTarget.getBoundingClientRect()
      const x = e.clientX || rect.width / 2
      const y = e.clientY || rect.height / 2
      setHeartPosition({ x: x - rect.left, y: y - rect.top })
      setShowHeartAnimation(true)
      if (!selectedPhotos.has(currentPhoto.id)) {
        onToggleSelect(currentPhoto.id)
        // Tutorial: user double-tapped to add, complete tutorial (pass photo ID for cleanup)
        if (tutorialStep === 3) {
          onTutorialStep?.(4, currentPhoto.id)
        }
      }
      setTimeout(() => setShowHeartAnimation(false), 800)
    }
    setLastTap(now)
  }
  
  // Preload adjacent images
  useEffect(() => {
    if (prevPhoto) { const img = new Image(); img.src = prevPhoto.watermarked_url }
    if (nextPhoto) { const img = new Image(); img.src = nextPhoto.watermarked_url }
  }, [prevPhoto, nextPhoto])
  
  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 bg-black z-50 overflow-hidden"
      style={{ touchAction: 'none' }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onClick={handleTap}
    >
      {/* LAYER 1: Next image (BEHIND) - stationary, revealed as current slides away */}
      {nextPhoto && (
        <div className="absolute inset-0 flex items-center justify-center p-4 pt-16 pb-24">
          <img
            src={nextPhoto.watermarked_url}
            alt="Next"
            className="max-w-full max-h-full object-contain"
            draggable={false}
          />
        </div>
      )}
      
      {/* LAYER 2: Previous image (BEHIND) - only visible when dragging down */}
      {prevPhoto && dragY > 0 && (
        <div className="absolute inset-0 flex items-center justify-center p-4 pt-16 pb-24">
          <img
            src={prevPhoto.watermarked_url}
            alt="Previous"
            className="max-w-full max-h-full object-contain"
            draggable={false}
          />
        </div>
      )}
      
      {/* LAYER 3: Current image (TOP) - this one moves with swipe */}
      <div 
        className="absolute inset-0 flex items-center justify-center p-4 pt-16 pb-24 bg-black"
        style={{
          transform: `translateY(${dragY}px)`,
          transition: isDragging ? 'none' : 'transform 0.25s ease-out'
        }}
      >
        <img
          src={currentPhoto.watermarked_url}
          alt={currentPhoto.filename}
          className="max-w-full max-h-full object-contain select-none"
          draggable={false}
        />
      </div>
      
      {/* Heart Animation */}
      {showHeartAnimation && (
        <div 
          className="absolute pointer-events-none z-50"
          style={{ left: heartPosition.x, top: heartPosition.y, transform: 'translate(-50%, -50%)' }}
        >
          <Heart className="w-20 h-20 text-red-500 fill-red-500" style={{ animation: 'heartBurst 0.6s ease-out forwards' }} />
        </div>
      )}
      
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-40 flex items-center justify-between p-4 bg-gradient-to-b from-black/70 to-transparent">
        <div className="text-white/90 font-medium text-sm bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-sm">
          {currentIndex + 1} / {photos.length}
        </div>
        <button onClick={onClose} className="text-white bg-black/40 hover:bg-black/60 p-2.5 rounded-full backdrop-blur-sm transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>
      
      {/* Desktop Navigation Arrows */}
      {prevPhoto && (
        <button onClick={(e) => { e.stopPropagation(); goPrev() }} className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-40 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full">
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}
      {nextPhoto && (
        <button onClick={(e) => { e.stopPropagation(); goNext() }} className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-40 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full">
          <ChevronRight className="w-6 h-6" />
        </button>
      )}
      
      {/* Right side action buttons (TikTok style) - Mobile */}
      <div className="md:hidden absolute right-3 bottom-28 z-40 flex flex-col items-center gap-4">
        {/* Add to Cart */}
        <button
          onClick={(e) => { e.stopPropagation(); onToggleSelect(currentPhoto.id) }}
          className="flex flex-col items-center gap-1"
        >
          <div className={`p-3 rounded-full transition-all shadow-lg ${
            isSelected 
              ? 'bg-red-500 text-white scale-110' 
              : 'bg-black/60 text-white backdrop-blur-sm'
          }`}>
            {isSelected ? <Check className="w-6 h-6" /> : <ShoppingCart className="w-6 h-6" />}
          </div>
          <span className="text-white text-xs font-medium drop-shadow">
            {isSelected ? 'Added' : 'Add'}
          </span>
        </button>
        
        {/* Price indicator */}
        <div className="flex flex-col items-center gap-1">
          <div className={`p-3 rounded-full shadow-lg ${
            isSelected ? 'bg-black/60 text-red-500' : 'bg-black/60 text-white/70'
          } backdrop-blur-sm`}>
            <Heart className={`w-6 h-6 ${isSelected ? 'fill-red-500' : ''}`} />
          </div>
          <span className="text-white/80 text-xs font-medium drop-shadow">
            ${(pricePerPhoto / 100).toFixed(0)}
          </span>
        </div>
      </div>
      
      {/* Bottom bar - Desktop only */}
      <div className="hidden md:flex p-4 bg-gradient-to-t from-black/80 to-transparent items-center justify-between absolute bottom-0 left-0 right-0 z-40">
        <div className="text-gray-300 text-sm truncate max-w-[50%]">
          {currentPhoto.filename}
        </div>
        <button
          onClick={() => onToggleSelect(currentPhoto.id)}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold transition-all ${
            isSelected ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-red-500 hover:bg-red-600 text-white'
          }`}
        >
          {isSelected ? <><Check className="w-5 h-5" />In Cart</> : <><Plus className="w-5 h-5" />Add ${(pricePerPhoto / 100).toFixed(2)}</>}
        </button>
      </div>
      
      {/* Keyboard hints (desktop only) */}
      <div className="hidden md:flex absolute bottom-16 left-1/2 -translate-x-1/2 text-gray-500 text-xs gap-4 z-40">
        <span>↑ ↓ Navigate</span>
        <span>Space: Add to cart</span>
        <span>Esc: Close</span>
      </div>
      
      {/* Mobile hint - hide during tutorial */}
      {tutorialStep === 0 && (
        <div className="md:hidden absolute left-4 bottom-28 z-40 text-white/40 text-xs">
          Double-tap to add
        </div>
      )}
      
      {/* Tutorial Overlays */}
      {tutorialStep === 2 && (
        <div className="md:hidden absolute inset-x-0 bottom-40 z-50 flex justify-center pointer-events-none">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 mx-4 text-center">
            <div className="text-4xl mb-2">👆👇</div>
            <p className="text-white text-lg font-semibold">Swipe up or down</p>
            <p className="text-white/70 text-sm mt-1">Browse through photos</p>
          </div>
        </div>
      )}
      
      {tutorialStep === 3 && (
        <div className="md:hidden absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mx-4 text-center">
            <div className="text-4xl mb-2 animate-double-tap">☝️</div>
            <p className="text-white text-lg font-semibold">Double-tap to add to cart</p>
            <p className="text-white/70 text-sm mt-1">Try it on this photo!</p>
          </div>
        </div>
      )}
      
      {tutorialStep === 4 && (
        <div className="md:hidden absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="bg-green-500/20 backdrop-blur-md rounded-2xl p-6 mx-4 text-center animate-pulse">
            <div className="text-4xl mb-2">✅</div>
            <p className="text-white text-lg font-semibold">You're all set!</p>
            <p className="text-white/70 text-sm mt-1">Swipe to browse, double-tap to add</p>
          </div>
        </div>
      )}
      
      {/* Heart burst animation styles */}
      <style>{`
        @keyframes heartBurst {
          0% {
            transform: translate(-50%, -50%) scale(0);
            opacity: 1;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.2);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 0;
          }
        }
        @keyframes fadeOut {
          0% { opacity: 1; }
          70% { opacity: 1; }
          100% { opacity: 0; }
        }
        .animate-fade-out {
          animation: fadeOut 3s ease-out forwards;
        }
        .safe-area-pb {
          padding-bottom: max(12px, env(safe-area-inset-bottom));
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
        @keyframes double-tap {
          0%, 100% { transform: scale(1); }
          10% { transform: scale(0.85) translateY(5px); }
          20% { transform: scale(1); }
          30% { transform: scale(0.85) translateY(5px); }
          40% { transform: scale(1); }
        }
        .animate-double-tap {
          animation: double-tap 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
