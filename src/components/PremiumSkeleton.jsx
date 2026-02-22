/**
 * Premium Skeleton Loading Components
 * Smooth, polished loading states for the livestream platform
 */

// Base shimmer animation
const shimmerClass = 'animate-shimmer bg-gradient-to-r from-dark-800 via-dark-700 to-dark-800 bg-[length:400%_100%]'

/**
 * Event Page Skeleton
 */
export function EventPageSkeleton() {
  return (
    <div className="py-16 px-4 animate-fadeIn">
      <div className="max-w-5xl mx-auto">
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Left Column - Event Details */}
          <div className="lg:col-span-3 space-y-6">
            {/* Thumbnail */}
            <div className={`aspect-video rounded-xl ${shimmerClass}`}></div>
            
            {/* Title & Actions */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-3">
                <div className={`h-8 w-3/4 rounded-lg ${shimmerClass}`}></div>
                <div className={`h-5 w-1/2 rounded-lg ${shimmerClass}`}></div>
              </div>
              <div className="flex gap-2">
                <div className={`h-10 w-10 rounded-lg ${shimmerClass}`}></div>
                <div className={`h-10 w-10 rounded-lg ${shimmerClass}`}></div>
              </div>
            </div>

            {/* Countdown Placeholder */}
            <div className={`h-32 rounded-xl ${shimmerClass}`}></div>

            {/* Event Info Grid */}
            <div className="grid sm:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg ${shimmerClass}`}></div>
                  <div className={`h-4 flex-1 rounded ${shimmerClass}`}></div>
                </div>
              ))}
            </div>

            {/* Description */}
            <div className="space-y-3">
              <div className={`h-4 w-full rounded ${shimmerClass}`}></div>
              <div className={`h-4 w-5/6 rounded ${shimmerClass}`}></div>
              <div className={`h-4 w-4/6 rounded ${shimmerClass}`}></div>
            </div>
          </div>

          {/* Right Column - Purchase Card */}
          <div className="lg:col-span-2">
            <div className={`rounded-2xl p-6 space-y-4 ${shimmerClass}`} style={{ minHeight: '400px' }}>
              <div className={`h-6 w-1/2 rounded ${shimmerClass}`}></div>
              <div className={`h-12 w-2/3 rounded ${shimmerClass}`}></div>
              <div className={`h-12 w-full rounded-xl ${shimmerClass}`}></div>
              <div className={`h-14 w-full rounded-xl ${shimmerClass}`}></div>
              <div className="space-y-3 pt-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full ${shimmerClass}`}></div>
                    <div className={`h-4 flex-1 rounded ${shimmerClass}`}></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Watch Page Skeleton
 */
export function WatchPageSkeleton() {
  return (
    <div className="min-h-screen bg-dark-950 animate-fadeIn">
      {/* Player Area */}
      <div className="w-full bg-black">
        <div className="max-w-6xl mx-auto">
          <div className={`aspect-video ${shimmerClass}`}></div>
        </div>
      </div>

      {/* Event Info */}
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-3">
            <div className={`h-8 w-64 rounded-lg ${shimmerClass}`}></div>
            <div className={`h-5 w-40 rounded ${shimmerClass}`}></div>
          </div>
          <div className={`h-10 w-32 rounded-full ${shimmerClass}`}></div>
        </div>

        <div className="flex flex-wrap gap-6">
          {[1, 2].map(i => (
            <div key={i} className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded ${shimmerClass}`}></div>
              <div className={`h-4 w-32 rounded ${shimmerClass}`}></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/**
 * Admin Event Card Skeleton
 */
export function EventCardSkeleton() {
  return (
    <div className="bg-dark-900 rounded-xl border border-dark-800 p-4 space-y-4 animate-fadeIn">
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-2">
          <div className={`h-6 w-3/4 rounded ${shimmerClass}`}></div>
          <div className={`h-4 w-1/2 rounded ${shimmerClass}`}></div>
        </div>
        <div className="flex gap-2">
          <div className={`h-6 w-16 rounded-full ${shimmerClass}`}></div>
          <div className={`h-6 w-20 rounded-full ${shimmerClass}`}></div>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className={`h-4 w-32 rounded ${shimmerClass}`}></div>
        <div className={`h-4 w-24 rounded ${shimmerClass}`}></div>
      </div>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className={`h-8 w-8 rounded ${shimmerClass}`}></div>
        ))}
      </div>
    </div>
  )
}

/**
 * Stats Card Skeleton
 */
export function StatsCardSkeleton() {
  return (
    <div className="bg-dark-900 rounded-xl border border-dark-800 p-6 animate-fadeIn">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-lg ${shimmerClass}`}></div>
        <div className="flex-1 space-y-2">
          <div className={`h-8 w-24 rounded ${shimmerClass}`}></div>
          <div className={`h-4 w-32 rounded ${shimmerClass}`}></div>
        </div>
      </div>
    </div>
  )
}

/**
 * Table Row Skeleton
 */
export function TableRowSkeleton({ columns = 5 }) {
  return (
    <tr className="animate-fadeIn">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className={`h-4 rounded ${shimmerClass}`} style={{ width: `${60 + Math.random() * 40}%` }}></div>
        </td>
      ))}
    </tr>
  )
}

/**
 * Pulse Dot - for loading indicators
 */
export function PulseDot({ color = 'red', size = 'default' }) {
  const sizeClasses = {
    small: 'w-2 h-2',
    default: 'w-3 h-3',
    large: 'w-4 h-4'
  }
  
  const colorClasses = {
    red: 'bg-red-500',
    green: 'bg-green-500',
    blue: 'bg-blue-500',
    yellow: 'bg-yellow-500'
  }

  return (
    <span className="relative flex">
      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${colorClasses[color]} opacity-75`}></span>
      <span className={`relative inline-flex rounded-full ${sizeClasses[size]} ${colorClasses[color]}`}></span>
    </span>
  )
}
