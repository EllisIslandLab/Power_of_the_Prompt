import { logger } from '@/lib/logger'

/**
 * Base Adapter
 *
 * Abstract base class providing common patterns for external service integrations.
 * Handles error logging, retry logic, and consistent error handling.
 *
 * Benefits:
 * - Centralized service integration logic
 * - Consistent error handling across all services
 * - Automatic retry logic for transient failures
 * - Performance monitoring with timing
 * - Easy to add circuit breakers later
 * - Simplifies testing with mock implementations
 *
 * Usage:
 * ```typescript
 * class StripeAdapter extends BaseAdapter {
 *   constructor() {
 *     super('stripe')
 *   }
 * }
 * ```
 */

export interface RetryOptions {
  maxRetries?: number
  retryDelay?: number
  retryableErrors?: string[]
}

export abstract class BaseAdapter {
  protected serviceName: string
  protected defaultRetryOptions: RetryOptions = {
    maxRetries: 3,
    retryDelay: 1000, // 1 second
    retryableErrors: ['ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND'],
  }

  constructor(serviceName: string) {
    this.serviceName = serviceName
  }

  /**
   * Execute a service operation with automatic retry logic
   */
  protected async executeWithRetry<T>(
    operation: () => Promise<T>,
    operationName: string,
    options?: RetryOptions
  ): Promise<T> {
    const opts = { ...this.defaultRetryOptions, ...options }
    const startTime = Date.now()
    let lastError: any

    for (let attempt = 1; attempt <= (opts.maxRetries || 3); attempt++) {
      try {
        const result = await operation()
        const duration = Date.now() - startTime

        if (attempt > 1) {
          logger.info(
            {
              type: 'service',
              service: this.serviceName,
              operation: operationName,
              attempt,
              duration,
            },
            `${this.serviceName}.${operationName} succeeded on retry ${attempt} (${duration}ms)`
          )
        }

        return result
      } catch (error: any) {
        lastError = error
        const duration = Date.now() - startTime

        // Check if error is retryable
        const isRetryable = this.isRetryableError(error, opts.retryableErrors || [])

        if (!isRetryable || attempt >= (opts.maxRetries || 3)) {
          logger.error(
            {
              type: 'service',
              service: this.serviceName,
              operation: operationName,
              attempt,
              error,
              duration,
              isRetryable,
            },
            `${this.serviceName}.${operationName} failed after ${attempt} attempts (${duration}ms)`
          )
          throw error
        }

        logger.warn(
          {
            type: 'service',
            service: this.serviceName,
            operation: operationName,
            attempt,
            error: error.message,
            retryDelay: opts.retryDelay,
          },
          `${this.serviceName}.${operationName} failed, retrying in ${opts.retryDelay}ms...`
        )

        // Wait before retry
        await this.delay(opts.retryDelay || 1000)
      }
    }

    throw lastError
  }

  /**
   * Check if an error is retryable
   */
  protected isRetryableError(error: any, retryableErrors: string[]): boolean {
    // Network errors
    if (error.code && retryableErrors.includes(error.code)) {
      return true
    }

    // Rate limiting (429)
    if (error.status === 429 || error.statusCode === 429) {
      return true
    }

    // Server errors (5xx)
    if (error.status >= 500 || error.statusCode >= 500) {
      return true
    }

    return false
  }

  /**
   * Delay helper for retry logic
   */
  protected delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  /**
   * Log a successful operation
   */
  protected logSuccess(operationName: string, duration: number, meta?: Record<string, any>): void {
    logger.info(
      {
        type: 'service',
        service: this.serviceName,
        operation: operationName,
        duration,
        ...meta,
      },
      `${this.serviceName}.${operationName} succeeded (${duration}ms)`
    )
  }

  /**
   * Log a failed operation
   */
  protected logError(
    operationName: string,
    error: any,
    duration: number,
    meta?: Record<string, any>
  ): void {
    logger.error(
      {
        type: 'service',
        service: this.serviceName,
        operation: operationName,
        error,
        duration,
        ...meta,
      },
      `${this.serviceName}.${operationName} failed (${duration}ms)`
    )
  }
}
