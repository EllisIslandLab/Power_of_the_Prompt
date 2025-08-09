-- Delete the problematic Tester Number2 account
-- This will cascade and remove it from auth.users as well due to foreign key constraints

DELETE FROM public.profiles 
WHERE id = '68f0dfa5-845d-4bd0-b97b-7447a62ac990';

-- Verify the account is gone and only your admin account remains
SELECT 'Remaining profiles:' as info, id, name, role, created_at
FROM public.profiles 
ORDER BY created_at;