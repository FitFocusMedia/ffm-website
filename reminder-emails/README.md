# Event Reminder Emails 📧

Automated email reminders sent to livestream ticket holders 24 hours and 1 hour before events start.

## Features

- ✅ **24-hour reminder** - "Your event starts tomorrow!"
- ✅ **1-hour reminder** - "Starting soon! Join now"
- ✅ **Duplicate prevention** - Tracks sent reminders in database
- ✅ **Beautiful HTML emails** - Branded templates matching FFM style
- ✅ **Hourly cron** - Checks for upcoming events every hour
- ✅ **No manual work** - Fully automated
- ✅ **Error logging** - Tracks failures for debugging

## Business Impact

**Problem Solved:**
- Customers forget about events they purchased
- No customer touchpoints between purchase and event
- Higher no-show rates = wasted production costs
- Platform feels less professional than competitors

**Expected Results:**
- 📈 Higher attendance rates (industry avg: +25-40%)
- 💰 Fewer refund requests ("I forgot!")
- ⭐ Better customer experience
- 🏆 More professional platform

## How It Works

1. **Hourly Cron Job** - Edge Function runs every hour
2. **Check Upcoming Events** - Finds events starting in ~24h or ~1h (30min buffer)
3. **Find Ticket Holders** - Gets all completed purchases for those events
4. **Check Sent History** - Queries `reminder_emails` table to avoid duplicates
5. **Send via Postmark** - Beautiful branded HTML emails
6. **Track Sent** - Records email in database

## Setup

### 1. Run Database Schema

```bash
# In Supabase SQL Editor, run:
/Users/clawdbot/clawd/ffm-website/reminder-emails/schema.sql
```

This creates:
- `reminder_emails` table (tracks sent reminders)
- RLS policies (admin read, service write)
- Indexes for fast lookups

### 2. Deploy Edge Function

```bash
# Install Supabase CLI if needed
brew install supabase/tap/supabase

# Login to Supabase
supabase login

# Link to project
supabase link --project-ref gonalgubgldgpkcekaxe

# Deploy function
supabase functions deploy event_reminder_emails \
  --project-ref gonalgubgldgpkcekaxe \
  --no-verify-jwt

# Set secrets (if not already set)
supabase secrets set POSTMARK_API_KEY=<your-key> --project-ref gonalgubgldgpkcekaxe
```

### 3. Set Up Cron Job

In Supabase Dashboard → Database → Extensions → pg_cron:

```sql
-- Run every hour
SELECT cron.schedule(
  'event-reminder-emails',
  '0 * * * *',  -- Every hour at minute 0
  $$
  SELECT net.http_post(
    url := 'https://gonalgubgldgpkcekaxe.supabase.co/functions/v1/event_reminder_emails',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.settings.service_role_key') || '"}'::jsonb
  ) AS request_id;
  $$
);
```

**OR** use Supabase Cron in the Dashboard:
- Name: `event-reminder-emails`
- Schedule: `0 * * * *` (hourly)
- HTTP Request: `POST https://gonalgubgldgpkcekaxe.supabase.co/functions/v1/event_reminder_emails`
- Headers: Service role auth

### 4. Test Manually

```bash
# Test the Edge Function directly
curl -X POST https://gonalgubgldgpkcekaxe.supabase.co/functions/v1/event_reminder_emails \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json"
```

Expected response:
```json
{
  "success": true,
  "sent": {
    "24h": 2,
    "1h": 1
  },
  "checked_at": "2026-02-26T13:00:00.000Z"
}
```

## Monitoring

### Check Sent Reminders

```sql
-- View all sent reminders
SELECT 
  r.sent_at,
  r.reminder_type,
  r.email,
  e.title AS event_title,
  e.start_time AS event_start
FROM reminder_emails r
JOIN livestream_events e ON e.id = r.event_id
ORDER BY r.sent_at DESC
LIMIT 50;
```

### Check Upcoming Reminders

