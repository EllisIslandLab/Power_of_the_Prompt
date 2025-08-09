-- Check if there's an old users table in public schema
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%user%';

-- Check what's in the old users table if it exists
SELECT 'Old users table data:' as info, * 
FROM public.users 
LIMIT 5;