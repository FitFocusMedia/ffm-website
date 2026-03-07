import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

/**
 * MUX Webhook Handler
 * 
 * Automatically processes MUX events:
 * 1. video.live_stream.idle - Stream ended, update event status
 * 2. video.asset.ready - Recording ready, set vod_playback_id
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, mux-signature',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const body = await req.json()
    const eventType = body.type
    const data = body.data

    console.log(`[MUX Webhook] Received event: ${eventType}`)

    // ========== STREAM ENDED ==========
    if (eventType === 'video.live_stream.idle') {
      const streamId = data.id
      const playbackId = data.playback_ids?.[0]?.id

      console.log(`[MUX Webhook] Stream idle: ${streamId}`)

      // Find event(s) using this MUX stream
      const { data: events, error: eventsError } = await supabase
        .from('livestream_events')
        .select('id, title, status')
        .eq('mux_stream_id', streamId)

      if (eventsError) {
        console.error('[MUX Webhook] Error finding events:', eventsError)
      } else if (events && events.length > 0) {
        for (const event of events) {
          // Only update if currently live
          if (event.status === 'live') {
            const { error: updateError } = await supabase
              .from('livestream_events')
              .update({
                status: 'ended',
                is_live: false,
                end_time: new Date().toISOString(),
                doors_open: true, // Keep doors open for VOD access
                updated_at: new Date().toISOString()
              })
              .eq('id', event.id)

            if (updateError) {
              console.error(`[MUX Webhook] Failed to update event ${event.id}:`, updateError)
            } else {
              console.log(`[MUX Webhook] ✅ Event "${event.title}" marked as ended`)
            }
          }
        }
      }

      // Also check streams table for multi-stream events
      const { data: streams } = await supabase
        .from('livestream_streams')
        .select('id, name, event_id')
        .eq('mux_stream_id', streamId)

      if (streams && streams.length > 0) {
        for (const stream of streams) {
          await supabase
            .from('livestream_streams')
            .update({ 
              status: 'idle',
              updated_at: new Date().toISOString()
            })
            .eq('id', stream.id)
          
          console.log(`[MUX Webhook] ✅ Stream "${stream.name}" marked as idle`)
        }
      }
    }

    // ========== RECORDING READY ==========
    if (eventType === 'video.asset.ready') {
      const assetId = data.id
      const playbackId = data.playback_ids?.[0]?.id
      const duration = data.duration
      const liveStreamId = data.live_stream_id

      console.log(`[MUX Webhook] Asset ready: ${assetId}, playback: ${playbackId}, from stream: ${liveStreamId}`)

      if (!playbackId || !liveStreamId) {
        console.log('[MUX Webhook] Missing playback_id or live_stream_id, skipping')
        return new Response(JSON.stringify({ received: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Find event(s) using this MUX stream and update VOD playback ID
      const { data: events, error: eventsError } = await supabase
        .from('livestream_events')
        .select('id, title, vod_playback_id, is_multi_stream')
        .eq('mux_stream_id', liveStreamId)

      if (eventsError) {
        console.error('[MUX Webhook] Error finding events:', eventsError)
      } else if (events && events.length > 0) {
        for (const event of events) {
          // Only set if not already set (don't overwrite manual entries)
          if (!event.vod_playback_id) {
            const { error: updateError } = await supabase
              .from('livestream_events')
              .update({
                vod_playback_id: playbackId,
                vod_asset_id: assetId,
                updated_at: new Date().toISOString()
              })
              .eq('id', event.id)

            if (updateError) {
              console.error(`[MUX Webhook] Failed to set VOD for event ${event.id}:`, updateError)
            } else {
              console.log(`[MUX Webhook] ✅ VOD playback set for "${event.title}": ${playbackId}`)
            }
          } else {
            console.log(`[MUX Webhook] Event "${event.title}" already has VOD, skipping`)
          }
        }
      }

      // Also update streams table for multi-stream events
      const { data: streams } = await supabase
        .from('livestream_streams')
        .select('id, name, vod_playback_id')
        .eq('mux_stream_id', liveStreamId)

      if (streams && streams.length > 0) {
        for (const stream of streams) {
          if (!stream.vod_playback_id) {
            await supabase
              .from('livestream_streams')
              .update({
                vod_playback_id: playbackId,
                vod_asset_id: assetId,
                vod_duration_seconds: Math.round(duration || 0),
                updated_at: new Date().toISOString()
              })
              .eq('id', stream.id)

            console.log(`[MUX Webhook] ✅ VOD playback set for stream "${stream.name}": ${playbackId}`)
          }
        }
      }
    }

    // ========== STREAM ACTIVE (went live) ==========
    if (eventType === 'video.live_stream.active') {
      const streamId = data.id

      console.log(`[MUX Webhook] Stream active: ${streamId}`)

      // Find and update event(s)
      const { data: events } = await supabase
        .from('livestream_events')
        .select('id, title')
        .eq('mux_stream_id', streamId)

      if (events && events.length > 0) {
        for (const event of events) {
          await supabase
            .from('livestream_events')
            .update({
              status: 'live',
              is_live: true,
              stream_status: 'active',
              updated_at: new Date().toISOString()
            })
            .eq('id', event.id)

          console.log(`[MUX Webhook] ✅ Event "${event.title}" marked as live`)
        }
      }

      // Update streams table
      const { data: streams } = await supabase
        .from('livestream_streams')
        .select('id, name')
        .eq('mux_stream_id', streamId)

      if (streams && streams.length > 0) {
        for (const stream of streams) {
          await supabase
            .from('livestream_streams')
            .update({ status: 'active' })
            .eq('id', stream.id)
        }
      }
    }

    return new Response(
      JSON.stringify({ received: true, type: eventType }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('[MUX Webhook] Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
