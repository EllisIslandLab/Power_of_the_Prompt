-- ============================================
-- Fix Remaining Security Definer Views
-- These analytics views bypass RLS and pose security risks
-- ============================================

-- Drop the insecure views
DROP VIEW IF EXISTS public.top_clients_by_activity CASCADE;
DROP VIEW IF EXISTS public.daily_activity CASCADE;

-- Recreate WITHOUT security definer if needed
-- Note: These are likely admin-only analytics views
-- If you need them, they should be recreated with proper RLS

-- Alternative: Create admin-only views with proper permissions
-- Only admins can access these

CREATE OR REPLACE VIEW public.top_clients_by_activity AS
SELECT
  ca.id,
  ca.user_id,
  u.email,
  COUNT(DISTINCT rc.id) as conversation_count,
  COUNT(DISTINCT rcm.id) as message_count,
  MAX(rc.created_at) as last_activity
FROM client_accounts ca
JOIN users u ON u.id = ca.user_id
LEFT JOIN revision_conversations rc ON rc.user_id = ca.user_id
LEFT JOIN revision_chat_messages rcm ON rcm.conversation_id = rc.id
WHERE
  -- Only admins can view this analytics data
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
GROUP BY ca.id, ca.user_id, u.email
ORDER BY conversation_count DESC
LIMIT 50;

CREATE OR REPLACE VIEW public.daily_activity AS
SELECT
  DATE(rcm.created_at) as activity_date,
  COUNT(DISTINCT rc.user_id) as unique_users,
  COUNT(DISTINCT rc.id) as conversations,
  COUNT(rcm.id) as messages,
  SUM(rcm.tokens_in + rcm.tokens_out) as total_tokens
FROM revision_chat_messages rcm
JOIN revision_conversations rc ON rc.id = rcm.conversation_id
WHERE
  -- Only admins can view this analytics data
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
GROUP BY DATE(rcm.created_at)
ORDER BY activity_date DESC;

-- Grant access only to authenticated users (admin check is in the view)
GRANT SELECT ON public.top_clients_by_activity TO authenticated;
GRANT SELECT ON public.daily_activity TO authenticated;

-- Enable security invoker (not definer)
ALTER VIEW public.top_clients_by_activity SET (security_invoker = true);
ALTER VIEW public.daily_activity SET (security_invoker = true);

COMMENT ON VIEW public.top_clients_by_activity IS 'Top clients by activity - admin only';
COMMENT ON VIEW public.daily_activity IS 'Daily activity metrics - admin only';
