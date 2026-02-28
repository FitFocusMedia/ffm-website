-- Event Athletes Table for Run Sheet / Athlete Tracking
-- Created: 2026-03-01 (Nightshift)
-- Purpose: Track athletes per event, link to orders, manage capture status

CREATE TABLE IF NOT EXISTS event_athletes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    
    -- Athlete info (from Smoothcomp import)
    name TEXT NOT NULL,
    division TEXT,
    mat TEXT,
    competition_time TEXT,
    academy TEXT,
    email TEXT,
    phone TEXT,
    
    -- Tracking status
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'checked_in', 'competing', 'completed')),
    captured BOOLEAN DEFAULT false,
    captured_at TIMESTAMPTZ,
    
    -- Metadata
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_event_athletes_event_id ON event_athletes(event_id);
CREATE INDEX idx_event_athletes_name ON event_athletes(name);
CREATE INDEX idx_event_athletes_captured ON event_athletes(captured);
CREATE INDEX idx_event_athletes_competition_time ON event_athletes(competition_time);

-- RLS
ALTER TABLE event_athletes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage event_athletes" ON event_athletes
    FOR ALL USING (true) WITH CHECK (true);

-- Auto-update timestamp
CREATE TRIGGER update_event_athletes_updated_at 
    BEFORE UPDATE ON event_athletes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE event_athletes IS 'Athletes imported from Smoothcomp for run sheet tracking';
