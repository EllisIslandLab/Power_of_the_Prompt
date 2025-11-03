-- Diagnostic Script: Purchase Flow Issues
-- Run this in Supabase SQL Editor to diagnose why users aren't being created after purchase

-- 1. Check if the trigger exists
SELECT
  t.tgname as trigger_name,
  p.proname as function_name,
  t.tgenabled as enabled
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE t.tgname IN ('on_auth_user_created', 'on_auth_user_email_verified')
ORDER BY t.tgname;

-- 2. Check recent auth users (last 24 hours)
SELECT
  id,
  email,
  email_confirmed_at,
  created_at,
  raw_user_meta_data->>'full_name' as full_name
FROM auth.users
WHERE created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;

-- 3. Check corresponding public.users records
SELECT
  u.id,
  u.email,
  u.full_name,
  u.role,
  u.tier,
  u.payment_status,
  u.email_verified,
  u.created_at
FROM public.users u
WHERE u.created_at > NOW() - INTERVAL '24 hours'
ORDER BY u.created_at DESC;

-- 4. Find auth users WITHOUT public.users records (THE PROBLEM!)
SELECT
  a.id,
  a.email,
  a.created_at as auth_created_at,
  'MISSING FROM public.users' as status
FROM auth.users a
LEFT JOIN public.users u ON a.id = u.id
WHERE u.id IS NULL
  AND a.created_at > NOW() - INTERVAL '7 days'
ORDER BY a.created_at DESC;

-- 5. Check recent purchases (if any were recorded)
SELECT
  p.id,
  p.user_id,
  p.product_id,
  p.amount_paid,
  p.status,
  p.access_granted,
  p.purchased_at,
  pr.name as product_name
FROM purchases p
LEFT JOIN products pr ON p.product_id = pr.id
WHERE p.purchased_at > NOW() - INTERVAL '24 hours'
ORDER BY p.purchased_at DESC;

-- 6. Check leads who haven't been converted yet
SELECT
  email,
  name,
  status,
  signup_date
FROM leads
WHERE status = 'waitlist'
  AND signup_date > NOW() - INTERVAL '24 hours'
ORDER BY signup_date DESC;

-- ============================================================================
-- FIX: If trigger is missing or disabled, run this:
-- ============================================================================

-- Re-create the trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
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
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    CASE WHEN NEW.email_confirmed_at IS NOT NULL THEN true ELSE false END,
    'student',
    'basic',
    'pending',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, users.full_name),
    email_verified = EXCLUDED.email_verified,
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- MANUAL FIX: Create public.users record for orphaned auth users
-- ============================================================================

-- Use this if you find auth users without public.users records (from query #4 above)
-- Replace the email with the actual user's email from your test purchase

-- Example:
-- INSERT INTO public.users (
--   id,
--   email,
--   full_name,
--   email_verified,
--   role,
--   tier,
--   payment_status
-- )
-- SELECT
--   id,
--   email,
--   COALESCE(raw_user_meta_data->>'full_name', '') as full_name,
--   CASE WHEN email_confirmed_at IS NOT NULL THEN true ELSE false END as email_verified,
--   'student' as role,
--   'basic' as tier,
--   'paid' as payment_status  -- Set to 'paid' since they purchased
-- FROM auth.users
-- WHERE email = 'your-test-email@example.com';
