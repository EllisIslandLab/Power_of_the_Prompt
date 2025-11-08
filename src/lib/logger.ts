import pino from 'pino'

/**
 * Production-Grade Structured Logger using Pino
 *
 * Features:
 * - Fast, non-blocking async logging
 * - Structured JSON output for production
 * - Pretty printing in development
 * - Automatic redaction of sensitive fields
 * - Child loggers for adding context
 * - Log level filtering (debug disabled in production)
 *
 * Usage:
 * ```typescript
 * import { logger } from '@/lib/logger'
 *
 * // Simple logging
 * logger.info('User signed in')
 * logger.error('Payment failed', { userId, error })
 *
 * // Child logger with context
 * const userLogger = logger.child({ userId: '123', email: 'user@example.com' })
 * userLogger.info('Action performed') // Automatically includes userId and email
 * ```
 */

const isProduction = process.env.NODE_ENV === 'production'
const isDevelopment = process.env.NODE_ENV === 'development'

// Configure Pino logger
export const logger = pino({
  // Log level: 'debug' in dev, 'info' in production
  level: isDevelopment ? 'debug' : 'info',

  // Redact sensitive fields (never log these)
  redact: {
    paths: [
      'password',
      'token',
      'accessToken',
      'refreshToken',
      'secret',
      'apiKey',
      'api_key',
      'creditCard',
      'ssn',
      '*.password',
      '*.token',
      '*.accessToken',
      '*.secret',
      '*.apiKey',
      '*.api_key',
      'req.headers.authorization',
      'req.headers.cookie',
    ],
    censor: '[REDACTED]',
  },

  // Pretty printing in development, JSON in production
  // Note: pino-pretty uses worker threads which can cause "worker has exited" errors
  // Disabled for now to prevent crashes - using JSON output in development
  transport: undefined,

  // Base fields included in every log
  base: {
    env: process.env.NODE_ENV,
  },

  // Timestamps
  timestamp: pino.stdTimeFunctions.isoTime,
})

/**
 * Create a child logger with additional context
 *
 * @example
 * const userLogger = createLogger({ userId: '123', email: 'user@example.com' })
 * userLogger.info('User action') // Automatically includes userId and email
 */
export function createLogger(context: Record<string, any>) {
  return logger.child(context)
}

/**
 * Log HTTP request/response
 *
 * @example
 * logRequest('POST', '/api/auth/signin', 200, 45)
 */
export function logRequest(
  method: string,
  url: string,
  status: number,
  duration: number,
  meta?: Record<string, any>
) {
  const log = {
    type: 'http',
    method,
    url,
    status,
    duration,
    ...meta,
  }

  if (status >= 500) {
    logger.error(log, `${method} ${url} - ${status} (${duration}ms)`)
  } else if (status >= 400) {
    logger.warn(log, `${method} ${url} - ${status} (${duration}ms)`)
  } else {
    logger.info(log, `${method} ${url} - ${status} (${duration}ms)`)
  }
}

/**
 * Log database operations
 *
 * @example
 * logDatabase('query', 'users', 'findByEmail', 12)
 */
export function logDatabase(
  operation: 'query' | 'insert' | 'update' | 'delete',
  table: string,
  action: string,
  duration: number,
  meta?: Record<string, any>
) {
  logger.debug(
    {
      type: 'database',
      operation,
      table,
      action,
      duration,
      ...meta,
    },
    `DB ${operation} - ${table}.${action} (${duration}ms)`
  )
}

/**
 * Log external service calls
 *
 * @example
 * logService('stripe', 'createPaymentIntent', true, 234)
 */
export function logService(
  service: 'stripe' | 'resend' | 'supabase' | 'airtable',
  action: string,
  success: boolean,
  duration: number,
  meta?: Record<string, any>
) {
  const log = {
    type: 'service',
    service,
    action,
    success,
    duration,
    ...meta,
  }

  if (success) {
    logger.info(log, `${service}.${action} succeeded (${duration}ms)`)
  } else {
    logger.error(log, `${service}.${action} failed (${duration}ms)`)
  }
}

/**
 * Log payment/financial operations
 *
 * @example
 * logPayment('charge', 'succeeded', 9900, 'usd', { customerId: 'cus_123' })
 */
export function logPayment(
  operation: 'charge' | 'refund' | 'subscription',
  status: 'succeeded' | 'failed' | 'pending',
  amount: number,
  currency: string,
  meta?: Record<string, any>
) {
  logger.info(
    {
      type: 'payment',
      operation,
      status,
      amount,
      currency,
      ...meta,
    },
    `Payment ${operation} ${status} - ${amount} ${currency}`
  )
}

/**
 * Log security events
 *
 * @example
 * logSecurity('login_failed', 'high', { email, ip, reason })
 */
export function logSecurity(
  event: 'login_success' | 'login_failed' | 'signup' | 'password_reset' | 'unauthorized_access',
  severity: 'low' | 'medium' | 'high' | 'critical',
  meta?: Record<string, any>
) {
  const log = {
    type: 'security',
    event,
    severity,
    ...meta,
  }

  if (severity === 'critical' || severity === 'high') {
    logger.warn(log, `Security event: ${event} (${severity})`)
  } else {
    logger.info(log, `Security event: ${event} (${severity})`)
  }
}

// Export logger as default for convenience
export default logger
