import { useState, useEffect } from 'react'
import { Radio, Check, Tv } from 'lucide-react'

export default function StreamSelector({ streams, selectedStream, onSelect, isLive = false }) {
  if (!streams || streams.length <= 1) return null

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
          const isStreamLive = stream.status === 'live' || stream.status === 'active'
          
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
              {isStreamLive && (
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
                isStreamLive ? 'text-red-400' : 'text-gray-500'
              }`}>
                {isStreamLive ? 'Live' : 'Waiting'}
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
export function StreamSelectorCompact({ streams, selectedStream, onSelect }) {
  const [isOpen, setIsOpen] = useState(false)
  
  if (!streams || streams.length <= 1) return null
  
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
              const isStreamLive = stream.status === 'live' || stream.status === 'active'
              
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
                    {isStreamLive && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{stream.name}</p>
                    <p className={`text-xs ${isStreamLive ? 'text-red-400' : 'text-gray-500'}`}>
                      {isStreamLive ? 'Live' : 'Waiting'}
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
