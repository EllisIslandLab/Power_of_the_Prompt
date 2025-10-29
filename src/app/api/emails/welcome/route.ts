import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { validateRequest } from '@/lib/validation'
import { sendWelcomeEmailSchema } from '@/lib/schemas'
import { renderWelcomeEmail, EmailSubjects, EMAIL_FROM } from '@/lib/email-builder'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    // Validate request with Zod schema
    const validation = await validateRequest(request, sendWelcomeEmailSchema)
    if (!validation.success) {
      return validation.error
    }

    const { email, fullName } = validation.data

    // Render email template
    const html = await renderWelcomeEmail({
      fullName,
      portalUrl: process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_URL
    })

    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: [email],
      subject: EmailSubjects.WELCOME,
      html
    })

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json(
        { error: 'Failed to send welcome email' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data })

  } catch (error) {
    console.error('Welcome email error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
