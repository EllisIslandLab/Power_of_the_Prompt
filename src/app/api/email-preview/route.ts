import { NextRequest, NextResponse } from 'next/server'
import {
  renderWelcomeEmail,
  renderPaymentConfirmationEmail,
  renderPasswordResetEmail,
} from '@/lib/email-builder'

/**
 * Email Preview API
 *
 * Returns rendered email HTML for development preview
 *
 * IMPORTANT: This should be removed in production or protected with authentication!
 * Only use during development.
 */
export async function POST(request: NextRequest) {
  // TODO: Add authentication check in production
  // if (process.env.NODE_ENV === 'production') {
  //   return NextResponse.json({ error: 'Not available in production' }, { status: 404 })
  // }

  try {
    const { template } = await request.json()

    let html: string

    switch (template) {
      case 'welcome':
        html = await renderWelcomeEmail({
          fullName: 'John Doe',
          portalUrl: 'http://localhost:3000',
        })
        break

      case 'payment':
        html = await renderPaymentConfirmationEmail({
          customerName: 'Jane Smith',
          tier: 'vip',
          sessions: 12,
          portalUrl: 'http://localhost:3000',
        })
        break

      case 'password-reset':
        html = await renderPasswordResetEmail({
          resetUrl: 'http://localhost:3000/reset-password?token=example-token-123',
          email: 'user@example.com',
        })
        break

      default:
        return NextResponse.json(
          { error: 'Unknown template' },
          { status: 400 }
        )
    }

    return NextResponse.json({ html })
  } catch (error) {
    console.error('Email preview error:', error)
    return NextResponse.json(
      { error: 'Failed to render email template' },
      { status: 500 }
    )
  }
}
