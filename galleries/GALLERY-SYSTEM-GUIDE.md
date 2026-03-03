# FFM Photo Gallery System - Complete Guide

**Last Updated:** 2026-03-03  
**Status:** Production Ready  
**Version:** 2.0 (with category system)

---

## Overview

The FFM Photo Gallery System allows event organizers to:
- Upload and organize event photos by category/division
- Sell photo access to athletes and spectators
- Manage orders and fulfillment
- Track sales and revenue

**Live URL:** https://fitfocusmedia.com.au/portal/galleries

---

## For Administrators

### Creating a Gallery

1. **Navigate to Portal**
   - Visit https://fitfocusmedia.com.au/portal
   - Log in with admin credentials
   - Click "Gallery Orders" in the nav bar

2. **Create New Gallery**
   - Click "+ New Gallery" button
   - Fill in details:
     - **Title:** Event name (e.g., "South East QLD Championships")
     - **Organization:** Select from dropdown (e.g., "QBJJC")
     - **Event Date:** Date the event occurred
     - **Price per Photo:** Individual photo price (e.g., $10.00)
     - **Enable "Buy All":** Toggle to allow bulk purchase
     - **"Buy All" Price:** Discounted price for all photos
   - Click "Create Gallery"

### Managing Categories

**Categories** help organize photos by division, mat, or any grouping:

1. **Create Category**
   - Open your gallery in admin view
   - Click "**+ Add Category**" (green button, top right)
   - Enter category name (e.g., "Adult Male Gi", "Mat 1", "U12 Division")
   - Click "Create Category"

2. **Switch Between Categories**
   - Click category tabs at the top
   - "All" tab shows all photos
   - Individual tabs show photos in that category

3. **Rename Category**
   - Hover over category tab
   - Click ✎ (edit icon)
   - Type new name
   - Press Enter or click away

4. **Delete Category**
   - Hover over category tab
   - Click ✕ (delete icon)
   - Confirm deletion
   - Photos move to "Uncategorized"

### Uploading Photos

1. **Select Category**
   - Click the category tab where photos should go
   - Blue banner shows "📁 Uploading to: [Category Name]"

2. **Upload Methods**
   - **Drag & Drop:** Drag files onto the upload area
   - **Click to Browse:** Click upload area to select files

3. **Supported Formats**
   - JPEG, PNG (max 50MB per file)
   - Watermarks applied automatically

4. **Upload Progress**
   - Progress bar shows current/total files
   - Wait for "Upload complete" message
   - Refresh page if needed

### Organizing Photos

**Move Photos Between Categories:**

1. Select photos (click to select)
2. Click "Move to Category ▾" dropdown
3. Choose destination category
4. Photos move immediately

**Delete Photos:**

1. Select photos to delete
2. Click "Delete Selected" button
3. Confirm deletion
4. Photos removed permanently (cannot undo)

**Search Photos:**
- Use search box to filter by filename
- Shows "X of Y" count

### Gallery Settings

- **Price per Photo:** Individual photo price
- **Buy All Package:** Enable and set discounted price
- **Total Photos:** Auto-calculated
- **Public URL:** Share link with customers

### Publishing

1. Toggle "Published" status
2. "Unpublish" hides gallery from public
3. Share public URL with customers:
   ```
   https://fitfocusmedia.com.au/gallery/[slug]
   ```

---

## For Customers

### Finding Your Photos

1. **Receive Link**
   - Organizer shares gallery link via email/SMS
   - Example: `fitfocusmedia.com.au/gallery/event-name`

2. **Browse Gallery**
   - View all photos by category
   - Use search to find specific athletes
   - Click photo to view full size

3. **Purchase Photos**

**Individual Photos:**
- Select photos (click to select)
- Click "Purchase Selected (X photos)" button
- Enter email for receipt
- Complete payment via Stripe

**Buy All Package** (if enabled):
- Click "Buy All Photos" button
- Discounted price for entire gallery
- Enter email
- Complete payment

4. **Download Photos**
- Check email for download link
- Click "Download Your Photos" button
- Zip file downloads automatically
- Photos are high-resolution, unwatermarked originals

### Payment & Delivery

- **Payment:** Secure Stripe checkout
- **Confirmation:** Email receipt immediately
- **Download:** Link valid for 7 days
- **Support:** Contact event organizer if issues

---

## Technical Details

### Database Schema

**Tables:**
- `galleries` - Gallery metadata
- `gallery_photos` - Photo records with category_id
- `gallery_categories` - Category definitions
- `photo_orders` - Purchase records

**Storage:**
- **Location:** Supabase Storage (`galleries` bucket)
- **Paths:**
  - Originals: `{gallery_id}/originals/`
  - Watermarked: `{gallery_id}/watermarked/`
  - Thumbnails: `{gallery_id}/thumbnails/`

### Watermarking

- **Applied:** Client-side via Canvas API
- **Text:** "FIT FOCUS MEDIA"
- **Style:** Diagonal, semi-transparent, repeated pattern
- **Purpose:** Prevent unauthorized use of preview images

### Features

✅ Multi-category organization  
✅ Drag & drop upload  
✅ Bulk operations (select all, delete, move)  
✅ Search/filter  
✅ Individual + bulk pricing  
✅ Secure Stripe payment  
✅ Email delivery  
✅ High-res download (original quality)  
✅ Mobile responsive  
✅ Real-time updates  

### Performance

- **Upload:** ~2-5 seconds per photo (depends on file size)
- **Watermarking:** Client-side (instant)
- **Thumbnail Generation:** Client-side (instant)
- **Search:** Instant (client-side filtering)
- **Page Load:** <2 seconds (lazy loading)

---

## Troubleshooting

### Upload Fails

**Symptoms:** Photos don't upload, error message appears  
**Causes:**
- File too large (>50MB)
- Network issue
- Storage quota exceeded

**Solutions:**
1. Check file size (compress if needed)
2. Refresh page and try again
3. Check internet connection
4. Contact admin if persists

### Photos Not Showing

**Symptoms:** Uploaded photos don't appear  
**Causes:**
- Wrong category selected
- Need to refresh page
- Upload didn't complete

**Solutions:**
1. Check "All" tab to see if photos exist
2. Refresh page (Cmd+R / Ctrl+R)
3. Re-upload if missing

### Can't Create Category

**Symptoms:** Button doesn't open modal  
**Causes:**
- JavaScript error
- Cache issue
- Browser compatibility

**Solutions:**
1. Hard refresh (Cmd+Shift+R / Ctrl+Shift+R)
2. Try different browser (Chrome recommended)
3. Check browser console for errors (F12)

### Customer Can't Download

**Symptoms:** Customer says download link doesn't work  
**Causes:**
- Link expired (>7 days)
- Email went to spam
- Payment didn't complete

**Solutions:**
1. Check "Gallery Orders" page for their purchase
2. Verify payment status in Stripe dashboard
3. Re-send download link if needed
4. Check order was marked "fulfilled"

---

## Best Practices

### Before Event

1. **Test Gallery:** Create test gallery, upload sample photos
2. **Set Pricing:** Research competitor pricing
3. **Prepare Categories:** Know division names ahead of time
4. **Marketing:** Prepare announcement for athletes

### During Event

1. **Upload Promptly:** Upload photos throughout day (don't wait)
2. **Organize as You Go:** Use categories to stay organized
3. **Check Quality:** Review photos before uploading
4. **Monitor Orders:** Check "Gallery Orders" page regularly

### After Event

1. **Final Upload:** Ensure all photos uploaded
2. **Publish Gallery:** Toggle "Published" status
3. **Share Link:** Email/SMS link to all participants
4. **Respond to Orders:** Check daily for new purchases
5. **Follow Up:** Email reminder after 2-3 days

### Pricing Strategy

**Individual Photos:**
- Combat Sports: $10-15 per photo
- Team Sports: $5-10 per photo
- Larger Events: Lower price, more volume

**Buy All Package:**
- Discount: 30-50% off individual price
- Example: 50 photos × $10 = $500 → Buy All $299
- Sweet spot: Makes bulk purchase attractive

### Marketing Tips

1. **QR Codes:** Post at event for easy access
2. **Email Blast:** Send to all participants day after event
3. **Social Media:** Post preview photos with gallery link
4. **Urgency:** "Photos available for 30 days only"
5. **Testimonials:** Share customer reviews

---

## Roadmap / Upcoming Features

🔮 **Planned:**
- Video gallery support (coming soon)
- Facial recognition for athlete search
- Mobile app for photo browsing
- Bulk discount tiers (3+ photos = 10% off)
- Custom watermarks per organization
- Analytics dashboard (views, conversion rate)

---

## Support

**For Admin Issues:**
- Contact Brandon: brandon@fitfocusmedia.com.au
- Check DEPLOYMENT-CHECKLIST.md for known issues

**For Customer Issues:**
- Email support: info@fitfocusmedia.com.au
- Response time: 24-48 hours

---

**Built by:** Fit Focus Media  
**Platform:** https://fitfocusmedia.com.au  
**Version:** 2.0 (Category System)  
**Last Major Update:** March 3, 2026
