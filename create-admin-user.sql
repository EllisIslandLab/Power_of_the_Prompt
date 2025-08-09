-- Check existing auth users
SELECT 'Existing auth users:' as info, email, created_at 
FROM auth.users 
ORDER BY created_at DESC;

-- After you create the user via Supabase Dashboard, run this to make them admin:
-- UPDATE public.profiles SET role = 'ADMIN' WHERE id = 'paste-user-id-here';