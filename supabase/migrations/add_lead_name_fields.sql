-- Add name fields to leads table
ALTER TABLE leads
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT,
ADD COLUMN IF NOT EXISTS display_name TEXT;

-- Create index on display_name for better query performance
CREATE INDEX IF NOT EXISTS idx_leads_display_name ON leads(display_name);

-- Update existing leads that might have names stored elsewhere
-- This is a placeholder - adjust based on your existing data structure
COMMENT ON COLUMN leads.first_name IS 'First name of the lead';
COMMENT ON COLUMN leads.last_name IS 'Last name of the lead';
COMMENT ON COLUMN leads.display_name IS 'Display name for personalization (e.g., "Smith, John")';
