-- ============================================
-- WEB LAUNCH ACADEMY - ADD MISSING COLUMNS
-- Complete Phase 2A Schema
-- ============================================
--
-- This migration adds columns that were in the
-- "corrected" SQL but missing from our database:
-- - product_slug for routing webhooks
-- - AI tracking fields for demo_projects
--
-- SAFE: Uses IF NOT EXISTS checks
-- ============================================

-- ============================================
-- STEP 1: ADD PRODUCT_SLUG TO TABLES
-- ============================================

-- Add product_slug to stripe_checkout_sessions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='stripe_checkout_sessions' AND column_name='product_slug'
  ) THEN
    ALTER TABLE stripe_checkout_sessions
    ADD COLUMN product_slug text;

    RAISE NOTICE '✅ Added product_slug to stripe_checkout_sessions';
  ELSE
    RAISE NOTICE '⏭️  product_slug already exists in stripe_checkout_sessions';
  END IF;
END $$;

-- Add product_slug to purchases table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='purchases' AND column_name='product_slug'
  ) THEN
    ALTER TABLE purchases
    ADD COLUMN product_slug text;

    RAISE NOTICE '✅ Added product_slug to purchases';
  ELSE
    RAISE NOTICE '⏭️  product_slug already exists in purchases';
  END IF;
END $$;

-- ============================================
-- STEP 2: ADD AI TRACKING TO DEMO_PROJECTS
-- ============================================

-- Add AI tracking fields to demo_projects
DO $$
BEGIN
  -- AI questions asked (JSONB array)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='demo_projects' AND column_name='ai_questions_asked'
  ) THEN
    ALTER TABLE demo_projects
    ADD COLUMN ai_questions_asked jsonb DEFAULT '[]'::jsonb;

    RAISE NOTICE '✅ Added ai_questions_asked to demo_projects';
  END IF;

  -- AI improvements made count
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='demo_projects' AND column_name='ai_improvements_made'
  ) THEN
    ALTER TABLE demo_projects
    ADD COLUMN ai_improvements_made integer DEFAULT 0;

    RAISE NOTICE '✅ Added ai_improvements_made to demo_projects';
  END IF;

  -- Help topics viewed array
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='demo_projects' AND column_name='help_topics_viewed'
  ) THEN
    ALTER TABLE demo_projects
    ADD COLUMN help_topics_viewed text[] DEFAULT '{}';

    RAISE NOTICE '✅ Added help_topics_viewed to demo_projects';
  END IF;
END $$;

-- ============================================
-- STEP 3: CREATE ADDITIONAL INDEXES
-- ============================================

-- Index for product_slug routing
CREATE INDEX IF NOT EXISTS idx_stripe_sessions_slug
  ON stripe_checkout_sessions(product_slug);

CREATE INDEX IF NOT EXISTS idx_purchases_slug
  ON purchases(product_slug);

-- ============================================
-- STEP 4: VERIFY COLUMNS ADDED
-- ============================================

DO $$
DECLARE
  checkout_slug_exists boolean;
  purchases_slug_exists boolean;
  ai_questions_exists boolean;
  ai_improvements_exists boolean;
  help_topics_exists boolean;
BEGIN
  -- Check all columns exist
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='stripe_checkout_sessions' AND column_name='product_slug'
  ) INTO checkout_slug_exists;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='purchases' AND column_name='product_slug'
  ) INTO purchases_slug_exists;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='demo_projects' AND column_name='ai_questions_asked'
  ) INTO ai_questions_exists;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='demo_projects' AND column_name='ai_improvements_made'
  ) INTO ai_improvements_exists;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='demo_projects' AND column_name='help_topics_viewed'
  ) INTO help_topics_exists;

  ASSERT checkout_slug_exists, 'product_slug not added to stripe_checkout_sessions';
  ASSERT purchases_slug_exists, 'product_slug not added to purchases';
  ASSERT ai_questions_exists, 'ai_questions_asked not added to demo_projects';
  ASSERT ai_improvements_exists, 'ai_improvements_made not added to demo_projects';
  ASSERT help_topics_exists, 'help_topics_viewed not added to demo_projects';

  RAISE NOTICE '';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '✅ PHASE 2A SCHEMA COMPLETE!';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '';
  RAISE NOTICE 'Columns added:';
  RAISE NOTICE '  ✅ product_slug (stripe_checkout_sessions)';
  RAISE NOTICE '  ✅ product_slug (purchases)';
  RAISE NOTICE '  ✅ ai_questions_asked (demo_projects)';
  RAISE NOTICE '  ✅ ai_improvements_made (demo_projects)';
  RAISE NOTICE '  ✅ help_topics_viewed (demo_projects)';
  RAISE NOTICE '';
  RAISE NOTICE 'Database is now fully aligned! 🎉';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
END $$;

-- ============================================
-- MIGRATION COMPLETE! 🎉
-- ============================================
