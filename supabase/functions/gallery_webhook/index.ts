import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@13.10.0'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY')!
const STRIPE_GALLERY_WEBHOOK_SECRET = Deno.env.get('STRIPE_GALLERY_WEBHOOK_SECRET')

serve(async (req) => {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' })

    const body = await req.text()
    const sig = req.headers.get('stripe-signature')

    let event: Stripe.Event

    // Verify webhook signature if secret is configured
    if (STRIPE_GALLERY_WEBHOOK_SECRET && sig) {
      try {
        event = stripe.webhooks.constructEvent(body, sig, STRIPE_GALLERY_WEBHOOK_SECRET)
      } catch (err) {
        console.error('Webhook signature verification failed:', err)
        return new Response(
          JSON.stringify({ error: 'Invalid signature' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        )
      }
    } else {
      // No secret configured, parse body directly (less secure)
      event = JSON.parse(body)
    }

    console.log('Received webhook event:', event.type)

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session

      if (session.metadata?.type === 'gallery_order') {
        const orderId = session.metadata.order_id

        // Update order status
        const { error: updateError } = await supabase
          .from('gallery_orders')
          .update({
            status: 'completed',
            stripe_payment_intent: session.payment_intent as string,
            completed_at: new Date().toISOString()
          })
          .eq('id', orderId)

        if (updateError) {
          console.error('Failed to update order:', updateError)
        } else {
          console.log(`Gallery order ${orderId} completed`)

          // Get order details for email
          const { data: order } = await supabase
            .from('gallery_orders')
            .select('*, galleries(title)')
            .eq('id', orderId)
            .single()

          if (order) {
            // TODO: Send confirmation email with download link
            // For now, just log it
            console.log(`Order completed for ${order.email}`)
            console.log(`Download URL: https://fitfocusmedia.com.au/#/gallery/download/${order.download_token}`)
          }
        }
      }
    }

    return new Response(
      JSON.stringify({ received: true }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('Webhook error:', err)
    return new Response(
      JSON.stringify({ error: err.message || 'Webhook failed' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
