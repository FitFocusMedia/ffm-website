import { useState, useEffect } from 'react'
import { Radio, Check, Tv } from 'lucide-react'

// Supabase edge function for MUX stream status
const SUPABASE_URL = 'https://gonalgubgldgpkcekaxe.supabase.co'
const STREAM_STATUS_API = `${SUPABASE_URL}/functions/v1/mux-stream/status`

export default function StreamSelector({ streams, selectedStream, onSelect, isLive = false }) {
  const [liveStatuses, setLiveStatuses] = useState({})
  
  // Fetch real MUX status for streams that have mux_stream_id
  useEffect(() => {
    if (!streams || streams.length === 0) return
    
    const fetchStatuses = async () => {
      const streamsWithMuxId = streams.filter(s => s.mux_stream_id)
      
      if (streamsWithMuxId.length === 0) return
      
      try {
        const results = await Promise.all(
          streamsWithMuxId.map(async (stream) => {
            try {
              const res = await fetch(`${STREAM_STATUS_API}/${stream.mux_stream_id}`)
              if (res.ok) {
                const data = await res.json()
                return { id: stream.id, isLive: data.isLive, status: data.status }
              }
            } catch (err) {
              console.warn('Failed to fetch stream status:', err)
            }
            return { id: stream.id, isLive: false, status: 'unknown' }
          })
        )
        
        const statusMap = {}
        results.forEach(r => {
          statusMap[r.id] = r
        })
        setLiveStatuses(statusMap)
      } catch (err) {
        console.error('Failed to fetch stream statuses:', err)
      }
    }
    
    fetchStatuses()
    // Poll every 30 seconds
    const interval = setInterval(fetchStatuses, 30000)
    return () => clearInterval(interval)
  }, [streams])
  
  if (!streams || streams.length <= 1) return null
  
  // Helper to check if stream is live (MUX status takes priority)
  const isStreamLive = (stream) => {
    if (liveStatuses[stream.id]) {
      return liveStatuses[stream.id].isLive
    }
    // Fallback to database status if no MUX check available
    return stream.status === 'live' || stream.status === 'active'
  }

  return (
    <div className="bg-dark-900/80 backdrop-blur-sm rounded-xl border border-dark-700 p-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <Tv className="w-5 h-5 text-red-500" />
        <h3 className="text-white font-semibold">Select Stream</h3>
        {isLive && (
          <span className="flex items-center gap-1 px-2 py-0.5 bg-red-500/20 text-red-500 text-xs font-medium rounded-full">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            LIVE
          </span>
        )}
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {streams.map((stream) => {
          const isSelected = selectedStream?.id === stream.id
          const streamIsLive = isStreamLive(stream)
          
          return (
            <button
              key={stream.id}
              onClick={() => onSelect(stream)}
              className={`relative flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${
                isSelected 
                  ? 'border-red-500 bg-red-500/10' 
                  : 'border-dark-600 bg-dark-800 hover:border-dark-500 hover:bg-dark-700'
              }`}
            >
              {/* Live indicator */}
              {streamIsLive && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              )}
              
              {/* Selected check */}
              {isSelected && (
                <div className="absolute top-2 left-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
              
              {/* Stream icon */}
              <Radio className={`w-8 h-8 mb-2 ${isSelected ? 'text-red-500' : 'text-gray-400'}`} />
              
              {/* Stream name */}
              <span className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                {stream.name}
              </span>
              
              {/* Status badge */}
              <span className={`text-xs mt-1 ${
                streamIsLive ? 'text-red-400' : 'text-gray-500'
              }`}>
                {streamIsLive ? 'Live' : 'Waiting'}
              </span>
            </button>
          )
        })}
      </div>
      
      <p className="text-xs text-gray-500 mt-3 text-center">
        You can switch between streams at any time
      </p>
    </div>
  )
}

// Compact version for inside the player controls
export function StreamSelectorCompact({ streams, selectedStream, onSelect, liveStatuses = {} }) {
  const [isOpen, setIsOpen] = useState(false)
  const [localLiveStatuses, setLocalLiveStatuses] = useState({})
  
  // Fetch real MUX status for streams that have mux_stream_id
  useEffect(() => {
    if (!streams || streams.length === 0) return
    
    const fetchStatuses = async () => {
      const streamsWithMuxId = streams.filter(s => s.mux_stream_id)
      
      if (streamsWithMuxId.length === 0) return
      
      try {
        const results = await Promise.all(
          streamsWithMuxId.map(async (stream) => {
            try {
              const res = await fetch(`${STREAM_STATUS_API}/${stream.mux_stream_id}`)
              if (res.ok) {
                const data = await res.json()
                return { id: stream.id, isLive: data.isLive, status: data.status }
              }
            } catch (err) {
              console.warn('Failed to fetch stream status:', err)
            }
            return { id: stream.id, isLive: false, status: 'unknown' }
          })
        )
        
        const statusMap = {}
        results.forEach(r => {
          statusMap[r.id] = r
        })
        setLocalLiveStatuses(statusMap)
      } catch (err) {
        console.error('Failed to fetch stream statuses:', err)
      }
    }
    
    fetchStatuses()
    const interval = setInterval(fetchStatuses, 30000)
    return () => clearInterval(interval)
  }, [streams])
  
  if (!streams || streams.length <= 1) return null
  
  // Merge passed-in statuses with local ones
  const mergedStatuses = { ...liveStatuses, ...localLiveStatuses }
  
  const isStreamLive = (stream) => {
    if (mergedStatuses[stream.id]) {
      return mergedStatuses[stream.id].isLive
    }
    return stream.status === 'live' || stream.status === 'active'
  }
  
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 bg-black/60 hover:bg-black/80 text-white rounded-lg text-sm font-medium transition-colors"
      >
        <Tv className="w-4 h-4" />
        {selectedStream?.name || 'Select Stream'}
      </button>
      
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)} 
          />
          
          {/* Dropdown */}
          <div className="absolute bottom-full left-0 mb-2 w-48 bg-dark-900 border border-dark-700 rounded-lg shadow-xl z-50">
            {streams.map((stream) => {
              const isSelected = selectedStream?.id === stream.id
              const streamIsLive = isStreamLive(stream)
              
              return (
                <button
                  key={stream.id}
                  onClick={() => {
                    onSelect(stream)
                    setIsOpen(false)
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                    isSelected 
                      ? 'bg-red-500/20 text-white' 
                      : 'text-gray-300 hover:bg-dark-800 hover:text-white'
                  }`}
                >
                  <div className="relative">
                    <Radio className={`w-5 h-5 ${isSelected ? 'text-red-500' : 'text-gray-500'}`} />
                    {streamIsLive && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{stream.name}</p>
                    <p className={`text-xs ${streamIsLive ? 'text-red-400' : 'text-gray-500'}`}>
                      {streamIsLive ? 'Live' : 'Waiting'}
                    </p>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-red-500" />}
                </button>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
