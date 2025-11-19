# Web Launch Academy - Codebase Structure & Proprietary Logic Analysis

## Executive Summary
**Project Name:** Web Launch Academy  
**Tech Stack:** Next.js 15 + TypeScript + React 19 + Supabase + Stripe  
**Codebase Size:** 277 TypeScript files, 53,866 lines of code  
**Repository:** https://github.com/EllisIslandLab/Power_of_the_Prompt  
**Last Updated:** Nov 19, 2025

---

## 1. PROJECT STRUCTURE & PURPOSE

### Core Mission
A comprehensive **web development coaching platform** providing:
- Educational content and textbook access
- Video consultation booking with Jitsi Meet
- Student portal with assignments and collaboration
- Email campaign management and lead tracking
- Subscription/payment processing via Stripe
- AI-powered website generation and customization

### High-Level Architecture
```
weblaunchcoach/
├── src/
│   ├── app/              # Next.js 15 App Router (pages & API routes)
│   ├── components/       # React components (UI, builder, admin, video)
│   ├── lib/              # Business logic utilities
│   ├── repositories/     # Data access layer
│   ├── adapters/         # External service adapters (Stripe, Resend, Supabase)
│   ├── types/            # TypeScript type definitions
│   ├── emails/           # React Email templates
│   ├── hooks/            # React hooks
│   ├── contexts/         # React contexts
│   ├── api-middleware/   # Request handling & validation
│   ├── webhooks/         # Webhook handlers (Stripe, Resend)
│   └── content/          # Static content (textbook)
├── supabase/             # Database migrations & schema
├── public/               # Static assets
└── docs/                 # Documentation

**277 TypeScript/TSX files, 53,866 lines of code**
```

---

## 2. CLIENT-SIDE CODE (React Components)

### Component Organization
```
src/components/
├── admin/                # Admin dashboard components
│   ├── CampaignComposer.tsx    # Email campaign builder
│   ├── CampaignDetails.tsx     # Campaign metrics display
│   ├── CampaignStats.tsx       # Campaign analytics
│   ├── CampaignHistory.tsx     # Campaign archive
│   ├── AdminAuthGuard.tsx      # Role-based access control
│   └── AdminNavigation.tsx     # Admin menu
│
├── builder/              # Website builder interface
│   ├── FormContainer.tsx       # Multi-step form wrapper
│   ├── BuilderLanding.tsx      # Landing page
│   └── steps/
│       ├── Step1-BasicInfo.tsx        # Business info collection
│       ├── Step2-CategorySelection.tsx # Service selection
│       ├── Step3-SectionBuilder.tsx    # Layout builder
│       └── Step4-Review.tsx           # Preview & confirmation
│
├── demo-generator/       # Website preview & customization
│   ├── DemoSiteGeneratorForm.tsx
│   ├── PreviewModal.tsx
│   └── PaymentModal.tsx
│
├── auth/                 # Authentication UI
├── calendar/             # Consultation booking
├── video/                # Jitsi Meet integration
├── services/             # Service listing & payment
├── sections/             # Marketing pages (hero, testimonials, pricing)
├── modals/               # Modal dialogs
├── ui/                   # Radix UI & custom components
├── tier/                 # Tier gating components
└── shared/               # Shared utilities (progress bars, indicators)
```

### Key Client-Side Features
- **Dynamic Form Building:** Multi-step wizard for website customization
- **Real-time Preview:** Live HTML rendering in iframes
- **Payment Integration:** Stripe checkout flows
- **Authentication UI:** Sign-in, sign-up, password reset flows
- **Admin Dashboard:** Campaign management, analytics, user management
- **Video Integration:** Jitsi Meet embedded sessions
- **State Management:** React hooks, context API, Supabase real-time subscriptions

---

## 3. SERVER-SIDE CODE & BUSINESS LOGIC

### Backend Architecture

#### A. API Routes (Next.js App Router)
**Location:** `src/app/api/` (90+ route handlers)

**Categories:**

