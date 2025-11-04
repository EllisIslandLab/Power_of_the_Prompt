import { render } from '@react-email/components'
import * as React from 'react'
import { WelcomeEmail } from '@/emails/WelcomeEmail'
import { PaymentConfirmationEmail } from '@/emails/PaymentConfirmationEmail'
import { PasswordResetEmail } from '@/emails/PasswordResetEmail'

/**
 * Email Builder Utility
 *
 * Renders React Email components to HTML strings for sending via Resend.
 * Provides type-safe interfaces for all email templates.
 *
 * Usage:
 * ```typescript
 * import { renderWelcomeEmail } from '@/lib/email-builder'
 *
 * const html = await renderWelcomeEmail({
 *   fullName: 'John Doe',
 *   portalUrl: 'https://weblaunchacademy.com/portal'
 * })
 *
 * await resend.emails.send({
 *   from: 'Web Launch Academy <noreply@weblaunchacademy.com>',
 *   to: email,
 *   subject: 'Welcome to Web Launch Academy!',
 *   html
 * })
 * ```
 */

// ============================================================================
// WELCOME EMAIL
// ============================================================================

export interface WelcomeEmailProps {
  fullName: string
  portalUrl?: string
}

/**
 * Render welcome email for new user signups
 */
export async function renderWelcomeEmail(props: WelcomeEmailProps): Promise<string> {
  const { fullName, portalUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000' } = props

  return render(
    React.createElement(WelcomeEmail, {
      fullName,
      portalUrl: `${portalUrl}/portal`
    })
  )
}

// ============================================================================
// PAYMENT CONFIRMATION EMAIL
// ============================================================================

export interface PaymentConfirmationEmailProps {
  customerName: string
  tier: 'basic' | 'premium' | 'vip'
  sessions?: number
  portalUrl?: string
  email?: string
}

/**
 * Render payment confirmation email after successful purchase
 */
export async function renderPaymentConfirmationEmail(
  props: PaymentConfirmationEmailProps
): Promise<string> {
  const { customerName, tier, sessions = 0, portalUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000', email = '' } = props

  return render(
    React.createElement(PaymentConfirmationEmail, {
      customerName,
      tier,
      sessions,
      portalUrl,
      email
    })
  )
}

// ============================================================================
// PASSWORD RESET EMAIL
// ============================================================================

export interface PasswordResetEmailProps {
  resetUrl: string
  email: string
}

/**
 * Render password reset email with secure reset link
 */
export async function renderPasswordResetEmail(
  props: PasswordResetEmailProps
): Promise<string> {
  const { resetUrl, email } = props

  return render(
    React.createElement(PasswordResetEmail, {
      resetUrl,
      email
    })
  )
}

// ============================================================================
// EMAIL SUBJECTS
// ============================================================================

/**
 * Get standard email subject lines
 * Maintains consistent branding across all emails
 */
export const EmailSubjects = {
  WELCOME: 'Welcome to Web Launch Academy!',
  PAYMENT_CONFIRMATION: (tier: string) =>
    `Welcome to ${tier === 'vip' ? 'A+ Program' : 'Web Launch Course'}!`,
  PASSWORD_RESET: 'Reset your Web Launch Academy password',
  EMAIL_VERIFICATION: 'Verify your Web Launch Academy email',
  SESSION_REMINDER: 'Your Level Up session is coming up',
} as const

// ============================================================================
// EMAIL SENDER
// ============================================================================

/**
 * Standard "from" address for all emails
 */
export const EMAIL_FROM = 'Web Launch Academy <noreply@weblaunchacademy.com>' as const

/**
 * Support email for replies
 */
export const EMAIL_SUPPORT = 'support@weblaunchacademy.com' as const
