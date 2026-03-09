import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const BUNNY_API_KEY = Deno.env.get('BUNNY_API_KEY') || 'f1c59999-9148-4c31-ac37db440e51-c5b7-4019'
const BUNNY_LIBRARY_ID = Deno.env.get('BUNNY_LIBRARY_ID') || '612039'
const BUNNY_CDN_HOSTNAME = 'vz-7668c0c5-24e.b-cdn.net'

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const url = new URL(req.url)
  const path = url.pathname.replace('/gallery-api', '')
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

  try {
    // ========== BUNNY ROUTES ==========
    
    // GET /bunny/videos - List all videos in Bunny library
    if (path === '/bunny/videos' && req.method === 'GET') {
      const page = parseInt(url.searchParams.get('page') || '1')
      const perPage = parseInt(url.searchParams.get('perPage') || '100')
      
      const response = await fetch(
        `https://video.bunnycdn.com/library/${BUNNY_LIBRARY_ID}/videos?page=${page}&itemsPerPage=${perPage}`,
        {
          headers: {
            'AccessKey': BUNNY_API_KEY,
            'Accept': 'application/json'
          }
        }
      )
      
      if (!response.ok) {
        throw new Error(`Bunny API error: ${response.status}`)
      }
      
      const data = await response.json()
      
      // Enrich with playback URLs
      const videos = (data.items || []).map((v: any) => ({
        ...v,
        playbackUrl: `https://${BUNNY_CDN_HOSTNAME}/${v.guid}/playlist.m3u8`,
        thumbnailUrl: `https://${BUNNY_CDN_HOSTNAME}/${v.guid}/${v.thumbnailFileName || 'thumbnail.jpg'}`,
        previewUrl: v.hasMP4Fallback ? `https://${BUNNY_CDN_HOSTNAME}/${v.guid}/play_480p.mp4` : null
      }))
      
      return new Response(
        JSON.stringify({ videos, total: data.totalItems, page, perPage }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // GET /bunny/video/:id - Get single video details
    if (path.match(/^\/bunny\/video\/[\w-]+$/) && req.method === 'GET') {
      const videoId = path.split('/').pop()
      
      const response = await fetch(
        `https://video.bunnycdn.com/library/${BUNNY_LIBRARY_ID}/videos/${videoId}`,
        {
          headers: {
            'AccessKey': BUNNY_API_KEY,
            'Accept': 'application/json'
          }
        }
      )
      
      if (!response.ok) {
        throw new Error(`Bunny API error: ${response.status}`)
      }
      
      const video = await response.json()
      
      return new Response(
        JSON.stringify({
          ...video,
          playbackUrl: `https://${BUNNY_CDN_HOSTNAME}/${video.guid}/playlist.m3u8`,
          thumbnailUrl: `https://${BUNNY_CDN_HOSTNAME}/${video.guid}/${video.thumbnailFileName || 'thumbnail.jpg'}`,
          previewUrl: video.hasMP4Fallback ? `https://${BUNNY_CDN_HOSTNAME}/${video.guid}/play_480p.mp4` : null
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // POST /clips/:id/link-bunny - Link existing Bunny video to clip
    if (path.match(/^\/clips\/[\w-]+\/link-bunny$/) && req.method === 'POST') {
      const clipId = path.split('/')[2]
      const { bunny_video_id } = await req.json()
      
      if (!bunny_video_id) {
        return new Response(
          JSON.stringify({ error: 'bunny_video_id is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      // Verify video exists in Bunny
      const bunnyRes = await fetch(
        `https://video.bunnycdn.com/library/${BUNNY_LIBRARY_ID}/videos/${bunny_video_id}`,
        {
          headers: {
            'AccessKey': BUNNY_API_KEY,
            'Accept': 'application/json'
          }
        }
      )
      
      if (!bunnyRes.ok) {
        return new Response(
          JSON.stringify({ error: 'Bunny video not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      const bunnyVideo = await bunnyRes.json()
      
      // Update clip with Bunny info
      const { data: clip, error } = await supabase
        .from('gallery_clips')
        .update({
          bunny_video_id: bunny_video_id,
          bunny_library_id: BUNNY_LIBRARY_ID,
          video_source: 'bunny',
          duration: bunnyVideo.length || null
        })
        .eq('id', clipId)
        .select()
        .single()
      
      if (error) {
        throw error
      }
      
      return new Response(
        JSON.stringify({
          success: true,
          clip,
          playbackUrl: `https://${BUNNY_CDN_HOSTNAME}/${bunny_video_id}/playlist.m3u8`
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // GET /clips/:id/bunny-status - Check Bunny encoding status
    if (path.match(/^\/clips\/[\w-]+\/bunny-status$/) && req.method === 'GET') {
      const clipId = path.split('/')[2]
      
      const { data: clip, error } = await supabase
        .from('gallery_clips')
        .select('bunny_video_id, bunny_library_id, video_source')
        .eq('id', clipId)
        .single()
      
      if (error || !clip) {
        return new Response(
          JSON.stringify({ error: 'Clip not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      if (clip.video_source !== 'bunny' || !clip.bunny_video_id) {
        return new Response(
          JSON.stringify({ error: 'Clip is not using Bunny Stream' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      const bunnyRes = await fetch(
        `https://video.bunnycdn.com/library/${clip.bunny_library_id || BUNNY_LIBRARY_ID}/videos/${clip.bunny_video_id}`,
        {
          headers: {
            'AccessKey': BUNNY_API_KEY,
            'Accept': 'application/json'
          }
        }
      )
      
      if (!bunnyRes.ok) {
        return new Response(
          JSON.stringify({ error: 'Failed to get Bunny video status' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      const video = await bunnyRes.json()
      
      // Status codes: 0=created, 1=uploaded, 2=processing, 3=transcoding, 4=finished, 5=error, 6=uploading
      const statusMap: Record<number, string> = {
        0: 'created',
        1: 'uploaded',
        2: 'processing',
        3: 'transcoding',
        4: 'finished',
        5: 'error',
        6: 'uploading'
      }
      
      return new Response(
        JSON.stringify({
          status: statusMap[video.status] || 'unknown',
          statusCode: video.status,
          encodeProgress: video.encodeProgress || 0,
          isReady: video.status === 4,
          playbackUrl: video.status === 4 ? `https://${BUNNY_CDN_HOSTNAME}/${video.guid}/playlist.m3u8` : null,
          video
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // ========== GALLERY ROUTES ==========
    
    // GET /galleries - List all galleries
    if (path === '/galleries' && req.method === 'GET') {
      const { data: galleries, error } = await supabase
        .from('galleries')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      return new Response(
        JSON.stringify({ galleries }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // GET /galleries/:slug - Get gallery by slug
    if (path.match(/^\/galleries\/[\w-]+$/) && req.method === 'GET') {
      const slug = path.split('/').pop()
      
      const { data: gallery, error } = await supabase
        .from('galleries')
        .select('*')
        .eq('slug', slug)
        .single()
      
      if (error || !gallery) {
        return new Response(
          JSON.stringify({ error: 'Gallery not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      // Get photos
      const { data: photos } = await supabase
        .from('gallery_photos')
        .select('*')
        .eq('gallery_id', gallery.id)
        .order('created_at', { ascending: true })
      
      // Get clips
      const { data: clips } = await supabase
        .from('gallery_clips')
        .select('*')
        .eq('gallery_id', gallery.id)
        .order('created_at', { ascending: true })
      
      // Enrich clips with Bunny playback URLs
      const enrichedClips = (clips || []).map(clip => {
        if (clip.video_source === 'bunny' && clip.bunny_video_id) {
          return {
            ...clip,
            playbackUrl: `https://${BUNNY_CDN_HOSTNAME}/${clip.bunny_video_id}/playlist.m3u8`,
            thumbnailUrl: `https://${BUNNY_CDN_HOSTNAME}/${clip.bunny_video_id}/thumbnail.jpg`
          }
        }
        return clip
      })
      
      return new Response(
        JSON.stringify({ gallery, photos: photos || [], clips: enrichedClips }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // 404 for unknown routes
    return new Response(
      JSON.stringify({ error: 'Not found', path }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
    
  } catch (err) {
    console.error('Gallery API error:', err)
    return new Response(
      JSON.stringify({ error: err.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
