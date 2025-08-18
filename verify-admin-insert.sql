-- Check if the admin record was actually created
SELECT * FROM admin_users WHERE user_id = 'c91e87c1-4293-40b2-aae5-8b4e91274356';

-- Check RLS policies on admin_users table
SELECT * FROM pg_policies WHERE tablename = 'admin_users';

-- Test if we can query admin_users at all
SELECT count(*) FROM admin_users;