# Middleware Stack Template

## Quick Start

Use middleware to handle cross-cutting concerns like auth, validation, and rate limiting.

## Structure

```typescript
// src/lib/middleware/types.ts

export type MiddlewareResult = Response | null;
export type Middleware = (request: Request) => Promise<MiddlewareResult>;
export type MiddlewareFactory<T> = (config: T) => Middleware;
```

```typescript
// src/lib/middleware/stack.ts

import type { Middleware, MiddlewareResult } from './types';

/**
 * Run a stack of middleware functions
 * Returns the first error response, or null if all pass
 */
export async function runMiddleware(
  request: Request,
  middlewares: Middleware[]
): Promise<MiddlewareResult> {
  for (const middleware of middlewares) {
    const result = await middleware(request);
    if (result) return result; // Error response, stop chain
  }
  return null; // All passed
}

/**
 * Compose multiple middleware into one
 */
export function composeMiddleware(...middlewares: Middleware[]): Middleware {
  return async (request: Request) => {
    return runMiddleware(request, middlewares);
  };
}
```

## Auth Middleware

```typescript
// src/lib/middleware/auth.ts

import { createClient } from '@/lib/supabase';
import type { Middleware } from './types';

/**
 * Require authenticated user
 */
export const authMiddleware: Middleware = async (request) => {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return Response.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }

  // Attach user to request for later use
  (request as any).user = user;
  return null;
};

/**
 * Require specific role
 */
export function requireRole(role: 'student' | 'admin'): Middleware {
  return async (request) => {
    // First ensure user is authenticated
    const authResult = await authMiddleware(request);
    if (authResult) return authResult;

    const user = (request as any).user;

    // Get user role from database
    const supabase = await createClient();
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== role) {
      return Response.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    return null;
  };
}

/**
 * Require specific tier or higher
 */
export function requireTier(minTier: 'basic' | 'premium' | 'vip' | 'enterprise'): Middleware {
  const tierOrder = ['basic', 'premium', 'vip', 'enterprise'];

  return async (request) => {
    const authResult = await authMiddleware(request);
    if (authResult) return authResult;

    const user = (request as any).user;

    const supabase = await createClient();
    const { data: profile } = await supabase
      .from('users')
      .select('tier')
      .eq('id', user.id)
      .single();

    const userTierIndex = tierOrder.indexOf(profile?.tier || 'basic');
    const minTierIndex = tierOrder.indexOf(minTier);

    if (userTierIndex < minTierIndex) {
      return Response.json(
        { error: 'Upgrade required to access this feature' },
        { status: 403 }
      );
    }

    return null;
  };
}
```

## Validation Middleware

```typescript
// src/lib/middleware/validation.ts

import { ZodSchema, ZodError } from 'zod';
import type { Middleware } from './types';

/**
 * Validate request body against Zod schema
 */
export function validateBody<T>(schema: ZodSchema<T>): Middleware {
  return async (request) => {
    try {
      const body = await request.json();
      const result = schema.safeParse(body);

      if (!result.success) {
        return Response.json(
          {
            error: 'Validation failed',
            details: result.error.flatten(),
          },
          { status: 400 }
        );
      }

      // Attach validated data to request
      (request as any).validatedData = result.data;
      return null;
    } catch (error) {
      return Response.json(
        { error: 'Invalid JSON body' },
        { status: 400 }
      );
    }
  };
}

/**
 * Validate query parameters
 */
export function validateQuery<T>(schema: ZodSchema<T>): Middleware {
  return async (request) => {
    const url = new URL(request.url);
    const params = Object.fromEntries(url.searchParams);

    const result = schema.safeParse(params);

    if (!result.success) {
      return Response.json(
        {
          error: 'Invalid query parameters',
          details: result.error.flatten(),
        },
        { status: 400 }
      );
    }

    (request as any).validatedQuery = result.data;
    return null;
  };
}
```

