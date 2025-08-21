-- Simple schema export for Supabase
-- Run this in your current Supabase SQL Editor

-- Get all table structures
SELECT 
  'CREATE TABLE public.' || table_name || ' (' || 
  string_agg(
    column_name || ' ' || 
    CASE 
      WHEN data_type = 'character varying' THEN 'varchar(' || character_maximum_length || ')'
      WHEN data_type = 'character' THEN 'char(' || character_maximum_length || ')'
      WHEN data_type = 'numeric' THEN 'numeric(' || numeric_precision || ',' || numeric_scale || ')'
      WHEN data_type = 'USER-DEFINED' THEN udt_name
      ELSE data_type 
    END ||
    CASE 
      WHEN is_nullable = 'NO' THEN ' NOT NULL'
      ELSE ''
    END ||
    CASE 
      WHEN column_default IS NOT NULL THEN ' DEFAULT ' || column_default
      ELSE ''
    END,
    ', '
  ) || ');' AS create_statement
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name NOT LIKE 'pg_%'
  AND table_name NOT LIKE 'sql_%'
GROUP BY table_name
ORDER BY table_name;

-- Get primary keys
SELECT 
  'ALTER TABLE public.' || tc.table_name || 
  ' ADD CONSTRAINT ' || tc.constraint_name || 
  ' PRIMARY KEY (' || string_agg(kcu.column_name, ', ') || ');' AS pk_statement
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.constraint_type = 'PRIMARY KEY'
  AND tc.table_schema = 'public'
GROUP BY tc.table_name, tc.constraint_name
ORDER BY tc.table_name;