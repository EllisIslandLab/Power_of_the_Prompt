-- ============================================
-- WEB LAUNCH ACADEMY - PORTAL REVISION SYSTEM
-- Complete database schema for AI-powered revision portal
-- ============================================

-- ============================================
-- TABLE 1: CLIENT ACCOUNTS (Trial & Billing)
-- ============================================

CREATE TABLE IF NOT EXISTS client_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  trial_start_date TIMESTAMPTZ DEFAULT now(),
  trial_expiration_date TIMESTAMPTZ DEFAULT now() + interval '90 days',
  trial_extended_by_matt BOOLEAN DEFAULT false,
  trial_extended_date TIMESTAMPTZ,
  account_balance NUMERIC(10, 2) DEFAULT 0.00,
  held_balance NUMERIC(10, 2) DEFAULT 0.00,
  total_lifetime_spent NUMERIC(10, 2) DEFAULT 0.00,
  total_free_bug_fixes_used INT DEFAULT 0,
  trial_status VARCHAR(20) DEFAULT 'active' CHECK (trial_status IN ('active', 'expired', 'converted')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE client_accounts IS 'Client trial periods, account balance, and billing information';
COMMENT ON COLUMN client_accounts.held_balance IS 'Funds reserved for pending work';
COMMENT ON COLUMN client_accounts.trial_status IS 'active, expired, or converted to paid';

CREATE INDEX idx_client_accounts_user ON client_accounts(user_id);
CREATE INDEX idx_client_accounts_trial_status ON client_accounts(trial_status);
CREATE INDEX idx_client_accounts_trial_expiration ON client_accounts(trial_expiration_date);

-- ============================================
-- TABLE 2: REVISION CONVERSATIONS
-- ============================================

CREATE TABLE IF NOT EXISTS revision_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  conversation_type VARCHAR(50) NOT NULL CHECK (conversation_type IN ('bug_fix', 'feature_change', 'database_work')),
  is_trial_period BOOLEAN NOT NULL,
  cost_usd NUMERIC(10, 2) DEFAULT 0.00,
  tokens_used INT DEFAULT 0,
  status VARCHAR(30) DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'preview_ready', 'approved', 'deployed', 'completed', 'cancelled')),
  preview_url TEXT,
  preview_branch_name TEXT,
  deployment_status VARCHAR(30) DEFAULT 'pending' CHECK (deployment_status IN ('pending', 'auto_merged', 'awaiting_review', 'deployed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE revision_conversations IS 'Individual revision conversations with Claude AI';
COMMENT ON COLUMN revision_conversations.conversation_type IS 'Type: bug_fix, feature_change, or database_work';
COMMENT ON COLUMN revision_conversations.is_trial_period IS 'Whether this conversation happened during trial period';

CREATE INDEX idx_revision_conversations_user ON revision_conversations(user_id);
CREATE INDEX idx_revision_conversations_status ON revision_conversations(status);
CREATE INDEX idx_revision_conversations_created ON revision_conversations(created_at DESC);

-- ============================================
-- TABLE 3: REVISION CHAT MESSAGES
-- ============================================

CREATE TABLE IF NOT EXISTS revision_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES revision_conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message_type VARCHAR(30) NOT NULL CHECK (message_type IN ('user_message', 'claude_greeting', 'claude_response', 'system_notification')),
  message_text TEXT NOT NULL,
  tokens_in INT DEFAULT 0,
  tokens_out INT DEFAULT 0,
  cumulative_tokens_this_conversation INT DEFAULT 0,
  includes_code_preview BOOLEAN DEFAULT false,
  includes_preview_url BOOLEAN DEFAULT false,
  is_final_approval BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE revision_chat_messages IS 'Individual chat messages within revision conversations';
COMMENT ON COLUMN revision_chat_messages.message_type IS 'user_message, claude_greeting, claude_response, or system_notification';

CREATE INDEX idx_chat_messages_conversation ON revision_chat_messages(conversation_id, created_at);
CREATE INDEX idx_chat_messages_user ON revision_chat_messages(user_id);

-- ============================================
-- TABLE 4: DATABASE WORK REQUESTS
-- ============================================

CREATE TABLE IF NOT EXISTS database_work_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES revision_conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  request_description TEXT NOT NULL,
  implementation_prompt TEXT,
  testing_checklist TEXT,
  client_option VARCHAR(30) NOT NULL CHECK (client_option IN ('implement_only', 'implement_and_test')),
  estimated_cost NUMERIC(10, 2) DEFAULT 60.00,
  actual_cost NUMERIC(10, 2),
  manual_testing_hours NUMERIC(5, 2),
  manual_testing_cost NUMERIC(10, 2),
  status VARCHAR(30) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'testing', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE database_work_requests IS 'Complex database work requiring manual implementation';
COMMENT ON COLUMN database_work_requests.client_option IS 'implement_only (client tests) or implement_and_test (Matt tests)';

CREATE INDEX idx_db_work_requests_user ON database_work_requests(user_id);
CREATE INDEX idx_db_work_requests_status ON database_work_requests(status);
CREATE INDEX idx_db_work_requests_created ON database_work_requests(created_at DESC);

-- ============================================
-- TABLE 5: DEPLOYMENT NOTIFICATIONS
-- ============================================

CREATE TABLE IF NOT EXISTS deployment_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES revision_conversations(id) ON DELETE CASCADE,
  notification_type VARCHAR(50) NOT NULL CHECK (notification_type IN ('code_deployed', 'database_completed', 'database_work_ready', 'preview_ready', 'balance_low')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  action_url TEXT,
  is_acknowledged BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  acknowledged_at TIMESTAMPTZ
);

COMMENT ON TABLE deployment_notifications IS 'User notifications for deployments and work completion';
COMMENT ON COLUMN deployment_notifications.notification_type IS 'Type of notification for display styling';

CREATE INDEX idx_notifications_user ON deployment_notifications(user_id, is_acknowledged);
CREATE INDEX idx_notifications_created ON deployment_notifications(created_at DESC);

-- ============================================
-- TABLE 6: CLIENT PREFERENCES
-- ============================================

CREATE TABLE IF NOT EXISTS client_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  one_change_per_turn_strict BOOLEAN DEFAULT false,
  chat_history_mode VARCHAR(20) DEFAULT 'session' CHECK (chat_history_mode IN ('session', 'continuous')),
  auto_preview_navigation BOOLEAN DEFAULT true,
  manual_review_required_by_default BOOLEAN DEFAULT false,
  deployment_preference VARCHAR(20) DEFAULT 'auto' CHECK (deployment_preference IN ('auto', 'manual')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE client_preferences IS 'User preferences for portal behavior';
COMMENT ON COLUMN client_preferences.one_change_per_turn_strict IS 'If true, enforce one change; if false, gentle nudge';
COMMENT ON COLUMN client_preferences.chat_history_mode IS 'session (cleared on new conversation) or continuous (persistent)';

CREATE INDEX idx_client_preferences_user ON client_preferences(user_id);

-- ============================================
-- TABLE 7: DEPLOYMENT HISTORY
-- ============================================

CREATE TABLE IF NOT EXISTS deployment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  conversation_id UUID NOT NULL REFERENCES revision_conversations(id) ON DELETE CASCADE,
  deployed_at TIMESTAMPTZ DEFAULT now(),
  github_branch_merged VARCHAR(255),
  vercel_deployment_url TEXT,
  changes_summary TEXT,
  deployed_by VARCHAR(30) CHECK (deployed_by IN ('client_auto', 'client_manual', 'matt_approved')),
  created_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE deployment_history IS 'Historical record of all deployments';
COMMENT ON COLUMN deployment_history.deployed_by IS 'Who triggered the deployment';

CREATE INDEX idx_deployment_history_user ON deployment_history(user_id, deployed_at DESC);
CREATE INDEX idx_deployment_history_conversation ON deployment_history(conversation_id);

-- ============================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE client_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE revision_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE revision_chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE database_work_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE deployment_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE deployment_history ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES: CLIENT ACCOUNTS
-- ============================================

-- Users can view their own account
CREATE POLICY "Users can view own account"
  ON client_accounts FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own account (balance changes happen server-side)
CREATE POLICY "Users can update own account"
  ON client_accounts FOR UPDATE
  USING (auth.uid() = user_id);

-- Admins can view all accounts
CREATE POLICY "Admins can view all accounts"
  ON client_accounts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Admins can manage all accounts
CREATE POLICY "Admins can manage accounts"
  ON client_accounts FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- ============================================
-- RLS POLICIES: REVISION CONVERSATIONS
-- ============================================

-- Users can view their own conversations
CREATE POLICY "Users can view own conversations"
  ON revision_conversations FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own conversations
CREATE POLICY "Users can create conversations"
  ON revision_conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own conversations
CREATE POLICY "Users can update own conversations"
  ON revision_conversations FOR UPDATE
  USING (auth.uid() = user_id);

-- Admins can view all conversations
CREATE POLICY "Admins can view all conversations"
  ON revision_conversations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Admins can manage all conversations
CREATE POLICY "Admins can manage conversations"
  ON revision_conversations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- ============================================
-- RLS POLICIES: CHAT MESSAGES
-- ============================================

-- Users can view messages in their conversations
CREATE POLICY "Users can view own messages"
  ON revision_chat_messages FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create messages in their conversations
CREATE POLICY "Users can create messages"
  ON revision_chat_messages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins can view all messages
CREATE POLICY "Admins can view all messages"
  ON revision_chat_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- ============================================
-- RLS POLICIES: DATABASE WORK REQUESTS
-- ============================================

-- Users can view their own requests
CREATE POLICY "Users can view own db work requests"
  ON database_work_requests FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own requests
CREATE POLICY "Users can create db work requests"
  ON database_work_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins can manage all requests
CREATE POLICY "Admins can manage db work requests"
  ON database_work_requests FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- ============================================
-- RLS POLICIES: NOTIFICATIONS
-- ============================================

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications"
  ON deployment_notifications FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own notifications (acknowledge)
CREATE POLICY "Users can acknowledge notifications"
  ON deployment_notifications FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- System can create notifications (handled server-side)
CREATE POLICY "System can create notifications"
  ON deployment_notifications FOR INSERT
  WITH CHECK (true);

-- Admins can view all notifications
CREATE POLICY "Admins can view all notifications"
  ON deployment_notifications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- ============================================
-- RLS POLICIES: CLIENT PREFERENCES
-- ============================================

-- Users can view their own preferences
CREATE POLICY "Users can view own preferences"
  ON client_preferences FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own preferences
CREATE POLICY "Users can create preferences"
  ON client_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own preferences
CREATE POLICY "Users can update own preferences"
  ON client_preferences FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================
-- RLS POLICIES: DEPLOYMENT HISTORY
-- ============================================

-- Users can view their own deployment history
CREATE POLICY "Users can view own deployments"
  ON deployment_history FOR SELECT
  USING (auth.uid() = user_id);

-- System can create deployment records
CREATE POLICY "System can create deployments"
  ON deployment_history FOR INSERT
  WITH CHECK (true);

-- Admins can view all deployments
CREATE POLICY "Admins can view all deployments"
  ON deployment_history FOR SELECT
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

-- Function to initialize client account on user creation
CREATE OR REPLACE FUNCTION initialize_client_account()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO client_accounts (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO client_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create client account and preferences
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION initialize_client_account();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at columns
CREATE TRIGGER update_client_accounts_updated_at
  BEFORE UPDATE ON client_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_revision_conversations_updated_at
  BEFORE UPDATE ON revision_conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_database_work_requests_updated_at
  BEFORE UPDATE ON database_work_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_client_preferences_updated_at
  BEFORE UPDATE ON client_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- VERIFICATION
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '✅ PORTAL REVISION SYSTEM SCHEMA COMPLETE!';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '';
  RAISE NOTICE 'Tables created:';
  RAISE NOTICE '  ✓ client_accounts (trial & billing)';
  RAISE NOTICE '  ✓ revision_conversations';
  RAISE NOTICE '  ✓ revision_chat_messages';
  RAISE NOTICE '  ✓ database_work_requests';
  RAISE NOTICE '  ✓ deployment_notifications';
  RAISE NOTICE '  ✓ client_preferences';
  RAISE NOTICE '  ✓ deployment_history';
  RAISE NOTICE '';
  RAISE NOTICE 'Features enabled:';
  RAISE NOTICE '  ✓ Row Level Security (RLS)';
  RAISE NOTICE '  ✓ Auto-create account on user signup';
  RAISE NOTICE '  ✓ Auto-update timestamps';
  RAISE NOTICE '  ✓ Proper indexes for performance';
  RAISE NOTICE '';
  RAISE NOTICE 'Ready for Portal Revision System! 🚀';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
END $$;
