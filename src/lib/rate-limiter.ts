import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { logger } from '@/lib/logger'

/**
 * Rate Limiter Service
 *
 * Provides rate limiting using Upstash Redis for serverless environments.
 * Protects API routes from abuse and brute force attacks.
 *
 * Features:
 * - Multiple rate limit tiers (strict, standard, permissive)
 * - Sliding window algorithm for accurate rate limiting
 * - Graceful degradation if Redis not configured
 * - Automatic logging of rate limit violations
 * - IP-based and user-based rate limiting
 *
 * Setup:
 * Uses the same Redis configuration as cache service.
 * Requires UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in .env
 *
 * Usage:
 * ```typescript
 * const rateLimiter = RateLimiterService.getInstance()
 *
 * // Check rate limit for IP address
 * const { success, limit, remaining, reset } = await rateLimiter.checkLimit(
 *   'auth:signin',
 *   request.ip
 * )
 *
 * if (!success) {
 *   return NextResponse.json(
 *     { error: 'Too many requests' },
 *     { status: 429 }
 *   )
 * }
 * ```
 */

export type RateLimitTier = 'strict' | 'standard' | 'permissive' | 'custom'

export interface RateLimitConfig {
  tier: RateLimitTier
  requests?: number // Number of requests (for custom tier)
  window?: `${number} ms` | `${number} s` | `${number} m` | `${number} h` | `${number} d` // Time window (for custom tier)
}

export interface RateLimitResult {
  success: boolean // Whether the request is allowed
  limit: number // Total requests allowed in window
  remaining: number // Remaining requests in current window
  reset: number // Unix timestamp when the limit resets
}

export class RateLimiterService {
  private static instance: RateLimiterService
  private client: Redis | null = null
  private enabled: boolean = false
  private limiters: Map<string, Ratelimit> = new Map()

