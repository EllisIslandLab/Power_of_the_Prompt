-- Table for storing code changes pending user approval
CREATE TABLE IF NOT EXISTS pending_code_changes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES revision_conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- File and change info
  file_path TEXT NOT NULL,
  change_type TEXT NOT NULL CHECK (change_type IN ('create', 'edit', 'delete')),
  old_content TEXT,
  new_content TEXT,
  full_file_content TEXT,
  description TEXT,

  -- Git info
  branch_name TEXT NOT NULL,
  file_sha TEXT,
  commit_sha TEXT,

  -- Approval workflow
  status TEXT NOT NULL DEFAULT 'pending_approval' CHECK (status IN ('pending_approval', 'approved', 'rejected', 'committed')),
  approved_at TIMESTAMPTZ,
  committed_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_pending_changes_conversation ON pending_code_changes(conversation_id);
CREATE INDEX idx_pending_changes_user ON pending_code_changes(user_id);
CREATE INDEX idx_pending_changes_status ON pending_code_changes(status);

-- RLS policies
ALTER TABLE pending_code_changes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own pending changes"
  ON pending_code_changes
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own pending changes"
  ON pending_code_changes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pending changes"
  ON pending_code_changes
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Trigger to update updated_at
CREATE TRIGGER update_pending_code_changes_updated_at
  BEFORE UPDATE ON pending_code_changes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
