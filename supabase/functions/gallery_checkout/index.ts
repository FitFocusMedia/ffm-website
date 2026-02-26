import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@13.10.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY')!
const BASE_URL = 'https://fitfocusmedia.com.au'

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' })

    const { gallery_slug, email, customer_name, photo_ids, is_package } = await req.json()

    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get gallery
    const { data: gallery, error: galleryError } = await supabase
      .from('galleries')
      .select('*')
      .eq('slug', gallery_slug)
      .eq('status', 'published')
      .single()

    if (galleryError || !gallery) {
      return new Response(
        JSON.stringify({ error: 'Gallery not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    let totalAmount = 0
    let lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = []
    let selectedPhotoIds: string[] = []

    if (is_package && gallery.package_enabled && gallery.package_price) {
      // Buy all package
      const { data: allPhotos } = await supabase
        .from('gallery_photos')
        .select('id')
        .eq('gallery_id', gallery.id)

      selectedPhotoIds = (allPhotos || []).map(p => p.id)
      totalAmount = gallery.package_price

      lineItems = [{
        price_data: {
          currency: 'aud',
          product_data: {
            name: `${gallery.title} - Full Package`,
            description: `All ${selectedPhotoIds.length} photos`
          },
          unit_amount: totalAmount
        },
        quantity: 1
      }]
    } else {
      // Individual photos
      if (!photo_ids || !Array.isArray(photo_ids) || photo_ids.length === 0) {
        return new Response(
          JSON.stringify({ error: 'No photos selected' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const { data: photos } = await supabase
        .from('gallery_photos')
        .select('id, filename, price')
        .eq('gallery_id', gallery.id)
        .in('id', photo_ids)

      if (!photos || photos.length === 0) {
        return new Response(
          JSON.stringify({ error: 'Invalid photo selection' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      selectedPhotoIds = photos.map(p => p.id)

      for (const photo of photos) {
        const price = photo.price || gallery.price_per_photo
        totalAmount += price

        lineItems.push({
          price_data: {
            currency: 'aud',
            product_data: {
              name: photo.filename,
              description: `Photo from ${gallery.title}`
            },
            unit_amount: price
          },
          quantity: 1
        })
      }
    }

    // Generate download token
    const downloadToken = crypto.randomUUID()
    const tokenExpiresAt = new Date()
    tokenExpiresAt.setDate(tokenExpiresAt.getDate() + 7) // 7 days

    // Create order in database
    const { data: order, error: orderError } = await supabase
      .from('gallery_orders')
      .insert({
        gallery_id: gallery.id,
        email,
        customer_name,
        total_amount: totalAmount,
        is_package: is_package && gallery.package_enabled,
        status: 'pending',
        download_token: downloadToken,
        token_expires_at: tokenExpiresAt.toISOString()
      })
      .select()
      .single()

    if (orderError) {
      console.error('Create order error:', orderError)
      return new Response(
        JSON.stringify({ error: 'Failed to create order' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create order items
    const orderItems = selectedPhotoIds.map(photoId => ({
      order_id: order.id,
      photo_id: photoId,
      price: is_package ? Math.floor(totalAmount / selectedPhotoIds.length) : gallery.price_per_photo
    }))

    await supabase.from('gallery_order_items').insert(orderItems)

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      customer_email: email,
      success_url: `${BASE_URL}/#/gallery/download/${downloadToken}`,
      cancel_url: `${BASE_URL}/#/gallery/${gallery_slug}?cancelled=true`,
      metadata: {
        order_id: order.id,
        gallery_id: gallery.id,
        type: 'gallery_order'
      }
    })

    // Update order with Stripe session ID
    await supabase
      .from('gallery_orders')
      .update({ stripe_session_id: session.id })
      .eq('id', order.id)

    return new Response(
      JSON.stringify({ 
        checkout_url: session.url,
        order_id: order.id 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('Checkout error:', err)
    return new Response(
      JSON.stringify({ error: err.message || 'Checkout failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
