-- ============================================
-- Create add_funds RPC function for Stripe webhook
-- ============================================

CREATE OR REPLACE FUNCTION public.add_funds(
  account_id UUID,
  amount NUMERIC
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Add funds to account balance
  UPDATE client_accounts
  SET
    account_balance = account_balance + amount,
    total_lifetime_spent = total_lifetime_spent + amount,
    updated_at = now()
  WHERE id = account_id;

  -- If no rows updated, raise exception
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Client account not found: %', account_id;
  END IF;
END;
$$;

-- Grant execute to service role (used by webhook)
GRANT EXECUTE ON FUNCTION public.add_funds(UUID, NUMERIC) TO service_role;

COMMENT ON FUNCTION public.add_funds IS 'Add funds to client account balance - called by Stripe webhook';
