import { NextRequest, NextResponse } from 'next/server'
import { validateRequest } from '@/lib/validation'
import { sendWelcomeEmailSchema } from '@/lib/schemas'
import { renderWelcomeEmail, EmailSubjects, EMAIL_FROM } from '@/lib/email-builder'
import { logger } from '@/lib/logger'
import { resendAdapter } from '@/adapters'

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

    const result = await resendAdapter.sendEmail({
      from: EMAIL_FROM,
      to: email,
      subject: EmailSubjects.WELCOME,
      html
    })

    const totalDuration = Date.now() - startTime
    logger.info(
      { type: 'email', email, emailId: result.id, totalDuration },
      `Welcome email sent successfully (${totalDuration}ms)`
    )

    return NextResponse.json({ success: true, data: result })

  } catch (error) {
    const duration = Date.now() - startTime
    logger.error({ type: 'email', error, duration }, 'Welcome email error')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
