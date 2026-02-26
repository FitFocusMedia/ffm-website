import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    const url = new URL(req.url)
    const token = url.searchParams.get('token')
    const photoId = url.searchParams.get('photo_id')

    if (!token) {
      return new Response(
        JSON.stringify({ error: 'Token is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get order by token
    const { data: order, error: orderError } = await supabase
      .from('gallery_orders')
      .select(`
        *,
        galleries(title, slug),
        gallery_order_items(
          id,
          photo_id,
          downloaded,
          download_count,
          gallery_photos(id, filename, original_path, width, height)
        )
      `)
      .eq('download_token', token)
      .eq('status', 'completed')
      .single()

    if (orderError || !order) {
      return new Response(
        JSON.stringify({ error: 'Order not found or not completed' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if token expired
    if (new Date(order.token_expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ error: 'Download link has expired' }),
        { status: 410, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // If no photo_id, return order details (for download page)
    if (!photoId) {
      return new Response(
        JSON.stringify({ order }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Download specific photo
    const orderItem = order.gallery_order_items?.find(
      (item: any) => item.photo_id === photoId
    )

    if (!orderItem) {
      return new Response(
        JSON.stringify({ error: 'Photo not in order' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Generate signed URL for original image (5 min expiry)
    const { data: urlData, error: urlError } = await supabase.storage
      .from('galleries')
      .createSignedUrl(orderItem.gallery_photos.original_path, 300)

    if (urlError) {
      console.error('Create signed URL error:', urlError)
      return new Response(
        JSON.stringify({ error: 'Failed to generate download URL' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Update download count
    await supabase
      .from('gallery_order_items')
      .update({
        downloaded: true,
        download_count: (orderItem.download_count || 0) + 1,
        last_downloaded_at: new Date().toISOString()
      })
      .eq('id', orderItem.id)

    return new Response(
      JSON.stringify({
        download_url: urlData.signedUrl,
        filename: orderItem.gallery_photos.filename
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('Download error:', err)
    return new Response(
      JSON.stringify({ error: err.message || 'Download failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
