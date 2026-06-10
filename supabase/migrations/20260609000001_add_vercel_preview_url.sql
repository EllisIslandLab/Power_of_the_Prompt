-- Add Vercel preview URL tracking to client_projects
ALTER TABLE client_projects
ADD COLUMN IF NOT EXISTS vercel_preview_url TEXT,
ADD COLUMN IF NOT EXISTS vercel_preview_updated_at TIMESTAMPTZ;

-- Add index for faster lookups by Vercel project ID
CREATE INDEX IF NOT EXISTS idx_client_projects_vercel_project_id
ON client_projects(vercel_project_id)
WHERE vercel_project_id IS NOT NULL;

-- Comment
COMMENT ON COLUMN client_projects.vercel_preview_url IS 'Latest Vercel preview deployment URL from webhooks';
COMMENT ON COLUMN client_projects.vercel_preview_updated_at IS 'When the preview URL was last updated';
