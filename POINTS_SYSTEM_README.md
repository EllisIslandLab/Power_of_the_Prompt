# Points & Gamification System - Implementation Guide

## Overview

This document describes the new student points and gamification system implemented for Web Launch Academy. The system tracks student engagement across multiple categories and includes badges, referrals, and an affiliate program.

## What Was Changed

### Tables Removed (Cleanup)
- `sessions` - Unused empty table
- `sessions_with_users` - Unused empty table
- `video_sessions` - Unused table from old project
- `students` - Migrated to `users` table previously
- `waitlist` - Migrated to `leads` table previously

### New Tables Added

#### 1. **student_points**
Tracks points earned by students across different categories:
- `attendance_points` - Points from attending live sessions or watching recordings
- `engagement_points` - Points from social media shares and other engagement
- `referral_signup_points` - 2500 points per referral signup (discount only)
- `referral_cash_points` - Points convertible to cash from referrals
- `bonus_points` - Points from achievements/badges
- `total_points` - Auto-calculated sum of all point categories

#### 2. **badges**
Defines available achievements:
- Badge name, description, category
- Points value
- Tier (bronze, silver, gold)

**Default Badges:**
- Perfect Attendance (500 pts, gold)
- Early Bird (100 pts, bronze)
- Social Butterfly (250 pts, silver)
- First Referral (100 pts, bronze)
- Super Referrer (1000 pts, gold)
- Quality Code (300 pts, silver)

#### 3. **student_badges**
Tracks which badges have been awarded to which students:
- User ID, Badge ID
- When awarded, by whom
- Optional notes

#### 4. **course_sessions**
Course sessions for attendance tracking:
- Session name, date
- Check-in code (expires after session)
- Recording URL and availability window
- Points awarded (live vs recording)

#### 5. **attendance_log**
Records student attendance:
- User ID, Session ID
- Type (live or recording)
- Points awarded
- Watch duration (for recordings)

#### 6. **social_shares**
Tracks social media engagement:
- Platform (Twitter, LinkedIn, Instagram, Facebook, other)
- Post URL
- Screenshot URL (stored in Supabase Storage)
- Status (pending, approved, rejected)
- Points awarded
- Reviewer and notes

#### 7. **referrals**
Enhanced referral tracking:
- Referrer and referee info
- Status (lead, paid, processed, held)
- Points breakdown (signup vs cash)
- 30-day hold period after payment
- Purchase details

#### 8. **affiliate_tiers**
Configurable commission tiers:
- Max cash per referral
- Percentage bonus
- Purchase count limits
- Total cap percentage

**Default Tiers:**
- **Tier 1**: $50 max/referral, 5% bonus, 10% total cap
- **Tier 2**: $75 max/referral, 7% bonus, 12% total cap (unlock after 5 referrals)

### Modified Tables

#### **users** table
Added:
- `affiliate_tier_id` - Links to affiliate_tiers table

### New RPC Functions

All functions are SECURITY DEFINER and can only be called by authenticated users or service role:

```typescript
// Add points to a user's account
add_attendance_points(p_user_id: UUID, p_points: INTEGER)
add_engagement_points(p_user_id: UUID, p_points: INTEGER)
add_referral_signup_points(p_user_id: UUID, p_points: INTEGER)
add_referral_cash_points(p_user_id: UUID, p_points: INTEGER)
add_bonus_points(p_user_id: UUID, p_points: INTEGER)
```

## How To Apply The Migration

### Step 1: Review the Migration
The migration file is located at:
```
supabase/migrations/20251023000001_cleanup_and_add_points_system.sql
```

### Step 2: Apply to Your Database

**Option A: If using Supabase CLI locally:**
```bash
npx supabase db push
```

**Option B: If using Supabase Dashboard:**
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy the contents of the migration file
4. Run the SQL

**Option C: Direct PostgreSQL connection:**
```bash
psql "$DATABASE_URL" < supabase/migrations/20251023000001_cleanup_and_add_points_system.sql
```

### Step 3: Verify Migration Success

After running the migration, verify:

```bash
# Run this script to check tables
node -e "
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
  const tables = ['student_points', 'badges', 'course_sessions', 'attendance_log', 'social_shares', 'referrals', 'affiliate_tiers'];
  for (const table of tables) {
    const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
    console.log(error ? \`❌ \${table}\` : \`✓ \${table} (\${count} rows)\`);
  }
}
check();
"
```

## Usage Examples

### 1. Award Attendance Points
```typescript
import { getSupabase } from '@/lib/supabase'

const supabase = getSupabase(true) // service role

// When student checks in to live session
await supabase.rpc('add_attendance_points', {
  p_user_id: userId,
  p_points: 10
})
```

