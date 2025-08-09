-- Reset "Tester Number2" back to STUDENT role
UPDATE public.profiles 
SET role = 'STUDENT'
WHERE id = '68f0dfa5-845d-4bd0-b97b-7447a62ac990';

-- Verify only your account is ADMIN
SELECT 'Final admin check:' as info, id, name, role
FROM public.profiles 
WHERE role = 'ADMIN';