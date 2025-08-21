-- Export schema for Web Launch Academy
-- Run this in your current Supabase SQL Editor

-- Get all table definitions
SELECT 
  'CREATE TABLE ' || schemaname||'.'||tablename||' (' || 
  array_to_string(
    array_agg(
      column_name||' '||type||''||not_null||default_val
    ), ', '
  ) || ');' AS create_statement
FROM (
  SELECT 
    schemaname, 
    tablename, 
    attname AS column_name, 
    pg_catalog.format_type(atttypid, atttypmod) AS type,
    CASE WHEN attnotnull = 't' THEN ' NOT NULL' ELSE '' END AS not_null,
    CASE WHEN pg_get_expr(adbin, adrelid) IS NOT NULL 
         THEN ' DEFAULT ' || pg_get_expr(adbin, adrelid) 
         ELSE '' END AS default_val
  FROM pg_attribute 
  JOIN pg_class ON pg_class.oid = attrelid 
  JOIN pg_namespace ON pg_namespace.oid = relnamespace 
  LEFT JOIN pg_attrdef ON adrelid = attrelid AND adnum = attnum
  WHERE relkind='r' AND nspname='public' AND attnum > 0 AND attname NOT LIKE '%pg_%'
  ORDER BY attnum
) AS tabledefinitions 
WHERE schemaname = 'public'
GROUP BY schemaname, tablename
ORDER BY tablename;

-- Get all indexes (excluding primary keys which are auto-created)
SELECT 
  'CREATE ' || 
  CASE WHEN indisunique THEN 'UNIQUE ' ELSE '' END ||
  'INDEX ' || indexname || ' ON ' || schemaname||'.'||tablename ||
  ' (' || array_to_string(array_agg(attname), ', ') || ');' AS index_statement
FROM pg_indexes 
JOIN pg_class ON pg_class.relname = indexname
JOIN pg_index ON pg_index.indexrelid = pg_class.oid
JOIN pg_class t ON t.oid = pg_index.indrelid
JOIN pg_namespace ON pg_namespace.oid = t.relnamespace
JOIN pg_attribute ON pg_attribute.attrelid = t.oid AND pg_attribute.attnum = ANY(pg_index.indkey)
WHERE schemaname = 'public' AND indexname NOT LIKE '%pkey%'
GROUP BY schemaname, tablename, indexname, indisunique
ORDER BY tablename, indexname;