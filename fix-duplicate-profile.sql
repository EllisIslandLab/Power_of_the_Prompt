-- Remove the duplicate student profile for mattjellis1@gmail.com since they should only be admin
DELETE FROM students WHERE user_id = 'c91e87c1-4293-40b2-aae5-8b4e91274356';

-- Verify the cleanup
SELECT 'admin_users' as table_name, email, user_id FROM admin_users
UNION ALL  
SELECT 'students' as table_name, email, user_id FROM students
ORDER BY table_name, email;