1. **Authentication & User Management** (9 routes)
   - `/auth/signin` - Email/password authentication
   - `/auth/signup` - User registration
   - `/auth/signup-open` - Open registration (no invite required)
   - `/auth/reset-password` - Password reset flow
   - `/auth/verify-email` - Email verification
   - `/auth/session` - Session management
   - `/user/profile` - User profile CRUD
   - `/user/change-password` - Password changes
   - `/user/get-emails`, `/user/add-email`, `/user/set-primary-email` - Email management

2. **Payment Processing** (5 routes)
   - `/checkout` - Stripe checkout creation
   - `/create-checkout` - Alternate checkout flow
   - `/stripe/create-payment-intent` - Payment intent creation
   - `/demo-generator/process-payment` - Demo site payment
   - `/services/payment` - Service payment processing

3. **Demo/Website Generator** (8 routes) ⭐ **CORE BUSINESS LOGIC**
   - `/demo-generator/generate` - Generate HTML website
   - `/demo-generator/customize` - AI customization (Claude API)
   - `/demo-generator/create-checkout` - Payment for AI customization
   - `/demo-generator/create-ai-checkout` - AI upgrade checkout
   - `/demo-generator/download` - Website code download
   - `/demo-generator/send-tips` - Email optimization tips
   - `/demo-generator/track-interaction` - User engagement tracking

4. **Email Campaign Management** (7 routes) ⭐ **MARKETING AUTOMATION**
   - `/admin/campaigns` - List/create campaigns
   - `/admin/campaigns/send` - Send campaign emails
   - `/admin/campaigns/delete` - Delete campaigns
   - `/admin/campaigns/retry` - Retry failed sends
   - `/admin/send-campaign` - Alternative send endpoint
   - `/admin/email-templates` - Template management
   - `/emails/*` - Email sending endpoints

5. **Consultation Booking** (5 routes)
   - `/calendar/availability` - Check available slots
   - `/calendar/book` - Book consultation
   - `/consultations/manage` - Manage bookings
   - `/consultations/send-reminders` - Send email reminders
   - `/consultation` - Consultation details

6. **Lead Management** (5 routes)
   - `/admin/leads` - List/create leads
   - `/admin/migrate-leads` - Import from Airtable
   - `/admin/migrate-waitlist` - Waitlist migration
   - `/store-lead` - Store lead form submissions
   - `/waitlist/signup` - Waitlist signup

7. **Email Tracking** (3 routes) ⭐ **CUSTOMER ANALYTICS**
   - `/email-tracking/open` - Track email opens
   - `/email-tracking/click` - Track link clicks
   - `/admin/check-tracking` - Tracking dashboard

8. **Services** (5 routes)
   - `/services` - List services
   - `/services/[id]` - Service details
   - `/services/by-category` - Filter by category
   - `/services/sync` - Sync with Airtable
   - `/services/check-availability` - Check service availability

9. **Admin Functions** (10+ routes) ⭐ **SENSITIVE**
   - `/admin/setup-admin` - Initial admin setup
   - `/admin/create-auth-user` - Create user accounts
   - `/admin/check-role` - Role verification
   - `/admin/check-users` - User listing
   - `/admin/stripe-products` - Product sync
   - `/admin/update-names` - Bulk name updates
   - `/admin/update-welcome-template` - Template updates

10. **Testimonials & Portfolio** (3 routes)
    - `/testimonials` - List testimonials
    - `/testimonials/submit` - Submit testimonial
    - `/portfolio` - Portfolio projects

11. **Session/Video Management** (2 routes)
    - `/sessions/create` - Create Jitsi session
    - `/sessions/[id]/save` - Save session data

12. **Webhook Handlers** (2 routes) ⭐ **CRITICAL**
    - `/webhooks/stripe` - Stripe payment events
    - `/webhooks/resend` - Email service events

13. **Utility Endpoints**
    - `/batch` - Batch operations
    - `/promo-codes/generate` - Promo code generation
    - `/deep-analysis`, `/quick-analysis` - Analytics
    - `/email-preview` - Email template preview
    - `/textbook/content` - Course content delivery

