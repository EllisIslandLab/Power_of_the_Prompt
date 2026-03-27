import { NextResponse } from 'next/server'
import type { Middleware, RouteHandler, MiddlewareContext } from './types'
import { verifyHCaptcha, getClientIp } from '@/lib/hcaptcha'
import { logger } from '@/lib/logger'

/**
 * hCaptcha Verification Middleware
 *
 * Verifies hCaptcha tokens to protect API routes from bots and spam.
 * Expects the captcha token to be sent in the request body.
 *
 * Features:
 * - Server-side captcha token verification
 * - IP address extraction for additional verification
 * - Detailed error logging
 * - Graceful error handling
 *
 * Usage:
 * ```typescript
 * // Protect a form submission endpoint
 * export const POST = withMiddleware(
 *   [
 *     withErrorHandling,
 *     withCaptcha(),
 *     withValidation(formSchema)
 *   ],
 *   async (req, { validated }) => {
 *     // Handler logic - captcha already verified
 *   }
 * )
 *
 * // Custom captcha field name
 * export const POST = withMiddleware(
 *   [withCaptcha({ tokenField: 'hcaptchaToken' })],
 *   async (req) => {
 *     // Handler logic
 *   }
 * )
 * ```
 *
 * Client-side:
 * The client must send the captcha token in the request body:
 * ```typescript
 * const response = await fetch('/api/endpoint', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({
 *     captchaToken: token, // from HCaptcha component
 *     // ... other fields
 *   })
 * })
 * ```
 */

export interface CaptchaOptions {
  /**
   * Field name containing the captcha token in request body
   * @default 'captchaToken'
   */
  tokenField?: string

  /**
   * Whether to include client IP in verification
   * @default true
   */
  includeIp?: boolean

  /**
   * Custom error message for failed verification
   */
  errorMessage?: string

  /**
   * Custom response when captcha verification fails
   */
  onVerificationFailed?: (error: string) => NextResponse
}

/**
 * hCaptcha verification middleware factory
 */
export function withCaptcha(options: CaptchaOptions = {}): Middleware {
  const {
    tokenField = 'captchaToken',
    includeIp = true,
    errorMessage = 'Captcha verification failed',
    onVerificationFailed,
  } = options

  return async (
    handler: RouteHandler,
    context: MiddlewareContext
  ): Promise<NextResponse> => {
    const { request } = context
    const { pathname } = new URL(request.url)

    try {
      // Parse request body
      let body: any
      try {
        const textBody = await request.text()
        body = textBody ? JSON.parse(textBody) : {}

        // Store parsed body in context so it can be re-used
        // Create a new request with the body for the handler
        context.request = new Request(request.url, {
          method: request.method,
          headers: request.headers,
          body: textBody,
        }) as any
      } catch (error) {
        logger.warn(
          {
            type: 'captcha',
            action: 'parse_body',
            route: pathname,
            error: error instanceof Error ? error.message : 'unknown',
          },
          'Failed to parse request body for captcha verification'
        )

        return NextResponse.json(
          {
            error: 'Invalid request',
            message: 'Request body must be valid JSON',
          },
          { status: 400 }
        )
      }

      // Extract captcha token
      const token = body[tokenField]

      if (!token || typeof token !== 'string') {
        logger.warn(
          {
            type: 'captcha',
            action: 'verify',
            route: pathname,
            error: 'missing_token',
            tokenField,
          },
          `Captcha token missing in field: ${tokenField}`
        )

        if (onVerificationFailed) {
          return onVerificationFailed('Missing captcha token')
        }

        return NextResponse.json(
          {
            error: 'Missing captcha',
            message: 'Please complete the captcha verification',
          },
          { status: 400 }
        )
      }

      // Get client IP if enabled
      const clientIp = includeIp ? getClientIp(request) : undefined

      // Verify captcha token
      const result = await verifyHCaptcha(token, clientIp)

      if (!result.success) {
        logger.warn(
          {
            type: 'captcha',
            action: 'verify',
            route: pathname,
            error: result.error,
            errorCodes: result.errorCodes,
            ip: clientIp,
          },
          'Captcha verification failed'
        )

        if (onVerificationFailed) {
          return onVerificationFailed(result.error || errorMessage)
        }

        return NextResponse.json(
          {
            error: 'Captcha verification failed',
            message: result.error || errorMessage,
          },
          { status: 400 }
        )
      }

      // Verification successful - add to context
      context.captcha = {
        verified: true,
        timestamp: result.timestamp,
        hostname: result.hostname,
        score: result.score,
      }

      logger.info(
        {
          type: 'captcha',
          action: 'verify',
          route: pathname,
          success: true,
          hostname: result.hostname,
          score: result.score,
        },
        'Captcha verification successful'
      )

      // Continue to handler
      return await handler(request, context)
    } catch (error) {
      logger.error(
        {
          type: 'captcha',
          action: 'verify',
          route: pathname,
          error: error instanceof Error ? error.message : 'unknown',
        },
        'Captcha middleware exception'
      )

      return NextResponse.json(
        {
          error: 'Captcha verification error',
          message: 'An error occurred during captcha verification',
        },
        { status: 500 }
      )
    }
  }
}
