// Event Reminder Emails - Supabase Edge Function
// Runs hourly, sends 24h and 1h reminders via Postmark

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const POSTMARK_API_KEY = Deno.env.get('POSTMARK_API_KEY')!
const POSTMARK_FROM_EMAIL = 'info@fitfocusmedia.com.au'
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

serve(async (req) => {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    const now = new Date()
    
    // Calculate time windows (with 30min buffer for hourly cron)
    const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000)
    const in24HoursMinus = new Date(now.getTime() + 23.5 * 60 * 60 * 1000)
    const in24HoursPlus = new Date(now.getTime() + 24.5 * 60 * 60 * 1000)
    
    const in1Hour = new Date(now.getTime() + 1 * 60 * 60 * 1000)
    const in1HourMinus = new Date(now.getTime() + 0.5 * 60 * 60 * 1000)
    const in1HourPlus = new Date(now.getTime() + 1.5 * 60 * 60 * 1000)
    
    let sent24h = 0
    let sent1h = 0
    const errors: string[] = []
    
    // Find events starting in ~24 hours
    const { data: events24h, error: events24hError } = await supabase
      .from('livestream_events')
      .select('id, title, slug, start_time, organization:organizations(name, display_name)')
      .eq('status', 'published')
      .gte('start_time', in24HoursMinus.toISOString())
      .lte('start_time', in24HoursPlus.toISOString())
    
    if (events24hError) throw events24hError
    
    // Find events starting in ~1 hour
    const { data: events1h, error: events1hError } = await supabase
      .from('livestream_events')
      .select('id, title, slug, start_time, organization:organizations(name, display_name)')
      .eq('status', 'published')
      .gte('start_time', in1HourMinus.toISOString())
      .lte('start_time', in1HourPlus.toISOString())
    
    if (events1hError) throw events1hError
    
    // Send 24h reminders
    for (const event of events24h || []) {
      const result = await sendRemindersForEvent(supabase, event, '24h')
      sent24h += result.sent
      errors.push(...result.errors)
    }
    
    // Send 1h reminders
    for (const event of events1h || []) {
      const result = await sendRemindersForEvent(supabase, event, '1h')
      sent1h += result.sent
      errors.push(...result.errors)
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        sent: { '24h': sent24h, '1h': sent1h },
        errors: errors.length > 0 ? errors : undefined,
        checked_at: now.toISOString()
      }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Event reminder error:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})

async function sendRemindersForEvent(supabase: any, event: any, reminderType: '24h' | '1h') {
  let sent = 0
  const errors: string[] = []
  
  // Get all purchases for this event
  const { data: purchases, error: purchasesError } = await supabase
    .from('livestream_purchases')
    .select('id, email, customer_name, amount, stripe_session_id')
    .eq('event_id', event.id)
    .eq('status', 'completed')
  
  if (purchasesError) {
    errors.push(`Failed to fetch purchases for ${event.title}: ${purchasesError.message}`)
    return { sent, errors }
  }
  
  for (const purchase of purchases || []) {
    // Check if we've already sent this reminder
    const { data: existing } = await supabase
      .from('reminder_emails')
      .select('id')
      .eq('event_id', event.id)
      .eq('purchase_id', purchase.id)
      .eq('reminder_type', reminderType)
      .single()
    
    if (existing) {
      // Already sent, skip
      continue
    }
    
    // Send email via Postmark
    try {
      const emailSent = await sendPostmarkEmail(event, purchase, reminderType)
      
      if (emailSent) {
        // Record that we sent it
        await supabase.from('reminder_emails').insert({
          event_id: event.id,
          purchase_id: purchase.id,
          reminder_type: reminderType,
          email: purchase.email
        })
        sent++
      }
    } catch (err) {
      errors.push(`Failed to send ${reminderType} reminder to ${purchase.email}: ${err.message}`)
    }
  }
  
  return { sent, errors }
}

async function sendPostmarkEmail(event: any, purchase: any, reminderType: '24h' | '1h'): Promise<boolean> {
  const eventUrl = `https://www.fitfocusmedia.com.au/live/${event.slug}`
  const orgName = event.organization?.display_name || event.organization?.name || 'Fit Focus Media'
  
  const startTime = new Date(event.start_time)
  const formattedTime = startTime.toLocaleString('en-AU', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'Australia/Brisbane'
  })
  
  const subject = reminderType === '24h'
    ? `Tomorrow: ${event.title}`
    : `Starting Soon: ${event.title}`
  
  const htmlBody = reminderType === '24h' ? get24HourTemplate(event, purchase, eventUrl, orgName, formattedTime) : get1HourTemplate(event, purchase, eventUrl, orgName, formattedTime)
  
  const response = await fetch('https://api.postmarkapp.com/email', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-Postmark-Server-Token': POSTMARK_API_KEY
    },
    body: JSON.stringify({
      From: POSTMARK_FROM_EMAIL,
      To: purchase.email,
      Subject: subject,
      HtmlBody: htmlBody,
      MessageStream: 'outbound'
    })
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.Message || 'Postmark API error')
  }
  
  return true
}

