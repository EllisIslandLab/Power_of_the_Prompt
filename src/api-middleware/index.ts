/**
 * Middleware Exports
 *
 * Centralized exports for the composable middleware system.
 * Provides type-safe middleware composition for Next.js API routes.
 *
 * Usage:
 * ```typescript
 * import { withMiddleware, withValidation, withLogging, withErrorHandling } from '@/middleware'
 *
 * export const POST = withMiddleware(
 *   [withErrorHandling, withLogging, withValidation(schema)],
 *   async (req, { validated }) => {
 *     // Clean business logic
 *     return { success: true, data: validated }
 *   }
 * )
 * ```
 */

// Core composition
export { withMiddleware, createMiddleware } from './compose'

// Types
export type {
  Middleware,
  RouteHandler,
  MiddlewareContext,
  HandlerResult,
} from './types'

// Middleware functions
export { withValidation, withQueryValidation } from './withValidation'
export { withLogging } from './withLogging'
export { withErrorHandling } from './withErrorHandling'
export { withRateLimit } from './withRateLimit'
export type { RateLimitOptions } from './withRateLimit'

// Error classes
export {
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  RateLimitError,
} from './withErrorHandling'