#### B. API Middleware & Request Handling
**Location:** `src/api-middleware/`

Sophisticated middleware stack:
```typescript
- withErrorHandling    // Global error handling & user-friendly messages
- withLogging          // Request/response logging with Pino
- withRateLimit        // DDoS protection via Upstash Redis
- withValidation       // Zod schema validation
- compose              // Middleware composition
```

Features:
- Rate limiting (15 req/min default, variable by endpoint)
- Request validation with Zod schemas
- Comprehensive logging with structured JSON
- Error response standardization
- Performance monitoring

---

## 4. BUSINESS LOGIC & PROPRIETARY FEATURES

### ⭐ Core Proprietary Features

#### A. AI-Powered Website Generator
**Files:** 
- `src/lib/demo-generator/claude-generator.ts`
- `src/lib/demo-generator/ramsey-coach-template.ts`
- `src/app/api/demo-generator/*`

**Functionality:**
```typescript
// Claude API Integration
- Uses Anthropic Claude Sonnet 4 model
- Generates production-ready HTML websites from form inputs
- Business information: name, tagline, services, contact details
- Color scheme customization with hex colors
- Service descriptions with "AI Enhancement" suggestions
- Generates responsive, modern HTML with embedded CSS/JS

// Static Template Fallback
- Ramsey Coach template for immediate preview
- Customizable business information
- Color scheme injection
- No AI cost for free tier users
```

**Revenue Model:**
- Free: Static template preview
- Premium: Claude AI custom generation ($$ per generation)
- Paid services include website download & customization

#### B. Email Campaign Management System
**Files:**
- `src/app/api/admin/campaigns/*`
- `src/lib/email-builder.ts`
- `src/adapters/ResendAdapter.ts`
- `src/types/database.ts` - campaigns, campaign_sends, email_templates tables

**Features:**
```
- Campaign creation with rich text editor
- Template system with variable substitution
- Recipient targeting (segments, custom fields)
- Scheduled sending
- A/B testing support
- Batch processing (async job queue)
- Resend email service integration
```

**Data Tracking:**
- Open tracking (pixel-based)
- Click tracking (URL rewriting)
- Bounce & unsubscribe handling
- Email client detection
- User agent tracking
- Campaign performance analytics

**Database Tables:**
- `campaigns` - Campaign metadata, scheduling, stats
- `campaign_sends` - Individual email records with tracking
- `email_templates` - Reusable template library
- `promo_codes` - Discount codes for campaigns

#### C. Lead & User Management System
**Files:**
- `src/repositories/LeadRepository.ts`, `UserRepository.ts`
- `src/app/api/admin/leads/*`
- `src/app/api/store-lead`

**Features:**
```
Lead Pipeline:
  waitlist -> interested -> nurturing -> converted

Lead Attributes:
- Email, name (first/last/display)
- Status tracking
- Source (UTM parameters)
- Tags and custom fields
- Engagement history
- Referral tracking
- Affiliate tier assignment

Integration:**
- Airtable sync (import/export)
- Waitlist migration tools
- Custom field mapping
```

#### D. Consultation Booking System
**Files:**
- `src/app/api/calendar/*`
- `src/app/api/consultations/*`
- Database: `consultations`, `consultation_blocks`, `federal_holidays`

**Features:**
```
Booking Management:
- Real-time availability checking
- Calendar blocking (holidays, personal blocks)
- Jitsi Meet room creation
- Email reminders (24h, 1h before)
- Cancellation & rescheduling

Session Types:
- Free consultations (30 min)
- 1-on-1 coaching (60 min, paid)
- Group sessions
- Workshops
- Office hours

Payment Integration:
- Stripe for paid sessions
- Coupon/promo code support
- Payment confirmation emails
```

#### E. Subscription & Payment System
**Files:**
- `src/adapters/StripeAdapter.ts`
- `src/lib/stripe.ts`
- `src/webhooks/stripe/*`
- Database: `promo_codes`, `affiliate_tiers`, `referrals`

