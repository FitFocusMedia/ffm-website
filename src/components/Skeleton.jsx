/**
 * Skeleton Loading Component
 * Provides animated placeholder elements during loading
 */

// Base skeleton block
export function Skeleton({ className = '', ...props }) {
  return (
    <div 
      className={`animate-pulse bg-dark-800 rounded ${className}`}
      {...props}
    />
  )
}

// Event card skeleton
export function EventCardSkeleton() {
  return (
    <div className="bg-dark-900 rounded-xl overflow-hidden border border-dark-800">
      <Skeleton className="aspect-video rounded-none" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex gap-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
    </div>
  )
}

// Full event page skeleton
export function EventPageSkeleton() {
  return (
    <div className="py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="grid lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 space-y-6">
            <Skeleton className="aspect-video rounded-xl" />
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <div className="grid sm:grid-cols-2 gap-4">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
            </div>
          </div>
          <div className="lg:col-span-2">
            <div className="bg-dark-900 rounded-xl border border-dark-800 p-6 space-y-4">
              <Skeleton className="h-12 w-32 mx-auto" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-14 w-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Admin table skeleton
export function TableSkeleton({ rows = 5, columns = 4 }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 p-4 bg-dark-900 rounded-lg border border-dark-800">
          {Array.from({ length: columns }).map((_, j) => (
            <Skeleton key={j} className="h-6 flex-1" />
          ))}
        </div>
      ))}
    </div>
  )
}

// Stats card skeleton
export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-dark-900 rounded-lg p-4 border border-dark-800">
          <Skeleton className="h-4 w-20 mb-2" />
          <Skeleton className="h-8 w-16" />
        </div>
      ))}
    </div>
  )
}

export default Skeleton
