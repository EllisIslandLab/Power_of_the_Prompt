import {
  Text,
  Heading,
  Section,
  Button,
} from '@react-email/components'
import * as React from 'react'
import { EmailLayout } from './components/EmailLayout'

interface TextbookConfirmationEmailProps {
  customerName: string
  portalUrl?: string
  email?: string
}

/**
 * Launch Guide (Textbook) Confirmation Email
 * Sent after successful purchase of Launch Guide ($19)
 */
export function TextbookConfirmationEmail({
  customerName,
  portalUrl = 'https://www.weblaunchacademy.com',
  email = ''
}: TextbookConfirmationEmailProps) {
  const guideUrl = `${portalUrl}/portal/guide`

  return (
    <EmailLayout previewText="Your Launch Guide is Ready!">
      <Heading style={heading}>
        Your Launch Guide is Ready, {customerName || 'there'}!
      </Heading>

      <Text style={paragraph}>
        Thank you for purchasing the Web Launch Academy Guide. You now have
        lifetime access to our comprehensive website launch framework.
      </Text>

      {/* Access Box */}
      <Section style={accessBox}>
        <Heading as="h3" style={accessHeading}>
          📚 What You Get
        </Heading>
        <ul style={list}>
          <li style={listItem}>
            <strong>Complete Launch Framework:</strong> Step-by-step guide to
            launching your website
          </li>
          <li style={listItem}>
            <strong>Templates & Checklists:</strong> Ready-to-use resources for
            every stage
          </li>
          <li style={listItem}>
            <strong>Best Practices:</strong> Industry-proven strategies and
            techniques
          </li>
          <li style={listItem}>
            <strong>Lifetime Access:</strong> Keep the guide forever, including
            all updates
          </li>
        </ul>
      </Section>

      {/* Access Button */}
      <Section style={buttonSection}>
        <Button style={accessButton} href={guideUrl}>
          Access Your Launch Guide
        </Button>
      </Section>

      {/* Next Steps */}
      <Section style={nextStepsBox}>
        <Heading as="h3" style={nextStepsHeading}>
          🚀 Get Started:
        </Heading>
        <ol style={list}>
          <li style={listItem}>Click the button above to access your guide</li>
          <li style={listItem}>Start with Chapter 1: Planning Your Launch</li>
          <li style={listItem}>Download the included templates</li>
          <li style={listItem}>Follow the step-by-step framework</li>
        </ol>
      </Section>

      <Text style={paragraph}>
        The Launch Guide is designed to be your complete resource from planning
        to launch day and beyond. Take your time with each chapter and use the
        templates to implement what you learn.
      </Text>

      <Text style={paragraph}>
        If you have any questions about the guide or need help with anything,
        simply reply to this email. I'm here to help!
      </Text>

      <Text style={signature}>
        Here's to your successful launch!
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

const accessBox = {
  backgroundColor: '#f0fdf4',
  padding: '24px',
  margin: '24px 0',
  borderRadius: '8px',
  border: '2px solid #22c55e',
}

const accessHeading = {
  fontSize: '20px',
  fontWeight: 'bold',
  color: '#15803d',
  marginTop: '0',
  marginBottom: '12px',
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

const accessButton = {
  backgroundColor: '#22c55e',
  color: '#ffffff',
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
