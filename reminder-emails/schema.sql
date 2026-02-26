-- Event Reminder Emails System
-- Tracks which reminder emails have been sent to prevent duplicates

CREATE TABLE IF NOT EXISTS reminder_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES livestream_events(id) ON DELETE CASCADE,
  purchase_id UUID NOT NULL REFERENCES livestream_purchases(id) ON DELETE CASCADE,
  reminder_type TEXT NOT NULL CHECK (reminder_type IN ('24h', '1h')),
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  email TEXT NOT NULL,
  
  -- Prevent sending the same reminder twice
  UNIQUE(event_id, purchase_id, reminder_type),
  
  -- Indexes for fast lookups
  CONSTRAINT reminder_emails_event_idx FOREIGN KEY (event_id) REFERENCES livestream_events(id),
  CONSTRAINT reminder_emails_purchase_idx FOREIGN KEY (purchase_id) REFERENCES livestream_purchases(id)
);

-- Index for fast event-based queries
CREATE INDEX IF NOT EXISTS idx_reminder_emails_event_id ON reminder_emails(event_id);
CREATE INDEX IF NOT EXISTS idx_reminder_emails_sent_at ON reminder_emails(sent_at);

-- RLS Policies (admin read, system write)
ALTER TABLE reminder_emails ENABLE ROW LEVEL SECURITY;

-- Admin can view all reminder history
CREATE POLICY "Admin can view reminder history"
  ON reminder_emails
  FOR SELECT
  TO authenticated
  USING (true);

-- Service role can insert (Edge Function)
CREATE POLICY "Service role can insert reminders"
  ON reminder_emails
  FOR INSERT
  TO service_role
  WITH CHECK (true);

COMMENT ON TABLE reminder_emails IS 'Tracks sent event reminder emails (24h and 1h before event start)';
COMMENT ON COLUMN reminder_emails.reminder_type IS 'Either 24h or 1h before event';
COMMENT ON COLUMN reminder_emails.sent_at IS 'When the reminder email was actually sent';
