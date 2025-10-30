import { NextRequest, NextResponse } from 'next/server'
import type { Middleware, RouteHandler, MiddlewareContext } from './types'

/**
 * Middleware Composition System
 *
 * Provides a clean way to compose multiple middleware functions into a single handler.
 * Middleware executes in the order specified, with each having access to the context.
 *
 * Features:
 * - Type-safe middleware composition
 * - Context passing between middleware
 * - Automatic response conversion
 * - Clean error propagation
 *
 * Usage:
 * ```typescript
 * export const POST = withMiddleware(
 *   [withValidation(schema), withLogging, withErrorHandling],
 *   async (req, { validated }) => {
 *     // Clean business logic with validated data
 *     return { success: true, data: validated }
 *   }
 * )
 * ```
 */

/**
 * Compose multiple middleware with a handler
 * Middleware runs in order: [0] -> [1] -> [2] -> handler
 */
export function withMiddleware(
  middleware: Middleware[],
  handler: RouteHandler
): (req: NextRequest) => Promise<NextResponse> {
  return async (req: NextRequest): Promise<NextResponse> => {
    // Initialize context
    const context: MiddlewareContext = {
      request: req,
    }

    // Create the composed handler by wrapping in reverse order
    // This ensures middleware executes in the specified order
    let composedHandler = handler

    // Wrap handler with each middleware in reverse order
    for (let i = middleware.length - 1; i >= 0; i--) {
      const currentHandler = composedHandler
      const currentMiddleware = middleware[i]

      composedHandler = async (req: NextRequest, ctx: MiddlewareContext) => {
        return currentMiddleware(currentHandler, ctx)
      }
    }

    // Execute the composed handler
    const result = await composedHandler(req, context)

    // Convert result to NextResponse if needed
    return ensureNextResponse(result)
  }
}

/**
 * Ensure the result is a NextResponse
 * Converts plain objects to JSON responses
 */
function ensureNextResponse(result: any): NextResponse {
  if (result instanceof NextResponse) {
    return result
  }

  // Convert plain object/array to JSON response
  if (typeof result === 'object' || Array.isArray(result)) {
    return NextResponse.json(result)
  }

  // Convert primitive to JSON response
  return NextResponse.json({ data: result })
}

/**
 * Helper to create a middleware function
 * Simplifies middleware creation with better TypeScript support
 */
export function createMiddleware(
  fn: (
    handler: RouteHandler,
    context: MiddlewareContext
  ) => Promise<NextResponse>
): Middleware {
  return fn
}
