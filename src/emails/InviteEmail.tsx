import {
  Text,
  Heading,
  Section,
  Button,
} from '@react-email/components'
import * as React from 'react'
import { EmailLayout } from './components/EmailLayout'

interface InviteEmailProps {
  recipientName?: string
  signupUrl: string
  inviterName?: string
  tier: 'basic' | 'full'
  expiresInDays?: number
}

/**
 * Invite email sent when an admin creates an invite link
 */
export function InviteEmail({
  recipientName,
  signupUrl,
  inviterName = 'Web Launch Academy',
  tier,
  expiresInDays = 7
}: InviteEmailProps) {
  const tierName = tier === 'full' ? 'Full Access' : 'Basic Access'

  return (
    <EmailLayout previewText={`You've been invited to join Web Launch Academy!`}>
      <Heading style={heading}>
        You're Invited to Web Launch Academy!
      </Heading>

      <Text style={paragraph}>
        {recipientName ? `Hi ${recipientName},` : 'Hello,'}
      </Text>

      <Text style={paragraph}>
        {inviterName} has invited you to join <strong>Web Launch Academy</strong> with <strong>{tierName}</strong>!
        We're excited to help you build professional websites with modern technology.
      </Text>

      {/* Tier Info Section */}
      <Section style={tierBox}>
        <Heading as="h2" style={tierHeading}>
          Your Access Level: {tierName}
        </Heading>
        <Text style={tierDescription}>
          {tier === 'full'
            ? 'Full access to all course materials, resources, and support.'
            : 'Access to course materials and community resources.'
          }
        </Text>
      </Section>

      {/* CTA Button */}
      <Section style={buttonSection}>
        <Button style={button} href={signupUrl}>
          Complete Your Registration
        </Button>
      </Section>

      <Text style={paragraph}>
        <strong>Important:</strong> This invitation link will expire in {expiresInDays} days.
        Click the button above to create your account and get started.
      </Text>

      <Text style={paragraph}>
        Once you've created your account, you'll be able to:
      </Text>

      <ul style={list}>
        <li style={listItem}>Access your student portal</li>
        <li style={listItem}>Browse course resources</li>
        <li style={listItem}>Submit revision requests</li>
        <li style={listItem}>Schedule video conferences</li>
      </ul>

      <Text style={paragraph}>
        We can't wait to see what you'll build!
        <br />
        <strong>The Web Launch Academy Team</strong>
      </Text>

      <Text style={footerNote}>
        If you didn't expect this invitation, you can safely ignore this email.
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

const tierBox = {
  backgroundColor: '#fffbeb',
  borderLeft: '4px solid #ffdb57',
  padding: '20px',
  margin: '24px 0',
  borderRadius: '4px',
}

const tierHeading = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#11296b',
  marginTop: '0',
  marginBottom: '12px',
}

const tierDescription = {
  fontSize: '15px',
  lineHeight: '22px',
  color: '#333333',
  margin: '0',
}

const list = {
  margin: '16px 0',
  paddingLeft: '20px',
}

const listItem = {
  fontSize: '16px',
  lineHeight: '28px',
  color: '#333333',
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

const footerNote = {
  fontSize: '14px',
  lineHeight: '20px',
  color: '#666666',
  marginTop: '32px',
  fontStyle: 'italic',
}
