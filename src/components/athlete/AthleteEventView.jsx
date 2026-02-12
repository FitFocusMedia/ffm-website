import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, MapPin, Package, Image as ImageIcon, Video, Download, Share2, X, ChevronLeft, ChevronRight, Play, Facebook, Instagram, Twitter } from 'lucide-react'
import AthleteLayout from './AthleteLayout'
import { getEventById, getEventContent, formatDate, getPackageLabel, getPackageColor, getDriveDownloadUrl } from '../../lib/athleteHelpers'

export default function AthleteEventView() {
  const { eventId } = useParams()
  const navigate = useNavigate()
  const [athlete, setAthlete] = useState(null)
  const [event, setEvent] = useState(null)
  const [content, setContent] = useState([])
  const [activeTab, setActiveTab] = useState('photos')
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  useEffect(() => {
    const athleteData = sessionStorage.getItem('athlete_user')
    if (!athleteData) {
      navigate('/athlete')
      return
    }

    const athleteObj = JSON.parse(athleteData)
    setAthlete(athleteObj)

    // Load event and content
    const eventData = getEventById(eventId)
    if (!eventData) {
      navigate('/athlete/dashboard')
      return
    }

    const eventContent = getEventContent(athleteObj.id, eventId)
    setEvent(eventData)
    setContent(eventContent)

    // Default to videos tab if no photos
    const photos = eventContent.filter(c => c.type === 'photo')
    const videos = eventContent.filter(c => c.type === 'video')
    if (photos.length === 0 && videos.length > 0) {
      setActiveTab('videos')
    }
  }, [eventId, navigate])

  const photos = content.filter(c => c.type === 'photo')
  const videos = content.filter(c => c.type === 'video')

  const handleDownloadAll = (type) => {
    const items = type === 'photos' ? photos : videos
    items.forEach((item, index) => {
      setTimeout(() => {
        const a = document.createElement('a')
        a.href = getDriveDownloadUrl(item.drive_url)
        a.download = item.title || `${type}-${index + 1}`
        a.click()
      }, index * 500)
    })
  }

  const handleShare = (item, platform) => {
    const url = encodeURIComponent(item.drive_url)
    const text = encodeURIComponent(`Check out my ${item.title} from ${event.name}!`)
    
    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      instagram: item.drive_url, // Instagram doesn't support direct sharing, copy link
      twitter: `https://twitter.com/intent/tweet?url=${url}&text=${text}`
    }

    if (platform === 'instagram') {
      navigator.clipboard.writeText(item.drive_url)
      alert('Link copied! Paste it in your Instagram post.')
    } else {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400')
    }
  }

  const openLightbox = (index) => {
    setLightboxIndex(index)
    setLightboxOpen(true)
  }

  const closeLightbox = () => {
    setLightboxOpen(false)
  }

  const nextImage = () => {
    setLightboxIndex((prev) => (prev + 1) % photos.length)
  }

  const prevImage = () => {
    setLightboxIndex((prev) => (prev - 1 + photos.length) % photos.length)
  }

  if (!athlete || !event) return null

  return (
    <AthleteLayout>
      {/* Back Button */}
      <Link
        to="/athlete/dashboard"
        className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Back to Dashboard</span>
      </Link>

      {/* Event Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-[#1a1a2e]/80 to-[#1a1a2e]/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8 mb-8"
      >
        {/* Package Badge */}
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${getPackageColor(content[0]?.package_type)} border mb-4`}>
          <Package className="w-4 h-4" />
          <span className="text-sm font-semibold">{getPackageLabel(content[0]?.package_type)}</span>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">{event.name}</h1>

        <div className="flex flex-wrap items-center gap-6 text-gray-300">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#e51d1d]" />
            <span>{formatDate(event.date)}</span>
          </div>
          {event.venue && (
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#e51d1d]" />
              <span>{event.venue}</span>
            </div>
          )}
          {event.org_name && (
            <div className="text-gray-400">
              Organized by <span className="text-white font-semibold">{event.org_name}</span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex items-center gap-4 mb-6 border-b border-white/10">
        <button
          onClick={() => setActiveTab('photos')}
          className={`flex items-center gap-2 px-4 py-3 font-semibold transition-all ${
            activeTab === 'photos'
              ? 'text-[#e51d1d] border-b-2 border-[#e51d1d]'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <ImageIcon className="w-5 h-5" />
          <span>Photos ({photos.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('videos')}
          className={`flex items-center gap-2 px-4 py-3 font-semibold transition-all ${
            activeTab === 'videos'
              ? 'text-[#e51d1d] border-b-2 border-[#e51d1d]'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Video className="w-5 h-5" />
          <span>Videos ({videos.length})</span>
        </button>
      </div>

      {/* Photos Tab */}
      {activeTab === 'photos' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {photos.length === 0 ? (
            <div className="bg-[#1a1a2e]/50 backdrop-blur-xl border border-white/10 rounded-xl p-12 text-center">
              <ImageIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No photos available</h3>
              <p className="text-gray-400">Photos for this event will be added soon.</p>
            </div>
          ) : (
            <>
              {/* Download All Button */}
              <div className="flex justify-end mb-4">
                <button
                  onClick={() => handleDownloadAll('photos')}
                  className="flex items-center gap-2 bg-gradient-to-r from-[#e51d1d] to-red-600 text-white font-semibold px-6 py-3 rounded-lg hover:from-red-600 hover:to-[#e51d1d] transition-all"
                >
                  <Download className="w-5 h-5" />
                  Download All Photos
                </button>
              </div>

              {/* Photo Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {photos.map((photo, index) => (
                  <motion.div
                    key={photo.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="group relative aspect-square rounded-lg overflow-hidden bg-[#1a1a2e]/50 border border-white/10 hover:border-[#e51d1d]/50 transition-all cursor-pointer"
                    onClick={() => openLightbox(index)}
                  >
                    <img
                      src={photo.thumbnail_url}
                      alt={photo.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                      <p className="text-white text-sm font-medium truncate">{photo.title}</p>
                    </div>
                    {/* Quick Actions */}
                    <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <a
                        href={getDriveDownloadUrl(photo.drive_url)}
                        download
                        onClick={(e) => e.stopPropagation()}
                        className="bg-black/50 backdrop-blur-sm p-2 rounded-lg hover:bg-[#e51d1d] transition-colors"
                      >
                        <Download className="w-4 h-4 text-white" />
                      </a>
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </motion.div>
      )}

      {/* Videos Tab */}
      {activeTab === 'videos' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {videos.length === 0 ? (
            <div className="bg-[#1a1a2e]/50 backdrop-blur-xl border border-white/10 rounded-xl p-12 text-center">
              <Video className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No videos available</h3>
              <p className="text-gray-400">Videos for this event will be added soon.</p>
            </div>
          ) : (
            <>
              {/* Download All Button */}
              <div className="flex justify-end mb-4">
                <button
                  onClick={() => handleDownloadAll('videos')}
                  className="flex items-center gap-2 bg-gradient-to-r from-[#e51d1d] to-red-600 text-white font-semibold px-6 py-3 rounded-lg hover:from-red-600 hover:to-[#e51d1d] transition-all"
                >
                  <Download className="w-5 h-5" />
                  Download All Videos
                </button>
              </div>

              {/* Video Grid */}
              <div className="grid md:grid-cols-2 gap-6">
                {videos.map((video, index) => (
                  <motion.div
                    key={video.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-[#1a1a2e]/50 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden hover:border-[#e51d1d]/50 transition-all"
                  >
                    {/* Video Thumbnail */}
                    <div className="relative aspect-video bg-black group">
                      <img
                        src={video.thumbnail_url}
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/50 transition-colors">
                        <div className="w-16 h-16 rounded-full bg-[#e51d1d]/80 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Play className="w-8 h-8 text-white ml-1" />
                        </div>
                      </div>
                      {video.duration && (
                        <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-sm px-2 py-1 rounded text-xs text-white font-medium">
                          {video.duration}
                        </div>
                      )}
                    </div>

                    {/* Video Info */}
                    <div className="p-5">
                      <h3 className="text-lg font-bold text-white mb-3">{video.title}</h3>

                      {/* Actions */}
                      <div className="flex flex-wrap gap-2">
                        <a
                          href={getDriveDownloadUrl(video.drive_url)}
                          download
                          className="flex items-center gap-2 bg-gradient-to-r from-[#e51d1d] to-red-600 text-white font-semibold px-4 py-2 rounded-lg hover:from-red-600 hover:to-[#e51d1d] transition-all text-sm"
                        >
                          <Download className="w-4 h-4" />
                          Download
                        </a>
                        
                        {/* Share Buttons */}
                        <button
                          onClick={() => handleShare(video, 'facebook')}
                          className="flex items-center gap-2 bg-blue-600/20 border border-blue-500/30 text-blue-400 font-medium px-4 py-2 rounded-lg hover:bg-blue-600/30 transition-all text-sm"
                        >
                          <Facebook className="w-4 h-4" />
                          Share
                        </button>
                        <button
                          onClick={() => handleShare(video, 'instagram')}
                          className="flex items-center gap-2 bg-pink-600/20 border border-pink-500/30 text-pink-400 font-medium px-4 py-2 rounded-lg hover:bg-pink-600/30 transition-all text-sm"
                        >
                          <Instagram className="w-4 h-4" />
                          Copy Link
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </motion.div>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxOpen && photos[lightboxIndex] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4"
            onClick={closeLightbox}
          >
            {/* Close Button */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors z-10"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            {/* Navigation */}
            {photos.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); prevImage(); }}
                  className="absolute left-4 p-3 rounded-lg bg-white/10 hover:bg-white/20 transition-colors z-10"
                >
                  <ChevronLeft className="w-6 h-6 text-white" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); nextImage(); }}
                  className="absolute right-4 p-3 rounded-lg bg-white/10 hover:bg-white/20 transition-colors z-10"
                >
                  <ChevronRight className="w-6 h-6 text-white" />
                </button>
              </>
            )}

            {/* Image */}
            <motion.img
              key={lightboxIndex}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              src={photos[lightboxIndex].drive_url}
              alt={photos[lightboxIndex].title}
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />

            {/* Info Bar */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
              <div className="max-w-4xl mx-auto flex items-center justify-between">
                <div>
                  <p className="text-white font-semibold">{photos[lightboxIndex].title}</p>
                  <p className="text-gray-400 text-sm">{lightboxIndex + 1} of {photos.length}</p>
                </div>
                <a
                  href={getDriveDownloadUrl(photos[lightboxIndex].drive_url)}
                  download
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-2 bg-[#e51d1d] text-white font-semibold px-6 py-3 rounded-lg hover:bg-red-600 transition-all"
                >
                  <Download className="w-5 h-5" />
                  Download
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </AthleteLayout>
  )
}
