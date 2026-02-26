import { useState, useEffect, useCallback } from 'react'
import { Plus, Trash2, ArrowLeft, Loader2, Check, ExternalLink, Upload, Image, Building2, Calendar } from 'lucide-react'
import { supabase } from '../../lib/supabase'

// Apply watermark using canvas (client-side)
async function applyWatermark(file) {
  return new Promise((resolve) => {
    const img = new window.Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      
      ctx.drawImage(img, 0, 0)
      
      const text = 'FIT FOCUS MEDIA'
      const fontSize = Math.max(Math.floor(img.width / 20), 24)
      ctx.font = `bold ${fontSize}px Arial`
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'
      ctx.textAlign = 'center'
      
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
      
      canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.85)
    }
    img.src = URL.createObjectURL(file)
  })
}

async function createThumbnail(file, maxWidth = 400) {
  return new Promise((resolve) => {
    const img = new window.Image()
    img.onload = () => {
      const ratio = maxWidth / img.width
      const canvas = document.createElement('canvas')
      canvas.width = maxWidth
      canvas.height = img.height * ratio
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.8)
    }
    img.src = URL.createObjectURL(file)
  })
}

export default function GalleryAdmin() {
  const [organizations, setOrganizations] = useState([])
  const [selectedOrg, setSelectedOrg] = useState(null)
  const [galleries, setGalleries] = useState([])
  const [selectedGallery, setSelectedGallery] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  
  // Get URL params for org pre-selection and back navigation
  const urlParams = new URLSearchParams(window.location.hash.split('?')[1] || '')
  const orgIdFromUrl = urlParams.get('org')
  const shouldOpenCreate = urlParams.get('create') === 'true'
  const editGalleryId = urlParams.get('edit')

  useEffect(() => {
    // If we have an edit param, load that gallery directly
    if (editGalleryId) {
      loadGalleryForEdit(editGalleryId)
    } else {
      loadOrganizations()
    }
  }, [])
  
  // Load a specific gallery for editing (from ?edit= param)
  const loadGalleryForEdit = async (galleryId) => {
    try {
      // Load the gallery
      const { data: gallery, error: galleryError } = await supabase
        .from('galleries')
        .select('*, organizations(*)')
        .eq('id', galleryId)
        .single()
      
      if (galleryError || !gallery) {
        console.error('Gallery not found:', galleryError)
        setLoading(false)
        return
      }
      
      // Set the org and gallery
      if (gallery.organizations) {
        setSelectedOrg(gallery.organizations)
        setOrganizations([gallery.organizations])
      }
      setSelectedGallery(gallery)
      setLoading(false)
    } catch (err) {
      console.error('Load gallery for edit error:', err)
      setLoading(false)
    }
  }
  
  // Auto-open create modal if ?create=true is in URL (after org is loaded)
  useEffect(() => {
    if (shouldOpenCreate && selectedOrg && !showCreateModal) {
      setShowCreateModal(true)
      // Clear the create param from URL to prevent re-opening on refresh
      const newUrl = window.location.hash.replace('&create=true', '').replace('?create=true', '')
      window.history.replaceState(null, '', newUrl || '#/portal/galleries')
    }
  }, [selectedOrg, shouldOpenCreate])

  useEffect(() => {
    if (selectedOrg) {
      loadGalleries(selectedOrg.id)
    }
  }, [selectedOrg])

  const loadOrganizations = async () => {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .order('name')
      
      if (error) throw error
      setOrganizations(data || [])
      
      // Auto-select org from URL param if provided
      if (orgIdFromUrl && data) {
        const orgFromUrl = data.find(o => o.id === orgIdFromUrl)
        if (orgFromUrl) {
          setSelectedOrg(orgFromUrl)
          return
        }
      }
      
      // Otherwise auto-select first org if only one
      if (data && data.length === 1) {
        setSelectedOrg(data[0])
      }
    } catch (err) {
      console.error('Load organizations error:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadGalleries = async (orgId) => {
    try {
      const { data, error } = await supabase
        .from('galleries')
        .select(`
          *,
          gallery_photos(count),
          events(id, name)
        `)
        .eq('organization_id', orgId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setGalleries(data || [])
    } catch (err) {
      console.error('Load galleries error:', err)
    }
  }

  if (selectedGallery) {
    return (
      <GalleryEditor
        gallery={selectedGallery}
        organization={selectedOrg}
        onBack={() => {
          setSelectedGallery(null)
          if (selectedOrg) loadGalleries(selectedOrg.id)
        }}
      />
    )
  }

  if (loading) {
    return (
      <div className="p-8 text-center">
        <Loader2 className="w-8 h-8 text-red-500 animate-spin mx-auto" />
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          {/* Back button - always show, goes to Content Admin with org context if available */}
          <a 
            href={selectedOrg ? `/#/portal/content-admin?org=${selectedOrg.id}` : '/#/portal/content-admin'}
            className="text-gray-400 hover:text-white transition-colors"
            title="Back to Content Admin"
          >
            <ArrowLeft className="w-5 h-5" />
          </a>
          <h1 className="text-2xl font-bold text-white">Photo Galleries</h1>
          {selectedOrg && (
            <span className="text-gray-400 text-lg">— {selectedOrg.display_name || selectedOrg.name}</span>
          )}
        </div>
        {selectedOrg && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Gallery
          </button>
        )}
      </div>

      {/* Organization Selector */}
      <div className="mb-6">
        <label className="block text-gray-400 mb-2">Organization</label>
        <select
          value={selectedOrg?.id || ''}
          onChange={(e) => {
            const org = organizations.find(o => o.id === e.target.value)
            setSelectedOrg(org || null)
            setGalleries([])
          }}
          className="w-full md:w-64 bg-dark-700 text-white rounded-lg px-4 py-3 border border-dark-600 focus:border-red-500 focus:outline-none"
        >
          <option value="">Select Organization...</option>
          {organizations.map(org => (
            <option key={org.id} value={org.id}>
              {org.display_name || org.name}
            </option>
          ))}
        </select>
      </div>

      {!selectedOrg ? (
        <div className="text-center py-12 text-gray-400">
          <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
          Select an organization to manage galleries
        </div>
      ) : galleries.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <Image className="w-12 h-12 mx-auto mb-4 opacity-50" />
          No galleries yet for {selectedOrg.display_name || selectedOrg.name}
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

      {showCreateModal && selectedOrg && (
        <CreateGalleryModal
          organization={selectedOrg}
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
        {gallery.events && (
          <p className="text-gray-400 text-sm mt-1 flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {gallery.events.name}
          </p>
        )}
        <p className="text-gray-500 text-sm mt-2">
          ${(gallery.price_per_photo / 100).toFixed(2)} per photo
        </p>
      </div>
    </div>
  )
}

function CreateGalleryModal({ organization, onClose, onCreate }) {
  const [events, setEvents] = useState([])
  const [loadingEvents, setLoadingEvents] = useState(true)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_id: '',
    price_per_photo: 5.00,
    package_price: '',
    package_enabled: false
  })
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    loadEvents()
  }, [organization.id])

  const loadEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('id, name, date')
        .eq('organization_id', organization.id)
        .order('date', { ascending: false })
      
      if (error) throw error
      setEvents(data || [])
    } catch (err) {
      console.error('Load events error:', err)
    } finally {
      setLoadingEvents(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setCreating(true)

    try {
      const slug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')

      const { data, error } = await supabase
        .from('galleries')
        .insert({
          organization_id: organization.id,
          event_id: formData.event_id || null,
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
      <div className="bg-dark-800 rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-white mb-4">
          Create Gallery for {organization.display_name || organization.name}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-400 mb-1">Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-dark-700 text-white rounded-lg px-4 py-3 border border-dark-600 focus:border-red-500 focus:outline-none"
              placeholder="e.g. South East Qld Championship Photos"
              required
            />
          </div>

          <div>
            <label className="block text-gray-400 mb-1">Link to Event (Optional)</label>
            {loadingEvents ? (
              <div className="text-gray-500 py-2">Loading events...</div>
            ) : (
              <select
                value={formData.event_id}
                onChange={(e) => setFormData({ ...formData, event_id: e.target.value })}
                className="w-full bg-dark-700 text-white rounded-lg px-4 py-3 border border-dark-600 focus:border-red-500 focus:outline-none"
              >
                <option value="">No specific event (org-wide gallery)</option>
                {events.map(event => (
                  <option key={event.id} value={event.id}>
                    {event.name} ({new Date(event.date).toLocaleDateString()})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-gray-400 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-dark-700 text-white rounded-lg px-4 py-3 border border-dark-600 focus:border-red-500 focus:outline-none"
              rows={3}
              placeholder="Optional description for the gallery"
            />
          </div>

          <div>
            <label className="block text-gray-400 mb-1">Price per Photo ($)</label>
            <input
              type="number"
              step="0.01"
              min="0"
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
              Enable "Buy All" Package Deal
            </label>
          </div>

          {formData.package_enabled && (
            <div>
              <label className="block text-gray-400 mb-1">Package Price ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.package_price}
                onChange={(e) => setFormData({ ...formData, package_price: e.target.value })}
                className="w-full bg-dark-700 text-white rounded-lg px-4 py-3 border border-dark-600 focus:border-red-500 focus:outline-none"
                placeholder="e.g. 49.99 for all photos"
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
              Create Gallery
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function GalleryEditor({ gallery, organization, onBack }) {
  const [currentGallery, setCurrentGallery] = useState(gallery)
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 })
  const [dragActive, setDragActive] = useState(false)

  useEffect(() => {
    loadPhotos()
  }, [gallery.id])

  const loadPhotos = async () => {
    try {
      const { data, error } = await supabase
        .from('gallery_photos')
        .select('*')
        .eq('gallery_id', gallery.id)
        .order('sort_order', { ascending: true })

      if (error) throw error

      // Get signed URLs for thumbnails
      const photosWithUrls = await Promise.all((data || []).map(async (photo) => {
        const { data: thumbUrl } = await supabase.storage
          .from('galleries')
          .createSignedUrl(photo.thumbnail_path || photo.watermarked_path, 3600)
        return { ...photo, thumbnail_url: thumbUrl?.signedUrl }
      }))

      setPhotos(photosWithUrls)
    } catch (err) {
      console.error('Load photos error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleFiles = async (files) => {
    const imageFiles = Array.from(files).filter(f => 
      f.type.startsWith('image/') && f.size <= 50 * 1024 * 1024
    )
    
    if (imageFiles.length === 0) return

    setUploading(true)
    setUploadProgress({ current: 0, total: imageFiles.length })

    const uploadedPhotos = []
    let sortOrder = photos.length

    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i]
      setUploadProgress({ current: i + 1, total: imageFiles.length })

      try {
        const photoId = crypto.randomUUID()
        const ext = file.name.split('.').pop() || 'jpg'

        const watermarkedBlob = await applyWatermark(file)
        const thumbnailBlob = await createThumbnail(file)

        const originalPath = `${gallery.id}/originals/${photoId}.${ext}`
        const watermarkedPath = `${gallery.id}/watermarked/${photoId}_wm.jpg`
        const thumbnailPath = `${gallery.id}/thumbnails/${photoId}_thumb.jpg`

        // Upload files and CHECK FOR ERRORS
        const { error: origError } = await supabase.storage.from('galleries').upload(originalPath, file, { contentType: file.type })
        if (origError) throw new Error(`Original upload failed: ${origError.message}`)
        
        const { error: wmError } = await supabase.storage.from('galleries').upload(watermarkedPath, watermarkedBlob, { contentType: 'image/jpeg' })
        if (wmError) throw new Error(`Watermarked upload failed: ${wmError.message}`)
        
        const { error: thumbError } = await supabase.storage.from('galleries').upload(thumbnailPath, thumbnailBlob, { contentType: 'image/jpeg' })
        if (thumbError) throw new Error(`Thumbnail upload failed: ${thumbError.message}`)

        const img = await new Promise((resolve) => {
          const img = new window.Image()
          img.onload = () => resolve(img)
          img.src = URL.createObjectURL(file)
        })

        const { data: photo, error: dbError } = await supabase
          .from('gallery_photos')
          .insert({
            id: photoId,
            gallery_id: gallery.id,
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

        const { data: thumbUrl } = await supabase.storage
          .from('galleries')
          .createSignedUrl(thumbnailPath, 3600)

        uploadedPhotos.push({ ...photo, thumbnail_url: thumbUrl?.signedUrl })
      } catch (err) {
        console.error(`Failed to upload ${file.name}:`, err)
        alert(`Failed to upload ${file.name}: ${err.message}`)
      }
    }

    setPhotos([...photos, ...uploadedPhotos])
    setUploading(false)
    setUploadProgress({ current: 0, total: 0 })
  }

  const deletePhoto = async (photoId) => {
    if (!confirm('Delete this photo?')) return

    try {
      const photo = photos.find(p => p.id === photoId)
      if (!photo) return

      const paths = [photo.original_path, photo.watermarked_path, photo.thumbnail_path].filter(Boolean)
      await supabase.storage.from('galleries').remove(paths)
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
        .eq('id', gallery.id)
        .select()
        .single()

      if (error) throw error
      setCurrentGallery(data)
    } catch (err) {
      console.error('Update gallery error:', err)
    }
  }

  const publishGallery = () => updateGallery({ status: 'published', published_at: new Date().toISOString() })
  const unpublishGallery = () => updateGallery({ status: 'draft' })

  const handleDrop = (e) => {
    e.preventDefault()
    setDragActive(false)
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setDragActive(true)
  }

  const handleDragLeave = () => {
    setDragActive(false)
  }

  if (loading) {
    return (
      <div className="p-8 text-center">
        <Loader2 className="w-8 h-8 text-red-500 animate-spin mx-auto" />
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="text-gray-400 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">{currentGallery.title}</h1>
            <p className="text-gray-400 text-sm">{organization.display_name || organization.name}</p>
          </div>
          <span className={`px-2 py-1 rounded text-sm ${
            currentGallery.status === 'published' ? 'bg-green-600' : 'bg-yellow-600'
          } text-white`}>
            {currentGallery.status}
          </span>
        </div>
        <div className="flex gap-3">
          {currentGallery.status === 'draft' ? (
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
                href={`/#/gallery/${currentGallery.slug}`}
                target="_blank"
                rel="noopener noreferrer"
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
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`border-2 border-dashed rounded-xl p-8 mb-6 text-center cursor-pointer transition-colors ${
          dragActive ? 'border-red-500 bg-red-500/10' : 'border-dark-600 hover:border-dark-500'
        } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
        onClick={() => !uploading && document.getElementById('photo-upload')?.click()}
      >
        <input
          id="photo-upload"
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
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
        ) : dragActive ? (
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
          <Image className="w-12 h-12 mx-auto mb-4 opacity-50" />
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
        
        {/* Editable Pricing Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-gray-400 text-sm mb-1">Price per Photo ($)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              defaultValue={(currentGallery.price_per_photo / 100).toFixed(2)}
              onBlur={(e) => {
                const cents = Math.round(parseFloat(e.target.value || 0) * 100)
                updateGallery({ price_per_photo: cents })
                setCurrentGallery({ ...currentGallery, price_per_photo: cents })
              }}
              className="w-full bg-dark-700 text-white rounded-lg px-3 py-2 border border-dark-600 focus:border-red-500 focus:outline-none"
            />
          </div>
          
          <div>
            <label className="flex items-center gap-2 text-gray-400 text-sm mb-1 cursor-pointer">
              <input
                type="checkbox"
                checked={currentGallery.package_enabled || false}
                onChange={(e) => {
                  updateGallery({ package_enabled: e.target.checked })
                  setCurrentGallery({ ...currentGallery, package_enabled: e.target.checked })
                }}
                className="w-4 h-4 rounded"
              />
              Enable "Buy All" Package
            </label>
            {currentGallery.package_enabled && (
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="Package price"
                defaultValue={currentGallery.package_price ? (currentGallery.package_price / 100).toFixed(2) : ''}
                onBlur={(e) => {
                  const cents = Math.round(parseFloat(e.target.value || 0) * 100)
                  updateGallery({ package_price: cents })
                  setCurrentGallery({ ...currentGallery, package_price: cents })
                }}
                className="w-full bg-dark-700 text-white rounded-lg px-3 py-2 border border-dark-600 focus:border-red-500 focus:outline-none mt-1"
              />
            )}
          </div>
          
          <div>
            <label className="block text-gray-400 text-sm mb-1">Total Photos</label>
            <div className="text-white text-lg font-semibold py-2">{photos.length}</div>
          </div>
          
          <div>
            <label className="block text-gray-400 text-sm mb-1">Public URL</label>
            <div className="text-white text-sm py-2 break-all">/gallery/{currentGallery.slug}</div>
          </div>
        </div>
        
        {/* Tiered Pricing Section */}
        <PricingTiersEditor 
          gallery={currentGallery} 
          onUpdate={(updates) => {
            updateGallery(updates)
            setCurrentGallery({ ...currentGallery, ...updates })
          }} 
        />
      </div>
    </div>
  )
}

// Tiered Pricing Editor Component
function PricingTiersEditor({ gallery, onUpdate }) {
  const [tiers, setTiers] = useState(gallery.pricing_tiers || [])
  const [enabled, setEnabled] = useState(gallery.tiered_pricing_enabled || false)
  const [saving, setSaving] = useState(false)
  const [edited, setEdited] = useState(false)

  const addTier = () => {
    const lastTier = tiers[tiers.length - 1]
    const newMin = lastTier ? (lastTier.max_qty || lastTier.min_qty) + 1 : 1
    setTiers([...tiers, { 
      min_qty: newMin, 
      max_qty: newMin + 9, 
      price_per_photo: gallery.price_per_photo 
    }])
    setEdited(true)
  }

  const updateTier = (index, field, value) => {
    const newTiers = [...tiers]
    newTiers[index] = { ...newTiers[index], [field]: value }
    setTiers(newTiers)
    setEdited(true)
  }

  const removeTier = (index) => {
    setTiers(tiers.filter((_, i) => i !== index))
    setEdited(true)
  }

  const saveTiers = async () => {
    setSaving(true)
    try {
      // Format tiers: convert max_qty empty to null (unlimited)
      const formattedTiers = tiers.map(t => ({
        min_qty: parseInt(t.min_qty) || 1,
        max_qty: t.max_qty ? parseInt(t.max_qty) : null,
        price_per_photo: parseInt(t.price_per_photo) || gallery.price_per_photo
      }))
      
      await onUpdate({ 
        pricing_tiers: formattedTiers, 
        tiered_pricing_enabled: enabled 
      })
      setEdited(false)
    } catch (err) {
      console.error('Save tiers error:', err)
      alert('Failed to save pricing tiers')
    } finally {
      setSaving(false)
    }
  }

  const toggleEnabled = () => {
    setEnabled(!enabled)
    setEdited(true)
  }

  // Calculate example pricing for preview
  const calculateExample = (qty) => {
    if (!enabled || tiers.length === 0) {
      return qty * gallery.price_per_photo
    }
    
    let remaining = qty
    let total = 0
    const sortedTiers = [...tiers].sort((a, b) => a.min_qty - b.min_qty)
    
    for (const tier of sortedTiers) {
      if (remaining <= 0) break
      const tierMax = tier.max_qty || Infinity
      const tierCapacity = tierMax === Infinity ? remaining : (tierMax - tier.min_qty + 1)
      const qtyInTier = Math.min(remaining, tierCapacity)
      total += qtyInTier * tier.price_per_photo
      remaining -= qtyInTier
    }
    
    if (remaining > 0) total += remaining * gallery.price_per_photo
    return total
  }

  return (
    <div className="border-t border-dark-600 pt-4 mt-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-md font-semibold text-white flex items-center gap-2">
          📊 Volume Discount Tiers
        </h3>
        <button
          onClick={toggleEnabled}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            enabled 
              ? 'bg-green-600 hover:bg-green-700 text-white' 
              : 'bg-dark-600 hover:bg-dark-500 text-gray-300'
          }`}
        >
          {enabled ? '✓ Enabled' : 'Enable Discounts'}
        </button>
      </div>
      
      <p className="text-gray-400 text-sm mb-4">
        Set volume discounts that automatically apply when customers buy more photos.
        Pricing is incremental (first 10 at tier 1 price, next 10 at tier 2, etc.)
      </p>

      {enabled && (
        <>
          {/* Tier List */}
          <div className="space-y-3 mb-4">
            {tiers.map((tier, idx) => (
              <div key={idx} className="flex items-center gap-3 bg-dark-700 p-3 rounded-lg">
                <div className="flex-1 grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">From Qty</label>
                    <input
                      type="number"
                      min="1"
                      value={tier.min_qty}
                      onChange={(e) => updateTier(idx, 'min_qty', e.target.value)}
                      className="w-full bg-dark-600 text-white rounded px-3 py-2 text-sm border border-dark-500 focus:border-red-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">To Qty (blank=∞)</label>
                    <input
                      type="number"
                      min={tier.min_qty}
                      value={tier.max_qty || ''}
                      placeholder="∞"
                      onChange={(e) => updateTier(idx, 'max_qty', e.target.value || null)}
                      className="w-full bg-dark-600 text-white rounded px-3 py-2 text-sm border border-dark-500 focus:border-red-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Price per Photo</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-gray-400">$</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={(tier.price_per_photo / 100).toFixed(2)}
                        onChange={(e) => updateTier(idx, 'price_per_photo', Math.round(parseFloat(e.target.value || 0) * 100))}
                        className="w-full bg-dark-600 text-white rounded pl-7 pr-3 py-2 text-sm border border-dark-500 focus:border-red-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => removeTier(idx)}
                  className="text-red-400 hover:text-red-300 p-2"
                  title="Remove tier"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={addTier}
            className="text-red-400 hover:text-red-300 text-sm flex items-center gap-1 mb-4"
          >
            <Plus className="w-4 h-4" /> Add Tier
          </button>

          {/* Pricing Preview */}
          {tiers.length > 0 && (
            <div className="bg-dark-700 rounded-lg p-4 mb-4">
              <h4 className="text-sm font-medium text-white mb-2">Preview Calculator</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 text-sm">
                {(() => {
                  // Generate preview quantities based on tier boundaries
                  const previewQtys = new Set()
                  tiers.forEach(tier => {
                    previewQtys.add(tier.min_qty)
                    if (tier.max_qty) {
                      previewQtys.add(tier.max_qty)
                      previewQtys.add(tier.max_qty + 1) // Show next tier start
                    }
                  })
                  // Add a few extra points
                  const maxTier = Math.max(...tiers.map(t => t.max_qty || t.min_qty + 20))
                  previewQtys.add(Math.ceil(maxTier / 2))
                  previewQtys.add(maxTier)
                  previewQtys.add(maxTier + 10)
                  
                  return [...previewQtys].sort((a, b) => a - b).slice(0, 8).map(qty => {
                    const tieredTotal = calculateExample(qty)
                    const flatTotal = qty * gallery.price_per_photo
                    const savings = flatTotal - tieredTotal
                    return (
                      <div key={qty} className="text-center">
                        <div className="text-gray-400">{qty} photos</div>
                        <div className="text-white font-medium">${(tieredTotal / 100).toFixed(2)}</div>
                        {savings > 0 && (
                          <div className="text-green-400 text-xs">Save ${(savings / 100).toFixed(2)}</div>
                        )}
                      </div>
                    )
                  })
                })()}
              </div>
            </div>
          )}
        </>
      )}

      {/* Save Button - always visible when enabled */}
      {enabled && (
        <button
          onClick={saveTiers}
          disabled={saving || !edited}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
            edited 
              ? 'bg-red-600 hover:bg-red-700 text-white' 
              : 'bg-dark-600 text-gray-400 cursor-not-allowed'
          }`}
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
          {edited ? 'Save Pricing' : 'Saved ✓'}
        </button>
      )}
    </div>
  )
}