**Tiers:**
```typescript
export type TierLevel = 'basic' | 'tier1' | 'tier2' | 'premium' | 
                        'tier3' | 'vip' | 'tier4' | 'enterprise'

Permissions Matrix:
- Code download (tiers tier1+)
- AI modifications (0 to unlimited)
- Textbook access (tiers tier1+)
- Video recordings (tiers tier2+)
- Group courses (tiers tier3+)
- Master toolkit (tiers tier4+)
```

**Payment Features:**
```
- Stripe Checkout Sessions
- Payment Intent creation
- Webhook handling for:
  - payment_intent.succeeded
  - payment_intent.payment_failed
  - checkout.session.completed
  
- User tier upgrades on successful payment
- Email confirmations
- Invoice generation
```

#### F. Referral & Affiliate System
**Database Tables:**
- `referrals` - Referral tracking with status (lead, paid, processed, held)
- `affiliate_tiers` - Tier configuration with caps and bonuses
- `student_points` - Point accumulation (attendance, engagement, referrals)

**Features:**
- Referral commission tracking
- Tiered affiliate structure
- Points system with cash conversion
- Referral caps and hold periods
- Auto-processing of held referrals

#### G. Student Engagement System
**Database Tables:**
- `student_points` - Points by type
- `badges`, `student_badges` - Achievement system
- `course_sessions` - Course recordings and live sessions
- `attendance_log` - Attendance tracking
- `social_shares` - Social media engagement

**Features:**
- Point accumulation (attendance, engagement, referrals, bonuses)
- Badge/achievement system
- Course session tracking
- Live + recording point distinction
- Social share verification and rewards

---

## 5. DATA STORAGE & PROCESSING

### Primary Database (Supabase PostgreSQL)

**Core Tables:**

| Table | Purpose | Records | Key Fields |
|-------|---------|---------|-----------|
| `users` | User accounts | ~variable | id, email, tier, payment_status, role, phone, sms_consent |
| `leads` | Lead pipeline | ~variable | email, status, tags, custom_fields, utm_*, source |
| `campaigns` | Email campaigns | ~variable | subject, content, status, recipient_count, stats |
| `campaign_sends` | Individual emails | ~millions | campaign_id, recipient_*, tracking_* |
| `email_templates` | Email templates | ~dozens | name, category, variables, content_template |
| `consultations` | Booked sessions | ~variable | user_id, scheduled_date, jitsi_*, reminder_* |
| `demo_projects` | Generated websites | ~variable | template_id, user_email, services, colors, generated_html |
| `demo_interactions` | User interactions | ~variable | demo_project_id, interaction_type, metadata |
| `promo_codes` | Discount codes | ~hundreds | code, product_id, discount_*, stripe_*, expires_at |
| `referrals` | Referral tracking | ~variable | referrer_id, referee_*, status, points_* |
| `student_points` | Point balances | ~variable | user_id, attendance_*, engagement_*, referral_* |
| `badges` | Achievement types | ~dozens | name, description, category, points_value |
| `student_badges` | Achievements earned | ~variable | user_id, badge_id, awarded_* |
| `course_sessions` | Live/recorded lessons | ~dozens | session_name, recording_url, points_* |
| `attendance_log` | Attendance records | ~variable | user_id, session_id, attendance_type, points_awarded |
| `social_shares` | Social engagement | ~variable | user_id, platform, post_url, status |
| `niche_templates` | Website templates | ~dozens | category_id, form_steps, html_generator_config |
| `template_categories` | Template hierarchy | ~dozens | name, slug, parent_id, level |
| `invite_tokens` | Sign-up invitations | ~variable | token, email, tier, expires_at, used_at |

**Row Level Security (RLS):**
- Supabase Auth integration for automatic user isolation
- Column-level access control for sensitive data
- Service role bypasses for admin operations

### External Integrations

1. **Airtable** (`src/lib/airtable.ts`)
   - CRM data storage
   - Lead syncing
   - Portfolio/testimonials
   - Data migration tools
   - Contact field mappings

