// Gallery Delivery: Bulk import & email delivery for I-Walk/Posing Routine videos
// Creates free-access gallery orders for paid athletes and sends delivery emails

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const path = url.pathname.split('/').pop()

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Route: POST /gallery_delivery/import — Bulk create free-access orders from content orders OR CSV
    if (req.method === 'POST' && path === 'import') {
      const { gallery_id, event_id, content_type, csv_rows } = await req.json()

      if (!gallery_id) {
        return new Response(
          JSON.stringify({ error: 'Missing gallery_id' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const contentType = content_type || 'I-Walk / Posing Routine'

      // CSV import mode: create gallery_orders directly from pasted data
      if (csv_rows && csv_rows.length > 0) {
        const { data: gallery } = await supabase
          .from('galleries')
          .select('id, title, slug, organizations(id, name)')
          .eq('id', gallery_id)
          .single()

        const results = { created: 0, skipped: 0, errors: 0, details: [] as any[] }

        for (const row of csv_rows) {
          if (!row.email || !row.email.includes('@')) {
            results.errors++
            results.details.push({ email: row.email || '', name: `${row.first_name || ''} ${row.last_name || ''}`.trim(), status: 'error', error: 'Invalid email' })
            continue
          }

          const { data: existingOrder } = await supabase
            .from('gallery_orders')
            .select('id, status')
            .eq('gallery_id', gallery_id)
            .ilike('email', row.email.toLowerCase())
            .limit(1)

          if (existingOrder && existingOrder.length > 0) {
            results.skipped++
            results.details.push({ email: row.email, name: `${row.first_name || ''} ${row.last_name || ''}`.trim(), status: 'already_exists', existing_status: existingOrder[0].status })
            continue
          }

          const downloadToken = crypto.randomUUID()
          const { data: galleryOrder, error: createError } = await supabase
            .from('gallery_orders')
            .insert({
              gallery_id: gallery_id,
              email: row.email.toLowerCase(),
              customer_name: `${row.first_name || ''} ${row.last_name || ''}`.trim(),
              total_amount: 0,
              status: 'completed',
              delivery_type: 'free_access',
              athlete_first_name: row.first_name || null,
              athlete_last_name: row.last_name || null,
              athlete_number: row.athlete_number || null,
              notes: row.videography_service ? `Service: ${row.videography_service}${row.event ? ` | Event: ${row.event}` : ''}` : (row.event || null),
              download_token: downloadToken,
              completed_at: new Date().toISOString(),
              delivery_email_sent: false
            })
            .select()
            .single()

          if (createError) {
            console.error('[GalleryDelivery] CSV import error:', createError)
            results.errors++
            results.details.push({ email: row.email, name: `${row.first_name || ''} ${row.last_name || ''}`.trim(), status: 'error', error: createError.message })
            continue
          }

          results.created++
          results.details.push({ email: row.email, name: `${row.first_name || ''} ${row.last_name || ''}`.trim(), status: 'created', order_id: galleryOrder?.id, download_token: downloadToken })
        }

        return new Response(
          JSON.stringify({ success: true, gallery_id, import_type: 'csv', total_rows: csv_rows.length, results }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Content orders import mode (requires event_id)
      if (!event_id) {
        return new Response(
          JSON.stringify({ error: 'Missing event_id (required for content order import). Use csv_rows for direct CSV import.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Get all paid content orders for this event
      const { data: contentOrders, error: ordersError } = await supabase
        .from('content_orders')
        .select('id, first_name, last_name, email, athlete_number, amount, status')
        .eq('event_id', event_id)
        .eq('status', 'paid')

      if (ordersError) {
        console.error('[GalleryDelivery] Error fetching content orders:', ordersError)
        return new Response(
          JSON.stringify({ error: 'Failed to fetch content orders' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Get all gallery items (photos + videos) for this gallery
      const { data: galleryItems, error: itemsError } = await supabase
        .from('gallery_order_items')
        .select('id')
        .eq('order_id', gallery_id)
        .limit(1)

      // Get gallery info with organization
      const { data: gallery } = await supabase
        .from('galleries')
        .select('id, title, slug, organizations(id, name)')
        .eq('id', gallery_id)
        .single()

      // Get all gallery photos for this gallery
      const { data: photos } = await supabase
        .from('gallery_photos')
        .select('id, filename, category')
        .eq('gallery_id', gallery_id)

      // Get all video clips for this gallery (if video gallery system exists)
      const { data: clips } = await supabase
        .from('gallery_clips')
        .select('id, filename, category')
        .eq('gallery_id', gallery_id)
        .limit(100)

      const results = { created: 0, skipped: 0, errors: 0, details: [] as any[] }

      for (const order of contentOrders) {
        // Check if this athlete already has a gallery order
        const { data: existingOrder } = await supabase
          .from('gallery_orders')
          .select('id, status')
          .eq('gallery_id', gallery_id)
          .ilike('email', order.email.toLowerCase())
          .limit(1)

        if (existingOrder && existingOrder.length > 0) {
          results.skipped++
          results.details.push({
            email: order.email,
            name: `${order.first_name} ${order.last_name}`,
            status: 'already_exists',
            existing_status: existingOrder[0].status
          })
          continue
        }

        // Create a free-access gallery order for this athlete
        const downloadToken = crypto.randomUUID()
        
        const { data: galleryOrder, error: createError } = await supabase
          .from('gallery_orders')
          .insert({
            gallery_id: gallery_id,
            email: order.email.toLowerCase(),
            customer_name: `${order.first_name} ${order.last_name}`.trim(),
            total_amount: 0, // Free — they already paid via content order
            status: 'completed',
            delivery_type: 'free_access',
            content_order_id: order.id,
            athlete_first_name: order.first_name,
            athlete_last_name: order.last_name,
            athlete_number: order.athlete_number,
            download_token: downloadToken,
            completed_at: new Date().toISOString(),
            delivery_email_sent: false
          })
          .select()
          .single()

        if (createError) {
          console.error('[GalleryDelivery] Error creating order:', createError)
          results.errors++
          results.details.push({
            email: order.email,
            name: `${order.first_name} ${order.last_name}`,
            status: 'error',
            error: createError.message
          })
          continue
        }

        results.created++
        results.details.push({
          email: order.email,
          name: `${order.first_name} ${order.last_name}`,
          status: 'created',
          order_id: galleryOrder?.id,
          download_token: downloadToken
        })
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          gallery_id,
          event_id,
          content_type: contentType,
          total_content_orders: contentOrders?.length || 0,
          results
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Route: POST /gallery-delivery/send-emails — Send delivery emails to athletes
    if (req.method === 'POST' && path === 'send-emails') {
      const { gallery_id, email_type, content_type, event_name, event_date, dry_run } = await req.json()

      if (!gallery_id || !email_type) {
        return new Response(
          JSON.stringify({ error: 'Missing gallery_id or email_type' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const contentType = content_type || 'I-Walk / Posing Routine'
      const isDryRun = dry_run === true
      const postmarkToken = Deno.env.get('POSTMARK_SERVER_TOKEN')
      
      if (!isDryRun && !postmarkToken) {
        return new Response(
          JSON.stringify({ error: 'Postmark not configured' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Get gallery
      const { data: gallery } = await supabase
        .from('galleries')
        .select('id, title, slug')
        .eq('id', gallery_id)
        .single()

      if (!gallery) {
        return new Response(
          JSON.stringify({ error: 'Gallery not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const galleryUrl = `https://fitfocusmedia.com.au/#/gallery/${gallery.slug}`
      const orgName = gallery?.organizations?.name || 'Fit Focus Media'
      const results = { sent: 0, failed: 0, details: [] as any[] }

      if (email_type === 'delivery') {
        // Send to athletes who already paid (free access)
        const { data: freeOrders } = await supabase
          .from('gallery_orders')
          .select('id, email, customer_name, download_token, athlete_first_name, athlete_last_name, delivery_email_sent, galleries(title, organizations(name))')
          .eq('gallery_id', gallery_id)
          .eq('delivery_type', 'free_access')
          .eq('delivery_email_sent', false)

        for (const order of (freeOrders || [])) {
          const downloadUrl = `https://fitfocusmedia.com.au/#/gallery/download/${order.download_token}`
          const firstName = order.athlete_first_name || order.customer_name?.split(' ')[0] || 'Athlete'
          const orgName = gallery?.organizations?.name || 'Fit Focus Media'

          // Dry run: skip sending, just record what would be sent
          if (isDryRun) {
            results.sent++
            results.details.push({
              email: order.email,
              name: order.customer_name,
              status: 'dry_run',
              type: 'delivery',
              subject: `Your ${contentType} Is Ready! - ${gallery.title} 🎬`,
              download_url: downloadUrl,
              first_name: firstName
            })
            continue
          }

          // Build button using table for email client compatibility (matches gallery_webhook style)
          const buttonHtml = `
            <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin: 20px 0;">
              <tr>
                <td align="center" bgcolor="#e53e3e" style="border-radius: 6px;">
                  <a href="${downloadUrl}" target="_blank" style="display: inline-block; padding: 14px 30px; font-family: Arial, sans-serif; font-size: 16px; color: #ffffff; text-decoration: none; font-weight: bold; border-radius: 6px;">
                    View & Download Your Video
                  </a>
                </td>
              </tr>
            </table>
            <p style="color: #666; font-size: 13px; margin-top: 10px;">
              Button not working? Copy and paste this link into your browser:<br>
              <a href="${downloadUrl}" style="color: #e53e3e; word-break: break-all;">${downloadUrl}</a>
            </p>
          `

          const emailBody = {
            From: 'info@fitfocusmedia.com.au',
            To: order.email,
            Subject: `Your ${contentType} Is Ready! - ${gallery.title} 🎬`,
            HtmlBody: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h1 style="color: #e53e3e; margin: 0 0 20px;">FIT FOCUS MEDIA</h1>
                <h2 style="margin: 0 0 20px;">Hey ${firstName}! Your ${contentType} is ready 🎉</h2>
                
                <p>Thanks for ordering your ${contentType}! Your video is now available to view and download.</p>
                
                <div style="background: #f7f7f7; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <p style="margin: 0; font-size: 18px; font-weight: bold;">${gallery.title}</p>
                  <p style="margin: 5px 0 0; color: #666;">${orgName}</p>
                  <p style="margin: 10px 0 0; font-size: 20px; font-weight: bold; color: #e53e3e;">FREE ACCESS</p>
                </div>
                
                <h3 style="margin: 20px 0 10px;">Download Your Video</h3>
                <p style="margin: 0 0 10px; color: #333;">Click the button below to view and download your content.</p>
                
                ${buttonHtml}
                
                <p style="color: #666; font-size: 14px;">
                  <strong>How to access:</strong> Your access is linked to this email address: <strong>${order.email}</strong>
                </p>
                
                <p style="color: #999; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
                  Order ID: ${order.id}<br>
                  Questions? Reply to this email or contact us at info@fitfocusmedia.com.au
                </p>
              </div>
            `,
            TextBody: `Hey ${firstName}! Your ${contentType} is ready!\n\nThanks for ordering! Your video from ${gallery.title} is now available.\n\nDownload here:\n${downloadUrl}\n\nAccess linked to: ${order.email}\nOrder ID: ${order.id}\n\n— Fit Focus Media`,
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
              // Mark as sent
              await supabase
                .from('gallery_orders')
                .update({ delivery_email_sent: true, delivery_email_sent_at: new Date().toISOString() })
                .eq('id', order.id)
              
              results.sent++
              results.details.push({ email: order.email, name: order.customer_name, status: 'sent' })
            } else {
              const errorData = await response.json()
              console.error('[GalleryDelivery] Email failed:', errorData)
              results.failed++
              results.details.push({ email: order.email, name: order.customer_name, status: 'failed', error: errorData.Message || 'Unknown error' })
            }
          } catch (err) {
            console.error('[GalleryDelivery] Email error:', err)
            results.failed++
            results.details.push({ email: order.email, name: order.customer_name, status: 'error' })
          }
        }
      } else if (email_type === 'promo') {
        // Send to athletes who competed but didn't order (purchase invitation)
        // Get content orders for this event with status != 'paid'
        const { data: unpaidOrders } = await supabase
          .from('content_orders')
          .select('id, email, first_name, last_name, athlete_number, status')
          .eq('event_id', event_id)
          .neq('status', 'paid')

        for (const order of (unpaidOrders || [])) {
          const firstName = order.first_name || 'Athlete'
          const galleryViewUrl = `${galleryUrl}?email=${encodeURIComponent(order.email)}`

          // Dry run: skip sending, just record what would be sent
          if (isDryRun) {
            results.sent++
            results.details.push({
              email: order.email,
              name: `${order.first_name} ${order.last_name}`,
              status: 'dry_run',
              type: 'promo',
              subject: `${contentType}s from ${event_name || gallery.title} Are Now Available! 🎬`,
              preview_url: galleryViewUrl,
              first_name: firstName
            })
            continue
          }

          // Build button using table for email client compatibility (matches gallery_webhook style)
          const promoButtonHtml = `
            <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin: 20px 0;">
              <tr>
                <td align="center" bgcolor="#e53e3e" style="border-radius: 6px;">
                  <a href="${galleryViewUrl}" target="_blank" style="display: inline-block; padding: 14px 30px; font-family: Arial, sans-serif; font-size: 16px; color: #ffffff; text-decoration: none; font-weight: bold; border-radius: 6px;">
                    Preview & Purchase →
                  </a>
                </td>
              </tr>
            </table>
            <p style="color: #666; font-size: 13px; margin-top: 10px;">
              Button not working? Copy and paste this link into your browser:<br>
              <a href="${galleryViewUrl}" style="color: #e53e3e; word-break: break-all;">${galleryViewUrl}</a>
            </p>
          `

          const emailBody = {
            From: 'info@fitfocusmedia.com.au',
            To: order.email,
            Subject: `${contentType}s from ${event_name || gallery.title} Are Now Available! 🎬`,
            HtmlBody: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h1 style="color: #e53e3e; margin: 0 0 20px;">FIT FOCUS MEDIA</h1>
                <h2 style="margin: 0 0 20px;">Hey ${firstName}! Your ${contentType} is now available 🎬</h2>
                
                <p>We captured your ${contentType} at ${event_name || gallery.title}! You can now preview and purchase your video.</p>
                
                <div style="background: #f7f7f7; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <p style="margin: 0; font-size: 18px; font-weight: bold;">${gallery.title}</p>
                  <p style="margin: 5px 0 0; color: #666;">${orgName}</p>
                </div>
                
                ${promoButtonHtml}
                
                <p style="color: #666; font-size: 14px;">Access is linked to your email: <strong>${order.email}</strong></p>
                
                <p style="color: #999; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
                  Questions? Reply to this email or contact us at info@fitfocusmedia.com.au
                </p>
              </div>
            `,
            TextBody: `Hey ${firstName}!\n\nYour ${contentType} from ${event_name || gallery.title} is now available for preview and purchase.\n\nView here: ${galleryViewUrl}\n\nAccess linked to: ${order.email}\n\n— Fit Focus Media`,
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
              // Mark promo as sent
              await supabase
                .from('content_orders')
                .update({ promo_email_sent: true, promo_email_sent_at: new Date().toISOString() })
                .eq('id', order.id)

              results.sent++
              results.details.push({ email: order.email, name: `${order.first_name} ${order.last_name}`, status: 'sent' })
            } else {
              results.failed++
              results.details.push({ email: order.email, name: `${order.first_name} ${order.last_name}`, status: 'failed' })
            }
          } catch (err) {
            results.failed++
            results.details.push({ email: order.email, name: `${order.first_name} ${order.last_name}`, status: 'error' })
          }
        }
      }

      return new Response(
        JSON.stringify({ success: true, email_type, dry_run: isDryRun, results }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('[GalleryDelivery] Error:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})