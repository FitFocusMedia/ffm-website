import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

/**
 * Purchase Notification Handler
 * 
 * Sends real-time Telegram notifications when purchases are completed.
 * Triggered by Supabase Database Webhook on orders table INSERT/UPDATE.
 * 
 * Setup:
 * 1. Add TELEGRAM_BOT_TOKEN to Supabase secrets
 * 2. Add TELEGRAM_CHAT_ID to Supabase secrets (Brandon: 7947983258)
 * 3. Create Database Webhook for 'orders' table:
 *    - Events: INSERT, UPDATE
 *    - HTTP Request: POST to this Edge Function URL
 *    - Filter: status = 'completed' AND old.status != 'completed'
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface OrderPayload {
  type: 'INSERT' | 'UPDATE'
  table: string
  record: any
  old_record?: any
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const telegramToken = Deno.env.get('TELEGRAM_BOT_TOKEN')!
    const telegramChatId = Deno.env.get('TELEGRAM_CHAT_ID')! // Brandon: 7947983258
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const payload: OrderPayload = await req.json()

    console.log(`[Purchase Notification] Received ${payload.type} event`)

    const order = payload.record

    // Only notify for completed orders
    if (order.status !== 'completed') {
      console.log('[Purchase Notification] Order not completed, skipping')
      return new Response(
        JSON.stringify({ skipped: true, reason: 'not completed' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // For UPDATE events, check if status just changed to completed
    if (payload.type === 'UPDATE' && payload.old_record?.status === 'completed') {
      console.log('[Purchase Notification] Order already completed, skipping')
      return new Response(
        JSON.stringify({ skipped: true, reason: 'already notified' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Fetch related data based on order type
    let eventTitle = 'Unknown Event'
    let galleryTitle = 'Unknown Gallery'
    let purchaseType = 'Unknown'
    let amount = 0

    // Determine order type and fetch details
    if (order.livestream_event_id) {
      // Livestream order
      const { data: event } = await supabase
        .from('livestream_events')
        .select('title, live_price, vod_price')
        .eq('id', order.livestream_event_id)
        .single()

      if (event) {
        eventTitle = event.title
        purchaseType = order.purchase_type === 'live' 
          ? '🔴 Live Stream' 
          : order.purchase_type === 'vod'
          ? '🎬 VOD Replay'
          : '📦 Live + VOD Bundle'
        
        // Calculate amount
        if (order.purchase_type === 'live') {
          amount = event.live_price || 0
        } else if (order.purchase_type === 'vod') {
          amount = event.vod_price || 0
        } else if (order.purchase_type === 'bundle') {
          amount = (event.live_price || 0) + (event.vod_price || 0) * 0.5 // Bundle discount
        }
      }
    } else if (order.gallery_id) {
      // Gallery order
      const { data: gallery } = await supabase
        .from('galleries')
        .select('title')
        .eq('id', order.gallery_id)
        .single()

      if (gallery) {
        galleryTitle = gallery.title
      }

      purchaseType = order.items?.includes('videos') && order.items?.includes('photos')
        ? '📸🎥 Photos + Videos'
        : order.items?.includes('videos')
        ? '🎥 Videos Only'
        : '📸 Photos Only'

      amount = order.amount || 0
    }

    // Format notification message
    const emoji = amount >= 100 ? '🎉💰' : amount >= 50 ? '✨' : '✅'
    const title = order.livestream_event_id ? eventTitle : galleryTitle
    const customerEmail = order.email || 'Unknown'
    const timestamp = new Date(order.created_at).toLocaleString('en-AU', { 
      timeZone: 'Australia/Brisbane',
      dateStyle: 'short',
      timeStyle: 'short'
    })

    const message = `${emoji} **New Purchase!**

**Event:** ${title}
**Type:** ${purchaseType}
**Amount:** $${amount.toFixed(2)} AUD
**Customer:** ${customerEmail}
**Time:** ${timestamp}

${amount >= 100 ? '🔥 High value sale! 🔥' : ''}`.trim()

    // Send Telegram notification
    const telegramUrl = `https://api.telegram.org/bot${telegramToken}/sendMessage`
    const telegramResponse = await fetch(telegramUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: telegramChatId,
        text: message,
        parse_mode: 'Markdown',
        disable_web_page_preview: true
      })
    })

    if (!telegramResponse.ok) {
      const error = await telegramResponse.text()
      console.error('[Purchase Notification] Telegram API error:', error)
      throw new Error(`Telegram API error: ${error}`)
    }

    console.log(`[Purchase Notification] ✅ Sent notification for ${customerEmail}`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        customer: customerEmail,
        amount: amount,
        type: purchaseType
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('[Purchase Notification] Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
