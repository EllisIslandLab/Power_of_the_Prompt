-- Fix Security Definer Views - recreate with SECURITY INVOKER
-- This fixes the ERROR advisors from Supabase linter

-- Drop and recreate client_account_summary with SECURITY INVOKER
DROP VIEW IF EXISTS client_account_summary;
CREATE VIEW client_account_summary
WITH (security_invoker = on) AS
SELECT
  ca.id,
  ca.user_id,
  u.full_name,
  u.email,
  ca.trial_status,
  ca.trial_expiration_date,
  ca.account_balance,
  ca.held_balance,
  ca.account_balance + ca.held_balance as total_value,
  ca.created_at,
  ca.updated_at,
  (SELECT COUNT(*) FROM revision_conversations WHERE user_id = ca.user_id) as conversation_count,
  (SELECT COUNT(*) FROM revision_chat_messages rcm
   JOIN revision_conversations rc ON rcm.conversation_id = rc.id
   WHERE rc.user_id = ca.user_id) as message_count,
  (SELECT SUM(tokens_used) FROM revision_chat_messages rcm
   JOIN revision_conversations rc ON rcm.conversation_id = rc.id
   WHERE rc.user_id = ca.user_id) as total_tokens_used,
  (SELECT COUNT(*) FROM deployment_history WHERE user_id = ca.user_id AND deployed_at IS NOT NULL) as successful_deployments
FROM client_accounts ca
LEFT JOIN users u ON ca.user_id = u.id;

-- Drop and recreate daily_activity with SECURITY INVOKER
DROP VIEW IF EXISTS daily_activity;
CREATE VIEW daily_activity
WITH (security_invoker = on) AS
SELECT
  DATE(rcm.created_at) as activity_date,
  COUNT(DISTINCT rc.user_id) as active_clients,
  COUNT(*) as total_messages,
  SUM(rcm.tokens_used) as total_tokens,
  AVG(rcm.tokens_used) as avg_tokens_per_message
FROM revision_chat_messages rcm
JOIN revision_conversations rc ON rcm.conversation_id = rc.id
WHERE rcm.role = 'assistant'
GROUP BY DATE(rcm.created_at)
ORDER BY activity_date DESC;

-- Drop and recreate pending_work_summary with SECURITY INVOKER
DROP VIEW IF EXISTS pending_work_summary;
CREATE VIEW pending_work_summary
WITH (security_invoker = on) AS
SELECT
  'database_work' as work_type,
  COUNT(*) as pending_count,
  MIN(created_at) as oldest_pending
FROM database_work_requests
WHERE status = 'pending'
UNION ALL
SELECT
  'deployments' as work_type,
  COUNT(*) as pending_count,
  MIN(created_at) as oldest_pending
FROM deployment_history
WHERE deployed_at IS NULL;

-- Drop and recreate revenue_metrics with SECURITY INVOKER
DROP VIEW IF EXISTS revenue_metrics;
CREATE VIEW revenue_metrics
WITH (security_invoker = on) AS
SELECT
  COUNT(*) as total_accounts,
  COUNT(*) FILTER (WHERE trial_status = 'active') as trial_accounts,
  COUNT(*) FILTER (WHERE trial_status != 'active') as paid_accounts,
  SUM(account_balance) as total_available_balance,
  SUM(held_balance) as total_held_balance,
  SUM(account_balance + held_balance) as total_revenue,
  AVG(account_balance) as avg_balance_per_account,
  SUM(account_balance) FILTER (WHERE trial_status = 'active') as trial_revenue,
  SUM(account_balance) FILTER (WHERE trial_status != 'active') as paid_revenue
FROM client_accounts;

-- Drop and recreate top_clients_by_activity with SECURITY INVOKER
DROP VIEW IF EXISTS top_clients_by_activity;
CREATE VIEW top_clients_by_activity
WITH (security_invoker = on) AS
SELECT
  ca.id,
  u.full_name,
  u.email,
  COUNT(DISTINCT rc.id) as conversation_count,
  COUNT(rcm.id) as message_count,
  SUM(rcm.tokens_used) as total_tokens,
  SUM(rcm.tokens_used) * 0.000003 as estimated_spend,
  MAX(rc.updated_at) as last_activity
FROM client_accounts ca
JOIN users u ON ca.user_id = u.id
LEFT JOIN revision_conversations rc ON rc.user_id = ca.user_id
LEFT JOIN revision_chat_messages rcm ON rcm.conversation_id = rc.id
GROUP BY ca.id, u.full_name, u.email
ORDER BY total_tokens DESC NULLS LAST
LIMIT 20;

-- Restore grants
GRANT SELECT ON client_account_summary TO authenticated;
GRANT SELECT ON daily_activity TO authenticated;
GRANT SELECT ON pending_work_summary TO authenticated;
GRANT SELECT ON revenue_metrics TO authenticated;
GRANT SELECT ON top_clients_by_activity TO authenticated;

COMMENT ON VIEW client_account_summary IS 'Admin view - shows client account metrics with SECURITY INVOKER';
COMMENT ON VIEW daily_activity IS 'Admin view - daily activity metrics with SECURITY INVOKER';
COMMENT ON VIEW pending_work_summary IS 'Admin view - pending work summary with SECURITY INVOKER';
COMMENT ON VIEW revenue_metrics IS 'Admin view - revenue metrics with SECURITY INVOKER';
COMMENT ON VIEW top_clients_by_activity IS 'Admin view - top clients by activity with SECURITY INVOKER';
