# 🔧 Livestream Checkout Webhook Fix Guide

**Issue:** Stripe payments complete but orders stay "pending". Wrong email template sent.  
**Root Cause:** Stripe webhook not configured + duplicate webhook sending wrong email.  
**Priority:** CRITICAL - blocks Phil Cassidy event (March 7)

---

## Quick Fix (5 minutes)

### 1. Deploy Updated Edge Function

```bash
cd ~/clawd/ffm-website/app
npx supabase login
npx supabase functions deploy livestream_checkout --project-ref gonalgubgldgpkcekaxe
```

### 2. Set Supabase Secrets

Go to: **Supabase Dashboard → Project Settings → Edge Functions → Manage Secrets**

Add these secrets:
- `STRIPE_SECRET_KEY` = `sk_live_...` (your Stripe secret key)
- `POSTMARK_API_TOKEN` = Your Postmark server token
- `STRIPE_WEBHOOK_SECRET` = Get from step 3 ↓

### 3. Configure Stripe Webhook

Go to: **Stripe Dashboard → Developers → Webhooks → Add endpoint**

**Endpoint URL:**
```
https://gonalgubgldgpkcekaxe.supabase.co/functions/v1/livestream_checkout/webhook
```

**Events to send:**
- ✅ `checkout.session.completed`

**After creating:**
1. Click "Reveal signing secret"
2. Copy it (starts with `whsec_...`)
3. Add to Supabase secrets as `STRIPE_WEBHOOK_SECRET`
4. Redeploy function: `npx supabase functions deploy livestream_checkout --project-ref gonalgubgldgpkcekaxe`

### 4. Fix Your Test Order

Go to: **Supabase Dashboard → Table Editor → livestream_orders**

Find order ID: `6d5ab7ae-44c0-46ce-b9ef-45b1a031bc6b`

Update these fields:
- `status` → `completed`
- `completed_at` → `now()`
- `vod_access_granted` → `true`

Click **Save**. Now you can test stream access.

---

## Find the Duplicate Webhook

The "Hey Athlete!" email is coming from another webhook. Check:

### Option A: Stripe Dashboard
**Stripe → Developers → Webhooks**

Look for other endpoints listening to `checkout.session.completed`:
- Old webhook URLs
- Make.com/Zapier integrations
- Other Supabase functions

**Fix:** Either delete them OR add a filter to ignore livestream orders.

### Option B: Supabase Edge Functions
**Dashboard → Edge Functions**

Check if `verify-payment` function exists (not in your repo but might be deployed):
- If it exists, view logs to see if it's catching payments
- Either delete it OR update it to ignore livestream orders

### Option C: External Automations
Check:
- Make.com scenarios
- Zapier zaps
- Any other automation tools

---

## Test the Fix

### 1. Small Test Purchase
1. Go to livestream event page
2. Click "Purchase Access"
3. Complete $1 test checkout
4. Check your email

### 2. Verify Database
**Supabase → Table Editor → livestream_orders**

The new order should:
- Start as `status = 'pending'`
- Update to `status = 'completed'` within 5 seconds
- Have `vod_access_granted = true`

### 3. Check Logs
**Supabase → Edge Functions → livestream_checkout → Logs**

Should see:
```
[Checkout] Processing for event...
[Checkout] Stripe session created: cs_live_...
[Webhook] Payment completed for session: cs_live_...
[Email] Confirmation sent to: your@email.com
```

### 4. Verify Email
Check you received:
- ✅ Subject: "Your access to [Event] is confirmed! 🎬"
- ✅ From: info@fitfocusmedia.com.au
- ✅ "You're all set! 🎉" heading
- ✅ Magic link button
- ❌ NOT "Hey Athlete!" (that's the old template)

### 5. Test Stream Access
1. Click magic link in email
2. OR go to event page and enter your email
3. Should grant access without "No purchase found" error

---

## Troubleshooting

### "Unauthorized" when deploying
```bash
npx supabase login
# Follow browser auth flow
```

### Webhook still not firing
Check Supabase logs for errors:
- Missing `STRIPE_WEBHOOK_SECRET` → set it in secrets
- Wrong webhook URL → double-check Stripe endpoint
- Signature verification failed → secret doesn't match

### Still getting "Hey Athlete!" email
- Check Stripe webhooks for duplicates
- Check `verify-payment` edge function in Supabase
- Check Make.com/Zapier for Stripe integrations

### Order stays "pending"
- Check Supabase function logs
- Verify webhook is hitting the correct URL
- Verify `STRIPE_WEBHOOK_SECRET` is set correctly

---

## Production Checklist

Before Phil Cassidy event (March 7):

- [ ] Deploy updated `livestream_checkout` function
- [ ] Set all 3 Supabase secrets
- [ ] Configure Stripe webhook
- [ ] Remove/disable duplicate webhooks
- [ ] Test full purchase flow ($1 test)
- [ ] Verify correct email received
- [ ] Verify stream access works
- [ ] Test on mobile (Brandon's iPhone)
- [ ] Test geo-blocking (VPN to different country)

---

## What Changed

**Old behavior:**
- Edge function created checkout session ✅
- Webhook never fired ❌
- Orders stayed "pending" ❌
- Wrong email sent from different system ❌

**New behavior:**
- Edge function creates checkout session ✅
- Webhook fires when payment completes ✅
- Order updates to "completed" automatically ✅
- Correct livestream email sent ✅
- Customer gets magic link access ✅

---

## Questions?

If issues persist:
1. Check Supabase function logs (Dashboard → Edge Functions → livestream_checkout → Logs)
2. Check Stripe webhook logs (Stripe Dashboard → Developers → Webhooks → [endpoint] → Recent deliveries)
3. DM me on Telegram with:
   - Order ID that failed
   - Screenshot of Stripe webhook delivery attempt
   - Screenshot of Supabase function logs

---

**Created:** Feb 24, 2026 @ 11:15 PM (Nightshift)  
**Status:** Ready for deployment  
**Priority:** CRITICAL
