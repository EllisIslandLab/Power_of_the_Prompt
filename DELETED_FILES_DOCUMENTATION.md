# Deleted Files and Database Connections Documentation

This document tracks files that were deleted during the cleanup on 2025-11-29 and their connections to Supabase tables.

## Files Being Kept (Active Two-Page Flow)

### 1. `/src/app/get-started/page.tsx`
- **Purpose**: Round 1 - Basic business information form
- **Database Tables Used**:
  - `users` (email, first_name, business_name)
  - `demo_projects` (stores Round 1 data temporarily in localStorage before save)
- **Flow**: Collects data → Saves to localStorage → Redirects to `/get-started-phase2`

### 2. `/src/app/get-started-phase2/page.tsx`
- **Purpose**: Round 2 - Interactive category selection
- **Database Tables Used**:
  - `website_categories` (fetches categories via `/api/categories/list`)
  - `website_subcategories` (fetches subcategories via `/api/categories/subcategories`)
- **Flow**: User selects category/subcategory → Saves to localStorage → Continues to Round 3

## Files Being Deleted

### 1. `/src/app/get-started/success/page.tsx`
- **Purpose**: Payment success page after Stripe checkout
- **Database Tables**:
  - `demo_projects` (reads project data)
  - Processes Stripe session via `/api/demo-generator/process-payment`
- **Reconnection Note**: If we need a success page in the future, recreate with:
  - Read from `demo_projects` by project ID
  - Call `/api/demo-generator/process-payment` with session_id
  - Display PreviewModal component

### 2. `/src/app/get-started/preview/[projectId]/page.tsx`
- **Purpose**: Display AI-generated website preview
- **Database Tables**:
  - `demo_projects` (SELECT * WHERE id = projectId)
  - `users` (SELECT available_ai_credits WHERE email = project.email)
- **Important Fields Used**:
  - `demo_projects.generated_components` (AI-generated content)
  - `demo_projects.email` (to look up user credits)
  - `users.available_ai_credits` (to check if user can refine)
- **Reconnection Note**: To recreate preview functionality:
  ```sql
  SELECT dp.*, u.available_ai_credits
  FROM demo_projects dp
  JOIN users u ON u.email = dp.email
  WHERE dp.id = $projectId
  ```

### 3. `/src/app/get-started/[...path]/page.tsx`
- **Purpose**: Catch-all route (unclear functionality)
- **Database**: Unknown - may not connect to DB
- **Reconnection Note**: Check if this was needed for dynamic routing

### 4. Empty API Directories (no route.ts files):
- `/src/app/api/ai/verify-email/` - EMPTY
- `/src/app/api/ai/generate-first-preview/` - EMPTY

### 5. Existing API Routes (NOT being deleted, for reference):
- `/src/app/api/ai/send-verification-email/` - Sends 6-digit codes to Redis
- `/src/app/api/ai/verify-code/` - Validates codes from Redis
- `/src/app/api/ai/generate-preview/` - Generates AI previews
- `/src/app/api/ai/refine-component/` - Refines specific components

## Critical Database Tables for Future Reconnection

### `demo_projects` Table
Key columns used by deleted pages:
- `id` - Primary key for project lookups
- `email` - Links to users table
- `generated_components` - JSON with AI-generated content
- `business_name` - Display name
- `tagline` - AI-generated tagline
- `category_id` - Links to `website_categories`
- `subcategory_id` - Links to `website_subcategories`
- `ai_credits_used` - Tracks how many AI generations used
- `was_free_generation` - Boolean for first free preview

### `users` Table
Key columns:
- `email` - Primary identifier
- `available_ai_credits` - Number of refinements available
- `free_tokens_claimed` - Boolean if they got free preview
- `total_ai_credits` - Total purchased

### `website_categories` & `website_subcategories`
- Used by phase2 page (KEEPING THIS CONNECTION)
- Fetched via `/api/categories/list` and `/api/categories/subcategories`

## Workflow That Was Deleted

Old flow (being removed):
1. Round 1 form → localStorage
2. Phase 2 category selection → localStorage
3. ~~Round 3 (???) → Verification page~~ (DELETED)
4. ~~Verify email → Deep-dive page~~ (DELETED)
5. ~~Deep-dive → AI generation~~ (DELETED)
6. ~~Preview page~~ (DELETED)
7. ~~Purchase → Success page~~ (DELETED)

New flow (simplified):
1. Round 1 form → localStorage
2. Phase 2 category selection → localStorage
3. (FUTURE: To be determined - save to database and redirect somewhere)

## Reconnection Guide

To reconnect deleted functionality in the future:

1. **Preview Page**: Create new route that:
   - Queries `demo_projects` by ID
   - Joins with `users` to get credit balance
   - Renders preview with upgrade options

2. **Success Page**: Create route that:
   - Accepts `session_id` from Stripe
   - Calls payment processing API
   - Shows success message with preview link

3. **Verification**: Use existing:
   - `/api/ai/send-verification-email` (already exists)
   - `/api/ai/verify-code` (already exists)
   - Redis keys: `verification:email:{email}` (10-minute TTL)
