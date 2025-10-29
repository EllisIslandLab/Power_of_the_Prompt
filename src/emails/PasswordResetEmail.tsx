import {
  Text,
  Heading,
  Section,
  Button,
} from '@react-email/components'
import * as React from 'react'
import { EmailLayout } from './components/EmailLayout'

interface PasswordResetEmailProps {
  resetUrl: string
  email: string
}

/**
 * Password reset email with secure reset link
 * Expires after a set time for security
 */
export function PasswordResetEmail({
  resetUrl,
  email
}: PasswordResetEmailProps) {
  return (
    <EmailLayout previewText="Reset your Web Launch Academy password">
      <Heading style={heading}>
        Reset Your Password
      </Heading>

      <Text style={paragraph}>
        Hi there,
      </Text>

      <Text style={paragraph}>
        We received a request to reset the password for your Web Launch Academy
        account ({email}). Click the button below to choose a new password:
      </Text>

      {/* CTA Button */}
      <Section style={buttonSection}>
        <Button style={button} href={resetUrl}>
          Reset Your Password
        </Button>
      </Section>

      {/* Security Notice */}
      <Section style={securityBox}>
        <Text style={securityText}>
          <strong>Security Note:</strong> This link will expire in 1 hour for
          your security. If you didn't request this password reset, you can
          safely ignore this email.
        </Text>
      </Section>

      <Text style={paragraph}>
        If the button doesn't work, copy and paste this link into your browser:
      </Text>

      <Text style={linkText}>
        {resetUrl}
      </Text>

      <Text style={paragraph}>
        If you didn't request a password reset, please ignore this email or
        contact us if you have concerns about your account security.
      </Text>

      <Text style={paragraph}>
        Thanks,
        <br />
        <strong>The Web Launch Academy Team</strong>
      </Text>
    </EmailLayout>
  )
}

// Styles
const heading = {
  fontSize: '28px',
  fontWeight: 'bold',
  color: '#1e40af',
  marginTop: '32px',
  marginBottom: '16px',
}

const paragraph = {
  fontSize: '16px',
  lineHeight: '24px',
  color: '#333333',
  marginBottom: '16px',
}

const buttonSection = {
  textAlign: 'center' as const,
  margin: '32px 0',
}

const button = {
  backgroundColor: '#1e40af',
  color: '#ffffff',
  padding: '15px 30px',
  textDecoration: 'none',
  borderRadius: '6px',
  fontWeight: '600',
  fontSize: '16px',
  display: 'inline-block',
}

const securityBox = {
  backgroundColor: '#fef3c7',
  border: '1px solid #fcd34d',
  padding: '16px',
  margin: '24px 0',
  borderRadius: '6px',
}

const securityText = {
  fontSize: '14px',
  lineHeight: '20px',
  color: '#92400e',
  margin: '0',
}

const linkText = {
  fontSize: '14px',
  lineHeight: '20px',
  color: '#6b7280',
  wordBreak: 'break-all' as const,
  margin: '8px 0 16px',
  padding: '12px',
  backgroundColor: '#f3f4f6',
  borderRadius: '4px',
}
