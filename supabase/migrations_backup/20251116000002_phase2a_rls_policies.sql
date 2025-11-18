-- ============================================
-- WEB LAUNCH ACADEMY - PHASE 2A RLS POLICIES
-- Security: Row Level Security for new tables
-- ============================================
--
-- This migration adds RLS policies to the 3 new tables
-- created in Phase 2A migration:
-- - ai_interaction_logs
-- - email_logs
-- - stripe_checkout_sessions
--
-- ============================================

-- ============================================
-- STEP 1: ENABLE RLS ON NEW TABLES
-- ============================================

ALTER TABLE ai_interaction_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_checkout_sessions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 2: AI INTERACTION LOGS POLICIES
-- ============================================

-- Users can view their own AI interactions
CREATE POLICY "Users can view own AI interactions"
  ON ai_interaction_logs
  FOR SELECT
  USING (
    auth.uid() = user_id
    OR
    auth.email() = user_email
  );

-- Service role can view all interactions (for analytics)
CREATE POLICY "Service role can view all AI interactions"
  ON ai_interaction_logs
  FOR SELECT
  USING (auth.jwt()->>'role' = 'service_role');

-- Authenticated users can insert their own interactions
CREATE POLICY "Users can insert own AI interactions"
  ON ai_interaction_logs
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    OR
    auth.email() = user_email
  );

-- Service role can insert any interaction
CREATE POLICY "Service role can insert AI interactions"
  ON ai_interaction_logs
  FOR INSERT
  WITH CHECK (auth.jwt()->>'role' = 'service_role');

-- Users can update their own interaction feedback
CREATE POLICY "Users can update own AI interaction feedback"
  ON ai_interaction_logs
  FOR UPDATE
  USING (
    auth.uid() = user_id
    OR
    auth.email() = user_email
  )
  WITH CHECK (
    auth.uid() = user_id
    OR
    auth.email() = user_email
  );

-- ============================================
-- STEP 3: EMAIL LOGS POLICIES
-- ============================================

-- Users can view their own email logs
CREATE POLICY "Users can view own email logs"
  ON email_logs
  FOR SELECT
  USING (
    auth.uid() = recipient_user_id
    OR
    auth.email() = recipient_email
  );

-- Admins can view all email logs
CREATE POLICY "Admins can view all email logs"
  ON email_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Service role can view all email logs
CREATE POLICY "Service role can view all email logs"
  ON email_logs
  FOR SELECT
  USING (auth.jwt()->>'role' = 'service_role');

-- Only service role can insert email logs (server-side only)
CREATE POLICY "Service role can insert email logs"
  ON email_logs
  FOR INSERT
  WITH CHECK (auth.jwt()->>'role' = 'service_role');

-- Service role can update email logs (for status tracking)
CREATE POLICY "Service role can update email logs"
  ON email_logs
  FOR UPDATE
  USING (auth.jwt()->>'role' = 'service_role')
  WITH CHECK (auth.jwt()->>'role' = 'service_role');

-- ============================================
-- STEP 4: STRIPE CHECKOUT SESSIONS POLICIES
-- ============================================

-- Users can view their own checkout sessions
CREATE POLICY "Users can view own checkout sessions"
  ON stripe_checkout_sessions
  FOR SELECT
  USING (
    auth.uid() = user_id
    OR
    auth.email() = user_email
  );

-- Admins can view all checkout sessions
CREATE POLICY "Admins can view all checkout sessions"
  ON stripe_checkout_sessions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Service role can view all checkout sessions
CREATE POLICY "Service role can view all checkout sessions"
  ON stripe_checkout_sessions
  FOR SELECT
  USING (auth.jwt()->>'role' = 'service_role');

-- Only service role can insert checkout sessions (server-side only)
CREATE POLICY "Service role can insert checkout sessions"
  ON stripe_checkout_sessions
  FOR INSERT
  WITH CHECK (auth.jwt()->>'role' = 'service_role');

-- Service role can update checkout sessions (for status changes)
CREATE POLICY "Service role can update checkout sessions"
  ON stripe_checkout_sessions
  FOR UPDATE
  USING (auth.jwt()->>'role' = 'service_role')
  WITH CHECK (auth.jwt()->>'role' = 'service_role');

-- ============================================
-- STEP 5: GRANT ACCESS TO AUTHENTICATED USERS
-- ============================================

-- Grant SELECT to authenticated users on their own data
GRANT SELECT ON ai_interaction_logs TO authenticated;
GRANT SELECT ON email_logs TO authenticated;
GRANT SELECT ON stripe_checkout_sessions TO authenticated;

-- Grant INSERT to authenticated users for AI interactions
GRANT INSERT ON ai_interaction_logs TO authenticated;

-- Grant UPDATE to authenticated users for AI interaction feedback
GRANT UPDATE (was_helpful, user_feedback) ON ai_interaction_logs TO authenticated;

-- ============================================
-- STEP 6: VERIFY POLICIES
-- ============================================

DO $$
DECLARE
  ai_logs_rls boolean;
  email_logs_rls boolean;
  stripe_sessions_rls boolean;
  ai_policy_count integer;
  email_policy_count integer;
  stripe_policy_count integer;
BEGIN
  -- Check RLS is enabled
  SELECT relrowsecurity INTO ai_logs_rls
  FROM pg_class
  WHERE relname = 'ai_interaction_logs';

  SELECT relrowsecurity INTO email_logs_rls
  FROM pg_class
  WHERE relname = 'email_logs';

  SELECT relrowsecurity INTO stripe_sessions_rls
  FROM pg_class
  WHERE relname = 'stripe_checkout_sessions';

  -- Count policies
  SELECT COUNT(*) INTO ai_policy_count
  FROM pg_policies
  WHERE tablename = 'ai_interaction_logs';

  SELECT COUNT(*) INTO email_policy_count
  FROM pg_policies
  WHERE tablename = 'email_logs';

  SELECT COUNT(*) INTO stripe_policy_count
  FROM pg_policies
  WHERE tablename = 'stripe_checkout_sessions';

  -- Verify everything is correct
  ASSERT ai_logs_rls = true, 'RLS not enabled on ai_interaction_logs';
  ASSERT email_logs_rls = true, 'RLS not enabled on email_logs';
  ASSERT stripe_sessions_rls = true, 'RLS not enabled on stripe_checkout_sessions';

  ASSERT ai_policy_count >= 5, 'Not enough policies on ai_interaction_logs';
  ASSERT email_policy_count >= 5, 'Not enough policies on email_logs';
  ASSERT stripe_policy_count >= 5, 'Not enough policies on stripe_checkout_sessions';

  RAISE NOTICE '✅ RLS Security Migration Complete!';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE 'Tables secured:';
  RAISE NOTICE '  • ai_interaction_logs (% policies)', ai_policy_count;
  RAISE NOTICE '  • email_logs (% policies)', email_policy_count;
  RAISE NOTICE '  • stripe_checkout_sessions (% policies)', stripe_policy_count;
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
END $$;

-- ============================================
-- RLS POLICIES COMPLETE! 🔒
-- ============================================
--
-- Security model:
-- • Users can only view/modify their own data
-- • Admins can view all data for support
-- • Service role has full access (server-side)
-- • Email logs and checkout sessions are server-only inserts
-- • AI interactions allow user feedback updates
--
-- ============================================
