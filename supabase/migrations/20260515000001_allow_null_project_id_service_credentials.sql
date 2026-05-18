-- Allow project_id to be NULL in client_service_credentials
-- This enables user-level service connections (not just project-specific)

ALTER TABLE client_service_credentials
ALTER COLUMN project_id DROP NOT NULL;

-- Add a comment to explain the NULL case
COMMENT ON COLUMN client_service_credentials.project_id IS
'Project ID if service is project-specific, NULL for user-level connections (e.g., personal Supabase account)';

-- Create an index for querying by user_id and service_name without project_id
CREATE INDEX IF NOT EXISTS idx_service_credentials_user_service
ON client_service_credentials(user_id, service_name)
WHERE project_id IS NULL;
