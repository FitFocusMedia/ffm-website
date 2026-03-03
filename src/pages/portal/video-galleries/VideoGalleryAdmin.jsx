import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Video, Plus, Trash2, Upload, Eye, EyeOff, Loader2, 
  CheckCircle2, XCircle, Clock, FolderOpen, DollarSign
} from 'lucide-react'

const API_URL = 'https://clawdbots-mini.tailcfdc1.ts.net:5231'

export default function VideoGalleryAdmin() {
  const navigate = useNavigate()
  const [galleries, setGalleries] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedGallery, setSelectedGallery] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0, filename: '' })
  const fileInputRef = useRef(null)

  useEffect(() => {
    loadGalleries()
  }, [])

  const loadGalleries = async () => {
    try {
      const res = await fetch(`${API_URL}/api/video-galleries`)
      const data = await res.json()
      setGalleries(data)
    } catch (err) {
      console.error('Failed to load galleries:', err)
    } finally {
      setLoading(false)
    }
  }

  const createGallery = async (data) => {
    try {
      const res = await fetch(`${API_URL}/api/video-galleries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      const gallery = await res.json()
      setGalleries([gallery, ...galleries])
      setShowCreateModal(false)
      setSelectedGallery(gallery)
    } catch (err) {
      console.error('Failed to create gallery:', err)
    }
  }

  const deleteGallery = async (id) => {
    if (!confirm('Delete this gallery and all its videos?')) return
    try {
      await fetch(`${API_URL}/api/video-galleries/${id}`, { method: 'DELETE' })
      setGalleries(galleries.filter(g => g.id !== id))
      if (selectedGallery?.id === id) setSelectedGallery(null)
    } catch (err) {
      console.error('Failed to delete gallery:', err)
    }
  }

  const togglePublish = async (gallery) => {
    try {
      const res = await fetch(`${API_URL}/api/video-galleries/${gallery.id}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publish: gallery.status !== 'published' })
      })
      const updated = await res.json()
      setGalleries(galleries.map(g => g.id === updated.id ? updated : g))
      if (selectedGallery?.id === updated.id) setSelectedGallery(updated)
    } catch (err) {
      console.error('Failed to toggle publish:', err)
    }
  }

  const uploadVideos = async (files, galleryId, category = 'Main') => {
    setUploading(true)
    setUploadProgress({ current: 0, total: files.length, filename: '' })
    
    const formData = new FormData()
    for (const file of files) {
      formData.append('videos', file)
    }
    formData.append('category', category)
    
    try {
      setUploadProgress({ current: 0, total: files.length, filename: 'Uploading...' })
      
      const res = await fetch(`${API_URL}/api/video-galleries/${galleryId}/clips`, {
        method: 'POST',
        body: formData
      })
      
      const result = await res.json()
      
      // Refresh gallery
      const galleryRes = await fetch(`${API_URL}/api/video-galleries/${galleryId}`)
      const updatedGallery = await galleryRes.json()
      setSelectedGallery(updatedGallery)
      
      if (result.errors?.length > 0) {
        alert(`Processed ${result.processed} videos. ${result.failed} failed:\n${result.errors.map(e => e.filename).join('\n')}`)
      }
    } catch (err) {
      console.error('Upload failed:', err)
      alert('Upload failed: ' + err.message)
    } finally {
      setUploading(false)
      setUploadProgress({ current: 0, total: 0, filename: '' })
    }
  }

  const deleteClip = async (galleryId, clipId) => {
    if (!confirm('Delete this video clip?')) return
    try {
      await fetch(`${API_URL}/api/video-galleries/${galleryId}/clips/${clipId}`, { method: 'DELETE' })
      setSelectedGallery({
        ...selectedGallery,
        clips: selectedGallery.clips.filter(c => c.id !== clipId)
      })
    } catch (err) {
      console.error('Failed to delete clip:', err)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <Video className="w-8 h-8 text-red-500" />
            <h1 className="text-2xl font-bold">Video Galleries</h1>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition"
          >
            <Plus className="w-5 h-5" />
            New Gallery
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 flex gap-4">
        {/* Gallery List */}
        <div className="w-80 flex-shrink-0">
          <div className="bg-gray-800 rounded-lg p-4">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <FolderOpen className="w-5 h-5" />
              Galleries
            </h2>
            
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : galleries.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No galleries yet</p>
            ) : (
              <div className="space-y-2">
                {galleries.map(gallery => (
                  <div
                    key={gallery.id}
                    onClick={() => setSelectedGallery(gallery)}
                    className={`p-3 rounded-lg cursor-pointer transition ${
                      selectedGallery?.id === gallery.id
                        ? 'bg-red-600/20 border border-red-500'
                        : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium truncate">{gallery.title}</span>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        gallery.status === 'published' 
                          ? 'bg-green-600' 
                          : 'bg-gray-600'
                      }`}>
                        {gallery.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-400 mt-1">
                      {gallery.video_clips?.length || 0} clips • ${(gallery.price_per_clip / 100).toFixed(2)} each
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Gallery Detail */}
        <div className="flex-1">
          {selectedGallery ? (
            <GalleryDetail
              gallery={selectedGallery}
              onUpload={(files, category) => uploadVideos(files, selectedGallery.id, category)}
              onDelete={() => deleteGallery(selectedGallery.id)}
              onTogglePublish={() => togglePublish(selectedGallery)}
              onDeleteClip={(clipId) => deleteClip(selectedGallery.id, clipId)}
              uploading={uploading}
              uploadProgress={uploadProgress}
              fileInputRef={fileInputRef}
            />
          ) : (
            <div className="bg-gray-800 rounded-lg p-8 text-center text-gray-500">
              <Video className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Select a gallery or create a new one</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <CreateGalleryModal
          onClose={() => setShowCreateModal(false)}
          onCreate={createGallery}
        />
      )}
    </div>
  )
}

function GalleryDetail({ gallery, onUpload, onDelete, onTogglePublish, onDeleteClip, uploading, uploadProgress, fileInputRef }) {
  const [category, setCategory] = useState('Main')
  const categories = [...new Set(gallery.clips?.map(c => c.category) || ['Main'])]
  if (!categories.includes('Main')) categories.unshift('Main')

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files)
    if (files.length > 0) {
      onUpload(files, category)
    }
    e.target.value = ''
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files).filter(f => 
      f.type.startsWith('video/') || f.name.match(/\.(mp4|mov|avi|webm|m4v)$/i)
    )
    if (files.length > 0) {
      onUpload(files, category)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="w-4 h-4 text-green-500" />
      case 'processing': return <Loader2 className="w-4 h-4 animate-spin text-yellow-500" />
      case 'failed': return <XCircle className="w-4 h-4 text-red-500" />
      default: return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold">{gallery.title}</h2>
          {gallery.description && (
            <p className="text-gray-400 mt-1">{gallery.description}</p>
          )}
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
            <span className="flex items-center gap-1">
              <DollarSign className="w-4 h-4" />
              ${(gallery.price_per_clip / 100).toFixed(2)} per clip
            </span>
            {gallery.package_enabled && (
              <span>Package: ${(gallery.package_price / 100).toFixed(2)}</span>
            )}
            {gallery.slug && (
              <a 
                href={`/#/video-gallery/${gallery.slug}`}
                target="_blank"
                className="text-red-400 hover:text-red-300"
              >
                /video-gallery/{gallery.slug}
              </a>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onTogglePublish}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition ${
              gallery.status === 'published'
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-gray-600 hover:bg-gray-500'
            }`}
          >
            {gallery.status === 'published' ? (
              <>
                <EyeOff className="w-4 h-4" /> Unpublish
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" /> Publish
              </>
            )}
          </button>
          <button
            onClick={onDelete}
            className="p-2 bg-red-600/20 hover:bg-red-600/40 text-red-400 rounded-lg transition"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Upload Area */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition ${
          uploading 
            ? 'border-yellow-500 bg-yellow-500/10' 
            : 'border-gray-600 hover:border-red-500 hover:bg-red-500/5'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="video/*,.mp4,.mov,.avi,.webm,.m4v"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        {uploading ? (
          <div>
            <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-yellow-500" />
            <p className="text-lg font-medium">Processing videos...</p>
            <p className="text-gray-400 mt-2">
              This may take a while for large files (watermarking + compression)
            </p>
          </div>
        ) : (
          <>
            <Upload className="w-12 h-12 mx-auto mb-4 text-gray-500" />
            <p className="text-lg mb-2">Drag & drop videos here</p>
            <p className="text-gray-400 mb-4">MP4, MOV, AVI, WebM, M4V • Up to 2GB each</p>
            
            <div className="flex items-center justify-center gap-4">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="bg-gray-700 border border-gray-600 rounded px-3 py-2"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
                <option value="__new__">+ New Category</option>
              </select>
              
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded-lg transition"
              >
                Select Files
              </button>
            </div>
          </>
        )}
      </div>

      {/* Clips Grid */}
      {gallery.clips && gallery.clips.length > 0 && (
        <div className="mt-6">
          <h3 className="font-semibold mb-4">{gallery.clips.length} Video Clips</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {gallery.clips.map(clip => (
              <div key={clip.id} className="bg-gray-700 rounded-lg overflow-hidden group">
                <div className="aspect-video bg-gray-800 relative">
                  {clip.thumbnail_path ? (
                    <img
                      src={clip.thumbnail_url || `${API_URL}/thumb/${clip.id}`}
                      alt={clip.filename}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Video className="w-8 h-8 text-gray-600" />
                    </div>
                  )}
                  
                  {/* Status badge */}
                  <div className="absolute top-2 right-2">
                    {getStatusIcon(clip.processing_status)}
                  </div>
                  
                  {/* Duration */}
                  {clip.duration_seconds && (
                    <div className="absolute bottom-2 right-2 bg-black/70 px-2 py-0.5 rounded text-xs">
                      {Math.floor(clip.duration_seconds / 60)}:{String(Math.floor(clip.duration_seconds % 60)).padStart(2, '0')}
                    </div>
                  )}
                  
                  {/* Delete button */}
                  <button
                    onClick={() => onDeleteClip(clip.id)}
                    className="absolute top-2 left-2 p-1 bg-red-600 rounded opacity-0 group-hover:opacity-100 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="p-2">
                  <p className="text-sm truncate" title={clip.filename}>
                    {clip.title || clip.filename}
                  </p>
                  <p className="text-xs text-gray-400">
                    {clip.category} • {clip.file_size ? `${(clip.file_size / 1024 / 1024).toFixed(1)} MB` : 'Processing...'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function CreateGalleryModal({ onClose, onCreate }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [pricePerClip, setPricePerClip] = useState('15.00')
  const [packageEnabled, setPackageEnabled] = useState(false)
  const [packagePrice, setPackagePrice] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    onCreate({
      title,
      description,
      price_per_clip: Math.round(parseFloat(pricePerClip) * 100),
      package_enabled: packageEnabled,
      package_price: packageEnabled && packagePrice ? Math.round(parseFloat(packagePrice) * 100) : null
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Create Video Gallery</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="e.g., QBJJC March 2026"
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
            />
          </div>
          
          <div>
            <label className="block text-sm text-gray-400 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
              rows={2}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
            />
          </div>
          
          <div>
            <label className="block text-sm text-gray-400 mb-1">Price per Clip ($AUD)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={pricePerClip}
              onChange={(e) => setPricePerClip(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="packageEnabled"
              checked={packageEnabled}
              onChange={(e) => setPackageEnabled(e.target.checked)}
              className="w-4 h-4"
            />
            <label htmlFor="packageEnabled" className="text-sm">Enable "Buy All" package option</label>
          </div>
          
          {packageEnabled && (
            <div>
              <label className="block text-sm text-gray-400 mb-1">Package Price ($AUD)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={packagePrice}
                onChange={(e) => setPackagePrice(e.target.value)}
                placeholder="e.g., 99.00"
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
              />
            </div>
          )}
          
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition"
            >
              Create Gallery
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
