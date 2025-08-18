-- Temporarily disable RLS on admin_users and students tables to fix authentication
ALTER TABLE admin_users DISABLE ROW LEVEL SECURITY;
ALTER TABLE students DISABLE ROW LEVEL SECURITY;

-- Verify your admin record exists
SELECT * FROM admin_users WHERE user_id = 'c91e87c1-4293-40b2-aae5-8b4e91274356';