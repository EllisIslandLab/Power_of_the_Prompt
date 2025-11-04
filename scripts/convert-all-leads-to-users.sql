-- ============================================================================
-- CHECK LEAD TO USER CONVERSION STATUS
-- ============================================================================
-- This script shows the status of leads and users
-- Use convert-leads-to-auth-users.ts to actually convert leads to auth users
-- ============================================================================

-- Step 1: Show current counts
SELECT
  'Leads' as table_name,
  COUNT(*) as total_count,
  COUNT(CASE WHEN status = 'converted' THEN 1 END) as converted_count,
  COUNT(CASE WHEN status != 'converted' THEN 1 END) as unconverted_count
FROM leads
UNION ALL
SELECT
  'Users' as table_name,
  COUNT(*) as total_count,
  NULL as converted_count,
  NULL as unconverted_count
FROM users
UNION ALL
SELECT
  'Users (paid)' as table_name,
  COUNT(*) as total_count,
  NULL as converted_count,
  NULL as unconverted_count
FROM users
WHERE payment_status = 'paid';

-- Step 2: Show which leads need conversion
SELECT
  l.email,
  l.name,
  l.status,
  l.source,
  CASE
    WHEN u.email IS NOT NULL THEN 'User exists in public.users'
    ELSE 'Needs conversion'
  END as public_users_status,
  u.payment_status,
  u.tier
FROM leads l
LEFT JOIN users u ON l.email = u.email
WHERE l.status != 'converted'
ORDER BY l.created_at DESC;

-- Step 3: Show converted leads with user details
SELECT
  l.email,
  l.name as lead_name,
  l.status as lead_status,
  l.converted_at,
  u.full_name as user_name,
  u.payment_status,
  u.tier,
  u.role
FROM leads l
LEFT JOIN users u ON l.email = u.email
WHERE l.status = 'converted'
ORDER BY l.converted_at DESC
LIMIT 20;

-- Step 4: Show any inconsistencies (leads marked converted but no user)
SELECT
  l.email,
  l.name,
  l.status,
  'WARNING: Marked as converted but no user found' as note
FROM leads l
LEFT JOIN users u ON l.email = u.email
WHERE l.status = 'converted'
  AND u.email IS NULL;

-- Step 5: Show users that came from leads (vs other sources)
SELECT
  COUNT(*) as users_from_leads
FROM users u
WHERE EXISTS (
  SELECT 1 FROM leads l
  WHERE l.email = u.email
  AND l.status = 'converted'
);
