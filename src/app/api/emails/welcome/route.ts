import { NextRequest } from 'next/server'
import { sendWelcomeEmailSchema } from '@/lib/schemas'
import { renderWelcomeEmail, EmailSubjects, EMAIL_FROM } from '@/lib/email-builder'
import { logger } from '@/lib/logger'
import { resendAdapter } from '@/adapters'
import { withMiddleware, withValidation, withLogging, withErrorHandling } from '@/api-middleware'

/**
 * Send Welcome Email
 *
 * Sends a welcome email to a new user.
 * Uses middleware for validation, logging, and error handling.
 */
export const POST = withMiddleware(
  [withErrorHandling, withLogging, withValidation(sendWelcomeEmailSchema)],
  async (req: NextRequest, { validated }) => {
    const { email, fullName } = validated

    logger.info({ type: 'email', email, emailType: 'welcome' }, 'Sending welcome email')

    // Render email template
    const html = await renderWelcomeEmail({
      fullName,
      portalUrl: process.env.NEXT_PUBLIC_SITE_URL
    })

    // Send email
    const result = await resendAdapter.sendEmail({
      from: EMAIL_FROM,
      to: email,
      subject: EmailSubjects.WELCOME,
      html
    })

    logger.info({ type: 'email', email, emailId: result.id }, 'Welcome email sent successfully')

    return { success: true, data: result }
  }
)
