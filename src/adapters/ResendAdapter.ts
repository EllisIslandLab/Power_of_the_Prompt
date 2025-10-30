import { Resend } from 'resend'
import { BaseAdapter } from './BaseAdapter'
import { logger } from '@/lib/logger'

/**
 * Resend Adapter
 *
 * Centralized adapter for Resend email delivery operations.
 * Provides consistent error handling, retry logic, and logging for all email operations.
 *
 * Features:
 * - Singleton pattern for consistent client instance
 * - Automatic retry logic for transient failures
 * - Structured logging for all email operations
 * - Type-safe email sending
 * - Easy to mock for testing
 *
 * Usage:
 * ```typescript
 * const resend = ResendAdapter.getInstance()
 * await resend.sendEmail({
 *   from: 'noreply@example.com',
 *   to: 'user@example.com',
 *   subject: 'Welcome!',
 *   html: '<p>Welcome</p>'
 * })
 * ```
 */

export interface SendEmailParams {
  from: string
  to: string | string[]
  subject: string
  html: string
  replyTo?: string
  tags?: Array<{ name: string; value: string }>
}

export interface SendEmailResult {
  id: string
}

export class ResendAdapter extends BaseAdapter {
  private static instance: ResendAdapter
  private client: Resend

  private constructor() {
    super('resend')

    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not configured')
    }

    this.client = new Resend(process.env.RESEND_API_KEY)

    logger.info({ type: 'service', service: 'resend' }, 'Resend adapter initialized')
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): ResendAdapter {
    if (!ResendAdapter.instance) {
      ResendAdapter.instance = new ResendAdapter()
    }
    return ResendAdapter.instance
  }

  /**
   * Get the raw Resend client (for operations not yet wrapped)
   */
  public getClient(): Resend {
    return this.client
  }

  /**
   * Send an email
   */
  async sendEmail(params: SendEmailParams): Promise<SendEmailResult> {
    const startTime = Date.now()
    const recipients = Array.isArray(params.to) ? params.to : [params.to]

    try {
      const result = await this.executeWithRetry(
        async () => {
          const response = await this.client.emails.send({
            from: params.from,
            to: params.to,
            subject: params.subject,
            html: params.html,
            replyTo: params.replyTo,
            tags: params.tags,
          })

          if (response.error) {
            throw new Error(`Resend error: ${response.error.message}`)
          }

          return response.data!
        },
        'sendEmail',
        {
          maxRetries: 2, // Emails are more sensitive, fewer retries
          retryDelay: 2000, // 2 seconds
        }
      )

      const duration = Date.now() - startTime
      this.logSuccess('sendEmail', duration, {
        emailId: result.id,
        recipients: recipients.length,
        subject: params.subject,
      })

      return result
    } catch (error) {
      const duration = Date.now() - startTime
      this.logError('sendEmail', error, duration, {
        recipients: recipients.length,
        subject: params.subject,
      })
      throw error
    }
  }

  /**
   * Send a batch of emails
   */
  async sendBatch(emails: SendEmailParams[]) {
    const startTime = Date.now()

    try {
      const results = await this.executeWithRetry(
        async () => {
          const response = await this.client.batch.send(
            emails.map((email) => ({
              from: email.from,
              to: email.to,
              subject: email.subject,
              html: email.html,
              replyTo: email.replyTo,
              tags: email.tags,
            }))
          )

          if (response.error) {
            throw new Error(`Resend batch error: ${response.error.message}`)
          }

          return response.data!
        },
        'sendBatch',
        {
          maxRetries: 2,
          retryDelay: 2000,
        }
      )

      const duration = Date.now() - startTime
      this.logSuccess('sendBatch', duration, {
        emailCount: emails.length,
      })

      return results
    } catch (error) {
      const duration = Date.now() - startTime
      this.logError('sendBatch', error, duration, {
        emailCount: emails.length,
      })
      throw error
    }
  }
}

// Export singleton instance for convenience
export const resendAdapter = ResendAdapter.getInstance()
