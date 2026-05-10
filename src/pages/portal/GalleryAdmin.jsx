import { useState, useEffect, useCallback } from 'react'
import { Plus, Trash2, ArrowLeft, Loader2, Check, ExternalLink, Upload, Image, Building2, Calendar } from 'lucide-react'
import { supabase } from '../../lib/supabase'

// Apply watermark using canvas (client-side) - also resizes to max 1440px
async function applyWatermark(file, maxSize = 1440) {
  return new Promise((resolve) => {
    const img = new window.Image()
    img.onload = () => {
      // Resize to max dimension for storage savings + discourage screenshots
      let width = img.width
      let height = img.height
      const maxDimension = Math.max(width, height)
      
      if (maxDimension > maxSize) {
        const ratio = maxSize / maxDimension
        width = Math.round(img.width * ratio)
        height = Math.round(img.height * ratio)
      }
      
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      
      ctx.drawImage(img, 0, 0, width, height)
      
      const text = 'FIT FOCUS MEDIA'
      // Use larger dimension for consistent sizing across orientations
      const maxDim = Math.max(width, height)
      const fontSize = Math.max(Math.floor(maxDim / 20), 40)
      ctx.font = `bold ${fontSize}px Arial`
      ctx.textAlign = 'center'
      
      ctx.save()
      ctx.translate(width / 2, height / 2)
      ctx.rotate(-30 * Math.PI / 180)
      
      // Spacing to prevent text overlap
      const spacingY = fontSize * 4
      const spacingX = fontSize * 10
      
      for (let y = -height; y < height * 2; y += spacingY) {
        for (let x = -width; x < width * 2; x += spacingX) {
          // Dark shadow for visibility on light backgrounds
          ctx.fillStyle = 'rgba(0, 0, 0, 0.4)'
          ctx.fillText(text, x + 2, y + 2)
          // White text with higher opacity
          ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
          ctx.fillText(text, x, y)
        }
      }
      ctx.restore()
      
      // Lower quality for watermarked (0.7) - saves storage, discourages screenshots
      canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.7)
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

// Video uploads now use Bunny Stream via Supabase Edge Function (works on production)
// Photos use Supabase Storage directly
const EDGE_FUNCTION_URL = 'https://gonalgubgldgpkcekaxe.supabase.co/functions/v1/gallery-video-upload'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdvbmFsZ3ViZ2xkZ3BrY2VrYXhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4NTk3NDIsImV4cCI6MjA4NjQzNTc0Mn0.GuvFAgWtB0bJ_yf_6NKfPK3Gv-vJH7WhHcJFzvqm9Ew'

function GalleryEditor({ gallery, organization, onBack }) {
  const [currentGallery, setCurrentGallery] = useState(gallery)
  const [photos, setPhotos] = useState([])
  const [clips, setClips] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0, type: 'photos' })
  const [dragActive, setDragActive] = useState(false)
  const [selectedPhotos, setSelectedPhotos] = useState(new Set())
  const [selectedClips, setSelectedClips] = useState(new Set())
  const [deleting, setDeleting] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('photos') // 'photos' or 'videos'
  
  // Category/Division management - now using gallery_categories table
  const [categories, setCategories] = useState([])
  const [selectedCategoryId, setSelectedCategoryId] = useState(null) // null = show all
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [editingCategory, setEditingCategory] = useState(null)
  const [movingToCategory, setMovingToCategory] = useState(false)
  
  // Filter photos by search query AND category
  const filteredPhotos = photos.filter(p => {
    const matchesSearch = !searchQuery || p.filename.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = !selectedCategoryId || p.category_id === selectedCategoryId
    return matchesSearch && matchesCategory
  })
  
  // Filter clips by search query AND category
  const filteredClips = clips.filter(c => {
    const matchesSearch = !searchQuery || c.filename.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = !selectedCategoryId || c.category_id === selectedCategoryId
    return matchesSearch && matchesCategory
  })
  
  // Load categories from database
  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('gallery_categories')
        .select('*')
        .eq('gallery_id', gallery.id)
        .order('position', { ascending: true })
      
      if (error) throw error
      setCategories(data || [])
      
      // If no categories exist, auto-select null (all)
      // If categories exist and none selected, select the first one
      if (data && data.length > 0 && !selectedCategoryId) {
        setSelectedCategoryId(data[0].id)
      }
    } catch (err) {
      console.error('Load categories error:', err)
    }
  }
  
  // Create new category
  const createCategory = async () => {
    if (!newCategoryName.trim()) return
    
    try {
      const position = categories.length
      const { data, error } = await supabase
        .from('gallery_categories')
        .insert({
          gallery_id: gallery.id,
          name: newCategoryName.trim(),
          position
        })
        .select()
        .single()
      
      if (error) throw error
      
      setCategories([...categories, data])
      setSelectedCategoryId(data.id) // Switch to new category
      setNewCategoryName('')
      setShowCategoryModal(false)
    } catch (err) {
      console.error('Create category error:', err)
      alert('Failed to create category: ' + err.message)
    }
  }
  
  // Rename category
  const renameCategory = async (categoryId, newName) => {
    if (!newName.trim()) return
    
    try {
      const { error } = await supabase
        .from('gallery_categories')
        .update({ name: newName.trim() })
        .eq('id', categoryId)
      
      if (error) throw error
      
      setCategories(categories.map(c => 
        c.id === categoryId ? { ...c, name: newName.trim() } : c
      ))
      setEditingCategory(null)
    } catch (err) {
      console.error('Rename category error:', err)
      alert('Failed to rename category: ' + err.message)
    }
  }
  
  // Move category left/right (swap positions)
  const moveCategory = async (categoryId, direction) => {
    const currentIndex = categories.findIndex(c => c.id === categoryId)
    if (currentIndex === -1) return
    
    const newIndex = currentIndex + direction
    if (newIndex < 0 || newIndex >= categories.length) return
    
    // Swap the two categories
    const newCategories = [...categories]
    const temp = newCategories[currentIndex]
    newCategories[currentIndex] = newCategories[newIndex]
    newCategories[newIndex] = temp
    
    // Update positions
    newCategories[currentIndex].position = currentIndex
    newCategories[newIndex].position = newIndex
    
    setCategories(newCategories)
    
    try {
      // Update both categories in the database
      await supabase
        .from('gallery_categories')
        .update({ position: currentIndex })
        .eq('id', newCategories[currentIndex].id)
      
      await supabase
        .from('gallery_categories')
        .update({ position: newIndex })
        .eq('id', newCategories[newIndex].id)
    } catch (err) {
      console.error('Move category error:', err)
      // Revert on error
      loadCategories()
    }
  }

  // Delete category (moves photos to uncategorized)
  const deleteCategory = async (categoryId) => {
    const category = categories.find(c => c.id === categoryId)
    const photoCount = photos.filter(p => p.category_id === categoryId).length
    
    if (!confirm(`Delete "${category?.name}"? ${photoCount} photo(s) will be moved to uncategorized.`)) return
    
    try {
      // Clear category_id from photos in this category
      await supabase
        .from('gallery_photos')
        .update({ category_id: null })
        .eq('category_id', categoryId)
      
      // Delete the category
      const { error } = await supabase
        .from('gallery_categories')
        .delete()
        .eq('id', categoryId)
      
      if (error) throw error
      
      // Update local state
      setPhotos(photos.map(p => 
        p.category_id === categoryId ? { ...p, category_id: null } : p
      ))
      setCategories(categories.filter(c => c.id !== categoryId))
      
      // If deleted category was selected, switch to first available or null
      if (selectedCategoryId === categoryId) {
        const remaining = categories.filter(c => c.id !== categoryId)
        setSelectedCategoryId(remaining.length > 0 ? remaining[0].id : null)
      }
    } catch (err) {
      console.error('Delete category error:', err)
      alert('Failed to delete category: ' + err.message)
    }
  }
  
  // Move selected photos to a category
  const moveSelectedToCategory = async (targetCategoryId) => {
    if (selectedPhotos.size === 0) return
    setMovingToCategory(true)
    
    try {
      const ids = Array.from(selectedPhotos)
      const { error } = await supabase
        .from('gallery_photos')
        .update({ category_id: targetCategoryId })
        .in('id', ids)
      
      if (error) throw error
      
      // Update local state
      setPhotos(photos.map(p => 
        selectedPhotos.has(p.id) ? { ...p, category_id: targetCategoryId } : p
      ))
      setSelectedPhotos(new Set())
    } catch (err) {
      console.error('Move to category error:', err)
      alert('Failed to move photos: ' + err.message)
    } finally {
      setMovingToCategory(false)
    }
  }

  // Move selected videos/clips to a category
  const moveSelectedClipsToCategory = async (targetCategoryId) => {
    if (selectedClips.size === 0) return
    setMovingToCategory(true)
    
    try {
      const ids = Array.from(selectedClips)
      const { error } = await supabase
        .from('gallery_clips')
        .update({ category_id: targetCategoryId })
        .in('id', ids)
      
      if (error) throw error
      
      // Update local state
      setClips(clips.map(c => 
        selectedClips.has(c.id) ? { ...c, category_id: targetCategoryId } : c
      ))
      setSelectedClips(new Set())
    } catch (err) {
      console.error('Move clips to category error:', err)
      alert('Failed to move videos: ' + err.message)
    } finally {
      setMovingToCategory(false)
    }
  }

  useEffect(() => {
    loadCategories()
    loadPhotos()
    loadClips()
  }, [gallery.id])

  // Auto-poll for processing video status updates
  useEffect(() => {
    const processingClips = clips.filter(c => c.processing_status === 'processing')
    if (processingClips.length === 0) return

    const pollInterval = setInterval(async () => {
      console.log(`Polling status for ${processingClips.length} processing clips...`)
      
      for (const clip of processingClips) {
        try {
          const res = await fetch(EDGE_FUNCTION_URL, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
            },
            body: JSON.stringify({ action: 'status', clip_id: clip.id })
          })
          
          if (res.ok) {
            const data = await res.json()
            if (data.status === 'ready' || data.status === 'errored') {
              // Reload clips to get updated data
              loadClips()
              break // Stop polling after finding an update
            }
          }
        } catch (err) {
          console.error('Poll status error:', err)
        }
      }
    }, 10000) // Poll every 10 seconds

    return () => clearInterval(pollInterval)
  }, [clips])

  const loadPhotos = async () => {
    try {
      // Fetch ALL photos using pagination (Supabase limits to 1000 per request)
      let allPhotos = []
      let offset = 0
      const batchSize = 1000
      
      while (true) {
        const { data: batch, error: batchError } = await supabase
          .from('gallery_photos')
          .select('*')
          .eq('gallery_id', gallery.id)
          .order('sort_order', { ascending: true })
          .range(offset, offset + batchSize - 1)
        
        if (batchError) throw batchError
        if (!batch || batch.length === 0) break
        
        allPhotos = [...allPhotos, ...batch]
        if (batch.length < batchSize) break // Last batch
        offset += batchSize
      }

      // Get signed URLs for thumbnails
      const photosWithUrls = await Promise.all(allPhotos.map(async (photo) => {
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

  const loadClips = async () => {
    try {
      // Load clips from Supabase (works on production)
      const { data, error } = await supabase
        .from('gallery_clips')
        .select('*')
        .eq('gallery_id', gallery.id)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      // Add MUX thumbnail URLs for clips that have playback IDs
      const clipsWithThumbnails = (data || []).map(clip => ({
        ...clip,
        thumbnail_url: clip.mux_playback_id 
          ? `https://image.mux.com/${clip.mux_playback_id}/thumbnail.jpg`
          : clip.thumbnail_url
      }))
      
      setClips(clipsWithThumbnails)
    } catch (err) {
      console.error('Load clips error:', err)
    }
  }

  const handleFiles = async (files) => {
    const allFiles = Array.from(files)
    const imageFiles = allFiles.filter(f => 
      f.type.startsWith('image/') && f.size <= 50 * 1024 * 1024
    )
    const videoFiles = allFiles.filter(f => 
      (f.type.startsWith('video/') || f.name.match(/\.(mp4|mov|avi|webm|m4v)$/i)) && 
      f.size <= 2 * 1024 * 1024 * 1024
    )
    
    // Handle video uploads via MUX (works on production) - PARALLEL PROCESSING
    if (videoFiles.length > 0) {
      setActiveTab('videos')
      setUploading(true)
      
      // Calculate total bytes for ETA estimation
      const totalBytes = videoFiles.reduce((sum, f) => sum + f.size, 0)
      const startTime = Date.now()
      let completedBytes = 0
      
      setUploadProgress({ 
        current: 0, 
        total: videoFiles.length, 
        type: 'videos',
        totalBytes,
        completedBytes: 0,
        speed: 0,
        eta: null
      })
      
      const uploadedClips = []
      const CONCURRENCY_LIMIT = 4 // Process 4 videos at a time
      let completedCount = 0
      
      // Helper to format bytes
      const formatBytes = (bytes) => {
        if (bytes < 1024) return bytes + ' B'
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
        if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
        return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB'
      }
      
      // Helper to format time
      const formatEta = (seconds) => {
        if (seconds < 60) return `${Math.round(seconds)}s`
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${Math.round(seconds % 60)}s`
        return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`
      }
      
      // Helper to process a single video
      const processVideo = async (file) => {
        try {
          // 1. Upload original to Supabase Storage (for purchased downloads)
          const ext = file.name.split('.').pop() || 'mp4'
          const baseName = file.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_')
          const timestamp = Date.now() + Math.random().toString(36).slice(2, 7) // Unique per parallel upload
          const originalPath = `${gallery.id}/videos/originals/${baseName}_${timestamp}.${ext}`
          
          const { error: uploadError } = await supabase.storage
            .from('galleries')
            .upload(originalPath, file, { contentType: file.type })
          
          if (uploadError) throw new Error(`Storage upload failed: ${uploadError.message}`)
          
          // 2. Get signed URL for MUX to access (1 hour expiry)
          const { data: signedUrlData, error: signedError } = await supabase.storage
            .from('galleries')
            .createSignedUrl(originalPath, 3600)
          
          if (signedError) throw new Error(`Signed URL failed: ${signedError.message}`)
          
          // 3. Call Edge Function to create MUX asset with watermark
          const res = await fetch(EDGE_FUNCTION_URL, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
            },
            body: JSON.stringify({
              action: 'create',
              gallery_id: gallery.id,
              video_url: signedUrlData.signedUrl,
              filename: file.name,
              file_size: file.size,
              category_id: selectedCategoryId // Upload to currently selected category
            })
          })
          
          const result = await res.json()
          
          if (!res.ok || result.error) {
            throw new Error(result.error || 'MUX processing failed')
          }
          
          // 4. Update clip with original_path and category_id for download after purchase
          if (result.clip) {
            await supabase
              .from('gallery_clips')
              .update({ 
                original_path: originalPath,
                category_id: selectedCategoryId // Assign to selected category
              })
              .eq('id', result.clip.id)
            
            return {
              ...result.clip,
              original_path: originalPath,
              category_id: selectedCategoryId,
              fileSize: file.size, // Track for progress
              // MUX thumbnail (will be available after processing)
              thumbnail_url: result.clip.mux_playback_id 
                ? `https://image.mux.com/${result.clip.mux_playback_id}/thumbnail.jpg`
                : null
            }
          }
          return { fileSize: file.size } // Still track size even if no clip returned
        } catch (err) {
          console.error(`Video upload error (${file.name}):`, err)
          return { error: true, filename: file.name, message: err.message, fileSize: file.size }
        } finally {
          // Update progress after each video completes
          completedCount++
          completedBytes += file.size
          
          // Calculate speed and ETA
          const elapsedSeconds = (Date.now() - startTime) / 1000
          const speed = elapsedSeconds > 0 ? completedBytes / elapsedSeconds : 0
          const remainingBytes = totalBytes - completedBytes
          const eta = speed > 0 ? remainingBytes / speed : null
          
          setUploadProgress({ 
            current: completedCount, 
            total: videoFiles.length, 
            type: 'videos', 
            filename: `Processing ${CONCURRENCY_LIMIT} videos in parallel...`,
            totalBytes,
            completedBytes,
            speed,
            eta,
            speedDisplay: formatBytes(speed) + '/s',
            etaDisplay: eta ? formatEta(eta) : 'Calculating...',
            percentBytes: Math.round((completedBytes / totalBytes) * 100)
          })
        }
      }
      
      // Process videos in batches of CONCURRENCY_LIMIT
      for (let i = 0; i < videoFiles.length; i += CONCURRENCY_LIMIT) {
        const batch = videoFiles.slice(i, i + CONCURRENCY_LIMIT)
        const results = await Promise.all(batch.map(processVideo))
        
        // Collect successful uploads
        for (const result of results) {
          if (result && !result.error) {
            uploadedClips.push(result)
          } else if (result?.error) {
            // Show error but continue with other uploads
            console.error(`Failed: ${result.filename} - ${result.message}`)
          }
        }
      }
      
      // Show any errors at the end
      const failedCount = videoFiles.length - uploadedClips.length
      if (failedCount > 0) {
        alert(`${failedCount} video(s) failed to upload. Check console for details.`)
      }
      
      if (uploadedClips.length > 0) {
        setClips([...clips, ...uploadedClips])
      }
      
      setUploading(false)
      setUploadProgress({ current: 0, total: 0, type: 'photos' })
    }
    
    if (imageFiles.length === 0) return

    setUploading(true)
    setUploadProgress({ current: 0, total: imageFiles.length, type: 'photos' })

    const uploadedPhotos = []
    let sortOrder = photos.length

    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i]
      setUploadProgress({ current: i + 1, total: imageFiles.length })

      try {
        const photoId = crypto.randomUUID()
        const ext = file.name.split('.').pop() || 'jpg'
        // Keep original filename (sanitized) for storage paths
        const baseName = file.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_')
        const timestamp = Date.now()
        const safeFileName = `${baseName}_${timestamp}`

        const watermarkedBlob = await applyWatermark(file)
        const thumbnailBlob = await createThumbnail(file)

        const originalPath = `${gallery.id}/originals/${safeFileName}.${ext}`
        const watermarkedPath = `${gallery.id}/watermarked/${safeFileName}_wm.jpg`
        const thumbnailPath = `${gallery.id}/thumbnails/${safeFileName}_thumb.jpg`

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
            file_size: file.size,
            category_id: selectedCategoryId // Upload to currently selected category
          })
          .select()
          .single()

        if (dbError) throw dbError

        const { data: thumbUrl } = await supabase.storage
          .from('galleries')
          .createSignedUrl(thumbnailPath, 3600)

        uploadedPhotos.push({ ...photo, thumbnail_url: thumbUrl?.signedUrl })
        
        // Incremental refresh: update UI every 10 uploads so thumbnails appear progressively
        if (uploadedPhotos.length % 10 === 0) {
          setPhotos(prev => [...prev, ...uploadedPhotos.splice(0)])
        }
      } catch (err) {
        console.error(`Failed to upload ${file.name}:`, err)
        alert(`Failed to upload ${file.name}: ${err.message}`)
      }
    }

    // Add any remaining photos not yet added
    if (uploadedPhotos.length > 0) {
      setPhotos(prev => [...prev, ...uploadedPhotos])
    }
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
      setSelectedPhotos(prev => { prev.delete(photoId); return new Set(prev) })
    } catch (err) {
      console.error('Delete photo error:', err)
    }
  }

  // Selection functions
  const toggleSelect = (photoId) => {
    setSelectedPhotos(prev => {
      const newSet = new Set(prev)
      if (newSet.has(photoId)) {
        newSet.delete(photoId)
      } else {
        newSet.add(photoId)
      }
      return newSet
    })
  }

  const selectAll = () => setSelectedPhotos(new Set(filteredPhotos.map(p => p.id)))
  const deselectAll = () => setSelectedPhotos(new Set())
  
  // Video/clip select all
  const selectAllClips = () => setSelectedClips(new Set(filteredClips.map(c => c.id)))
  const deselectAllClips = () => setSelectedClips(new Set())

  const deleteSelected = async () => {
    if (selectedPhotos.size === 0) return
    if (!confirm(`Delete ${selectedPhotos.size} selected photos?`)) return

    setDeleting(true)
    try {
      const toDelete = photos.filter(p => selectedPhotos.has(p.id))
      
      // Delete from storage
      const allPaths = toDelete.flatMap(p => 
        [p.original_path, p.watermarked_path, p.thumbnail_path].filter(Boolean)
      )
      await supabase.storage.from('galleries').remove(allPaths)
      
      // Delete from DB
      const ids = toDelete.map(p => p.id)
      await supabase.from('gallery_photos').delete().in('id', ids)

      setPhotos(photos.filter(p => !selectedPhotos.has(p.id)))
      setSelectedPhotos(new Set())
    } catch (err) {
      console.error('Delete selected error:', err)
      alert('Failed to delete some photos')
    } finally {
      setDeleting(false)
    }
  }

  const updateGallery = async (updates) => {
    try {
      console.log('Updating gallery with:', updates)
      const { data, error } = await supabase
        .from('galleries')
        .update(updates)
        .eq('id', gallery.id)
        .select()
        .single()

      if (error) {
        console.error('Supabase update error:', error)
        alert(`Failed to save: ${error.message}`)
        throw error
      }
      console.log('Update successful:', data)
      setCurrentGallery(data)
    } catch (err) {
      console.error('Update gallery error:', err)
      alert(`Update failed: ${err.message}`)
    }
  }

  const publishGallery = () => updateGallery({ status: 'published', published_at: new Date().toISOString() })
  const unpublishGallery = () => updateGallery({ status: 'draft' })

  const deleteClip = async (clipId) => {
    if (!confirm('Delete this video clip?')) return
    try {
      // Delete via Edge Function (handles MUX + Storage + DB)
      const res = await fetch(EDGE_FUNCTION_URL, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({ action: 'delete', clip_id: clipId })
      })
      
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Delete failed')
      }
      
      setClips(clips.filter(c => c.id !== clipId))
    } catch (err) {
      console.error('Delete clip error:', err)
      alert('Failed to delete clip: ' + err.message)
    }
  }

  const deleteSelectedClips = async () => {
    if (selectedClips.size === 0) return
    if (!confirm(`Delete ${selectedClips.size} selected video clips?`)) return
    
    setDeleting(true)
    try {
      for (const clipId of selectedClips) {
        await fetch(EDGE_FUNCTION_URL, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
          },
          body: JSON.stringify({ action: 'delete', clip_id: clipId })
        })
      }
      setClips(clips.filter(c => !selectedClips.has(c.id)))
      setSelectedClips(new Set())
    } catch (err) {
      console.error('Delete selected clips error:', err)
      alert('Failed to delete some clips')
    } finally {
      setDeleting(false)
    }
  }

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
        onClick={() => !uploading && document.getElementById('media-upload')?.click()}
      >
        <input
          id="media-upload"
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime,video/webm,.mov,.mp4,.avi,.webm,.m4v"
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
        {uploading ? (
          <div>
            <Loader2 className="w-8 h-8 text-red-500 animate-spin mx-auto mb-2" />
            <div className="text-white mb-2">
              {uploadProgress.type === 'videos' 
                ? `Processing video ${uploadProgress.current} of ${uploadProgress.total}...`
                : `Uploading ${uploadProgress.current} of ${uploadProgress.total}...`
              }
            </div>
            {uploadProgress.type === 'videos' && uploadProgress.filename && (
              <p className="text-gray-300 text-sm mb-2 truncate max-w-md mx-auto">{uploadProgress.filename}</p>
            )}
            {/* Progress bar for both photos and videos */}
            {uploadProgress.total > 0 && (
              <div className="w-64 mx-auto bg-dark-700 rounded-full h-2 mb-2">
                <div
                  className="bg-red-600 h-2 rounded-full transition-all"
                  style={{ width: `${uploadProgress.percentBytes || (uploadProgress.current / uploadProgress.total) * 100}%` }}
                />
              </div>
            )}
            {/* Speed and ETA for video uploads */}
            {uploadProgress.type === 'videos' && uploadProgress.speedDisplay && (
              <div className="flex justify-center gap-4 text-sm mb-2">
                <span className="text-green-400">⚡ {uploadProgress.speedDisplay}</span>
                <span className="text-blue-400">⏱ ETA: {uploadProgress.etaDisplay}</span>
                {uploadProgress.percentBytes && (
                  <span className="text-gray-400">{uploadProgress.percentBytes}%</span>
                )}
              </div>
            )}
            {uploadProgress.type === 'videos' && (
              <p className="text-gray-400 text-sm">Processing 4 videos in parallel • Watermarking + compression</p>
            )}
          </div>
        ) : dragActive ? (
          <div className="text-red-400">
            <Upload className="w-8 h-8 mx-auto mb-2" />
            Drop files here...
          </div>
        ) : (
          <div>
            <Upload className="w-8 h-8 text-gray-500 mx-auto mb-2" />
            <p className="text-gray-300 mb-1">Drag & drop photos or videos here, or click to select</p>
            <p className="text-gray-500 text-sm">Photos: JPEG, PNG, WebP (50MB) • Videos: MP4, MOV, WebM (2GB)</p>
          </div>
        )}
      </div>

      {/* Tabs: Photos | Videos */}
      <div className="flex border-b border-dark-600 mb-4">
        <button
          onClick={() => setActiveTab('photos')}
          className={`px-4 py-2 font-medium transition ${
            activeTab === 'photos' 
              ? 'text-red-500 border-b-2 border-red-500' 
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Photos ({photos.length})
        </button>
        <button
          onClick={() => setActiveTab('videos')}
          className={`px-4 py-2 font-medium transition ${
            activeTab === 'videos' 
              ? 'text-red-500 border-b-2 border-red-500' 
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Videos ({clips.length})
        </button>
      </div>

      {/* Photo Grid */}
      {activeTab === 'photos' && (
        <>
          {/* Category Management Bar */}
          <div className="mb-4 pb-4 border-b border-dark-600">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-400">Categories</h3>
              <button
                onClick={() => setShowCategoryModal(true)}
                className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg flex items-center gap-2"
              >
                <Plus className="w-3 h-3" />
                Add Category
              </button>
            </div>
            
            {/* Category Tabs */}
            <div className="flex flex-wrap gap-2">
              {/* All Photos Tab */}
              <button
                onClick={() => setSelectedCategoryId(null)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  selectedCategoryId === null
                    ? 'bg-red-600 text-white'
                    : 'bg-dark-700 text-gray-300 hover:bg-dark-600'
                }`}
              >
                All ({photos.length})
              </button>
              
              {/* Category Tabs */}
              {categories.map(cat => (
                <div key={cat.id} className="relative group">
                  {editingCategory === cat.id ? (
                    <input
                      type="text"
                      defaultValue={cat.name}
                      autoFocus
                      onBlur={(e) => renameCategory(cat.id, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') renameCategory(cat.id, e.target.value)
                        if (e.key === 'Escape') setEditingCategory(null)
                      }}
                      className="px-4 py-2 bg-dark-700 text-white rounded-lg text-sm border border-red-500 focus:outline-none w-32"
                    />
                  ) : (
                    <button
                      onClick={() => setSelectedCategoryId(cat.id)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                        selectedCategoryId === cat.id
                          ? 'bg-red-600 text-white'
                          : 'bg-dark-700 text-gray-300 hover:bg-dark-600'
                      }`}
                    >
                      {cat.name} ({photos.filter(p => p.category_id === cat.id).length})
                    </button>
                  )}
                  
                  {/* Edit/Delete/Move buttons on hover */}
                  {editingCategory !== cat.id && (
                    <div className="absolute -top-1 -right-1 hidden group-hover:flex gap-1">
                      {/* Move left */}
                      {categories.findIndex(c => c.id === cat.id) > 0 && (
                        <button
                          onClick={(e) => { e.stopPropagation(); moveCategory(cat.id, -1) }}
                          className="w-5 h-5 bg-gray-600 hover:bg-gray-700 rounded-full flex items-center justify-center"
                          title="Move left"
                        >
                          <span className="text-[10px] text-white">←</span>
                        </button>
                      )}
                      {/* Move right */}
                      {categories.findIndex(c => c.id === cat.id) < categories.length - 1 && (
                        <button
                          onClick={(e) => { e.stopPropagation(); moveCategory(cat.id, 1) }}
                          className="w-5 h-5 bg-gray-600 hover:bg-gray-700 rounded-full flex items-center justify-center"
                          title="Move right"
                        >
                          <span className="text-[10px] text-white">→</span>
                        </button>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); setEditingCategory(cat.id) }}
                        className="w-5 h-5 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center"
                        title="Rename"
                      >
                        <span className="text-[10px] text-white">✎</span>
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteCategory(cat.id) }}
                        className="w-5 h-5 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center"
                        title="Delete"
                      >
                        <span className="text-[10px] text-white">✕</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
              
              {categories.length === 0 && (
                <span className="text-gray-500 text-sm italic">No categories yet. Create one to organize your photos.</span>
              )}
            </div>
          </div>
          
          {/* Upload hint when category selected */}
          {selectedCategoryId && (
            <div className="mb-4 px-3 py-2 bg-blue-900/30 border border-blue-700/50 rounded-lg text-sm text-blue-300">
              📁 Uploading to: <strong>{categories.find(c => c.id === selectedCategoryId)?.name}</strong>
            </div>
          )}
          
          {/* New Category Modal - MUST be outside photo conditionals */}
          {showCategoryModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowCategoryModal(false)}>
              <div className="bg-dark-800 rounded-xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
                <h3 className="text-lg font-bold text-white mb-4">Create New Category</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Create a category (e.g., "Adult Male Gi", "Kids No Gi", "Mat 1") to organize photos by division.
                </p>
                <input
                  type="text"
                  placeholder="Category name..."
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="w-full bg-dark-700 text-white rounded-lg px-4 py-3 border border-dark-600 focus:border-red-500 focus:outline-none mb-4"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && createCategory()}
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowCategoryModal(false)}
                    className="flex-1 bg-dark-600 hover:bg-dark-500 text-white py-2 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={createCategory}
                    disabled={!newCategoryName.trim()}
                    className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white py-2 rounded-lg"
                  >
                    Create Category
                  </button>
                </div>
              </div>
            </div>
          )}
          
        {photos.length === 0 && categories.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Image className="w-12 h-12 mx-auto mb-4 opacity-50" />
            No photos yet. Create a category and upload some photos to get started!
          </div>
        ) : (
          <>
            
            {/* Search + Selection Controls */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              {/* Search */}
              <div className="relative flex-1 min-w-[200px] max-w-[300px]">
                <input
                  type="text"
                  placeholder="Search by filename..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-dark-700 text-white rounded-lg px-3 py-1.5 pl-9 text-sm border border-dark-600 focus:border-red-500 focus:outline-none"
                />
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    ✕
                  </button>
                )}
              </div>
              
              {(searchQuery || selectedCategoryId !== null) && (
                <span className="text-gray-400 text-sm">{filteredPhotos.length} of {photos.length}</span>
              )}
              
              <button
                onClick={selectedPhotos.size === filteredPhotos.length ? deselectAll : selectAll}
                className="px-3 py-1.5 bg-dark-600 hover:bg-dark-500 text-white text-sm rounded-lg"
              >
                {selectedPhotos.size === filteredPhotos.length && filteredPhotos.length > 0 ? 'Deselect All' : 'Select All'}
              </button>
              {selectedPhotos.size > 0 && (
                <>
                  <span className="text-gray-400 text-sm">{selectedPhotos.size} selected</span>
                  
                  {/* Move to Category Dropdown */}
                  {categories.length > 0 && (
                    <div className="relative group">
                      <button
                        disabled={movingToCategory}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white text-sm rounded-lg flex items-center gap-2"
                      >
                        {movingToCategory ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                        Move to Category ▾
                      </button>
                      <div className="absolute top-full left-0 mt-1 bg-dark-700 border border-dark-600 rounded-lg shadow-xl z-20 min-w-[180px] hidden group-hover:block">
                        <button
                          onClick={() => moveSelectedToCategory(null)}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-400 hover:bg-dark-600 hover:text-white first:rounded-t-lg italic"
                        >
                          Uncategorized
                        </button>
                        {categories.map(cat => (
                          <button
                            key={cat.id}
                            onClick={() => moveSelectedToCategory(cat.id)}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-dark-600 hover:text-white"
                          >
                            {cat.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <button
                    onClick={deleteSelected}
                    disabled={deleting}
                    className="px-3 py-1.5 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white text-sm rounded-lg flex items-center gap-2"
                  >
                    {deleting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                    Delete Selected
                  </button>
                </>
              )}
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {filteredPhotos.map(photo => (
                <div 
                  key={photo.id} 
                  className={`relative group cursor-pointer ${selectedPhotos.has(photo.id) ? 'ring-2 ring-red-500' : ''}`}
                  onClick={() => toggleSelect(photo.id)}
                >
                  <img
                    src={photo.thumbnail_url}
                    alt={photo.filename}
                    className="w-full aspect-square object-cover rounded-lg bg-dark-700"
                  />
                  {/* Selection checkbox */}
                  <div className={`absolute top-2 left-2 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                    selectedPhotos.has(photo.id) 
                      ? 'bg-red-500 border-red-500' 
                      : 'border-white/50 bg-black/30 group-hover:border-white'
                  }`}>
                    {selectedPhotos.has(photo.id) && (
                      <Check className="w-3 h-3 text-white" />
                    )}
                  </div>
                  {/* Delete single button */}
                  <button
                    onClick={(e) => { e.stopPropagation(); deletePhoto(photo.id) }}
                    className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                  <div className="absolute bottom-1 left-1 right-1 text-xs text-white truncate bg-black/50 px-1 rounded">
                    {photo.filename}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
        </>
      )}

      {/* Video Clips Grid */}
      {activeTab === 'videos' && (
        <>
          {/* Category Management Bar for Videos */}
          <div className="mb-4 pb-4 border-b border-dark-600">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-400">Categories</h3>
              <button
                onClick={() => setShowCategoryModal(true)}
                className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg flex items-center gap-2"
              >
                <Plus className="w-3 h-3" />
                Add Category
              </button>
            </div>
            
            {/* Category Tabs */}
            <div className="flex flex-wrap gap-2">
              {/* All Videos Tab */}
              <button
                onClick={() => setSelectedCategoryId(null)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  selectedCategoryId === null
                    ? 'bg-red-600 text-white'
                    : 'bg-dark-700 text-gray-300 hover:bg-dark-600'
                }`}
              >
                All ({clips.length})
              </button>
              
              {/* Category Tabs */}
              {categories.map(cat => (
                <div key={cat.id} className="relative group">
                  <button
                    onClick={() => setSelectedCategoryId(cat.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                      selectedCategoryId === cat.id
                        ? 'bg-red-600 text-white'
                        : 'bg-dark-700 text-gray-300 hover:bg-dark-600'
                    }`}
                  >
                    {cat.name} ({clips.filter(c => c.category_id === cat.id).length})
                  </button>
                </div>
              ))}
              
              {categories.length === 0 && (
                <span className="text-gray-500 text-sm italic">No categories yet. Create one to organize your videos.</span>
              )}
            </div>
          </div>
          
          {/* Upload hint when category selected */}
          {selectedCategoryId && (
            <div className="mb-4 px-3 py-2 bg-blue-900/30 border border-blue-700/50 rounded-lg text-sm text-blue-300">
              📁 Uploading to: <strong>{categories.find(c => c.id === selectedCategoryId)?.name}</strong>
            </div>
          )}
          
        {clips.length === 0 && categories.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            No videos yet. Create a category and upload some videos to get started!
          </div>
        ) : filteredClips.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            No videos in this category. Upload some or select a different category.
          </div>
        ) : (
          <>
            {/* Selection Controls for Videos */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="text-gray-400 text-sm">{filteredClips.length} video{filteredClips.length !== 1 ? 's' : ''}</span>
              
              {/* Select All / Deselect All for Videos */}
              <button
                onClick={selectedClips.size === filteredClips.length && filteredClips.length > 0 ? deselectAllClips : selectAllClips}
                className="px-3 py-1.5 bg-dark-700 hover:bg-dark-600 text-white text-sm rounded-lg"
              >
                {selectedClips.size === filteredClips.length && filteredClips.length > 0 ? 'Deselect All' : `Select All (${filteredClips.length})`}
              </button>
              
              {selectedClips.size > 0 && (
                <>
                  <span className="text-gray-400 text-sm">{selectedClips.size} selected</span>
                  
                  {/* Move to Category Dropdown */}
                  {categories.length > 0 && (
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          moveSelectedClipsToCategory(e.target.value === 'uncategorized' ? null : e.target.value)
                          e.target.value = ''
                        }
                      }}
                      className="px-3 py-1.5 bg-dark-700 text-white text-sm rounded-lg border border-dark-600"
                      defaultValue=""
                    >
                      <option value="">Move to Category ▾</option>
                      <option value="uncategorized">— Uncategorized —</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  )}
                  
                  <button
                    onClick={deleteSelectedClips}
                    disabled={deleting}
                    className="px-3 py-1.5 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white text-sm rounded-lg flex items-center gap-2"
                  >
                    {deleting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                    Delete Selected
                  </button>
                </>
              )}
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredClips.map(clip => (
                <div 
                  key={clip.id} 
                  className={`relative group cursor-pointer ${selectedClips.has(clip.id) ? 'ring-2 ring-red-500' : ''}`}
                  onClick={() => {
                    const newSelected = new Set(selectedClips)
                    if (newSelected.has(clip.id)) {
                      newSelected.delete(clip.id)
                    } else {
                      newSelected.add(clip.id)
                    }
                    setSelectedClips(newSelected)
                  }}
                >
                  <div className="aspect-video bg-dark-700 rounded-lg overflow-hidden relative">
                    {clip.thumbnail_url ? (
                      <img
                        src={clip.thumbnail_url}
                        alt={clip.filename}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    {/* Processing status overlay */}
                    {clip.processing_status === 'processing' && (
                      <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center">
                        <Loader2 className="w-8 h-8 text-blue-400 animate-spin mb-2" />
                        <span className="text-white text-xs font-medium">Processing...</span>
                        <span className="text-gray-400 text-xs mt-1">Processing video</span>
                      </div>
                    )}
                    {clip.processing_status === 'failed' && (
                      <div className="absolute inset-0 bg-red-900/60 flex flex-col items-center justify-center">
                        <X className="w-8 h-8 text-red-400 mb-2" />
                        <span className="text-white text-sm font-medium">Failed</span>
                        <span className="text-red-300 text-xs mt-1">Processing error</span>
                      </div>
                    )}
                    {clip.processing_status === 'completed' && !clip.thumbnail_url && (
                      <div className="absolute inset-0 bg-green-900/40 flex items-center justify-center">
                        <Check className="w-8 h-8 text-green-400" />
                      </div>
                    )}
                    {/* Status badge */}
                    <div className={`absolute top-2 left-8 px-2 py-0.5 rounded text-xs font-medium ${
                      clip.processing_status === 'completed' ? 'bg-green-500/80 text-white' :
                      clip.processing_status === 'processing' ? 'bg-blue-500/80 text-white' :
                      'bg-red-500/80 text-white'
                    }`}>
                      {clip.processing_status === 'completed' ? '✓ Ready' :
                       clip.processing_status === 'processing' ? '⏳ Processing' :
                       '✗ Failed'}
                    </div>
                    {/* Duration badge */}
                    {clip.duration_seconds && (
                      <div className="absolute bottom-2 right-2 bg-black/70 px-2 py-0.5 rounded text-xs text-white">
                        {Math.floor(clip.duration_seconds / 60)}:{String(Math.floor(clip.duration_seconds % 60)).padStart(2, '0')}
                      </div>
                    )}
                  </div>
                  {/* Selection checkbox */}
                  <div className={`absolute top-2 left-2 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                    selectedClips.has(clip.id) 
                      ? 'bg-red-500 border-red-500' 
                      : 'border-white/50 bg-black/30 group-hover:border-white'
                  }`}>
                    {selectedClips.has(clip.id) && (
                      <Check className="w-3 h-3 text-white" />
                    )}
                  </div>
                  {/* Delete single button */}
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteClip(clip.id) }}
                    className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                  <div className="mt-1 text-xs text-gray-400 truncate">
                    {clip.filename}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
        </>
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
            <label className="block text-gray-400 text-sm mb-1">Price per Video ($)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              defaultValue={((currentGallery.price_per_video || 1500) / 100).toFixed(2)}
              onBlur={(e) => {
                const cents = Math.round(parseFloat(e.target.value || 0) * 100)
                updateGallery({ price_per_video: cents })
                setCurrentGallery({ ...currentGallery, price_per_video: cents })
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
        
        {/* Tiered Pricing Section - Photos */}
        <PricingTiersEditor 
          gallery={currentGallery} 
          onUpdate={(updates) => {
            updateGallery(updates)
            setCurrentGallery({ ...currentGallery, ...updates })
          }} 
        />
        
        {/* Tiered Pricing Section - Videos */}
        <VideoPricingTiersEditor 
          gallery={currentGallery} 
          onUpdate={(updates) => {
            updateGallery(updates)
            setCurrentGallery({ ...currentGallery, ...updates })
          }} 
        />

        {/* Content Delivery — I-Walk / Posing Routine */}
        <ContentDelivery gallery={currentGallery} organization={organization} />
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
              <div key={`tier-${idx}-${tier.min_qty}`} className="flex items-center gap-3 bg-dark-700 p-3 rounded-lg">
                <div className="flex-1 grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">From Qty</label>
                    <input
                      type="number"
                      min="1"
                      defaultValue={tier.min_qty}
                      onBlur={(e) => updateTier(idx, 'min_qty', parseInt(e.target.value) || 1)}
                      className="w-full bg-dark-600 text-white rounded px-3 py-2 text-sm border border-dark-500 focus:border-red-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">To Qty (blank=∞)</label>
                    <input
                      type="number"
                      min="1"
                      defaultValue={tier.max_qty || ''}
                      placeholder="∞"
                      onBlur={(e) => updateTier(idx, 'max_qty', e.target.value ? parseInt(e.target.value) : null)}
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
                        defaultValue={(tier.price_per_photo / 100).toFixed(2)}
                        onBlur={(e) => updateTier(idx, 'price_per_photo', Math.round(parseFloat(e.target.value || 0) * 100))}
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

// Video Tiered Pricing Editor Component (mirrors photo tier system)
function VideoPricingTiersEditor({ gallery, onUpdate }) {
  const [tiers, setTiers] = useState(gallery.video_pricing_tiers || [])
  const [enabled, setEnabled] = useState(gallery.video_tiered_pricing_enabled || false)
  const [saving, setSaving] = useState(false)
  const [edited, setEdited] = useState(false)

  const addTier = () => {
    const lastTier = tiers[tiers.length - 1]
    const newMin = lastTier ? (lastTier.max_qty || lastTier.min_qty) + 1 : 1
    setTiers([...tiers, { 
      min_qty: newMin, 
      max_qty: newMin + 2, 
      price_per_video: gallery.price_per_video || 1500
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
      const formattedTiers = tiers.map(t => ({
        min_qty: parseInt(t.min_qty) || 1,
        max_qty: t.max_qty ? parseInt(t.max_qty) : null,
        price_per_video: parseInt(t.price_per_video) || gallery.price_per_video || 1500
      }))
      
      await onUpdate({ 
        video_pricing_tiers: formattedTiers, 
        video_tiered_pricing_enabled: enabled 
      })
      setEdited(false)
    } catch (err) {
      console.error('Save video tiers error:', err)
      alert('Failed to save video pricing tiers')
    } finally {
      setSaving(false)
    }
  }

  const toggleEnabled = () => {
    setEnabled(!enabled)
    setEdited(true)
  }

  const calculateExample = (qty) => {
    const basePrice = gallery.price_per_video || 1500
    if (!enabled || tiers.length === 0) {
      return qty * basePrice
    }
    
    let remaining = qty
    let total = 0
    const sortedTiers = [...tiers].sort((a, b) => a.min_qty - b.min_qty)
    
    for (const tier of sortedTiers) {
      if (remaining <= 0) break
      const tierMax = tier.max_qty || Infinity
      const tierCapacity = tierMax === Infinity ? remaining : (tierMax - tier.min_qty + 1)
      const qtyInTier = Math.min(remaining, tierCapacity)
      total += qtyInTier * tier.price_per_video
      remaining -= qtyInTier
    }
    
    if (remaining > 0) total += remaining * basePrice
    return total
  }

  return (
    <div className="border-t border-dark-600 pt-4 mt-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-md font-semibold text-white flex items-center gap-2">
          🎬 Video Volume Discounts
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
        Set volume discounts for video clips. Pricing is incremental (first 3 at tier 1 price, next 3 at tier 2, etc.)
      </p>

      {enabled && (
        <>
          <div className="space-y-3 mb-4">
            {tiers.map((tier, idx) => (
              <div key={`vtier-${idx}-${tier.min_qty}`} className="flex items-center gap-3 bg-dark-700 p-3 rounded-lg">
                <div className="flex-1 grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">From Qty</label>
                    <input
                      type="number"
                      min="1"
                      defaultValue={tier.min_qty}
                      onBlur={(e) => updateTier(idx, 'min_qty', parseInt(e.target.value) || 1)}
                      className="w-full bg-dark-600 text-white rounded px-3 py-2 text-sm border border-dark-500 focus:border-red-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">To Qty (blank=∞)</label>
                    <input
                      type="number"
                      min="1"
                      defaultValue={tier.max_qty || ''}
                      placeholder="∞"
                      onBlur={(e) => updateTier(idx, 'max_qty', e.target.value ? parseInt(e.target.value) : null)}
                      className="w-full bg-dark-600 text-white rounded px-3 py-2 text-sm border border-dark-500 focus:border-red-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Price per Video</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-gray-400">$</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        defaultValue={(tier.price_per_video / 100).toFixed(2)}
                        onBlur={(e) => updateTier(idx, 'price_per_video', Math.round(parseFloat(e.target.value || 0) * 100))}
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

          {tiers.length > 0 && (
            <div className="bg-dark-700 rounded-lg p-4 mb-4">
              <h4 className="text-sm font-medium text-white mb-2">Preview Calculator</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 text-sm">
                {[1, 2, 3, 5, 7, 10].map(qty => {
                  const tieredTotal = calculateExample(qty)
                  const flatTotal = qty * (gallery.price_per_video || 1500)
                  const savings = flatTotal - tieredTotal
                  return (
                    <div key={qty} className="text-center">
                      <div className="text-gray-400">{qty} clip{qty > 1 ? 's' : ''}</div>
                      <div className="text-white font-medium">${(tieredTotal / 100).toFixed(2)}</div>
                      {savings > 0 && (
                        <div className="text-green-400 text-xs">Save ${(savings / 100).toFixed(2)}</div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </>
      )}

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
          {edited ? 'Save Video Pricing' : 'Saved ✓'}
        </button>
      )}
    </div>
  )
}

// Content Delivery — I-Walk / Posing Routine bulk import & email delivery
function ContentDelivery({ gallery, organization }) {
  const [events, setEvents] = useState([])
  const [selectedEventId, setSelectedEventId] = useState(gallery.event_id || '')
  const [contentType, setContentType] = useState('I-Walk / Posing Routine')
  const [loading, setLoading] = useState(false)
  const [importResult, setImportResult] = useState(null)
  const [emailResult, setEmailResult] = useState(null)
  const [eventName, setEventName] = useState('')
  const [dryRun, setDryRun] = useState(true)
  const [showCsvImport, setShowCsvImport] = useState(false)
  const [csvText, setCsvText] = useState('')
  const [csvResult, setCsvResult] = useState(null)
  const [csvEvents, setCsvEvents] = useState([])
  const [selectedCsvEvent, setSelectedCsvEvent] = useState('')
  const [parsedRows, setParsedRows] = useState([])

  // Parse CSV when text changes and extract events
  useEffect(() => {
    if (!csvText.trim()) {
      setCsvEvents([])
      setParsedRows([])
      setSelectedCsvEvent('')
      return
    }
    try {
      // Detect delimiter: tab, comma, or semicolon
      const firstLine = csvText.trim().split('\n')[0]
      const tabCount = (firstLine.match(/\t/g) || []).length
      const commaCount = (firstLine.match(/,/g) || []).length
      const semiCount = (firstLine.match(/;/g) || []).length
      const delimiter = tabCount > commaCount && tabCount > semiCount ? '\t' : semiCount > commaCount ? ';' : ','

      const lines = csvText.trim().split('\n').map(l => l.trim()).filter(l => l)
      if (lines.length < 2) { setCsvEvents([]); setParsedRows([]); return }

      const parseCsvLine = (line) => {
        if (delimiter === '\t') return line.split('\t').map(p => p.trim().replace(/^"|"$/g, ''))
        if (delimiter === ';') return line.split(';').map(p => p.trim().replace(/^"|"$/g, ''))
        // Standard CSV with quote handling
        const parts = []
        let current = ''
        let inQuotes = false
        for (const char of line) {
          if (char === '"') { inQuotes = !inQuotes }
          else if (char === ',' && !inQuotes) { parts.push(current.trim()); current = '' }
          else { current += char }
        }
        parts.push(current.trim())
        return parts
      }

      const headers = parseCsvLine(lines[0]).map(h => h.toLowerCase().trim().replace(/^"|"$/g, ''))
      const emailIdx = headers.findIndex(h => h === 'email' || h === 'e-mail' || h === 'email address')
      const firstNameIdx = headers.findIndex(h => h === 'first name' || h === 'first_name' || h === 'firstname' || h === 'first' || h === 'given name')
      const lastNameIdx = headers.findIndex(h => h === 'last name' || h === 'last_name' || h === 'lastname' || h === 'surname')
      const athleteNumberIdx = headers.findIndex(h => h.includes('athlete number') || h.includes('competitor') || h === 'number' || h === 'id')
      const videographyIdx = headers.findIndex(h => h.includes('videography') || h.includes('service') || h.includes('package') || h.includes('product'))
      const eventIdx = headers.findIndex(h => h === 'event' || h === 'show' || h === 'competition' || h === 'division')

      if (emailIdx === -1) { setCsvEvents([]); setParsedRows([]); return }

      const rows = []
      const eventSet = new Set()
      for (let i = 1; i < lines.length; i++) {
        const parts = parseCsvLine(lines[i])
        const email = (parts[emailIdx] || '').toLowerCase().trim().replace(/^"|"$/g, '')
        if (!email || !email.includes('@')) continue

        const evt = eventIdx >= 0 ? (parts[eventIdx] || '').trim().replace(/^"|"$/g, '') : ''
        const service = videographyIdx >= 0 ? (parts[videographyIdx] || '').trim().replace(/^"|"$/g, '') : ''

        rows.push({
          email,
          first_name: firstNameIdx >= 0 ? (parts[firstNameIdx] || '').trim().replace(/^"|"$/g, '') : '',
          last_name: lastNameIdx >= 0 ? (parts[lastNameIdx] || '').trim().replace(/^"|"$/g, '') : '',
          athlete_number: athleteNumberIdx >= 0 ? (parts[athleteNumberIdx] || '').trim().replace(/^"|"$/g, '') : '',
          videography_service: service,
          event: evt
        })

        if (evt) eventSet.add(evt)
      }

      setCsvEvents([...eventSet].sort())
      setParsedRows(rows)
    } catch (err) {
      setCsvEvents([])
      setParsedRows([])
    }
  }, [csvText])

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
    }
  }

  useEffect(() => {
    loadEvents()
  }, [organization?.id])

  useEffect(() => {
    if (selectedEventId) {
      const ev = events.find(e => e.id === selectedEventId)
      setEventName(ev?.name || '')
    }
  }, [selectedEventId, events])

  const importFromCsv = async () => {
    if (!parsedRows.length || !gallery?.id) return
    setLoading(true)
    setCsvResult(null)

    try {
      // Filter rows by selected event (or use all if no event selected)
      const rowsToImport = selectedCsvEvent
        ? parsedRows.filter(r => r.event === selectedCsvEvent)
        : parsedRows

      if (rowsToImport.length === 0) {
        setCsvResult({ error: 'No athletes match the selected event.' })
        setLoading(false)
        return
      }

      const { data: { session } } = await supabase.auth.getSession()
      const response = await fetch(`https://gonalgubgldgpkcekaxe.supabase.co/functions/v1/gallery_delivery/import`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token || ''}`
        },
        body: JSON.stringify({
          gallery_id: gallery.id,
          event_id: selectedEventId || null,
          content_type: contentType,
          csv_rows: rowsToImport
        })
      })

      const result = await response.json()
      setCsvResult(result)
      if (result.success) loadEvents()
    } catch (err) {
      setCsvResult({ error: err.message })
    } finally {
      setLoading(false)
    }
  }

  const importAthletes = async () => {
    if (!gallery?.id || !selectedEventId) return
    setLoading(true)
    setImportResult(null)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const response = await fetch(`https://gonalgubgldgpkcekaxe.supabase.co/functions/v1/gallery_delivery/import`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token || ''}`
        },
        body: JSON.stringify({
          gallery_id: gallery.id,
          event_id: selectedEventId,
          content_type: contentType
        })
      })

      const result = await response.json()
      setImportResult(result)
    } catch (err) {
      setImportResult({ error: err.message })
    } finally {
      setLoading(false)
    }
  }

  const sendDeliveryEmails = async (type) => {
    if (!gallery?.id) return
    setLoading(true)
    setEmailResult(null)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const response = await fetch(`https://gonalgubgldgpkcekaxe.supabase.co/functions/v1/gallery_delivery/send-emails`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token || ''}`
        },
        body: JSON.stringify({
          gallery_id: gallery.id,
          event_id: selectedEventId,
          email_type: type,
          content_type: contentType,
          event_name: eventName || gallery.title,
          dry_run: dryRun
        })
      })

      const result = await response.json()
      setEmailResult(result)
    } catch (err) {
      setEmailResult({ error: err.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="border-t border-dark-600 pt-6 mt-6">
      <h3 className="text-md font-semibold text-white flex items-center gap-2 mb-4">
        🎬 Content Delivery
        <span className="text-xs text-gray-500 font-normal">(I-Walk / Posing Routine)</span>
      </h3>
      
      <div className="bg-dark-700 rounded-lg p-4 mb-4">
        <p className="text-gray-400 text-sm mb-4">
          Import athletes and grant them free gallery access, then send delivery or promo emails.
        </p>

        {/* Event Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-gray-400 text-sm mb-1">Linked Event</label>
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="w-full bg-dark-900 text-white rounded-lg px-3 py-2 border border-dark-600 focus:border-red-500 focus:outline-none"
            >
              <option value="">Select event...</option>
              {events.map(ev => (
                <option key={ev.id} value={ev.id}>
                  {ev.name} ({new Date(ev.date).toLocaleDateString()})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-1">Content Type</label>
            <input
              type="text"
              value={contentType}
              onChange={(e) => setContentType(e.target.value)}
              className="w-full bg-dark-900 text-white rounded-lg px-3 py-2 border border-dark-600 focus:border-red-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Import Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          <button
            onClick={importAthletes}
            disabled={loading || !selectedEventId}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg flex items-center justify-center gap-2 font-medium"
          >
            {loading && !emailResult ? <Loader2 className="w-4 h-4 animate-spin" /> : '📋'}
            Import from Content Orders
            <span className="text-xs opacity-70">(paid athletes)</span>
          </button>
          <button
            onClick={() => setShowCsvImport(!showCsvImport)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-3 rounded-lg flex items-center justify-center gap-2 font-medium"
          >
            📄 Import from CSV
            <span className="text-xs opacity-70">(upload or paste)</span>
          </button>
        </div>

        {/* CSV Import Area */}
        {showCsvImport && (
          <div className="mb-4 p-4 bg-dark-800 rounded-lg border border-emerald-700/30">
            <p className="text-gray-400 text-xs mb-3">
              Upload a CSV/Excel file or paste spreadsheet data. Auto-detects columns and events.
            </p>
            <div className="flex gap-3 mb-3">
              <label className="flex-1 cursor-pointer">
                <input
                  type="file"
                  accept=".csv,.tsv,.txt,.xls,.xlsx"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    const reader = new FileReader()
                    reader.onload = (ev) => {
                      const text = ev.target?.result
                      if (typeof text === 'string') setCsvText(text)
                    }
                    reader.readAsText(file)
                  }}
                />
                <div className="bg-dark-900 hover:bg-dark-800 text-white px-4 py-2 rounded-lg border border-dark-600 hover:border-emerald-500 text-center transition-colors text-sm">
                  📁 Upload CSV File
                </div>
              </label>
              <div className="flex items-center text-gray-500 text-xs">or paste below</div>
            </div>
            <textarea
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              placeholder="Paste your full CSV here... (all events)"
              className="w-full h-32 bg-dark-900 text-white rounded-lg px-3 py-2 border border-dark-600 focus:border-emerald-500 focus:outline-none font-mono text-sm resize-y"
            />

            {/* Event Filter */}
            {csvEvents.length > 0 && (
              <div className="mt-3">
                <label className="block text-gray-400 text-sm mb-1">
                  Filter by event ({parsedRows.length} total athletes, {csvEvents.length} events found)
                </label>
                <select
                  value={selectedCsvEvent}
                  onChange={(e) => setSelectedCsvEvent(e.target.value)}
                  className="w-full bg-dark-900 text-white rounded-lg px-3 py-2 border border-dark-600 focus:border-emerald-500 focus:outline-none"
                >
                  <option value="">All events ({parsedRows.length} athletes)</option>
                  {csvEvents.map(evt => {
                    const count = parsedRows.filter(r => r.event === evt).length
                    return <option key={evt} value={evt}>{evt} ({count} athletes)</option>
                  })}
                </select>
                {selectedCsvEvent && (
                  <p className="text-emerald-400 text-sm mt-1">
                    ✅ {parsedRows.filter(r => r.event === selectedCsvEvent).length} athletes will be imported for "{selectedCsvEvent}"
                  </p>
                )}
              </div>
            )}

            <div className="flex items-center gap-3 mt-3">
              <button
                onClick={importFromCsv}
                disabled={loading || !parsedRows.length}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium text-sm"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : '➕'}
                Create Gallery Orders
                {selectedCsvEvent
                  ? ` (${parsedRows.filter(r => r.event === selectedCsvEvent).length} athletes)`
                  : parsedRows.length > 0 ? ` (${parsedRows.length} athletes)` : ''
                }
              </button>
            </div>
          </div>
        )}

        {/* CSV Import Result */}
        {csvResult && (
          <div className={`rounded-lg p-4 mb-4 ${csvResult.error ? 'bg-red-900/30 border border-red-700' : 'bg-green-900/30 border border-green-700'}`}>
            {csvResult.error ? (
              <p className="text-red-400 text-sm">Error: {csvResult.error}</p>
            ) : (
              <div className="text-sm">
                <p className="text-green-400 font-medium mb-2">✅ CSV Import complete</p>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div><div className="text-2xl font-bold text-green-400">{csvResult.results?.created || 0}</div><div className="text-gray-400">Created</div></div>
                  <div><div className="text-2xl font-bold text-yellow-400">{csvResult.results?.skipped || 0}</div><div className="text-gray-400">Skipped</div></div>
                  <div><div className="text-2xl font-bold text-red-400">{csvResult.results?.errors || 0}</div><div className="text-gray-400">Errors</div></div>
                </div>
                {csvResult.results?.details?.length > 0 && (
                  <details className="mt-3">
                    <summary className="text-gray-400 cursor-pointer hover:text-white">View details</summary>
                    <div className="mt-2 max-h-40 overflow-y-auto">
                      {csvResult.results.details.map((d, i) => (
                        <div key={i} className={`py-1 ${d.status === 'error' ? 'text-red-400' : d.status === 'already_exists' ? 'text-yellow-400' : 'text-green-400'}`}>
                          {d.name || d.email} — {d.status}
                        </div>
                      ))}
                    </div>
                  </details>
                )}
              </div>
            )}
          </div>
        )}

        {/* Import Result */}
        {importResult && (
          <div className={`rounded-lg p-4 mb-4 ${importResult.error ? 'bg-red-900/30 border border-red-700' : 'bg-green-900/30 border border-green-700'}`}>
            {importResult.error ? (
              <p className="text-red-400 text-sm">Error: {importResult.error}</p>
            ) : (
              <div className="text-sm">
                <p className="text-green-400 font-medium mb-2">✅ Import complete</p>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div><div className="text-2xl font-bold text-green-400">{importResult.results?.created || 0}</div><div className="text-gray-400">Created</div></div>
                  <div><div className="text-2xl font-bold text-yellow-400">{importResult.results?.skipped || 0}</div><div className="text-gray-400">Skipped</div></div>
                  <div><div className="text-2xl font-bold text-red-400">{importResult.results?.errors || 0}</div><div className="text-gray-400">Errors</div></div>
                </div>
                {importResult.results?.details?.length > 0 && (
                  <details className="mt-3">
                    <summary className="text-gray-400 cursor-pointer hover:text-white">View details</summary>
                    <div className="mt-2 max-h-40 overflow-y-auto">
                      {importResult.results.details.map((d, i) => (
                        <div key={i} className={`py-1 ${d.status === 'error' ? 'text-red-400' : d.status === 'already_exists' ? 'text-yellow-400' : 'text-green-400'}`}>
                          {d.name || d.email} — {d.status}
                        </div>
                      ))}
                    </div>
                  </details>
                )}
              </div>
            )}
          </div>
        )}

        {/* Dry Run Toggle */}
        <div className="flex items-center gap-3 mb-4 p-3 bg-yellow-900/20 border border-yellow-700/30 rounded-lg">
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" checked={dryRun} onChange={(e) => setDryRun(e.target.checked)} className="sr-only peer" />
            <div className="w-9 h-5 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-yellow-500"></div>
          </label>
          <div>
            <span className="text-yellow-400 text-sm font-medium">{dryRun ? '🧪 Dry Run Mode' : '📧 Live Mode'}</span>
            <p className="text-gray-500 text-xs">{dryRun ? 'Preview who would receive emails without actually sending' : 'Emails will be sent for real!'}</p>
          </div>
        </div>

        {/* Email Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <button
            onClick={() => sendDeliveryEmails('delivery')}
            disabled={loading || !selectedEventId}
            className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg flex items-center justify-center gap-2 font-medium"
          >
            {loading && !importResult ? <Loader2 className="w-4 h-4 animate-spin" /> : '📧'}
            Send Delivery Emails
            <span className="text-xs opacity-70">(paid athletes)</span>
          </button>
          <button
            onClick={() => sendDeliveryEmails('promo')}
            disabled={loading || !selectedEventId}
            className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg flex items-center justify-center gap-2 font-medium"
          >
            {loading && !importResult ? <Loader2 className="w-4 h-4 animate-spin" /> : '📣'}
            Send Promo Emails
            <span className="text-xs opacity-70">(non-buyers)</span>
          </button>
        </div>

        {/* Email Result */}
        {emailResult && (
          <div className={`rounded-lg p-4 mt-4 ${emailResult.error ? 'bg-red-900/30 border border-red-700' : 'bg-green-900/30 border border-green-700'}`}>
            {emailResult.error ? (
              <p className="text-red-400 text-sm">Error: {emailResult.error}</p>
            ) : (
              <div className="text-sm">
                <p className={`font-medium mb-2 ${emailResult.dry_run ? 'text-yellow-400' : 'text-green-400'}`}>
                  {emailResult.dry_run ? '🧪 Dry Run — no emails sent' : '✅'} {emailResult.email_type === 'delivery' ? 'Delivery' : 'Promo'} emails {emailResult.dry_run ? 'would be sent' : 'processed'}
                </p>
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div><div className="text-2xl font-bold text-green-400">{emailResult.results?.sent || 0}</div><div className="text-gray-400">Sent</div></div>
                  <div><div className="text-2xl font-bold text-red-400">{emailResult.results?.failed || 0}</div><div className="text-gray-400">Failed</div></div>
                </div>
                {emailResult.results?.details?.length > 0 && (
                  <details className="mt-3">
                    <summary className="text-gray-400 cursor-pointer hover:text-white">View details</summary>
                    <div className="mt-2 max-h-40 overflow-y-auto">
                      {emailResult.results.details.map((d, i) => (
                        <div key={i} className={`py-1 ${d.status === 'failed' || d.status === 'error' ? 'text-red-400' : d.status === 'dry_run' ? 'text-yellow-400' : 'text-green-400'}`}>
                          {d.name || d.email} — {d.status}
                        </div>
                      ))}
                    </div>
                  </details>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
