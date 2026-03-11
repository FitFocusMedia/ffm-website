# Purchase Notification Edge Function

Sends real-time Telegram notifications to Brandon when purchases are completed.

## Features

- ✅ Instant notifications for all completed orders
- 🎬 Supports Livestream orders (Live/VOD/Bundle)
- 📸 Supports Gallery orders (Photos/Videos)
- 💰 Highlights high-value sales (>$100)
- 🕐 Displays timestamp in Brisbane timezone
- 📧 Shows customer email for follow-up

## Setup

### 1. Deploy Edge Function

```bash
cd /Users/clawdbot/clawd/ffm-website/app
supabase functions deploy purchase-notification
```

### 2. Add Environment Variables

Go to Supabase Dashboard → Project Settings → Edge Functions → Secrets:

```
TELEGRAM_BOT_TOKEN=<your_bot_token>
TELEGRAM_CHAT_ID=7947983258
```

**To get bot token:**
1. Message @BotFather on Telegram
2. Create new bot or use existing bot
3. Copy the token (format: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

### 3. Create Database Webhook

Go to Supabase Dashboard → Database → Webhooks → Create Webhook:

**Configuration:**
- **Name:** `purchase-notification`
- **Table:** `orders`
- **Events:** `INSERT`, `UPDATE`
- **Type:** `HTTP Request`
- **Method:** `POST`
- **URL:** `https://gonalgubgldgpkcekaxe.supabase.co/functions/v1/purchase-notification`
- **HTTP Headers:**
  - `Content-Type`: `application/json`
  - `Authorization`: `Bearer <SUPABASE_ANON_KEY>`

**Filter (SQL Condition):**
```sql
new.status = 'completed' AND (
  old.status IS NULL OR old.status != 'completed'
)
```

This ensures:
- Only completed orders trigger notifications
- Each order only notifies once (when status changes to completed)
- Works for both new orders (INSERT) and status updates (UPDATE)

## Notification Format

### Livestream Example
```
✅ New Purchase!

Event: Inception Fight Series
Type: 🔴 Live Stream
Amount: $40.00 AUD
Customer: john.doe@example.com
Time: 11/03/26, 11:30 pm
```

### Gallery Example (High Value)
```
🎉💰 New Purchase!

Event: NBA Sydney Nationals Day 2
Type: 📸🎥 Photos + Videos
Amount: $150.00 AUD
Customer: jane.smith@example.com
Time: 11/03/26, 11:45 pm

🔥 High value sale! 🔥
```

## Testing

Test the webhook manually:

```bash
curl -X POST https://gonalgubgldgpkcekaxe.supabase.co/functions/v1/purchase-notification \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <SUPABASE_ANON_KEY>" \
  -d '{
    "type": "INSERT",
    "table": "orders",
    "record": {
      "id": "test-123",
      "email": "test@example.com",
      "status": "completed",
      "livestream_event_id": "<real_event_id>",
      "purchase_type": "live",
      "created_at": "2026-03-11T23:00:00Z"
    }
  }'
```

## Monitoring

Check Edge Function logs:

```bash
supabase functions logs purchase-notification --follow
```

Or via Supabase Dashboard → Edge Functions → purchase-notification → Logs

## Troubleshooting

**No notifications received:**
1. Check Edge Function logs for errors
2. Verify TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID are set
3. Test bot token: `curl https://api.telegram.org/bot<TOKEN>/getMe`
4. Check Database Webhook is enabled and has correct URL
5. Verify orders are actually reaching "completed" status

**Duplicate notifications:**
1. Check webhook filter includes `old.status != 'completed'`
2. Ensure only one webhook is configured for the orders table

**Wrong data in notifications:**
1. Verify order has `livestream_event_id` or `gallery_id` set
2. Check related event/gallery records exist in database
