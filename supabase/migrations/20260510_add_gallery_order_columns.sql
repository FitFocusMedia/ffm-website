-- Add missing columns to gallery_orders table
ALTER TABLE gallery_orders ADD COLUMN IF NOT EXISTS delivery_type text DEFAULT 'purchase';
ALTER TABLE gallery_orders ADD COLUMN IF NOT EXISTS athlete_first_name text;
ALTER TABLE gallery_orders ADD COLUMN IF NOT EXISTS athlete_last_name text;
ALTER TABLE gallery_orders ADD COLUMN IF NOT EXISTS athlete_number text;
ALTER TABLE gallery_orders ADD COLUMN IF NOT EXISTS notes text;
ALTER TABLE gallery_orders ADD COLUMN IF NOT EXISTS completed_at timestamptz;
ALTER TABLE gallery_orders ADD COLUMN IF NOT EXISTS delivery_email_sent boolean DEFAULT false;
ALTER TABLE gallery_orders ADD COLUMN IF NOT EXISTS delivery_email_sent_at timestamptz;
ALTER TABLE gallery_orders ADD COLUMN IF NOT EXISTS content_order_id uuid;