  private constructor() {
    // Check if Redis is configured
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
      try {
        this.client = new Redis({
          url: process.env.UPSTASH_REDIS_REST_URL,
          token: process.env.UPSTASH_REDIS_REST_TOKEN,
        })
        this.enabled = true
        logger.info({ type: 'service', service: 'ratelimit' }, 'Rate limiter initialized')
      } catch (error) {
        logger.error({ type: 'service', service: 'ratelimit', error }, 'Failed to initialize rate limiter')
        this.enabled = false
      }
    } else {
      logger.warn(
        { type: 'service', service: 'ratelimit' },
        'Rate limiter not configured - missing UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN'
      )
      this.enabled = false
    }
  }

  static getInstance(): RateLimiterService {
    if (!RateLimiterService.instance) {
      RateLimiterService.instance = new RateLimiterService()
    }
    return RateLimiterService.instance
  }

  /**
   * Get or create a rate limiter for a specific tier
   */
  private getLimiter(config: RateLimitConfig): Ratelimit | null {
    if (!this.enabled || !this.client) {
      return null
    }

    const key = `${config.tier}-${config.requests}-${config.window}`

    if (this.limiters.has(key)) {
      return this.limiters.get(key)!
    }

    let limiter: Ratelimit

    switch (config.tier) {
      case 'strict':
        // 5 requests per 10 seconds - for sensitive operations (login, signup)
        limiter = new Ratelimit({
          redis: this.client,
          limiter: Ratelimit.slidingWindow(5, '10 s'),
          analytics: true,
          prefix: 'ratelimit:strict',
        })
        break

      case 'standard':
        // 10 requests per 10 seconds - for normal API routes
        limiter = new Ratelimit({
          redis: this.client,
          limiter: Ratelimit.slidingWindow(10, '10 s'),
          analytics: true,
          prefix: 'ratelimit:standard',
        })
        break

      case 'permissive':
        // 30 requests per 10 seconds - for read-heavy routes
        limiter = new Ratelimit({
          redis: this.client,
          limiter: Ratelimit.slidingWindow(30, '10 s'),
          analytics: true,
          prefix: 'ratelimit:permissive',
        })
        break

      case 'custom':
        if (!config.requests || !config.window) {
          logger.error(
            { type: 'ratelimit', config },
            'Custom rate limit requires requests and window parameters'
          )
          return null
        }
        limiter = new Ratelimit({
          redis: this.client,
          limiter: Ratelimit.slidingWindow(config.requests, config.window),
          analytics: true,
          prefix: 'ratelimit:custom',
        })
        break

      default:
        logger.error({ type: 'ratelimit', tier: config.tier }, 'Unknown rate limit tier')
        return null
    }

    this.limiters.set(key, limiter)
    return limiter
  }

  /**
   * Check rate limit for an identifier (IP address, user ID, etc.)
   */
  async checkLimit(
    route: string,
    identifier: string,
    config: RateLimitConfig = { tier: 'standard' }
  ): Promise<RateLimitResult> {
    // If rate limiting is disabled, allow all requests
    if (!this.enabled) {
      logger.debug(
        { type: 'ratelimit', route, identifier },
        'Rate limiting disabled - allowing request'
      )
      return {
        success: true,
        limit: Infinity,
        remaining: Infinity,
        reset: 0,
      }
    }

    const limiter = this.getLimiter(config)

    if (!limiter) {
      // If limiter creation failed, allow the request (fail open)
      logger.warn(
        { type: 'ratelimit', route, identifier },
        'Rate limiter unavailable - allowing request'
      )
      return {
        success: true,
        limit: Infinity,
        remaining: Infinity,
        reset: 0,
      }
    }

    try {
      // Combine route and identifier for the rate limit key
      const key = `${route}:${identifier}`
      const result = await limiter.limit(key)

      // Log rate limit violations
      if (!result.success) {
        logger.warn(
          {
            type: 'ratelimit',
            route,
            identifier,
            limit: result.limit,
            remaining: result.remaining,
            reset: result.reset,
          },
          `Rate limit exceeded for ${route}`
        )
      } else {
        logger.debug(
          {
            type: 'ratelimit',
            route,
            identifier,
            remaining: result.remaining,
          },
          `Rate limit check passed (${result.remaining} remaining)`
        )
      }

      return {
        success: result.success,
        limit: result.limit,
        remaining: result.remaining,
        reset: result.reset,
      }
    } catch (error) {
      // If rate limiting fails, allow the request (fail open)
      logger.error(
        { type: 'ratelimit', route, identifier, error },
        'Rate limit check failed - allowing request'
      )
      return {
        success: true,
        limit: Infinity,
        remaining: Infinity,
        reset: 0,
      }
    }
  }

  /**
   * Get rate limit info without incrementing the counter
   * Note: Not currently implemented - would need custom Redis logic
   */
  async getRateLimitInfo(
    route: string,
    identifier: string,
    config: RateLimitConfig = { tier: 'standard' }
  ): Promise<RateLimitResult | null> {
    // TODO: Implement this when needed
    // Would require custom Redis key lookup without incrementing
    return null
  }

  /**
   * Reset rate limit for an identifier (useful for testing or admin overrides)
   */
  async resetLimit(route: string, identifier: string): Promise<void> {
    if (!this.enabled || !this.client) {
      return
    }

    try {
      const key = `${route}:${identifier}`
      await this.client.del(key)
      logger.info(
        { type: 'ratelimit', route, identifier },
        'Rate limit reset'
      )
    } catch (error) {
      logger.error(
        { type: 'ratelimit', route, identifier, error },
        'Failed to reset rate limit'
      )
    }
  }

  /**
   * Check if rate limiting is enabled
   */
  isEnabled(): boolean {
    return this.enabled
  }
}

// Export singleton instance
export const rateLimiter = RateLimiterService.getInstance()

// Export common rate limit configurations
export const RateLimitConfigs = {
  AUTH: { tier: 'strict' as RateLimitTier }, // 5 req/10s for auth routes
  API: { tier: 'standard' as RateLimitTier }, // 10 req/10s for API routes
  READ: { tier: 'permissive' as RateLimitTier }, // 30 req/10s for read routes
  WEBHOOK: { tier: 'custom' as RateLimitTier, requests: 100, window: '1 m' }, // 100 req/min for webhooks
}
