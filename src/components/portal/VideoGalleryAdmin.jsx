import { useState, useEffect, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Plus, Trash2, Eye, Upload, Video, ArrowLeft, Loader2, Check, ExternalLink, Play, Film } from 'lucide-react'
import { supabase } from '../../lib/supabase'

/**
 * VideoGalleryAdmin - Admin dashboard for video clip galleries
 * TikTok-style video commerce system
 */
export default function VideoGalleryAdmin() {
  const [galleries, setGalleries] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedGallery, setSelectedGallery] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    loadGalleries()
  }, [])

  const loadGalleries = async () => {
    try {
      const { data, error } = await supabase
        .from('video_galleries')
        .select('*, video_clips(count), livestream_events(id, title)')
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
      <VideoGalleryEditor
        galleryId={selectedGallery}
        onBack={() => {
          setSelectedGallery(null)
          loadGalleries()
        }}
      />
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Film className="w-7 h-7 text-red-500" />
            Video Galleries
          </h1>
          <p className="text-gray-400 mt-1">TikTok-style video commerce for event footage</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
          New Video Gallery
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 text-red-500 animate-spin mx-auto" />
          <p className="text-gray-400 mt-2">Loading galleries...</p>
        </div>
      ) : galleries.length === 0 ? (
        <div className="text-center py-12 bg-dark-800 rounded-xl border border-dark-700">
          <Film className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No video galleries yet</h3>
          <p className="text-gray-400 mb-4">Create your first video gallery to start selling event footage</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium"
          >
            Create Video Gallery
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {galleries.map(gallery => (
            <div
              key={gallery.id}
              className="bg-dark-800 rounded-xl border border-dark-700 overflow-hidden hover:border-red-500/50 transition-colors cursor-pointer"
              onClick={() => setSelectedGallery(gallery.id)}
            >
              <div className="aspect-video bg-dark-900 flex items-center justify-center">
                <Film className="w-12 h-12 text-gray-600" />
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-white mb-1">{gallery.title}</h3>
                <p className="text-sm text-gray-400 mb-2">
                  {gallery.livestream_events?.title || 'No event linked'}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    {gallery.video_clips?.[0]?.count || 0} clips
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    gallery.status === 'published' ? 'bg-green-600 text-white' :
                    gallery.status === 'draft' ? 'bg-yellow-600 text-white' :
                    'bg-gray-600 text-white'
                  }`}>
                    {gallery.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <CreateVideoGalleryModal
          onClose={() => setShowCreateModal(false)}
          onCreated={(id) => {
            setShowCreateModal(false)
            setSelectedGallery(id)
          }}
        />
      )}
    </div>
  )
}

function CreateVideoGalleryModal({ onClose, onCreated }) {
  const [title, setTitle] = useState('')
  const [pricePerClip, setPricePerClip] = useState('15.00')
  const [creating, setCreating] = useState(false)
  const [events, setEvents] = useState([])
  const [selectedEvent, setSelectedEvent] = useState('')

  useEffect(() => {
    loadEvents()
  }, [])

  const loadEvents = async () => {
    const { data } = await supabase
      .from('livestream_events')
      .select('id, title')
      .order('event_date', { ascending: false })
      .limit(50)
    setEvents(data || [])
  }

  const handleCreate = async () => {
    if (!title.trim()) return
    setCreating(true)

    try {
      const { data, error } = await supabase
        .from('video_galleries')
        .insert({
          title: title.trim(),
          event_id: selectedEvent || null,
          price_per_clip: Math.round(parseFloat(pricePerClip) * 100),
          status: 'draft'
        })
        .select()
        .single()

      if (error) throw error
      onCreated(data.id)
    } catch (err) {
      console.error('Create error:', err)
      alert('Error creating gallery')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-dark-800 rounded-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold text-white mb-4">New Video Gallery</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Gallery Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., QBJJC March 2026 Highlights"
              className="w-full bg-dark-900 border border-dark-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Link to Event (optional)</label>
            <select
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
              className="w-full bg-dark-900 border border-dark-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500"
            >
              <option value="">No event</option>
              {events.map(event => (
                <option key={event.id} value={event.id}>{event.title}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Price per Clip ($)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={pricePerClip}
              onChange={(e) => setPricePerClip(e.target.value)}
              className="w-full bg-dark-900 border border-dark-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-dark-700 hover:bg-dark-600 text-white rounded-lg font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={creating || !title.trim()}
            className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg font-medium"
          >
            {creating ? 'Creating...' : 'Create Gallery'}
          </button>
        </div>
      </div>
    </div>
  )
}

function VideoGalleryEditor({ galleryId, onBack }) {
  const [gallery, setGallery] = useState(null)
  const [clips, setClips] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 })
  const [selectedCategory, setSelectedCategory] = useState('Main')
  const [newCategoryName, setNewCategoryName] = useState('')
  const [categories, setCategories] = useState(['Main'])
  const [filterCategory, setFilterCategory] = useState('All')

  useEffect(() => {
    loadGallery()
  }, [galleryId])

  const loadGallery = async () => {
    try {
      const { data: galleryData, error: galleryError } = await supabase
        .from('video_galleries')
        .select('*, livestream_events(id, title)')
        .eq('id', galleryId)
        .single()

      if (galleryError) throw galleryError
      setGallery(galleryData)

      const { data: clipsData, error: clipsError } = await supabase
        .from('video_clips')
        .select('*')
        .eq('gallery_id', galleryId)
        .order('sort_order', { ascending: true })

      if (clipsError) throw clipsError

      // Get signed URLs for clips
      const clipsWithUrls = await Promise.all(clipsData.map(async (clip) => {
        const urls = {}
        
        if (clip.thumbnail_path) {
          const { data: thumbUrl } = await supabase.storage
            .from('video-clips')
            .createSignedUrl(clip.thumbnail_path, 3600)
          urls.thumbnail_url = thumbUrl?.signedUrl
        }
        
        if (clip.preview_path) {
          const { data: previewUrl } = await supabase.storage
            .from('video-clips')
            .createSignedUrl(clip.preview_path, 3600)
          urls.preview_url = previewUrl?.signedUrl
        }
        
        return { ...clip, ...urls }
      }))

      setClips(clipsWithUrls)
      
      // Extract unique categories
      const uniqueCategories = ['Main', ...new Set(
        clipsData
          .map(c => c.category)
          .filter(c => c && c !== 'Main')
      )]
      setCategories(uniqueCategories)
    } catch (err) {
      console.error('Load gallery error:', err)
    } finally {
      setLoading(false)
    }
  }

  // Generate thumbnail from video
  const generateThumbnail = (videoFile) => {
    return new Promise((resolve) => {
      const video = document.createElement('video')
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      video.onloadedmetadata = () => {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        video.currentTime = 1 // Seek to 1 second
      }
      
      video.onseeked = () => {
        ctx.drawImage(video, 0, 0)
        canvas.toBlob((blob) => {
          resolve({
            blob,
            width: video.videoWidth,
            height: video.videoHeight,
            duration: video.duration
          })
        }, 'image/jpeg', 0.8)
      }
      
      video.onerror = () => resolve(null)
      video.src = URL.createObjectURL(videoFile)
    })
  }

  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return

    setUploading(true)
    setUploadProgress({ current: 0, total: acceptedFiles.length })

    const uploadedClips = []
    let sortOrder = clips.length

    for (let i = 0; i < acceptedFiles.length; i++) {
      const file = acceptedFiles[i]
      setUploadProgress({ current: i + 1, total: acceptedFiles.length })

      try {
        const clipId = crypto.randomUUID()
        const ext = file.name.split('.').pop() || 'mp4'

        // Generate thumbnail
        const thumbnailData = await generateThumbnail(file)

        // Paths in storage
        const originalPath = `${galleryId}/originals/${clipId}.${ext}`
        const thumbnailPath = thumbnailData ? `${galleryId}/thumbnails/${clipId}_thumb.jpg` : null

        // Upload original video
        const { error: origError } = await supabase.storage
          .from('video-clips')
          .upload(originalPath, file, { contentType: file.type })
        if (origError) throw origError

        // Upload thumbnail if generated
        if (thumbnailData && thumbnailPath) {
          await supabase.storage
            .from('video-clips')
            .upload(thumbnailPath, thumbnailData.blob, { contentType: 'image/jpeg' })
        }

        // Save to database
        const { data: clip, error: dbError } = await supabase
          .from('video_clips')
          .insert({
            id: clipId,
            gallery_id: galleryId,
            original_path: originalPath,
            thumbnail_path: thumbnailPath,
            filename: file.name,
            category: selectedCategory,
            sort_order: sortOrder++,
            width: thumbnailData?.width || null,
            height: thumbnailData?.height || null,
            duration_seconds: thumbnailData?.duration || null,
            file_size: file.size,
            processing_status: 'completed' // Basic upload, no server-side processing yet
          })
          .select()
          .single()

        if (dbError) throw dbError

        // Get signed URL for display
        let thumbnail_url = null
        if (thumbnailPath) {
          const { data: thumbUrl } = await supabase.storage
            .from('video-clips')
            .createSignedUrl(thumbnailPath, 3600)
          thumbnail_url = thumbUrl?.signedUrl
        }

        uploadedClips.push({
          ...clip,
          thumbnail_url
        })

        console.log(`Uploaded: ${file.name}`)
      } catch (err) {
        console.error(`Failed to upload ${file.name}:`, err)
      }
    }

    setClips([...clips, ...uploadedClips])
    setUploading(false)
    setUploadProgress({ current: 0, total: 0 })
  }, [galleryId, clips, selectedCategory])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/mp4': ['.mp4'],
      'video/quicktime': ['.mov'],
      'video/webm': ['.webm'],
      'video/x-msvideo': ['.avi']
    },
    disabled: uploading
  })

  const deleteClip = async (clipId) => {
    if (!confirm('Delete this video clip?')) return

    try {
      const clip = clips.find(c => c.id === clipId)
      
      // Delete from storage
      if (clip?.original_path) {
        await supabase.storage.from('video-clips').remove([clip.original_path])
      }
      if (clip?.thumbnail_path) {
        await supabase.storage.from('video-clips').remove([clip.thumbnail_path])
      }
      if (clip?.preview_path) {
        await supabase.storage.from('video-clips').remove([clip.preview_path])
      }

      // Delete from database
      await supabase.from('video_clips').delete().eq('id', clipId)

      setClips(clips.filter(c => c.id !== clipId))
    } catch (err) {
      console.error('Delete error:', err)
    }
  }

  const togglePublish = async () => {
    const newStatus = gallery.status === 'published' ? 'draft' : 'published'
    
    const { error } = await supabase
      .from('video_galleries')
      .update({ 
        status: newStatus,
        published_at: newStatus === 'published' ? new Date().toISOString() : null
      })
      .eq('id', galleryId)

    if (!error) {
      setGallery({ ...gallery, status: newStatus })
    }
  }

  const formatDuration = (seconds) => {
    if (!seconds) return '--:--'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <div className="p-6 text-center">
        <Loader2 className="w-8 h-8 text-red-500 animate-spin mx-auto" />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onBack}
          className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-400" />
        </button>
        <div className="flex-grow">
          <h1 className="text-2xl font-bold text-white">{gallery?.title}</h1>
          <p className="text-gray-400 text-sm">
            {gallery?.livestream_events?.title || 'No event linked'} • 
            ${(gallery?.price_per_clip / 100).toFixed(2)} per clip
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={togglePublish}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              gallery?.status === 'published'
                ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {gallery?.status === 'published' ? 'Unpublish' : 'Publish'}
          </button>
          {gallery?.status === 'published' && gallery?.slug && (
            <a
              href={`/video-gallery/${gallery.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-dark-700 hover:bg-dark-600 text-white rounded-lg"
            >
              <ExternalLink className="w-4 h-4" />
              View
            </a>
          )}
        </div>
      </div>

      {/* Category Selector */}
      <div className="bg-dark-800 border border-dark-700 rounded-xl p-4 mb-6">
        <label className="block text-gray-300 font-medium mb-2">Upload to Category</label>
        <div className="flex gap-2 flex-wrap mb-3">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === cat
                  ? 'bg-red-600 text-white'
                  : 'bg-dark-700 text-gray-400 hover:bg-dark-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="New category name..."
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            className="flex-1 bg-dark-900 border border-dark-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && newCategoryName.trim()) {
                const newCat = newCategoryName.trim()
                if (!categories.includes(newCat)) {
                  setCategories([...categories, newCat])
                  setSelectedCategory(newCat)
                  setNewCategoryName('')
                }
              }
            }}
          />
          <button
            onClick={() => {
              if (newCategoryName.trim()) {
                const newCat = newCategoryName.trim()
                if (!categories.includes(newCat)) {
                  setCategories([...categories, newCat])
                  setSelectedCategory(newCat)
                  setNewCategoryName('')
                }
              }
            }}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
          >
            Add Category
          </button>
        </div>
        <p className="text-gray-500 text-sm mt-2">
          Videos will be uploaded to: <span className="text-red-400 font-medium">{selectedCategory}</span>
        </p>
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
            <Video className="w-8 h-8 mx-auto mb-2" />
            Drop videos here...
          </div>
        ) : (
          <div>
            <Video className="w-8 h-8 text-gray-500 mx-auto mb-2" />
            <p className="text-gray-300 mb-1">Drag & drop videos here, or click to select</p>
            <p className="text-gray-500 text-sm">MP4, MOV, WebM, AVI</p>
          </div>
        )}
      </div>

      {/* Category Filter */}
      {clips.length > 0 && (
        <div className="mb-4 flex gap-2 items-center flex-wrap">
          <span className="text-gray-400 text-sm font-medium">Filter:</span>
          {['All', ...categories].map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                filterCategory === cat
                  ? 'bg-red-600 text-white'
                  : 'bg-dark-800 text-gray-400 hover:bg-dark-700'
              }`}
            >
              {cat}
              <span className="ml-1.5 text-xs opacity-70">
                ({cat === 'All' 
                  ? clips.length 
                  : clips.filter(c => (c.category || 'Main') === cat).length
                })
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Clip Grid */}
      {clips.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          No video clips yet. Upload some videos to get started!
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {clips
            .filter(clip => filterCategory === 'All' || (clip.category || 'Main') === filterCategory)
            .map(clip => (
            <div key={clip.id} className="relative group bg-dark-800 rounded-lg overflow-hidden">
              <div className="aspect-video bg-dark-900 flex items-center justify-center">
                {clip.thumbnail_url ? (
                  <img
                    src={clip.thumbnail_url}
                    alt={clip.filename}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Video className="w-12 h-12 text-gray-600" />
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button className="bg-white/20 hover:bg-white/30 p-2 rounded-full">
                    <Play className="w-6 h-6 text-white" />
                  </button>
                  <button
                    onClick={() => deleteClip(clip.id)}
                    className="bg-red-600 hover:bg-red-700 p-2 rounded-full"
                  >
                    <Trash2 className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
              <div className="p-2">
                <p className="text-sm text-white truncate">{clip.filename}</p>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-xs text-gray-500">{formatDuration(clip.duration_seconds)}</span>
                  {clip.category && clip.category !== 'Main' && (
                    <span className="text-xs bg-red-600 text-white px-2 py-0.5 rounded">
                      {clip.category}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Gallery Stats */}
      <div className="mt-8 bg-dark-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Gallery Settings</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-400">Price per Clip:</span>
            <span className="text-white ml-2">${(gallery?.price_per_clip / 100).toFixed(2)}</span>
          </div>
          {gallery?.package_enabled && gallery?.package_price && (
            <div>
              <span className="text-gray-400">Package Price:</span>
              <span className="text-white ml-2">${(gallery.package_price / 100).toFixed(2)}</span>
            </div>
          )}
          <div>
            <span className="text-gray-400">Total Clips:</span>
            <span className="text-white ml-2">{clips.length}</span>
          </div>
          <div>
            <span className="text-gray-400">Status:</span>
            <span className={`ml-2 ${gallery?.status === 'published' ? 'text-green-400' : 'text-yellow-400'}`}>
              {gallery?.status}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
