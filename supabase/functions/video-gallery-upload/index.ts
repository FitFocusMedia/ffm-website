// FFM Gallery Video Upload - Bunny Stream Version
// Replaces MUX with Bunny Stream for video hosting
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const BUNNY_API_KEY = Deno.env.get('BUNNY_API_KEY') || 'f1c59999-9148-4c31-ac37db440e51-c5b7-4019'
const BUNNY_LIBRARY_ID = Deno.env.get('BUNNY_LIBRARY_ID') || '612039'
const BUNNY_CDN_HOSTNAME = 'vz-7668c0c5-24e.b-cdn.net'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const supabase = createClient(supabaseUrl, supabaseKey)

  try {
    const { action, gallery_id, video_url, filename, file_size, category, clip_id, bunny_video_id } = await req.json()

    // ========== CREATE: Upload video to Bunny Stream ========== 
    if (action === 'create') {
      if (!gallery_id || !video_url || !filename) {
        throw new Error('Missing required fields: gallery_id, video_url, filename')
      }

      // Get gallery info for pricing
      const { data: gallery } = await supabase
        .from('galleries')
        .select('price_per_video, organization_id')
        .eq('id', gallery_id)
        .single()

      // Step 1: Create video in Bunny library
      const createResponse = await fetch(
        `https://video.bunnycdn.com/library/${BUNNY_LIBRARY_ID}/videos`,
        {
          method: 'POST',
          headers: {
            'AccessKey': BUNNY_API_KEY,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            title: filename,
            collectionId: gallery_id // Use gallery_id as collection for organization
          })
        }
      )

      if (!createResponse.ok) {
        const error = await createResponse.text()
        throw new Error(`Bunny video creation failed: ${error}`)
      }

      const bunnyVideo = await createResponse.json()

      // Step 2: Tell Bunny to fetch the video from URL
      const fetchResponse = await fetch(
        `https://video.bunnycdn.com/library/${BUNNY_LIBRARY_ID}/videos/${bunnyVideo.guid}/fetch`,
        {
          method: 'POST',
          headers: {
            'AccessKey': BUNNY_API_KEY,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            url: video_url
          })
        }
      )

      if (!fetchResponse.ok) {
        // Clean up the created video if fetch fails
        await fetch(
          `https://video.bunnycdn.com/library/${BUNNY_LIBRARY_ID}/videos/${bunnyVideo.guid}`,
          {
            method: 'DELETE',
            headers: { 'AccessKey': BUNNY_API_KEY }
          }
        )
        const error = await fetchResponse.text()
        throw new Error(`Bunny video fetch failed: ${error}`)
      }

      // Insert into gallery_clips table
      const { data: clip, error: dbError } = await supabase
        .from('gallery_clips')
        .insert({
          gallery_id,
          filename,
          file_size: file_size || 0,
          category: category || 'Main',
          bunny_video_id: bunnyVideo.guid,
          bunny_library_id: BUNNY_LIBRARY_ID,
          video_source: 'bunny',
          processing_status: 'processing',
          price: gallery?.price_per_video || 1500
        })
        .select()
        .single()

      if (dbError) throw dbError

      return new Response(JSON.stringify({
        success: true,
        clip,
        bunny_video: {
          id: bunnyVideo.guid,
          status: 'processing',
          playback_url: `https://${BUNNY_CDN_HOSTNAME}/${bunnyVideo.guid}/playlist.m3u8`
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // ========== LINK: Link existing Bunny video to clip ========== 
    if (action === 'link') {
      if (!gallery_id || !bunny_video_id || !filename) {
        throw new Error('Missing required fields: gallery_id, bunny_video_id, filename')
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
        throw new Error('Bunny video not found')
      }

      const bunnyVideo = await bunnyRes.json()

      // Get gallery info for pricing
      const { data: gallery } = await supabase
        .from('galleries')
        .select('price_per_video')
        .eq('id', gallery_id)
        .single()

      // Insert into gallery_clips table
      const { data: clip, error: dbError } = await supabase
        .from('gallery_clips')
        .insert({
          gallery_id,
          filename,
          bunny_video_id: bunny_video_id,
          bunny_library_id: BUNNY_LIBRARY_ID,
          video_source: 'bunny',
          processing_status: bunnyVideo.status === 4 ? 'completed' : 'processing',
          duration_seconds: bunnyVideo.length || null,
          thumbnail_url: `https://${BUNNY_CDN_HOSTNAME}/${bunny_video_id}/thumbnail.jpg`,
          price: gallery?.price_per_video || 1500
        })
        .select()
        .single()

      if (dbError) throw dbError

      return new Response(JSON.stringify({
        success: true,
        clip,
        playback_url: `https://${BUNNY_CDN_HOSTNAME}/${bunny_video_id}/playlist.m3u8`
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // ========== STATUS: Check Bunny encoding status ========== 
    if (action === 'status' && clip_id) {
      const { data: clip } = await supabase
        .from('gallery_clips')
        .select('*')
        .eq('id', clip_id)
        .single()

      if (!clip?.bunny_video_id) {
        throw new Error('Clip not found or no Bunny video')
      }

      const bunnyRes = await fetch(
        `https://video.bunnycdn.com/library/${clip.bunny_library_id || BUNNY_LIBRARY_ID}/videos/${clip.bunny_video_id}`,
        {
          headers: { 'AccessKey': BUNNY_API_KEY }
        }
      )

      if (!bunnyRes.ok) {
        throw new Error('Failed to fetch Bunny video status')
      }

      const video = await bunnyRes.json()

      // Bunny status codes: 0=created, 1=uploaded, 2=processing, 3=transcoding, 4=finished, 5=error
      const statusMap: Record<number, string> = {
        0: 'created',
        1: 'uploaded',
        2: 'processing',
        3: 'transcoding',
        4: 'completed',
        5: 'failed'
      }

      const newStatus = statusMap[video.status] || 'processing'

      // Update clip if status changed
      if (video.status === 4 && clip.processing_status !== 'completed') {
        await supabase
          .from('gallery_clips')
          .update({
            processing_status: 'completed',
            duration_seconds: video.length,
            thumbnail_url: `https://${BUNNY_CDN_HOSTNAME}/${video.guid}/thumbnail.jpg`
          })
          .eq('id', clip_id)
      } else if (video.status === 5 && clip.processing_status !== 'failed') {
        await supabase
          .from('gallery_clips')
          .update({ processing_status: 'failed' })
          .eq('id', clip_id)
      }

      return new Response(JSON.stringify({
        status: newStatus,
        encodeProgress: video.encodeProgress || 0,
        isReady: video.status === 4,
        duration: video.length,
        playback_url: video.status === 4 ? `https://${BUNNY_CDN_HOSTNAME}/${video.guid}/playlist.m3u8` : null,
        thumbnail_url: video.status === 4 ? `https://${BUNNY_CDN_HOSTNAME}/${video.guid}/thumbnail.jpg` : null
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // ========== DELETE: Remove from Bunny and DB ========== 
    if (action === 'delete' && clip_id) {
      const { data: clip } = await supabase
        .from('gallery_clips')
        .select('bunny_video_id, bunny_library_id, original_path')
        .eq('id', clip_id)
        .single()

      // Delete from Bunny
      if (clip?.bunny_video_id) {
        await fetch(
          `https://video.bunnycdn.com/library/${clip.bunny_library_id || BUNNY_LIBRARY_ID}/videos/${clip.bunny_video_id}`,
          {
            method: 'DELETE',
            headers: { 'AccessKey': BUNNY_API_KEY }
          }
        )
      }

      // Delete original from Supabase Storage if exists
      if (clip?.original_path) {
        await supabase.storage
          .from('galleries')
          .remove([clip.original_path])
      }

      // Delete DB record
      await supabase
        .from('gallery_clips')
        .delete()
        .eq('id', clip_id)

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // ========== LIST: Get clips for a gallery ========== 
    if (action === 'list' && gallery_id) {
      const { data: clips, error } = await supabase
        .from('gallery_clips')
        .select('*')
        .eq('gallery_id', gallery_id)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Enrich with Bunny playback URLs
      const enrichedClips = (clips || []).map(clip => {
        if (clip.video_source === 'bunny' && clip.bunny_video_id) {
          return {
            ...clip,
            playback_url: `https://${BUNNY_CDN_HOSTNAME}/${clip.bunny_video_id}/playlist.m3u8`,
            thumbnail_url: clip.thumbnail_url || `https://${BUNNY_CDN_HOSTNAME}/${clip.bunny_video_id}/thumbnail.jpg`
          }
        }
        return clip
      })

      return new Response(JSON.stringify(enrichedClips), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // ========== BUNNY-VIDEOS: List all videos in Bunny library ========== 
    if (action === 'bunny-videos') {
      const page = 1
      const perPage = 100

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

      const videos = (data.items || []).map((v: any) => ({
        id: v.guid,
        title: v.title,
        status: v.status,
        length: v.length,
        views: v.views,
        dateUploaded: v.dateUploaded,
        playbackUrl: `https://${BUNNY_CDN_HOSTNAME}/${v.guid}/playlist.m3u8`,
        thumbnailUrl: `https://${BUNNY_CDN_HOSTNAME}/${v.guid}/thumbnail.jpg`
      }))

      return new Response(JSON.stringify({ videos, total: data.totalItems }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Gallery video upload error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
