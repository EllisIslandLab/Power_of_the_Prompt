/**
 * Error Alert System
 *
 * Sends immediate email alerts for critical errors in production.
 * This ensures you're notified of issues that could lose revenue.
 */

import { resendAdapter } from '@/adapters'
import { logger } from '@/lib/logger'

interface ErrorAlertOptions {
  error: Error
  context: {
    location: string // e.g., "waitlist signup", "stripe checkout"
    userId?: string
    severity: 'critical' | 'high' | 'medium' | 'low'
    additionalInfo?: Record<string, any>
  }
}

/**
 * Send an immediate email alert for critical errors
 *
 * Use this for errors that could lose revenue or break critical user flows:
 * - Payment processing failures
 * - Signup/authentication failures
 * - Email delivery failures
 * - Database connection issues
 */
export async function sendErrorAlert({ error, context }: ErrorAlertOptions) {
  // Only send alerts in production to avoid noise
  if (process.env.NODE_ENV !== 'production') {
    logger.warn({ error, context }, 'Error alert suppressed (not production)')
    return
  }

  // Only send alerts for high severity or critical errors
  if (context.severity !== 'critical' && context.severity !== 'high') {
    logger.info({ error, context }, 'Error alert suppressed (low severity)')
    return
  }

  const severityEmoji = {
    critical: '🚨',
    high: '⚠️',
    medium: '⚡',
    low: 'ℹ️'
  }

  const timestamp = new Date().toISOString()
  const emoji = severityEmoji[context.severity]

  try {
    await resendAdapter.sendEmail({
      from: 'Alerts <alerts@weblaunchacademy.com>',
      to: 'hello@weblaunchacademy.com',
      subject: `${emoji} ${context.severity.toUpperCase()}: ${context.location}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
            .header { background: ${context.severity === 'critical' ? '#dc2626' : '#f59e0b'}; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
            .section { background: #f9fafb; padding: 15px; border-radius: 8px; margin-bottom: 15px; border-left: 4px solid ${context.severity === 'critical' ? '#dc2626' : '#f59e0b'}; }
            .code { background: #1f2937; color: #f9fafb; padding: 15px; border-radius: 4px; overflow-x: auto; font-family: monospace; font-size: 12px; }
            .label { font-weight: bold; color: #374151; }
            .value { color: #6b7280; margin-bottom: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 style="margin: 0; font-size: 24px;">${emoji} ${context.severity.toUpperCase()} Error Detected</h1>
            <p style="margin: 10px 0 0 0; font-size: 14px; opacity: 0.9;">Immediate attention required</p>
          </div>

          <div class="section">
            <div class="label">Location:</div>
            <div class="value">${context.location}</div>

            <div class="label">Timestamp:</div>
            <div class="value">${timestamp}</div>

            ${context.userId ? `
              <div class="label">User ID:</div>
              <div class="value">${context.userId}</div>
            ` : ''}
          </div>

          <div class="section">
            <div class="label">Error Message:</div>
            <div class="value">${error.message || 'No message provided'}</div>
          </div>

          ${error.stack ? `
            <div class="section">
              <div class="label">Stack Trace:</div>
              <div class="code">${error.stack.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
            </div>
          ` : ''}

          ${context.additionalInfo ? `
            <div class="section">
              <div class="label">Additional Information:</div>
              <div class="code">${JSON.stringify(context.additionalInfo, null, 2).replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
            </div>
          ` : ''}

          <div class="section" style="border-left-color: #3b82f6;">
            <div class="label">Next Steps:</div>
            <ul style="color: #6b7280; margin: 10px 0 0 0; padding-left: 20px;">
              <li>Check Vercel logs for more details</li>
              <li>Review affected user flows</li>
              <li>Test the failing functionality</li>
              <li>Deploy a hotfix if critical</li>
            </ul>
          </div>

          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">

          <p style="color: #9ca3af; font-size: 12px; text-align: center;">
            This is an automated alert from Web Launch Academy Error Monitoring<br>
            Environment: ${process.env.NODE_ENV}<br>
            Vercel Deployment: ${process.env.VERCEL_URL || 'local'}
          </p>
        </body>
        </html>
      `
    })

    logger.info({ location: context.location, severity: context.severity }, 'Error alert email sent')
  } catch (emailError) {
    // Don't let email failure break the app - just log it
    logger.error({ error: emailError, originalError: error }, 'Failed to send error alert email')
  }
}

/**
 * Convenience function for critical errors
 */
export function alertCriticalError(error: Error, location: string, additionalInfo?: Record<string, any>) {
  return sendErrorAlert({
    error,
    context: {
      location,
      severity: 'critical',
      additionalInfo
    }
  })
}

/**
 * Convenience function for high priority errors
 */
export function alertHighPriorityError(error: Error, location: string, additionalInfo?: Record<string, any>) {
  return sendErrorAlert({
    error,
    context: {
      location,
      severity: 'high',
      additionalInfo
    }
  })
}
