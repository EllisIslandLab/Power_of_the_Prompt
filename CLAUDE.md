# Web Launch Academy - Claude Code Context

## Project Overview
Full-stack SaaS coaching platform built with Next.js 15 App Router, TypeScript, Supabase, and Stripe.

## Tech Stack
- **Framework**: Next.js 15.4.4 with App Router
- **Language**: TypeScript 5 (strict mode)
- **Database**: Supabase (PostgreSQL 17)
- **Styling**: Tailwind CSS v4
- **UI**: Radix UI components
- **Payments**: Stripe
- **Email**: Resend with React Email
- **Video**: Jitsi Meet
- **Validation**: Zod v4

## Code Conventions

### File Organization
- Use `@/` path alias for imports from `src/`
- API routes in `src/app/api/`
- Reusable components in `src/components/ui/`
- Database access through `src/repositories/`

### TypeScript
- Always use strict types - avoid `any`
- Database types are auto-generated in `src/types/database.ts`
- Use Zod schemas from `src/lib/schemas.ts` for validation

### React Patterns
- Use React Hook Form with Zod for forms
- Server components by default, `'use client'` only when needed
- Use existing Radix UI components from `src/components/ui/`

### API Routes
- All API routes use App Router convention (`route.ts`)
- Return `NextResponse.json()` for responses
- Use Supabase service client for server operations
- Apply rate limiting via `src/lib/rate-limiter.ts`

### Database
- Use Repository pattern (`src/repositories/`)
- Always handle errors with try/catch
- Use transactions for multi-table operations

### Security
- Never expose service role keys client-side
- Use middleware for auth protection
- Validate all inputs with Zod
- CSP headers configured in `next.config.ts`

## Common Tasks

### Running Development
```bash
npm run dev     # Start dev server
npm run build   # Production build
npm run lint    # Run ESLint
```

### Database Migrations
- Migrations in `supabase/migrations/`
- Scripts in `scripts/` for DB operations

### Environment Variables
Required env vars defined in `src/lib/env-config.ts`

## Do NOT
- Create new UI components when Radix equivalents exist
- Skip Zod validation on API inputs
- Use `console.log` in production code (removed by build)
- Commit `.env` files or secrets
