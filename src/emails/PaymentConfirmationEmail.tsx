import {
  Text,
  Heading,
  Section,
  Button,
} from '@react-email/components'
import * as React from 'react'
import { EmailLayout } from './components/EmailLayout'

interface PaymentConfirmationEmailProps {
  customerName: string
  tier: 'basic' | 'premium' | 'vip'
  sessions?: number
  portalUrl?: string
  email?: string
}

/**
 * Payment confirmation email sent after successful purchase
 * Used by Stripe webhook when checkout.session.completed
 */
export function PaymentConfirmationEmail({
  customerName,
  tier,
  sessions = 0,
  portalUrl = 'https://www.weblaunchacademy.com',
  email = ''
}: PaymentConfirmationEmailProps) {
  const programName = tier === 'vip' ? 'A+ Program' : 'Web Launch Course'
  const siteUrl = portalUrl.includes('localhost') ? 'https://www.weblaunchacademy.com' : portalUrl.replace('/portal', '')

  return (
    <EmailLayout previewText={`Welcome to ${programName}!`}>
      <Heading style={heading}>
        Welcome to Web Launch Academy, {customerName || 'there'}!
      </Heading>

      <Text style={paragraph}>
        Thank you for enrolling in the {programName}. You're about to embark on
        an exciting journey to build your professional website.
      </Text>

      {/* Session Credits */}
      {sessions > 0 && (
        <Section style={sessionsBox}>
          <Heading as="h3" style={sessionsHeading}>
            Your 1-on-1 Sessions
          </Heading>
          <Text style={sessionsParagraph}>
            You have <strong>{sessions} Level Up sessions</strong> included in
            your program. These are personalized coaching sessions where we work
            together on your website.
          </Text>
        </Section>
      )}

      {/* Account Setup */}
      <Section style={accountSetupBox}>
        <Heading as="h3" style={accountSetupHeading}>
          🔐 Create Your Account
        </Heading>
        <Text style={accountSetupText}>
          Your enrollment is complete! Now it's time to create your account and set up your password to access the student portal.
        </Text>
        <Section style={buttonSection}>
          <Button style={passwordButton} href={`${siteUrl}/signin`}>
            Create an Account
          </Button>
        </Section>
        <Text style={smallText}>
          Click "Create an Account" on the sign-in page, then use your email ({email}) to set up your password.
        </Text>
      </Section>

      {/* Next Steps */}
      <Section style={nextStepsBox}>
        <Heading as="h3" style={nextStepsHeading}>
          What's Next:
        </Heading>
        <ol style={list}>
          <li style={listItem}>Click "Create an Account" above to set your password</li>
          <li style={listItem}>Sign in to the student portal</li>
          <li style={listItem}>Complete your profile and generate an anonymous username if desired</li>
          <li style={listItem}>Start accessing your course materials</li>
          {sessions > 0 && (
            <li style={listItem}>Schedule your first 1-on-1 session</li>
          )}
        </ol>
      </Section>

      <Text style={paragraph}>
        If you have any questions, simply reply to this email. I personally read
        and respond to every message.
      </Text>

      <Text style={signature}>
        Excited to work with you!
        <br />
        Matthew Ellis
        <br />
        Web Launch Academy
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

const sessionsBox = {
  backgroundColor: '#f0f9ff',
  padding: '20px',
  margin: '24px 0',
  borderRadius: '8px',
  border: '1px solid #bfdbfe',
}

const sessionsHeading = {
  fontSize: '20px',
  fontWeight: 'bold',
  color: '#1e40af',
  marginTop: '0',
  marginBottom: '12px',
}

const sessionsParagraph = {
  fontSize: '16px',
  lineHeight: '24px',
  color: '#333333',
  margin: '0',
}

const accountSetupBox = {
  backgroundColor: '#fef3c7',
  padding: '24px',
  margin: '24px 0',
  borderRadius: '8px',
  border: '2px solid #fbbf24',
}

const accountSetupHeading = {
  fontSize: '20px',
  fontWeight: 'bold',
  color: '#92400e',
  marginTop: '0',
  marginBottom: '12px',
}

const accountSetupText = {
  fontSize: '16px',
  lineHeight: '24px',
  color: '#78350f',
  marginBottom: '16px',
}

const passwordButton = {
  backgroundColor: '#11296b',
  color: '#ffffff',
  padding: '15px 30px',
  textDecoration: 'none',
  borderRadius: '6px',
  fontWeight: '600',
  fontSize: '16px',
  display: 'inline-block',
}

const smallText = {
  fontSize: '14px',
  lineHeight: '20px',
  color: '#78350f',
  marginTop: '12px',
  marginBottom: '0',
}

const nextStepsBox = {
  backgroundColor: '#f8f9fa',
  padding: '20px',
  margin: '24px 0',
  borderRadius: '8px',
}

const nextStepsHeading = {
  fontSize: '20px',
  fontWeight: 'bold',
  color: '#333333',
  marginTop: '0',
  marginBottom: '12px',
}

const list = {
  margin: '0',
  paddingLeft: '24px',
}

const listItem = {
  fontSize: '16px',
  lineHeight: '28px',
  color: '#333333',
  marginBottom: '8px',
}

const buttonSection = {
  textAlign: 'center' as const,
  margin: '32px 0',
}

const button = {
  backgroundColor: '#ffdb57',
  color: '#11296b',
  padding: '15px 30px',
  textDecoration: 'none',
  borderRadius: '6px',
  fontWeight: '600',
  fontSize: '16px',
  display: 'inline-block',
}

const signature = {
  fontSize: '16px',
  lineHeight: '24px',
  color: '#333333',
  marginTop: '32px',
}