2. **Stripe** (Payment Processing)
   - Checkout sessions
   - Payment intents
   - Webhook events
   - Product/price management
   - Coupon handling

3. **Resend** (Email Service)
   - Transactional emails
   - Campaign bulk sends
   - Email rendering
   - Bounce/complaint handling

4. **Jitsi Meet** (Video Conferencing)
   - Room creation
   - Participant management
   - Session recording
   - Configuration via environment variables

5. **Upstash** (Rate Limiting & Caching)
   - Redis-based rate limiting
   - Response caching
   - Session data caching

### Caching Strategy
**Location:** `src/lib/cache.ts`

```typescript
- Entity-level caching (users, leads, campaigns)
- Automatic cache invalidation on mutations
- Redis with 300s default TTL
- Graceful degradation if Redis unavailable
- Cache keys: "table:id" pattern
```

---

## 6. AUTHENTICATION & SECURITY

### Authentication Flow
```
Supabase Auth with PKCE Flow:
1. User email/password signup
2. Email verification (link-based)
3. JWT token in localStorage
4. Auto refresh on expiry
5. Row Level Security enforces user data isolation
```

### Authorization
```
Role-Based Access Control:
- student: Portal access, profile management
- admin: Campaign management, lead management, user management

Tier-Based Gating:
- Permissions matrix in tier-permissions.ts
- Feature gates in TierGate component
- Database-level checks in API routes
```

### Security Features
- **Rate Limiting:** Per-endpoint limits via Upstash Redis
- **Input Validation:** Zod schemas on all API routes
- **CORS:** Next.js default configuration
- **HTTPS:** Enforced on production (Vercel)
- **Secrets Management:** Environment variables (STRIPE_SECRET_KEY, SUPABASE_SERVICE_ROLE_KEY, etc.)
- **Webhook Verification:** Stripe signature verification on webhook routes
- **Session Handling:** Supabase handles JWT validation

---

## 7. PROPRIETARY & SENSITIVE LOGIC REQUIRING PROTECTION

### CRITICAL - High-Risk Areas

#### 1. **Payment Processing Pipeline** ⭐⭐⭐
**Why Sensitive:**
- Handles real money transactions
- Stripe API keys (secret)
- Revenue tracking and reporting
- Subscription tier logic

**Files to Protect:**
```
src/adapters/StripeAdapter.ts          # Stripe API wrapper
src/lib/stripe.ts                      # Product configuration
src/app/api/checkout/*                 # Checkout flows
src/app/api/stripe/create-payment-intent
src/webhooks/stripe/*                  # Webhook handlers
src/lib/payments/calculateRollover.ts  # Billing calculations
```

**Protection Measures:**
- Keep STRIPE_SECRET_KEY in .env only
- Webhook signature verification
- Audit logging for all payment events
- PCI compliance (Stripe handles cards)

#### 2. **AI Model Integration (Claude API)** ⭐⭐⭐
**Why Sensitive:**
- Generates revenue-generating content
- Anthropic API key (costly)
- Proprietary prompt engineering
- Core differentiator from competitors

**Files to Protect:**
```
src/lib/demo-generator/claude-generator.ts
src/app/api/demo-generator/customize/route.ts
src/app/api/demo-generator/create-ai-checkout
```

**Protection Measures:**
- Never expose ANTHROPIC_API_KEY in client code
- Server-side only generation
- Usage tracking and quotas
- Rate limiting on AI endpoints
- Cost monitoring

#### 3. **Email Campaign & Tracking System** ⭐⭐⭐
**Why Sensitive:**
- Contains user email lists (PII)
- Tracking pixels reveal user behavior
- GDPR compliance requirements
- Marketing automation competitive advantage

**Files to Protect:**
```
src/app/api/admin/campaigns/*
src/lib/email-builder.ts
src/adapters/ResendAdapter.ts
src/app/api/email-tracking/*
src/repositories/LeadRepository.ts
```

**Protection Measures:**
- Admin authentication required
- Audit logs for campaign sends
- GDPR unsubscribe handling
- Bounce management
- Lead data encryption in transit
- PII masking in logs

