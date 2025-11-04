-- ============================================================================
-- DELETE SPECIFIC TEST USERS
-- ============================================================================
-- Deletes the following test users from ALL tables:
-- 1. mattthecat21@gmail.com
-- 2. lagattita22@gmail.com
-- 3. marimer93@gmail.com
-- 4. mattjellis1@gmail.com
-- 5. testuser123@example.com
-- ============================================================================

-- STEP 1: Show users and their data that will be deleted (DRY RUN)
SELECT
  COALESCE(au.email, pu.email, l.email) as email_to_delete,
  CASE WHEN au.id IS NOT NULL THEN '✅' ELSE '❌' END as in_auth_users,
  CASE WHEN pu.id IS NOT NULL THEN '✅' ELSE '❌' END as in_public_users,
  CASE WHEN l.id IS NOT NULL THEN '✅' ELSE '❌' END as in_leads,
  pu.payment_status,
  pu.tier,
  pu.role,
  (SELECT COUNT(*) FROM public.chat_messages WHERE user_id = pu.id) as chat_messages_count,
  (SELECT COUNT(*) FROM public.chat_room_members WHERE user_id = pu.id) as chat_rooms_count
FROM (
  VALUES
    ('mattthecat21@gmail.com'),
    ('lagattita22@gmail.com'),
    ('marimer93@gmail.com'),
    ('mattjellis1@gmail.com'),
    ('testuser123@example.com')
) AS emails_to_delete(email)
LEFT JOIN auth.users au ON au.email = emails_to_delete.email
LEFT JOIN public.users pu ON pu.email = emails_to_delete.email
LEFT JOIN public.leads l ON l.email = emails_to_delete.email;

-- STEP 2: Delete chat messages from test users
-- Must delete these FIRST due to foreign key constraints
DELETE FROM public.chat_messages
WHERE user_id IN (
  SELECT id FROM public.users
  WHERE email IN (
    'mattthecat21@gmail.com',
    'lagattita22@gmail.com',
    'marimer93@gmail.com',
    'mattjellis1@gmail.com',
    'testuser123@example.com'
  )
);

-- STEP 3: Delete chat room memberships
DELETE FROM public.chat_room_members
WHERE user_id IN (
  SELECT id FROM public.users
  WHERE email IN (
    'mattthecat21@gmail.com',
    'lagattita22@gmail.com',
    'marimer93@gmail.com',
    'mattjellis1@gmail.com',
    'testuser123@example.com'
  )
);

-- STEP 4: Delete any other user-related data (student_points, etc.)
DELETE FROM public.student_points
WHERE user_id IN (
  SELECT id FROM public.users
  WHERE email IN (
    'mattthecat21@gmail.com',
    'lagattita22@gmail.com',
    'marimer93@gmail.com',
    'mattjellis1@gmail.com',
    'testuser123@example.com'
  )
);

-- STEP 5: Delete from auth.users
-- This will delete the auth user accounts
DELETE FROM auth.users
WHERE email IN (
  'mattthecat21@gmail.com',
  'lagattita22@gmail.com',
  'marimer93@gmail.com',
  'mattjellis1@gmail.com',
  'testuser123@example.com'
);

-- STEP 6: Delete from public.users
-- This will delete the user profiles
DELETE FROM public.users
WHERE email IN (
  'mattthecat21@gmail.com',
  'lagattita22@gmail.com',
  'marimer93@gmail.com',
  'mattjellis1@gmail.com',
  'testuser123@example.com'
);

-- STEP 7: Delete from public.leads
-- This will delete the leads
DELETE FROM public.leads
WHERE email IN (
  'mattthecat21@gmail.com',
  'lagattita22@gmail.com',
  'marimer93@gmail.com',
  'mattjellis1@gmail.com',
  'testuser123@example.com'
);

-- STEP 8: Verify deletion - should return 0 rows
SELECT
  email,
  'Still exists in auth.users!' as warning
FROM auth.users
WHERE email IN (
  'mattthecat21@gmail.com',
  'lagattita22@gmail.com',
  'marimer93@gmail.com',
  'mattjellis1@gmail.com',
  'testuser123@example.com'
)
UNION ALL
SELECT
  email,
  'Still exists in public.users!' as warning
FROM public.users
WHERE email IN (
  'mattthecat21@gmail.com',
  'lagattita22@gmail.com',
  'marimer93@gmail.com',
  'mattjellis1@gmail.com',
  'testuser123@example.com'
)
UNION ALL
SELECT
  email,
  'Still exists in public.leads!' as warning
FROM public.leads
WHERE email IN (
  'mattthecat21@gmail.com',
  'lagattita22@gmail.com',
  'marimer93@gmail.com',
  'mattjellis1@gmail.com',
  'testuser123@example.com'
);

-- STEP 9: Show counts after deletion
SELECT
  'auth.users' as table_name,
  COUNT(*) as remaining_count
FROM auth.users
UNION ALL
SELECT
  'public.users' as table_name,
  COUNT(*) as remaining_count
FROM public.users
UNION ALL
SELECT
  'public.leads' as table_name,
  COUNT(*) as remaining_count
FROM public.leads;
