-- Chat System Phase 2: Reactions, Typing Indicators, File Uploads
-- Run this script after create-chat-system.sql

-- Message reactions table
CREATE TABLE IF NOT EXISTS message_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES chat_messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  emoji TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(message_id, user_id, emoji)
);

-- Typing indicators table (temporary presence tracking for chat)
CREATE TABLE IF NOT EXISTS chat_typing (
  room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  typing_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (room_id, user_id)
);

-- File attachments (extend messages to support files)
ALTER TABLE chat_messages
  ADD COLUMN IF NOT EXISTS attachment_url TEXT,
  ADD COLUMN IF NOT EXISTS attachment_type TEXT,
  ADD COLUMN IF NOT EXISTS attachment_name TEXT,
  ADD COLUMN IF NOT EXISTS attachment_size INTEGER;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_message_reactions_message_id ON message_reactions(message_id);
CREATE INDEX IF NOT EXISTS idx_message_reactions_user_id ON message_reactions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_typing_room_id ON chat_typing(room_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_attachment ON chat_messages(attachment_url) WHERE attachment_url IS NOT NULL;

-- Enable RLS
ALTER TABLE message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_typing ENABLE ROW LEVEL SECURITY;

-- RLS Policies for message_reactions
CREATE POLICY "Users can view reactions"
  ON message_reactions FOR SELECT
  USING (TRUE);

CREATE POLICY "Users can add their own reactions"
  ON message_reactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own reactions"
  ON message_reactions FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for chat_typing
CREATE POLICY "Users can view typing indicators in their rooms"
  ON chat_typing FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM chat_room_members
      WHERE chat_room_members.room_id = chat_typing.room_id
      AND chat_room_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own typing status"
  ON chat_typing FOR ALL
  USING (auth.uid() = user_id);

-- Function to clean up old typing indicators (older than 10 seconds)
CREATE OR REPLACE FUNCTION cleanup_old_typing_indicators()
RETURNS void AS $$
BEGIN
  DELETE FROM chat_typing
  WHERE typing_at < NOW() - INTERVAL '10 seconds';
END;
$$ LANGUAGE plpgsql;

-- Create a storage bucket for chat attachments (if using Supabase storage)
-- This needs to be run via Supabase dashboard or API, not SQL
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('chat-attachments', 'chat-attachments', true);

-- Grant permissions
GRANT ALL ON message_reactions TO authenticated;
GRANT ALL ON chat_typing TO authenticated;

-- Comment explaining file upload setup
COMMENT ON COLUMN chat_messages.attachment_url IS 'URL to file in Supabase storage bucket: chat-attachments';
COMMENT ON COLUMN chat_messages.attachment_type IS 'MIME type: image/png, image/jpeg, application/pdf, etc.';
COMMENT ON COLUMN chat_messages.attachment_name IS 'Original filename for download';
COMMENT ON COLUMN chat_messages.attachment_size IS 'File size in bytes';