## Rate Limit Middleware

```typescript
// src/lib/middleware/rateLimit.ts

import { checkRateLimit } from '@/lib/rate-limiter';
import type { Middleware } from './types';

/**
 * Apply rate limiting
 */
export function rateLimit(tier: 'auth' | 'api' | 'strict' = 'api'): Middleware {
  return async (request) => {
    const { success, headers } = await checkRateLimit(request, tier);

    if (!success) {
      return Response.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429, headers }
      );
    }

    return null;
  };
}
```

## Logging Middleware

```typescript
// src/lib/middleware/logging.ts

import { logger } from '@/lib/logger';
import type { Middleware } from './types';

/**
 * Log request details
 */
export const loggingMiddleware: Middleware = async (request) => {
  const url = new URL(request.url);

  logger.info({
    method: request.method,
    path: url.pathname,
    userAgent: request.headers.get('user-agent'),
  }, 'API Request');

  return null;
};
```

## Complete API Route Example

```typescript
// src/app/api/students/route.ts

import { runMiddleware } from '@/lib/middleware/stack';
import { authMiddleware, requireRole } from '@/lib/middleware/auth';
import { validateBody } from '@/lib/middleware/validation';
import { rateLimit } from '@/lib/middleware/rateLimit';
import { createStudentSchema } from '@/lib/schemas';
import { studentRepository } from '@/lib/repositories/StudentRepository';
import { logger } from '@/lib/logger';

export async function GET(request: Request) {
  // Public endpoint with rate limiting
  const error = await runMiddleware(request, [
    rateLimit('api'),
  ]);

  if (error) return error;

  try {
    const students = await studentRepository.findActiveStudents();
    return Response.json(students);
  } catch (err) {
    logger.error({ err }, 'Failed to fetch students');
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  // Protected endpoint: admin only, with validation
  const error = await runMiddleware(request, [
    rateLimit('strict'),
    requireRole('admin'),
    validateBody(createStudentSchema),
  ]);

  if (error) return error;

  try {
    const data = (request as any).validatedData;
    const student = await studentRepository.create(data);

    logger.info({ studentId: student.id }, 'Student created');
    return Response.json(student, { status: 201 });
  } catch (err) {
    logger.error({ err }, 'Failed to create student');
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

## Composing Middleware

```typescript
// src/lib/middleware/presets.ts

import { composeMiddleware } from './stack';
import { authMiddleware, requireRole, requireTier } from './auth';
import { rateLimit } from './rateLimit';
import { loggingMiddleware } from './logging';

/**
 * Preset for admin-only endpoints
 */
export const adminOnly = composeMiddleware(
  loggingMiddleware,
  rateLimit('strict'),
  requireRole('admin')
);

/**
 * Preset for premium feature endpoints
 */
export const premiumFeature = composeMiddleware(
  loggingMiddleware,
  rateLimit('api'),
  authMiddleware,
  requireTier('premium')
);

/**
 * Preset for public API endpoints
 */
export const publicApi = composeMiddleware(
  loggingMiddleware,
  rateLimit('api')
);

// Usage
export async function POST(request: Request) {
  const error = await adminOnly(request);
  if (error) return error;

  // Admin-only logic here...
}
```

## When to Use

**Use Middleware when:**
- Same logic needed across multiple routes (auth, validation)
- Need composable, reusable request handling
- Want to separate concerns cleanly

**Don't use when:**
- Logic is specific to one route only
- Simple operations that don't need abstraction

## Benefits

1. **DRY:** Write once, use everywhere
2. **Composable:** Mix and match middleware
3. **Testable:** Test each middleware in isolation
4. **Readable:** Clear separation of concerns
5. **Maintainable:** Update security logic in one place

## Related Patterns

- **Error Handling Framework** - Handle errors from middleware
- **Rate Limiting** - Specific rate limit middleware
- **Validation** - Input validation middleware
