-- Add folder preferences to client_preferences table for drag-drop file organization

ALTER TABLE client_preferences
ADD COLUMN IF NOT EXISTS folder_preferences JSONB DEFAULT '{}'::jsonb;

COMMENT ON COLUMN client_preferences.folder_preferences IS 'User-configured folder paths for different file types (images, videos, pdfs, documents)';

-- Example structure:
-- {
--   "images": "/public/images",
--   "videos": "/public/videos",
--   "pdfs": "/public/documents",
--   "documents": "/public/documents"
-- }
