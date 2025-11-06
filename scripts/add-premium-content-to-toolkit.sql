-- ============================================================================
-- ADD PREMIUM CONTENT TO ARCHITECTURE MASTERY TOOLKIT
-- ============================================================================
-- Adds the secret techniques from textbook chapters 4, 6, and 8
-- These patterns are implemented in your production codebase
-- ============================================================================

-- Get IDs for reference
DO $$
DECLARE
  v_product_id UUID;
  v_template_id UUID;
  v_prompt_id UUID;
  v_guide_id UUID;
BEGIN
  -- Get product and content type IDs
  SELECT id INTO v_product_id FROM products WHERE slug = 'architecture-toolkit';
  SELECT id INTO v_template_id FROM content_types WHERE slug = 'template';
  SELECT id INTO v_prompt_id FROM content_types WHERE slug = 'prompt';
  SELECT id INTO v_guide_id FROM content_types WHERE slug = 'guide';

  -- ============================================================================
  -- CATEGORY: Data Architecture (Repository Pattern)
  -- ============================================================================

  INSERT INTO product_contents (
    product_id, content_type_id, category, name, slug, description,
    claude_command, time_saved_min, time_saved_max, difficulty, sort_order
  ) VALUES
  (
    v_product_id, v_template_id,
    'Data Architecture',
    'Repository Pattern Implementation',
    'repository-pattern-implementation',
    'Complete Repository Pattern that abstracts all database operations. Includes BaseRepository with common CRUD methods and specialized repositories (UserRepository, LeadRepository). Makes your code testable and allows switching databases without changing business logic.',
    'claude chat "Create a TypeScript Repository pattern with:
- BaseRepository class with generic CRUD operations (findById, create, update, delete)
- UserRepository extending BaseRepository with user-specific methods
- LeadRepository extending BaseRepository with lead-specific methods
- Supabase client injection for testability
- Full TypeScript interfaces and error handling
- Example usage in API routes

Use the architecture from my codebase in src/repositories/ as reference."',
    12, 20, 'intermediate', 1
  ),

  -- ============================================================================
  -- CATEGORY: Service Integration (Adapter Pattern)
  -- ============================================================================

  (
    v_product_id, v_template_id,
    'Service Integration',
    'Adapter Pattern for Third-Party Services',
    'adapter-pattern-services',
    'Professional Adapter Pattern that wraps external services (Stripe, Resend, Supabase) with a consistent interface. Includes error handling, retry logic, and makes testing easy by mocking adapters. Your team can swap services without touching business logic.',
    'claude chat "Create TypeScript Adapter pattern for external services:
- BaseAdapter abstract class with common error handling
- StripeAdapter for payment processing (charges, customers, subscriptions)
- ResendAdapter for email sending with templates
- SupabaseAdapter for database operations
- Dependency injection setup in index.ts
- Mock adapters for testing
- Rate limiting and retry logic

Reference the pattern in my src/adapters/ directory."',
    10, 16, 'advanced', 1
  ),

  -- ============================================================================
  -- CATEGORY: Request Handling (Webhook Pattern)
  -- ============================================================================

  (
    v_product_id, v_template_id,
    'Request Handling',
    'Webhook Handler Registry Pattern',
    'webhook-handler-registry',
    'Scalable webhook processing system using Handler Registry and Strategy patterns. Automatically routes Stripe webhooks to specialized handlers. Add new webhook types without modifying existing code. Includes logging, error handling, and type safety.',
    'claude chat "Create a webhook processing system with:
- BaseWebhookHandler abstract class with execute() method
- WebhookRegistry for registering and routing handlers
- Specialized handlers (CheckoutCompletedHandler, PaymentSucceededHandler)
- Type-safe Stripe event handling
- Structured logging with context
- Error handling and webhook retry logic
- Main route that delegates to handlers

Use my src/webhooks/ directory structure as the model."',
    14, 22, 'advanced', 2
  ),

  -- ============================================================================
  -- CATEGORY: Professional Development (CI/CD)
  -- ============================================================================

  (
    v_product_id, v_guide_id,
    'Professional Development',
    'GitHub Actions CI/CD Pipeline',
    'github-actions-cicd-pipeline',
    'Complete GitHub Actions workflow for automated testing, linting, type checking, and deployment to Vercel. Includes environment variable management, GitHub Secrets setup, and quality gates. Never deploy broken code again.',
    'claude chat "Create .github/workflows/deploy.yml with:
- Run on push to main and pull requests
- Jobs: lint, type-check, test, build
- Deploy to Vercel only if all checks pass
- Use GitHub Secrets for environment variables
- Caching for npm dependencies
- Parallel job execution for speed
- Status badges for README

Include setup instructions for GitHub Secrets and Vercel integration."',
    8, 14, 'intermediate', 1
  ),

  -- ============================================================================
  -- CATEGORY: AI Prompts (Master Prompts)
  -- ============================================================================

  (
    v_product_id, v_prompt_id,
    'AI Prompts',
    'Master E-commerce Prompt Template',
    'master-ecommerce-prompt',
    'The exact master prompt template that generates production-ready e-commerce websites. Includes technical requirements, business context, database schema, payment integration, email automation, and security best practices. Copy-paste and customize for your client projects.',
    'Create a professional Next.js e-commerce/services website with the following specifications:

## TECHNICAL REQUIREMENTS
- Next.js 14 with App Router and TypeScript
- Tailwind CSS for responsive styling
- ESLint and Prettier for code quality
- Environment variables for security
- Professional file structure and organization

## BUSINESS CONTEXT
[Describe your client''s business, target audience, and key goals]

## FEATURES REQUIRED
- Product/service catalog with categories
- Shopping cart with Stripe checkout
- Customer authentication (Supabase)
- Admin dashboard for order management
- Email notifications (Resend)
- Responsive mobile-first design

## DATABASE SCHEMA
- Products: id, name, description, price, category, images, inventory
- Orders: id, user_id, total, status, created_at
- Users: id, email, name, role, created_at

## BUSINESS AUTOMATION
- Abandoned cart emails (48hr follow-up)
- Order confirmation emails
- Low inventory alerts
- Customer welcome sequence

## SECURITY AND BEST PRACTICES
- Environment variables for all API keys
- Input validation and sanitization
- Rate limiting on API routes
- HTTPS enforcement
- SQL injection prevention

Generate complete, production-ready code following Next.js 14 best practices.',
    20, 40, 'advanced', 1
  ),

  (
    v_product_id, v_prompt_id,
    'AI Prompts',
    'Debugging Prompt Collection',
    'debugging-prompt-collection',
    'Pre-written prompts for Claude to debug common Next.js, React, TypeScript, and deployment issues. Copy-paste ready for instant solutions. Saves hours of Stack Overflow searching.',
    'Use these debugging prompts with Claude CLI:

## Next.js Errors
"Analyze this Next.js build error and provide fix with explanation: [paste error]"
"Debug this Next.js routing issue - expected behavior vs actual: [describe issue]"
"Fix this Next.js hydration error with root cause analysis: [paste error]"

## React Issues
"Debug this React component - it''s not rendering as expected: [paste component code]"
"Analyze this React state management issue and suggest best practice solution: [describe issue]"
"Fix this React useEffect infinite loop with proper dependency array: [paste code]"

## TypeScript Errors
"Resolve this TypeScript type error with proper type definitions: [paste error]"
"Create proper TypeScript interfaces for this data structure: [paste example data]"
"Fix this TypeScript generic constraint error: [paste code]"

## Deployment Issues
"Debug this Vercel deployment failure and provide solution: [paste build log]"
"Analyze this environment variable issue in production: [describe issue]"
"Fix this CORS error in Next.js API routes: [paste error]"

## Database Errors
"Debug this Supabase RLS policy that''s blocking access: [paste policy]"
"Fix this SQL query performance issue with optimization: [paste query]"
"Resolve this database connection error in production: [paste error]"',
    6, 12, 'beginner', 2
  ),

  -- ============================================================================
  -- CATEGORY: Code Organization (Dependency Injection)
  -- ============================================================================

  (
    v_product_id, v_template_id,
    'Code Organization',
    'Dependency Injection Container',
    'dependency-injection-container',
    'Professional dependency injection system that manages service instantiation, configuration, and lifecycle. Makes your code testable by allowing mock services in tests. Clean architecture that scales with your team.',
    'claude chat "Create a TypeScript dependency injection container with:
- ServiceContainer class for registering and resolving services
- Singleton and transient service lifetimes
- Constructor injection with type inference
- Lazy loading of services
- Service configuration management
- Example: injecting Stripe, Supabase, Resend adapters
- Unit test examples with mocked services

Make it production-ready with error handling and TypeScript strict mode."',
    10, 16, 'advanced', 1
  ),

  -- ============================================================================
  -- CATEGORY: Performance Optimization
  -- ============================================================================

  (
    v_product_id, v_guide_id,
    'Performance Optimization',
    'Next.js Performance Optimization Checklist',
    'nextjs-performance-optimization',
    'Complete performance optimization guide for Next.js apps. Covers image optimization, code splitting, caching strategies, database query optimization, and Core Web Vitals. Includes before/after examples and Lighthouse scoring improvements.',
    'claude chat "Create a comprehensive Next.js performance optimization guide covering:

## Images
- Next.js Image component configuration
- WebP/AVIF format conversion
- Lazy loading strategies
- Image CDN setup

## Code Splitting
- Dynamic imports for heavy components
- Route-based code splitting
- Third-party library optimization
- Tree shaking configuration

## Caching
- API route caching headers
- Static page generation
- Incremental static regeneration
- Client-side caching with React Query

## Database
- Query optimization patterns
- Connection pooling
- Index strategies
- N+1 query prevention

## Core Web Vitals
- LCP (Largest Contentful Paint) fixes
- FID (First Input Delay) improvements
- CLS (Cumulative Layout Shift) elimination
- Performance monitoring setup

Include code examples and expected Lighthouse score improvements."',
    12, 20, 'intermediate', 1
  ),

  -- ============================================================================
  -- CATEGORY: Type Safety
  -- ============================================================================

  (
    v_product_id, v_template_id,
    'Type Safety',
    'End-to-End Type Safety Setup',
    'end-to-end-type-safety',
    'Complete type safety from database to frontend. Generate TypeScript types from Supabase schema, validate API requests with Zod, ensure type-safe React components. Catch bugs at compile time instead of production.',
    'claude chat "Set up end-to-end type safety for Next.js with:
- Generate TypeScript types from Supabase schema
- Zod schemas for API request/response validation
- Type-safe API route handlers with Next.js
- Shared types between frontend and backend
- Type-safe React components with props validation
- Type-safe environment variables
- Generic type utilities for common patterns

Include setup scripts and examples of catching bugs at compile time."',
    8, 14, 'intermediate', 1
  );

END $$;

-- ============================================================================
-- Verify Content Was Added
-- ============================================================================
SELECT
  category,
  name,
  difficulty,
  time_saved_min || '-' || time_saved_max || ' hours' as time_saved,
  sort_order
FROM product_contents
WHERE product_id = (SELECT id FROM products WHERE slug = 'architecture-toolkit')
ORDER BY category, sort_order;

-- ============================================================================
-- Success Message
-- ============================================================================
DO $$
BEGIN
  RAISE NOTICE '✅ Premium content added successfully!';
  RAISE NOTICE '📊 Total items: %', (
    SELECT COUNT(*)
    FROM product_contents
    WHERE product_id = (SELECT id FROM products WHERE slug = 'architecture-toolkit')
  );
END $$;