```sql
-- Events that will trigger 24h reminders soon
SELECT 
  title,
  start_time,
  start_time - INTERVAL '24 hours' AS reminder_24h_at,
  start_time - INTERVAL '1 hour' AS reminder_1h_at,
  (SELECT COUNT(*) FROM livestream_purchases WHERE event_id = livestream_events.id AND status = 'completed') AS ticket_count
FROM livestream_events
WHERE status = 'published'
  AND start_time > NOW()
  AND start_time < NOW() + INTERVAL '48 hours'
ORDER BY start_time;
```

### Check for Errors

Check Edge Function logs in Supabase Dashboard → Edge Functions → event_reminder_emails → Logs

## Email Templates

### 24-Hour Reminder
- **Subject:** "Tomorrow: [Event Title]"
- **Content:** Friendly reminder with event details and CTA
- **Tone:** Helpful, not pushy
- **CTA:** "View Event Page"

### 1-Hour Reminder
- **Subject:** "Starting Soon: [Event Title]"
- **Content:** Urgent reminder with countdown feel
- **Tone:** Exciting, time-sensitive
- **CTA:** "Join Livestream →"

Both templates:
- Fully responsive (mobile + desktop)
- Dark mode FFM branding
- Clean, professional design
- Clear event time (AEST timezone)
- Organization name in footer

## Configuration

### Time Windows

The function checks for events within these windows:
- **24h reminder:** 23.5h - 24.5h before start (30min buffer)
- **1h reminder:** 0.5h - 1.5h before start (30min buffer)

This buffer accounts for the hourly cron schedule.

### Postmark Settings

- **From:** info@fitfocusmedia.com.au
- **Message Stream:** outbound
- **Templates:** Inline HTML (no Postmark template ID)

### Admin Controls

To disable reminders for a specific event:
- Update event `status` to anything except `published`
- Or delete purchases (not recommended)
- Future: Add `send_reminders` boolean field to `livestream_events` table

## Future Enhancements

1. **Per-Event Toggle** - `send_reminders` boolean in events table
2. **Custom Reminder Times** - Let organizers choose when to send
3. **SMS Reminders** - Add Twilio for high-value events
4. **Reminder Preferences** - Let customers opt out of 1h reminder
5. **A/B Testing** - Test different subject lines and templates
6. **Analytics Dashboard** - Track open rates, click rates, conversions
7. **Multi-Language** - Detect customer location and send appropriate language

## Troubleshooting

### No emails sent

1. Check event `status` is `published`
2. Check event `start_time` is within window
3. Check purchases have `status = 'completed'`
4. Check `reminder_emails` table for duplicates
5. Check Postmark API key is set correctly
6. Check Edge Function logs for errors

### Duplicate emails

- Should be prevented by UNIQUE constraint on `(event_id, purchase_id, reminder_type)`
- If duplicates occur, check database constraint

### Wrong timezone

- All times use `Australia/Brisbane` (AEST/AEDT)
- To change: Update `toLocaleString` timezone parameter in `edge-function.ts`

## Files

- **schema.sql** - Database schema for tracking
- **edge-function.ts** - Main Edge Function code
- **README.md** - This file

## Deployment Checklist

- [ ] Run `schema.sql` in Supabase SQL Editor
- [ ] Deploy Edge Function via Supabase CLI
- [ ] Set `POSTMARK_API_KEY` secret
- [ ] Create cron job (hourly at :00)
- [ ] Test with manual curl request
- [ ] Monitor first few automated runs
- [ ] Check Postmark delivery logs
- [ ] Verify emails look good on mobile + desktop

## Cost Estimate

- **Edge Function:** ~720 invocations/month (hourly) = FREE (well within limits)
- **Database queries:** Minimal, fast indexed lookups = FREE
- **Postmark emails:** 
  - 100 ticket holders/month × 2 reminders = 200 emails
  - Free tier: 100/month, then $0.001/email
  - Cost: ~$0.10/month for 200 emails

**Total:** Essentially free! 🎉

## Built By

Scarlet (AI Agent) - Feb 26-27, 2026 Nightshift
PR: TBD
Branch: `nightshift/event-reminder-emails`
