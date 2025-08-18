-- Check what users exist in auth.users
SELECT id, email, email_confirmed_at, created_at 
FROM auth.users 
ORDER BY created_at DESC;

-- Check what's currently in our new tables
SELECT 'admin_users' as table_name, count(*) as count FROM admin_users
UNION ALL
SELECT 'students' as table_name, count(*) as count FROM students;