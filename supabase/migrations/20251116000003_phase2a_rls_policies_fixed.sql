-- ============================================
-- WEB LAUNCH ACADEMY - PHASE 2A RLS POLICIES (FIXED)
-- Security: Row Level Security for new tables
-- ============================================
--
-- This migration adds RLS policies to the 3 new tables
-- Safely drops existing policies before creating new ones
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

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own AI interactions" ON ai_interaction_logs;
DROP POLICY IF EXISTS "Service role can view all AI interactions" ON ai_interaction_logs;
DROP POLICY IF EXISTS "Users can insert own AI interactions" ON ai_interaction_logs;
DROP POLICY IF EXISTS "Users can update their own AI feedback" ON ai_interaction_logs;
DROP POLICY IF EXISTS "Admins can view all AI interactions" ON ai_interaction_logs;

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

-- Users can update feedback on their own interactions
CREATE POLICY "Users can update their own AI feedback"
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

-- Admins can view all AI interactions
CREATE POLICY "Admins can view all AI interactions"
  ON ai_interaction_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- ============================================
-- STEP 3: EMAIL LOGS POLICIES
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own email logs" ON email_logs;
DROP POLICY IF EXISTS "Service role can view all email logs" ON email_logs;
DROP POLICY IF EXISTS "Service role can insert email logs" ON email_logs;
DROP POLICY IF EXISTS "Service role can update email logs" ON email_logs;
DROP POLICY IF EXISTS "Admins can view all email logs" ON email_logs;

-- Users can view their own email logs
CREATE POLICY "Users can view own email logs"
  ON email_logs
  FOR SELECT
  USING (
    auth.uid() = recipient_user_id
    OR
    auth.email() = recipient_email
  );

-- Service role can view all email logs
CREATE POLICY "Service role can view all email logs"
  ON email_logs
  FOR SELECT
  USING (auth.jwt()->>'role' = 'service_role');

-- Service role can insert email logs
CREATE POLICY "Service role can insert email logs"
  ON email_logs
  FOR INSERT
  WITH CHECK (auth.jwt()->>'role' = 'service_role');

-- Service role can update email logs (for status tracking)
CREATE POLICY "Service role can update email logs"
  ON email_logs
  FOR UPDATE
  USING (auth.jwt()->>'role' = 'service_role');

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

-- ============================================
-- STEP 4: STRIPE CHECKOUT SESSIONS POLICIES
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own checkout sessions" ON stripe_checkout_sessions;
DROP POLICY IF EXISTS "Service role can manage checkout sessions" ON stripe_checkout_sessions;
DROP POLICY IF EXISTS "Admins can view all checkout sessions" ON stripe_checkout_sessions;

-- Users can view their own checkout sessions
CREATE POLICY "Users can view own checkout sessions"
  ON stripe_checkout_sessions
  FOR SELECT
  USING (
    auth.uid() = user_id
    OR
    auth.email() = user_email
  );

-- Service role can manage all checkout sessions
CREATE POLICY "Service role can manage checkout sessions"
  ON stripe_checkout_sessions
  FOR ALL
  USING (auth.jwt()->>'role' = 'service_role')
  WITH CHECK (auth.jwt()->>'role' = 'service_role');

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

-- ============================================
-- VERIFICATION
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '✅ RLS Policies applied successfully!';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE 'Tables secured:';
  RAISE NOTICE '  • ai_interaction_logs (5 policies)';
  RAISE NOTICE '  • email_logs (5 policies)';
  RAISE NOTICE '  • stripe_checkout_sessions (3 policies)';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
END $$;
