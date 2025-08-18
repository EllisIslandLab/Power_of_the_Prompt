-- See what users exist
SELECT 
  au.id as auth_id,
  au.email,
  au.created_at,
  'admin' as type
FROM auth.users au 
JOIN admin_users adu ON au.id = adu.user_id
UNION ALL
SELECT 
  au.id as auth_id,
  au.email,
  au.created_at,
  'student' as type  
FROM auth.users au 
JOIN students s ON au.id = s.user_id
ORDER BY created_at;

-- If you want to delete a test user, uncomment and modify:
-- DELETE FROM admin_users WHERE email = 'test@example.com';
-- DELETE FROM auth.users WHERE email = 'test@example.com';