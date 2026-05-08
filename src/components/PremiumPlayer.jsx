import { useState, useRef, useEffect } from 'react'
import { 
  Play, Pause, Volume2, VolumeX, Maximize, Minimize, 
  Settings, Subtitles, PictureInPicture2, Share2, Heart,
  MessageCircle, ThumbsUp, Sparkles
} from 'lucide-react'
import MuxPlayer from '@mux/mux-player-react'
import Hls from 'hls.js'

// Bunny Stream CDN URL pattern
const BUNNY_CDN_URL = 'https://vz-66967d38-080.b-cdn.net'

/**
 * Premium Player Wrapper with enhanced UI/UX
 * Supports both MUX and Bunny Stream playback
 */
export default function PremiumPlayer({
  playbackId,          // MUX playback ID
  bunnyVideoId,        // Bunny Stream video GUID
  bunnyLibraryId,      // Bunny Stream library ID (optional, uses default CDN)
  title,
  poster,
  isLive = false,
  viewerEmail = '',
  onShare,
  className = ''
}) {
  const [showControls, setShowControls] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showReactions, setShowReactions] = useState(false)
  const [bunnyProcessing, setBunnyProcessing] = useState(null) // null = checking, true = processing, false = ready
  const [reactions, setReactions] = useState([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const containerRef = useRef(null)
  const videoRef = useRef(null)
  const hlsRef = useRef(null)
  const hideControlsTimer = useRef(null)

  // Determine playback source
  const isBunnySource = !!bunnyVideoId
  const bunnyHlsUrl = bunnyVideoId 
    ? `${BUNNY_CDN_URL}/${bunnyVideoId}/playlist.m3u8`
    : null

  // Check if Bunny video is still processing
  useEffect(() => {
    if (!isBunnySource || !bunnyVideoId) return
    
    const checkProcessing = async () => {
      try {
        const response = await fetch(bunnyHlsUrl, { method: 'HEAD' })
        // 403 = video exists but still processing, 200 = ready
        if (response.status === 403) {
          setBunnyProcessing(true)
        } else {
          setBunnyProcessing(false)
        }
      } catch (err) {
        // Network error likely means still processing
        setBunnyProcessing(true)
      }
    }
    
    checkProcessing()
    // Re-check every 30 seconds while processing
    const interval = setInterval(checkProcessing, 30000)
    return () => clearInterval(interval)
  }, [isBunnySource, bunnyVideoId, bunnyHlsUrl])

  // Initialize HLS.js for Bunny Stream
  useEffect(() => {
    if (!isBunnySource || !videoRef.current) return

    const video = videoRef.current

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 90
      })
      
      hls.loadSource(bunnyHlsUrl)
      hls.attachMedia(video)
      
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(err => console.log('Autoplay prevented:', err))
      })
      
      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          console.error('HLS fatal error:', data)
          if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad()
          } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError()
          }
        }
      })
      
      hlsRef.current = hls
      
      return () => {
        hls.destroy()
        hlsRef.current = null
      }
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS support (Safari)
      video.src = bunnyHlsUrl
      video.addEventListener('loadedmetadata', () => {
        video.play().catch(err => console.log('Autoplay prevented:', err))
      })
    }
  }, [isBunnySource, bunnyHlsUrl])

  // Track play state for Bunny player
  useEffect(() => {
    if (!isBunnySource || !videoRef.current) return
    
    const video = videoRef.current
    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)
    const handleVolumeChange = () => setIsMuted(video.muted)
    
    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)
    video.addEventListener('volumechange', handleVolumeChange)
    
    return () => {
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
      video.removeEventListener('volumechange', handleVolumeChange)
    }
  }, [isBunnySource])

  // Auto-hide controls
  useEffect(() => {
    const handleMouseMove = () => {
      setShowControls(true)
      clearTimeout(hideControlsTimer.current)
      hideControlsTimer.current = setTimeout(() => {
        setShowControls(false)
      }, 3000)
    }

    const container = containerRef.current
    if (container) {
      container.addEventListener('mousemove', handleMouseMove)
      return () => container.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  // Fullscreen handling - with iOS support
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement || !!document.webkitFullscreenElement)
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
    }
  }, [])

  const toggleFullscreen = async () => {
    try {
      const isInFullscreen = document.fullscreenElement || document.webkitFullscreenElement
      
      if (!isInFullscreen) {
        if (containerRef.current?.requestFullscreen) {
          await containerRef.current.requestFullscreen()
        } else if (containerRef.current?.webkitRequestFullscreen) {
          containerRef.current.webkitRequestFullscreen()
        } else {
          // iOS Safari
          const video = videoRef.current || containerRef.current?.querySelector('video')
          if (video?.webkitEnterFullscreen) {
            video.webkitEnterFullscreen()
          }
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen()
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen()
        }
      }
    } catch (err) {
      console.warn('Fullscreen error:', err)
    }
  }

  const togglePlayPause = () => {
    if (!videoRef.current) return
    if (videoRef.current.paused) {
      videoRef.current.play()
    } else {
      videoRef.current.pause()
    }
  }

  const toggleMute = () => {
    if (!videoRef.current) return
    videoRef.current.muted = !videoRef.current.muted
  }

  // Reactions system
  const addReaction = (emoji) => {
    const id = Date.now()
    const reaction = {
      id,
      emoji,
      x: Math.random() * 80 + 10,
      delay: Math.random() * 0.5
    }
    setReactions(prev => [...prev, reaction])
    setTimeout(() => {
      setReactions(prev => prev.filter(r => r.id !== id))
    }, 3000)
  }

  const reactionEmojis = ['🔥', '👏', '❤️', '😮', '💪', '🎉']

  // For MUX: render completely clean - no overlays, let MUX handle everything
  if (!isBunnySource && playbackId) {
    return (
      <div className={`relative bg-black ${className}`}>
        <MuxPlayer
          playbackId={playbackId}
          metadata={{
            video_title: title,
            viewer_user_id: viewerEmail
          }}
          streamType={isLive ? 'live' : 'on-demand'}
          autoPlay
          poster={poster}
          className="w-full aspect-video"
        />
      </div>
    )
  }

  // For Bunny: use their iframe embed player which has proper controls
  if (isBunnySource) {
    // Show processing message if video is still encoding (or still checking)
    if (bunnyProcessing === null || bunnyProcessing === true) {
      return (
        <div className={`relative bg-black ${className}`}>
          <div className="w-full aspect-video bg-dark-900 flex items-center justify-center px-4">
            <div className="text-center p-4 md:p-8 max-w-sm">
              <div className="text-4xl md:text-6xl mb-3 md:mb-4">⏳</div>
              <h3 className="text-base md:text-xl font-bold text-white mb-2">
                Stream Recording Processing
              </h3>
              <p className="text-sm md:text-base text-gray-400 mb-3 md:mb-4">
                Replays will be available shortly once processing is completed.
              </p>
              <div className="flex items-center justify-center gap-2 text-xs md:text-sm text-gray-500">
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                <span>This page will update automatically</span>
              </div>
            </div>
          </div>
        </div>
      )
    }
    
    const embedUrl = `https://iframe.mediadelivery.net/embed/${bunnyLibraryId || '612038'}/${bunnyVideoId}?autoplay=true&preload=true&responsive=true`
    return (
      <div className={`relative bg-black ${className}`}>
        <iframe
          src={embedUrl}
          className="w-full aspect-video"
          loading="eager"
          allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
        />
      </div>
    )
  }

  // No valid source - placeholder
  // For non-live (VOD), show processing message instead of generic fallback
  return (
    <div className={`relative bg-black ${className}`}>
      <div className="w-full aspect-video bg-dark-900 flex items-center justify-center px-4">
        <div className="text-center p-4 md:p-8 max-w-sm">
          <div className="text-4xl md:text-6xl mb-3 md:mb-4">{isLive ? '🎬' : '⏳'}</div>
          <h3 className="text-base md:text-xl font-bold text-white mb-2">
            {isLive ? 'Stream Starting Soon' : 'Stream Recording Processing'}
          </h3>
          <p className="text-sm md:text-base text-gray-400 mb-3 md:mb-4">
            {isLive 
              ? 'The live stream will begin shortly. Please wait...'
              : 'Replays will be available shortly once processing is completed.'
            }
          </p>
          {!isLive && (
            <div className="flex items-center justify-center gap-2 text-xs md:text-sm text-gray-500">
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
              <span>This page will update automatically</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * Theater Mode Wrapper
 */
export function TheaterMode({ children, enabled = false, onToggle }) {
  if (!enabled) return children

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
      <button
        onClick={onToggle}
        className="absolute top-4 right-4 z-60 p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white"
      >
        <Minimize className="w-6 h-6" />
      </button>
      <div className="w-full max-w-7xl">
        {children}
      </div>
    </div>
  )
}
