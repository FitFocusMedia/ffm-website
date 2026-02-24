# Event Organizer Dashboard - Setup Guide

**Feature:** Give event organizers a real-time sales dashboard without admin access.

**Use Case:** Phil Cassidy (Inception Fight Series, March 7) wants to check ticket sales on his phone throughout the day.

---

## Quick Setup

### 1. Run Database Migration

**Option A: Via Supabase Dashboard** (SQL Editor)
```sql
-- Add organizer_token column
ALTER TABLE livestream_events 
ADD COLUMN IF NOT EXISTS organizer_token TEXT UNIQUE;

CREATE INDEX IF NOT EXISTS idx_livestream_events_organizer_token 
ON livestream_events(organizer_token);

-- Add revenue share column (optional)
ALTER TABLE livestream_events
ADD COLUMN IF NOT EXISTS revenue_share_percent NUMERIC(5,2) DEFAULT 30.00;
```

**Option B: Via Supabase CLI**
```bash
cd ~/clawd/ffm-website/app
npx supabase db push
```

### 2. Generate Token for Phil's Event

**Via Supabase Dashboard** (Table Editor → livestream_events):

1. Find Phil's event (Inception Fight Series, March 7)
2. Edit the row
3. Set `organizer_token` to a random string (e.g., use https://www.uuidgenerator.net/)
4. Set `revenue_share_percent` to whatever Phil's cut is (e.g., 30 = 30%)
5. Save

**Or via SQL:**
```sql
UPDATE livestream_events
SET 
  organizer_token = encode(gen_random_bytes(24), 'base64'),
  revenue_share_percent = 30.00
WHERE title ILIKE '%Inception%';

-- Get the token to share with Phil
SELECT id, title, organizer_token FROM livestream_events WHERE title ILIKE '%Inception%';
```

### 3. Share Link with Phil

```
https://fitfocusmedia.com.au/organizer/[HIS_TOKEN_HERE]
```

Example:
```
https://fitfocusmedia.com.au/organizer/abc123xyz456def789ghi012jkl345mno678
```

---

## What Phil Sees

### Dashboard Features

**📊 Real-Time Stats**
- Total purchases (ticket count)
- Total revenue ($)
- His share ($) based on revenue_share_percent
- Hours until event

**📋 Recent Purchases**
- Last 10 purchases
- Email addresses
- Timestamps
- Purchase amounts

**🔗 Share Links**
- Event page URL
- Copy button
- Open in new tab button

**⚡ Auto-Refresh**
- Updates every 30 seconds
- Toggle on/off
- Manual refresh button
- Last refresh timestamp

### Mobile-Friendly
- Responsive design
- Works on iPhone/Android
- Bookmark-able
- No login required

### Security
- Token-based access (no password)
- Only sees HIS event
- Read-only (can't modify anything)
- Token can be regenerated if compromised

---

## Adding Organizer Dashboard to Admin UI

**Future enhancement:** Add a "Generate Organizer Link" button in LivestreamAdmin.jsx

```jsx
// In the event actions dropdown:
<button onClick={() => generateOrganizerLink(event.id)}>
  <Share2 className="w-4 h-4 mr-2" />
  Get Organizer Link
</button>

// Function:
const generateOrganizerLink = async (eventId) => {
  const token = btoa(Math.random().toString(36).substr(2) + Date.now().toString(36))
  
  await supabase
    .from('livestream_events')
    .update({ organizer_token: token })
    .eq('id', eventId)
  
  const url = `${window.location.origin}/organizer/${token}`
  navigator.clipboard.writeText(url)
  alert('Organizer link copied to clipboard!')
}
```

---

## Use Cases

### Before Event
Phil shares the event page URL on social media, in email, etc. He bookmarks his organizer dashboard and checks it periodically:
- Morning: 5 sales
- Lunchtime: 12 sales  
- Afternoon: 31 sales
- Evening: 67 sales

### During Event
Phil can see purchases happening in real-time as people buy access to watch the stream.

### After Event
Phil can see VOD purchase stats (if VOD is enabled).

---

## Revenue Share Calculation

**Example:**
- Price per ticket: $15
- Total sales: 100 tickets
- Total revenue: $1,500
- Revenue share: 30%
- Phil's cut: $450
- FFM's cut: $1,050

The dashboard shows both total revenue AND Phil's share prominently.

---

## Security Notes

**Pros:**
- ✅ No password required (easy for organizers)
- ✅ Token can be regenerated if leaked
- ✅ Read-only access
- ✅ Only sees their event

**Cons:**
- ⚠️ Anyone with the URL can see sales data
- ⚠️ Token is in URL (can be logged by analytics)

**Best Practice:**
- Don't share organizer links publicly
- Only send via private message (WhatsApp, email)
- Regenerate token if accidentally posted publicly
- Consider adding expiry dates for extra security

---

## Future Enhancements

**Could add:**
1. Email list export (CSV of purchasers)
2. Promo code generation
3. Social media share images
4. Hour-by-hour sales chart
5. Comparison to similar events
6. Push notifications for new sales
7. Customer support chat
8. Refund requests

---

## Testing

### Test Flow
1. Create a test event in admin
2. Set `organizer_token` = `test123`
3. Go to `/organizer/test123`
4. Should see event details and empty purchase list
5. Make a test purchase (demo mode)
6. Dashboard should auto-refresh and show the purchase

### Demo Event for Phil
Before sharing with Phil, create a demo purchase so he sees how it looks with actual data.

---

## Troubleshooting

**"Invalid organizer link or event not found"**
- Token doesn't exist in database
- Token was regenerated
- Event was deleted

**Dashboard shows $0 revenue**
- No completed purchases yet
- Orders stuck in "pending" status (webhook issue)
- Wrong event ID in database

**Auto-refresh not working**
- Toggle it off and back on
- Check browser console for errors
- Verify Supabase connection

---

**Built:** Feb 24, 2026 @ 11:50 PM (Nightshift)  
**Status:** Ready for deployment  
**Priority:** HIGH (Phil's event is March 7)
