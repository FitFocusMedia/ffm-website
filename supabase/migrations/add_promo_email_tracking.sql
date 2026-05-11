-- Add promo_email_sent tracking to gallery_orders
-- This enables promo emails for CSV-imported athletes who didn't order I-Walk/Posing

ALTER TABLE gallery_orders 
ADD COLUMN IF NOT EXISTS promo_email_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS promo_email_sent_at TIMESTAMPTZ;

-- Update existing delivery_type values to support 'promo' type
-- 'promo' = athlete didn't order I-Walk/Posing, gets gallery preview email
-- 'free_access' = athlete ordered I-Walk/Posing, gets download email
-- 'purchase' = athlete purchased through gallery checkout (existing flow)