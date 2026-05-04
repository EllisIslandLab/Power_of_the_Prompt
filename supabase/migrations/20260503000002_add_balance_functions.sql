-- RPC function to safely decrement account balance
CREATE OR REPLACE FUNCTION decrement_balance(
  account_id UUID,
  amount NUMERIC
) RETURNS NUMERIC AS $$
DECLARE
  new_balance NUMERIC;
BEGIN
  UPDATE client_accounts
  SET account_balance = account_balance - amount
  WHERE id = account_id
  RETURNING account_balance INTO new_balance;

  RETURN new_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC function to add funds to account balance
CREATE OR REPLACE FUNCTION add_funds(
  account_id UUID,
  amount NUMERIC
) RETURNS NUMERIC AS $$
DECLARE
  new_balance NUMERIC;
BEGIN
  UPDATE client_accounts
  SET account_balance = account_balance + amount
  WHERE id = account_id
  RETURNING account_balance INTO new_balance;

  RETURN new_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC function to hold balance for pending work
CREATE OR REPLACE FUNCTION hold_balance(
  account_id UUID,
  amount NUMERIC
) RETURNS BOOLEAN AS $$
BEGIN
  UPDATE client_accounts
  SET
    account_balance = account_balance - amount,
    held_balance = held_balance + amount
  WHERE id = account_id
    AND account_balance >= amount;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC function to release held balance (on deployment approval)
CREATE OR REPLACE FUNCTION release_held_balance(
  account_id UUID,
  amount NUMERIC
) RETURNS BOOLEAN AS $$
BEGIN
  UPDATE client_accounts
  SET held_balance = held_balance - amount
  WHERE id = account_id
    AND held_balance >= amount;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC function to refund held balance (on deployment rejection)
CREATE OR REPLACE FUNCTION refund_held_balance(
  account_id UUID,
  amount NUMERIC
) RETURNS BOOLEAN AS $$
BEGIN
  UPDATE client_accounts
  SET
    account_balance = account_balance + amount,
    held_balance = held_balance - amount
  WHERE id = account_id
    AND held_balance >= amount;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
