import { getHCaptchaConfig } from './env-config'
import { logger } from './logger'

/**
 * hCaptcha verification utility
 *
 * Verifies hCaptcha tokens server-side to protect against bots.
 *
 * Usage:
 * ```typescript
 * const result = await verifyHCaptcha(token, userIp)
 * if (!result.success) {
 *   return Response.json({ error: result.error }, { status: 400 })
 * }
 * ```
 */

interface HCaptchaVerifyResponse {
  success: boolean
  challenge_ts?: string
  hostname?: string
  credit?: boolean
  'error-codes'?: string[]
  score?: number
  score_reason?: string[]
}

export interface HCaptchaVerificationResult {
  success: boolean
  error?: string
  errorCodes?: string[]
  timestamp?: string
  hostname?: string
  score?: number
}

/**
 * Verify an hCaptcha token
 *
 * @param token - The hCaptcha response token from the client
 * @param remoteip - Optional IP address of the user
 * @returns Verification result with success status and optional error details
 */
export async function verifyHCaptcha(
  token: string,
  remoteip?: string
): Promise<HCaptchaVerificationResult> {
  const startTime = Date.now()

  try {
    // Validate token presence
    if (!token || token.trim() === '') {
      logger.warn({ type: 'hcaptcha', action: 'verify', error: 'missing_token' }, 'hCaptcha verification failed: missing token')
      return {
        success: false,
        error: 'Missing captcha token'
      }
    }

    // Get secret key from config
    const config = getHCaptchaConfig()
    const secretKey = config.secretKey

    if (!secretKey) {
      logger.error({ type: 'hcaptcha', action: 'verify', error: 'missing_secret' }, 'hCaptcha secret key not configured')
      return {
        success: false,
        error: 'Captcha verification not configured'
      }
    }

    // Build request body
    const params = new URLSearchParams({
      secret: secretKey,
      response: token,
    })

    // Add remote IP if provided
    if (remoteip) {
      params.append('remoteip', remoteip)
    }

    // Call hCaptcha verification API
    const response = await fetch('https://api.hcaptcha.com/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    })

    if (!response.ok) {
      const duration = Date.now() - startTime
      logger.error(
        {
          type: 'hcaptcha',
          action: 'verify',
          status: response.status,
          duration,
        },
        `hCaptcha API error: ${response.status}`
      )
      return {
        success: false,
        error: 'Captcha verification failed'
      }
    }

    const data: HCaptchaVerifyResponse = await response.json()
    const duration = Date.now() - startTime

    if (data.success) {
      logger.info(
        {
          type: 'hcaptcha',
          action: 'verify',
          success: true,
          duration,
          hostname: data.hostname,
          score: data.score,
        },
        `hCaptcha verification successful (${duration}ms)`
      )
      return {
        success: true,
        timestamp: data.challenge_ts,
        hostname: data.hostname,
        score: data.score,
      }
    } else {
      logger.warn(
        {
          type: 'hcaptcha',
          action: 'verify',
          success: false,
          duration,
          errorCodes: data['error-codes'],
        },
        `hCaptcha verification failed: ${data['error-codes']?.join(', ')}`
      )
      return {
        success: false,
        error: getErrorMessage(data['error-codes']),
        errorCodes: data['error-codes'],
      }
    }
  } catch (error) {
    const duration = Date.now() - startTime
    logger.error(
      {
        type: 'hcaptcha',
        action: 'verify',
        error: error instanceof Error ? error.message : 'unknown',
        duration,
      },
      'hCaptcha verification exception'
    )
    return {
      success: false,
      error: 'Captcha verification error'
    }
  }
}

/**
 * Convert hCaptcha error codes to user-friendly messages
 */
function getErrorMessage(errorCodes?: string[]): string {
  if (!errorCodes || errorCodes.length === 0) {
    return 'Captcha verification failed'
  }

  const code = errorCodes[0]

  switch (code) {
    case 'missing-input-secret':
    case 'invalid-input-secret':
      return 'Captcha configuration error'
    case 'missing-input-response':
      return 'Missing captcha response'
    case 'invalid-input-response':
      return 'Invalid captcha response'
    case 'bad-request':
      return 'Invalid captcha request'
    case 'invalid-or-already-seen-response':
      return 'Captcha has already been used'
    case 'sitekey-secret-mismatch':
      return 'Captcha configuration mismatch'
    default:
      return 'Captcha verification failed'
  }
}

/**
 * Extract IP address from Next.js request headers
 * Handles various proxy headers (Vercel, Cloudflare, etc.)
 */
export function getClientIp(request: Request): string | undefined {
  const headers = request.headers

  // Try various common headers in order of preference
  const ip =
    headers.get('x-real-ip') ||
    headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    headers.get('cf-connecting-ip') || // Cloudflare
    headers.get('x-vercel-forwarded-for') || // Vercel
    undefined

  return ip
}
