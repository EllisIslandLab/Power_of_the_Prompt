-- Add user settings and preferences
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  username_for_claude TEXT,
  profile_icon_url TEXT,
  chat_font TEXT DEFAULT 'system' CHECK (chat_font IN ('system', 'serif', 'arial', 'monospace')),
  notification_errors BOOLEAN DEFAULT true,
  notification_deployments BOOLEAN DEFAULT true,
  notification_email BOOLEAN DEFAULT true,
  theme TEXT DEFAULT 'dark' CHECK (theme IN ('light', 'dark', 'colorful')),
  claude_context TEXT,
  claude_instructions TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Add payment methods table
CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_account_id UUID NOT NULL REFERENCES client_accounts(id) ON DELETE CASCADE,
  payment_type TEXT NOT NULL CHECK (payment_type IN ('card', 'ach', 'check')),
  is_default BOOLEAN DEFAULT false,
  -- Card fields
  card_last4 TEXT,
  card_brand TEXT,
  card_exp_month INTEGER,
  card_exp_year INTEGER,
  stripe_payment_method_id TEXT,
  -- ACH fields
  bank_name TEXT,
  account_last4 TEXT,
  account_type TEXT CHECK (account_type IN ('checking', 'savings')),
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add connected services table
CREATE TABLE IF NOT EXISTS connected_services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_account_id UUID NOT NULL REFERENCES client_accounts(id) ON DELETE CASCADE,
  service_type TEXT NOT NULL CHECK (service_type IN ('github', 'supabase', 'vercel')),
  is_connected BOOLEAN DEFAULT false,
  access_token_encrypted TEXT,
  refresh_token_encrypted TEXT,
  token_expires_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(client_account_id, service_type)
);

-- RLS Policies for user_settings
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own settings"
  ON user_settings
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings"
  ON user_settings
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
  ON user_settings
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own settings"
  ON user_settings
  FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for payment_methods
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own payment methods"
  ON payment_methods
  FOR SELECT
  USING (
    client_account_id IN (
      SELECT id FROM client_accounts WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own payment methods"
  ON payment_methods
  FOR INSERT
  WITH CHECK (
    client_account_id IN (
      SELECT id FROM client_accounts WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own payment methods"
  ON payment_methods
  FOR UPDATE
  USING (
    client_account_id IN (
      SELECT id FROM client_accounts WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own payment methods"
  ON payment_methods
  FOR DELETE
  USING (
    client_account_id IN (
      SELECT id FROM client_accounts WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for connected_services
ALTER TABLE connected_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own connected services"
  ON connected_services
  FOR SELECT
  USING (
    client_account_id IN (
      SELECT id FROM client_accounts WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own connected services"
  ON connected_services
  FOR INSERT
  WITH CHECK (
    client_account_id IN (
      SELECT id FROM client_accounts WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own connected services"
  ON connected_services
  FOR UPDATE
  USING (
    client_account_id IN (
      SELECT id FROM client_accounts WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own connected services"
  ON connected_services
  FOR DELETE
  USING (
    client_account_id IN (
      SELECT id FROM client_accounts WHERE user_id = auth.uid()
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_methods_updated_at
  BEFORE UPDATE ON payment_methods
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_connected_services_updated_at
  BEFORE UPDATE ON connected_services
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