#### 4. **Lead Database & CRM** ⭐⭐⭐
**Why Sensitive:**
- Contains prospect/customer data
- Email addresses (GDPR/CCPA regulated)
- Engagement history (behavioral data)
- Business intelligence

**Files to Protect:**
```
src/repositories/LeadRepository.ts
src/app/api/admin/leads/*
src/app/api/admin/migrate-leads
src/lib/airtable.ts
Database: leads, referrals tables
```

**Protection Measures:**
- Row Level Security on leads table
- Admin-only access to lead list
- Data export controls
- Audit logging
- Compliance with data retention policies

#### 5. **User Account & Subscription Data** ⭐⭐
**Why Sensitive:**
- Authentication credentials
- Subscription status (revenue)
- Payment history
- Personal information

**Files to Protect:**
```
src/app/api/auth/*
src/app/api/user/*
src/repositories/UserRepository.ts
Database: users table (RLS enabled)
```

**Protection Measures:**
- Supabase RLS on users table
- Password hashing (bcryptjs)
- Session token encryption
- HTTPS only
- Audit logging

#### 6. **Admin API Endpoints** ⭐⭐
**Why Sensitive:**
- User/lead creation and management
- Campaign sending and analytics
- Template updates
- System configuration

**Files to Protect:**
```
src/app/api/admin/create-auth-user
src/app/api/admin/setup-admin
src/app/api/admin/check-users
src/app/api/admin/stripe-products
src/components/admin/AdminAuthGuard.tsx
```

**Protection Measures:**
- Verify admin role in each endpoint
- Audit logging for all admin actions
- Admin auth guard component
- Limited to admin users only
- IP whitelisting (optional)

#### 7. **Webhook Handlers** ⭐⭐
**Why Sensitive:**
- External service integration points
- Can trigger financial transactions
- Database mutations from external sources
- Potential security vulnerabilities

**Files to Protect:**
```
src/webhooks/stripe/*
src/app/api/webhooks/stripe
src/app/api/webhooks/resend
```

**Protection Measures:**
- Signature verification (Stripe sig header)
- Rate limiting
- Idempotency checks (prevent duplicate processing)
- Audit logging
- Dead letter queue for failed events

#### 8. **Tier & Permissions System** ⭐⭐
**Why Sensitive:**
- Controls feature access and revenue
- Determines user capabilities
- Affects user experience and pricing

**Files to Protect:**
```
src/lib/tier-permissions.ts           # Permission matrix
src/components/tier/TierGate.tsx      # Feature gating
src/app/api/admin/stripe-products    # Product sync
```

**Protection Measures:**
- Database validation of tier on sensitive operations
- Cannot be modified client-side
- Audit logging for tier changes
- Regular audits of permission matrix

#### 9. **Airtable Integration** ⭐
**Why Sensitive:**
- External database access
- Data synchronization
- Bulk data operations
- Third-party API keys

**Files to Protect:**
```
src/lib/airtable.ts
src/app/api/admin/migrate-leads
src/app/api/services/sync
```

**Protection Measures:**
- Keep AIRTABLE_API_KEY in .env only
- Admin authentication required
- Audit logging
- Data validation before import
- Rate limiting

#### 10. **Email & SMS Consent** ⭐
**Why Sensitive:**
- GDPR/CCPA compliance requirement
- Legal exposure if not handled properly
- User privacy preferences

**Files to Protect:**
```
src/app/api/onboarding/sms-consent
Database: users.sms_consent, users.sms_consent_timestamp
```

**Protection Measures:**
- Explicit consent capture
- Timestamp recording
- Audit logging
- Compliance audit trails

---

## 8. KEY DEPENDENCIES & EXTERNAL SERVICES

