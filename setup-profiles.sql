-- Setup profiles for existing users
-- Run this in Supabase SQL Editor

-- Add admin profile (Matthew Ellis - Admin)
INSERT INTO public.profiles (id, name, role) 
VALUES ('cmdryf18d0000ud731gcnkoew', 'Matthew Ellis', 'ADMIN');

-- Add test student profile (Matthew Ellis - Student)
INSERT INTO public.profiles (id, name, role) 
VALUES ('cmdpem3dz0002udxlqbd9dqio', 'Matthew Ellis', 'STUDENT');

-- Verify the profiles were created
SELECT 
    p.id,
    p.name,
    p.role,
    au.email,
    p.created_at
FROM public.profiles p
JOIN auth.users au ON p.id = au.id
ORDER BY p.role;