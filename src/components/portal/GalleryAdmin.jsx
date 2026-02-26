import { useState, useEffect, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { supabase } from '../../lib/supabase'
import { Plus, Trash2, Eye, Upload, Image, ArrowLeft, Loader2, Check, ExternalLink } from 'lucide-react'

// Apply watermark using canvas (client-side)
async function applyWatermark(file) {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      
      // Draw original image
      ctx.drawImage(img, 0, 0)
      
      // Apply watermark pattern
      const text = 'FIT FOCUS MEDIA'
      const fontSize = Math.max(Math.floor(img.width / 20), 24)
      ctx.font = `bold ${fontSize}px Arial`
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'
      ctx.textAlign = 'center'
      
      // Rotate and tile watermark
      ctx.save()
      ctx.translate(img.width / 2, img.height / 2)
      ctx.rotate(-30 * Math.PI / 180)
      
      const spacing = fontSize * 8
      for (let y = -img.height; y < img.height * 2; y += spacing) {
        for (let x = -img.width; x < img.width * 2; x += fontSize * 12) {
          ctx.fillText(text, x, y)
        }
      }
      ctx.restore()
      
      // Convert to blob
      canvas.toBlob((blob) => {
        resolve(blob)
      }, 'image/jpeg', 0.85)
    }
    img.src = URL.createObjectURL(file)
  })
}

// Create thumbnail
async function createThumbnail(file, maxWidth = 400) {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const ratio = maxWidth / img.width
      const canvas = document.createElement('canvas')
      canvas.width = maxWidth
      canvas.height = img.height * ratio
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      
      canvas.toBlob((blob) => {
        resolve(blob)
      }, 'image/jpeg', 0.8)
    }
    img.src = URL.createObjectURL(file)
  })
}

