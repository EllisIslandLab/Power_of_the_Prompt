import { NextResponse } from 'next/server'
import type { Middleware, RouteHandler, MiddlewareContext } from './types'
import { rateLimiter, RateLimitConfig } from '@/lib/rate-limiter'
import { logger } from '@/lib/logger'

/**
 * Rate Limiting Middleware
 *
 * Protects API routes from abuse and brute force attacks using Upstash Redis.
 * Implements sliding window rate limiting with configurable tiers.
 *
 * Features:
 * - Multiple rate limit tiers (strict, standard, permissive, custom)
 * - IP-based rate limiting by default
 * - User-based rate limiting (if user in context)
 * - Automatic retry-after headers
 * - Rate limit info headers (limit, remaining, reset)
 * - Graceful degradation if Redis unavailable
 *
 * Usage:
 * ```typescript
 * // Strict rate limiting for auth routes (5 req/10s)
 * export const POST = withMiddleware(
 *   [
 *     withErrorHandling,
 *     withRateLimit({ tier: 'strict' }),
 *     withValidation(signInSchema)
 *   ],
 *   async (req, { validated }) => {
 *     // Handler logic
 *   }
 * )
 *
 * // Custom rate limiting (100 req/min)
 * export const POST = withMiddleware(
 *   [withRateLimit({ tier: 'custom', requests: 100, window: '1 m' })],
 *   async (req) => {
 *     // Handler logic
 *   }
 * )
 * ```
 */

export interface RateLimitOptions extends RateLimitConfig {
  /**
   * Route identifier for rate limiting
   * Defaults to request pathname
   */
  route?: string

  /**
   * Custom identifier function
   * Defaults to using IP address or user ID from context
   */
  getIdentifier?: (context: MiddlewareContext) => string | null

  /**
   * Custom response when rate limit exceeded
   */
  onRateLimit?: (result: {
    limit: number
    remaining: number
    reset: number
  }) => NextResponse
}

/**
 * Get client IP address from request
 */
function getClientIp(request: Request): string {
  // Try various headers in order of preference
  const headers = [
    'x-real-ip',
    'x-forwarded-for',
    'cf-connecting-ip', // Cloudflare
    'x-vercel-forwarded-for', // Vercel
  ]

  for (const header of headers) {
    const value = new Headers(request.headers).get(header)
    if (value) {
      // x-forwarded-for can contain multiple IPs, take the first one
      return value.split(',')[0].trim()
    }
  }

  return 'anonymous'
}

/**
 * Rate limiting middleware factory
 */
export function withRateLimit(options: RateLimitOptions = { tier: 'standard' }): Middleware {
  return async (
    handler: RouteHandler,
    context: MiddlewareContext
  ): Promise<NextResponse> => {
    const { request } = context
    const { pathname } = new URL(request.url)

    // Determine route identifier
    const route = options.route || pathname

    // Determine identifier (IP address or user ID)
    let identifier: string

    if (options.getIdentifier) {
      // Use custom identifier function
      const customId = options.getIdentifier(context)
      identifier = customId || getClientIp(request)
    } else {
      // Use user ID if authenticated, otherwise use IP
      identifier = (context.user?.id as string) || getClientIp(request)
    }

    // Check rate limit
    const result = await rateLimiter.checkLimit(route, identifier, {
      tier: options.tier,
      requests: options.requests,
      window: options.window,
    })

    // Create response headers with rate limit info
    const headers = new Headers()
    headers.set('X-RateLimit-Limit', result.limit.toString())
    headers.set('X-RateLimit-Remaining', result.remaining.toString())
    headers.set('X-RateLimit-Reset', result.reset.toString())

    // If rate limit exceeded
    if (!result.success) {
      // Calculate retry-after in seconds
      const retryAfter = Math.ceil((result.reset - Date.now()) / 1000)
      headers.set('Retry-After', retryAfter.toString())

      logger.warn(
        {
          type: 'ratelimit',
          route,
          identifier,
          limit: result.limit,
          reset: result.reset,
          retryAfter,
        },
        `Rate limit exceeded for ${route}`
      )

      // Use custom response if provided
      if (options.onRateLimit) {
        const response = options.onRateLimit({
          limit: result.limit,
          remaining: result.remaining,
          reset: result.reset,
        })

        // Add rate limit headers to custom response
        headers.forEach((value, key) => {
          response.headers.set(key, value)
        })

        return response
      }

      // Default rate limit response
      return NextResponse.json(
        {
          error: 'Too many requests',
          message: `Rate limit exceeded. Please try again in ${retryAfter} seconds.`,
          limit: result.limit,
          remaining: result.remaining,
          reset: result.reset,
          retryAfter,
        },
        {
          status: 429,
          headers,
        }
      )
    }

    // Rate limit check passed - continue to handler
    const response = await handler(request, context)

    // Add rate limit headers to successful response
    headers.forEach((value, key) => {
      response.headers.set(key, value)
    })

    return response
  }
}
