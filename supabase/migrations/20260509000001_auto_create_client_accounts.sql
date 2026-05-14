-- Auto-create client_account for new users
-- This ensures every user has a client_account record for billing

-- Function to create client_account on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.client_accounts (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create client_account when user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Backfill existing users who don't have client_accounts
INSERT INTO public.client_accounts (user_id)
SELECT id
FROM auth.users
WHERE NOT EXISTS (
  SELECT 1
  FROM public.client_accounts
  WHERE client_accounts.user_id = auth.users.id
)
ON CONFLICT (user_id) DO NOTHING;
