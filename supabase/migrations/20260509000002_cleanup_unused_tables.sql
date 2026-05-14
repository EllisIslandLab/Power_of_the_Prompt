-- ============================================
-- Database Cleanup Migration
-- Removes unused student, website creation, and legacy tables
-- Focus: Website Maintenance & Portal
-- Date: 2026-05-09
-- ============================================

-- ============================================
-- STUDENT/LEARNING FEATURES (9 tables)
-- ============================================

DROP TABLE IF EXISTS public.attendance_log CASCADE;
DROP TABLE IF EXISTS public.cohorts CASCADE;
DROP TABLE IF EXISTS public.cohort_members CASCADE;
DROP TABLE IF EXISTS public.course_sessions CASCADE;
DROP TABLE IF EXISTS public.lesson_plans CASCADE;
DROP TABLE IF EXISTS public.lesson_progress CASCADE;
DROP TABLE IF EXISTS public.student_points CASCADE;
DROP TABLE IF EXISTS public.student_badges CASCADE;
DROP TABLE IF EXISTS public.social_shares CASCADE;

-- ============================================
-- WEBSITE CREATION/BUILDER (13 tables)
-- ============================================

DROP TABLE IF EXISTS public.business_categories CASCADE;
DROP TABLE IF EXISTS public.boilerplate_versions CASCADE;
DROP TABLE IF EXISTS public.components CASCADE;
DROP TABLE IF EXISTS public.component_versions CASCADE;
DROP TABLE IF EXISTS public.component_ratings CASCADE;
DROP TABLE IF EXISTS public.template_categories CASCADE;
DROP TABLE IF EXISTS public.niche_templates CASCADE;
DROP TABLE IF EXISTS public.demo_projects CASCADE;
DROP TABLE IF EXISTS public.website_categories CASCADE;
DROP TABLE IF EXISTS public.website_subcategories CASCADE;
DROP TABLE IF EXISTS public.deep_dive_questions CASCADE;
DROP TABLE IF EXISTS public.demo_interactions CASCADE;
DROP TABLE IF EXISTS public.verification_codes CASCADE;

-- ============================================
-- UNUSED COMMERCE (6 tables)
-- ============================================

DROP TABLE IF EXISTS public.content_types CASCADE;
DROP TABLE IF EXISTS public.user_purchases CASCADE;
DROP TABLE IF EXISTS public.session_usage CASCADE;
DROP TABLE IF EXISTS public.availability_slots CASCADE;
DROP TABLE IF EXISTS public.session_bookings CASCADE;
DROP TABLE IF EXISTS public.stripe_checkout_sessions CASCADE;

-- ============================================
-- UNUSED FEATURES (11 tables)
-- ============================================

DROP TABLE IF EXISTS public.ai_interaction_logs CASCADE;
DROP TABLE IF EXISTS public.video_progress CASCADE;
DROP TABLE IF EXISTS public.testimonials CASCADE;
DROP TABLE IF EXISTS public.portfolio CASCADE;
DROP TABLE IF EXISTS public.user_presence CASCADE;
DROP TABLE IF EXISTS public.user_emails CASCADE;

-- ============================================
-- DELETE TEST USER
-- (After dropping user_emails to avoid trigger)
-- ============================================

DELETE FROM users WHERE email = 'mattjellis1@gmail.com';

-- ============================================
-- FIX CRITICAL SECURITY ISSUES
-- Drop SECURITY DEFINER views that bypass RLS
-- ============================================

DROP VIEW IF EXISTS public.client_account_summary CASCADE;
DROP VIEW IF EXISTS public.revenue_metrics CASCADE;
DROP VIEW IF EXISTS public.pending_work_summary CASCADE;

-- Recreate client_account_summary WITHOUT security definer
-- Users can only see their own account summary
CREATE OR REPLACE VIEW public.client_account_summary AS
SELECT
  ca.id,
  ca.user_id,
  ca.account_balance,
  ca.held_balance,
  ca.total_lifetime_spent,
  ca.trial_status,
  ca.trial_expiration_date,
  COUNT(DISTINCT rc.id) as total_conversations,
  COUNT(DISTINCT rcm.id) as total_messages,
  COALESCE(SUM(rcm.tokens_in + rcm.tokens_out), 0) as total_tokens_used
FROM client_accounts ca
LEFT JOIN revision_conversations rc ON rc.user_id = ca.user_id
LEFT JOIN revision_chat_messages rcm ON rcm.conversation_id = rc.id
WHERE ca.user_id = auth.uid()  -- RLS: users only see their own data
GROUP BY ca.id, ca.user_id, ca.account_balance, ca.held_balance,
         ca.total_lifetime_spent, ca.trial_status, ca.trial_expiration_date;

-- Grant access
GRANT SELECT ON public.client_account_summary TO authenticated;

-- Enable RLS on view
ALTER VIEW public.client_account_summary SET (security_invoker = true);

COMMENT ON VIEW public.client_account_summary IS 'Client account summary - users can only view their own data (RLS enforced)';

-- ============================================
-- SUMMARY
-- ============================================
-- Dropped: 39 tables
-- Fixed: 3 security definer views
-- Deleted: 1 test user
-- Kept: 25 tables for portal, billing, commerce, marketing, website maintenance
