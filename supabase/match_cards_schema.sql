-- Match Cards Schema for Order-Athlete Linking
-- Created: 2026-03-01 (Nightshift)
-- Purpose: Store match card screenshots and extracted athlete data

-- Add match card columns to content_orders
ALTER TABLE content_orders ADD COLUMN IF NOT EXISTS match_card_url TEXT;
ALTER TABLE content_orders ADD COLUMN IF NOT EXISTS match_card_data JSONB DEFAULT '{}'::jsonb;
-- match_card_data stores: { mat, time, division, athlete_name, athlete_photo_url, extracted_at }

-- Create storage bucket for match cards (run this in Supabase Dashboard > Storage)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('match-cards', 'match-cards', true);

-- RLS policy for match cards bucket (run after creating bucket)
-- CREATE POLICY "Public read match cards" ON storage.objects FOR SELECT USING (bucket_id = 'match-cards');
-- CREATE POLICY "Authenticated upload match cards" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'match-cards');

COMMENT ON COLUMN content_orders.match_card_url IS 'URL to uploaded Smoothcomp match card screenshot';
COMMENT ON COLUMN content_orders.match_card_data IS 'Extracted data from match card: mat, time, division, athlete_photo_url';
