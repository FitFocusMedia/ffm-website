import { useState, useEffect, useMemo } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { ShoppingCart, Download, Check, X, Loader2, Tag } from 'lucide-react'
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

  // Check for cancelled checkout
  const cancelled = searchParams.get('cancelled')

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

      // Generate signed URLs
      const photosWithUrls = await Promise.all(photosData.map(async (photo) => {
        const { data: wmUrl } = await supabase.storage
          .from('galleries')
          .createSignedUrl(photo.watermarked_path, 3600)
        
        let thumbnailUrl = wmUrl?.signedUrl
        if (photo.thumbnail_path) {
          const { data: thumbUrl } = await supabase.storage
            .from('galleries')
            .createSignedUrl(photo.thumbnail_path, 3600)
          thumbnailUrl = thumbUrl?.signedUrl
        }

        return {
          ...photo,
          watermarked_url: wmUrl?.signedUrl,
          thumbnail_url: thumbnailUrl,
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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-8">
          {photos.map(photo => (
            <div
              key={photo.id}
              className={`relative group cursor-pointer rounded-lg overflow-hidden ${
                selectedPhotos.has(photo.id) ? 'ring-2 ring-red-500' : ''
              }`}
              onClick={() => togglePhoto(photo.id)}
            >
              <img
                src={photo.thumbnail_url || photo.watermarked_url}
                alt={photo.filename}
                className="w-full aspect-square object-cover"
                loading="lazy"
              />
              
              {/* Selection Indicator */}
              <div className={`absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                selectedPhotos.has(photo.id)
                  ? 'bg-red-500 text-white'
                  : 'bg-black/50 text-white opacity-0 group-hover:opacity-100'
              }`}>
                {selectedPhotos.has(photo.id) ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <span className="text-xs">+</span>
                )}
              </div>

              {/* Zoom Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setLightboxPhoto(photo)
                }}
                className="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity"
              >
                View
              </button>

              {/* Price */}
              <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
                ${(photo.price / 100).toFixed(2)}
              </div>
            </div>
          ))}
        </div>

        {/* Floating Cart */}
        {(selectedPhotos.size > 0 || gallery.package_enabled) && (
          <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-8 md:w-96 bg-dark-800 rounded-xl shadow-2xl p-4 border border-dark-700 z-40">
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

        {/* Lightbox */}
        {lightboxPhoto && (
          <div
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setLightboxPhoto(null)}
          >
            <button
              className="absolute top-4 right-4 text-white hover:text-gray-300"
              onClick={() => setLightboxPhoto(null)}
            >
              <X className="w-8 h-8" />
            </button>
            <img
              src={lightboxPhoto.watermarked_url}
              alt={lightboxPhoto.filename}
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
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
