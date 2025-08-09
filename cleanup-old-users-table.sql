-- Clean up the old users table since we're now using Supabase auth
-- First check what tables reference it (if any)
SELECT 'Tables referencing users:' as info, 
       table_name, column_name, constraint_name
FROM information_schema.key_column_usage 
WHERE referenced_table_name = 'users';

-- Drop the old users table (CASCADE will handle any dependencies)
DROP TABLE IF EXISTS public.users CASCADE;

-- Verify it's gone
SELECT 'Remaining tables:' as info, table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;