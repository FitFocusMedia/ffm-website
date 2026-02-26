import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';

const API_URL = import.meta.env.VITE_GALLERY_API_URL || 'http://localhost:5230';

export default function PublicGallery() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const [gallery, setGallery] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [selectedPhotos, setSelectedPhotos] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [lightboxPhoto, setLightboxPhoto] = useState(null);

  useEffect(() => {
    fetchGallery();
  }, [slug]);

  // Show cancelled message
  useEffect(() => {
    if (searchParams.get('cancelled')) {
      alert('Payment was cancelled. Your photos are still in the cart.');
    }
  }, [searchParams]);

  const fetchGallery = async () => {
    try {
      const res = await fetch(`${API_URL}/api/public/galleries/${slug}`);
      if (!res.ok) {
        throw new Error('Gallery not found');
      }
      const data = await res.json();
      setGallery(data.gallery);
      setPhotos(data.photos || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const togglePhoto = (photoId) => {
    const newSelected = new Set(selectedPhotos);
    if (newSelected.has(photoId)) {
      newSelected.delete(photoId);
    } else {
      newSelected.add(photoId);
    }
    setSelectedPhotos(newSelected);
  };

  const selectAll = () => {
    setSelectedPhotos(new Set(photos.map(p => p.id)));
  };

  const clearSelection = () => {
    setSelectedPhotos(new Set());
  };

  const calculateTotal = () => {
    let total = 0;
    photos.forEach(photo => {
      if (selectedPhotos.has(photo.id)) {
        total += photo.price;
      }
    });
    return total;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading gallery...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl text-white mb-4">Gallery Not Found</h1>
          <p className="text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  const total = calculateTotal();
  const canBuyPackage = gallery.package_enabled && gallery.package_price;

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-white">{gallery.title}</h1>
          {gallery.description && (
            <p className="text-gray-400 mt-2">{gallery.description}</p>
          )}
          {gallery.livestream_events && (
            <p className="text-gray-500 text-sm mt-1">
              Event: {gallery.livestream_events.title}
            </p>
          )}
          <div className="flex items-center gap-4 mt-4 text-sm">
            <span className="text-gray-400">{photos.length} photos</span>
            <span className="text-gray-400">•</span>
            <span className="text-white">${(gallery.price_per_photo / 100).toFixed(2)} each</span>
            {canBuyPackage && (
              <>
                <span className="text-gray-400">•</span>
                <span className="text-green-400">
                  Buy All: ${(gallery.package_price / 100).toFixed(2)}
                </span>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Selection Bar */}
      {(selectedPhotos.size > 0 || canBuyPackage) && (
        <div className="sticky top-0 z-40 bg-gray-800/95 backdrop-blur border-b border-gray-700">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-white">
                {selectedPhotos.size} photo{selectedPhotos.size !== 1 ? 's' : ''} selected
              </span>
              <button
                onClick={selectAll}
                className="text-blue-400 hover:text-blue-300 text-sm"
              >
                Select All
              </button>
              {selectedPhotos.size > 0 && (
                <button
                  onClick={clearSelection}
                  className="text-gray-400 hover:text-gray-300 text-sm"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="flex items-center gap-4">
              {selectedPhotos.size > 0 && (
                <span className="text-white font-semibold">
                  Total: ${(total / 100).toFixed(2)}
                </span>
              )}
              {canBuyPackage && (
                <button
                  onClick={() => setShowCheckout({ isPackage: true })}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                >
                  Buy All (${(gallery.package_price / 100).toFixed(2)})
                </button>
              )}
              {selectedPhotos.size > 0 && (
                <button
                  onClick={() => setShowCheckout({ isPackage: false })}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                >
                  Checkout Selected
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Photo Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {photos.map(photo => (
            <PhotoCard
              key={photo.id}
              photo={photo}
              selected={selectedPhotos.has(photo.id)}
              onToggle={() => togglePhoto(photo.id)}
              onView={() => setLightboxPhoto(photo)}
              defaultPrice={gallery.price_per_photo}
            />
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxPhoto && (
        <Lightbox
          photo={lightboxPhoto}
          onClose={() => setLightboxPhoto(null)}
          onPrev={() => {
            const idx = photos.findIndex(p => p.id === lightboxPhoto.id);
            if (idx > 0) setLightboxPhoto(photos[idx - 1]);
          }}
          onNext={() => {
            const idx = photos.findIndex(p => p.id === lightboxPhoto.id);
            if (idx < photos.length - 1) setLightboxPhoto(photos[idx + 1]);
          }}
          selected={selectedPhotos.has(lightboxPhoto.id)}
          onToggle={() => togglePhoto(lightboxPhoto.id)}
        />
      )}

      {/* Checkout Modal */}
      {showCheckout && (
        <CheckoutModal
          gallery={gallery}
          photos={photos}
          selectedPhotoIds={showCheckout.isPackage ? photos.map(p => p.id) : Array.from(selectedPhotos)}
          isPackage={showCheckout.isPackage}
          total={showCheckout.isPackage ? gallery.package_price : total}
          onClose={() => setShowCheckout(false)}
        />
      )}
    </div>
  );
}

// Photo Card Component
function PhotoCard({ photo, selected, onToggle, onView, defaultPrice }) {
  const price = photo.price || defaultPrice;

  return (
    <div 
      className={`relative group cursor-pointer rounded-lg overflow-hidden ${
        selected ? 'ring-2 ring-red-500' : ''
      }`}
    >
      {/* Prevent right-click */}
      <img
        src={photo.thumbnail_url || photo.watermarked_url}
        alt=""
        className="w-full aspect-square object-cover"
        onClick={onView}
        onContextMenu={(e) => e.preventDefault()}
        draggable={false}
      />
      
      {/* Selection checkbox */}
      <button
        onClick={(e) => { e.stopPropagation(); onToggle(); }}
        className={`absolute top-2 left-2 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
          selected 
            ? 'bg-red-600 border-red-600 text-white' 
            : 'bg-black/50 border-white/50 hover:border-white'
        }`}
      >
        {selected && '✓'}
      </button>
      
      {/* Price badge */}
      <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-sm">
        ${(price / 100).toFixed(2)}
      </div>
      
      {/* Hover overlay */}
      <div 
        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
        onClick={onView}
      >
        <span className="text-white text-sm">Click to view</span>
      </div>
    </div>
  );
}

// Lightbox Component
function Lightbox({ photo, onClose, onPrev, onNext, selected, onToggle }) {
  useEffect(() => {
    const handleKeydown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    };
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [onClose, onPrev, onNext]);

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white text-2xl hover:text-gray-300"
      >
        ✕
      </button>
      
      <button
        onClick={onPrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-white text-4xl hover:text-gray-300"
      >
        ‹
      </button>
      
      <button
        onClick={onNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-white text-4xl hover:text-gray-300"
      >
        ›
      </button>
      
      <img
        src={photo.watermarked_url}
        alt=""
        className="max-w-[90vw] max-h-[85vh] object-contain"
        onContextMenu={(e) => e.preventDefault()}
        draggable={false}
      />
      
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4">
        <button
          onClick={onToggle}
          className={`px-6 py-2 rounded-lg transition-colors ${
            selected 
              ? 'bg-red-600 text-white' 
              : 'bg-white/20 text-white hover:bg-white/30'
          }`}
        >
          {selected ? '✓ Selected' : 'Select Photo'}
        </button>
      </div>
    </div>
  );
}

// Checkout Modal Component
function CheckoutModal({ gallery, photos, selectedPhotoIds, isPackage, total, onClose }) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCheckout = async () => {
    if (!email) {
      setError('Email is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/api/galleries/${gallery.slug}/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          customer_name: name,
          photo_ids: selectedPhotoIds,
          is_package: isPackage
        })
      });

      const data = await res.json();
      
      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      } else {
        throw new Error(data.error || 'Checkout failed');
      }
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const selectedPhotos = photos.filter(p => selectedPhotoIds.includes(p.id));

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white">Checkout</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
          </div>

          {/* Order Summary */}
          <div className="bg-gray-700 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-semibold text-gray-300 mb-2">Order Summary</h3>
            {isPackage ? (
              <div className="flex justify-between text-white">
                <span>Full Package ({selectedPhotoIds.length} photos)</span>
                <span>${(total / 100).toFixed(2)}</span>
              </div>
            ) : (
              <>
                <div className="text-sm text-gray-400 mb-2">
                  {selectedPhotoIds.length} photo{selectedPhotoIds.length !== 1 ? 's' : ''}
                </div>
                <div className="flex justify-between text-white font-semibold">
                  <span>Total</span>
                  <span>${(total / 100).toFixed(2)}</span>
                </div>
              </>
            )}
          </div>

          {/* Preview of selected photos */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {selectedPhotos.slice(0, 5).map(photo => (
              <img
                key={photo.id}
                src={photo.thumbnail_url}
                alt=""
                className="w-16 h-16 object-cover rounded flex-shrink-0"
              />
            ))}
            {selectedPhotoIds.length > 5 && (
              <div className="w-16 h-16 bg-gray-700 rounded flex items-center justify-center text-gray-400 flex-shrink-0">
                +{selectedPhotoIds.length - 5}
              </div>
            )}
          </div>

          {/* Form */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Email *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-700 text-white rounded-lg px-4 py-2"
                placeholder="your@email.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Name (optional)</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-gray-700 text-white rounded-lg px-4 py-2"
                placeholder="Your name"
              />
            </div>
          </div>

          {error && (
            <div className="mt-4 text-red-400 text-sm">{error}</div>
          )}

          <button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full mt-6 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white py-3 rounded-lg font-semibold transition-colors"
          >
            {loading ? 'Processing...' : `Pay $${(total / 100).toFixed(2)}`}
          </button>

          <p className="text-xs text-gray-500 mt-4 text-center">
            After payment, you'll receive download links via email.
          </p>
        </div>
      </div>
    </div>
  );
}
