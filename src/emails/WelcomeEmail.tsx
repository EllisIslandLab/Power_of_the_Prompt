import {
  Text,
  Heading,
  Section,
  Button,
} from '@react-email/components'
import * as React from 'react'
import { EmailLayout } from './components/EmailLayout'

interface WelcomeEmailProps {
  fullName: string
  portalUrl?: string
}

/**
 * Welcome email sent to new users after signup
 */
export function WelcomeEmail({
  fullName,
  portalUrl = 'http://localhost:3000/portal'
}: WelcomeEmailProps) {
  return (
    <EmailLayout previewText={`Welcome to Web Launch Academy, ${fullName}!`}>
      <Heading style={heading}>
        Welcome to Web Launch Academy, {fullName}!
      </Heading>

      <Text style={paragraph}>
        Welcome to Web Launch Academy! We're excited to have you join our
        community of aspiring web developers. You're about to embark on an
        amazing journey to build professional websites with modern technology.
      </Text>

      <Text style={paragraph}>
        You can now sign in to access your student portal and start exploring
        resources and lessons.
      </Text>

      {/* Next Steps Section */}
      <Section style={nextStepsBox}>
        <Heading as="h2" style={nextStepsHeading}>
          What's Next?
        </Heading>
        <ul style={list}>
          <li style={listItem}>Sign in to your student portal</li>
          <li style={listItem}>Complete your profile</li>
          <li style={listItem}>Start exploring resources and lessons</li>
        </ul>
      </Section>

      {/* CTA Button */}
      <Section style={buttonSection}>
        <Button style={button} href={portalUrl}>
          Visit Your Portal
        </Button>
      </Section>

      <Text style={paragraph}>
        Let's build something amazing together!
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

const nextStepsBox = {
  backgroundColor: '#f0f9ff',
  borderLeft: '4px solid #1e40af',
  padding: '20px',
  margin: '24px 0',
  borderRadius: '4px',
}

const nextStepsHeading = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#1e40af',
  marginTop: '0',
  marginBottom: '16px',
}

const list = {
  margin: '0',
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
