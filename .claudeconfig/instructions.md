# Web Launch Academy - Project Coding Standards

## Technology Stack

| Category | Technology | Version |
|----------|------------|---------|
| Framework | Next.js (App Router) | 15.4.4 |
| Language | TypeScript | 5.x |
| Frontend | React | 19.1.0 |
| Database | Supabase (PostgreSQL) | v17 |
| Auth | Supabase Auth (SSR) | Latest |
| CRM | Airtable | MCP Server |
| Email | Resend + React Email | Latest |
| Payments | Stripe | Latest |
| Video | Jitsi Meet | Self-hosted compatible |
| AI | Anthropic Claude | 0.68.0 |
| Caching | Upstash Redis | Serverless |
| Styling | Tailwind CSS | v4 |
| UI | Radix UI / Shadcn | Latest |
| Hosting | Vercel | Serverless |
| Monitoring | Sentry | 10.22.0 |

## Core Principles

1. **Code Ownership:** Build for long-term maintenance, not quick hacks
2. **Pattern-First:** Use established design patterns over ad-hoc solutions
3. **AI-Optimized:** Structure code to be easily understood and extended by Claude
4. **Performance:** Prioritize fast page loads and minimal database calls
5. **Security:** Never trust client-side data, validate everything server-side
6. **Type Safety:** Use TypeScript strictly with Zod runtime validation

## Architectural Requirements

### Always Use These Patterns

Read the detailed pattern guides in `.claudeconfig/patterns.md` and apply them as follows:

**Data Access:**
- Use Repository Pattern for ALL database operations
- Use Adapter Pattern when working with multiple data sources (Airtable + Supabase)
- Implement caching layers for frequently accessed data
- Use existing utilities from `src/lib/` before creating new ones

**Service Integration:**
- Use Factory Pattern for creating service instances (email, payment, database)
- Wrap all external APIs in adapters
- Standardize webhook handling (see `src/app/api/stripe/` for examples)

**Request Handling:**
- Use middleware stacks for authentication, validation, logging
- Implement centralized error handling with `src/lib/logger.ts`
- Add rate limiting to all public API routes using `src/lib/rate-limiter.ts`

**Object Creation:**
- Use Factory Pattern for polymorphic object creation
- Use Builder Pattern for complex objects (emails, forms)

**Performance:**
- Implement static generation for content that rarely changes
- Cache reference data using Upstash Redis (`src/lib/cache.ts`)
- Use batch API client for multiple requests (`src/lib/api-client.ts`)

**Type Safety:**
- Use Zod for runtime validation (schemas in `src/lib/schemas.ts`)
- Use generated Supabase types from `src/types/database.ts`
- Validate all API inputs and outputs

**Testing:**
- Create mocks for external services
- Write integration tests for critical flows
- Use error boundaries in React components

### Never Do This

- Direct database calls in React components
- Hardcoded API keys or secrets (use env variables)
- localStorage/sessionStorage in server components
- Unvalidated user input
- Missing error handling in async functions
- Inline service configuration (use dependency injection)
- Expose Supabase service role key to client
- Skip rate limiting on auth endpoints

## File Organization

```
src/
├── app/                      # Next.js app router pages & API routes
│   ├── api/                  # API routes organized by feature
│   │   ├── admin/            # Admin management endpoints
│   │   ├── auth/             # Authentication (signin, signup, etc.)
│   │   ├── consultations/    # Consultation booking
│   │   ├── sessions/         # Video session management
│   │   ├── emails/           # Email sending & tracking
│   │   ├── stripe/           # Payment webhooks
│   │   └── [feature]/        # Feature-specific endpoints
│   ├── admin/                # Admin dashboard pages
│   ├── portal/               # Student portal pages
│   └── [auth pages]          # signin, signup, forgot-password
├── components/               # React components
│   ├── admin/                # Admin UI components
│   ├── auth/                 # Auth forms & flows
│   ├── builder/              # Email/content builders
│   ├── ui/                   # Shadcn/Radix UI components
│   ├── video/                # Jitsi Meet integration
│   └── shared/               # Shared components
├── lib/                      # Utility & service libraries
│   ├── supabase.ts           # Supabase client initialization
│   ├── stripe.ts             # Stripe configuration
│   ├── jitsi-config.ts       # Video conferencing config
│   ├── rate-limiter.ts       # Upstash rate limiting
│   ├── schemas.ts            # Zod validation schemas
│   ├── cache.ts              # Redis caching service
│   ├── logger.ts             # Pino structured logging
│   ├── permissions.ts        # Role-based access control
│   └── tier-permissions.ts   # Tier-based feature gating
├── types/                    # TypeScript types
│   └── database.ts           # Generated Supabase types
├── contexts/                 # React contexts
└── api-middleware/           # Custom middleware utilities
```

