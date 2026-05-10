import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Download, Check, AlertTriangle, Loader2, Clock, Image, Video, Play } from 'lucide-react'

export default function GalleryDownloadPage() {
  const { token } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [downloadingPhoto, setDownloadingPhoto] = useState(null)
  const [downloadingClip, setDownloadingClip] = useState(null)
  const [downloadedPhotos, setDownloadedPhotos] = useState(new Set())
  const [downloadedClips, setDownloadedClips] = useState(new Set())

  useEffect(() => {
    loadOrder()
  }, [token])

  const loadOrder = async () => {
    try {
      const response = await fetch(`https://gonalgubgldgpkcekaxe.supabase.co/functions/v1/gallery_download?token=${token}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load order')
      }

      setOrder(data.order)
      
      // Track already downloaded photos
      const downloadedPhotoSet = new Set()
      const photoItems = data.order.gallery_order_items || []
      photoItems.forEach(item => {
        if (item.downloaded) {
          downloadedPhotoSet.add(item.photo_id)
        }
      })
      setDownloadedPhotos(downloadedPhotoSet)

      // Track already downloaded videos
      const downloadedClipSet = new Set()
      const videoItems = data.order.gallery_order_video_items || []
      videoItems.forEach(item => {
        if (item.downloaded) {
          downloadedClipSet.add(item.clip_id)
        }
      })
      setDownloadedClips(downloadedClipSet)
    } catch (err) {
      console.error('Load order error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const downloadPhoto = async (photoId, filename) => {
    setDownloadingPhoto(photoId)
    
    try {
      const downloadUrl = `https://gonalgubgldgpkcekaxe.supabase.co/functions/v1/gallery_download?token=${token}&photo_id=${photoId}&download=true`
      
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = filename || 'photo.jpg'
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      setDownloadedPhotos(prev => new Set([...prev, photoId]))
    } catch (err) {
      console.error('Download error:', err)
      alert('Download failed: ' + err.message)
    } finally {
      setDownloadingPhoto(null)
    }
  }

  const downloadClip = async (clipId, filename) => {
    setDownloadingClip(clipId)
    
    try {
      const downloadUrl = `https://gonalgubgldgpkcekaxe.supabase.co/functions/v1/gallery_download?token=${token}&clip_id=${clipId}&download=true`
      
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = filename || 'video.mp4'
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      setDownloadedClips(prev => new Set([...prev, clipId]))
    } catch (err) {
      console.error('Download error:', err)
      alert('Download failed: ' + err.message)
    } finally {
      setDownloadingClip(null)
    }
  }

  const downloadAllPhotos = async () => {
    const items = order.gallery_order_items || []
    for (const item of items) {
      if (!downloadedPhotos.has(item.photo_id)) {
        await downloadPhoto(item.photo_id, item.filename || `photo-${item.photo_id}.jpg`)
        await new Promise(resolve => setTimeout(resolve, 500))
      }
    }
  }

  const downloadAllClips = async () => {
    const items = order.gallery_order_video_items || []
    for (const item of items) {
      if (!downloadedClips.has(item.clip_id)) {
        await downloadClip(item.clip_id, item.filename || `video-${item.clip_id}.mp4`)
        await new Promise(resolve => setTimeout(resolve, 500))
      }
    }
  }

  const formatDuration = (seconds) => {
    if (!seconds) return ''
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">
            {error === 'Download link has expired' ? 'Link Expired' : 'Access Denied'}
          </h2>
          <p className="text-gray-400 mb-4">{error}</p>
          {error === 'Download link has expired' && (
            <p className="text-gray-500 text-sm">
              Download links expire after 7 days. Please contact us if you need a new link.
            </p>
          )}
        </div>
      </div>
    )
  }

  const photoItems = order.gallery_order_items || []
  const videoItems = order.gallery_order_video_items || []
  const galleryClips = order.gallery_clips || []
  const hasPhotos = photoItems.length > 0
  const hasVideos = videoItems.length > 0 || galleryClips.length > 0
  const isFreeAccess = order.delivery_type === 'free_access'
  
  const allPhotosDownloaded = photoItems.every(item => downloadedPhotos.has(item.photo_id))
  const allVideosDownloaded = videoItems.every(item => downloadedClips.has(item.clip_id))
  
  const expiresAt = new Date(order.token_expires_at)
  const daysLeft = Math.ceil((expiresAt - new Date()) / (1000 * 60 * 60 * 24))

  // Determine header text
  let headerText = 'Your Content Is Ready!'
  if (isFreeAccess) {
    headerText = galleryClips.length > 0 ? 'Your Video Is Ready!' : 'Your Content Is Ready!'
  } else if (hasPhotos && hasVideos) {
    headerText = 'Your Photos & Videos Are Ready!'
  } else if (hasVideos) {
    headerText = 'Your Videos Are Ready!'
  } else if (hasPhotos) {
    headerText = 'Your Photos Are Ready!'
  }

  return (
    <div className="py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">{headerText}</h1>
          <p className="text-gray-400">
            {isFreeAccess 
              ? `Your content from ${order.galleries?.title || 'the gallery'} is ready to download`
              : `Thank you for your purchase from ${order.galleries?.title}`
            }
          </p>
        </div>

        {/* Expiry Warning */}
        <div className="mb-6 p-4 bg-dark-800 rounded-lg flex items-center gap-3">
          <Clock className="w-5 h-5 text-yellow-500" />
          <div>
            <span className="text-gray-300">Downloads available for </span>
            <span className="text-white font-semibold">{daysLeft} more days</span>
            <span className="text-gray-500 text-sm ml-2">
              (expires {expiresAt.toLocaleDateString()})
            </span>
          </div>
        </div>

        {/* Photos Section */}
        {hasPhotos && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <Image className="w-5 h-5 text-red-400" />
                Photos ({photoItems.length})
              </h2>
              {photoItems.length > 1 && !allPhotosDownloaded && (
                <button
                  onClick={downloadAllPhotos}
                  disabled={downloadingPhoto}
                  className="bg-red-500 hover:bg-red-600 disabled:bg-gray-600 text-white font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download All ({photoItems.length})
                </button>
              )}
            </div>

            <div className="space-y-3">
              {photoItems.map(item => {
                const isDownloaded = downloadedPhotos.has(item.photo_id)
                const isDownloading = downloadingPhoto === item.photo_id

                return (
                  <div
                    key={item.id}
                    className="bg-dark-800 rounded-lg p-4 flex items-center gap-4"
                  >
                    <div className="w-20 h-20 bg-dark-700 rounded-lg overflow-hidden flex-shrink-0">
                      {item.thumbnail_url ? (
                        <img 
                          src={item.thumbnail_url} 
                          alt={item.filename || 'Photo'} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Image className="w-full h-full text-gray-600 p-4" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-medium truncate">
                        {item.filename || `Photo ${item.photo_id}`}
                      </h3>
                      {item.gallery_photos?.width && item.gallery_photos?.height && (
                        <p className="text-gray-500 text-sm">
                          {item.gallery_photos.width} × {item.gallery_photos.height}
                        </p>
                      )}
                      {isDownloaded && item.download_count > 0 && (
                        <p className="text-gray-500 text-xs mt-1">
                          Downloaded {item.download_count} time{item.download_count > 1 ? 's' : ''}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => downloadPhoto(item.photo_id, item.filename || `photo-${item.photo_id}.jpg`)}
                      disabled={isDownloading}
                      className={`flex-shrink-0 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                        isDownloaded
                          ? 'bg-green-600/20 text-green-400 hover:bg-green-600/30'
                          : 'bg-red-500 hover:bg-red-600 text-white'
                      }`}
                    >
                      {isDownloading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="hidden sm:inline">Downloading...</span>
                        </>
                      ) : isDownloaded ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span className="hidden sm:inline">Download Again</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4" />
                          <span className="hidden sm:inline">Download</span>
                        </>
                      )}
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Videos Section */}
        {hasVideos && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <Video className="w-5 h-5 text-blue-400" />
                {isFreeAccess && galleryClips.length > 0 
                  ? `Your Videos (${galleryClips.length})` 
                  : `Videos (${videoItems.length})`
                }
              </h2>
            </div>

            <div className="space-y-3">
              {/* Gallery clips for free_access orders */}
              {galleryClips.length > 0 && galleryClips.map(clip => {
                const isDownloading = downloadingClip === clip.id

                return (
                  <div
                    key={clip.id}
                    className="bg-dark-800 rounded-lg p-4 flex items-center gap-4"
                  >
                    <div className="w-28 h-20 bg-dark-700 rounded-lg overflow-hidden flex-shrink-0 relative">
                      {clip.thumbnail_url ? (
                        <>
                          <img 
                            src={clip.thumbnail_url} 
                            alt={clip.filename || 'Video'} 
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-10 h-10 bg-black/50 rounded-full flex items-center justify-center">
                              <Play className="w-5 h-5 text-white ml-0.5" />
                            </div>
                          </div>
                        </>
                      ) : (
                        <Video className="w-full h-full text-gray-600 p-4" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-medium truncate">
                        {clip.filename || `Video`}
                      </h3>
                      {clip.duration && (
                        <p className="text-gray-500 text-sm">
                          Duration: {formatDuration(clip.duration)}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => downloadClip(clip.id, clip.filename || `video-${clip.id}.mp4`)}
                      disabled={isDownloading}
                      className="flex-shrink-0 px-4 py-2 rounded-lg flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white transition-colors"
                    >
                      {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                      Download
                    </button>
                  </div>
                )
              })}

              {/* Regular video items for purchased orders */}
              {videoItems.length > 0 && videoItems.map(item => {
                const isDownloaded = downloadedClips.has(item.clip_id)
                const isDownloading = downloadingClip === item.clip_id

                return (
                  <div
                    key={item.id}
                    className="bg-dark-800 rounded-lg p-4 flex items-center gap-4"
                  >
                    <div className="w-28 h-20 bg-dark-700 rounded-lg overflow-hidden flex-shrink-0 relative">
                      {item.thumbnail_url ? (
                        <>
                          <img 
                            src={item.thumbnail_url} 
                            alt={item.title || item.filename || 'Video'} 
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-10 h-10 bg-black/50 rounded-full flex items-center justify-center">
                              <Play className="w-5 h-5 text-white ml-0.5" />
                            </div>
                          </div>
                        </>
                      ) : (
                        <Video className="w-full h-full text-gray-600 p-4" />
                      )}
                      {item.duration_seconds && (
                        <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
                          {formatDuration(item.duration_seconds)}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-medium truncate">
                        {item.title || item.filename || `Video ${item.clip_id}`}
                      </h3>
                      {item.duration_seconds && (
                        <p className="text-gray-500 text-sm">
                          Duration: {formatDuration(item.duration_seconds)}
                        </p>
                      )}
                      {isDownloaded && item.download_count > 0 && (
                        <p className="text-gray-500 text-xs mt-1">
                          Downloaded {item.download_count} time{item.download_count > 1 ? 's' : ''}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => downloadClip(item.clip_id, item.filename || `video-${item.clip_id}.mp4`)}
                      disabled={isDownloading}
                      className={`flex-shrink-0 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                        isDownloaded
                          ? 'bg-green-600/20 text-green-400 hover:bg-green-600/30'
                          : 'bg-blue-500 hover:bg-blue-600 text-white'
                      }`}
                    >
                      {isDownloading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="hidden sm:inline">Downloading...</span>
                        </>
                      ) : isDownloaded ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span className="hidden sm:inline">Download Again</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4" />
                          <span className="hidden sm:inline">Download</span>
                        </>
                      )}
                    </button>
                  </div>
                )
              })}
            </div>

            {/* 4K notice */}
            <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-blue-300 text-sm">
                🎬 <strong>4K Available:</strong> Need higher resolution? 4K copies are available upon request. 
                Contact us at <a href="mailto:info@fitfocusmedia.com.au" className="underline">info@fitfocusmedia.com.au</a>
              </p>
            </div>
          </div>
        )}

        {/* Order Info */}
        <div className="mt-8 p-6 bg-dark-800 rounded-lg">
          <h2 className="text-lg font-semibold text-white mb-4">Order Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-400">Order ID:</span>
              <span className="text-white ml-2 font-mono">{order.id.slice(0, 8)}</span>
            </div>
            <div>
              <span className="text-gray-400">Total Paid:</span>
              <span className="text-white ml-2">${(order.total_amount / 100).toFixed(2)} AUD</span>
            </div>
            <div className="sm:col-span-2">
              <span className="text-gray-400">Email:</span>
              <span className="text-white ml-2 break-all">{order.email}</span>
            </div>
            <div>
              <span className="text-gray-400">Date:</span>
              <span className="text-white ml-2">
                {new Date(order.completed_at || order.created_at).toLocaleDateString()}
              </span>
            </div>
            <div>
              <span className="text-gray-400">Items:</span>
              <span className="text-white ml-2">
                {hasPhotos && `${photoItems.length} photo${photoItems.length > 1 ? 's' : ''}`}
                {hasPhotos && hasVideos && ', '}
                {hasVideos && `${videoItems.length} video${videoItems.length > 1 ? 's' : ''}`}
              </span>
            </div>
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center text-gray-500 text-sm">
          <p>Having trouble? Contact us at info@fitfocusmedia.com.au</p>
        </div>
      </div>
    </div>
  )
}
