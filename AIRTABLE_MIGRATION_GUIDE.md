# Airtable to Supabase Migration Guide

## Overview
This guide helps you migrate your Airtable data (Testimonials and Portfolio) to Supabase.

## Step 1: Export from Airtable

### Export Testimonial Submissions

1. Go to your Airtable base
2. Open the **Testimonial Submissions** table
3. Click the "..." menu (top right) → **Download CSV**
4. Save as `testimonials_export.csv`

**Expected columns:**
- Name
- Testimonial
- Status
- Submitted Date
- Email
- Arrangement
- Existing Lead User
- Updated Date
- Title/Role
- Avatar

### Export Portfolio

1. In the same Airtable base
2. Open the **Portfolio** table
3. Click the "..." menu (top right) → **Download CSV**
4. Save as `portfolio_export.csv`

**Expected columns:**
- Title
- Site Name
- Price
- Description
- Category
- Demo URL
- Technologies (comma-separated)
- Features (comma-separated)
- Image (URL)
- Backup URLs (comma-separated)
- Order

## Step 2: Import to Supabase

### Option A: Manual Import via Supabase Dashboard (Easiest)

1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/qaaautcjhztvjhizklxr)
2. Navigate to **Table Editor**
3. Select **testimonials** table
4. Click **Insert** → **Import data from CSV**
5. Upload `testimonials_export.csv`
6. Map the columns:
   - Name → name
   - Testimonial → testimonial
   - Status → status
   - Submitted Date → submitted_date
   - Email → email
   - Arrangement → arrangement
   - Existing Lead User → existing_lead_user (convert "Yes"/"No" to true/false)
   - Updated Date → updated_date
   - Title/Role → title_role
   - Avatar → avatar

7. Repeat for **portfolio** table with `portfolio_export.csv`:
   - Title → title
   - Site Name → site_name
   - Price → price
   - Description → description
   - Category → category
   - Demo URL → demo_url
   - Technologies → technologies (convert comma-separated to array)
   - Features → features (convert comma-separated to array)
   - Image → image_url (extract URL from attachment)
   - Backup URLs → backup_urls (convert comma-separated to array)
   - Order → order

### Option B: Programmatic Import (if you have many records)

I can create a migration script that reads the CSV files and imports them using the Supabase API if needed.

## Step 3: Verify Migration

After importing:

1. Check record counts match:
   ```sql
   SELECT COUNT(*) FROM testimonials;
   SELECT COUNT(*) FROM portfolio;
   ```

2. Spot check a few records to ensure data integrity

3. Test the API endpoints:
   - GET `/api/testimonials` - should return testimonials
   - POST `/api/testimonials/submit` - should create new testimonial
   - GET `/api/portfolio` - should return portfolio items

## Step 4: Update Code

The API routes have been updated to use Supabase. After verifying the migration works:

1. Remove Airtable dependencies from package.json
2. Remove AIRTABLE_API_KEY and AIRTABLE_BASE_ID from environment variables
3. Delete `/home/ellis/weblaunchcoach/src/lib/airtable.ts`

## Rollback Plan

If you need to rollback:
1. Keep the Airtable credentials in your environment variables for 30 days
2. The old code can be restored from git history if needed
3. Supabase tables can be dropped without affecting other data

## Data Saved

After migration, you can save the CSV exports to a backup location:
- `/home/ellis/weblaunchcoach/backups/airtable/testimonials_export.csv`
- `/home/ellis/weblaunchcoach/backups/airtable/portfolio_export.csv`

Or convert to markdown format for documentation if preferred.
