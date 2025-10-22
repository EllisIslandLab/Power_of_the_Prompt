# Update Lead Names in Supabase

## Step 1: Add Name Columns to Leads Table

Run this SQL in your Supabase SQL Editor:

```sql
-- Add name fields to leads table
ALTER TABLE leads
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT,
ADD COLUMN IF NOT EXISTS display_name TEXT;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_leads_display_name ON leads(display_name);
```

## Step 2: Update Lead Names

After adding the columns, run this SQL to update your existing leads:

```sql
-- Update lead names
UPDATE leads SET
  first_name = 'Jordan',
  last_name = 'Barnabas',
  display_name = 'Barnabas, Jordan'
WHERE email = 'barnabas.financial.coach.1@gmail.com';

UPDATE leads SET
  first_name = 'Patrick',
  last_name = 'Frare',
  display_name = 'Frare, Patrick'
WHERE email = 'frare.patrick@gmail.com';

UPDATE leads SET
  first_name = 'Kayla',
  last_name = 'Irish',
  display_name = 'Irish, Kayla'
WHERE email = 'kayla.jain.irish@gmail.com';

UPDATE leads SET
  first_name = 'Natalie',
  last_name = 'Kaibel',
  display_name = 'Kaibel, Natalie'
WHERE email = 'coachkaibel@gmail.com';

UPDATE leads SET
  first_name = 'Mitch',
  last_name = 'Mecaestrom',
  display_name = 'Mecaestrom, Mitch'
WHERE email = 'mecaekstrom@aim.com';

UPDATE leads SET
  first_name = 'John',
  last_name = 'Paschall',
  display_name = 'Paschall, John'
WHERE email = 'purposeandplenty@gmail.com';

UPDATE leads SET
  first_name = 'Erika',
  last_name = 'Warrick',
  display_name = 'Warrick, Erika'
WHERE email = 'ewarrick1@gmail.com';
```

## Step 3: Verify the Updates

```sql
SELECT email, first_name, last_name, display_name
FROM leads
WHERE email IN (
  'barnabas.financial.coach.1@gmail.com',
  'frare.patrick@gmail.com',
  'kayla.jain.irish@gmail.com',
  'coachkaibel@gmail.com',
  'mecaekstrom@aim.com',
  'purposeandplenty@gmail.com',
  'ewarrick1@gmail.com'
)
ORDER BY display_name;
```

## OR Use the API Endpoint

Alternatively, after running Step 1 SQL above, you can call this API endpoint to update all names at once:

```bash
curl -X POST http://localhost:3000/api/admin/update-names
```

Or visit this URL in your browser while logged in as admin:
```
http://localhost:3000/api/admin/update-names
```

## Available Placeholders in Emails

After this update, you can use these placeholders in your email campaigns:

- `{{name}}` - Uses display_name, then first_name, or "there" if neither exists
- `{{first_name}}` - The person's first name
- `{{last_name}}` - The person's last name
- `{{course_name}}` - From environment variable or default
- `{{course_description}}` - From environment variable or default
- `{{course_url}}` - From environment variable or default
- `{{unsubscribe_url}}` - Automatically generated

## Example Email Template

```
Hi {{name}},

We're excited to announce {{course_name}}!

{{course_description}}

Ready to get started? Visit: {{course_url}}

Best regards,
The Web Launch Academy Team

---
Not interested? {{unsubscribe_url}}
```
