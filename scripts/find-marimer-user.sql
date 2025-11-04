-- ============================================================================
-- FIND "MARIMER" USER
-- ============================================================================
-- Search for user with "marimer" in their email
-- ============================================================================

-- Search in auth.users
SELECT
  'auth.users' as found_in,
  id,
  email,
  created_at
FROM auth.users
WHERE email ILIKE '%marimer%';

-- Search in public.users
SELECT
  'public.users' as found_in,
  id,
  email,
  full_name,
  created_at
FROM public.users
WHERE email ILIKE '%marimer%'
   OR full_name ILIKE '%marimer%';

-- Search in public.leads
SELECT
  'public.leads' as found_in,
  id,
  email,
  name,
  first_name,
  last_name,
  created_at
FROM public.leads
WHERE email ILIKE '%marimer%'
   OR name ILIKE '%marimer%'
   OR first_name ILIKE '%marimer%'
   OR last_name ILIKE '%marimer%';

-- Search with broader pattern (first 3 chars)
SELECT
  'Possible matches (mar*)' as search_type,
  email
FROM (
  SELECT email FROM auth.users WHERE email ILIKE 'mar%'
  UNION
  SELECT email FROM public.users WHERE email ILIKE 'mar%'
  UNION
  SELECT email FROM public.leads WHERE email ILIKE 'mar%'
) AS matches;
