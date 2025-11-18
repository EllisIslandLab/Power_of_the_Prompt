-- Add username field to users table for anonymous display
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS username VARCHAR(50) UNIQUE;

-- Add index for faster username lookups
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);

-- Add comment
COMMENT ON COLUMN public.users.username IS 'Optional anonymous username for privacy-conscious users';
