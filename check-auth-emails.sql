-- Check which email addresses correspond to which user IDs
-- This will help identify which email to use for admin login

SELECT 'Auth users:' as info, 
       u.id, 
       u.email, 
       u.created_at,
       p.role
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.id IN ('b7eca456-9ba8-4279-ab8c-4d46534c1f00', '64ad2b22-d3fe-4159-9e55-75bd2ac11f61')
ORDER BY u.created_at;