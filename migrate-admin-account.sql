-- Step 1: Check what's in the old users table
SELECT 'Old admin account:' as info, email, role 
FROM public.users 
WHERE role = 'ADMIN';

-- Step 2: After you create the new auth user via Supabase Dashboard,
-- you'll update their profile like this:
-- UPDATE public.profiles 
-- SET role = 'ADMIN', name = 'Matthew Ellis'
-- WHERE id = 'new-supabase-user-id-here';

-- Step 3: After migrating, we can safely drop the old users table
-- DROP TABLE IF EXISTS public.users CASCADE;