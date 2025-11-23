# Power of the Prompt - Codebase Documentation

> **Last Updated:** 2025-11-23
> **Repository:** EllisIslandLab/Power_of_the_Prompt
> **Production URL:** weblaunchacademy.com

## Overview

This is a **production-ready Next.js 15 SaaS platform** for web development coaching (Web Launch Academy). The platform provides comprehensive tools for student management, video consultations, email marketing, payments, and gamification.

---

## Tech Stack

| Category | Technology | Version |
|----------|------------|---------|
| Framework | Next.js (App Router) | 15.4.4 |
| Language | TypeScript | 5.x |
| Frontend | React | 19.1.0 |
| Database | Supabase (PostgreSQL) | v17 |
| Auth | Supabase Auth | SSR |
| Payments | Stripe | Latest |
| Video | Jitsi Meet | Self-hosted compatible |
| Email | Resend + React Email | Latest |
| AI | Anthropic Claude | 0.68.0 |
| Styling | Tailwind CSS | v4 |
| UI Components | Radix UI / Shadcn | Latest |
| Caching | Upstash Redis | Serverless |
| Monitoring | Sentry | 10.22.0 |
| Hosting | Vercel | Serverless |
| CRM | Airtable | MCP Server |

---

## Directory Structure

```
/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/                # API routes (30+ endpoints)
│   │   │   ├── admin/          # Admin management APIs
│   │   │   ├── auth/           # Authentication endpoints
│   │   │   ├── consultations/  # Booking & scheduling
│   │   │   ├── sessions/       # Video session management
│   │   │   ├── emails/         # Email sending & tracking
│   │   │   ├── stripe/         # Payment webhooks
│   │   │   ├── scheduling/     # Calendar & availability
│   │   │   ├── demo-generator/ # AI demo generation
│   │   │   └── services/       # Service management
│   │   ├── admin/              # Admin dashboard pages
│   │   ├── portal/             # Student portal pages
│   │   └── [auth pages]        # signin, signup, forgot-password
│   ├── components/             # React components (67+ files)
│   │   ├── admin/              # Admin UI (CampaignComposer, etc.)
│   │   ├── auth/               # Auth forms & flows
│   │   ├── builder/            # Email/content builders
│   │   ├── ui/                 # Shadcn/Radix components
│   │   ├── video/              # Jitsi Meet integration
│   │   ├── demo-generator/     # Demo generation UI
│   │   └── shared/             # Shared components
│   ├── lib/                    # Utilities & services
│   │   ├── supabase.ts         # Supabase client
│   │   ├── stripe.ts           # Stripe config
│   │   ├── jitsi-config.ts     # Video conferencing
│   │   ├── rate-limiter.ts     # Upstash rate limiting
│   │   ├── schemas.ts          # Zod validation
│   │   ├── cache.ts            # Redis caching
│   │   ├── logger.ts           # Pino logging
│   │   └── permissions.ts      # RBAC
│   ├── types/                  # TypeScript types
│   │   └── database.ts         # Generated Supabase types
│   └── contexts/               # React contexts
├── supabase/                   # Database config
│   ├── config.toml             # Local dev config
│   └── migrations/             # SQL migrations
├── scripts/                    # Utility scripts (65+ files)
├── docs/                       # Documentation
└── public/                     # Static assets
```

---

## Key Features

### 1. Student Portal
- Secure authenticated access
- Textbook content browsing
- Resource management
- Course session tracking
- Points & achievement system

### 2. Consultation Booking
- Calendar-based availability
- Multiple session types (free, paid, group, workshops)
- Jitsi Meet video integration
- Session recording & access control
- Payment processing

### 3. Video Conferencing (Jitsi Meet)
- Browser-based (no downloads)
- Multiple session types with different durations
- Recording capability
- JWT authentication
- Max 10 participants per session

### 4. Email Marketing
- Campaign creation & sending
- Email tracking (opens, clicks)
- Template management with variables
- Batch sending
- Lead nurturing workflows

### 5. Payment System
- Stripe integration
- Multiple product tiers
- Checkout flow
- Subscription management

### 6. Admin Dashboard
- User management
- Campaign composer
- Lead management
- Template builder
- Analytics & reporting

### 7. Gamification
- Points system (attendance, engagement, referrals)
- Badges & achievements
- Referral tracking with rewards

### 8. AI Integration
- Anthropic Claude API
- Demo generation
- Content analysis

---

## Database Schema (35+ tables)

### Core Tables
- `users` - Authentication & profile data
- `profiles` - Extended user profiles
- `leads` - Lead/waitlist management
- `invite_tokens` - Invite-based signup

### Gamification
- `student_points` - Point tracking
- `badges` - Badge definitions
- `student_badges` - User badges
- `referrals` - Referral tracking

### Email & Marketing
- `campaigns` - Email campaigns
- `campaign_sends` - Individual sends
- `email_templates` - Reusable templates
- `template_categories` - Template organization

### Consultations
- `consultations` - Booked consultations
- `consultation_blocks` - Availability
- `federal_holidays` - Holiday management

### Courses
- `course_sessions` - Live/recorded sessions
- `attendance_log` - Attendance tracking
- `social_shares` - Social engagement

