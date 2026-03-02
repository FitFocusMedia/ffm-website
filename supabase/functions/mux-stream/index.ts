import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    const { action, event_id, stream_id, stream_name } = body
    
    const tokenId = Deno.env.get('MUX_TOKEN_ID')
    const tokenSecret = Deno.env.get('MUX_TOKEN_SECRET')
    const auth = btoa(tokenId + ':' + tokenSecret)

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL'),
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    )

    // ========================================
    // CREATE: Create a new MUX live stream
    // ========================================
    if (action === 'create') {
      if (!event_id) {
        return new Response(JSON.stringify({ error: 'event_id required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      const { data: event, error: eventError } = await supabase
        .from('livestream_events')
        .select('id, title, organization, mux_stream_id')
        .eq('id', event_id)
        .single()

      if (eventError || !event) {
        console.error('Event lookup error:', eventError)
        return new Response(JSON.stringify({ error: 'Event not found', details: eventError?.message }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // MULTI-STREAM MODE: If stream_id provided, create for specific mat/feed
      if (stream_id) {
        const { data: existingStream } = await supabase
          .from('livestream_streams')
          .select('id, mux_stream_id, mux_stream_key, mux_playback_id')
          .eq('id', stream_id)
          .single()

        if (existingStream?.mux_stream_id) {
          const checkRes = await fetch('https://api.mux.com/video/v1/live-streams/' + existingStream.mux_stream_id, {
            headers: { 'Authorization': 'Basic ' + auth }
          })
          if (checkRes.ok) {
            const existing = await checkRes.json()
            return new Response(JSON.stringify({
              stream_id: existing.data.id,
              stream_key: existing.data.stream_key,
              playback_id: existing.data.playback_ids ? existing.data.playback_ids[0].id : null,
              rtmp_url: 'rtmps://global-live.mux.com:443/app',
              status: existing.data.status,
              existing: true
            }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
          }
        }

        const muxRes = await fetch('https://api.mux.com/video/v1/live-streams', {
          method: 'POST',
          headers: {
            'Authorization': 'Basic ' + auth,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            playback_policy: ['public'],
            new_asset_settings: { playback_policy: ['public'] },
            latency_mode: 'low',
            reconnect_window: 60,
            passthrough: JSON.stringify({
              event_id: event.id,
              stream_id: stream_id,
              title: event.title,
              stream_name: stream_name || 'Stream',
              organization: event.organization
            })
          })
        })

        if (!muxRes.ok) {
          const errText = await muxRes.text()
          console.error('MUX API error:', errText)
          return new Response(JSON.stringify({ error: 'MUX API error', details: errText }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        const muxData = await muxRes.json()
        const stream = muxData.data

        await supabase.from('livestream_streams').update({
          mux_stream_id: stream.id,
          mux_stream_key: stream.stream_key,
          mux_playback_id: stream.playback_ids[0].id,
          status: stream.status
        }).eq('id', stream_id)

        await supabase.from('livestream_events').update({
          is_multi_stream: true
        }).eq('id', event_id)

        return new Response(JSON.stringify({
          stream_id: stream.id,
          stream_key: stream.stream_key,
          playback_id: stream.playback_ids[0].id,
          rtmp_url: 'rtmps://global-live.mux.com:443/app',
          status: stream.status,
          stream_name: stream_name
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // SINGLE STREAM MODE: Check if stream already exists
      if (event.mux_stream_id) {
        const checkRes = await fetch('https://api.mux.com/video/v1/live-streams/' + event.mux_stream_id, {
          headers: { 'Authorization': 'Basic ' + auth }
        })
        if (checkRes.ok) {
          const existing = await checkRes.json()
          return new Response(JSON.stringify({
            stream_id: existing.data.id,
            stream_key: existing.data.stream_key,
            playback_id: existing.data.playback_ids ? existing.data.playback_ids[0].id : null,
            rtmp_url: 'rtmps://global-live.mux.com:443/app',
            status: existing.data.status,
            existing: true
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }
      }

      // Create new MUX stream (single stream mode)
      const muxRes = await fetch('https://api.mux.com/video/v1/live-streams', {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + auth,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          playback_policy: ['public'],
          new_asset_settings: { playback_policy: ['public'] },
          latency_mode: 'low',
          reconnect_window: 60,
          passthrough: JSON.stringify({
            event_id: event.id,
            title: event.title,
            organization: event.organization
          })
        })
      })

      if (!muxRes.ok) {
        const errText = await muxRes.text()
        console.error('MUX API error:', errText)
        return new Response(JSON.stringify({ error: 'MUX API error', details: errText }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      const muxData = await muxRes.json()
      const stream = muxData.data

      await supabase.from('livestream_events').update({
        mux_stream_id: stream.id,
        mux_stream_key: stream.stream_key,
        mux_playback_id: stream.playback_ids[0].id,
        stream_status: stream.status
      }).eq('id', event_id)

      return new Response(JSON.stringify({
        stream_id: stream.id,
        stream_key: stream.stream_key,
        playback_id: stream.playback_ids[0].id,
        rtmp_url: 'rtmps://global-live.mux.com:443/app',
        status: stream.status
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // ========================================
    // STATUS: Get stream status from MUX
    // ========================================
    if (action === 'status' && event_id) {
      const { data: event } = await supabase
        .from('livestream_events')
        .select('mux_stream_id')
        .eq('id', event_id)
        .single()

      if (!event || !event.mux_stream_id) {
        return new Response(JSON.stringify({ error: 'No stream for this event' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      const muxRes = await fetch('https://api.mux.com/video/v1/live-streams/' + event.mux_stream_id, {
        headers: { 'Authorization': 'Basic ' + auth }
      })
      const muxData = await muxRes.json()
      const stream = muxData.data
      const isLive = stream.status === 'active'

      await supabase.from('livestream_events').update({
        stream_status: stream.status,
        is_live: isLive
      }).eq('id', event_id)

      return new Response(JSON.stringify({
        status: stream.status,
        is_live: isLive,
        playback_id: stream.playback_ids ? stream.playback_ids[0].id : null
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // ========================================
    // LIST-ACTIVE: List all active streams
    // ========================================
    if (action === 'list-active') {
      const muxRes = await fetch('https://api.mux.com/video/v1/live-streams?status=active', {
        headers: { 'Authorization': 'Basic ' + auth }
      })
      const muxData = await muxRes.json()
      const streams = muxData.data.map(function(s) {
        return {
          id: s.id,
          status: s.status,
          playback_id: s.playback_ids ? s.playback_ids[0].id : null
        }
      })
      return new Response(JSON.stringify({ active_streams: streams }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // ========================================
    // DELETE: Delete a stream from MUX
    // ========================================
    if (action === 'delete' && event_id) {
      const { data: event } = await supabase
        .from('livestream_events')
        .select('mux_stream_id')
        .eq('id', event_id)
        .single()

      if (!event || !event.mux_stream_id) {
        return new Response(JSON.stringify({ error: 'No stream for this event' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      const muxRes = await fetch('https://api.mux.com/video/v1/live-streams/' + event.mux_stream_id, {
        method: 'DELETE',
        headers: { 'Authorization': 'Basic ' + auth }
      })

      if (muxRes.ok || muxRes.status === 204) {
        await supabase.from('livestream_events').update({
          mux_stream_id: null,
          mux_stream_key: null,
          mux_playback_id: null,
          stream_status: null,
          is_live: false
        }).eq('id', event_id)

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      return new Response(JSON.stringify({ error: 'Failed to delete' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // ========================================
    // MIGRATE: Convert single stream to multi-stream
    // ========================================
    if (action === 'migrate') {
      if (!event_id) {
        return new Response(JSON.stringify({ error: 'event_id required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
      
      if (!stream_name) {
        return new Response(JSON.stringify({ error: 'stream_name required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Get event with existing stream data
      const { data: event, error: eventError } = await supabase
        .from('livestream_events')
        .select('id, title, organization, mux_stream_id, mux_stream_key, mux_playback_id')
        .eq('id', event_id)
        .single()

      if (eventError || !event) {
        return new Response(JSON.stringify({ error: 'Event not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      if (!event.mux_stream_id) {
        return new Response(JSON.stringify({ error: 'No existing stream to migrate' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Create entry in livestream_streams table
      const { data: newStream, error: insertError } = await supabase
        .from('livestream_streams')
        .insert({
          event_id: event_id,
          name: stream_name,
          display_order: 0,
          mux_stream_id: event.mux_stream_id,
          mux_stream_key: event.mux_stream_key,
          mux_playback_id: event.mux_playback_id,
          status: 'active',
          is_default: true
        })
        .select()
        .single()

      if (insertError) {
        console.error('Failed to create stream entry:', insertError)
        return new Response(JSON.stringify({ error: 'Failed to migrate stream', details: insertError.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Clear stream fields from event and set is_multi_stream
      const { error: updateError } = await supabase
        .from('livestream_events')
        .update({
          mux_stream_id: null,
          mux_stream_key: null,
          mux_playback_id: null,
          is_multi_stream: true
        })
        .eq('id', event_id)

      if (updateError) {
        console.error('Failed to update event:', updateError)
        await supabase.from('livestream_streams').delete().eq('id', newStream.id)
        return new Response(JSON.stringify({ error: 'Failed to update event', details: updateError.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Update MUX passthrough with stream info
      try {
        await fetch(`https://api.mux.com/video/v1/live-streams/${event.mux_stream_id}`, {
          method: 'PATCH',
          headers: {
            'Authorization': 'Basic ' + auth,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            passthrough: JSON.stringify({
              event_id: event.id,
              stream_id: newStream.id,
              title: event.title,
              stream_name: stream_name,
              organization: event.organization
            })
          })
        })
      } catch (e) {
        console.error('Failed to update MUX passthrough:', e)
      }

      return new Response(JSON.stringify({
        success: true,
        stream_id: newStream.id,
        stream_name: stream_name,
        message: 'Successfully converted to multi-stream'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // ========================================
    // SYNC-VOD: Sync VOD assets from MUX to streams
    // ========================================
    if (action === 'sync-vod') {
      if (!event_id) {
        return new Response(JSON.stringify({ error: 'event_id required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Fetch all MUX assets
      const assetsResponse = await fetch('https://api.mux.com/video/v1/assets?limit=100', {
        headers: { 'Authorization': 'Basic ' + auth }
      })
      const assetsData = await assetsResponse.json()
      
      // Filter to ready assets for this event
      const eventAssets = (assetsData.data || []).filter((asset: any) => {
        if (asset.status !== 'ready') return false
        try {
          const passthrough = JSON.parse(asset.passthrough || '{}')
          return passthrough.event_id === event_id
        } catch {
          return false
        }
      })

      if (eventAssets.length === 0) {
        return new Response(JSON.stringify({ 
          success: true, 
          message: 'No VOD assets found for this event',
          linked: 0 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Get streams for this event
      const { data: streams, error: streamsError } = await supabase
        .from('livestream_streams')
        .select('id, name, mux_stream_id')
        .eq('event_id', event_id)

      if (streamsError) {
        return new Response(JSON.stringify({ error: 'Failed to fetch streams', details: streamsError.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Group assets by stream (using stream_id or stream_name from passthrough)
      // Pick the longest duration asset per stream (main recording, not short reconnects)
      const streamAssets: Record<string, any> = {}
      
      for (const asset of eventAssets) {
        const passthrough = JSON.parse(asset.passthrough || '{}')
        const streamId = passthrough.stream_id
        const streamName = passthrough.stream_name
        
        // Find matching stream
        let matchedStream = streams?.find(s => s.id === streamId)
        if (!matchedStream && streamName) {
          matchedStream = streams?.find(s => 
            s.name.toLowerCase().includes(streamName.toLowerCase().replace(/\.$/, '')) ||
            streamName.toLowerCase().includes(s.name.toLowerCase())
          )
        }
        
        if (matchedStream) {
          const existingAsset = streamAssets[matchedStream.id]
          // Keep the longest recording
          if (!existingAsset || (asset.duration || 0) > (existingAsset.duration || 0)) {
            streamAssets[matchedStream.id] = {
              ...asset,
              matched_stream_id: matchedStream.id
            }
          }
        }
      }

      // Update streams with VOD info
      const updates = []
      for (const [streamId, asset] of Object.entries(streamAssets)) {
        const playbackId = asset.playback_ids?.[0]?.id
        if (playbackId) {
          const { error: updateError } = await supabase
            .from('livestream_streams')
            .update({
              vod_asset_id: asset.id,
              vod_playback_id: playbackId,
              vod_duration_seconds: Math.round(asset.duration || 0),
              vod_enabled: true
            })
            .eq('id', streamId)
          
          if (!updateError) {
            updates.push({
              stream_id: streamId,
              asset_id: asset.id,
              playback_id: playbackId,
              duration_seconds: Math.round(asset.duration || 0)
            })
          }
        }
      }

      return new Response(JSON.stringify({
        success: true,
        message: `Linked ${updates.length} VOD assets to streams`,
        linked: updates.length,
        total_assets: eventAssets.length,
        updates
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // ========================================
    // INVALID ACTION
    // ========================================
    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Function error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
