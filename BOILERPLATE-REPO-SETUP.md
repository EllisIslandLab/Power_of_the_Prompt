# GitHub Boilerplate Repository Setup Guide

## Overview

The Phase 1 architecture uses a **hybrid storage model** where:
- **GitHub Repository** = Next.js boilerplate (framework, config, standard components)
- **Supabase Database** = User-generated components and templates

This saves 88% of storage space (10KB vs 500KB per template).

## Current Status

⚠️ **The boilerplate repository has NOT been created yet.**

The migration references `https://github.com/weblaunchacademy/nextjs-boilerplate` but this is a placeholder.

## Two Approaches to Implementation

### Option 1: Create Dedicated Boilerplate Repo (Recommended for Production)

**Pros:**
- Clean separation of concerns
- Version control for boilerplate
- Easy to update all sites at once
- Matches the original Phase 1 architecture

**Cons:**
- Requires creating and maintaining another repo
- More complex deployment process

**Steps:**
1. Create new GitHub repo: `weblaunchacademy/nextjs-boilerplate`
2. Set up basic Next.js 15 structure:
   ```
   nextjs-boilerplate/
   ├── app/
   │   ├── layout.tsx (with WebLaunchBadge)
   │   └── page.tsx (placeholder that gets replaced)
   ├── components/
   │   └── WebLaunchBadge.tsx
   ├── lib/
   │   └── siteData.ts (template for user data injection)
   ├── package.json
   ├── next.config.js
   └── tsconfig.json
   ```
3. Update boilerplate_versions table with correct repo URL
4. Implement assembly system in `/lib/generators/assembleTemplate.ts`

### Option 2: Self-Contained Template System (Easier for MVP)

**Pros:**
- No external repo needed
- Simpler to test and deploy
- Faster to implement
- Still gets most of the storage savings

**Cons:**
- Less clean architecture
- Harder to update boilerplate globally

**Implementation:**
- Store "boilerplate" as a template in Supabase
- Mark it as `is_boilerplate: true`
- Assembly system pulls from Supabase instead of GitHub
- Can migrate to GitHub repo later without breaking anything

## Recommended Approach for Now

**Use Option 2 (Self-Contained) for the MVP**, then migrate to Option 1 when you're ready to scale.

### Quick Implementation:

1. Create a `demo_boilerplate` table in Supabase:
```sql
CREATE TABLE demo_boilerplate (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  version text NOT NULL,
  files jsonb NOT NULL, -- { "app/layout.tsx": "...", "package.json": "..." }
  is_current boolean DEFAULT false,
  created_at timestamp DEFAULT now()
);
```

2. Store boilerplate files as JSON:
```json
{
  "package.json": "{...}",
  "app/layout.tsx": "export default function...",
  "components/WebLaunchBadge.tsx": "export function...",
  ...
}
```

3. Assembly function pulls from Supabase instead of cloning repo

## When to Create the GitHub Repo

Create the dedicated boilerplate repo when:
- You have multiple approved templates
- You need to update the Next.js version across all sites
- You're ready to implement the download/assembly system
- You want to enable version rollback

## Migration Path

Moving from Option 2 → Option 1 later:
1. Create GitHub repo with files from Supabase
2. Update `boilerplate_versions` table
3. Update assembly system to use git clone
4. No changes needed to user-facing features

## Current State

For now, the system works without the boilerplate repo because:
- We're building the **form system** and **session management**
- Preview generation will initially use static templates
- Download functionality is placeholder until assembly is implemented

**You can continue development without creating the repo yet.**

## Action Items

**Immediate (for testing):**
- [ ] Nothing - current setup works for form testing

**Before launching download feature:**
- [ ] Decide between Option 1 or Option 2
- [ ] Implement assembly system
- [ ] Test end-to-end download flow

**For production:**
- [ ] Create GitHub boilerplate repo (Option 1)
- [ ] Set up version control system
- [ ] Implement badge component
- [ ] Test assembly and injection
