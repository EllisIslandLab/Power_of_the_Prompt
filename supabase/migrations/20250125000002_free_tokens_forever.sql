-- ============================================
-- FREE TOKENS FOREVER MODEL
-- Track one-time free AI token per email (no expiration)
-- ============================================

-- Add free token tracking to users table
DO $$
BEGIN
  -- Track if email has claimed their free token (via verification)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='users' AND column_name='free_tokens_claimed'
  ) THEN
    ALTER TABLE users ADD COLUMN free_tokens_claimed boolean DEFAULT false;
    RAISE NOTICE '✅ Added free_tokens_claimed to users';
  END IF;

  -- Track if they've actually used their free token
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='users' AND column_name='free_tokens_used'
  ) THEN
    ALTER TABLE users ADD COLUMN free_tokens_used boolean DEFAULT false;
    RAISE NOTICE '✅ Added free_tokens_used to users';
  END IF;

  -- When they claimed it (for analytics)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='users' AND column_name='free_tokens_claimed_at'
  ) THEN
    ALTER TABLE users ADD COLUMN free_tokens_claimed_at timestamp;
    RAISE NOTICE '✅ Added free_tokens_claimed_at to users';
  END IF;

  -- When they used it (for analytics)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='users' AND column_name='free_tokens_used_at'
  ) THEN
    ALTER TABLE users ADD COLUMN free_tokens_used_at timestamp;
    RAISE NOTICE '✅ Added free_tokens_used_at to users';
  END IF;
END $$;

-- Create index for quick lookups
CREATE INDEX IF NOT EXISTS idx_users_free_tokens
  ON users(email, free_tokens_claimed, free_tokens_used);

-- ============================================
-- BACKFILL EXISTING USERS
-- ============================================

-- Users who already have demo_projects with was_free_generation=true
-- should have their tokens marked as claimed and used
UPDATE users
SET
  free_tokens_claimed = true,
  free_tokens_used = true,
  free_tokens_claimed_at = COALESCE(
    (SELECT created_at FROM demo_projects
     WHERE user_email = users.email
     AND was_free_generation = true
     ORDER BY created_at ASC LIMIT 1),
    now()
  ),
  free_tokens_used_at = COALESCE(
    (SELECT created_at FROM demo_projects
     WHERE user_email = users.email
     AND was_free_generation = true
     ORDER BY created_at ASC LIMIT 1),
    now()
  )
WHERE EXISTS (
  SELECT 1 FROM demo_projects
  WHERE demo_projects.user_email = users.email
  AND demo_projects.was_free_generation = true
);

-- ============================================
-- VERIFICATION
-- ============================================

DO $$
DECLARE
  claimed_count integer;
  used_count integer;
BEGIN
  SELECT COUNT(*) INTO claimed_count FROM users WHERE free_tokens_claimed = true;
  SELECT COUNT(*) INTO used_count FROM users WHERE free_tokens_used = true;

  RAISE NOTICE '';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '✅ FREE TOKENS FOREVER MODEL COMPLETE!';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '';
  RAISE NOTICE 'Columns added to users table:';
  RAISE NOTICE '  • free_tokens_claimed (boolean)';
  RAISE NOTICE '  • free_tokens_used (boolean)';
  RAISE NOTICE '  • free_tokens_claimed_at (timestamp)';
  RAISE NOTICE '  • free_tokens_used_at (timestamp)';
  RAISE NOTICE '';
  RAISE NOTICE 'Current status:';
  RAISE NOTICE '  • Tokens claimed: %', claimed_count;
  RAISE NOTICE '  • Tokens used: %', used_count;
  RAISE NOTICE '';
  RAISE NOTICE 'Model: One free token per email, forever! 🚀';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
END $$;
