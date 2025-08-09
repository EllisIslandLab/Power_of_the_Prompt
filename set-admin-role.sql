-- Update the new user's profile to be an ADMIN
-- Replace 'YOUR-NEW-USER-ID' with the actual user ID from Supabase Dashboard

UPDATE public.profiles 
SET role = 'ADMIN', name = 'Matthew Ellis'
WHERE id = 'b7eca456-9ba8-4279-ab8c-4d46534c1f00';

-- Verify the admin profile was created
SELECT 'New admin profile:' as info, id, name, role 
FROM public.profiles 
WHERE role = 'ADMIN';