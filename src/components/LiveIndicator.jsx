import { useState, useEffect } from 'react'
import { Users, Eye, TrendingUp } from 'lucide-react'

/**
 * Premium Live Indicator with viewer count and social proof
 */
export default function LiveIndicator({ 
  isLive = false, 
  viewerCount = 0,
  showViewers = true,
  size = 'default', // 'small', 'default', 'large'
  className = '' 
}) {
  const [displayCount, setDisplayCount] = useState(viewerCount)
  const [isIncreasing, setIsIncreasing] = useState(false)

  // Animate viewer count changes
  useEffect(() => {
    if (viewerCount > displayCount) {
      setIsIncreasing(true)
      setTimeout(() => setIsIncreasing(false), 1000)
    }
    
    // Smooth count animation
    const diff = viewerCount - displayCount
    if (Math.abs(diff) > 10) {
      // Large jump - animate quickly
      const step = Math.ceil(diff / 10)
      const interval = setInterval(() => {
        setDisplayCount(prev => {
          const next = prev + step
          if ((step > 0 && next >= viewerCount) || (step < 0 && next <= viewerCount)) {
            clearInterval(interval)
            return viewerCount
          }
          return next
        })
      }, 50)
      return () => clearInterval(interval)
    } else {
      setDisplayCount(viewerCount)
    }
  }, [viewerCount])

  const sizeClasses = {
    small: {
      container: 'px-2 py-1 text-xs gap-1.5',
      dot: 'w-1.5 h-1.5',
      icon: 'w-3 h-3'
    },
    default: {
      container: 'px-3 py-1.5 text-sm gap-2',
      dot: 'w-2 h-2',
      icon: 'w-4 h-4'
    },
    large: {
      container: 'px-4 py-2 text-base gap-2.5',
      dot: 'w-2.5 h-2.5',
      icon: 'w-5 h-5'
    }
  }

  const s = sizeClasses[size]

  if (!isLive) {
    return null
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Live Badge */}
      <div className={`inline-flex items-center ${s.container} bg-gradient-to-r from-red-600 to-red-500 text-white font-bold rounded-full shadow-lg shadow-red-500/25`}>
        <span className={`${s.dot} bg-white rounded-full animate-pulse`}></span>
        <span className="uppercase tracking-wide">Live</span>
      </div>

      {/* Viewer Count */}
      {showViewers && displayCount > 0 && (
        <div className={`inline-flex items-center ${s.container} bg-dark-800/90 backdrop-blur-sm text-white rounded-full border border-dark-700`}>
          <Eye className={`${s.icon} text-gray-400`} />
          <span className={`font-semibold tabular-nums ${isIncreasing ? 'text-green-400' : ''}`}>
            {displayCount.toLocaleString()}
          </span>
          {isIncreasing && (
            <TrendingUp className={`${s.icon} text-green-400 animate-bounce`} />
          )}
        </div>
      )}
    </div>
  )
}

/**
 * Compact viewer avatars display
 */
export function ViewerAvatars({ count = 0, maxDisplay = 5, className = '' }) {
  if (count === 0) return null

  const displayCount = Math.min(count, maxDisplay)
  const extraCount = count - displayCount

  // Generate placeholder avatar colors
  const colors = [
    'bg-red-500',
    'bg-blue-500', 
    'bg-green-500',
    'bg-yellow-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500'
  ]

  return (
    <div className={`flex items-center ${className}`}>
      <div className="flex -space-x-2">
        {Array.from({ length: displayCount }).map((_, i) => (
          <div
            key={i}
            className={`w-8 h-8 rounded-full ${colors[i % colors.length]} border-2 border-dark-900 flex items-center justify-center text-white text-xs font-bold`}
            style={{ zIndex: displayCount - i }}
          >
            {String.fromCharCode(65 + (i % 26))}
          </div>
        ))}
        {extraCount > 0 && (
          <div 
            className="w-8 h-8 rounded-full bg-dark-700 border-2 border-dark-900 flex items-center justify-center text-white text-xs font-bold"
            style={{ zIndex: 0 }}
          >
            +{extraCount > 99 ? '99' : extraCount}
          </div>
        )}
      </div>
      <span className="ml-3 text-gray-400 text-sm">
        {count.toLocaleString()} watching
      </span>
    </div>
  )
}

/**
 * Social proof banner for event pages
 */
export function SocialProofBanner({ 
  viewerCount = 0, 
  purchaseCount = 0,
  recentPurchases = [],
  className = '' 
}) {
  const [currentPurchase, setCurrentPurchase] = useState(0)

  // Rotate through recent purchases
  useEffect(() => {
    if (recentPurchases.length <= 1) return
    
    const interval = setInterval(() => {
      setCurrentPurchase(prev => (prev + 1) % recentPurchases.length)
    }, 5000)
    
    return () => clearInterval(interval)
  }, [recentPurchases.length])

  if (purchaseCount === 0 && viewerCount === 0) return null

  return (
    <div className={`bg-dark-800/50 backdrop-blur-sm border border-dark-700 rounded-lg p-4 ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Stats */}
        <div className="flex items-center gap-6">
          {viewerCount > 0 && (
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-red-500" />
              <span className="text-white font-semibold">{viewerCount.toLocaleString()}</span>
              <span className="text-gray-400 text-sm">viewing now</span>
            </div>
          )}
          {purchaseCount > 0 && (
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-green-500" />
              <span className="text-white font-semibold">{purchaseCount.toLocaleString()}</span>
              <span className="text-gray-400 text-sm">purchased</span>
            </div>
          )}
        </div>

        {/* Recent purchase notification */}
        {recentPurchases.length > 0 && (
          <div className="flex items-center gap-2 text-sm animate-fadeIn">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-gray-400">
              <span className="text-white font-medium">{recentPurchases[currentPurchase]?.name || 'Someone'}</span>
              {' '}just purchased
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
