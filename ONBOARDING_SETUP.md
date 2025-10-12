# SMS Consent Onboarding Setup

## Overview
Created a post-purchase onboarding page (`/onboarding`) that collects SMS consent from new students after Stripe payment.

## What's Been Created

### 1. Onboarding Page
**Location:** `/src/app/onboarding/page.tsx`

**Features:**
- ✅ Optional phone number field with auto-formatting `(555) 123-4567`
- ✅ SMS consent checkbox with full disclosure text
- ✅ Links to Privacy Policy and Terms & Conditions
- ✅ Form validation (10-digit phone required if consent is checked)
- ✅ Success state with redirect to `/portal`
- ✅ "Skip for now" option
- ✅ Beautiful, professional UI matching your site design

**Disclosure Text Includes:**
- Message frequency (2-8 per month)
- Data rates may apply
- Reply STOP to opt-out
- Reply HELP for assistance
- Links to legal pages

### 2. API Route
**Location:** `/src/app/api/onboarding/sms-consent/route.ts`

**Features:**
- ✅ Requires authentication (checks for logged-in user)
- ✅ Saves phone number, consent status, and timestamp to Supabase
- ✅ Updates the `users` table
- ✅ Proper error handling

### 3. Database Migration
**Location:** `/supabase-migrations/add_sms_consent_fields.sql`

**Adds 3 columns to `public.users` table:**
- `phone_number` (TEXT) - Stores 10 digits without formatting
- `sms_consent` (BOOLEAN) - Default false
- `sms_consent_timestamp` (TIMESTAMPTZ) - When consent was given

## Setup Instructions

### Step 1: Run Database Migration

Go to your Supabase Dashboard → SQL Editor and run this:

\`\`\`sql
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
\`\`\`

### Step 2: Update TypeScript Types

After running the migration, regenerate your Supabase types:

\`\`\`bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.ts
\`\`\`

Or manually add to `src/types/database.ts` in the `users` table Row/Insert/Update types:

\`\`\`typescript
phone_number: string | null
sms_consent: boolean
sms_consent_timestamp: string | null
\`\`\`

### Step 3: Integrate with Stripe Flow

After successful Stripe payment, redirect users to:
\`\`\`
/onboarding
\`\`\`

Example in your Stripe success handler:
\`\`\`typescript
// After payment success
router.push('/onboarding')
\`\`\`

### Step 4: Test the Flow

1. Complete a test Stripe payment
2. Get redirected to `/onboarding`
3. Enter phone number: `(555) 123-4567`
4. Check SMS consent checkbox
5. Click "Continue to Portal"
6. Verify data saved in Supabase `users` table

## Database Schema

After migration, your `users` table will have:

\`\`\`
users
├── id (uuid, primary key)
├── email (text)
├── full_name (text)
├── role (enum)
├── tier (enum)
├── payment_status (enum)
├── phone_number (text) ← NEW
├── sms_consent (boolean) ← NEW
├── sms_consent_timestamp (timestamptz) ← NEW
├── created_at (timestamptz)
└── updated_at (timestamptz)
\`\`\`

## Query Examples

### Get all users who consented to SMS
\`\`\`sql
SELECT id, email, full_name, phone_number, sms_consent_timestamp
FROM users
WHERE sms_consent = true
AND phone_number IS NOT NULL;
\`\`\`

### Count SMS subscribers
\`\`\`sql
SELECT COUNT(*) as sms_subscribers
FROM users
WHERE sms_consent = true;
\`\`\`

### Get recent SMS consents
\`\`\`sql
SELECT email, phone_number, sms_consent_timestamp
FROM users
WHERE sms_consent = true
ORDER BY sms_consent_timestamp DESC
LIMIT 10;
\`\`\`

## Legal Compliance

The onboarding page includes all required SMS compliance elements:

✅ **Express Consent:** Checkbox must be actively checked
✅ **Clear Disclosure:** Explains what they're signing up for
✅ **Frequency:** States 2-8 messages per month
✅ **Opt-Out:** Instructions to reply STOP
✅ **Help:** Instructions to reply HELP
✅ **Rates:** Mentions standard message/data rates apply
✅ **Links:** Directs to Privacy Policy and Terms

## Optional: Airtable Integration

If you want to also sync this data to Airtable, add this to the API route:

\`\`\`typescript
// After Supabase update
if (phoneNumber && smsConsent) {
  await fetch('https://api.airtable.com/v0/YOUR_BASE/Users', {
    method: 'PATCH',
    headers: {
      'Authorization': \`Bearer \${process.env.AIRTABLE_API_KEY}\`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      records: [{
        id: airtableRecordId, // You'll need to store this
        fields: {
          'Phone Number': phoneNumber,
          'SMS Consent': smsConsent,
          'SMS Consent Date': new Date().toISOString(),
        }
      }]
    })
  })
}
\`\`\`

## Next Steps

1. ✅ Run the SQL migration in Supabase
2. ✅ Update TypeScript types
3. ✅ Integrate `/onboarding` into Stripe success flow
4. ✅ Test the complete flow
5. ✅ Monitor SMS consent data in Supabase dashboard

## Support

If you encounter issues:
- Check Supabase logs for API errors
- Verify user is authenticated before accessing `/onboarding`
- Ensure all environment variables are set
- Check browser console for frontend errors
