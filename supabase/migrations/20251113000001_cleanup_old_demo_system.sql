-- ============================================
-- CLEANUP: Remove old demo system to make room for Phase 1
-- ============================================
-- This migration removes the old demo_projects table and related
-- functions/triggers to prepare for the new component-based system

-- Drop triggers first
DROP TRIGGER IF EXISTS trigger_reset_demo_expiry_on_update ON demo_projects;

-- Drop functions
DROP FUNCTION IF EXISTS reset_demo_expiry_on_update();
DROP FUNCTION IF EXISTS use_download_token(text);
DROP FUNCTION IF EXISTS generate_download_token(uuid, text);

-- Drop tables (if they exist)
DROP TABLE IF EXISTS download_tokens CASCADE;
DROP TABLE IF EXISTS demo_projects CASCADE;

-- Note: We're preserving any existing user, tier, and payment tables
-- as they may contain important historical data
