import { useState, useEffect } from 'react'
import { Radio, RefreshCw, Wifi, WifiOff } from 'lucide-react'
import { supabase, getEventStreams } from '../lib/supabase'

/**
 * Stream Status Badge Component
 * Shows MUX stream status: LIVE, IDLE, ERROR, or NO STREAM
 * Supports both single-stream and multi-stream events
 */
export default function StreamStatusBadge({ event, onStatusUpdate, compact = false }) {
  const [checking, setChecking] = useState(false)
  const [lastChecked, setLastChecked] = useState(null)
  const [streamCount, setStreamCount] = useState(0)
  const [liveStreamCount, setLiveStreamCount] = useState(0)

  // For multi-stream events, check stream statuses
  useEffect(() => {
    if (!event?.is_multi_stream) return

    const checkMultiStreamStatus = async () => {
      try {
        const streams = await getEventStreams(event.id)
        setStreamCount(streams?.length || 0)

        // Check MUX status for each stream
        if (streams && streams.length > 0) {
          const streamsWithMux = streams.filter(s => s.mux_stream_id)
          let liveCount = 0

          for (const stream of streamsWithMux) {
            try {
              const { data, error } = await supabase.functions.invoke('mux-stream', {
                body: { action: 'stream-status', mux_stream_id: stream.mux_stream_id }
              })
              if (!error && data?.isLive) {
                liveCount++
              }
            } catch (err) {
              console.warn('Stream status check failed:', err)
            }
          }
          setLiveStreamCount(liveCount)
        }
      } catch (err) {
        console.error('Failed to check multi-stream status:', err)
      }
    }

    checkMultiStreamStatus()
    // Poll every 30 seconds
    const interval = setInterval(checkMultiStreamStatus, 30000)
    return () => clearInterval(interval)
  }, [event?.id, event?.is_multi_stream])

  const checkStatus = async () => {
    if (event?.is_multi_stream) {
      // For multi-stream, refresh the useEffect
      setChecking(true)
      try {
        const streams = await getEventStreams(event.id)
        setStreamCount(streams?.length || 0)
        
        if (streams && streams.length > 0) {
          const streamsWithMux = streams.filter(s => s.mux_stream_id)
          let liveCount = 0

          for (const stream of streamsWithMux) {
            try {
              const { data, error } = await supabase.functions.invoke('mux-stream', {
                body: { action: 'stream-status', mux_stream_id: stream.mux_stream_id }
              })
              if (!error && data?.isLive) {
                liveCount++
              }
            } catch (err) {
              console.warn('Stream status check failed:', err)
            }
          }
          setLiveStreamCount(liveCount)
        }
        setLastChecked(new Date())
      } catch (err) {
        console.error('Status check failed:', err)
      } finally {
        setChecking(false)
      }
      return
    }

    // Single stream check
    if (!event?.mux_live_stream_id && !event?.mux_stream_id) return
    
    setChecking(true)
    try {
      const { data, error } = await supabase.functions.invoke('mux-stream', {
        body: { action: 'status', event_id: event.id }
      })
      
      if (!error && data) {
        setLastChecked(new Date())
        if (onStatusUpdate) {
          onStatusUpdate(data)
        }
      }
    } catch (err) {
      console.error('Status check failed:', err)
    } finally {
      setChecking(false)
    }
  }

  // Multi-stream event handling
  if (event?.is_multi_stream) {
    const isLive = liveStreamCount > 0
    
    if (streamCount === 0) {
      return (
        <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium bg-purple-500/20 text-purple-400 ${compact ? '' : 'mr-2'}`}>
          <Wifi className="w-3 h-3" />
          {!compact && 'Multi-Stream (0)'}
        </span>
      )
    }

    return (
      <div className={`inline-flex items-center gap-2 ${compact ? '' : 'mr-2'}`}>
        <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium ${
          isLive ? 'bg-red-500 text-white' : 'bg-purple-500/20 text-purple-400'
        }`}>
          <Radio className={`w-3 h-3 ${isLive ? 'animate-pulse' : ''}`} />
          {isLive ? `LIVE (${liveStreamCount}/${streamCount})` : `${streamCount} streams`}
        </span>
        
        {!compact && (
          <button
            onClick={checkStatus}
            disabled={checking}
            className="p-1 text-gray-500 hover:text-white transition-colors disabled:opacity-50"
            title="Check stream status"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${checking ? 'animate-spin' : ''}`} />
          </button>
        )}
      </div>
    )
  }

  // Single stream - No MUX stream configured
  if (!event?.mux_live_stream_id && !event?.mux_stream_key && !event?.mux_stream_id) {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium bg-gray-500/20 text-gray-400 ${compact ? '' : 'mr-2'}`}>
        <WifiOff className="w-3 h-3" />
        {!compact && 'No Stream'}
      </span>
    )
  }

  // Determine status display for single stream
  const status = event?.stream_status === 'active' || event?.is_live ? 'active' : 'idle'
  const isLive = status === 'active'

  const statusConfig = {
    active: {
      bg: 'bg-red-500',
      text: 'text-white',
      icon: Radio,
      label: 'LIVE',
      pulse: true
    },
    idle: {
      bg: 'bg-yellow-500/20',
      text: 'text-yellow-500',
      icon: Wifi,
      label: 'Ready',
      pulse: false
    },
    disabled: {
      bg: 'bg-gray-500/20',
      text: 'text-gray-400',
      icon: WifiOff,
      label: 'Offline',
      pulse: false
    }
  }

  const config = statusConfig[status] || statusConfig.idle
  const Icon = config.icon

  return (
    <div className={`inline-flex items-center gap-2 ${compact ? '' : 'mr-2'}`}>
      <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium ${config.bg} ${config.text}`}>
        <Icon className={`w-3 h-3 ${config.pulse ? 'animate-pulse' : ''}`} />
        {config.label}
      </span>
      
      {!compact && (
        <button
          onClick={checkStatus}
          disabled={checking}
          className="p-1 text-gray-500 hover:text-white transition-colors disabled:opacity-50"
          title="Check stream status"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${checking ? 'animate-spin' : ''}`} />
        </button>
      )}
    </div>
  )
}