### Products
- `promo_codes` - Discount codes
- `affiliate_tiers` - Affiliate levels

---

## Environment Variables

### Required
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Upstash Redis
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Email (Resend)
RESEND_API_KEY=

# Anthropic AI
ANTHROPIC_API_KEY=

# Site Config
NEXT_PUBLIC_SITE_URL=
```

### Optional
```env
# Jitsi (for JWT auth)
NEXT_PUBLIC_JITSI_DOMAIN=
JITSI_JWT_SECRET=
JITSI_JWT_APP_ID=
JITSI_JWT_KID=

# Airtable CRM
AIRTABLE_API_KEY=
AIRTABLE_BASE_ID=

# Sentry Monitoring
SENTRY_DSN=
```

---

## API Routes

### Authentication (`/api/auth/`)
- `POST /signin` - User login (rate limited)
- `POST /signup` - Account creation
- `POST /signout` - Logout
- `POST /reset-password` - Password reset
- `POST /verify-email` - Email verification

### Admin (`/api/admin/`)
- `/templates` - Email template CRUD
- `/campaigns` - Campaign management
- `/leads` - Lead management
- `/users` - User management
- `/check-role` - Role verification

### Features
- `/consultations` - Booking management
- `/sessions` - Video session management
- `/emails` - Email operations
- `/scheduling` - Calendar & availability
- `/stripe` - Payment webhooks
- `/demo-generator` - AI demos
- `/services` - Service management
- `/batch` - Batch request processing

---

## Security Features

- **Authentication:** Supabase Auth with PKCE OAuth
- **Rate Limiting:** Upstash Redis sliding window
- **Password Policy:** Min 8 chars, uppercase, lowercase, number, special
- **Row-Level Security:** PostgreSQL RLS policies
- **Headers:** CSP, HSTS, X-Frame-Options
- **Validation:** Zod schema validation
- **Logging:** Structured Pino logging
- **Monitoring:** Sentry error tracking

---

## User Roles & Tiers

### Roles
- `student` - Standard user access
- `admin` - Full administrative access

### Tiers
- `basic` - Basic features
- `premium` - Premium features
- `vip` - VIP features + priority support
- `enterprise` - All features + custom support

---

## Development Commands

```bash
# Development
npm run dev          # Start dev server

# Production
npm run build        # Production build
npm start            # Start production server

# Linting
npm run lint         # ESLint checks

# Database (local)
npx supabase start   # Start local Supabase
npx supabase stop    # Stop local Supabase
```

---

## Local Development Ports

| Service | Port |
|---------|------|
| Next.js | 3000 |
| Supabase API | 54321 |
| Supabase DB | 54322 |
| Supabase Studio | 54323 |
| Inbucket (email) | 54324 |

---

## Common Patterns

### Form Validation
```typescript
import { signInSchema } from '@/lib/schemas';
const result = signInSchema.safeParse(data);
```

### Supabase Client
```typescript
import { createClient } from '@/lib/supabase';
const supabase = await createClient();
```

### Rate Limiting
```typescript
import { rateLimiter, checkRateLimit } from '@/lib/rate-limiter';
const { success } = await checkRateLimit(request, 'auth');
```

### Error Logging
```typescript
import { logger } from '@/lib/logger';
logger.error({ err, context }, 'Operation failed');
```

---

## Important Files

| File | Purpose |
|------|---------|
| `src/middleware.ts` | Auth middleware for protected routes |
| `src/lib/schemas.ts` | Centralized Zod validation schemas |
| `src/lib/permissions.ts` | Role-based access control |
| `src/lib/tier-permissions.ts` | Tier-based feature gating |
| `src/types/database.ts` | Generated Supabase types |
| `next.config.ts` | Next.js & security configuration |

---

## Documentation

- `/docs/architecture/overview.md` - System architecture
- `/docs/api/README.md` - API documentation
- `/docs/guides/getting-started.md` - Developer onboarding
- `/docs/deployment/production.md` - Production deployment
- `PHASE2A-IMPLEMENTATION.md` - Phase 2A features
- `JITSI_TESTING_GUIDE.md` - Video testing guide
- `EMAIL_TEMPLATE_BUILDER_GUIDE.md` - Email templates
- `POINTS_SYSTEM_README.md` - Gamification system

---

## Notes for Claude

### When working on this codebase:
1. **Always check existing patterns** - The codebase has consistent patterns for auth, validation, and error handling
2. **Use existing utilities** - Check `src/lib/` before creating new helpers
3. **Validate with Zod** - All API inputs should use schemas from `src/lib/schemas.ts`
4. **Respect RLS policies** - Database operations must work within Supabase RLS
5. **Rate limit auth routes** - Use Upstash rate limiting for sensitive endpoints
6. **Log structured data** - Use Pino logger for consistent logging
7. **Check tier permissions** - Some features are gated by user tier

### Key integrations to understand:
- **Supabase SSR** - Server-side auth with cookie management
- **Stripe webhooks** - Payment event handling
- **Jitsi Meet** - Video conferencing setup
- **Resend + React Email** - Transactional email templates
- **Upstash Redis** - Caching and rate limiting

### Testing considerations:
- No test framework currently configured
- Manual testing via Supabase Studio and API clients
- Inbucket available for local email testing
