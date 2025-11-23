# Error Handling Framework Template

## Quick Start

Implement consistent error handling across all API routes.

## Structure

```typescript
// src/lib/errors/AppError.ts

/**
 * Base application error class
 * All custom errors should extend this
 */
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public isOperational: boolean = true,
    public code?: string
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      error: this.message,
      code: this.code,
      statusCode: this.statusCode,
    };
  }
}

/**
 * 400 Bad Request - Invalid input
 */
export class ValidationError extends AppError {
  constructor(message: string, public details?: unknown) {
    super(message, 400, true, 'VALIDATION_ERROR');
  }

  toJSON() {
    return {
      ...super.toJSON(),
      details: this.details,
    };
  }
}

/**
 * 401 Unauthorized - Not authenticated
 */
export class UnauthorizedError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 401, true, 'UNAUTHORIZED');
  }
}

/**
 * 403 Forbidden - Not permitted
 */
export class ForbiddenError extends AppError {
  constructor(message = 'You do not have permission to perform this action') {
    super(message, 403, true, 'FORBIDDEN');
  }
}

/**
 * 404 Not Found - Resource doesn't exist
 */
export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404, true, 'NOT_FOUND');
  }
}

/**
 * 409 Conflict - Resource already exists
 */
export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, true, 'CONFLICT');
  }
}

/**
 * 429 Too Many Requests - Rate limited
 */
export class RateLimitError extends AppError {
  constructor(retryAfter?: number) {
    super('Rate limit exceeded. Please try again later.', 429, true, 'RATE_LIMITED');
    this.retryAfter = retryAfter;
  }

  retryAfter?: number;
}

/**
 * 500 Internal Server Error - Unexpected error
 */
export class InternalError extends AppError {
  constructor(message = 'An unexpected error occurred') {
    super(message, 500, false, 'INTERNAL_ERROR');
  }
}
```

## Error Handler

```typescript
// src/lib/errors/errorHandler.ts

import { logger } from '@/lib/logger';
import { AppError, InternalError } from './AppError';
import { ZodError } from 'zod';

interface ErrorResponse {
  error: string;
  code?: string;
  details?: unknown;
}

/**
 * Convert any error to a consistent Response
 */
export function handleError(error: unknown): Response {
  // Handle Zod validation errors
  if (error instanceof ZodError) {
    return Response.json(
      {
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: error.flatten(),
      } as ErrorResponse,
      { status: 400 }
    );
  }

  // Handle our custom AppErrors
  if (error instanceof AppError) {
    // Log non-operational errors (unexpected)
    if (!error.isOperational) {
      logger.error({ err: error, stack: error.stack }, 'Non-operational error');
    }

    return Response.json(error.toJSON() as ErrorResponse, {
      status: error.statusCode,
    });
  }

  // Handle Supabase errors
  if (isSupabaseError(error)) {
    return handleSupabaseError(error);
  }

  // Handle Stripe errors
  if (isStripeError(error)) {
    return handleStripeError(error);
  }

  // Unknown error - log and return generic message
  logger.error({ err: error }, 'Unexpected error');

  return Response.json(
    {
      error: 'An unexpected error occurred',
      code: 'INTERNAL_ERROR',
    } as ErrorResponse,
    { status: 500 }
  );
}

/**
 * Check if error is from Supabase
 */
function isSupabaseError(error: unknown): error is { code: string; message: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error
  );
}

/**
 * Handle Supabase-specific errors
 */
function handleSupabaseError(error: { code: string; message: string }): Response {
  const statusMap: Record<string, number> = {
    'PGRST116': 404, // Not found
    '23505': 409, // Unique constraint violation
    '23503': 400, // Foreign key violation
    '42501': 403, // Insufficient privilege
  };

  const status = statusMap[error.code] || 500;

  if (status === 500) {
    logger.error({ err: error }, 'Supabase error');
  }

  return Response.json(
    {
      error: status === 500 ? 'Database error' : error.message,
      code: error.code,
    },
    { status }
  );
}

/**
 * Check if error is from Stripe
 */
function isStripeError(error: unknown): error is { type: string; message: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'type' in error &&
    typeof (error as any).type === 'string' &&
    (error as any).type.startsWith('Stripe')
  );
}

/**
 * Handle Stripe-specific errors
 */
function handleStripeError(error: { type: string; message: string }): Response {
  const typeMap: Record<string, number> = {
    'StripeCardError': 400,
    'StripeInvalidRequestError': 400,
    'StripeAuthenticationError': 401,
    'StripePermissionError': 403,
    'StripeRateLimitError': 429,
  };

  const status = typeMap[error.type] || 500;

  if (status === 500) {
    logger.error({ err: error }, 'Stripe error');
  }

  return Response.json(
    {
      error: status === 500 ? 'Payment processing error' : error.message,
    },
    { status }
  );
}
```

