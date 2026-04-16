-- ============================================
-- FIX: Drop broken AI limits trigger
-- ============================================
--
-- The trigger_set_ai_limits trigger was trying to set
-- ai_modifications_limit column which doesn't exist,
-- causing all user INSERTs to fail with "unexpected_failure"
--
-- Date: 2026-04-16
-- ============================================

-- Drop the broken trigger
DROP TRIGGER IF EXISTS trigger_set_ai_limits ON users;

-- Drop the function since it's not being used
DROP FUNCTION IF EXISTS set_ai_modification_limits();

-- Verify
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '✅ Dropped broken trigger and function';
  RAISE NOTICE '   trigger_set_ai_limits referenced non-existent ai_modifications_limit column';
  RAISE NOTICE '   User creation should now work';
  RAISE NOTICE '';
END $$;