## Code Generation Guidelines

When generating code:

1. **Check for existing patterns first** - Look in `.claudeconfig/templates/` for established patterns
2. **Follow the Repository Pattern** - Never query databases directly in components
3. **Add comprehensive error handling** - Every async function needs try/catch
4. **Use existing validation schemas** - Check `src/lib/schemas.ts` first
5. **Validate all inputs** - Use Zod schemas for runtime validation
6. **Use configuration objects** - Avoid long parameter lists
7. **Make it testable** - Use dependency injection
8. **Optimize for AI** - Clear naming, consistent structure
9. **Log with context** - Use Pino logger with structured data

## Environment Variables

Always reference these, never hardcode:

```env
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe (Required)
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Upstash Redis (Required)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Email - Resend (Required)
RESEND_API_KEY=

# AI - Anthropic (Required)
ANTHROPIC_API_KEY=

# Jitsi Video (Optional - defaults to meet.jit.si)
NEXT_PUBLIC_JITSI_DOMAIN=
JITSI_JWT_SECRET=
JITSI_JWT_APP_ID=
JITSI_JWT_KID=

# Airtable CRM (Optional)
AIRTABLE_API_KEY=
AIRTABLE_BASE_ID=

# Sentry Monitoring (Optional)
SENTRY_DSN=

# Site Configuration
NEXT_PUBLIC_SITE_URL=
NODE_ENV=
```

## Security Standards

### Authentication
- Use Supabase Auth with PKCE OAuth flow
- Implement rate limiting on auth endpoints (strict tier)
- Validate sessions server-side via middleware
- Check role/tier permissions before sensitive operations

### Input Validation
- Validate ALL user input with Zod schemas
- Sanitize data before database operations
- Use parameterized queries (Supabase handles this)

### API Security
- Rate limit all public endpoints
- Add CSP, HSTS, X-Frame-Options headers (configured in next.config.ts)
- Never expose service role keys to client

## Performance Standards

- Page load: < 2 seconds
- API response: < 500ms
- Database queries: Cached when possible (1 hour TTL default)
- Images: Always use Next.js Image component with webp/avif
- Code splitting: Automatic via Next.js, verify bundle size

## Accessibility Standards

- Semantic HTML
- ARIA labels where needed (use Radix UI primitives)
- Keyboard navigation support
- Color contrast compliance
- Support dark mode via DarkModeContext

## User Roles & Tiers

### Roles (RBAC)
- `student` - Standard user access (portal)
- `admin` - Full administrative access (admin dashboard)

### Tiers (Feature Gating)
- `basic` - Basic features
- `premium` - Premium features
- `vip` - VIP features + priority support
- `enterprise` - All features + custom support

Check permissions with:
```typescript
import { hasPermission } from '@/lib/permissions';
import { canAccessFeature } from '@/lib/tier-permissions';
```

## When to Suggest Pattern Improvements

If you detect code that could benefit from patterns in `.claudeconfig/diagnostics.md`, suggest the appropriate template from `.claudeconfig/templates/`.

## Questions?

If architectural decisions are unclear, ask the developer before proceeding. When in doubt, prioritize:
1. Correctness over cleverness
2. Maintainability over brevity
3. Explicit over implicit
4. Security over convenience
