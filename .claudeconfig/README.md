# Claude Code Configuration

This project is configured with **Architecture Mastery Toolkit** patterns that Claude Code automatically follows.

## What This Means

When you use Claude Code (or claude.ai) to generate code for this project, Claude will:

- Automatically use Repository Pattern for database access
- Apply proper error handling with structured logging
- Add input validation with Zod schemas
- Structure code for maintainability
- Follow Next.js 15 + Web Launch Academy best practices
- Use existing utilities from `src/lib/`

## Directory Structure

```
.claudeconfig/
├── instructions.md      # Main coding standards (read first)
├── patterns.md          # Design pattern reference guide
├── diagnostics.md       # Pattern detection & recommendation rules
├── README.md            # This file
└── templates/           # Code generation templates
    ├── repository.md    # Data access layer pattern
    ├── factory.md       # Service factory pattern
    ├── middleware.md    # Request handling middleware
    ├── error-handling.md# Error management
    ├── caching.md       # Data caching layer
    └── testing.md       # Testing patterns
```

## How to Use

### Ask Claude for Help

When using Claude Code, simply describe what you need:

```
"Create an API route for student enrollment following our patterns"
"Add caching to the course repository"
"Create a middleware for checking premium tier access"
```

Claude will automatically:
1. Check `.claudeconfig/instructions.md` for project standards
2. Use templates from `.claudeconfig/templates/`
3. Follow patterns defined in `.claudeconfig/patterns.md`
4. Generate production-ready code

### Get Pattern Suggestions

When Claude analyzes your code, it will suggest improvements based on `.claudeconfig/diagnostics.md`.

### Implement a Pattern

Ask Claude to implement specific patterns:

```
"Implement the Repository Pattern for consultations"
"Add middleware stack for the admin API routes"
"Create error handling for the payment service"
```

## Available Commands

```bash
# Development
npm run dev              # Start development server
npm run build            # Production build
npm run lint             # ESLint checks

# Claude helpers
npm run claude:init      # Check Claude configuration
npm run claude:analyze   # Analyze codebase for pattern opportunities
```

## Pattern Templates

All pattern templates are in `.claudeconfig/templates/`:

| Template | Description |
|----------|-------------|
| `repository.md` | Data access layer with caching |
| `factory.md` | Service creation and management |
| `middleware.md` | Request handling (auth, validation, rate limiting) |
| `error-handling.md` | Consistent error responses |
| `caching.md` | Redis caching layer |
| `testing.md` | Unit and integration testing |

## Existing Project Utilities

Before creating new utilities, Claude will check these existing files:

| Need | Existing Solution |
|------|-------------------|
| Input validation | `src/lib/schemas.ts` |
| Rate limiting | `src/lib/rate-limiter.ts` |
| Caching | `src/lib/cache.ts` |
| Logging | `src/lib/logger.ts` |
| Supabase client | `src/lib/supabase.ts` |
| Stripe client | `src/lib/stripe.ts` |
| Role permissions | `src/lib/permissions.ts` |
| Tier permissions | `src/lib/tier-permissions.ts` |
| Database types | `src/types/database.ts` |

## Customizing

You can edit these files to customize Claude's behavior:

- `.claudeconfig/instructions.md` - Overall project guidelines
- `.claudeconfig/patterns.md` - Pattern reference guide
- `.claudeconfig/diagnostics.md` - What patterns to suggest when

## Tech Stack Reference

| Category | Technology |
|----------|------------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript 5 |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Payments | Stripe |
| Email | Resend |
| Video | Jitsi Meet |
| AI | Anthropic Claude |
| Caching | Upstash Redis |
| Styling | Tailwind CSS v4 |
| UI | Radix UI / Shadcn |

## Related Documentation

- `.claude/message.md` - Codebase overview
- `.claude/settings.json` - Claude Code settings
- `docs/` - Full project documentation

## Questions?

If architectural decisions are unclear, Claude will ask before proceeding. When in doubt, it prioritizes:

1. Correctness over cleverness
2. Maintainability over brevity
3. Explicit over implicit
4. Security over convenience
