-- ============================================================
-- AUTHENTICATION VERIFICATION SQL QUERIES
-- ============================================================
-- Run these queries ONE-BY-ONE or by section to verify your auth setup
-- These are all SELECT queries - safe to run, they won't modify data
--
-- How to run:
-- 1. Copy each query section
-- 2. Paste into Supabase SQL Editor
-- 3. Run and review results
-- 4. Move to next section
-- ============================================================

-- ============================================================
-- SECTION 1: Auth Schema - Check Supabase Auth Users
-- ============================================================

-- 1.1: View all auth users with their confirmation status
SELECT
  id,
  email,
  email_confirmed_at,
  created_at,
  raw_user_meta_data->>'full_name' as full_name,
  last_sign_in_at
FROM auth.users
ORDER BY created_at DESC;

-- 1.2: Check for unconfirmed emails (users who haven't verified)
SELECT
  id,
  email,
  created_at,
  email_confirmed_at
FROM auth.users
WHERE email_confirmed_at IS NULL
ORDER BY created_at DESC;

-- 1.3: Check auth.identities (should have one per user)
SELECT
  u.email,
  i.provider,
  i.created_at as identity_created,
  i.last_sign_in_at
FROM auth.identities i
JOIN auth.users u ON i.user_id = u.id
ORDER BY i.created_at DESC;

-- 1.4: Check MFA status (should be empty unless using MFA)
SELECT
  u.email,
  m.*
FROM auth.mfa_amr_claims m
JOIN auth.users u ON m.session_id = u.id
ORDER BY m.created_at DESC;


-- ============================================================
-- SECTION 2: Public Schema - Check User Profiles
-- ============================================================

-- 2.1: View all public.users with their roles and tiers
SELECT
  id,
  email,
  full_name,
  role,
  tier,
  payment_status,
  email_verified,
  invited_by,
  created_at,
  updated_at
FROM public.users
ORDER BY created_at DESC;

-- 2.2: CRITICAL CHECK - Find users in auth but NOT in public (orphaned auth users)
-- These users will fail to signin or access protected routes
SELECT
  au.id,
  au.email,
  au.email_confirmed_at,
  au.created_at,
  'MISSING IN PUBLIC.USERS - NEEDS FIXING' as issue
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL
ORDER BY au.created_at DESC;

-- 2.3: Find users in public but NOT in auth (orphaned public users)
-- These are old users or data integrity issues
SELECT
  pu.id,
  pu.email,
  pu.role,
  pu.created_at,
  'MISSING IN AUTH.USERS - LEGACY DATA?' as issue
FROM public.users pu
LEFT JOIN auth.users au ON pu.id = au.id
WHERE au.id IS NULL
ORDER BY pu.created_at DESC;

-- 2.4: Check admin users specifically
SELECT
  u.id,
  u.email,
  u.full_name,
  u.role,
  u.tier,
  au.email_confirmed_at,
  au.last_sign_in_at
FROM public.users u
JOIN auth.users au ON u.id = au.id
WHERE u.role = 'admin'
ORDER BY u.created_at DESC;


-- ============================================================
-- SECTION 3: Invite Tokens - Check Signup Invites
-- ============================================================
-- NOTE: If these queries fail, the invite_tokens table doesn't exist
-- Run the fix-auth-issues.sql file to create it

-- 3.1: Check if invite_tokens table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name = 'invite_tokens'
) as invite_tokens_exists;

-- 3.2: View recent invite tokens (only if table exists)
SELECT
  token,
  email,
  full_name,
  tier,
  expires_at,
  used_at,
  created_by,
  created_at,
  CASE
    WHEN used_at IS NOT NULL THEN 'USED'
    WHEN expires_at < NOW() THEN 'EXPIRED'
    ELSE 'ACTIVE'
  END as status
FROM invite_tokens
ORDER BY created_at DESC
LIMIT 20;

-- 3.3: Find expired but unused tokens
SELECT
  email,
  tier,
  expires_at,
  created_at,
  NOW() - expires_at as expired_ago
FROM invite_tokens
WHERE used_at IS NULL
  AND expires_at < NOW()
ORDER BY created_at DESC;

-- 3.4: Find active (unused and not expired) tokens
SELECT
  email,
  tier,
  expires_at,
  created_at
FROM invite_tokens
WHERE used_at IS NULL
  AND expires_at > NOW()
ORDER BY created_at DESC;


-- ============================================================
-- SECTION 4: Triggers - Verify Auto-User-Creation is Working
-- ============================================================

-- 4.1: Verify the trigger function exists
SELECT
  p.proname as function_name,
  pg_get_functiondef(p.oid) as definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND p.proname IN ('handle_new_user', 'handle_user_email_verified');

