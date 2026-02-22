import { useState } from 'react'
import { Radio, RefreshCw, Wifi, WifiOff } from 'lucide-react'
import { supabase } from '../lib/supabase'

/**
 * Stream Status Badge Component
 * Shows MUX stream status: LIVE, IDLE, ERROR, or NO STREAM
 * Can refresh status on demand
 */
export default function StreamStatusBadge({ event, onStatusUpdate, compact = false }) {
  const [checking, setChecking] = useState(false)
  const [lastChecked, setLastChecked] = useState(null)

  const checkStatus = async () => {
    if (!event?.mux_live_stream_id) return
    
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

  // No MUX stream configured
  if (!event?.mux_live_stream_id && !event?.mux_stream_key) {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium bg-gray-500/20 text-gray-400 ${compact ? '' : 'mr-2'}`}>
        <WifiOff className="w-3 h-3" />
        {!compact && 'No Stream'}
      </span>
    )
  }

  // Determine status display
  const status = event?.stream_status || event?.is_live ? 'active' : 'idle'
  const isLive = status === 'active' || event?.is_live

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
