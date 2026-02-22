import { useState, useEffect } from 'react'
import { Users, Eye } from 'lucide-react'
import { supabase } from '../lib/supabase'

/**
 * Viewer Count Component
 * Shows real-time count of active viewers for an event
 * Creates social proof and FOMO
 */
export default function ViewerCount({ eventId, className = '' }) {
  const [count, setCount] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!eventId) return

    // Initial fetch
    fetchViewerCount()

    // Poll every 30 seconds for updates
    const interval = setInterval(fetchViewerCount, 30000)

    return () => clearInterval(interval)
  }, [eventId])

  const fetchViewerCount = async () => {
    try {
      // Count active sessions (heartbeat within last 2 minutes)
      const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000).toISOString()
      
      const { count, error } = await supabase
        .from('livestream_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', eventId)
        .gte('last_heartbeat', twoMinutesAgo)

      if (!error) {
        setCount(count || 0)
      }
    } catch (err) {
      console.error('Failed to fetch viewer count:', err)
    } finally {
      setLoading(false)
    }
  }

  // Don't show if still loading or no viewers
  if (loading || count === null) return null

  // Format large numbers
  const formatCount = (n) => {
    if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
    return n.toString()
  }

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 bg-dark-800/80 backdrop-blur-sm rounded-full ${className}`}>
      <div className="relative">
        <Eye className="w-4 h-4 text-red-500" />
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
        )}
      </div>
      <span className="text-sm font-medium text-white">
        {formatCount(count)}
      </span>
      <span className="text-sm text-gray-400">
        {count === 1 ? 'viewer' : 'viewers'}
      </span>
    </div>
  )
}