-- 4.2: Check triggers on auth.users table
SELECT
  tgname as trigger_name,
  tgrelid::regclass as table_name,
  proname as function_name,
  CASE tgenabled
    WHEN 'O' THEN 'ENABLED'
    WHEN 'D' THEN 'DISABLED'
    ELSE 'UNKNOWN'
  END as status
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE tgrelid = 'auth.users'::regclass;


-- ============================================================
-- SECTION 5: Comprehensive Diagnostic - Overall Health Check
-- ============================================================

-- 5.1: Complete user status check (shows everything)
SELECT
  COALESCE(au.email, pu.email) as email,
  au.email_confirmed_at IS NOT NULL as auth_email_confirmed,
  pu.email_verified as public_email_verified,
  pu.role,
  pu.tier,
  pu.payment_status,
  au.created_at as auth_created,
  pu.created_at as public_created,
  au.last_sign_in_at,
  CASE
    WHEN pu.id IS NULL THEN '❌ CRITICAL: Missing public.users record'
    WHEN au.id IS NULL THEN '⚠️ WARNING: Missing auth.users record (legacy?)'
    WHEN au.email_confirmed_at IS NULL THEN '📧 Email not confirmed'
    WHEN pu.role IS NULL THEN '⚠️ No role assigned'
    WHEN pu.role = 'admin' AND au.email_confirmed_at IS NOT NULL THEN '✅ Admin - Confirmed'
    WHEN pu.role = 'student' AND au.email_confirmed_at IS NOT NULL THEN '✅ Student - Confirmed'
    ELSE '✅ OK'
  END as status
FROM auth.users au
FULL OUTER JOIN public.users pu ON au.id = pu.id
ORDER BY
  CASE
    WHEN pu.id IS NULL THEN 1  -- Critical issues first
    WHEN au.id IS NULL THEN 2
    WHEN au.email_confirmed_at IS NULL THEN 3
    ELSE 4
  END,
  COALESCE(au.created_at, pu.created_at) DESC NULLS LAST;


-- ============================================================
-- SECTION 6: Quick Counts - Summary Statistics
-- ============================================================

-- 6.1: Count users by status
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
  'Confirmed emails' as metric,
  COUNT(*) as count
FROM auth.users
WHERE email_confirmed_at IS NOT NULL
UNION ALL
SELECT
  'Unconfirmed emails' as metric,
  COUNT(*) as count
FROM auth.users
WHERE email_confirmed_at IS NULL
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
-- SECTION 7: Fix Orphaned Users (RUN ONLY IF NEEDED)
-- ============================================================
-- IMPORTANT: Only run this if Section 2.2 or 2.3 found orphaned users
-- Review the results first before running these fixes

-- 7.1: Create public.users records for orphaned auth users
-- UNCOMMENT AND RUN ONLY IF YOU FOUND ORPHANED AUTH USERS IN SECTION 2.2
/*
INSERT INTO public.users (
  id,
  email,
  full_name,
  email_verified,
  role,
  tier,
  payment_status,
  created_at,
  updated_at
)
SELECT
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', ''),
  au.email_confirmed_at IS NOT NULL,
  'student',
  'basic',
  'pending',
  au.created_at,
  NOW()
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL
ON CONFLICT (id) DO NOTHING;
*/

-- 7.2: Delete orphaned public.users (legacy data cleanup)
-- UNCOMMENT AND RUN ONLY IF YOU FOUND ORPHANED PUBLIC USERS IN SECTION 2.3
-- AND you're sure they're legacy/test data
/*
DELETE FROM public.users
WHERE id IN (
  SELECT pu.id
  FROM public.users pu
  LEFT JOIN auth.users au ON pu.id = au.id
  WHERE au.id IS NULL
);
*/


-- ============================================================
-- HOW TO USE THESE QUERIES:
-- ============================================================
--
-- START WITH SECTIONS 1-3: Basic data inspection
-- - Section 1: Check your auth users
-- - Section 2: Check your public users and find mismatches
-- - Section 3: Check invite tokens (may not exist yet)
--
-- THEN RUN SECTION 4: Verify triggers are working
-- - If triggers are disabled or missing, user creation will fail
--
-- NEXT RUN SECTION 5: Comprehensive health check
-- - This shows everything in one view
-- - Look for any ❌ or ⚠️ warnings
--
-- FINALLY SECTION 6: Get summary statistics
-- - Quick overview of your user base
--
-- SECTION 7: Only if you found issues in Section 2.2 or 2.3
-- - Review the orphaned users first
-- - Uncomment and run fixes if needed
--
-- ============================================================
