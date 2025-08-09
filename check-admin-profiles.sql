-- Check all admin profiles to see what happened
SELECT 'All admin profiles:' as info, id, name, role, created_at
FROM public.profiles 
WHERE role = 'ADMIN'
ORDER BY created_at;

-- Check all profiles to see the full picture
SELECT 'All profiles:' as info, id, name, role, created_at
FROM public.profiles 
ORDER BY created_at;