-- Add font size preferences to client_preferences table

ALTER TABLE client_preferences
ADD COLUMN IF NOT EXISTS output_font_size INTEGER DEFAULT 9,
ADD COLUMN IF NOT EXISTS code_font_size INTEGER DEFAULT 9,
ADD COLUMN IF NOT EXISTS input_font_size INTEGER DEFAULT 12;

COMMENT ON COLUMN client_preferences.output_font_size IS 'Font size for chat message output (default: 9pt)';
COMMENT ON COLUMN client_preferences.code_font_size IS 'Font size for code diffs and previews (default: 9pt)';
COMMENT ON COLUMN client_preferences.input_font_size IS 'Font size for chat input box (default: 12pt)';
