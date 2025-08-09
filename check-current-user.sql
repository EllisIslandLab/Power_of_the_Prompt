-- Check which user you're currently logged in as
SELECT 'Current auth user:' as info, auth.uid() as user_id;

-- Check the current user's profile
SELECT 'Current profile:' as info, id, name, role 
FROM public.profiles 
WHERE id = auth.uid();

-- Check both Matthew Ellis accounts to see which is which
SELECT 'All Matthew Ellis profiles:' as info, id, name, role, created_at
FROM public.profiles 
WHERE name = 'Matthew Ellis'
ORDER BY created_at;