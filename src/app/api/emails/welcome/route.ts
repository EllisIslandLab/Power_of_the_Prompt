import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { validateRequest } from '@/lib/validation'
import { sendWelcomeEmailSchema } from '@/lib/schemas'
import { renderWelcomeEmail, EmailSubjects, EMAIL_FROM } from '@/lib/email-builder'
import { logger, logService } from '@/lib/logger'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    // Validate request with Zod schema
    const validation = await validateRequest(request, sendWelcomeEmailSchema)
    if (!validation.success) {
      return validation.error
    }

    const { email, fullName } = validation.data

    logger.info({ type: 'email', email, emailType: 'welcome' }, 'Sending welcome email')

    // Render email template
    const html = await renderWelcomeEmail({
      fullName,
      portalUrl: process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_URL
    })

    const sendStartTime = Date.now()
    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: [email],
      subject: EmailSubjects.WELCOME,
      html
    })

    if (error) {
      const duration = Date.now() - sendStartTime
      logService('resend', 'sendWelcomeEmail', false, duration, { email })
      logger.error({ type: 'email', email, error, duration }, 'Failed to send welcome email')
      return NextResponse.json(
        { error: 'Failed to send welcome email' },
        { status: 500 }
      )
    }

    const duration = Date.now() - sendStartTime
    logService('resend', 'sendWelcomeEmail', true, duration, { email, emailId: data?.id })

    const totalDuration = Date.now() - startTime
    logger.info(
      { type: 'email', email, emailId: data?.id, totalDuration },
      `Welcome email sent successfully (${totalDuration}ms)`
    )

    return NextResponse.json({ success: true, data })

  } catch (error) {
    const duration = Date.now() - startTime
    logger.error({ type: 'email', error, duration }, 'Welcome email error')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
