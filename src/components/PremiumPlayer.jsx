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

  return (
    <div 
      ref={containerRef}
      className={`relative bg-black group ${className}`}
    >
      {/* Video Player - MUX or Bunny */}
      {isBunnySource ? (
        <video
          ref={videoRef}
          className="w-full aspect-video"
          poster={poster}
          playsInline
          controls={false}
          onClick={togglePlayPause}
        />
      ) : playbackId ? (
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
      ) : (
        // No valid source available
        <div className="w-full aspect-video bg-dark-900 flex items-center justify-center">
          <div className="text-center p-8">
            <div className="text-6xl mb-4">🎬</div>
            <h3 className="text-xl font-bold text-white mb-2">
              {isLive ? 'Stream Starting Soon' : 'Replay Processing'}
            </h3>
            <p className="text-gray-400">
              {isLive 
                ? 'The live stream will begin shortly. Please wait...'
                : 'This replay is being prepared. Please check back soon.'
              }
            </p>
          </div>
        </div>
      )}

      {/* Live Badge Overlay */}
      {isLive && (
        <div className="absolute top-4 left-4 z-10">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500 text-white font-bold rounded-full animate-glow">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
            LIVE
          </div>
        </div>
      )}

      {/* Bunny Source Badge */}
      {isBunnySource && !isLive && (
        <div className="absolute top-4 right-4 z-10">
          <div className="flex items-center gap-1 px-2 py-1 bg-orange-500/80 text-white text-xs font-medium rounded">
            🐰 VOD
          </div>
        </div>
      )}

      {/* Floating Reactions */}
      <div className="absolute bottom-20 right-4 pointer-events-none overflow-hidden h-64 w-16">
        {reactions.map(reaction => (
          <div
            key={reaction.id}
            className="absolute animate-float text-3xl"
            style={{
              left: `${reaction.x}%`,
              animationDelay: `${reaction.delay}s`,
              bottom: 0
            }}
          >
            {reaction.emoji}
          </div>
        ))}
      </div>

      {/* Reaction Panel */}
      {showReactions && (
        <div className="absolute bottom-20 right-4 z-20 animate-scaleIn">
          <div className="bg-dark-900/90 backdrop-blur-sm rounded-2xl p-3 border border-dark-700">
            <div className="grid grid-cols-3 gap-2">
              {reactionEmojis.map((emoji, i) => (
                <button
                  key={emoji}
                  onClick={() => addReaction(emoji)}
                  className="w-12 h-12 rounded-xl bg-dark-800 hover:bg-dark-700 flex items-center justify-center text-2xl transition-transform hover:scale-110 active:scale-95"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Control Bar */}
      <div 
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="flex items-center justify-between">
          {/* Left Controls */}
          <div className="flex items-center gap-2">
            {/* Bunny-specific controls */}
            {isBunnySource && (
              <>
                <button 
                  onClick={togglePlayPause}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                  title={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </button>
                <button 
                  onClick={toggleMute}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
              </>
            )}
            <button 
              onClick={onShare}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="Share"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2">
            {isLive && (
              <button 
                onClick={() => setShowReactions(!showReactions)}
                className={`p-2 rounded-lg transition-colors ${
                  showReactions 
                    ? 'bg-red-500 text-white' 
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
                title="Reactions"
              >
                <Sparkles className="w-5 h-5" />
              </button>
            )}
            <button 
              onClick={toggleFullscreen}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? (
                <Minimize className="w-5 h-5" />
              ) : (
                <Maximize className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Event Title Overlay (top) */}
      <div 
        className={`absolute top-0 left-0 right-0 bg-gradient-to-b from-black/70 to-transparent p-4 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <h2 className="text-white font-semibold text-lg truncate pr-20">
          {title}
        </h2>
      </div>

      <style jsx>{`
        @keyframes float {
          0% {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translateY(-200px) scale(1.5);
            opacity: 0;
          }
        }
        .animate-float {
          animation: float 3s ease-out forwards;
        }
      `}</style>
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
