import { NextResponse } from 'next/server'
import { z } from 'zod'
import type { Middleware, RouteHandler, MiddlewareContext } from './types'
import { formatZodErrors } from '@/lib/validation'

/**
 * Validation Middleware
 *
 * Validates incoming request data against a Zod schema.
 * Adds validated data to context.validated for use in handlers.
 *
 * Features:
 * - Type-safe validation with Zod
 * - User-friendly error messages
 * - Automatic JSON parsing
 * - SQL injection and XSS prevention
 *
 * Usage:
 * ```typescript
 * export const POST = withMiddleware(
 *   [withValidation(signInSchema)],
 *   async (req, { validated }) => {
 *     const { email, password } = validated // Type-safe!
 *     // ... business logic
 *   }
 * )
 * ```
 */

export function withValidation<T extends z.ZodType>(
  schema: T
): Middleware {
  return async (
    handler: RouteHandler,
    context: MiddlewareContext
  ): Promise<NextResponse> => {
    try {
      // Parse request body
      const body = await context.request.json()

      // Validate against schema
      const result = schema.safeParse(body)

      if (!result.success) {
        // Return user-friendly validation errors
        const errors = formatZodErrors(result.error)
        return NextResponse.json(
          {
            error: 'Validation failed',
            details: errors,
          },
          { status: 400 }
        )
      }

      // Add validated data to context
      context.validated = result.data

      // Continue to next middleware/handler
      return handler(context.request, context)
    } catch (error) {
      // Handle JSON parsing errors
      if (error instanceof SyntaxError) {
        return NextResponse.json(
          { error: 'Invalid JSON in request body' },
          { status: 400 }
        )
      }

      // Re-throw unexpected errors
      throw error
    }
  }
}

/**
 * Validation middleware for query parameters
 * Validates URL search params instead of request body
 */
export function withQueryValidation<T extends z.ZodType>(
  schema: T
): Middleware {
  return async (
    handler: RouteHandler,
    context: MiddlewareContext
  ): Promise<NextResponse> => {
    try {
      // Parse query parameters
      const { searchParams } = new URL(context.request.url)
      const query = Object.fromEntries(searchParams.entries())

      // Validate against schema
      const result = schema.safeParse(query)

      if (!result.success) {
        const errors = formatZodErrors(result.error)
        return NextResponse.json(
          {
            error: 'Invalid query parameters',
            details: errors,
          },
          { status: 400 }
        )
      }

      // Add validated query to context
      context.validated = result.data

      // Continue to next middleware/handler
      return handler(context.request, context)
    } catch (error) {
      throw error
    }
  }
}