### 2. Create a Course Session
```typescript
const { data: session } = await supabase
  .from('course_sessions')
  .insert({
    session_name: 'Introduction to Next.js',
    session_date: '2025-10-25T18:00:00Z',
    session_code: 'NEXT101',
    code_expires_at: '2025-10-25T20:00:00Z',
    live_points: 10,
    recording_points: 5
  })
  .select()
  .single()
```

### 3. Record Attendance
```typescript
const { data } = await supabase
  .from('attendance_log')
  .insert({
    user_id: userId,
    session_id: sessionId,
    attendance_type: 'live',
    points_awarded: 10
  })
```

### 4. Submit Social Media Share
```typescript
const { data } = await supabase
  .from('social_shares')
  .insert({
    user_id: userId,
    platform: 'twitter',
    post_url: 'https://twitter.com/user/status/123',
    screenshot_url: 'path/to/screenshot.png'
  })
```

### 5. Get User's Points
```typescript
const { data: points } = await supabase
  .from('student_points')
  .select('*')
  .eq('user_id', userId)
  .single()

console.log(`Total points: ${points.total_points}`)
console.log(`Attendance: ${points.attendance_points}`)
console.log(`Engagement: ${points.engagement_points}`)
```

### 6. Award a Badge
```typescript
const { data } = await supabase
  .from('student_badges')
  .insert({
    user_id: userId,
    badge_id: badgeId,
    awarded_by: adminUserId,
    notes: 'Completed 3 months perfect attendance'
  })

// Also award bonus points
await supabase.rpc('add_bonus_points', {
  p_user_id: userId,
  p_points: 500
})
```

## Row Level Security (RLS)

All tables have RLS enabled with the following policies:

- **Students can view their own** points, badges, attendance, shares, and referrals
- **Students can insert** their own attendance and social shares
- **Admins can manage all** data across all tables
- **Everyone can view** badges, course sessions, and affiliate tiers

## Next Steps - Frontend Implementation

### 1. Student Dashboard
- Display total points with breakdown by category
- Show earned badges with progress toward next badges
- Leaderboard (optional)

### 2. Attendance System
- Check-in interface for live sessions (enter session code)
- Recording viewing tracker
- Attendance history

### 3. Social Media Submission
- Form to submit social shares
- Upload screenshot
- Track approval status

### 4. Referral Dashboard
- Unique referral link
- Track referrals (leads, conversions, points)
- View tier status and benefits

### 5. Admin Interface
- Create course sessions with check-in codes
- Approve/reject social media submissions
- Award badges manually
- View all student points and activity

## TypeScript Types

All types are available in `src/types/database.ts`:

```typescript
import type {
  StudentPoints,
  Badge,
  StudentBadge,
  CourseSession,
  AttendanceLog,
  SocialShare,
  Referral,
  AffiliateTier
} from '@/types/database'
```

## Database Schema Diagram

```
users
  ├─> student_points (points tracking)
  ├─> student_badges (earned badges)
  ├─> attendance_log (session attendance)
  ├─> social_shares (engagement)
  ├─> referrals (as referrer)
  └─> affiliate_tiers (tier info)

course_sessions
  └─> attendance_log (students who attended)

badges
  └─> student_badges (students who earned)
```

## Support & Questions

For questions about this implementation:
1. Check the migration file for detailed SQL comments
2. Review the TypeScript types in `src/types/database.ts`
3. Test queries in Supabase SQL Editor

## Rollback (If Needed)

If you need to rollback this migration:

```sql
-- WARNING: This will delete all points data!
DROP TABLE IF EXISTS student_badges CASCADE;
DROP TABLE IF EXISTS attendance_log CASCADE;
DROP TABLE IF EXISTS social_shares CASCADE;
DROP TABLE IF EXISTS referrals CASCADE;
DROP TABLE IF EXISTS student_points CASCADE;
DROP TABLE IF EXISTS course_sessions CASCADE;
DROP TABLE IF EXISTS badges CASCADE;
DROP TABLE IF EXISTS affiliate_tiers CASCADE;

ALTER TABLE users DROP COLUMN IF EXISTS affiliate_tier_id;

-- Drop RPC functions
DROP FUNCTION IF EXISTS add_attendance_points;
DROP FUNCTION IF EXISTS add_engagement_points;
DROP FUNCTION IF EXISTS add_referral_signup_points;
DROP FUNCTION IF EXISTS add_referral_cash_points;
DROP FUNCTION IF EXISTS add_bonus_points;
```
