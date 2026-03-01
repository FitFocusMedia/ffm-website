import { useState, useRef, useEffect } from 'react'
import { 
  Play, Pause, Volume2, VolumeX, Maximize, Minimize, 
  Settings, Subtitles, PictureInPicture2, Share2, Heart,
  MessageCircle, ThumbsUp, Sparkles
} from 'lucide-react'
import MuxPlayer from '@mux/mux-player-react'

/**
 * Premium Player Wrapper with enhanced UI/UX
 */
export default function PremiumPlayer({
  playbackId,
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
  const containerRef = useRef(null)
  const hideControlsTimer = useRef(null)

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
      // Check if already in fullscreen
      const isInFullscreen = document.fullscreenElement || document.webkitFullscreenElement
      
      if (!isInFullscreen) {
        // Try standard API first (Chrome, Firefox, Edge)
        if (containerRef.current?.requestFullscreen) {
          await containerRef.current.requestFullscreen()
        } 
        // Try webkit API (Safari desktop)
        else if (containerRef.current?.webkitRequestFullscreen) {
          containerRef.current.webkitRequestFullscreen()
        }
        // iOS Safari - need to fullscreen the video element directly
        else {
          const video = containerRef.current?.querySelector('video, mux-player')?.shadowRoot?.querySelector('video') 
            || containerRef.current?.querySelector('video')
          if (video?.webkitEnterFullscreen) {
            video.webkitEnterFullscreen()
          } else if (video?.webkitRequestFullscreen) {
            video.webkitRequestFullscreen()
          }
        }
      } else {
        // Exit fullscreen
        if (document.exitFullscreen) {
          document.exitFullscreen()
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen()
        }
      }
    } catch (err) {
      console.warn('Fullscreen error:', err)
      // Fallback: try to get mux-player to handle it
      const muxPlayer = containerRef.current?.querySelector('mux-player')
      if (muxPlayer) {
        muxPlayer.requestFullscreen?.() || muxPlayer.webkitRequestFullscreen?.()
      }
    }
  }

  // Reactions system
  const addReaction = (emoji) => {
    const id = Date.now()
    const reaction = {
      id,
      emoji,
      x: Math.random() * 80 + 10, // 10-90%
      delay: Math.random() * 0.5
    }
    setReactions(prev => [...prev, reaction])
    
    // Remove after animation
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
      {/* MUX Player */}
      <MuxPlayer
        playbackId={playbackId || 'demo-playback-id'}
        metadata={{
          video_title: title,
          viewer_user_id: viewerEmail
        }}
        streamType={isLive ? 'live' : 'on-demand'}
        autoPlay
        poster={poster}
        className="w-full aspect-video"
      />

      {/* Live Badge Overlay */}
      {isLive && (
        <div className="absolute top-4 left-4 z-10">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500 text-white font-bold rounded-full animate-glow">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
            LIVE
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
