-- ============================================================================
-- ADD WANTS_OWNERSHIP FIELD TO LEADS TABLE
-- ============================================================================
-- Add checkbox field: "Yes, I want a website I actually OWN."
-- ============================================================================

-- Add the boolean column
ALTER TABLE leads
ADD COLUMN IF NOT EXISTS wants_ownership BOOLEAN DEFAULT true;

-- Add index for analytics queries
CREATE INDEX IF NOT EXISTS idx_leads_wants_ownership ON leads(wants_ownership);

-- Add comment for documentation
COMMENT ON COLUMN leads.wants_ownership IS 'User checked "Yes, I want a website I actually OWN." during signup';

-- Backfill existing leads to default true
UPDATE leads
SET wants_ownership = true
WHERE wants_ownership IS NULL;

-- Verify the column was added
SELECT
  column_name,
  data_type,
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'leads'
  AND column_name = 'wants_ownership';
