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
    const directDownload = url.searchParams.get('download') === 'true'

    console.log('[Gallery Download] Request:', { token: token?.substring(0, 8) + '...', photoId, directDownload })

    if (!token) {
      return new Response(JSON.stringify({ error: 'Missing download token' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Fetch order by download token
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
          gallery_photos(id, filename, original_path, watermarked_path)
        )
      `)
      .eq('download_token', token)
      .eq('status', 'completed')
      .single()

    if (orderError || !order) {
      console.error('[Gallery Download] Order not found:', orderError)
      return new Response(JSON.stringify({ error: 'Order not found or not completed' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Check token expiry
    if (new Date(order.token_expires_at) < new Date()) {
      console.log('[Gallery Download] Token expired:', order.id)
      return new Response(JSON.stringify({ error: 'Download link has expired' }), {
        status: 410,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // If no photo_id, return order details with thumbnails (for download page)
    if (!photoId) {
      console.log('[Gallery Download] Returning order details:', order.id)
      
      // Generate thumbnail URLs for each photo (1 hour expiry for previews)
      const itemsWithThumbnails = await Promise.all(
        (order.gallery_order_items || []).map(async (item: any) => {
          let thumbnail_url = null
          
          // Use thumbnail_path for fast loading, fall back to original if no thumbnail
          const imagePath = item.gallery_photos?.thumbnail_path || item.gallery_photos?.original_path
          
          if (imagePath) {
            const { data: thumbData } = await supabase.storage
              .from('galleries')
              .createSignedUrl(imagePath, 3600) // 1 hour for thumbnails
            
            thumbnail_url = thumbData?.signedUrl || null
          }
          
          return {
            id: item.id,
            photo_id: item.photo_id,
            filename: item.gallery_photos?.filename,
            thumbnail_url,
            downloaded: item.downloaded,
            download_count: item.download_count
          }
        })
      )
      
      return new Response(JSON.stringify({
        order: {
          id: order.id,
          email: order.email,
          customer_name: order.customer_name,
          total_amount: order.total_amount,
          is_package: order.is_package,
          completed_at: order.completed_at,
          token_expires_at: order.token_expires_at,
          gallery: order.galleries,
          items: itemsWithThumbnails
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Find the specific photo in the order
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

    // DIRECT DOWNLOAD: Stream the actual file (no exposed URL)
    if (directDownload) {
      console.log('[Gallery Download] Direct download for:', orderItem.gallery_photos.filename)
      
      // Download the file from storage
      const { data: fileData, error: fileError } = await supabase.storage
        .from('galleries')
        .download(orderItem.gallery_photos.original_path)

      if (fileError || !fileData) {
        console.error('[Gallery Download] Failed to download file:', fileError)
        return new Response(JSON.stringify({ error: 'Failed to download file' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Get the filename, sanitize it for Content-Disposition header
      const filename = orderItem.gallery_photos.filename || 'photo.jpg'
      const safeFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '_')

      // Return the file directly with download headers
      return new Response(fileData, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'image/jpeg',
          'Content-Disposition': `attachment; filename="${safeFilename}"`,
          'Cache-Control': 'no-cache'
        }
      })
    }

    // JSON response with signed URL (legacy/fallback)
    const { data: signedUrlData, error: signedUrlError } = await supabase
      .storage
      .from('galleries')
      .createSignedUrl(orderItem.gallery_photos.original_path, 300) // 5 min expiry

    if (signedUrlError || !signedUrlData) {
      console.error('[Gallery Download] Failed to create signed URL:', signedUrlError)
      return new Response(JSON.stringify({ error: 'Failed to generate download link' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log('[Gallery Download] Signed URL generated for:', orderItem.gallery_photos.filename)

    return new Response(JSON.stringify({
      download_url: signedUrlData.signedUrl,
      filename: orderItem.gallery_photos.filename
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('[Gallery Download] Error:', error)
    return new Response(JSON.stringify({ error: error.message || 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
