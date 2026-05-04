-- Add website configuration table for clients to manage their own sites

CREATE TABLE IF NOT EXISTS client_website_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_account_id UUID NOT NULL REFERENCES client_accounts(id) ON DELETE CASCADE UNIQUE,
  website_url TEXT,
  github_repo_url TEXT,
  github_branch TEXT DEFAULT 'main',
  vercel_project_name TEXT,
  vercel_team_slug TEXT,
  public_folder_path TEXT DEFAULT '/public',
  images_folder_path TEXT DEFAULT '/public/images',
  is_configured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE client_website_config IS 'Client website configuration for self-service setup';
COMMENT ON COLUMN client_website_config.public_folder_path IS 'Path to public folder in their project';
COMMENT ON COLUMN client_website_config.images_folder_path IS 'Path where uploaded images should go';

CREATE INDEX idx_client_website_config_account ON client_website_config(client_account_id);

-- Enable RLS
ALTER TABLE client_website_config ENABLE ROW LEVEL SECURITY;

-- Users can view their own config
CREATE POLICY "Users can view own website config"
  ON client_website_config FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM client_accounts
      WHERE client_accounts.id = client_website_config.client_account_id
      AND client_accounts.user_id = auth.uid()
    )
  );

-- Users can create their own config
CREATE POLICY "Users can create website config"
  ON client_website_config FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM client_accounts
      WHERE client_accounts.id = client_website_config.client_account_id
      AND client_accounts.user_id = auth.uid()
    )
  );

-- Users can update their own config
CREATE POLICY "Users can update own website config"
  ON client_website_config FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM client_accounts
      WHERE client_accounts.id = client_website_config.client_account_id
      AND client_accounts.user_id = auth.uid()
    )
  );

-- Admins can view all configs
CREATE POLICY "Admins can view all website configs"
  ON client_website_config FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Admins can manage all configs
CREATE POLICY "Admins can manage website configs"
  ON client_website_config FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Auto-update timestamp
CREATE TRIGGER update_client_website_config_updated_at
  BEFORE UPDATE ON client_website_config
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add uploaded_images table to track client uploads
CREATE TABLE IF NOT EXISTS client_uploaded_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_account_id UUID NOT NULL REFERENCES client_accounts(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES revision_conversations(id) ON DELETE SET NULL,
  original_filename TEXT NOT NULL,
  stored_filename TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size_bytes INT NOT NULL,
  mime_type TEXT NOT NULL,
  width INT,
  height INT,
  uploaded_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE client_uploaded_images IS 'Track images uploaded by clients for use in their sites';

CREATE INDEX idx_uploaded_images_account ON client_uploaded_images(client_account_id);
CREATE INDEX idx_uploaded_images_conversation ON client_uploaded_images(conversation_id);

-- Enable RLS
ALTER TABLE client_uploaded_images ENABLE ROW LEVEL SECURITY;

-- Users can view their own uploads
CREATE POLICY "Users can view own uploaded images"
  ON client_uploaded_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM client_accounts
      WHERE client_accounts.id = client_uploaded_images.client_account_id
      AND client_accounts.user_id = auth.uid()
    )
  );

-- Users can create uploads
CREATE POLICY "Users can upload images"
  ON client_uploaded_images FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM client_accounts
      WHERE client_accounts.id = client_uploaded_images.client_account_id
      AND client_accounts.user_id = auth.uid()
    )
  );

-- Admins can view all uploads
CREATE POLICY "Admins can view all uploaded images"
  ON client_uploaded_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );
