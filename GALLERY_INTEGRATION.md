# Photo Gallery Integration Guide

This guide explains how to integrate the photo gallery feature into the FFM website.

## Files Created

### Frontend Components
1. `src/pages/gallery/GalleryPage.jsx` - Public gallery view with photo selection & checkout
2. `src/pages/gallery/GalleryDownloadPage.jsx` - Download page for purchased photos
3. `src/components/portal/GalleryAdmin.jsx` - Admin panel for managing galleries

### Supabase Edge Functions
1. `supabase/functions/gallery_checkout/index.ts` - Stripe checkout session creation
2. `supabase/functions/gallery_download/index.ts` - Token-based download URL generation
3. `supabase/functions/gallery_webhook/index.ts` - Stripe webhook for payment completion

## Setup Steps

### 1. Add Routes to App.jsx

Add these imports at the top:
```jsx
import GalleryPage from './pages/gallery/GalleryPage'
import GalleryDownloadPage from './pages/gallery/GalleryDownloadPage'
import GalleryAdmin from './components/portal/GalleryAdmin'
```

Add these routes inside your `<Routes>`:
```jsx
{/* Public Gallery Routes */}
<Route path="/gallery/:slug" element={<GalleryPage />} />
<Route path="/gallery/download/:token" element={<GalleryDownloadPage />} />

{/* Portal Gallery Admin - add inside your portal routes */}
<Route path="/portal/galleries" element={<GalleryAdmin />} />
```

### 2. Add Portal Navigation Link

In your portal navigation component, add:
```jsx
<Link to="/portal/galleries" className="...">
  <ImageIcon className="w-5 h-5" />
  Photo Galleries
</Link>
```

### 3. Install Dependencies

The gallery admin uses react-dropzone for drag & drop uploads:
```bash
npm install react-dropzone
```

### 4. Run Database Schema

Go to Supabase SQL Editor and run the schema from:
`/galleries/schema.sql`

Or copy from here: https://gonalgubgldgpkcekaxe.supabase.co/dashboard/project/gonalgubgldgpkcekaxe/sql

### 5. Create Storage Bucket

1. Go to Supabase Storage
2. Create new bucket: `galleries`
3. Set to **Private** (not public)

### 6. Deploy Edge Functions

```bash
# From the app directory
supabase functions deploy gallery_checkout
supabase functions deploy gallery_download
supabase functions deploy gallery_webhook
```

### 7. Configure Stripe Webhook

1. Go to Stripe Dashboard → Webhooks
2. Add endpoint: `https://gonalgubgldgpkcekaxe.supabase.co/functions/v1/gallery_webhook`
3. Select event: `checkout.session.completed`
4. Copy the webhook secret
5. Add to Supabase secrets: `STRIPE_GALLERY_WEBHOOK_SECRET`

## How It Works

1. **Admin uploads photos** → Photos are watermarked client-side → Stored in Supabase Storage
2. **Customer browses gallery** → Sees watermarked previews → Selects photos
3. **Customer checks out** → Edge function creates Stripe session → Redirects to Stripe
4. **Payment completes** → Webhook updates order → Customer gets download link
5. **Customer downloads** → Edge function generates signed URLs → Original (unwatermarked) photos

## Features

- ✅ Client-side watermarking (no server processing needed)
- ✅ Drag & drop photo upload
- ✅ Individual photo pricing
- ✅ "Buy All" package option
- ✅ Secure download tokens (7-day expiry)
- ✅ Download tracking
- ✅ Stripe checkout integration
