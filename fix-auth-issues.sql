-- ============================================================
-- FIX AUTHENTICATION ISSUES
-- ============================================================
-- Run these commands in your Supabase SQL Editor
-- Execute them ONE-BY-ONE in the order shown
-- ============================================================

-- ============================================================
-- STEP 1: Delete the orphaned test user
-- ============================================================
-- This user (mattichu@live.com) exists in public.users but not in auth.users
-- It's safe to delete since it's a test account

DELETE FROM public.users
WHERE email = 'mattichu@live.com'
  AND id = 'efd41710-de10-48f1-a4db-1c6c6e883d52';

-- Verify it's deleted (should return 0 rows)
SELECT * FROM public.users WHERE email = 'mattichu@live.com';


-- ============================================================
-- STEP 2: Create invite_tokens table (if not exists)
-- ============================================================
-- This table is required for invite-based signups at /signup?token=xxx
-- It was likely dropped when students table was dropped with CASCADE

CREATE TABLE IF NOT EXISTS invite_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  token VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  tier VARCHAR(20) DEFAULT 'basic' CHECK (tier IN ('basic', 'full')),
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP,
  created_by UUID REFERENCES public.users(id), -- Admin who created the invite
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_invite_tokens_token ON invite_tokens(token);
CREATE INDEX IF NOT EXISTS idx_invite_tokens_email ON invite_tokens(email);
CREATE INDEX IF NOT EXISTS idx_invite_tokens_expires_at ON invite_tokens(expires_at);

-- Enable Row Level Security
ALTER TABLE invite_tokens ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their own invite tokens" ON invite_tokens;
DROP POLICY IF EXISTS "Service role can manage invite tokens" ON invite_tokens;
DROP POLICY IF EXISTS "Admins can manage all invite tokens" ON invite_tokens;

-- Policy: Only admins can view all invite tokens
CREATE POLICY "Admins can manage all invite tokens" ON invite_tokens
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_invite_tokens_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_invite_tokens_updated_at ON invite_tokens;

CREATE TRIGGER trigger_invite_tokens_updated_at
  BEFORE UPDATE ON invite_tokens
  FOR EACH ROW
  EXECUTE FUNCTION update_invite_tokens_updated_at();

-- Add helper function to clean up expired tokens
CREATE OR REPLACE FUNCTION cleanup_expired_invite_tokens()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM invite_tokens
  WHERE expires_at < NOW() AND used_at IS NULL;

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add documentation
COMMENT ON TABLE invite_tokens IS 'Secure invite tokens for student registration via /signup?token=xxx';
COMMENT ON COLUMN invite_tokens.tier IS 'Student access tier: basic (free) or full (paid access)';
COMMENT ON COLUMN invite_tokens.expires_at IS 'Token expiration time (typically 7 days from creation)';
COMMENT ON COLUMN invite_tokens.used_at IS 'When the token was used for signup';


-- ============================================================
-- STEP 3: Verify everything is correct
-- ============================================================

-- Check that the orphaned user is gone (should return 0)
SELECT COUNT(*) as orphaned_count
FROM public.users pu
LEFT JOIN auth.users au ON pu.id = au.id
WHERE au.id IS NULL;

-- Check that invite_tokens table exists (should return 1 row)
SELECT EXISTS (
  SELECT FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name = 'invite_tokens'
) as invite_tokens_exists;

-- Check final user counts (should be clean)
SELECT
  'Total auth.users' as metric,
  COUNT(*) as count
FROM auth.users
UNION ALL
SELECT
  'Total public.users' as metric,
  COUNT(*) as count
FROM public.users
UNION ALL
SELECT
  'Admin users' as metric,
  COUNT(*) as count
FROM public.users
WHERE role = 'admin'
UNION ALL
SELECT
  'Student users' as metric,
  COUNT(*) as count
FROM public.users
WHERE role = 'student'
UNION ALL
SELECT
  'Orphaned auth (missing public)' as metric,
  COUNT(*) as count
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL
UNION ALL
SELECT
  'Orphaned public (missing auth)' as metric,
  COUNT(*) as count
FROM public.users pu
LEFT JOIN auth.users au ON pu.id = au.id
WHERE au.id IS NULL;


-- ============================================================
-- EXPECTED RESULTS:
-- ============================================================
-- After running all steps above, you should see:
--
-- Step 3, Query 1 (orphaned_count): 0
-- Step 3, Query 2 (invite_tokens_exists): true
-- Step 3, Query 3 (final counts):
--   - Total auth.users: 4
--   - Total public.users: 4 (down from 5)
--   - Admin users: 1
--   - Student users: 3 (or 4, depending on how users are counted)
--   - Orphaned auth: 0
--   - Orphaned public: 0
-- ============================================================


-- ============================================================
-- OPTIONAL: Create a test invite token
-- ============================================================
-- Uncomment and run this if you want to test invite-based signup
-- Replace 'YOUR_ADMIN_USER_ID' with your actual admin user ID

/*
INSERT INTO invite_tokens (
  token,
  email,
  full_name,
  tier,
  expires_at,
  created_by
) VALUES (
  'test-invite-' || gen_random_uuid()::text,
  'test@example.com',
  'Test User',
  'basic',
  NOW() + INTERVAL '7 days',
  'YOUR_ADMIN_USER_ID'
)
RETURNING token, email, expires_at;
*/
