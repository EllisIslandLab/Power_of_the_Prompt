import type { Middleware, RouteHandler, MiddlewareContext } from './types'
import { logger } from '@/lib/logger'

/**
 * Logging Middleware
 *
 * Automatically logs all API requests with timing, method, path, and status.
 * Adds structured logging context for better observability.
 *
 * Features:
 * - Automatic request/response logging
 * - Performance timing (milliseconds)
 * - HTTP method and path logging
 * - Response status logging
 * - Error logging with context
 *
 * Usage:
 * ```typescript
 * export const POST = withMiddleware(
 *   [withLogging],
 *   async (req, context) => {
 *     // Request is automatically logged
 *     return { success: true }
 *     // Response is automatically logged with timing
 *   }
 * )
 * ```
 */

export const withLogging: Middleware = async (
  handler: RouteHandler,
  context: MiddlewareContext
) => {
  const startTime = Date.now()
  context.startTime = startTime

  // Extract request info
  const { method } = context.request
  const { pathname } = new URL(context.request.url)

  // Log incoming request
  logger.debug(
    {
      type: 'api',
      method,
      path: pathname,
    },
    `${method} ${pathname}`
  )

  try {
    // Execute handler
    const response = await handler(context.request, context)

    // Calculate duration
    const duration = Date.now() - startTime

    // Log successful response
    logger.info(
      {
        type: 'api',
        method,
        path: pathname,
        status: response.status,
        duration,
      },
      `${method} ${pathname} ${response.status} (${duration}ms)`
    )

    return response
  } catch (error) {
    // Calculate duration for error case
    const duration = Date.now() - startTime

    // Log error response
    logger.error(
      {
        type: 'api',
        method,
        path: pathname,
        error,
        duration,
      },
      `${method} ${pathname} failed (${duration}ms)`
    )

    // Re-throw error to be handled by error middleware
    throw error
  }
}
