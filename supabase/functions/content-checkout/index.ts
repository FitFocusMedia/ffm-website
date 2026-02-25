import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.14.0?target=deno'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const supabase = createClient(supabaseUrl, supabaseKey)

  const signature = req.headers.get('stripe-signature')

  // ========== WEBHOOK HANDLER ==========
  if (signature) {
    try {
      const body = await req.text()
      const stripeKey = Deno.env.get('STRIPE_SECRET_KEY')!
      const webhookSecret = Deno.env.get('STRIPE_CONTENT_WEBHOOK_SECRET')!
      const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' })

      let event: Stripe.Event
      try {
        event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret)
      } catch (err) {
        console.error('Webhook signature verification failed:', err.message)
        return new Response(JSON.stringify({ error: 'Invalid signature' }), {
          status: 400, headers: { 'Content-Type': 'application/json' }
        })
      }

      if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session
        console.log('[Content Webhook] Payment completed for session:', session.id)

        // Fetch order with related data
        const { data: order, error: orderFetchError } = await supabase
          .from('orders')
          .select('*, organizations(*), events(*), packages(*)')
          .eq('stripe_session_id', session.id)
          .single()

        if (orderFetchError || !order) {
          console.error('[Content Webhook] Order not found for session:', session.id)
          return new Response(JSON.stringify({ received: true }), { headers: { 'Content-Type': 'application/json' } })
        }

        // Update order status to completed
        await supabase
          .from('orders')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
            stripe_payment_intent: session.payment_intent
          })
          .eq('stripe_session_id', session.id)

        console.log('[Content Webhook] Order updated to completed:', order.id)

        // Send confirmation email via Postmark
        const postmarkToken = Deno.env.get('POSTMARK_SERVER_TOKEN')
        if (postmarkToken && order.email) {
          const orgName = order.organizations?.name || 'Your Organization'
          const eventName = order.events?.name || 'Your Event'
          const packageName = order.packages?.name || 'Content Package'
          const amount = order.amount || 0

          try {
            await fetch('https://api.postmarkapp.com/email', {
              method: 'POST',
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-Postmark-Server-Token': postmarkToken
              },
              body: JSON.stringify({
                From: 'info@fitfocusmedia.com.au',
                To: order.email,
                Subject: `Order Confirmed - ${packageName} for ${eventName} 🎬`,
                HtmlBody: `
                  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h1 style="color: #e53e3e;">FIT FOCUS MEDIA</h1>
                    <h2>Thanks for your order, ${order.first_name}! 🎉</h2>
                    
                    <div style="background: #f7f7f7; padding: 20px; border-radius: 8px; margin: 20px 0;">
                      <p style="margin: 0; font-size: 18px; font-weight: bold;">${packageName}</p>
                      <p style="margin: 5px 0 0; color: #666;">${eventName} • ${orgName}</p>
                      <p style="margin: 10px 0 0; font-size: 24px; font-weight: bold; color: #e53e3e;">$${amount.toFixed(2)} AUD</p>
                    </div>
                    
                    <h3>Order Details</h3>
                    <ul style="color: #444;">
                      <li><strong>Name:</strong> ${order.first_name} ${order.last_name}</li>
                      <li><strong>Email:</strong> ${order.email}</li>
                      <li><strong>Phone:</strong> ${order.phone || 'N/A'}</li>
                      ${order.division ? `<li><strong>Division:</strong> ${order.division}</li>` : ''}
                      ${order.instagram ? `<li><strong>Instagram:</strong> @${order.instagram}</li>` : ''}
                    </ul>
                    
                    <h3>What's Next?</h3>
                    <p>Our team will prepare your content package after the event. You'll receive another email when your content is ready for download.</p>
                    
                    <p style="color: #666; font-size: 12px; margin-top: 30px;">
                      Order ID: ${order.id}<br>
                      Questions? Reply to this email or contact us at info@fitfocusmedia.com.au
                    </p>
                  </div>
                `,
                TextBody: `Thanks for your order, ${order.first_name}!\n\nPackage: ${packageName}\nEvent: ${eventName}\nAmount: $${amount.toFixed(2)} AUD\n\nOrder ID: ${order.id}\n\nOur team will prepare your content package after the event.`,
                MessageStream: 'outbound'
              })
            })
            console.log('[Content Webhook] Confirmation email sent to:', order.email)
          } catch (emailErr) {
            console.error('[Content Webhook] Failed to send email:', emailErr)
          }
        }
      }

      return new Response(JSON.stringify({ received: true }), { headers: { 'Content-Type': 'application/json' } })
    } catch (error) {
      console.error('[Content Webhook] Error:', error)
      return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } })
    }
  }

  // ========== CHECKOUT HANDLER ==========
  try {
    const { 
      event_id, 
      organization_id,
      package_id, 
      first_name,
      last_name,
      email, 
      phone,
      division,
      instagram,
      coach_name,
      coach_instagram,
      amount,
      success_url,
      cancel_url
    } = await req.json()

    if (!event_id || !package_id || !email || !amount) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Get event and package details
    const { data: event } = await supabase.from('events').select('*').eq('id', event_id).single()
    const { data: pkg } = await supabase.from('packages').select('*').eq('id', package_id).single()

    if (!event || !pkg) {
      return new Response(JSON.stringify({ error: 'Event or package not found' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY')
    if (!stripeKey) {
      return new Response(JSON.stringify({ error: 'Stripe not configured' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' })

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'aud',
          product_data: {
            name: `${pkg.name} - ${event.name}`,
            description: `Content package for ${event.name}`
          },
          unit_amount: Math.round(amount * 100)
        },
        quantity: 1
      }],
      mode: 'payment',
      success_url: success_url || `https://fitfocusmedia.com.au/#/order/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancel_url || `https://fitfocusmedia.com.au/#/order/${organization_id}`,
      customer_email: email,
      metadata: {
        event_id,
        organization_id,
        package_id,
        customer_email: email,
        customer_name: `${first_name} ${last_name}`
      }
    })

    // Create pending order
    const { error: insertError } = await supabase.from('orders').insert({
      event_id,
      organization_id,
      package_id,
      first_name,
      last_name,
      email: email.toLowerCase(),
      phone,
      division,
      instagram,
      coach_name,
      coach_instagram,
      amount,
      stripe_session_id: session.id,
      status: 'pending'
    })

    if (insertError) {
      console.error('[Content Checkout] Failed to create order:', insertError)
    }

    return new Response(JSON.stringify({ 
      url: session.url,
      sessionId: session.id 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('[Content Checkout] Error:', error)
    return new Response(JSON.stringify({ error: error.message || 'Internal server error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
