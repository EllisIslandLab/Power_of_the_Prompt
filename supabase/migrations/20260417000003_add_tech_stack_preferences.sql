-- ============================================
-- Add Tech Stack Preferences to Users
-- ============================================
--
-- This migration adds a field for storing client tech
-- stack preferences to customize resource recommendations
--
-- Date: 2026-04-17
-- ============================================

-- Add tech_stack_preferences as JSONB for flexible storage
ALTER TABLE users
ADD COLUMN IF NOT EXISTS tech_stack_preferences jsonb DEFAULT '[]'::jsonb;

-- Add index for JSONB queries
CREATE INDEX IF NOT EXISTS idx_users_tech_stack_preferences
ON users USING gin(tech_stack_preferences);

-- Add comment for documentation
COMMENT ON COLUMN users.tech_stack_preferences IS 'Array of tech stack preferences (e.g., ["nextjs", "supabase", "tailwind"]) for personalized resource filtering';

-- Example of tech stack preferences structure:
-- ["nextjs", "supabase", "tailwind", "typescript", "react", "vercel"]

-- Verify
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '✅ Added tech stack preferences to users table';
  RAISE NOTICE '   - tech_stack_preferences: JSONB array for storing client tech preferences';
  RAISE NOTICE '   - Indexed with GIN for fast lookups';
  RAISE NOTICE '';
END $$;
