-- ============================================================================
-- VIEW AND CLEANUP TEST USERS
-- ============================================================================
-- This script helps you view all users and clean up test accounts
-- ============================================================================

-- ============================================================================
-- PART 1: VIEW ALL USERS ACROSS ALL TABLES
-- ============================================================================

-- Show all users with their presence in each table
SELECT
  COALESCE(au.email, pu.email, l.email) as email,
  COALESCE(pu.full_name, l.name, au.raw_user_meta_data->>'full_name') as name,
  CASE WHEN au.id IS NOT NULL THEN '✅' ELSE '❌' END as in_auth_users,
  CASE WHEN pu.id IS NOT NULL THEN '✅' ELSE '❌' END as in_public_users,
  CASE WHEN l.id IS NOT NULL THEN '✅' ELSE '❌' END as in_leads,
  pu.payment_status,
  pu.tier,
  pu.role,
  l.status as lead_status,
  au.created_at as auth_created,
  pu.created_at as user_created,
  l.created_at as lead_created
FROM auth.users au
FULL OUTER JOIN public.users pu ON au.id = pu.id
FULL OUTER JOIN public.leads l ON COALESCE(au.email, pu.email) = l.email
ORDER BY COALESCE(au.created_at, pu.created_at, l.created_at) DESC;

-- ============================================================================
-- PART 2: DETAILED VIEW OF EACH TABLE
-- ============================================================================

-- Auth users
SELECT
  'AUTH.USERS' as table_name,
  id,
  email,
  email_confirmed_at,
  raw_user_meta_data->>'full_name' as full_name,
  created_at
FROM auth.users
ORDER BY created_at DESC;

-- Public users
SELECT
  'PUBLIC.USERS' as table_name,
  id,
  email,
  full_name,
  role,
  tier,
  payment_status,
  email_verified,
  created_at
FROM public.users
ORDER BY created_at DESC;

-- Leads
SELECT
  'PUBLIC.LEADS' as table_name,
  id,
  email,
  name,
  first_name,
  last_name,
  status,
  wants_ownership,
  created_at
FROM public.leads
ORDER BY created_at DESC;

-- ============================================================================
-- PART 3: DELETE SPECIFIC USERS (SAFE METHOD)
-- ============================================================================
-- IMPORTANT: Replace 'user@example.com' with the actual email you want to delete
-- Run each DELETE statement ONE AT A TIME to be safe
-- ============================================================================

-- Template to delete a specific user by email:
-- Step 1: Delete from auth.users (this will CASCADE to public.users if FK is set)
-- Step 2: Delete from public.leads
-- Step 3: Delete from public.users (if not already deleted by cascade)

-- EXAMPLE: Delete test@example.com (UNCOMMENT AND MODIFY TO USE)
/*
-- Delete from auth.users
DELETE FROM auth.users
WHERE email = 'test@example.com';

-- Delete from public.leads
DELETE FROM public.leads
WHERE email = 'test@example.com';

-- Delete from public.users (if still exists)
DELETE FROM public.users
WHERE email = 'test@example.com';
*/

-- ============================================================================
-- PART 4: BULK DELETE MULTIPLE TEST USERS
-- ============================================================================
-- CAREFUL! This will delete ALL users matching the emails in the list
-- Uncomment and modify the email list to use
-- ============================================================================

/*
-- Create a temporary table with emails to delete
CREATE TEMP TABLE emails_to_delete (email TEXT);

INSERT INTO emails_to_delete (email) VALUES
('test1@example.com'),
('test2@example.com'),
('test3@example.com'),
('test4@example.com'),
('test5@example.com');

-- Show what will be deleted (DRY RUN - CHECK THIS FIRST!)
SELECT
  COALESCE(au.email, pu.email, l.email) as email_to_delete,
  CASE WHEN au.id IS NOT NULL THEN '✅' ELSE '❌' END as in_auth_users,
  CASE WHEN pu.id IS NOT NULL THEN '✅' ELSE '❌' END as in_public_users,
  CASE WHEN l.id IS NOT NULL THEN '✅' ELSE '❌' END as in_leads
FROM emails_to_delete etd
LEFT JOIN auth.users au ON au.email = etd.email
LEFT JOIN public.users pu ON pu.email = etd.email
LEFT JOIN public.leads l ON l.email = etd.email;

-- If the dry run looks good, uncomment below to actually delete:

-- Delete from auth.users
-- DELETE FROM auth.users
-- WHERE email IN (SELECT email FROM emails_to_delete);

-- Delete from public.leads
-- DELETE FROM public.leads
-- WHERE email IN (SELECT email FROM emails_to_delete);

-- Delete from public.users
-- DELETE FROM public.users
-- WHERE email IN (SELECT email FROM emails_to_delete);

-- Clean up temp table
-- DROP TABLE emails_to_delete;
*/

-- ============================================================================
-- PART 5: VERIFY DELETION
-- ============================================================================
-- Run this after deletion to confirm users are gone

SELECT
  COUNT(*) as total_auth_users
FROM auth.users;

SELECT
  COUNT(*) as total_public_users
FROM public.users;

SELECT
  COUNT(*) as total_leads
FROM public.leads;
