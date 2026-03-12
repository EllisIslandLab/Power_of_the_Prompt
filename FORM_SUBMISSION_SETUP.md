# Form Submissions System - Setup Guide

This guide will help you complete the setup of the client form submission system.

## What Was Built

### ✅ Completed Components

1. **Database Migration** - `supabase/migrations/20260312000001_create_form_submissions.sql`
   - Creates `form_submissions` table
   - Includes RLS policies for users and admins
   - Auto-updating timestamps

2. **Form Components**
   - `src/components/portal/forms/RevisionStartForm.tsx`
   - `src/components/portal/forms/RevisionModifierForm.tsx`
   - `src/components/portal/forms/VideoConferenceForm.tsx`
   - Includes validation, character limits, auto-expanding textareas

3. **API Routes**
   - `src/app/api/portal/form-submissions/route.ts` - Create & List submissions
   - `src/app/api/portal/form-submissions/[id]/route.ts` - Update & Delete submissions

4. **Support Page** - `src/app/portal/support/page.tsx`
   - Refactored with tabs: FAQ, Contact Support, My Tickets, Admin Dashboard
   - Sub-tabs for the three form types
   - Removed example content

5. **Admin Dashboard** - `src/components/portal/AdminDashboard.tsx`
   - View all submissions
   - Filter and search
   - Edit status and add notes
   - CSV export
   - Soft delete (archive)

6. **Email Notifications**
   - Sent via Resend to hello@weblaunchacademy.com
   - Professional HTML templates
   - Includes all submission details
   - Link to admin dashboard

## 🚀 Setup Steps

### Step 1: Apply the Database Migration

**Option A: Supabase Dashboard (Recommended)**

1. Open Supabase SQL Editor:
   https://supabase.com/dashboard/project/qaaautcjhztvjhizklxr/sql/new

2. Copy the contents of:
   `supabase/migrations/20260312000001_create_form_submissions.sql`

3. Paste into the SQL Editor and click "Run"

4. Verify the table was created:
   https://supabase.com/dashboard/project/qaaautcjhizklxr/editor
   (Look for `form_submissions` table)

**Option B: Supabase CLI**

```bash
npx supabase db push --db-url "postgresql://postgres.qaaautcjhztvjhizklxr:Ilikeall314$@db.qaaautcjhztvjhizklxr.supabase.co:5432/postgres"
```

### Step 2: Update TypeScript Types (Optional but Recommended)

After creating the table, regenerate your database types:

```bash
npx supabase gen types typescript --db-url "postgresql://postgres.qaaautcjhztvjhizklxr:Ilikeall314$@db.qaaautcjhztvjhizklxr.supabase.co:5432/postgres" > src/types/database-new.ts
```

Then manually merge the new `form_submissions` type into `src/types/database.ts`.

### Step 3: Test the Forms

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to: http://localhost:3000/portal/support

3. Test each form:
   - Revision Start Round
   - Revision Modifier Round
   - Video Conference Request

4. Check that submissions appear in "My Tickets" tab

5. If you're an admin, check the "Admin Dashboard" tab

### Step 4: Verify Email Notifications

1. Submit a test form
2. Check hello@weblaunchacademy.com for the notification email
3. Verify the email contains:
   - All form details
   - Professional formatting
   - Link to admin dashboard

## 📋 Features

### For Clients

- **Revision Start Form**
  - Select change types (checkboxes)
  - 2000 character limit
  - Auto-expanding textarea
  - Character counter
  - Important notice about major features

- **Revision Modifier Form**
  - All Revision Start features
  - Plus: Radio buttons for modification type
  - (Modifying / Adding / Both)

- **Video Conference Form**
  - Topic 1 (required): Name + Details (500 chars)
  - Topic 2 (optional): Name + Details (500 chars)
  - Character counters for both

- **My Tickets Tab**
  - View all own submissions
  - See current status
  - Track progress

### For Admins

- **Admin Dashboard** (visible only to users with role='admin')
  - View ALL submissions in table format
  - Filter by: Status, Form Type
  - Search by: Name, Email, Content
  - Sort by date
  - Edit modal to:
    - Update status (new/reviewed/in-progress/completed/archived)
    - Add internal notes
  - Delete (soft delete → archived)
  - Export to CSV

### Email Notifications

Every form submission sends an email to hello@weblaunchacademy.com with:
- Form type indicator
- Client name and email
- Submission timestamp
- All form details (checkboxes, instructions, or topics)
- Direct link to view/edit in admin dashboard

## 🗂 File Structure

```
src/
├── app/
│   ├── api/portal/form-submissions/
│   │   ├── route.ts                    # POST (create), GET (list)
│   │   └── [id]/route.ts               # PATCH (update), DELETE (archive)
│   └── portal/support/
│       └── page.tsx                    # Main support page
├── components/
│   ├── portal/
│   │   ├── AdminDashboard.tsx          # Admin view component
│   │   └── forms/
│   │       ├── RevisionStartForm.tsx
│   │       ├── RevisionModifierForm.tsx
│   │       └── VideoConferenceForm.tsx
│   └── ui/
│       └── radio-group.tsx             # New UI component
└── types/
    └── database.ts                     # TypeScript types (needs update)

supabase/
└── migrations/
    └── 20260312000001_create_form_submissions.sql
```

## 🔐 Security

- ✅ Row Level Security (RLS) enabled
- ✅ Users can only view/create their own submissions
- ✅ Admins can view/edit all submissions
- ✅ Server-side authentication checks
- ✅ Soft deletes (archived status)

## 🐛 Troubleshooting

### Forms not submitting?
- Check browser console for errors
- Verify user is authenticated
- Ensure migration was applied

### Not receiving emails?
- Verify RESEND_API_KEY in .env.local
- Check Resend dashboard for send logs
- Verify sender domain is verified

### Admin dashboard not showing?
- Check user role in database: `SELECT role FROM users WHERE email = 'your@email.com'`
- Update if needed: `UPDATE users SET role = 'admin' WHERE email = 'your@email.com'`

### TypeScript errors?
- Regenerate database types (see Step 2)
- Or temporarily add `// @ts-ignore` above errors

## 📝 Next Steps

1. Customize the FAQ content in the support page
2. Add more detailed instructions to form placeholders
3. Set up Vercel environment variables for production
4. Consider adding file upload for images (future enhancement)
5. Add email templates for client confirmations (optional)

## ✅ Testing Checklist

- [ ] Migration applied successfully
- [ ] Form submissions save to database
- [ ] Emails sent to hello@weblaunchacademy.com
- [ ] "My Tickets" shows user's submissions
- [ ] Admin dashboard shows all submissions (admin only)
- [ ] Can update status and notes
- [ ] CSV export works
- [ ] RLS policies working (users see only their data)

---

**Need Help?**

If you encounter any issues:
1. Check the browser console for errors
2. Check the API route logs
3. Verify Supabase table and RLS policies
4. Check Resend email logs

