import { NextResponse } from 'next/server'
import type { Middleware, RouteHandler, MiddlewareContext } from './types'
import { logger } from '@/lib/logger'

/**
 * Error Handling Middleware
 *
 * Catches and handles all errors from handlers and other middleware.
 * Provides consistent error responses and prevents crashes.
 *
 * Features:
 * - Catches all unhandled errors
 * - Provides consistent error response format
 * - Logs errors with context
 * - Development vs production error details
 * - Type-safe error handling
 *
 * Usage:
 * ```typescript
 * export const POST = withMiddleware(
 *   [withErrorHandling, withValidation(schema)],
 *   async (req, { validated }) => {
 *     // Any error thrown here is caught automatically
 *     throw new Error('Something went wrong')
 *   }
 * )
 * ```
 */

export const withErrorHandling: Middleware = async (
  handler: RouteHandler,
  context: MiddlewareContext
) => {
  try {
    // Execute handler and other middleware
    return await handler(context.request, context)
  } catch (error: any) {
    // Extract request info for logging
    const { method } = context.request
    const { pathname } = new URL(context.request.url)
    const duration = context.startTime ? Date.now() - context.startTime : 0

    // Log error with full context
    logger.error(
      {
        type: 'api',
        method,
        path: pathname,
        error: error.message || error,
        stack: error.stack,
        duration,
      },
      `Unhandled error in ${method} ${pathname}`
    )

    // Determine error status code
    const status = determineStatusCode(error)

    // Build error response
    const errorResponse: any = {
      error: error.message || 'Internal server error',
      status,
    }

    // In development, include more details
    if (process.env.NODE_ENV === 'development') {
      errorResponse.stack = error.stack
      errorResponse.details = error
    }

    // Return error response
    return NextResponse.json(errorResponse, { status })
  }
}

/**
 * Determine appropriate HTTP status code from error
 */
function determineStatusCode(error: any): number {
  // Check for explicit status code
  if (error.status) return error.status
  if (error.statusCode) return error.statusCode

  // Check for common error types
  if (error.name === 'ValidationError') return 400
  if (error.name === 'UnauthorizedError') return 401
  if (error.name === 'ForbiddenError') return 403
  if (error.name === 'NotFoundError') return 404
  if (error.name === 'ConflictError') return 409
  if (error.name === 'RateLimitError') return 429

  // Default to 500 for unknown errors
  return 500
}

/**
 * Custom error classes for better error handling
 */

export class ValidationError extends Error {
  status = 400
  constructor(message: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

export class UnauthorizedError extends Error {
  status = 401
  constructor(message: string = 'Unauthorized') {
    super(message)
    this.name = 'UnauthorizedError'
  }
}

export class ForbiddenError extends Error {
  status = 403
  constructor(message: string = 'Forbidden') {
    super(message)
    this.name = 'ForbiddenError'
  }
}

export class NotFoundError extends Error {
  status = 404
  constructor(message: string = 'Not found') {
    super(message)
    this.name = 'NotFoundError'
  }
}

export class ConflictError extends Error {
  status = 409
  constructor(message: string = 'Conflict') {
    super(message)
    this.name = 'ConflictError'
  }
}

export class RateLimitError extends Error {
  status = 429
  constructor(message: string = 'Too many requests') {
    super(message)
    this.name = 'RateLimitError'
  }
}
