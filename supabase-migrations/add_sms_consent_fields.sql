-- Add SMS consent fields to users table
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS phone_number TEXT,
ADD COLUMN IF NOT EXISTS sms_consent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS sms_consent_timestamp TIMESTAMPTZ;

-- Add comment to explain the columns
COMMENT ON COLUMN public.users.phone_number IS 'User phone number for SMS notifications (10 digits, no formatting)';
COMMENT ON COLUMN public.users.sms_consent IS 'Whether user has consented to receive SMS notifications';
COMMENT ON COLUMN public.users.sms_consent_timestamp IS 'Timestamp when user consented to SMS notifications';

-- Create index on phone_number for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_phone_number ON public.users(phone_number) WHERE phone_number IS NOT NULL;
