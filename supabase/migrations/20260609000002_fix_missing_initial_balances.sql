-- Fix accounts that should have initial balances from invites
-- This updates client_accounts with the initial_balance from their invite_token

UPDATE client_accounts ca
SET account_balance = COALESCE(it.initial_balance::NUMERIC(10,2), 0.00),
    updated_at = NOW()
FROM auth.users u
LEFT JOIN invite_tokens it ON LOWER(u.email) = LOWER(it.email)
WHERE ca.user_id = u.id
  AND ca.account_balance = 0
  AND it.initial_balance > 0
  AND it.used_at IS NOT NULL;

-- Log what was updated
DO $$
DECLARE
  updated_count INTEGER;
BEGIN
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RAISE NOTICE 'Updated % accounts with missing initial balances', updated_count;
END $$;