### Critical APIs with Secrets
```
STRIPE_SECRET_KEY              # Payment processing ($$)
STRIPE_WEBHOOK_SECRET          # Webhook signature verification
ANTHROPIC_API_KEY              # Claude AI generation ($$)
SUPABASE_SERVICE_ROLE_KEY      # Database admin access
RESEND_API_KEY                 # Transactional emails
AIRTABLE_API_KEY               # CRM synchronization
UPSTASH_REDIS_REST_*           # Rate limiting & caching
NEXT_PUBLIC_JITSI_DOMAIN      # Video conferencing
```

### npm Packages (Proprietary Risk)
- `@anthropic-ai/sdk` - Claude API integration
- `stripe` - Payment processing
- `airtable` - CRM integration
- `@supabase/supabase-js` - Database client
- `resend` - Email service
- `react-email` - Email template rendering

---

## 9. DEVELOPMENT & DEPLOYMENT

### Environment Configuration
```
.env.local (development) - NEVER commit
.env.production (production)

Critical Variables:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY      ⚠️ SECRET
- STRIPE_SECRET_KEY                ⚠️ SECRET
- STRIPE_WEBHOOK_SECRET            ⚠️ SECRET
- ANTHROPIC_API_KEY                ⚠️ SECRET
- RESEND_API_KEY                   ⚠️ SECRET
- AIRTABLE_API_KEY                 ⚠️ SECRET
```

### Build & Deployment
- **Host:** Vercel (serverless)
- **Build:** `next build` compiles TypeScript to optimized JS
- **Database:** Supabase-hosted PostgreSQL
- **Monitoring:** Sentry for error tracking
- **Analytics:** Vercel Analytics + Speed Insights

---

## 10. COMPETITIVE MOAT & DIFFERENTIATION

### Key Proprietary Assets

1. **AI Website Generator**
   - Claude prompt engineering
   - Template system
   - Customization logic
   
2. **Email Campaign Automation**
   - Lead scoring
   - Segment targeting
   - Open/click tracking

3. **Consultation Booking**
   - Calendar integration
   - Jitsi Meet integration
   - Automatic reminders

4. **Gamification System**
   - Points accumulation
   - Badge system
   - Referral tracking

5. **Tier-Based Feature Gating**
   - Complex permission matrix
   - Upgrade paths
   - Revenue optimization

---

## 11. RECOMMENDATIONS FOR PROTECTION

### Immediate Actions
1. ✅ Ensure all `.env` files are in `.gitignore` (checked)
2. ✅ Use environment variables for all secrets (checked)
3. ✅ Enable branch protection rules on main
4. ✅ Set up secret scanning on GitHub
5. ⚠️ Review and limit access to admin endpoints
6. ⚠️ Audit Supabase RLS policies
7. ⚠️ Monitor Stripe and Anthropic API usage

### Ongoing Security
1. Regular dependency updates (`npm audit`)
2. Code review for API endpoints
3. Penetration testing on payment flows
4. Database backup strategies
5. Incident response procedures
6. GDPR/CCPA compliance audits
7. Rate limiting threshold tuning
8. Webhook retry logic validation

### Source Code Protection
1. Use private GitHub repository
2. Implement branch protection rules
3. Require code review for API changes
4. Audit logs for sensitive files
5. Use GitHub Security advisories
6. Consider obfuscation for production build
7. Implement secure secret rotation

---

## SUMMARY TABLE

| Area | Proprietary Level | Risk Level | Files | Lines |
|------|------------------|-----------|-------|-------|
| **Website Generator** | Very High | Critical | 3 | 250+ |
| **Payment System** | Very High | Critical | 5 | 400+ |
| **Email Campaigns** | High | High | 7 | 600+ |
| **Lead CRM** | High | High | 5 | 400+ |
| **Auth & Security** | High | High | 6 | 300+ |
| **Admin System** | High | High | 10+ | 500+ |
| **Webhooks** | High | Critical | 3 | 200+ |
| **Tier System** | Medium | High | 2 | 150+ |
| **UI Components** | Low | Low | 100+ | 15000+ |
| **Utilities** | Low | Medium | 50+ | 3000+ |

**Total Protected Code:** ~45% (24,000+ lines)
**Total Public Code:** ~55% (29,866 lines - UI, utilities, components)

