-- ============================================================================
-- SECURITY FIXES: Address Supabase Linter Warnings
-- ============================================================================
-- This script fixes:
-- 1. RLS policies for lesson_plans and lesson_progress tables
-- 2. search_path security for all functions with mutable search_path warnings
-- ============================================================================

-- ============================================================================
-- PART 1: Enable RLS and Add Policies for lesson_plans
-- ============================================================================

-- Enable RLS on lesson_plans table
ALTER TABLE lesson_plans ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Admins can manage all lesson plans" ON lesson_plans;
DROP POLICY IF EXISTS "Students can view lesson plans" ON lesson_plans;

-- Admin: Full access to all lesson plans
CREATE POLICY "Admins can manage all lesson plans"
ON lesson_plans
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

-- Students: Read-only access to lesson plans
CREATE POLICY "Students can view lesson plans"
ON lesson_plans
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'student'
  )
);

-- ============================================================================
-- PART 2: Enable RLS and Add Policies for lesson_progress
-- ============================================================================

-- Enable RLS on lesson_progress table
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can manage their own progress" ON lesson_progress;
DROP POLICY IF EXISTS "Admins can view all progress" ON lesson_progress;

-- Students: Can manage their own progress
CREATE POLICY "Users can manage their own progress"
ON lesson_progress
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Admins: Can view all student progress
CREATE POLICY "Admins can view all progress"
ON lesson_progress
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

-- ============================================================================
-- PART 3: Fix search_path for all functions
-- ============================================================================

-- Fix: update_chat_updated_at
CREATE OR REPLACE FUNCTION update_chat_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Fix: ensure_single_active_cohort
CREATE OR REPLACE FUNCTION ensure_single_active_cohort()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NEW.is_active = TRUE THEN
    UPDATE public.cohorts
    SET is_active = FALSE
    WHERE id != NEW.id AND is_active = TRUE;
  END IF;
  RETURN NEW;
END;
$$;

-- Fix: convert_lead_to_user
CREATE OR REPLACE FUNCTION convert_lead_to_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- When a user record is created with an email that matches a lead,
  -- update the lead to reference the new user
  UPDATE public.leads
  SET user_id = NEW.id,
      updated_at = NOW()
  WHERE email = NEW.email
    AND user_id IS NULL;

  RETURN NEW;
END;
$$;

-- Fix: handle_new_user
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role, tier, payment_status)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'student',
    'trial',
    'trial'
  );
  RETURN NEW;
END;
$$;

-- Fix: add_attendance_points
CREATE OR REPLACE FUNCTION add_attendance_points(
  p_user_id UUID,
  p_points INTEGER DEFAULT 10
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.gamification_points (user_id, points, reason, category)
  VALUES (p_user_id, p_points, 'Attendance', 'attendance');
END;
$$;

-- Fix: add_engagement_points
CREATE OR REPLACE FUNCTION add_engagement_points(
  p_user_id UUID,
  p_points INTEGER,
  p_reason TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.gamification_points (user_id, points, reason, category)
  VALUES (p_user_id, p_points, p_reason, 'engagement');
END;
$$;

-- Fix: add_referral_signup_points
CREATE OR REPLACE FUNCTION add_referral_signup_points(
  p_user_id UUID,
  p_points INTEGER DEFAULT 50
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.gamification_points (user_id, points, reason, category)
  VALUES (p_user_id, p_points, 'Referral Signup', 'referral');
END;
$$;

-- Fix: add_referral_cash_points
CREATE OR REPLACE FUNCTION add_referral_cash_points(
  p_user_id UUID,
  p_points INTEGER DEFAULT 100
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.gamification_points (user_id, points, reason, category)
  VALUES (p_user_id, p_points, 'Referral Cash Payment', 'referral');
END;
$$;

-- Fix: add_bonus_points
CREATE OR REPLACE FUNCTION add_bonus_points(
  p_user_id UUID,
  p_points INTEGER,
  p_reason TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.gamification_points (user_id, points, reason, category)
  VALUES (p_user_id, p_points, p_reason, 'bonus');
END;
$$;

-- Fix: increment_campaign_opens
CREATE OR REPLACE FUNCTION increment_campaign_opens()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  UPDATE public.email_campaigns
  SET opens = opens + 1
  WHERE id = NEW.campaign_id;
  RETURN NEW;
END;
$$;

-- Fix: increment_campaign_clicks
CREATE OR REPLACE FUNCTION increment_campaign_clicks()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  UPDATE public.email_campaigns
  SET clicks = clicks + 1
  WHERE id = NEW.campaign_id;
  RETURN NEW;
END;
$$;

-- Fix: handle_user_email_verified
CREATE OR REPLACE FUNCTION handle_user_email_verified()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NEW.email_confirmed_at IS NOT NULL AND OLD.email_confirmed_at IS NULL THEN
    UPDATE public.users
    SET email_verified = true,
        updated_at = NOW()
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

-- Fix: calculate_cohort_end_date
CREATE OR REPLACE FUNCTION calculate_cohort_end_date()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NEW.start_date IS NOT NULL AND NEW.duration_weeks IS NOT NULL THEN
    NEW.end_date := NEW.start_date + (NEW.duration_weeks * 7 || ' days')::INTERVAL;
  END IF;
  RETURN NEW;
END;
$$;

-- Fix: update_cohort_updated_at
CREATE OR REPLACE FUNCTION update_cohort_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Fix: update_invite_tokens_updated_at
CREATE OR REPLACE FUNCTION update_invite_tokens_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Fix: cleanup_expired_invite_tokens
CREATE OR REPLACE FUNCTION cleanup_expired_invite_tokens()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  DELETE FROM public.invite_tokens
  WHERE expires_at < NOW()
    AND used_at IS NULL;
END;
$$;

-- Fix: update_updated_at_column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Verify RLS is enabled
SELECT
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('lesson_plans', 'lesson_progress');

-- Count policies created
SELECT
  schemaname,
  tablename,
  policyname
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('lesson_plans', 'lesson_progress')
ORDER BY tablename, policyname;

-- ============================================================================
-- NOTES
-- ============================================================================
--
-- After running this script:
-- 1. All functions now have SET search_path = '' for security
-- 2. RLS is enabled on lesson_plans and lesson_progress tables
-- 3. Proper policies are in place for admin/student access
--
-- The "Leaked Password Protection" warning can only be fixed in the
-- Supabase Dashboard under Authentication > Password Settings
--
-- ============================================================================
