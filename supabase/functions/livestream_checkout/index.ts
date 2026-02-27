import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@13.10.0?target=deno'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const path = url.pathname.split('/').pop()

    // Initialize clients
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
      apiVersion: '2023-10-16',
    })

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Route: POST /livestream-checkout (create checkout session)
    if (req.method === 'POST' && path !== 'webhook') {
      const body = await req.json()
      const { event_id, email, success_url, cancel_url, buyer_lat, buyer_lng, distance_from_venue_km, is_vod_purchase } = body

      if (!event_id || !email) {
        return new Response(
          JSON.stringify({ error: 'Missing event_id or email' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      console.log(`[Checkout] Processing for event ${event_id}, email: ${email}`)

      // Get event details
      const { data: event, error: eventError } = await supabase
        .from('livestream_events')
        .select('*')
        .eq('id', event_id)
        .single()

      if (eventError || !event) {
        console.error('[Checkout] Event not found:', eventError)
        return new Response(
          JSON.stringify({ error: 'Event not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Check demo mode
      const { data: settings } = await supabase
        .from('livestream_settings')
        .select('demo_mode')
        .eq('id', 1)
        .single()

      const normalizedEmail = email.toLowerCase()

      // Get or create user profile
      let userId: string | null = null
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('email', normalizedEmail)
        .single()
      
      if (profile) {
        userId = profile.id
      } else {
        const { data: newProfile } = await supabase
          .from('user_profiles')
          .insert({ email: normalizedEmail })
          .select('id')
          .single()
        if (newProfile) userId = newProfile.id
      }

      // Demo mode - create completed order directly
      if (settings?.demo_mode) {
        console.log('[Checkout] Demo mode - creating order directly')
        
        const purchasePrice = is_vod_purchase && event.vod_price ? event.vod_price : event.price
        
        const { data: order, error: orderError } = await supabase
          .from('livestream_orders')
          .insert({
            event_id: event.id,
            email: normalizedEmail,
            user_id: userId,
            amount: purchasePrice,
            currency: 'AUD',
            status: 'completed',
            payment_method: 'demo',
            completed_at: new Date().toISOString(),
            buyer_lat,
            buyer_lng,
            distance_from_venue_km,
            is_vod_purchase: is_vod_purchase || false,
            vod_access_granted: true
          })
          .select()
          .single()

        if (orderError) {
          console.error('[Checkout] Failed to create demo order:', orderError)
          return new Response(
            JSON.stringify({ error: 'Failed to create order' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Send confirmation email via Postmark
        await sendConfirmationEmail(normalizedEmail, event, order.id)

        const baseUrl = 'https://fitfocusmedia.com.au'
        return new Response(
          JSON.stringify({ 
            demo: true, 
            success: true,
            redirect: success_url || `${baseUrl}/#/watch/${event_id}?email=${encodeURIComponent(email)}`
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Production mode - create Stripe checkout
      console.log('[Checkout] Production mode - creating Stripe session')
      
      const baseUrl = 'https://fitfocusmedia.com.au'
      const purchasePrice = is_vod_purchase && event.vod_price ? event.vod_price : event.price
      const productDescription = is_vod_purchase 
        ? `VOD Replay: ${event.organization} - ${event.title}`
        : `Livestream access: ${event.organization} - ${event.venue}`
      
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: 'aud',
            product_data: {
              name: is_vod_purchase ? `${event.title} (Replay)` : event.title,
              description: productDescription,
            },
            unit_amount: Math.round(purchasePrice * 100),
          },
          quantity: 1,
        }],
        mode: 'payment',
        success_url: success_url || `${baseUrl}/#/watch/${event_id}?session_id={CHECKOUT_SESSION_ID}&email=${encodeURIComponent(email)}`,
        cancel_url: cancel_url || `${baseUrl}/#/live/${event_id}`,
        customer_email: email,
        metadata: {
          event_id: event.id,
          event_title: event.title,
          customer_email: email,
          is_vod_purchase: is_vod_purchase ? 'true' : 'false'
        }
      })

      // Create pending order
      await supabase
        .from('livestream_orders')
        .insert({
          event_id: event.id,
          email: normalizedEmail,
          user_id: userId,
          amount: purchasePrice,
          currency: 'AUD',
          status: 'pending',
          stripe_session_id: session.id,
          buyer_lat,
          buyer_lng,
          distance_from_venue_km,
          is_vod_purchase: is_vod_purchase || false
        })

      console.log('[Checkout] Stripe session created:', session.id)
      return new Response(
        JSON.stringify({ url: session.url }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Route: POST /livestream-checkout/webhook (Stripe webhook)
    if (req.method === 'POST' && path === 'webhook') {
      const body = await req.text()
      const signature = req.headers.get('stripe-signature')!
      const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!

      let event: Stripe.Event
      try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
      } catch (err) {
        console.error('[Webhook] Signature verification failed:', err.message)
        return new Response(
          JSON.stringify({ error: `Webhook Error: ${err.message}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session
        console.log('[Webhook] Payment completed for session:', session.id)

        // Get the order to get event details
        const { data: order } = await supabase
          .from('livestream_orders')
          .select('*, livestream_events(*)')
          .eq('stripe_session_id', session.id)
          .single()

        // Update order status
        const { error } = await supabase
          .from('livestream_orders')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
            stripe_payment_intent: session.payment_intent as string,
            vod_access_granted: true
          })
          .eq('stripe_session_id', session.id)

        if (error) {
          console.error('[Webhook] Failed to update order:', error)
        } else if (order) {
          // Send confirmation email
          await sendConfirmationEmail(
            order.email, 
            order.livestream_events, 
            order.id
          )
        }
      }

      return new Response(
        JSON.stringify({ received: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('[Edge Function] Error:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

// Send confirmation email via Postmark
async function sendConfirmationEmail(email: string, event: any, orderId: string) {
  const postmarkToken = Deno.env.get('POSTMARK_API_TOKEN')
  if (!postmarkToken) {
    console.log('[Email] Postmark not configured, skipping email')
    return
  }

  const magicLink = `https://fitfocusmedia.com.au/#/watch/${event.id}?email=${encodeURIComponent(email)}`
  
  const emailBody = {
    From: 'info@fitfocusmedia.com.au',
    To: email,
    Subject: `Your access to ${event.title} is confirmed! 🎬`,
    HtmlBody: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #e53e3e; margin: 0;">FIT FOCUS MEDIA</h1>
        </div>
        
        <h2 style="color: #1a1a1a;">You're all set! 🎉</h2>
        
        <p>Thanks for your purchase! You now have access to:</p>
        
        <div style="background: #f7f7f7; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; font-size: 18px; font-weight: bold;">${event.title}</p>
          <p style="margin: 5px 0 0; color: #666;">${event.organization} • ${event.venue}</p>
          <p style="margin: 5px 0 0; color: #666;">${new Date(event.event_date).toLocaleDateString('en-AU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${magicLink}" style="background: #e53e3e; color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
            Watch Stream →
          </a>
        </div>
        
        <p style="color: #666; font-size: 14px;">
          <strong>How to watch:</strong><br>
          Click the button above or enter your email at the event page. Your access is linked to this email address.
        </p>
        
        <!-- Photo Gallery Cross-Sell -->
        <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 25px; border-radius: 12px; margin: 30px 0; text-align: center;">
          <p style="color: #ffd700; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 10px;">📸 Exclusive Offer</p>
          <h3 style="color: white; margin: 0 0 15px; font-size: 20px;">Competing at this event?</h3>
          <p style="color: #ccc; margin: 0 0 20px; font-size: 14px;">
            Get your professional competition photos! Our photographers capture every moment on the mats.
          </p>
          <a href="https://fitfocusmedia.com.au/#/gallery" style="background: #ffd700; color: #1a1a2e; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; font-size: 14px;">
            View Photo Packages →
          </a>
          <p style="color: #888; font-size: 12px; margin: 15px 0 0;">
            Use code <strong style="color: #ffd700;">STREAM15</strong> for 15% off your photo order
          </p>
        </div>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        
        <p style="color: #999; font-size: 12px; text-align: center;">
          Order ID: ${orderId}<br>
          Questions? Reply to this email or contact info@fitfocusmedia.com.au
        </p>
      </div>
    `,
    TextBody: `You're all set!\n\nThanks for your purchase! You now have access to:\n\n${event.title}\n${event.organization} • ${event.venue}\n\nWatch here: ${magicLink}\n\nOrder ID: ${orderId}`,
    MessageStream: 'outbound'
  }

  try {
    const response = await fetch('https://api.postmarkapp.com/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-Postmark-Server-Token': postmarkToken
      },
      body: JSON.stringify(emailBody)
    })

    if (response.ok) {
      console.log('[Email] Confirmation sent to:', email)
    } else {
      const errorData = await response.json()
      console.error('[Email] Failed to send:', errorData)
    }
  } catch (err) {
    console.error('[Email] Error sending:', err)
  }
}