## Usage in API Routes

```typescript
// src/app/api/students/[id]/route.ts

import { studentRepository } from '@/lib/repositories/StudentRepository';
import { handleError } from '@/lib/errors/errorHandler';
import { NotFoundError, ForbiddenError } from '@/lib/errors/AppError';
import { hasPermission } from '@/lib/permissions';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const student = await studentRepository.findById(params.id);

    if (!student) {
      throw new NotFoundError('Student');
    }

    return Response.json(student);
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = (request as any).user;

    // Check permissions
    if (!hasPermission(user, 'admin')) {
      throw new ForbiddenError('Only admins can delete students');
    }

    const exists = await studentRepository.exists(params.id);
    if (!exists) {
      throw new NotFoundError('Student');
    }

    await studentRepository.delete(params.id);
    return Response.json({ success: true });
  } catch (error) {
    return handleError(error);
  }
}
```

## Async Handler Wrapper

```typescript
// src/lib/errors/asyncHandler.ts

type AsyncHandler = (
  request: Request,
  context?: { params: Record<string, string> }
) => Promise<Response>;

/**
 * Wrap async handlers with automatic error handling
 */
export function asyncHandler(handler: AsyncHandler): AsyncHandler {
  return async (request, context) => {
    try {
      return await handler(request, context);
    } catch (error) {
      return handleError(error);
    }
  };
}

// Usage - cleaner API routes
export const GET = asyncHandler(async (request, { params }) => {
  const student = await studentRepository.findById(params!.id);

  if (!student) {
    throw new NotFoundError('Student');
  }

  return Response.json(student);
});

export const DELETE = asyncHandler(async (request, { params }) => {
  await studentRepository.delete(params!.id);
  return Response.json({ success: true });
});
```

## Error Boundary for React

```typescript
// src/components/ErrorBoundary.tsx
'use client';

import { Component, ReactNode } from 'react';
import { logger } from '@/lib/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error({
      err: error,
      componentStack: errorInfo.componentStack,
    }, 'React Error Boundary caught error');
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <h2 className="text-red-800 font-semibold">Something went wrong</h2>
          <p className="text-red-600 text-sm mt-1">
            Please refresh the page or try again later.
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}
```

## When to Use

**Use Error Handling Framework when:**
- Building API routes that need consistent error responses
- Want to differentiate between expected and unexpected errors
- Need to log errors appropriately
- Want type-safe error handling

**Always wrap async handlers with try/catch or asyncHandler**

## Benefits

1. **Consistency:** All errors return the same format
2. **Type Safety:** Custom error classes with proper types
3. **Logging:** Automatic logging of unexpected errors
4. **Client-Friendly:** Clear error messages for users
5. **Debuggable:** Operational vs non-operational distinction

## Related Patterns

- **Middleware Stack** - Integrate error handling in middleware
- **Logging** - Use with structured logging
- **Validation** - Pair with Zod validation errors