export default function GalleryAdmin() {
  const [galleries, setGalleries] = useState([])
  const [selectedGallery, setSelectedGallery] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    loadGalleries()
  }, [])

  const loadGalleries = async () => {
    try {
      const { data, error } = await supabase
        .from('galleries')
        .select(`
          *,
          gallery_photos(count),
          livestream_events(title)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setGalleries(data || [])
    } catch (err) {
      console.error('Load galleries error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (selectedGallery) {
    return (
      <GalleryEditor
        galleryId={selectedGallery.id}
        onBack={() => {
          setSelectedGallery(null)
          loadGalleries()
        }}
      />
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Photo Galleries</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Gallery
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 text-red-500 animate-spin mx-auto" />
        </div>
      ) : galleries.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          No galleries yet. Create your first gallery!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {galleries.map(gallery => (
            <GalleryCard
              key={gallery.id}
              gallery={gallery}
              onClick={() => setSelectedGallery(gallery)}
            />
          ))}
        </div>
      )}

      {showCreateModal && (
        <CreateGalleryModal
          onClose={() => setShowCreateModal(false)}
          onCreate={(gallery) => {
            setGalleries([gallery, ...galleries])
            setShowCreateModal(false)
            setSelectedGallery(gallery)
          }}
        />
      )}
    </div>
  )
}

function GalleryCard({ gallery, onClick }) {
  const photoCount = gallery.gallery_photos?.[0]?.count || 0
  const statusColors = {
    draft: 'bg-yellow-600',
    published: 'bg-green-600',
    archived: 'bg-gray-600'
  }

  return (
    <div
      onClick={onClick}
      className="bg-dark-800 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-red-500 transition-all"
    >
      <div className="h-40 bg-dark-700 flex items-center justify-center">
        <Image className="w-12 h-12 text-gray-600" />
      </div>
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className={`${statusColors[gallery.status] || 'bg-gray-600'} px-2 py-0.5 rounded text-xs text-white`}>
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
  )
}

function CreateGalleryModal({ onClose, onCreate }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price_per_photo: 5.00,
    package_price: '',
    package_enabled: false
  })
  const [creating, setCreating] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setCreating(true)

    try {
      // Generate slug from title
      const slug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')

      const { data, error } = await supabase
        .from('galleries')
        .insert({
          title: formData.title,
          description: formData.description,
          slug,
          price_per_photo: Math.round(formData.price_per_photo * 100),
          package_price: formData.package_price ? Math.round(parseFloat(formData.package_price) * 100) : null,
          package_enabled: formData.package_enabled,
          status: 'draft'
        })
        .select()
        .single()

      if (error) throw error
      onCreate(data)
    } catch (err) {
      console.error('Create gallery error:', err)
      alert('Failed to create gallery: ' + err.message)
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-dark-800 rounded-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold text-white mb-4">Create Gallery</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-400 mb-1">Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-dark-700 text-white rounded-lg px-4 py-3 border border-dark-600 focus:border-red-500 focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-gray-400 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-dark-700 text-white rounded-lg px-4 py-3 border border-dark-600 focus:border-red-500 focus:outline-none"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-gray-400 mb-1">Price per Photo ($)</label>
            <input
              type="number"
              step="0.01"
              value={formData.price_per_photo}
              onChange={(e) => setFormData({ ...formData, price_per_photo: parseFloat(e.target.value) || 0 })}
              className="w-full bg-dark-700 text-white rounded-lg px-4 py-3 border border-dark-600 focus:border-red-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="flex items-center gap-2 text-gray-400 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.package_enabled}
                onChange={(e) => setFormData({ ...formData, package_enabled: e.target.checked })}
                className="w-4 h-4 rounded"
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
                value={formData.package_price}
                onChange={(e) => setFormData({ ...formData, package_price: e.target.value })}
                className="w-full bg-dark-700 text-white rounded-lg px-4 py-3 border border-dark-600 focus:border-red-500 focus:outline-none"
                placeholder="e.g. 49.99"
              />
            </div>
          )}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-dark-600 hover:bg-dark-500 text-white py-3 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating || !formData.title}
              className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white py-3 rounded-lg flex items-center justify-center gap-2"
            >
              {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function GalleryEditor({ galleryId, onBack }) {
  const [gallery, setGallery] = useState(null)
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 })

  useEffect(() => {
    loadGallery()
  }, [galleryId])

  const loadGallery = async () => {
    try {
      // Get gallery
      const { data: galleryData, error: galleryError } = await supabase
        .from('galleries')
        .select('*, livestream_events(id, title)')
        .eq('id', galleryId)
        .single()

      if (galleryError) throw galleryError
      setGallery(galleryData)

      // Get photos
      const { data: photosData, error: photosError } = await supabase
        .from('gallery_photos')
        .select('*')
        .eq('gallery_id', galleryId)
        .order('sort_order', { ascending: true })

      if (photosError) throw photosError

      // Get signed URLs for photos
      const photosWithUrls = await Promise.all(photosData.map(async (photo) => {
        const { data: thumbUrl } = await supabase.storage
          .from('galleries')
          .createSignedUrl(photo.thumbnail_path || photo.watermarked_path, 3600)
        return {
          ...photo,
          thumbnail_url: thumbUrl?.signedUrl
        }
      }))

      setPhotos(photosWithUrls)
    } catch (err) {
      console.error('Load gallery error:', err)
    } finally {
      setLoading(false)
    }
  }

  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return

    setUploading(true)
    setUploadProgress({ current: 0, total: acceptedFiles.length })

    const uploadedPhotos = []
    let sortOrder = photos.length

    for (let i = 0; i < acceptedFiles.length; i++) {
      const file = acceptedFiles[i]
      setUploadProgress({ current: i + 1, total: acceptedFiles.length })

      try {
        const photoId = crypto.randomUUID()
        const ext = file.name.split('.').pop() || 'jpg'

        // Create watermarked version (client-side)
        const watermarkedBlob = await applyWatermark(file)
        
        // Create thumbnail
        const thumbnailBlob = await createThumbnail(file)

        // Paths in storage
        const originalPath = `${galleryId}/originals/${photoId}.${ext}`
        const watermarkedPath = `${galleryId}/watermarked/${photoId}_wm.jpg`
        const thumbnailPath = `${galleryId}/thumbnails/${photoId}_thumb.jpg`

        // Upload original
        const { error: origError } = await supabase.storage
          .from('galleries')
          .upload(originalPath, file, { contentType: file.type })
        if (origError) throw origError

        // Upload watermarked
        const { error: wmError } = await supabase.storage
          .from('galleries')
          .upload(watermarkedPath, watermarkedBlob, { contentType: 'image/jpeg' })
        if (wmError) throw wmError

        // Upload thumbnail
        const { error: thumbError } = await supabase.storage
          .from('galleries')
          .upload(thumbnailPath, thumbnailBlob, { contentType: 'image/jpeg' })
        if (thumbError) throw thumbError

        // Get image dimensions
        const img = await new Promise((resolve) => {
          const img = new Image()
          img.onload = () => resolve(img)
          img.src = URL.createObjectURL(file)
        })

        // Save to database
        const { data: photo, error: dbError } = await supabase
          .from('gallery_photos')
          .insert({
            id: photoId,
            gallery_id: galleryId,
            original_path: originalPath,
            watermarked_path: watermarkedPath,
            thumbnail_path: thumbnailPath,
            filename: file.name,
            sort_order: sortOrder++,
            width: img.width,
            height: img.height,
            file_size: file.size
          })
          .select()
          .single()

        if (dbError) throw dbError

        // Get signed URL for display
        const { data: thumbUrl } = await supabase.storage
          .from('galleries')
          .createSignedUrl(thumbnailPath, 3600)

        uploadedPhotos.push({
          ...photo,
          thumbnail_url: thumbUrl?.signedUrl
        })

        console.log(`Uploaded: ${file.name}`)
      } catch (err) {
        console.error(`Failed to upload ${file.name}:`, err)
      }
    }

    setPhotos([...photos, ...uploadedPhotos])
    setUploading(false)
    setUploadProgress({ current: 0, total: 0 })
  }, [galleryId, photos])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp']
    },
    maxSize: 50 * 1024 * 1024,
    disabled: uploading
  })

  const deletePhoto = async (photoId) => {
    if (!confirm('Delete this photo?')) return

    try {
      const photo = photos.find(p => p.id === photoId)
      if (!photo) return

      // Delete from storage
      const paths = [photo.original_path, photo.watermarked_path, photo.thumbnail_path].filter(Boolean)
      await supabase.storage.from('galleries').remove(paths)

      // Delete from database
      await supabase.from('gallery_photos').delete().eq('id', photoId)

      setPhotos(photos.filter(p => p.id !== photoId))
    } catch (err) {
      console.error('Delete photo error:', err)
    }
  }

  const updateGallery = async (updates) => {
    try {
      const { data, error } = await supabase
        .from('galleries')
        .update(updates)
        .eq('id', galleryId)
        .select()
        .single()

      if (error) throw error
      setGallery(data)
    } catch (err) {
      console.error('Update gallery error:', err)
    }
  }

  const publishGallery = () => updateGallery({ status: 'published', published_at: new Date().toISOString() })
  const unpublishGallery = () => updateGallery({ status: 'draft' })

  if (loading) {
    return (
      <div className="p-8 text-center">
        <Loader2 className="w-8 h-8 text-red-500 animate-spin mx-auto" />
      </div>
    )
  }

  if (!gallery) {
    return <div className="p-8 text-center text-gray-400">Gallery not found</div>
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="text-gray-400 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-white">{gallery.title}</h1>
          <span className={`px-2 py-1 rounded text-sm ${
            gallery.status === 'published' ? 'bg-green-600' : 'bg-yellow-600'
          } text-white`}>
            {gallery.status}
          </span>
        </div>
        <div className="flex gap-3">
          {gallery.status === 'draft' ? (
            <button
              onClick={publishGallery}
              disabled={photos.length === 0}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              Publish
            </button>
          ) : (
            <>
              <button
                onClick={unpublishGallery}
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg"
              >
                Unpublish
              </button>
              <a
                href={`/#/gallery/${gallery.slug}`}
                target="_blank"
                className="bg-dark-600 hover:bg-dark-500 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                View Public
              </a>
            </>
          )}
        </div>
      </div>

      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-8 mb-6 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-red-500 bg-red-500/10' : 'border-dark-600 hover:border-dark-500'
        } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <div>
            <Loader2 className="w-8 h-8 text-red-500 animate-spin mx-auto mb-2" />
            <div className="text-white mb-2">
              Uploading {uploadProgress.current} of {uploadProgress.total}...
            </div>
            <div className="w-64 mx-auto bg-dark-700 rounded-full h-2">
              <div
                className="bg-red-600 h-2 rounded-full transition-all"
                style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}
              />
            </div>
          </div>
        ) : isDragActive ? (
          <div className="text-red-400">
            <Upload className="w-8 h-8 mx-auto mb-2" />
            Drop photos here...
          </div>
        ) : (
          <div>
            <Upload className="w-8 h-8 text-gray-500 mx-auto mb-2" />
            <p className="text-gray-300 mb-1">Drag & drop photos here, or click to select</p>
            <p className="text-gray-500 text-sm">JPEG, PNG, WebP up to 50MB each</p>
          </div>
        )}
      </div>

      {/* Photo Grid */}
      {photos.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          No photos yet. Upload some photos to get started!
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {photos.map(photo => (
            <div key={photo.id} className="relative group">
              <img
                src={photo.thumbnail_url}
                alt={photo.filename}
                className="w-full aspect-square object-cover rounded-lg bg-dark-700"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                <button
                  onClick={() => deletePhoto(photo.id)}
                  className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="absolute bottom-1 left-1 right-1 text-xs text-white truncate bg-black/50 px-1 rounded">
                {photo.filename}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Gallery Settings */}
      <div className="mt-8 bg-dark-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Gallery Settings</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-400">Price per Photo:</span>
            <span className="text-white ml-2">${(gallery.price_per_photo / 100).toFixed(2)}</span>
          </div>
          {gallery.package_enabled && gallery.package_price && (
            <div>
              <span className="text-gray-400">Package Price:</span>
              <span className="text-white ml-2">${(gallery.package_price / 100).toFixed(2)}</span>
            </div>
          )}
          <div>
            <span className="text-gray-400">Total Photos:</span>
            <span className="text-white ml-2">{photos.length}</span>
          </div>
          <div>
            <span className="text-gray-400">Public URL:</span>
            <span className="text-white ml-2">/gallery/{gallery.slug}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
