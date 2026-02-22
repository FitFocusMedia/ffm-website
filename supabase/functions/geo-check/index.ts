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
    const { 
      venue_lat, 
      venue_lng, 
      radius_km, 
      user_lat, 
      user_lng,
      event_id,
      bypass_token 
    } = await req.json()

    // Check for crew bypass token first
    if (event_id && bypass_token) {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      const supabase = createClient(supabaseUrl, supabaseKey)
      
      const { data: event } = await supabase
        .from('livestream_events')
        .select('crew_bypass_token')
        .eq('id', event_id)
        .single()
      
      if (event?.crew_bypass_token === bypass_token) {
        return new Response(JSON.stringify({
          blocked: false,
          bypass: true,
          reason: 'Crew bypass token valid'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
    }

    let userLat = user_lat
    let userLng = user_lng
    let locationSource = 'browser'

    // If browser didn't provide coordinates, try IP-based fallback
    if (!userLat || !userLng) {
      locationSource = 'ip'
      const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        req.headers.get('cf-connecting-ip') ||
        req.headers.get('x-real-ip') ||
        ''

      const accountId = Deno.env.get('MAXMIND_ACCOUNT_ID')
      const licenseKey = Deno.env.get('MAXMIND_LICENSE_KEY')
      
      if (clientIP && accountId && licenseKey) {
        const auth = btoa(`${accountId}:${licenseKey}`)
        const geoResponse = await fetch(`https://geoip.maxmind.com/geoip/v2.1/city/${clientIP}`, {
          headers: { 'Authorization': `Basic ${auth}` }
        })

        if (geoResponse.ok) {
          const geoData = await geoResponse.json()
          userLat = geoData.location?.latitude
          userLng = geoData.location?.longitude
        }
      }
    }

    // Still no location? Can't determine
    if (!userLat || !userLng) {
      return new Response(JSON.stringify({ 
        blocked: false, 
        reason: 'Could not determine location',
        location_source: locationSource
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Calculate distance using Haversine formula
    const R = 6371 // Earth's radius in km
    const dLat = (userLat - venue_lat) * Math.PI / 180
    const dLng = (userLng - venue_lng) * Math.PI / 180
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(venue_lat * Math.PI / 180) * Math.cos(userLat * Math.PI / 180) *
      Math.sin(dLng/2) * Math.sin(dLng/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    const distance = R * c

    const blocked = distance <= radius_km

    return new Response(JSON.stringify({
      blocked,
      distance_km: Math.round(distance),
      user_location: {
        lat: userLat,
        lng: userLng
      },
      venue_radius_km: radius_km,
      location_source: locationSource
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    return new Response(JSON.stringify({ blocked: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
