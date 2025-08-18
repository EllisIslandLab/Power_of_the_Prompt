-- Quick test to see what's in students table
SELECT * FROM students WHERE user_id = 'c91e87c1-4293-40b2-aae5-8b4e91274356';

-- Also check what's in admin_users
SELECT * FROM admin_users;

-- Check if RLS is the issue
SELECT current_user, auth.uid();