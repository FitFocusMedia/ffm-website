// Gallery Delivery: Bulk import & email delivery for I-Walk/Posing Routine videos
// Creates free-access gallery orders for paid athletes and sends delivery/promo emails
// v2: Added promo support for CSV-imported athletes + full email preview in dry run

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

    // Route: POST /gallery_delivery/import — Bulk create gallery orders from content orders OR CSV
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

        const results = { created_delivery: 0, created_promo: 0, skipped: 0, errors: 0, details: [] as any[] }

        // Determine which athletes have I-Walk/Posing orders
        const iwalkKeywords = ['i-walk', 'i walk', 'iwalk']
        const posingKeywords = ['posing', 'routine']

        for (const row of csv_rows) {
          if (!row.email || !row.email.includes('@')) {
            results.errors++
            results.details.push({ email: row.email || '', name: `${row.first_name || ''} ${row.last_name || ''}`.trim(), status: 'error', error: 'Invalid email' })
            continue
          }

          // Determine delivery type based on what they ordered
          const service = (row.videography_service || '').toLowerCase()
          const hasIWalk = iwalkKeywords.some(kw => service.includes(kw))
          const hasPosing = posingKeywords.some(kw => service.includes(kw))
          const hasOrder = service && (hasIWalk || hasPosing)
          const deliveryType = hasOrder ? 'free_access' : 'promo'

          const { data: existingOrder } = await supabase
            .from('gallery_orders')
            .select('id, status, delivery_type')
            .eq('gallery_id', gallery_id)
            .ilike('email', row.email.toLowerCase())
            .limit(1)

          if (existingOrder && existingOrder.length > 0) {
            results.skipped++
            results.details.push({ 
              email: row.email, 
              name: `${row.first_name || ''} ${row.last_name || ''}`.trim(), 
              status: 'already_exists', 
              existing_status: existingOrder[0].status,
              existing_delivery_type: existingOrder[0].delivery_type
            })
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
              delivery_type: deliveryType,
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

          if (deliveryType === 'free_access') {
            results.created_delivery++
          } else {
            results.created_promo++
          }
          results.details.push({ 
            email: row.email, 
            name: `${row.first_name || ''} ${row.last_name || ''}`.trim(), 
            status: 'created', 
            delivery_type: deliveryType,
            order_id: galleryOrder?.id, 
            download_token: downloadToken 
          })
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            gallery_id, 
            import_type: 'csv', 
            total_rows: csv_rows.length, 
            results,
            summary: {
              total: results.created_delivery + results.created_promo + results.skipped + results.errors,
              delivery: results.created_delivery,
              promo: results.created_promo,
              skipped: results.skipped,
              errors: results.errors
            }
          }),
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

      // Get gallery info with organization
      const { data: gallery } = await supabase
        .from('galleries')
        .select('id, title, slug, organizations(id, name)')
        .eq('id', gallery_id)
        .single()

      const results = { created_delivery: 0, created_promo: 0, skipped: 0, errors: 0, details: [] as any[] }

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

        // Create a free-access gallery order for this paid athlete
        const downloadToken = crypto.randomUUID()
        
        const { data: galleryOrder, error: createError } = await supabase
          .from('gallery_orders')
          .insert({
            gallery_id: gallery_id,
            email: order.email.toLowerCase(),
            customer_name: `${order.first_name} ${order.last_name}`.trim(),
            total_amount: 0,
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

        results.created_delivery++
        results.details.push({
          email: order.email,
          name: `${order.first_name} ${order.last_name}`,
          status: 'created',
          delivery_type: 'free_access',
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
          results,
          summary: {
            total: results.created_delivery + results.created_promo + results.skipped + results.errors,
            delivery: results.created_delivery,
            promo: results.created_promo,
            skipped: results.skipped,
            errors: results.errors
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Route: POST /gallery_delivery/send-emails — Send delivery or promo emails
    if (req.method === 'POST' && path === 'send-emails') {
      const { gallery_id, email_type, content_type, event_id, event_name, event_date, dry_run } = await req.json()

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
        .select('id, title, slug, organizations(id, name)')
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
        // Send to athletes who already paid (free_access orders)
        let query = supabase
          .from('gallery_orders')
          .select('id, email, customer_name, download_token, athlete_first_name, athlete_last_name, notes, delivery_email_sent, galleries(title, organizations(name))')
          .eq('gallery_id', gallery_id)
          .eq('delivery_type', 'free_access')
          .eq('delivery_email_sent', false)
        
        const { data: freeOrders } = await query

        // Filter orders by content type if specified
        const filteredOrders = (freeOrders || []).filter((order: any) => {
          if (!content_type || content_type === 'I-Walk / Posing Routine') return true
          const notesLower = (order.notes || '').toLowerCase()
          if (content_type.toLowerCase().includes('i-walk') && notesLower.includes('i-walk')) return true
          if (content_type.toLowerCase().includes('posing') && notesLower.includes('posing')) return true
          if (!order.notes) return true
          return false
        })

        for (const order of filteredOrders) {
          const downloadUrl = `https://fitfocusmedia.com.au/#/gallery/download/${order.download_token}`
          const firstName = order.athlete_first_name || order.customer_name?.split(' ')[0] || 'Athlete'

          // Build the full email HTML
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

          const fullHtmlBody = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1 style="color: #e53e3e; margin: 0 0 20px;">FIT FOCUS MEDIA</h1>
              <h2 style="margin: 0 0 20px;">Hey ${firstName}! 👋</h2>
              
              <p>Hope you're having a fantastic day and feeling great post-show!</p>
              
              <p>First off, we'd like to say a massive <strong>thank you</strong> for choosing to support Fit Focus Media and allowing us to be a part of your special day. You absolutely <strong>crushed it</strong> out on stage — congratulations on an amazing effort! 🏆</p>
              
              <p>We'd also like to say a personal thank you for your patience in getting your content over to you. This season has been more than we could have ever expected, and we're truly grateful for your support as we continue to develop better systems and processes.</p>
              
              <div style="background: #f7f7f7; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0; font-size: 18px; font-weight: bold;">${gallery.title}</p>
                <p style="margin: 5px 0 0; color: #666;">${orgName}</p>
                <p style="margin: 10px 0 0; font-size: 20px; font-weight: bold; color: #e53e3e;">Your ${contentType} Is Ready!</p>
              </div>
              
              <p>Your ${contentType} is now available to view and download. Below you'll find your access link.</p>
              
              ${buttonHtml}
              
              <p style="color: #666; font-size: 14px;"><strong>How to access:</strong> Your access is linked to this email address — <strong>${order.email}</strong></p>
              
              <div style="background: #fff8e1; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
                <p style="margin: 0; font-size: 14px;"><strong>📌 Please Note:</strong> If you have ordered other content from our team, such as a Show Day Highlight, or content that is separate from us such as show day photos, these will be delivered on their own when ready.</p>
              </div>
              
              <p>If you have any issues with downloading or saving your files, please feel free to get in touch at any point and one of our team will be more than happy to assist.</p>
              
              <p>If you've enjoyed working with us, we'd love if you could leave a review on Google — it helps us so much! 👇</p>
              <p><a href="https://g.page/r/CYhE4-27_SwIEB0/review" style="background: #e53e3e; color: #fff; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: bold;">⭐ Leave a Google Review</a></p>
              
              <p style="color: #999; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
                Thank you once again, ${firstName}. Speak soon!<br><br>
                — The Fit Focus Media Team<br>
                info@fitfocusmedia.com.au
              </p>
            </div>
          `

          const textBody = `Hey ${firstName}!

Hope you're having a fantastic day and feeling great post-show!

First off, we'd like to say a massive thank you for choosing to support Fit Focus Media and allowing us to be a part of your special day. You absolutely crushed it out on stage — congratulations on an amazing effort!

Your ${contentType} from ${gallery.title} is now ready to view and download.

Download here:
${downloadUrl}

Your access is linked to: ${order.email}

If you have any issues, please get in touch and one of our team will be happy to assist.

If you've enjoyed working with us, please consider leaving a review:
https://g.page/r/CYhE4-27_SwIEB0/review

Thank you once again, ${firstName}. Speak soon!

— The Fit Focus Media Team
info@fitfocusmedia.com.au`

          if (isDryRun) {
            results.sent++
            results.details.push({
              email: order.email,
              name: order.customer_name,
              status: 'dry_run',
              type: 'delivery',
              subject: `Your ${contentType} from ${gallery.title} Is Ready! 🎬`,
              download_url: downloadUrl,
              first_name: firstName,
              html_preview: fullHtmlBody
            })
            continue
          }

          const emailPayload = {
            From: 'info@fitfocusmedia.com.au',
            To: order.email,
            Subject: `Your ${contentType} from ${gallery.title} Is Ready! 🎬`,
            HtmlBody: fullHtmlBody,
            TextBody: textBody,
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
              body: JSON.stringify(emailPayload)
            })

            if (response.ok) {
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
        // Send promo emails to athletes who didn't pre-order
        // Source 1: gallery_orders with delivery_type = 'promo' (from CSV import)
        const { data: promoOrders } = await supabase
          .from('gallery_orders')
          .select('id, email, customer_name, download_token, athlete_first_name, athlete_last_name, notes, delivery_email_sent, galleries(title, organizations(name))')
          .eq('gallery_id', gallery_id)
          .eq('delivery_type', 'promo')

        // Filter out already-sent promos (handles both cases: column exists or not)
        const unsentPromoOrders = (promoOrders || []).filter((o: any) => !o.promo_email_sent && !o.delivery_email_sent)

        // Source 2: content_orders with status != 'paid' (from website orders)
        // Source 2: content_orders with status != 'paid' (from website orders)
        // Only used if event_id is provided

        // Process promo gallery orders (from CSV import)
        for (const order of unsentPromoOrders) {
          const firstName = order.athlete_first_name || order.customer_name?.split(' ')[0] || 'Athlete'
          const galleryViewUrl = `${galleryUrl}?email=${encodeURIComponent(order.email)}`

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

          const fullHtmlBody = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1 style="color: #e53e3e; margin: 0 0 20px;">FIT FOCUS MEDIA</h1>
              <h2 style="margin: 0 0 20px;">Hey ${firstName}! 👋</h2>
              
              <p>Hope you're having a fantastic day and feeling great post-show!</p>
              
              <p>We captured your ${contentType} at <strong>${gallery.title}</strong> and it's now available to preview and purchase! You absolutely crushed it on stage — congratulations on an amazing effort! 🏆</p>
              
              <div style="background: #f7f7f7; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0; font-size: 18px; font-weight: bold;">${gallery.title}</p>
                <p style="margin: 5px 0 0; color: #666;">${orgName}</p>
              </div>
              
              <p>Click below to preview your footage and purchase your ${contentType}.</p>
              
              ${promoButtonHtml}
              
              <p style="color: #666; font-size: 14px;"><strong>How to access:</strong> Your preview is linked to this email address — <strong>${order.email}</strong></p>
              
              <p>If you have any questions, please feel free to get in touch at any point and one of our team will be more than happy to assist.</p>
              
              <p>If you've enjoyed working with us, we'd love if you could leave a review on Google! 👇</p>
              <p><a href="https://g.page/r/CYhE4-27_SwIEB0/review" style="background: #e53e3e; color: #fff; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: bold;">⭐ Leave a Google Review</a></p>
              
              <p style="color: #999; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
                — The Fit Focus Media Team<br>
                info@fitfocusmedia.com.au
              </p>
            </div>
          `

          const textBody = `Hey ${firstName}!

Hope you're having a fantastic day and feeling great post-show!

We captured your ${contentType} at ${gallery.title} and it's now available to preview and purchase! You absolutely crushed it on stage — congratulations!

Preview and purchase here:
${galleryViewUrl}

Your access is linked to: ${order.email}

If you have any questions, please get in touch and one of our team will be happy to assist.

If you've enjoyed working with us, please consider leaving a review:
https://g.page/r/CYhE4-27_SwIEB0/review

— The Fit Focus Media Team
info@fitfocusmedia.com.au`

          if (isDryRun) {
            results.sent++
            results.details.push({
              email: order.email,
              name: order.customer_name,
              status: 'dry_run',
              type: 'promo',
              source: 'gallery_orders',
              subject: `${contentType}s from ${gallery.title} Are Now Available! 🎬`,
              preview_url: galleryViewUrl,
              first_name: firstName,
              html_preview: fullHtmlBody
            })
            continue
          }

          const emailPayload = {
            From: 'info@fitfocusmedia.com.au',
            To: order.email,
            Subject: `${contentType}s from ${gallery.title} Are Now Available! 🎬`,
            HtmlBody: fullHtmlBody,
            TextBody: textBody,
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
              body: JSON.stringify(emailPayload)
            })

            if (response.ok) {
              await supabase
                .from('gallery_orders')
                .update({ delivery_email_sent: true, delivery_email_sent_at: new Date().toISOString() })
                .eq('id', order.id)
              
              results.sent++
              results.details.push({ email: order.email, name: order.customer_name, status: 'sent' })
            } else {
              const errorData = await response.json()
              results.failed++
              results.details.push({ email: order.email, name: order.customer_name, status: 'failed', error: errorData.Message || 'Unknown error' })
            }
          } catch (err) {
            results.failed++
            results.details.push({ email: order.email, name: order.customer_name, status: 'error' })
          }
        }

        // Source 2: content_orders with status != 'paid' (from website orders)
        // Only used if event_id is provided
        if (event_id) {
          const { data: unpaidOrders } = await supabase
            .from('content_orders')
            .select('id, email, first_name, last_name, athlete_number, status')
            .eq('event_id', event_id)
            .neq('status', 'paid')

          for (const order of (unpaidOrders || [])) {
            // Skip if this athlete already has a gallery order (avoid duplicates)
            const { data: existingPromo } = await supabase
              .from('gallery_orders')
              .select('id')
              .eq('gallery_id', gallery_id)
              .ilike('email', order.email.toLowerCase())
              .limit(1)

            if (existingPromo && existingPromo.length > 0) continue

            const firstName = order.first_name || 'Athlete'
            const galleryViewUrl = `${galleryUrl}?email=${encodeURIComponent(order.email)}`

            if (isDryRun) {
              results.sent++
              results.details.push({
                email: order.email,
                name: `${order.first_name} ${order.last_name}`,
                status: 'dry_run',
                type: 'promo',
                source: 'content_orders',
                subject: `${contentType}s from ${event_name || gallery.title} Are Now Available! 🎬`,
                preview_url: galleryViewUrl,
                first_name: firstName
              })
              continue
            }

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

            const fullHtmlBody = `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h1 style="color: #e53e3e; margin: 0 0 20px;">FIT FOCUS MEDIA</h1>
                <h2 style="margin: 0 0 20px;">Hey ${firstName}! 👋</h2>
                <p>Hope you're having a fantastic day and feeling great post-show!</p>
                <p>We captured your ${contentType} at <strong>${event_name || gallery.title}</strong> and it's now available to preview and purchase! You absolutely crushed it on stage — congratulations on an amazing effort! 🏆</p>
                <div style="background: #f7f7f7; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <p style="margin: 0; font-size: 18px; font-weight: bold;">${gallery.title}</p>
                  <p style="margin: 5px 0 0; color: #666;">${orgName}</p>
                </div>
                <p>Click below to preview your footage and purchase your ${contentType}.</p>
                ${promoButtonHtml}
                <p style="color: #666; font-size: 14px;"><strong>How to access:</strong> Your preview is linked to this email address — <strong>${order.email}</strong></p>
                <p>If you have any questions, please feel free to get in touch at any point and one of our team will be more than happy to assist.</p>
                <p>If you've enjoyed working with us, we'd love if you could leave a review on Google! 👇</p>
                <p><a href="https://g.page/r/CYhE4-27_SwIEB0/review" style="background: #e53e3e; color: #fff; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: bold;">⭐ Leave a Google Review</a></p>
                <p style="color: #999; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
                  — The Fit Focus Media Team<br>
                  info@fitfocusmedia.com.au
                </p>
              </div>
            `

            const textBody = `Hey ${firstName}!

Hope you're having a fantastic day and feeling great post-show!

We captured your ${contentType} at ${event_name || gallery.title} and it's now available to preview and purchase!

Preview and purchase here:
${galleryViewUrl}

Your access is linked to: ${order.email}

— The Fit Focus Media Team
info@fitfocusmedia.com.au`

            const emailPayload = {
              From: 'info@fitfocusmedia.com.au',
              To: order.email,
              Subject: `${contentType}s from ${event_name || gallery.title} Are Now Available! 🎬`,
              HtmlBody: fullHtmlBody,
              TextBody: textBody,
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
                body: JSON.stringify(emailPayload)
              })

              if (response.ok) {
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
      }

      return new Response(
        JSON.stringify({ success: true, email_type, dry_run: isDryRun, results }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Route: POST /gallery_delivery/reset-tokens — Reset download tokens and re-send emails
    if (req.method === 'POST' && path === 'reset-tokens') {
      const { gallery_id, email_type, content_type, event_id, event_name, dry_run } = await req.json()

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
        .select('id, title, slug, organizations(id, name)')
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

      // Get orders that need token reset (delivery_email_sent = false means emails were sent with old tokens)
      let query = supabase
        .from('gallery_orders')
        .select('id, email, customer_name, download_token, delivery_type, athlete_first_name, athlete_last_name, notes, delivery_email_sent, galleries(title, organizations(name))')
        .eq('gallery_id', gallery_id)

      if (email_type === 'delivery') {
        query = query.eq('delivery_type', 'free_access')
      } else if (email_type === 'promo') {
        query = query.eq('delivery_type', 'promo')
      }

      const { data: orders, error: ordersError } = await query

      if (ordersError) {
        return new Response(
          JSON.stringify({ error: ordersError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const results = { reset: 0, sent: 0, failed: 0, details: [] as any[] }

      for (const order of (orders || [])) {
        // Generate new download token
        const newToken = crypto.randomUUID()

        if (isDryRun) {
          results.reset++
          results.details.push({
            email: order.email,
            name: order.customer_name,
            old_token: order.download_token,
            new_token: newToken,
            status: 'dry_run'
          })
          continue
        }

        // Update the download token in the database
        const { error: updateError } = await supabase
          .from('gallery_orders')
          .update({ download_token: newToken })
          .eq('id', order.id)

        if (updateError) {
          console.error('[GalleryDelivery] Token reset error:', updateError)
          results.failed++
          results.details.push({ email: order.email, name: order.customer_name, status: 'token_reset_failed', error: updateError.message })
          continue
        }

        results.reset++

        // Now send the email with the new token
        const firstName = order.athlete_first_name || order.customer_name?.split(' ')[0] || 'Athlete'

        if (email_type === 'delivery') {
          const downloadUrl = `https://fitfocusmedia.com.au/#/gallery/download/${newToken}`

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

          const fullHtmlBody = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1 style="color: #e53e3e; margin: 0 0 20px;">FIT FOCUS MEDIA</h1>
              <h2 style="margin: 0 0 20px;">Hey ${firstName}! 👋</h2>
              <p>Hope you're having a fantastic day and feeling great post-show!</p>
              <p>First off, we'd like to say a massive <strong>thank you</strong> for choosing to support Fit Focus Media and allowing us to be a part of your special day. You absolutely <strong>crushed it</strong> out on stage — congratulations on an amazing effort! 🏆</p>
              <p>We'd also like to say a personal thank you for your patience in getting your content over to you. This season has been more than we could have ever expected, and we're truly grateful for your support as we continue to develop better systems and processes.</p>
              <div style="background: #f7f7f7; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0; font-size: 18px; font-weight: bold;">${gallery.title}</p>
                <p style="margin: 5px 0 0; color: #666;">${orgName}</p>
                <p style="margin: 10px 0 0; font-size: 20px; font-weight: bold; color: #e53e3e;">Your ${contentType} Is Ready!</p>
              </div>
              <p>Your ${contentType} is now available to view and download. Below you'll find your access link.</p>
              ${buttonHtml}
              <p style="color: #666; font-size: 14px;"><strong>How to access:</strong> Your access is linked to this email address — <strong>${order.email}</strong></p>
              <div style="background: #fff8e1; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
                <p style="margin: 0; font-size: 14px;"><strong>📌 Please Note:</strong> If you have ordered other content from our team, such as a Show Day Highlight, or content that is separate from us such as show day photos, these will be delivered on their own when ready.</p>
              </div>
              <p>If you have any issues with downloading or saving your files, please feel free to get in touch at any point and one of our team will be more than happy to assist.</p>
              <p>If you've enjoyed working with us, we'd love if you could leave a review on Google — it helps us so much! 👇</p>
              <p><a href="https://g.page/r/CYhE4-27_SwIEB0/review" style="background: #e53e3e; color: #fff; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: bold;">⭐ Leave a Google Review</a></p>
              <p style="color: #999; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
                Thank you once again, ${firstName}. Speak soon!<br><br>
                — The Fit Focus Media Team<br>
                info@fitfocusmedia.com.au
              </p>
            </div>
          `

          const textBody = `Hey ${firstName}!\n\nHope you're having a fantastic day and feeling great post-show!\n\nFirst off, we'd like to say a massive thank you for choosing to support Fit Focus Media and allowing us to be a part of your special day. You absolutely crushed it out on stage — congratulations on an amazing effort!\n\nYour ${contentType} from ${gallery.title} is now ready to view and download.\n\nDownload here:\n${downloadUrl}\n\nYour access is linked to: ${order.email}\n\nIf you have any issues, please get in touch and one of our team will be happy to assist.\n\nIf you've enjoyed working with us, please consider leaving a review:\nhttps://g.page/r/CYhE4-27_SwIEB0/review\n\nThank you once again, ${firstName}. Speak soon!\n\n— The Fit Focus Media Team\ninfo@fitfocusmedia.com.au`

          try {
            const response = await fetch('https://api.postmarkapp.com/email', {
              method: 'POST',
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-Postmark-Server-Token': postmarkToken
              },
              body: JSON.stringify({
                From: 'info@fitfocusmedia.com.au',
                To: order.email,
                Subject: `Your ${contentType} from ${gallery.title} Is Ready! 🎬`,
                HtmlBody: fullHtmlBody,
                TextBody: textBody,
                MessageStream: 'outbound'
              })
            })

            if (response.ok) {
              await supabase
                .from('gallery_orders')
                .update({ delivery_email_sent: true, delivery_email_sent_at: new Date().toISOString() })
                .eq('id', order.id)
              results.sent++
              results.details.push({ email: order.email, name: order.customer_name, status: 'sent', new_token: newToken, download_url: downloadUrl })
            } else {
              const errorData = await response.json()
              results.failed++
              results.details.push({ email: order.email, name: order.customer_name, status: 'email_failed', error: errorData.Message || 'Unknown error' })
            }
          } catch (err) {
            results.failed++
            results.details.push({ email: order.email, name: order.customer_name, status: 'email_error', error: String(err) })
          }
        } else if (email_type === 'promo') {
          const galleryViewUrl = `${galleryUrl}?email=${encodeURIComponent(order.email)}`

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

          const fullHtmlBody = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1 style="color: #e53e3e; margin: 0 0 20px;">FIT FOCUS MEDIA</h1>
              <h2 style="margin: 0 0 20px;">Hey ${firstName}! 👋</h2>
              <p>Hope you're having a fantastic day and feeling great post-show!</p>
              <p>We captured your ${contentType} at <strong>${gallery.title}</strong> and it's now available to preview and purchase! You absolutely crushed it on stage — congratulations on an amazing effort! 🏆</p>
              <div style="background: #f7f7f7; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0; font-size: 18px; font-weight: bold;">${gallery.title}</p>
                <p style="margin: 5px 0 0; color: #666;">${orgName}</p>
              </div>
              <p>Click below to preview your footage and purchase your ${contentType}.</p>
              ${promoButtonHtml}
              <p style="color: #666; font-size: 14px;"><strong>How to access:</strong> Your preview is linked to this email address — <strong>${order.email}</strong></p>
              <p>If you have any questions, please feel free to get in touch at any point and one of our team will be more than happy to assist.</p>
              <p>If you've enjoyed working with us, we'd love if you could leave a review on Google! 👇</p>
              <p><a href="https://g.page/r/CYhE4-27_SwIEB0/review" style="background: #e53e3e; color: #fff; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: bold;">⭐ Leave a Google Review</a></p>
              <p style="color: #999; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
                — The Fit Focus Media Team<br>
                info@fitfocusmedia.com.au
              </p>
            </div>
          `

          const textBody = `Hey ${firstName}!\n\nHope you're having a fantastic day and feeling great post-show!\n\nWe captured your ${contentType} at ${gallery.title} and it's now available to preview and purchase!\n\nPreview and purchase here:\n${galleryViewUrl}\n\nYour access is linked to: ${order.email}\n\n— The Fit Focus Media Team\ninfo@fitfocusmedia.com.au`

          try {
            const response = await fetch('https://api.postmarkapp.com/email', {
              method: 'POST',
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-Postmark-Server-Token': postmarkToken
              },
              body: JSON.stringify({
                From: 'info@fitfocusmedia.com.au',
                To: order.email,
                Subject: `${contentType}s from ${gallery.title} Are Now Available! 🎬`,
                HtmlBody: fullHtmlBody,
                TextBody: textBody,
                MessageStream: 'outbound'
              })
            })

            if (response.ok) {
              await supabase
                .from('gallery_orders')
                .update({ delivery_email_sent: true, delivery_email_sent_at: new Date().toISOString() })
                .eq('id', order.id)
              results.sent++
              results.details.push({ email: order.email, name: order.customer_name, status: 'sent', download_url: galleryViewUrl })
            } else {
              const errorData = await response.json()
              results.failed++
              results.details.push({ email: order.email, name: order.customer_name, status: 'email_failed', error: errorData.Message || 'Unknown error' })
            }
          } catch (err) {
            results.failed++
            results.details.push({ email: order.email, name: order.customer_name, status: 'email_error', error: String(err) })
          }
        }
      }

      return new Response(
        JSON.stringify({ success: true, email_type, dry_run: isDryRun, gallery_id, results, summary: { total: orders?.length || 0, reset: results.reset, sent: results.sent, failed: results.failed } }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Route: POST /gallery_delivery/fix-tokens — Find tokens from sent emails and update DB to match
    if (req.method === 'POST' && path === 'fix-tokens') {
      const { gallery_id, dry_run } = await req.json()

      if (!gallery_id) {
        return new Response(
          JSON.stringify({ error: 'Missing gallery_id' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const isDryRun = dry_run === true
      const postmarkToken = Deno.env.get('POSTMARK_SERVER_TOKEN')

      if (!postmarkToken) {
        return new Response(
          JSON.stringify({ error: 'Postmark not configured' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Get gallery info
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

      // Get all promo/free_access orders for this gallery
      const { data: orders, error: ordersError } = await supabase
        .from('gallery_orders')
        .select('id, email, customer_name, download_token, delivery_type')
        .eq('gallery_id', gallery_id)
        .in('delivery_type', ['free_access', 'promo'])

      if (ordersError) {
        return new Response(
          JSON.stringify({ error: ordersError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Query Postmark Messages API for outbound messages containing the gallery slug/download path
      // Extract download tokens from the email content
      const results = { found: 0, updated: 0, skipped: 0, errors: 0, details: [] as any[] }
      const tokenPattern = /gallery\/download\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/gi

      // Search Postmark for messages related to this gallery
      const searchSubject = encodeURIComponent(gallery.title)
      let postmarkMessages: any[] = []
      let offset = 0
      let hasMore = true

      while (hasMore && offset < 500) {
        try {
          const pmResponse = await fetch(
            `https://api.postmarkapp.com/messages/outbound?subject=${searchSubject}&count=100&offset=${offset}`,
            {
              headers: {
                'Accept': 'application/json',
                'X-Postmark-Server-Token': postmarkToken
              }
            }
          )

          if (!pmResponse.ok) {
            const errorData = await pmResponse.json()
            console.error('[GalleryDelivery] Postmark API error:', errorData)
            break
          }

          const pmData = await pmResponse.json()
          const messages = pmData.Messages || []
          postmarkMessages = postmarkMessages.concat(messages)

          if (messages.length < 100) {
            hasMore = false
          } else {
            offset += 100
          }
        } catch (err) {
          console.error('[GalleryDelivery] Postmark fetch error:', err)
          break
        }
      }

      // Build a map of email -> old token from the Postmark messages
      const emailTokenMap = new Map<string, string>()

      for (const msg of postmarkMessages) {
        // Extract token from the message body/text
        const body = (msg.TextBody || '') + ' ' + (msg.HtmlBody || '') + ' ' + (msg.Subject || '')
        const matches = body.matchAll(tokenPattern)
        for (const match of matches) {
          const token = match[1]
          const email = (msg.To || '').toLowerCase().trim()
          if (email && token) {
            emailTokenMap.set(email, token)
          }
        }
      }

      // Also try to get tokens from the click-tracking URLs in the message
      // The Postmark Messages API might not include full HTML body in the list endpoint
      // So let's also try the message details endpoint for each message
      for (const msg of postmarkMessages.slice(0, 50)) {
        if (emailTokenMap.has((msg.To || '').toLowerCase().trim())) continue

        try {
          const detailResponse = await fetch(
            `https://api.postmarkapp.com/messages/outbound/${msg.MessageID}/details`,
            {
              headers: {
                'Accept': 'application/json',
                'X-Postmark-Server-Token': postmarkToken
              }
            }
          )

          if (detailResponse.ok) {
            const detail = await detailResponse.json()
            const body = (detail.TextBody || '') + ' ' + (detail.HtmlBody || '') + ' ' + (detail.Subject || '')
            const matches = body.matchAll(tokenPattern)
            for (const match of matches) {
              const token = match[1]
              const email = (msg.To || '').toLowerCase().trim()
              if (email && token) {
                emailTokenMap.set(email, token)
              }
            }
          }
        } catch (err) {
          // Skip individual message detail errors
        }
      }

      // Now update each order's download_token to match the one from the email
      for (const order of (orders || [])) {
        const emailLower = order.email.toLowerCase().trim()
        const oldToken = emailTokenMap.get(emailLower)

        if (!oldToken) {
          results.skipped++
          results.details.push({
            email: order.email,
            name: order.customer_name,
            status: 'no_email_found',
            current_token: order.download_token
          })
          continue
        }

        if (oldToken === order.download_token) {
          results.skipped++
          results.details.push({
            email: order.email,
            name: order.customer_name,
            status: 'token_already_matches',
            token: oldToken
          })
          continue
        }

        results.found++

        if (isDryRun) {
          results.details.push({
            email: order.email,
            name: order.customer_name,
            status: 'dry_run',
            old_token: order.download_token,
            new_token: oldToken
          })
          continue
        }

        // Update the download token in the DB to match what was in the email
        const { error: updateError } = await supabase
          .from('gallery_orders')
          .update({ download_token: oldToken })
          .eq('id', order.id)

        if (updateError) {
          console.error('[GalleryDelivery] Token update error:', updateError)
          results.errors++
          results.details.push({
            email: order.email,
            name: order.customer_name,
            status: 'update_failed',
            error: updateError.message
          })
        } else {
          results.updated++
          results.details.push({
            email: order.email,
            name: order.customer_name,
            status: 'updated',
            old_token: order.download_token,
            new_token: oldToken
          })
        }
      }

      return new Response(
        JSON.stringify({
          success: true,
          dry_run: isDryRun,
          gallery_id,
          gallery_title: gallery.title,
          postmark_messages_found: postmarkMessages.length,
          tokens_from_emails: emailTokenMap.size,
          results,
          summary: {
            total_orders: orders?.length || 0,
            found: results.found,
            updated: results.updated,
            skipped: results.skipped,
            errors: results.errors
          }
        }),
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