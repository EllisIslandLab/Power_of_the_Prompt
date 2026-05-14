-- ============================================
-- GITHUB APP INTEGRATION TABLES
-- ============================================

-- GitHub App Installations
CREATE TABLE IF NOT EXISTS github_installations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  installation_id BIGINT NOT NULL UNIQUE,
  account_type VARCHAR(20) NOT NULL CHECK (account_type IN ('user', 'organization')),
  account_login VARCHAR(255) NOT NULL,
  suspended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE github_installations IS 'GitHub App installations per user';
COMMENT ON COLUMN github_installations.installation_id IS 'GitHub installation ID from app installation';
COMMENT ON COLUMN github_installations.suspended_at IS 'When installation was suspended/revoked';

CREATE INDEX idx_github_installations_user ON github_installations(user_id);
CREATE INDEX idx_github_installations_installation ON github_installations(installation_id);

-- GitHub Repositories
CREATE TABLE IF NOT EXISTS github_repositories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  installation_id BIGINT NOT NULL,
  repository_id BIGINT NOT NULL,
  repository_name VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  owner VARCHAR(255) NOT NULL,
  private BOOLEAN DEFAULT false,
  default_branch VARCHAR(100) DEFAULT 'main',
  html_url TEXT NOT NULL,
  language VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(installation_id, repository_id)
);

COMMENT ON TABLE github_repositories IS 'Repositories accessible via GitHub App installation';

CREATE INDEX idx_github_repos_installation ON github_repositories(installation_id);
CREATE INDEX idx_github_repos_repository ON github_repositories(repository_id);
CREATE INDEX idx_github_repos_full_name ON github_repositories(full_name);

-- GitHub OAuth Tokens (for user-specific actions)
CREATE TABLE IF NOT EXISTS github_oauth_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  github_user_id BIGINT NOT NULL,
  github_login VARCHAR(255) NOT NULL,
  access_token_encrypted TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE github_oauth_tokens IS 'User OAuth tokens for GitHub personal actions';

CREATE INDEX idx_github_oauth_user ON github_oauth_tokens(user_id);

-- Link projects to GitHub repositories
ALTER TABLE client_projects
ADD COLUMN IF NOT EXISTS github_repository_id UUID REFERENCES github_repositories(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_client_projects_github_repo ON client_projects(github_repository_id);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE github_installations ENABLE ROW LEVEL SECURITY;
ALTER TABLE github_repositories ENABLE ROW LEVEL SECURITY;
ALTER TABLE github_oauth_tokens ENABLE ROW LEVEL SECURITY;

-- Users can view their own installations
CREATE POLICY "Users can view own installations"
  ON github_installations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own installations"
  ON github_installations FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can view repositories from their installations
CREATE POLICY "Users can view own repos"
  ON github_repositories FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM github_installations
      WHERE github_installations.installation_id = github_repositories.installation_id
      AND github_installations.user_id = auth.uid()
    )
  );

CREATE POLICY "System can manage repos"
  ON github_repositories FOR ALL
  USING (true)
  WITH CHECK (true);

-- Users can view their own OAuth tokens
CREATE POLICY "Users can view own tokens"
  ON github_oauth_tokens FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own tokens"
  ON github_oauth_tokens FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admins can view everything
CREATE POLICY "Admins can view all installations"
  ON github_installations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Admins can view all repos"
  ON github_repositories FOR SELECT
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
CREATE TRIGGER update_github_installations_updated_at
  BEFORE UPDATE ON github_installations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_github_repositories_updated_at
  BEFORE UPDATE ON github_repositories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_github_oauth_tokens_updated_at
  BEFORE UPDATE ON github_oauth_tokens
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- VERIFICATION
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '✅ GITHUB APP INTEGRATION TABLES CREATED!';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '';
  RAISE NOTICE 'Tables created:';
  RAISE NOTICE '  ✓ github_installations';
  RAISE NOTICE '  ✓ github_repositories';
  RAISE NOTICE '  ✓ github_oauth_tokens';
  RAISE NOTICE '';
  RAISE NOTICE 'Features enabled:';
  RAISE NOTICE '  ✓ GitHub App installation tracking';
  RAISE NOTICE '  ✓ Repository access management';
  RAISE NOTICE '  ✓ User OAuth token storage';
  RAISE NOTICE '  ✓ Row Level Security (RLS)';
  RAISE NOTICE '';
  RAISE NOTICE 'Ready for GitHub integration! 🚀';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
END $$;