function get24HourTemplate(event: any, purchase: any, eventUrl: string, orgName: string, formattedTime: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0a0a0a;">
  <div style="max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%);">
    <!-- Header -->
    <div style="background: #dc2626; padding: 40px 20px; text-align: center;">
      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
        ${event.title}
      </h1>
      <p style="margin: 10px 0 0 0; color: #fecaca; font-size: 16px;">
        Starts Tomorrow
      </p>
    </div>
    
    <!-- Body -->
    <div style="padding: 40px 30px; color: #e5e5e5;">
      <p style="font-size: 18px; line-height: 1.6; margin: 0 0 20px 0;">
        Hi ${purchase.customer_name || 'there'},
      </p>
      
      <p style="font-size: 16px; line-height: 1.6; margin: 0 0 20px 0; color: #d1d5db;">
        This is a friendly reminder that your livestream event starts <strong style="color: #ffffff;">tomorrow</strong>!
      </p>
      
      <div style="background: rgba(220, 38, 38, 0.1); border-left: 4px solid #dc2626; padding: 20px; margin: 30px 0; border-radius: 4px;">
        <p style="margin: 0 0 10px 0; font-size: 14px; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.5px;">
          Event Start Time
        </p>
        <p style="margin: 0; font-size: 20px; font-weight: 600; color: #ffffff;">
          ${formattedTime} AEST
        </p>
      </div>
      
      <p style="font-size: 16px; line-height: 1.6; margin: 30px 0 20px 0; color: #d1d5db;">
        Make sure you're ready to watch! The stream will be available at the link below.
      </p>
      
      <!-- CTA Button -->
      <div style="text-align: center; margin: 40px 0;">
        <a href="${eventUrl}" style="display: inline-block; background: #dc2626; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 18px; font-weight: 600;">
          View Event Page
        </a>
      </div>
      
      <p style="font-size: 14px; line-height: 1.6; margin: 30px 0 0 0; color: #9ca3af; text-align: center;">
        We'll send you another reminder 1 hour before the event starts.
      </p>
    </div>
    
    <!-- Footer -->
    <div style="background: #0a0a0a; padding: 30px 20px; text-align: center; border-top: 1px solid #1f1f1f;">
      <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">
        ${orgName}
      </p>
      <p style="margin: 0; color: #4b5563; font-size: 12px;">
        Questions? Reply to this email or visit <a href="https://www.fitfocusmedia.com.au" style="color: #dc2626;">fitfocusmedia.com.au</a>
      </p>
    </div>
  </div>
</body>
</html>
  `.trim()
}

function get1HourTemplate(event: any, purchase: any, eventUrl: string, orgName: string, formattedTime: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0a0a0a;">
  <div style="max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%);">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); padding: 40px 20px; text-align: center;">
      <div style="background: rgba(255,255,255,0.1); border-radius: 50%; width: 80px; height: 80px; margin: 0 auto 20px auto; display: flex; align-items: center; justify-content: center;">
        <span style="font-size: 36px;">🔴</span>
      </div>
      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
        Starting in 1 Hour!
      </h1>
      <p style="margin: 10px 0 0 0; color: #fecaca; font-size: 18px;">
        ${event.title}
      </p>
    </div>
    
    <!-- Body -->
    <div style="padding: 40px 30px; color: #e5e5e5;">
      <p style="font-size: 18px; line-height: 1.6; margin: 0 0 20px 0;">
        Hi ${purchase.customer_name || 'there'},
      </p>
      
      <p style="font-size: 16px; line-height: 1.6; margin: 0 0 20px 0; color: #d1d5db;">
        Your event is starting <strong style="color: #dc2626;">very soon</strong>! Get ready to tune in.
      </p>
      
      <div style="background: rgba(220, 38, 38, 0.15); border: 2px solid #dc2626; padding: 25px; margin: 30px 0; border-radius: 8px; text-align: center;">
        <p style="margin: 0 0 10px 0; font-size: 14px; color: #fca5a5; text-transform: uppercase; letter-spacing: 1px;">
          Go Live
        </p>
        <p style="margin: 0; font-size: 28px; font-weight: 700; color: #ffffff;">
          ${formattedTime} AEST
        </p>
      </div>
      
      <p style="font-size: 16px; line-height: 1.6; margin: 30px 0 20px 0; color: #d1d5db;">
        Click the button below to access your livestream. The event page will be ready when the stream goes live.
      </p>
      
      <!-- CTA Button -->
      <div style="text-align: center; margin: 40px 0;">
        <a href="${eventUrl}" style="display: inline-block; background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); color: #ffffff; text-decoration: none; padding: 18px 50px; border-radius: 8px; font-size: 20px; font-weight: 700; box-shadow: 0 4px 20px rgba(220, 38, 38, 0.4);">
          Join Livestream →
        </a>
      </div>
      
      <p style="font-size: 14px; line-height: 1.6; margin: 30px 0 0 0; color: #9ca3af; text-align: center;">
        Bookmark the event page so you don't miss the start!
      </p>
    </div>
    
    <!-- Footer -->
    <div style="background: #0a0a0a; padding: 30px 20px; text-align: center; border-top: 1px solid #1f1f1f;">
      <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">
        ${orgName}
      </p>
      <p style="margin: 0; color: #4b5563; font-size: 12px;">
        Questions? Reply to this email or visit <a href="https://www.fitfocusmedia.com.au" style="color: #dc2626;">fitfocusmedia.com.au</a>
      </p>
    </div>
  </div>
</body>
</html>
  `.trim()
}
