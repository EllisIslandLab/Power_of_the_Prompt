-- Fix accounts that should have initial balances from invites
-- This updates client_accounts with the initial_balance from their invite_token

-- First, let's see what we're working with
DO $$
BEGIN
  RAISE NOTICE 'Checking for accounts needing balance updates...';
END $$;

-- Update accounts where:
-- - Balance is 0 or NULL
-- - There's a matching invite with initial_balance > 0
UPDATE client_accounts ca
SET account_balance = COALESCE(it.initial_balance::NUMERIC(10,2), 0.00),
    updated_at = NOW()
FROM auth.users u
JOIN invite_tokens it ON LOWER(u.email) = LOWER(it.email)
WHERE ca.user_id = u.id
  AND COALESCE(ca.account_balance, 0) = 0
  AND it.initial_balance IS NOT NULL
  AND it.initial_balance > 0;

-- Log what was updated
DO $$
DECLARE
  updated_count INTEGER;
  affected_emails TEXT;
BEGIN
  GET DIAGNOSTICS updated_count = ROW_COUNT;

  -- Get list of updated emails for logging
  SELECT string_agg(u.email, ', ')
  INTO affected_emails
  FROM client_accounts ca
  JOIN auth.users u ON ca.user_id = u.id
  JOIN invite_tokens it ON LOWER(u.email) = LOWER(it.email)
  WHERE COALESCE(ca.account_balance, 0) != 0
    AND it.initial_balance > 0;

  RAISE NOTICE 'Updated % accounts with missing initial balances', updated_count;
  IF affected_emails IS NOT NULL THEN
    RAISE NOTICE 'Affected emails: %', affected_emails;
  END IF;
END $$;
