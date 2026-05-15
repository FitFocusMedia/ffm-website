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

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const supabase = createClient(supabaseUrl, supabaseKey)

  try {
    const url = new URL(req.url)
    const token = url.searchParams.get('token')
    const photoId = url.searchParams.get('photo_id')
    const clipId = url.searchParams.get('clip_id')
    const directDownload = url.searchParams.get('download') === 'true'

    console.log('[Gallery Download] Request:', { token: token?.substring(0, 8) + '...', photoId, clipId, directDownload })

    // Route: GET /gallery_download?lookup=email — Diagnostic: find orders by email
    const lookupEmail = url.searchParams.get('lookup')
    if (lookupEmail) {
      const { data: lookupOrders, error: lookupError } = await supabase
        .from('gallery_orders')
        .select('id, email, customer_name, status, delivery_type, download_token, completed_at, token_expires_at, gallery_id, galleries(title, slug)')
        .ilike('email', lookupEmail.toLowerCase())
        .order('created_at', { ascending: false })

      if (lookupError) {
        return new Response(JSON.stringify({ error: lookupError.message }), {
          status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      return new Response(JSON.stringify({ email: lookupEmail, orders: lookupOrders || [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (!token) {
      return new Response(JSON.stringify({ error: 'Missing download token' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // First, try to find the order by token (any status) for better error messages
    const { data: rawOrder, error: rawError } = await supabase
      .from('gallery_orders')
      .select('id, status, delivery_type, email, download_token, token_expires_at')
      .eq('download_token', token)
      .limit(1)

    // Fetch order by download token (must be completed)
    const { data: order, error: orderError } = await supabase
      .from('gallery_orders')
      .select(`
        *,
        galleries(id, title, slug, organizations(id, name), events(id, name)),
        gallery_order_items(
          id,
          photo_id,
          price,
          downloaded,
          download_count,
          gallery_photos(id, filename, original_path, watermarked_path, thumbnail_path)
        )
      `)
      .eq('download_token', token)
      .eq('status', 'completed')
      .single()

    if (orderError || !order) {
      console.error('[Gallery Download] Order not found:', orderError)
      // Provide better error messages based on what we found
      if (rawOrder && rawOrder.length > 0) {
        const found = rawOrder[0]
        if (found.status === 'pending') {
          return new Response(JSON.stringify({ error: 'Payment pending — order has not been completed yet' }), {
            status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }
        if (found.token_expires_at && new Date(found.token_expires_at) < new Date()) {
          return new Response(JSON.stringify({ error: 'Download link has expired' }), {
            status: 410, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }
        // Order exists but status is something unexpected
        return new Response(JSON.stringify({ error: `Order status is '${found.status}' — expected 'completed'. Contact support.` }), {
          status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
      return new Response(JSON.stringify({ error: 'Order not found or not completed' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Fetch video items SEPARATELY (works around PostgREST relationship issue)
    const { data: videoOrderItems, error: videoError } = await supabase
      .from('gallery_order_video_items')
      .select(`
        id,
        clip_id,
        price,
        downloaded,
        download_count,
        gallery_clips(id, filename, title, original_path, mux_playback_id, duration_seconds)
      `)
      .eq('order_id', order.id)

    if (videoError) {
      console.error('[Gallery Download] Error fetching video items:', videoError)
    }

    const orderWithVideos = {
      ...order,
      gallery_order_video_items: videoOrderItems || []
    }

    // For free_access orders, fetch the gallery's video clips and match by athlete name + service type
    let galleryClips = []
    if (order.delivery_type === 'free_access' && order.galleries?.id) {
      const { data: clips } = await supabase
        .from('gallery_clips')
        .select('id, filename, original_path, thumbnail_url, mux_playback_id, duration_seconds, category_id')
        .eq('gallery_id', order.galleries.id)
        .neq('processing_status', 'failed')
        .order('created_at', { ascending: true })
      
      galleryClips = clips || []
      
      // Match clips to athlete based on name and service type from notes
      // Notes format: "Service: I-Walk | Event: Show Name" or "I-Walk Routine"
      // Filename format: "{number} - {Name} - {Service Type} - {Show} - {Date} - Fit Focus Media"
      if (order.notes && galleryClips.length > 0) {
        const athleteName = `${order.athlete_first_name || ''} ${order.athlete_last_name || ''}`.trim().toLowerCase()
        const notesLower = (order.notes || '').toLowerCase()
        
        // Extract service type from notes
        let serviceType = ''
        if (notesLower.includes('i-walk')) serviceType = 'i-walk'
        else if (notesLower.includes('posing')) serviceType = 'posing'
        else if (notesLower.includes('showday') || notesLower.includes('highlight') || notesLower.includes('reel')) serviceType = 'showday highlight reel'
        else if (notesLower.includes('showday')) serviceType = 'showday'
        else if (notesLower.includes('highlight')) serviceType = 'highlight'
        else if (notesLower.includes('reel')) serviceType = 'reel'
        
        // Filter clips to only include ones matching the athlete's name (and service type if available)
        galleryClips = galleryClips.filter((clip: any) => {
          const filenameLower = (clip.filename || '').toLowerCase()
          
          // Must match athlete name
          const nameMatches = !athleteName || filenameLower.includes(athleteName)
          
          // If service type is known, also match that
          if (serviceType) {
            return nameMatches && filenameLower.includes(serviceType)
          }
          
          return nameMatches
        })
      }
    }

    // Check token expiry
    if (order.token_expires_at && new Date(order.token_expires_at) < new Date()) {
      console.log('[Gallery Download] Token expired:', order.id)
      return new Response(JSON.stringify({ error: 'Download link has expired' }), {
        status: 410,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // If no photo_id or clip_id, return order details with thumbnails (for download page)
    if (!photoId && !clipId) {
      console.log('[Gallery Download] Returning order details:', order.id)
      
      // Generate thumbnail URLs for each photo (1 hour expiry for previews)
      const photoItems = await Promise.all(
        (order.gallery_order_items || []).map(async (item: any) => {
          let thumbnail_url = null
          const imagePath = item.gallery_photos?.thumbnail_path || item.gallery_photos?.original_path
          
          if (imagePath) {
            const { data: thumbData } = await supabase.storage
              .from('galleries')
              .createSignedUrl(imagePath, 3600)
            thumbnail_url = thumbData?.signedUrl || null
          }
          
          return {
            id: item.id,
            photo_id: item.photo_id,
            filename: item.gallery_photos?.filename,
            thumbnail_url,
            downloaded: item.downloaded,
            download_count: item.download_count,
            gallery_photos: item.gallery_photos
          }
        })
      )

      // Video items - use MUX thumbnails
      const videoItems = (orderWithVideos.gallery_order_video_items || []).map((item: any) => {
        const clip = item.gallery_clips
        return {
          id: item.id,
          clip_id: item.clip_id,
          filename: clip?.filename,
          title: clip?.title,
          thumbnail_url: clip?.mux_playback_id
            ? `https://image.mux.com/${clip.mux_playback_id}/thumbnail.jpg?width=320`
            : null,
          duration_seconds: clip?.duration_seconds,
          downloaded: item.downloaded,
          download_count: item.download_count,
          gallery_clips: clip
        }
      })

      console.log('[Gallery Download] Returning', photoItems.length, 'photos and', videoItems.length, 'videos', galleryClips.length, 'gallery clips (free_access)')

      return new Response(JSON.stringify({
        order: {
          id: order.id,
          email: order.email,
          customer_name: order.customer_name,
          total_amount: order.total_amount,
          is_package: order.is_package,
          delivery_type: order.delivery_type,
          notes: order.notes,
          athlete_first_name: order.athlete_first_name,
          athlete_last_name: order.athlete_last_name,
          completed_at: order.completed_at,
          token_expires_at: order.token_expires_at,
          galleries: order.galleries,
          gallery_order_items: photoItems,
          gallery_order_video_items: videoItems,
          // For free_access orders, include the gallery's video clips
          ...(galleryClips.length > 0 ? { gallery_clips: galleryClips.map((clip: any) => ({
            id: clip.id,
            filename: clip.filename,
            thumbnail_url: clip.mux_playback_id
              ? `https://image.mux.com/${clip.mux_playback_id}/thumbnail.jpg?width=400`
              : clip.thumbnail_url,
            mux_playback_id: clip.mux_playback_id,
            duration_seconds: clip.duration_seconds,
            original_path: clip.original_path
          })) } : {})
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // === VIDEO DOWNLOAD ===
    if (clipId) {
      // Check if it's a free_access clip or a purchased clip
      let videoItem = orderWithVideos.gallery_order_video_items?.find((item: any) => item.clip_id === clipId)
      
      // For free_access orders, also check gallery clips
      if (!videoItem && order.delivery_type === 'free_access') {
        const galleryClip = galleryClips.find((clip: any) => clip.id === clipId)
        if (galleryClip) {
          videoItem = {
            id: `free-${galleryClip.id}`,
            clip_id: galleryClip.id,
            gallery_clips: galleryClip
          }
        }
      }

      if (!videoItem) {
        console.error('[Gallery Download] Video not in order:', clipId)
        return new Response(JSON.stringify({ error: 'Video not included in this order' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      const originalPath = videoItem.gallery_clips?.original_path
      if (!originalPath) {
        console.error('[Gallery Download] No original path for video:', clipId)
        return new Response(JSON.stringify({ error: 'Video file not available' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Update download tracking (only for purchased clips, not free_access)
      if (videoItem.id && !videoItem.id.startsWith('free-')) {
        await supabase
          .from('gallery_order_video_items')
          .update({
            downloaded: true,
            download_count: (videoItem.download_count || 0) + 1
          })
          .eq('id', videoItem.id)
      }

      // Generate signed URL with download filename and REDIRECT
      const filename = videoItem.gallery_clips?.filename || `video-${clipId}.mp4`
      const { data: signedUrlData, error: signedUrlError } = await supabase.storage
        .from('galleries')
        .createSignedUrl(originalPath, 300, {
          download: filename
        })

      if (signedUrlError || !signedUrlData?.signedUrl) {
        console.error('[Gallery Download] Failed to create signed URL for video:', signedUrlError)
        return new Response(JSON.stringify({ error: 'Failed to generate download link' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      console.log('[Gallery Download] Redirecting to signed URL for video:', filename)

      return new Response(null, {
        status: 302,
        headers: {
          ...corsHeaders,
          'Location': signedUrlData.signedUrl
        }
      })
    }

    // === PHOTO DOWNLOAD ===
    if (photoId) {
      const orderItem = order.gallery_order_items?.find((item: any) => item.photo_id === photoId)

      if (!orderItem) {
        console.error('[Gallery Download] Photo not in order:', photoId)
        return new Response(JSON.stringify({ error: 'Photo not included in this order' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Update download tracking
      await supabase
        .from('gallery_order_items')
        .update({
          downloaded: true,
          download_count: (orderItem.download_count || 0) + 1
        })
        .eq('id', orderItem.id)

      // Generate signed URL with download filename and REDIRECT
      const filename = orderItem.gallery_photos?.filename || 'photo.jpg'
      const { data: signedUrlData, error: signedUrlError } = await supabase.storage
        .from('galleries')
        .createSignedUrl(orderItem.gallery_photos.original_path, 300, {
          download: filename
        })

      if (signedUrlError || !signedUrlData?.signedUrl) {
        console.error('[Gallery Download] Failed to create signed URL:', signedUrlError)
        return new Response(JSON.stringify({ error: 'Failed to generate download link' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      console.log('[Gallery Download] Redirecting to signed URL for photo:', filename)

      return new Response(null, {
        status: 302,
        headers: {
          ...corsHeaders,
          'Location': signedUrlData.signedUrl
        }
      })
    }

    return new Response(JSON.stringify({ error: 'Invalid request' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error: any) {
    console.error('[Gallery Download] Error:', error)
    return new Response(JSON.stringify({ error: error.message || 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
