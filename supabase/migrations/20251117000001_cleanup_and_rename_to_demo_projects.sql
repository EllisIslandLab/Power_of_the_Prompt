-- ============================================
-- WEB LAUNCH ACADEMY - CLEANUP & RENAME
-- Rename demo_sessions → demo_projects
-- ============================================
--
-- This migration:
-- 1. Deletes all test data from demo_sessions
-- 2. Deletes related AI interaction logs
-- 3. Renames demo_sessions to demo_projects
-- 4. Updates all foreign key references
-- 5. Aligns database with codebase naming
--
-- SAFE: No production data exists yet
-- ============================================

-- ============================================
-- STEP 1: DELETE TEST DATA
-- ============================================

-- Delete AI interaction logs first (foreign key dependency)
TRUNCATE TABLE ai_interaction_logs CASCADE;

-- Delete email logs related to demo sessions
DELETE FROM email_logs WHERE demo_session_id IS NOT NULL;

-- Delete stripe checkout sessions related to demos
DELETE FROM stripe_checkout_sessions
WHERE return_state IS NOT NULL
  AND return_state::text LIKE '%sessionId%';

-- Delete demo sessions data
TRUNCATE TABLE demo_sessions CASCADE;

-- Log the cleanup
DO $$
BEGIN
  RAISE NOTICE '✅ Deleted all test data from demo_sessions and related tables';
END $$;

-- ============================================
-- STEP 2: RENAME TABLE
-- ============================================

-- Rename the table (PostgreSQL automatically updates foreign key constraints)
ALTER TABLE demo_sessions RENAME TO demo_projects;

-- Rename the indexes to match new table name
ALTER INDEX IF EXISTS idx_demo_sessions_user_id RENAME TO idx_demo_projects_user_id;
ALTER INDEX IF EXISTS idx_demo_sessions_user_email RENAME TO idx_demo_projects_user_email;

-- Log the rename
DO $$
BEGIN
  RAISE NOTICE '✅ Renamed demo_sessions → demo_projects';
  RAISE NOTICE '✅ Updated indexes to match new table name';
END $$;

-- ============================================
-- STEP 3: UPDATE COLUMN NAMES IN RELATED TABLES
-- ============================================

-- Rename demo_session_id → demo_project_id in ai_interaction_logs
ALTER TABLE ai_interaction_logs
  RENAME COLUMN demo_session_id TO demo_project_id;

-- Rename demo_session_id → demo_project_id in email_logs
ALTER TABLE email_logs
  RENAME COLUMN demo_session_id TO demo_project_id;

-- Rename index to match
ALTER INDEX IF EXISTS idx_ai_logs_session RENAME TO idx_ai_logs_project;
ALTER INDEX IF EXISTS idx_email_logs_session RENAME TO idx_email_logs_project;

-- Log the column renames
DO $$
BEGIN
  RAISE NOTICE '✅ Renamed demo_session_id → demo_project_id in related tables';
  RAISE NOTICE '✅ Updated related indexes';
END $$;

-- ============================================
-- STEP 4: UPDATE TRIGGER FUNCTION
-- ============================================

-- Update the trigger function to use new table name
CREATE OR REPLACE FUNCTION ensure_user_from_project()
RETURNS trigger AS $$
DECLARE
  user_id_var uuid;
BEGIN
  -- Create or get user
  INSERT INTO users (email, full_name)
  VALUES (NEW.user_email, NEW.business_name)
  ON CONFLICT (email) DO UPDATE
  SET updated_at = now()
  RETURNING id INTO user_id_var;

  -- Link project to user
  NEW.user_id := user_id_var;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate trigger on new table name
DROP TRIGGER IF EXISTS create_user_from_session ON demo_projects;
CREATE TRIGGER create_user_from_project
  BEFORE INSERT ON demo_projects
  FOR EACH ROW
  WHEN (NEW.user_email IS NOT NULL)
  EXECUTE FUNCTION ensure_user_from_project();

-- Log the trigger update
DO $$
BEGIN
  RAISE NOTICE '✅ Updated trigger function for demo_projects';
END $$;

-- ============================================
-- STEP 5: VERIFY MIGRATION
-- ============================================

DO $$
DECLARE
  table_exists boolean;
  old_table_exists boolean;
  fk_count integer;
BEGIN
  -- Check new table exists
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_name = 'demo_projects'
  ) INTO table_exists;

  -- Check old table doesn't exist
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_name = 'demo_sessions'
  ) INTO old_table_exists;

  -- Count foreign keys pointing to demo_projects
  SELECT COUNT(*) INTO fk_count
  FROM information_schema.table_constraints tc
  JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
  JOIN information_schema.constraint_column_usage ccu
    ON tc.constraint_name = ccu.constraint_name
  WHERE tc.constraint_type = 'FOREIGN KEY'
    AND ccu.table_name = 'demo_projects';

  ASSERT table_exists, 'demo_projects table not found after rename';
  ASSERT NOT old_table_exists, 'demo_sessions table still exists after rename';
  ASSERT fk_count >= 2, 'Foreign keys not updated correctly';

  RAISE NOTICE '';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '✅ CLEANUP & RENAME COMPLETED SUCCESSFULLY!';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '';
  RAISE NOTICE 'Changes made:';
  RAISE NOTICE '  1. Deleted all test data from demo_sessions';
  RAISE NOTICE '  2. Renamed demo_sessions → demo_projects';
  RAISE NOTICE '  3. Renamed demo_session_id → demo_project_id';
  RAISE NOTICE '  4. Updated % foreign key references', fk_count;
  RAISE NOTICE '  5. Updated indexes and triggers';
  RAISE NOTICE '';
  RAISE NOTICE 'Database now aligned with codebase! 🎉';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
END $$;

-- ============================================
-- MIGRATION COMPLETE! 🎉
-- ============================================
