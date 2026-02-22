-- FFM Livestream - Crew Bypass Token Migration
-- Run this in Supabase SQL Editor

-- Add crew bypass columns to livestream_events
ALTER TABLE livestream_events 
ADD COLUMN IF NOT EXISTS crew_bypass_token UUID,
ADD COLUMN IF NOT EXISTS bypass_created_at TIMESTAMPTZ;

-- Create index for fast token lookups
CREATE INDEX IF NOT EXISTS idx_livestream_events_bypass_token 
ON livestream_events(crew_bypass_token) 
WHERE crew_bypass_token IS NOT NULL;

-- Success message
SELECT 'Crew bypass columns added successfully!' as status;
