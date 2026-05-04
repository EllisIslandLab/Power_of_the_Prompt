-- Analytics views for admin dashboard

-- Client account summary with revenue metrics
CREATE OR REPLACE VIEW client_account_summary AS
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
  (SELECT COUNT(*) FROM revision_conversations WHERE client_account_id = ca.id) as conversation_count,
  (SELECT COUNT(*) FROM revision_chat_messages rcm
   JOIN revision_conversations rc ON rcm.conversation_id = rc.id
   WHERE rc.client_account_id = ca.id) as message_count,
  (SELECT SUM(tokens_used) FROM revision_chat_messages rcm
   JOIN revision_conversations rc ON rcm.conversation_id = rc.id
   WHERE rc.client_account_id = ca.id) as total_tokens_used,
  (SELECT COUNT(*) FROM deployment_history WHERE client_account_id = ca.id AND deployment_status = 'deployed') as successful_deployments
FROM client_accounts ca
LEFT JOIN users u ON ca.user_id = u.id;

-- Daily activity metrics
CREATE OR REPLACE VIEW daily_activity AS
SELECT
  DATE(created_at) as activity_date,
  COUNT(DISTINCT client_account_id) as active_clients,
  COUNT(*) as total_messages,
  SUM(tokens_used) as total_tokens,
  AVG(tokens_used) as avg_tokens_per_message
FROM revision_chat_messages rcm
JOIN revision_conversations rc ON rcm.conversation_id = rc.id
WHERE rcm.role = 'assistant' -- Only count assistant responses
GROUP BY DATE(created_at)
ORDER BY activity_date DESC;

-- Pending work summary for admin dashboard
CREATE OR REPLACE VIEW pending_work_summary AS
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
WHERE deployment_status = 'pending';

-- Revenue metrics
CREATE OR REPLACE VIEW revenue_metrics AS
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

-- Top clients by activity
CREATE OR REPLACE VIEW top_clients_by_activity AS
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
LEFT JOIN revision_conversations rc ON rc.client_account_id = ca.id
LEFT JOIN revision_chat_messages rcm ON rcm.conversation_id = rc.id
GROUP BY ca.id, u.full_name, u.email
ORDER BY total_tokens DESC NULLS LAST
LIMIT 20;

-- Grant select on views to authenticated users (for their own data)
GRANT SELECT ON client_account_summary TO authenticated;
GRANT SELECT ON daily_activity TO authenticated;
GRANT SELECT ON pending_work_summary TO authenticated;
GRANT SELECT ON revenue_metrics TO authenticated;
GRANT SELECT ON top_clients_by_activity TO authenticated;

-- RLS policies for views (restrict to own data or admin)
ALTER VIEW client_account_summary SET (security_invoker = true);
ALTER VIEW daily_activity SET (security_invoker = true);
ALTER VIEW pending_work_summary SET (security_invoker = true);
ALTER VIEW revenue_metrics SET (security_invoker = true);
ALTER VIEW top_clients_by_activity SET (security_invoker = true);
