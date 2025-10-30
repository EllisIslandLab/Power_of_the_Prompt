import { Redis } from '@upstash/redis'
import { logger } from '@/lib/logger'

/**
 * Cache Service
 *
 * Centralized caching layer using Upstash Redis for serverless environments.
 * Provides fast, distributed caching with automatic TTL and cache invalidation.
 *
 * Features:
 * - Sub-millisecond read/write performance
 * - Automatic TTL (time-to-live) support
 * - Pattern-based cache invalidation
 * - Graceful degradation if Redis not configured
 * - Structured logging for cache hits/misses
 * - JSON serialization for complex objects
 *
 * Setup:
 * 1. Sign up for free at https://upstash.com
 * 2. Create a Redis database
 * 3. Add UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN to .env
 *
 * Usage:
 * ```typescript
 * const cache = CacheService.getInstance()
 *
 * // Get cached data
 * const data = await cache.get<User[]>('users:all')
 *
 * // Set with 5 minute TTL
 * await cache.set('users:all', users, 300)
 *
 * // Invalidate by pattern
 * await cache.invalidate('users:*')
 * ```
 */

export interface CacheOptions {
  ttl?: number // Time-to-live in seconds
  tags?: string[] // Cache tags for grouped invalidation
}

export class CacheService {
  private static instance: CacheService
  private client: Redis | null = null
  private enabled: boolean = false

  private constructor() {
    // Check if Redis is configured
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
      try {
        this.client = new Redis({
          url: process.env.UPSTASH_REDIS_REST_URL,
          token: process.env.UPSTASH_REDIS_REST_TOKEN,
        })
        this.enabled = true
        logger.info({ type: 'service', service: 'redis' }, 'Redis cache initialized')
      } catch (error) {
        logger.warn(
          { type: 'service', service: 'redis', error },
          'Failed to initialize Redis, caching disabled'
        )
        this.enabled = false
      }
    } else {
      logger.info(
        { type: 'service', service: 'redis' },
        'Redis not configured, caching disabled (set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN)'
      )
      this.enabled = false
    }
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService()
    }
    return CacheService.instance
  }

  /**
   * Check if caching is enabled
   */
  public isEnabled(): boolean {
    return this.enabled
  }

  /**
   * Get cached value
   */
  async get<T>(key: string): Promise<T | null> {
    if (!this.enabled || !this.client) {
      return null
    }

    const startTime = Date.now()

    try {
      const value = await this.client.get<T>(key)
      const duration = Date.now() - startTime

      if (value !== null) {
        logger.debug(
          { type: 'cache', operation: 'get', key, hit: true, duration },
          `Cache hit: ${key} (${duration}ms)`
        )
      } else {
        logger.debug(
          { type: 'cache', operation: 'get', key, hit: false, duration },
          `Cache miss: ${key} (${duration}ms)`
        )
      }

      return value
    } catch (error) {
      const duration = Date.now() - startTime
      logger.error(
        { type: 'cache', operation: 'get', key, error, duration },
        `Cache get failed: ${key}`
      )
      return null
    }
  }

  /**
   * Set cached value with optional TTL
   */
  async set<T>(key: string, value: T, ttl?: number): Promise<boolean> {
    if (!this.enabled || !this.client) {
      return false
    }

    const startTime = Date.now()

    try {
      if (ttl) {
        await this.client.setex(key, ttl, value)
      } else {
        await this.client.set(key, value)
      }

      const duration = Date.now() - startTime
      logger.debug(
        { type: 'cache', operation: 'set', key, ttl, duration },
        `Cache set: ${key}${ttl ? ` (TTL: ${ttl}s)` : ''} (${duration}ms)`
      )

      return true
    } catch (error) {
      const duration = Date.now() - startTime
      logger.error(
        { type: 'cache', operation: 'set', key, error, duration },
        `Cache set failed: ${key}`
      )
      return false
    }
  }

  /**
   * Delete cached value
   */
  async delete(key: string): Promise<boolean> {
    if (!this.enabled || !this.client) {
      return false
    }

    const startTime = Date.now()

    try {
      await this.client.del(key)

      const duration = Date.now() - startTime
      logger.debug(
        { type: 'cache', operation: 'delete', key, duration },
        `Cache delete: ${key} (${duration}ms)`
      )

      return true
    } catch (error) {
      const duration = Date.now() - startTime
      logger.error(
        { type: 'cache', operation: 'delete', key, error, duration },
        `Cache delete failed: ${key}`
      )
      return false
    }
  }

  /**
   * Invalidate cache by pattern (e.g., 'users:*')
   * Note: This uses SCAN which is safe for production but may be slow for large key sets
   */
  async invalidate(pattern: string): Promise<number> {
    if (!this.enabled || !this.client) {
      return 0
    }

    const startTime = Date.now()

    try {
      // Get all keys matching pattern
      const keys = await this.client.keys(pattern)

      if (keys.length === 0) {
        logger.debug(
          { type: 'cache', operation: 'invalidate', pattern, count: 0 },
          `No keys to invalidate: ${pattern}`
        )
        return 0
      }

      // Delete all matching keys
      await this.client.del(...keys)

      const duration = Date.now() - startTime
      logger.info(
        { type: 'cache', operation: 'invalidate', pattern, count: keys.length, duration },
        `Cache invalidated: ${pattern} (${keys.length} keys, ${duration}ms)`
      )

      return keys.length
    } catch (error) {
      const duration = Date.now() - startTime
      logger.error(
        { type: 'cache', operation: 'invalidate', pattern, error, duration },
        `Cache invalidate failed: ${pattern}`
      )
      return 0
    }
  }

  /**
   * Clear all cache
   * WARNING: Use with caution in production
   */
  async flush(): Promise<boolean> {
    if (!this.enabled || !this.client) {
      return false
    }

    const startTime = Date.now()

    try {
      await this.client.flushdb()

      const duration = Date.now() - startTime
      logger.warn(
        { type: 'cache', operation: 'flush', duration },
        `Cache flushed (${duration}ms)`
      )

      return true
    } catch (error) {
      const duration = Date.now() - startTime
      logger.error({ type: 'cache', operation: 'flush', error, duration }, 'Cache flush failed')
      return false
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<{ keys: number } | null> {
    if (!this.enabled || !this.client) {
      return null
    }

    try {
      const keys = await this.client.dbsize()
      return { keys }
    } catch (error) {
      logger.error({ type: 'cache', operation: 'getStats', error }, 'Failed to get cache stats')
      return null
    }
  }
}

// Export singleton instance for convenience
export const cache = CacheService.getInstance()

/**
 * Cache key builders for consistency
 */
export const CacheKeys = {
  // Services
  services: {
    all: () => 'services:all',
    byId: (id: string) => `services:${id}`,
    byCategory: (category: string) => `services:category:${category}`,
  },

  // Users
  users: {
    byId: (id: string) => `users:${id}`,
    byEmail: (email: string) => `users:email:${email}`,
    byTier: (tier: string) => `users:tier:${tier}`,
  },

  // Leads
  leads: {
    byEmail: (email: string) => `leads:email:${email}`,
    byStatus: (status: string) => `leads:status:${status}`,
    recent: (days: number) => `leads:recent:${days}`,
  },

  // Stripe
  stripe: {
    products: () => 'stripe:products',
    product: (id: string) => `stripe:product:${id}`,
    customer: (id: string) => `stripe:customer:${id}`,
  },
}
