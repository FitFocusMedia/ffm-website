-- Add organizer_token column to livestream_events table
-- This allows event organizers to access a read-only dashboard without admin login

ALTER TABLE livestream_events 
ADD COLUMN IF NOT EXISTS organizer_token TEXT UNIQUE;

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_livestream_events_organizer_token 
ON livestream_events(organizer_token);

-- Function to generate a secure random token
CREATE OR REPLACE FUNCTION generate_organizer_token()
RETURNS TEXT AS $$
BEGIN
  RETURN encode(gen_random_bytes(24), 'base64');
END;
$$ LANGUAGE plpgsql;

-- Add revenue_share_percent column (optional - for showing organizer's cut)
ALTER TABLE livestream_events
ADD COLUMN IF NOT EXISTS revenue_share_percent NUMERIC(5,2) DEFAULT 30.00;

-- Comment for documentation
COMMENT ON COLUMN livestream_events.organizer_token IS 'Secret token for organizer-only dashboard access';
COMMENT ON COLUMN livestream_events.revenue_share_percent IS 'Percentage of revenue that goes to event organizer (0-100)';
