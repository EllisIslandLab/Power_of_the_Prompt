import {
  Text,
  Heading,
  Section,
  Button,
} from '@react-email/components'
import * as React from 'react'
import { EmailLayout } from './components/EmailLayout'

interface AIPremiumConfirmationEmailProps {
  customerName: string
  returnUrl?: string
  sessionId?: string
}

/**
 * AI Premium Builder Confirmation Email
 * Sent after successful purchase of AI Premium Builder ($5)
 */
export function AIPremiumConfirmationEmail({
  customerName,
  returnUrl = 'https://www.weblaunchacademy.com',
  sessionId = ''
}: AIPremiumConfirmationEmailProps) {
  const continueUrl = sessionId
    ? `${returnUrl}/get-started/build/${sessionId}`
    : returnUrl

  return (
    <EmailLayout previewText="Your AI Premium Builder is Ready!">
      <Heading style={heading}>
        Welcome to AI Premium, {customerName || 'there'}!
      </Heading>

      <Text style={paragraph}>
        Thank you for upgrading to the AI Premium Builder. You now have access
        to 30 AI-powered questions to help create your perfect website.
      </Text>

      {/* AI Credits Box */}
      <Section style={creditsBox}>
        <Heading as="h3" style={creditsHeading}>
          🤖 Your AI Credits
        </Heading>
        <Text style={creditsParagraph}>
          You have <strong>30 AI questions</strong> to:
        </Text>
        <ul style={list}>
          <li style={listItem}>Get personalized website recommendations</li>
          <li style={listItem}>Refine your design and content</li>
          <li style={listItem}>Ask for expert advice on any aspect</li>
          <li style={listItem}>Improve your site's effectiveness</li>
        </ul>
      </Section>

      {/* Continue Building Button */}
      {sessionId && (
        <Section style={buttonSection}>
          <Button style={continueButton} href={continueUrl}>
            Continue Building Your Site
          </Button>
        </Section>
      )}

      {/* Tips Box */}
      <Section style={tipsBox}>
        <Heading as="h3" style={tipsHeading}>
          💡 Tips for Using Your AI Credits
        </Heading>
        <ol style={list}>
          <li style={listItem}>Be specific with your questions</li>
          <li style={listItem}>Ask about design, content, or strategy</li>
          <li style={listItem}>Use AI to iterate and improve</li>
          <li style={listItem}>Each question consumes 1 credit</li>
        </ol>
      </Section>

      <Text style={paragraph}>
        Ready to create something amazing? Click the button above to continue
        building your demo website with AI assistance.
      </Text>

      <Text style={paragraph}>
        If you have any questions, simply reply to this email. I personally read
        and respond to every message.
      </Text>

      <Text style={signature}>
        Let's build something great!
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

const creditsBox = {
  backgroundColor: '#f0f9ff',
  padding: '24px',
  margin: '24px 0',
  borderRadius: '8px',
  border: '2px solid #3b82f6',
}

const creditsHeading = {
  fontSize: '20px',
  fontWeight: 'bold',
  color: '#1e40af',
  marginTop: '0',
  marginBottom: '12px',
}

const creditsParagraph = {
  fontSize: '16px',
  lineHeight: '24px',
  color: '#333333',
  marginBottom: '12px',
}

const tipsBox = {
  backgroundColor: '#fef3c7',
  padding: '20px',
  margin: '24px 0',
  borderRadius: '8px',
  border: '1px solid #fbbf24',
}

const tipsHeading = {
  fontSize: '20px',
  fontWeight: 'bold',
  color: '#92400e',
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

const continueButton = {
  backgroundColor: '#3b82f6',
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
