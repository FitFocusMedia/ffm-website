import { useState, useEffect } from 'react'
import { Radio, RefreshCw, Wifi, WifiOff } from 'lucide-react'
import { supabase, getEventStreams } from '../lib/supabase'

/**
 * Stream Status Badge Component
 * Shows real-time MUX stream status: LIVE, IDLE, or NO STREAM
 * Works for both single-stream and multi-stream events
 */
export default function StreamStatusBadge({ event, onStatusUpdate, compact = false }) {
  const [checking, setChecking] = useState(false)
  const [isLive, setIsLive] = useState(false)
  const [streamCount, setStreamCount] = useState(0)
  const [liveStreamCount, setLiveStreamCount] = useState(0)
  const [hasStream, setHasStream] = useState(false)

  // Check MUX status on mount and periodically
  useEffect(() => {
    if (!event?.id) return

    const checkStatus = async () => {
      try {
        if (event.is_multi_stream) {
          // Multi-stream: check each stream's MUX status
          const streams = await getEventStreams(event.id)
          setStreamCount(streams?.length || 0)
          setHasStream(streams && streams.length > 0)

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
            setIsLive(liveCount > 0)
          }
        } else {
          // Single-stream: check event's MUX status directly
          const muxStreamId = event.mux_stream_id || event.mux_live_stream_id
          setHasStream(!!muxStreamId || !!event.mux_stream_key)

          if (muxStreamId) {
            try {
              const { data, error } = await supabase.functions.invoke('mux-stream', {
                body: { action: 'stream-status', mux_stream_id: muxStreamId }
              })
              if (!error && data) {
                setIsLive(data.isLive || false)
                if (onStatusUpdate) {
                  onStatusUpdate(data)
                }
              }
            } catch (err) {
              console.warn('Single stream status check failed:', err)
              setIsLive(false)
            }
          } else {
            setIsLive(false)
          }
        }
      } catch (err) {
        console.error('Status check failed:', err)
      }
    }

    checkStatus()
    // Poll every 30 seconds
    const interval = setInterval(checkStatus, 30000)
    return () => clearInterval(interval)
  }, [event?.id, event?.is_multi_stream, event?.mux_stream_id])

  const manualCheck = async () => {
    setChecking(true)
    try {
      if (event.is_multi_stream) {
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
          setIsLive(liveCount > 0)
        }
      } else {
        const muxStreamId = event.mux_stream_id || event.mux_live_stream_id
        if (muxStreamId) {
          const { data, error } = await supabase.functions.invoke('mux-stream', {
            body: { action: 'stream-status', mux_stream_id: muxStreamId }
          })
          if (!error && data) {
            setIsLive(data.isLive || false)
            if (onStatusUpdate) {
              onStatusUpdate(data)
            }
          }
        }
      }
    } catch (err) {
      console.error('Manual status check failed:', err)
    } finally {
      setChecking(false)
    }
  }

  // No stream configured at all
  if (!hasStream && !event?.mux_stream_key) {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium bg-gray-500/20 text-gray-400 ${compact ? '' : 'mr-2'}`}>
        <WifiOff className="w-3 h-3" />
        {!compact && 'No Stream'}
      </span>
    )
  }

  // Multi-stream display
  if (event?.is_multi_stream) {
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
            onClick={manualCheck}
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

  // Single-stream display
  return (
    <div className={`inline-flex items-center gap-2 ${compact ? '' : 'mr-2'}`}>
      <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium ${
        isLive ? 'bg-red-500 text-white' : 'bg-yellow-500/20 text-yellow-500'
      }`}>
        <Radio className={`w-3 h-3 ${isLive ? 'animate-pulse' : ''}`} />
        {isLive ? 'LIVE' : 'Ready'}
      </span>
      
      {!compact && (
        <button
          onClick={manualCheck}
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
