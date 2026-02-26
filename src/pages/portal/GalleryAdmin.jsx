import React, { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

const API_URL = import.meta.env.VITE_GALLERY_API_URL || 'http://localhost:5230';

// Gallery List Component
export function GalleryList({ onSelect }) {
  const [galleries, setGalleries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    fetchGalleries();
  }, []);

  const fetchGalleries = async () => {
    try {
      const res = await fetch(`${API_URL}/api/galleries`);
      const data = await res.json();
      setGalleries(data.galleries || []);
    } catch (err) {
      console.error('Failed to fetch galleries:', err);
    } finally {
      setLoading(false);
    }
  };

  const createGallery = async (formData) => {
    try {
      const res = await fetch(`${API_URL}/api/galleries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.gallery) {
        setGalleries([data.gallery, ...galleries]);
        setShowCreate(false);
      }
    } catch (err) {
      console.error('Failed to create gallery:', err);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-white">Loading galleries...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Photo Galleries</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
        >
          + New Gallery
        </button>
      </div>

      {showCreate && (
        <CreateGalleryModal
          onClose={() => setShowCreate(false)}
          onCreate={createGallery}
        />
      )}

      {galleries.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          No galleries yet. Create your first gallery!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {galleries.map(gallery => (
            <GalleryCard
              key={gallery.id}
              gallery={gallery}
              onClick={() => onSelect(gallery)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Gallery Card
function GalleryCard({ gallery, onClick }) {
  const photoCount = gallery.gallery_photos?.[0]?.count || 0;
  const statusColors = {
    draft: 'bg-yellow-600',
    published: 'bg-green-600',
    archived: 'bg-gray-600'
  };

  return (
    <div
      onClick={onClick}
      className="bg-gray-800 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-red-500 transition-all"
    >
      <div className="h-40 bg-gray-700 flex items-center justify-center">
        {gallery.cover_photo_id ? (
          <img src={gallery.cover_url} alt="" className="w-full h-full object-cover" />
        ) : (
          <span className="text-gray-500">No cover photo</span>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className={`${statusColors[gallery.status]} px-2 py-0.5 rounded text-xs text-white`}>
            {gallery.status}
          </span>
          <span className="text-gray-400 text-sm">{photoCount} photos</span>
        </div>
        <h3 className="text-white font-semibold">{gallery.title}</h3>
        {gallery.livestream_events && (
          <p className="text-gray-400 text-sm mt-1">
            {gallery.livestream_events.title}
          </p>
        )}
        <p className="text-gray-500 text-sm mt-2">
          ${(gallery.price_per_photo / 100).toFixed(2)} per photo
        </p>
      </div>
    </div>
  );
}

// Create Gallery Modal
function CreateGalleryModal({ onClose, onCreate }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price_per_photo: 500,
    package_price: '',
    package_enabled: false
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreate({
      ...formData,
      price_per_photo: Math.round(parseFloat(formData.price_per_photo) * 100) || 500,
      package_price: formData.package_price ? Math.round(parseFloat(formData.package_price) * 100) : null
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold text-white mb-4">Create Gallery</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-400 mb-1">Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-gray-700 text-white rounded px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-gray-400 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-gray-700 text-white rounded px-3 py-2"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-gray-400 mb-1">Price per Photo ($)</label>
            <input
              type="number"
              step="0.01"
              value={formData.price_per_photo / 100}
              onChange={(e) => setFormData({ ...formData, price_per_photo: parseFloat(e.target.value) * 100 })}
              className="w-full bg-gray-700 text-white rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="flex items-center gap-2 text-gray-400">
              <input
                type="checkbox"
                checked={formData.package_enabled}
                onChange={(e) => setFormData({ ...formData, package_enabled: e.target.checked })}
                className="rounded"
              />
              Enable "Buy All" Package
            </label>
          </div>
          {formData.package_enabled && (
            <div>
              <label className="block text-gray-400 mb-1">Package Price ($)</label>
              <input
                type="number"
                step="0.01"
                value={formData.package_price / 100 || ''}
                onChange={(e) => setFormData({ ...formData, package_price: parseFloat(e.target.value) * 100 })}
                className="w-full bg-gray-700 text-white rounded px-3 py-2"
              />
            </div>
          )}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-600 hover:bg-gray-500 text-white py-2 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Gallery Editor Component
export function GalleryEditor({ galleryId, onBack }) {
  const [gallery, setGallery] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    fetchGallery();
  }, [galleryId]);

  const fetchGallery = async () => {
    try {
      const res = await fetch(`${API_URL}/api/galleries/${galleryId}`);
      const data = await res.json();
      setGallery(data.gallery);
      setPhotos(data.photos || []);
    } catch (err) {
      console.error('Failed to fetch gallery:', err);
    }
  };

  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;

    setUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    acceptedFiles.forEach(file => {
      formData.append('photos', file);
    });

    try {
      const res = await fetch(`${API_URL}/api/galleries/${galleryId}/photos`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      
      if (data.photos) {
        setPhotos([...photos, ...data.photos]);
      }
      
      alert(`Uploaded ${data.uploaded} photos${data.failed > 0 ? `, ${data.failed} failed` : ''}`);
    } catch (err) {
      console.error('Upload failed:', err);
      alert('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
    }
  }, [galleryId, photos]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp']
    },
    maxSize: 50 * 1024 * 1024
  });

  const deletePhoto = async (photoId) => {
    if (!confirm('Delete this photo?')) return;

    try {
      await fetch(`${API_URL}/api/galleries/${galleryId}/photos/${photoId}`, {
        method: 'DELETE'
      });
      setPhotos(photos.filter(p => p.id !== photoId));
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const updateGallery = async (updates) => {
    try {
      const res = await fetch(`${API_URL}/api/galleries/${galleryId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      const data = await res.json();
      setGallery(data.gallery);
    } catch (err) {
      console.error('Update failed:', err);
    }
  };

  const publishGallery = () => updateGallery({ status: 'published' });
  const unpublishGallery = () => updateGallery({ status: 'draft' });

  if (!gallery) {
    return <div className="p-8 text-center text-white">Loading...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="text-gray-400 hover:text-white">
            ← Back
          </button>
          <h1 className="text-2xl font-bold text-white">{gallery.title}</h1>
          <span className={`px-2 py-1 rounded text-sm text-white ${
            gallery.status === 'published' ? 'bg-green-600' : 'bg-yellow-600'
          }`}>
            {gallery.status}
          </span>
        </div>
        <div className="flex gap-3">
          {gallery.status === 'draft' ? (
            <button
              onClick={publishGallery}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
            >
              Publish
            </button>
          ) : (
            <button
              onClick={unpublishGallery}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded"
            >
              Unpublish
            </button>
          )}
          {gallery.status === 'published' && (
            <a
              href={`/#/gallery/${gallery.slug}`}
              target="_blank"
              className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded"
            >
              View Public
            </a>
          )}
        </div>
      </div>

      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 mb-6 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-red-500 bg-red-500/10' : 'border-gray-600 hover:border-gray-500'
        } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <div>
            <div className="text-white mb-2">Uploading & processing images...</div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-red-600 h-2 rounded-full transition-all"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        ) : isDragActive ? (
          <p className="text-red-400">Drop photos here...</p>
        ) : (
          <div>
            <p className="text-gray-300 mb-2">Drag & drop photos here, or click to select</p>
            <p className="text-gray-500 text-sm">JPEG, PNG, WebP up to 50MB each</p>
          </div>
        )}
      </div>

      {/* Photo Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {photos.map(photo => (
          <div key={photo.id} className="relative group">
            <img
              src={photo.thumbnail_url || photo.watermarked_url}
              alt={photo.filename}
              className="w-full aspect-square object-cover rounded-lg"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
              <button
                onClick={() => deletePhoto(photo.id)}
                className="bg-red-600 hover:bg-red-700 text-white p-2 rounded"
              >
                🗑
              </button>
            </div>
            <div className="absolute bottom-2 left-2 right-2 text-xs text-white truncate bg-black/50 px-1 rounded">
              {photo.filename}
            </div>
          </div>
        ))}
      </div>

      {photos.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          No photos yet. Upload some photos to get started!
        </div>
      )}

      {/* Gallery Info */}
      <div className="mt-8 bg-gray-800 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Gallery Settings</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-400">Price per Photo:</span>
            <span className="text-white ml-2">${(gallery.price_per_photo / 100).toFixed(2)}</span>
          </div>
          {gallery.package_enabled && (
            <div>
              <span className="text-gray-400">Package Price:</span>
              <span className="text-white ml-2">${(gallery.package_price / 100).toFixed(2)}</span>
            </div>
          )}
          <div>
            <span className="text-gray-400">Total Photos:</span>
            <span className="text-white ml-2">{photos.length}</span>
          </div>
          {gallery.slug && (
            <div>
              <span className="text-gray-400">Public URL:</span>
              <span className="text-white ml-2">/gallery/{gallery.slug}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Main Gallery Admin Page
export default function GalleryAdmin() {
  const [selectedGallery, setSelectedGallery] = useState(null);

  if (selectedGallery) {
    return (
      <GalleryEditor
        galleryId={selectedGallery.id}
        onBack={() => setSelectedGallery(null)}
      />
    );
  }

  return <GalleryList onSelect={setSelectedGallery} />;
}
