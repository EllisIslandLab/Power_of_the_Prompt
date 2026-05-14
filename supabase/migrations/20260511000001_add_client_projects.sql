-- ============================================
-- CLIENT PROJECTS & SERVICE CONNECTIONS
-- ============================================

-- Main project connection table
CREATE TABLE IF NOT EXISTS client_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_name VARCHAR(255) NOT NULL,

  -- GitHub connection
  github_repo_url TEXT,
  github_owner VARCHAR(255),
  github_repo_name VARCHAR(255),
  github_default_branch VARCHAR(100) DEFAULT 'main',
  github_installation_id BIGINT, -- For GitHub App installations

  -- Vercel connection
  vercel_project_id TEXT,
  vercel_project_name TEXT,
  vercel_team_id TEXT,
  vercel_production_url TEXT,

  -- Framework detection
  framework VARCHAR(50), -- nextjs, react, vue, etc.
  package_manager VARCHAR(20), -- npm, yarn, pnpm

  -- Status
  is_active BOOLEAN DEFAULT true,
  connection_status VARCHAR(30) DEFAULT 'pending' CHECK (connection_status IN ('pending', 'connected', 'error', 'disconnected')),
  last_sync_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE client_projects IS 'Client project repositories and deployment connections';

CREATE INDEX idx_client_projects_user ON client_projects(user_id);
CREATE INDEX idx_client_projects_active ON client_projects(is_active);

-- Service credentials (encrypted)
CREATE TABLE IF NOT EXISTS client_service_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES client_projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  service_name VARCHAR(50) NOT NULL, -- 'github', 'vercel', 'supabase', 'stripe', 'resend', etc.

  -- OAuth tokens (encrypted at rest)
  access_token_encrypted TEXT,
  refresh_token_encrypted TEXT,
  token_expires_at TIMESTAMPTZ,

  -- API keys (encrypted at rest)
  api_key_encrypted TEXT,
  api_secret_encrypted TEXT,

  -- Service-specific metadata
  metadata JSONB DEFAULT '{}',

  -- Status
  is_valid BOOLEAN DEFAULT true,
  last_validated_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(project_id, service_name)
);

COMMENT ON TABLE client_service_credentials IS 'Encrypted credentials for client external services';
COMMENT ON COLUMN client_service_credentials.metadata IS 'Service-specific data like Supabase project ref, Stripe publishable key, etc.';

CREATE INDEX idx_service_creds_project ON client_service_credentials(project_id);
CREATE INDEX idx_service_creds_service ON client_service_credentials(service_name);

-- Environment variables (what the client needs to provide)
CREATE TABLE IF NOT EXISTS client_environment_variables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES client_projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  key VARCHAR(255) NOT NULL,
  value_encrypted TEXT NOT NULL,
  description TEXT,
  is_required BOOLEAN DEFAULT false,
  is_provided BOOLEAN DEFAULT false,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(project_id, key)
);

COMMENT ON TABLE client_environment_variables IS 'Client environment variables needed for development/testing';

CREATE INDEX idx_env_vars_project ON client_environment_variables(project_id);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE client_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_service_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_environment_variables ENABLE ROW LEVEL SECURITY;

-- Users can only see their own projects
CREATE POLICY "Users can view own projects"
  ON client_projects FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own projects"
  ON client_projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects"
  ON client_projects FOR UPDATE
  USING (auth.uid() = user_id);

-- Service credentials policies
CREATE POLICY "Users can view own credentials"
  ON client_service_credentials FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own credentials"
  ON client_service_credentials FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Environment variables policies
CREATE POLICY "Users can view own env vars"
  ON client_environment_variables FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own env vars"
  ON client_environment_variables FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admins can see everything
CREATE POLICY "Admins can view all projects"
  ON client_projects FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Admins can view all credentials"
  ON client_service_credentials FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Update timestamp trigger
CREATE TRIGGER update_client_projects_updated_at
  BEFORE UPDATE ON client_projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_client_service_credentials_updated_at
  BEFORE UPDATE ON client_service_credentials
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_client_environment_variables_updated_at
  BEFORE UPDATE ON client_environment_variables
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Link revision_conversations to specific projects
ALTER TABLE revision_conversations
ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES client_projects(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_revision_conversations_project ON revision_conversations(project_id);
