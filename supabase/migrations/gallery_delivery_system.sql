-- Gallery Delivery System: Bulk import & email delivery for I-Walk/Posing Routine videos
-- Links content orders to gallery orders for automated athlete delivery

-- Step 1: Add content order reference to gallery_orders
ALTER TABLE gallery_orders ADD COLUMN IF NOT EXISTS content_order_id UUID REFERENCES content_orders(id);
ALTER TABLE gallery_orders ADD COLUMN IF NOT EXISTS delivery_type TEXT DEFAULT 'purchase' CHECK (delivery_type IN ('purchase', 'free_access', 'comp'));

-- Step 2: Add athlete info to gallery_orders for easier lookup
ALTER TABLE gallery_orders ADD COLUMN IF NOT EXISTS athlete_first_name TEXT;
ALTER TABLE gallery_orders ADD COLUMN IF NOT EXISTS athlete_last_name TEXT;
ALTER TABLE gallery_orders ADD COLUMN IF NOT EXISTS athlete_number TEXT;

-- Step 3: Add email tracking fields
ALTER TABLE gallery_orders ADD COLUMN IF NOT EXISTS delivery_email_sent BOOLEAN DEFAULT false;
ALTER TABLE gallery_orders ADD COLUMN IF NOT EXISTS delivery_email_sent_at TIMESTAMPTZ;
ALTER TABLE gallery_orders ADD COLUMN IF NOT EXISTS promo_email_sent BOOLEAN DEFAULT false;
ALTER TABLE gallery_orders ADD COLUMN IF NOT EXISTS promo_email_sent_at TIMESTAMPTZ;

-- Step 4: Index for lookups
CREATE INDEX IF NOT EXISTS idx_gallery_orders_delivery_type ON gallery_orders(delivery_type);
CREATE INDEX IF NOT EXISTS idx_gallery_orders_content_order_id ON gallery_orders(content_order_id);

-- Step 5: RLS update - allow anonymous reads (consistent with livestream fix)
DROP POLICY IF EXISTS "Users can view own video orders" ON video_orders;
CREATE POLICY "Anyone can view video orders" ON video_orders FOR SELECT USING (true);

-- Step 6: Add delivery_type to video_orders too (for when video gallery system goes live)
ALTER TABLE video_orders ADD COLUMN IF NOT EXISTS delivery_type TEXT DEFAULT 'purchase' CHECK (delivery_type IN ('purchase', 'free_access', 'comp'));
ALTER TABLE video_orders ADD COLUMN IF NOT EXISTS content_order_id UUID REFERENCES content_orders(id);
ALTER TABLE video_orders ADD COLUMN IF NOT EXISTS athlete_first_name TEXT;
ALTER TABLE video_orders ADD COLUMN IF NOT EXISTS athlete_last_name TEXT;
ALTER TABLE video_orders ADD COLUMN IF NOT EXISTS delivery_email_sent BOOLEAN DEFAULT false;
ALTER TABLE video_orders ADD COLUMN IF NOT EXISTS delivery_email_sent_at TIMESTAMPTZ;