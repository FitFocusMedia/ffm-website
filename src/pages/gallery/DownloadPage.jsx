import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Download, Check, AlertTriangle, Loader2, Clock, Image } from 'lucide-react'
import { supabase } from '../../lib/supabase'

export default function GalleryDownloadPage() {
  const { token } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [downloadingPhoto, setDownloadingPhoto] = useState(null)
  const [downloadedPhotos, setDownloadedPhotos] = useState(new Set())

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
      
      // Track already downloaded photos (handle both API formats)
      const downloaded = new Set()
      const orderItems = data.order.gallery_order_items || data.order.items || []
      orderItems.forEach(item => {
        if (item.downloaded) {
          downloaded.add(item.photo_id)
        }
      })
      setDownloadedPhotos(downloaded)
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
      const response = await fetch(
        `https://gonalgubgldgpkcekaxe.supabase.co/functions/v1/gallery_download?token=${token}&photo_id=${photoId}`
      )
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Download failed')
      }

      // Trigger download
      const link = document.createElement('a')
      link.href = data.download_url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // Mark as downloaded
      setDownloadedPhotos(prev => new Set([...prev, photoId]))
    } catch (err) {
      console.error('Download error:', err)
      alert('Download failed: ' + err.message)
    } finally {
      setDownloadingPhoto(null)
    }
  }

  const downloadAll = async () => {
    const items = order.gallery_order_items || order.items || []
    for (const item of items) {
      if (!downloadedPhotos.has(item.photo_id)) {
        await downloadPhoto(item.photo_id, item.gallery_photos?.filename || item.filename || `photo-${item.photo_id}.jpg`)
        // Small delay between downloads
        await new Promise(resolve => setTimeout(resolve, 500))
      }
    }
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

  const items = order.gallery_order_items || order.items || []
  const allDownloaded = items.every(item => downloadedPhotos.has(item.photo_id))
  const expiresAt = new Date(order.token_expires_at)
  const daysLeft = Math.ceil((expiresAt - new Date()) / (1000 * 60 * 60 * 24))

  return (
    <div className="py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Your Photos Are Ready!</h1>
          <p className="text-gray-400">
            Thank you for your purchase from {order.galleries?.title}
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

        {/* Download All Button */}
        {items.length > 1 && !allDownloaded && (
          <button
            onClick={downloadAll}
            disabled={downloadingPhoto}
            className="w-full mb-6 bg-red-500 hover:bg-red-600 disabled:bg-gray-600 text-white font-semibold py-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" />
            Download All ({items.length} photos)
          </button>
        )}

        {/* Photo List */}
        <div className="space-y-4">
          {items.map(item => {
            // Handle both API formats: nested (gallery_photos) and flattened (direct properties)
            const photo = item.gallery_photos || item
            const filename = item.gallery_photos?.filename || item.filename
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
                      alt={filename || 'Photo'} 
                      className="w-full h-full object-cover"
                    />
                  ) : filename ? (
                    <Image className="w-full h-full text-gray-600 p-4" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                      No preview
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-medium truncate">
                    {filename || `Photo ${item.photo_id}`}
                  </h3>
                  {photo?.width && photo?.height && (
                    <p className="text-gray-500 text-sm">
                      {photo.width} × {photo.height}
                    </p>
                  )}
                  {isDownloaded && item.download_count > 0 && (
                    <p className="text-gray-500 text-xs mt-1">
                      Downloaded {item.download_count} time{item.download_count > 1 ? 's' : ''}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => downloadPhoto(item.photo_id, filename || `photo-${item.photo_id}.jpg`)}
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
                      <span>Downloading...</span>
                    </>
                  ) : isDownloaded ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Download Again</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>Download</span>
                    </>
                  )}
                </button>
              </div>
            )
          })}
        </div>

        {/* Order Info */}
        <div className="mt-8 p-6 bg-dark-800 rounded-lg">
          <h2 className="text-lg font-semibold text-white mb-4">Order Details</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Order ID:</span>
              <span className="text-white ml-2 font-mono">{order.id.slice(0, 8)}</span>
            </div>
            <div>
              <span className="text-gray-400">Email:</span>
              <span className="text-white ml-2">{order.email}</span>
            </div>
            <div>
              <span className="text-gray-400">Total Paid:</span>
              <span className="text-white ml-2">${(order.total_amount / 100).toFixed(2)} AUD</span>
            </div>
            <div>
              <span className="text-gray-400">Date:</span>
              <span className="text-white ml-2">
                {new Date(order.completed_at || order.created_at).toLocaleDateString()}
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
