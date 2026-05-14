# Database Cleanup & Security Analysis

## 🚨 Critical Issues Found

### Security Advisors Summary
- **Total Issues**: 129
- **ERRORS**: 5 (Critical)
- **WARNINGS**: 124

### Top 5 Critical Security Issues
1. **Security Definer Views** (5 errors)
   - `client_account_summary` - SECURITY DEFINER view bypasses RLS
   - `revenue_metrics` - SECURITY DEFINER view bypasses RLS  
   - `pending_work_summary` - SECURITY DEFINER view bypasses RLS
   - 2 more views with same issue
   - [Fix Guide](https://supabase.com/docs/guides/database/database-linter?lint=0010_security_definer_view)

2. **Function Search Path Issues** (50 warnings)
   - Functions with mutable search paths can be exploited

3. **Security Definer Function Access** (60 warnings)
   - Anonymous and authenticated users can execute security definer functions

4. **RLS Always True Policies** (13 warnings)
   - Some RLS policies always evaluate to true (ineffective security)

5. **Password Protection** (1 warning)
   - Missing leaked password protection

### Admin Role Issue ⚠️
**Problem**: Your account (mattjellis1@gmail.com) has role `student`, not `admin`
- This may block you from testing admin-only features
- Admin account is: hello@weblaunchacademy.com

**Quick Fix**: Change your role to `admin`:
```sql
UPDATE users SET role = 'admin' WHERE email = 'mattjellis1@gmail.com';
```

---

## 📊 Database Overview

**Total Tables**: 64
**Tables with Data**: 7 (only 11%!)
**Empty Tables**: 57 (89% can be dropped)

### Tables with Data
| Table | Rows | Purpose | Keep? |
|-------|------|---------|-------|
| `client_accounts` | 9 | Portal billing | ✅ YES |
| `user_presence` | 7 | User online status | ❓ Maybe |
| `invite_tokens` | 2 | User invites | ✅ YES |
| `users` | 2 | Core users | ✅ YES |
| `cohort_members` | 2 | Student cohorts | ❌ NO (remove student features) |
| `leads` | 1 | Marketing leads | ❓ Maybe |
| `form_submissions` | 1 | Portal support forms | ✅ YES |

---

## 🎯 Cleanup Paths

### PATH 1: Aggressive Cleanup (Website Management Only)
**Remove**: Student features, website creation, unused marketing
**Keep**: Portal, billing, core users

#### Tables to DROP (51 tables):
**Student/Learning (9 tables)**
- attendance_log
- cohorts
- cohort_members
- course_sessions
- lesson_plans
- lesson_progress
- student_points
- student_badges
- social_shares

**Website Creation/Builder (13 tables)**
- business_categories
- boilerplate_versions
- components
- component_versions
- component_ratings
- template_categories
- niche_templates
- demo_projects
- website_categories
- website_subcategories
- deep_dive_questions
- demo_interactions
- verification_codes

**Marketing/Sales (5 tables)**
- campaigns
- campaign_sends
- leads
- email_templates
- user_emails

**Unused Commerce (9 tables)**
- products
- content_types
- product_contents
- purchases
- user_purchases
- session_usage
- availability_slots
- session_bookings
- stripe_checkout_sessions

**Unused Features (15 tables)**
- referrals
- affiliate_badge_clicks
- affiliate_compensations
- ai_interaction_logs
- video_progress
- website_pages
- lighthouse_scores
- testimonials
- portfolio
- user_presence

#### Tables to KEEP (13 tables):
**Core**
- users
- invite_tokens

**Portal & Billing**
- client_accounts
- revision_conversations
- revision_chat_messages
- database_work_requests
- deployment_notifications
- client_preferences
- deployment_history
- client_website_config
- client_uploaded_images
- user_settings
- payment_methods
- connected_services
- database_backups
- form_submissions

---

### PATH 2: Moderate Cleanup (Keep Marketing)
**Remove**: Student features, website creation
**Keep**: Portal, billing, marketing/leads

#### Additional tables to KEEP:
- leads
- campaigns
- campaign_sends
- email_templates
- referrals
- affiliate_badge_clicks
- affiliate_compensations

**Total to drop**: 44 tables

---

### PATH 3: Conservative Cleanup (Remove Only Student Features)
**Remove**: Only student/cohort functionality
**Keep**: Everything else for now

#### Tables to DROP (9 tables):
- attendance_log
- cohorts
- cohort_members
- course_sessions
- lesson_plans
- lesson_progress
- student_points
- student_badges
- social_shares

**Total to drop**: 9 tables

---

## 🔧 Immediate Fixes (Required for All Paths)

### 1. Fix Security Definer Views
```sql
-- Drop insecure views and recreate without SECURITY DEFINER
DROP VIEW IF EXISTS client_account_summary CASCADE;
DROP VIEW IF EXISTS revenue_metrics CASCADE;
DROP VIEW IF EXISTS pending_work_summary CASCADE;

-- Recreate with proper RLS instead
-- (Views should be rewritten to use regular permissions)
```

### 2. Fix Admin Role for Testing
```sql
UPDATE users 
SET role = 'admin' 
WHERE email = 'mattjellis1@gmail.com';
```

### 3. Add Missing RLS Policies
(Specific policies depend on which tables you keep)

---

## 📝 Migration Scripts

I can generate migration scripts for any path you choose. Each will:
1. ✅ Back up data from tables with rows
2. ✅ Drop unused tables
3. ✅ Fix security definer views
4. ✅ Update RLS policies
5. ✅ Clean up foreign key constraints

---

## 🤔 Recommendation

**I recommend PATH 1 (Aggressive Cleanup)** because:
- You're pivoting to **website management** (not creation)
- You're removing **student/cohort features**
- **89% of tables are empty** anyway
- Cleaner database = easier to maintain
- Fewer security vulnerabilities
- Better performance

You can always re-add tables later if needed.

---

## ✅ Next Steps

**Choose a path** and I'll:
1. Generate the cleanup migration
2. Fix the critical security issues
3. Update your admin role
4. Test the payment flow
5. Verify everything works

Which path would you like to take?
