-- Option: Make ellis.mail@protonmail.com the admin account instead
UPDATE public.profiles 
SET role = 'ADMIN'
WHERE id = '64ad2b22-d3fe-4159-9e55-75bd2ac11f61';

-- And demote the other one to avoid confusion
UPDATE public.profiles 
SET role = 'STUDENT'
WHERE id = 'b7eca456-9ba8-4279-ab8c-4d46534c1f00';

-- Verify the change
SELECT 'Updated accounts:' as info, id, name, role
FROM public.profiles
WHERE name = 'Matthew Ellis'
ORDER BY created_at;