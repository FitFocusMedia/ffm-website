/**
 * VOD Management Section for LivestreamAdmin.jsx
 * Add this component and use it in the stream editing UI
 */

import { useState } from 'react'
import { Film, Cloud, ArrowRight, Trash2, CheckCircle, AlertTriangle, ExternalLink } from 'lucide-react'
import { supabase } from '../lib/supabase'

// Bunny Stream config
const BUNNY_LIBRARY_ID = '612038'
const BUNNY_CDN_URL = 'https://vz-66967d38-080.b-cdn.net'

export function VODSourceManager({ stream, onUpdate }) {
  const [bunnyVideoId, setBunnyVideoId] = useState(stream?.bunny_video_id || '')
  const [switching, setSwitching] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const currentSource = stream?.vod_source || 'mux'
  const hasMuxVod = !!stream?.vod_playback_id
  const hasBunnyVod = !!stream?.bunny_video_id

  // Save Bunny video ID without switching
  const saveBunnyId = async () => {
    if (!bunnyVideoId.trim()) return
    
    setError(null)
    try {
      const { error: updateError } = await supabase
        .from('livestream_streams')
        .update({ 
          bunny_video_id: bunnyVideoId.trim(),
          bunny_library_id: BUNNY_LIBRARY_ID
        })
        .eq('id', stream.id)
      
      if (updateError) throw updateError
      
      setSuccess('Bunny video ID saved')
      onUpdate?.()
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err.message)
    }
  }

  // Switch from MUX to Bunny
  const switchToBunny = async () => {
    if (!bunnyVideoId.trim()) {
      setError('Enter Bunny video ID first')
      return
    }
    
    setSwitching(true)
    setError(null)
    
    try {
      const { error: updateError } = await supabase
        .from('livestream_streams')
        .update({ 
          bunny_video_id: bunnyVideoId.trim(),
          bunny_library_id: BUNNY_LIBRARY_ID,
          vod_source: 'bunny'
        })
        .eq('id', stream.id)
      
      if (updateError) throw updateError
      
      setSuccess('Switched to Bunny Stream!')
      onUpdate?.()
    } catch (err) {
      setError(err.message)
    } finally {
      setSwitching(false)
    }
  }

  // Delete MUX asset after switching to Bunny
  const deleteMuxAsset = async () => {
    if (!confirm('Delete MUX asset? This cannot be undone. Make sure Bunny playback is working first!')) {
      return
    }
    
    setDeleting(true)
    setError(null)
    
    try {
      // Call edge function to delete MUX asset
      const { data, error: fnError } = await supabase.functions.invoke('mux-stream', {
        body: { 
          action: 'delete-asset',
          asset_id: stream.mux_asset_id // You may need to store this or derive from vod_playback_id
        }
      })
      
      if (fnError) throw fnError
      
      // Clear MUX fields in database
      const { error: updateError } = await supabase
        .from('livestream_streams')
        .update({ 
          vod_playback_id: null,
          // Keep mux_playback_id for live stream reference
        })
        .eq('id', stream.id)
      
      if (updateError) throw updateError
      
      setSuccess('MUX asset deleted - storage costs stopped!')
      onUpdate?.()
    } catch (err) {
      setError(err.message)
    } finally {
      setDeleting(false)
    }
  }

  // Preview Bunny video
  const previewBunny = () => {
    if (bunnyVideoId) {
      window.open(`${BUNNY_CDN_URL}/${bunnyVideoId}/playlist.m3u8`, '_blank')
    }
  }

  return (
    <div className="bg-dark-800 rounded-xl p-4 border border-dark-700">
      <h4 className="text-white font-medium mb-4 flex items-center gap-2">
        <Film className="w-5 h-5 text-red-400" />
        VOD Source Management
      </h4>

      {/* Current Status */}
      <div className="mb-4 p-3 bg-dark-900 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-400 text-sm">Current Source:</span>
          <span className={`px-2 py-1 rounded text-xs font-medium ${
            currentSource === 'bunny' 
              ? 'bg-orange-500/20 text-orange-400' 
              : 'bg-pink-500/20 text-pink-400'
          }`}>
            {currentSource === 'bunny' ? '🐰 Bunny Stream' : '📺 MUX'}
          </span>
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-gray-500">MUX VOD:</span>
            <span className={`ml-2 ${hasMuxVod ? 'text-green-400' : 'text-gray-600'}`}>
              {hasMuxVod ? '✓ Available' : '✗ None'}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Bunny VOD:</span>
            <span className={`ml-2 ${hasBunnyVod ? 'text-green-400' : 'text-gray-600'}`}>
              {hasBunnyVod ? '✓ Available' : '✗ None'}
            </span>
          </div>
        </div>
      </div>

      {/* Bunny Video ID Input */}
      <div className="mb-4">
        <label className="block text-sm text-gray-400 mb-1">Bunny Video ID</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={bunnyVideoId}
            onChange={(e) => setBunnyVideoId(e.target.value)}
            placeholder="e.g., a1b2c3d4-5678-90ab-cdef-1234567890ab"
            className="flex-1 px-3 py-2 bg-dark-900 border border-dark-600 rounded-lg text-white text-sm focus:border-red-500 focus:outline-none"
          />
          {bunnyVideoId && (
            <button
              onClick={previewBunny}
              className="px-3 py-2 bg-dark-700 hover:bg-dark-600 text-gray-300 rounded-lg"
              title="Preview HLS URL"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Find this in Bunny Dashboard → Video Library → Video → Video GUID
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        {/* Save without switching */}
        <button
          onClick={saveBunnyId}
          disabled={!bunnyVideoId.trim()}
          className="px-4 py-2 bg-dark-700 hover:bg-dark-600 disabled:opacity-50 text-white rounded-lg text-sm flex items-center gap-2"
        >
          <Cloud className="w-4 h-4" />
          Save Bunny ID
        </button>

        {/* Switch to Bunny */}
        {currentSource !== 'bunny' && bunnyVideoId && (
          <button
            onClick={switchToBunny}
            disabled={switching}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white rounded-lg text-sm flex items-center gap-2"
          >
            <ArrowRight className="w-4 h-4" />
            {switching ? 'Switching...' : 'Switch to Bunny'}
          </button>
        )}

        {/* Delete MUX (only after switched to Bunny) */}
        {currentSource === 'bunny' && hasMuxVod && (
          <button
            onClick={deleteMuxAsset}
            disabled={deleting}
            className="px-4 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white rounded-lg text-sm flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            {deleting ? 'Deleting...' : 'Delete MUX Asset'}
          </button>
        )}
      </div>

      {/* Status Messages */}
      {error && (
        <div className="mt-3 p-2 bg-red-500/20 border border-red-500/50 rounded-lg flex items-center gap-2 text-red-400 text-sm">
          <AlertTriangle className="w-4 h-4" />
          {error}
        </div>
      )}
      
      {success && (
        <div className="mt-3 p-2 bg-green-500/20 border border-green-500/50 rounded-lg flex items-center gap-2 text-green-400 text-sm">
          <CheckCircle className="w-4 h-4" />
          {success}
        </div>
      )}

      {/* Cost Savings Note */}
      {currentSource === 'bunny' && hasMuxVod && (
        <div className="mt-3 p-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-yellow-400 text-xs">
          💡 You're using Bunny but still have a MUX asset. Delete it to stop MUX storage charges.
        </div>
      )}
    </div>
  )
}

export default VODSourceManager
