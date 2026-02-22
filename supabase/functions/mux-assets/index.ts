import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const MUX_TOKEN_ID = Deno.env.get('MUX_TOKEN_ID')!
const MUX_TOKEN_SECRET = Deno.env.get('MUX_TOKEN_SECRET')!

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { action, asset_id } = await req.json()
    const auth = btoa(`${MUX_TOKEN_ID}:${MUX_TOKEN_SECRET}`)

    if (action === 'list') {
      // Fetch all assets
      const response = await fetch('https://api.mux.com/video/v1/assets?limit=50', {
        headers: { 'Authorization': `Basic ${auth}` }
      })
      const data = await response.json()
      
      // Map to simpler format with event info
      const assets = (data.data || []).map((asset: any) => {
        let eventTitle = 'Unknown Event'
        let eventId = null
        
        // Try to parse passthrough for event info
        if (asset.passthrough) {
          try {
            const passthrough = JSON.parse(asset.passthrough)
            eventTitle = passthrough.title || eventTitle
            eventId = passthrough.event_id || null
          } catch {}
        }
        
        return {
          id: asset.id,
          status: asset.status,
          duration: asset.duration,
          created_at: asset.created_at,
          playback_id: asset.playback_ids?.[0]?.id,
          event_title: eventTitle,
          event_id: eventId,
          resolution_tier: asset.resolution_tier,
          max_stored_resolution: asset.max_stored_resolution,
          aspect_ratio: asset.aspect_ratio
        }
      })

      return new Response(JSON.stringify({ assets }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (action === 'delete' && asset_id) {
      const response = await fetch(`https://api.mux.com/video/v1/assets/${asset_id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Basic ${auth}` }
      })
      
      if (!response.ok) {
        const error = await response.text()
        throw new Error(`Failed to delete asset: ${error}`)
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (action === 'get' && asset_id) {
      const response = await fetch(`https://api.mux.com/video/v1/assets/${asset_id}`, {
        headers: { 'Authorization': `Basic ${auth}` }
      })
      const data = await response.json()

      return new Response(JSON.stringify({ asset: data.data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
