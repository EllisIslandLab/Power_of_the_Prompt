import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Img,
  Text,
  Link,
  Hr,
} from '@react-email/components'
import * as React from 'react'

interface EmailLayoutProps {
  children: React.ReactNode
  previewText?: string
}

/**
 * Base email layout component with consistent branding
 * Used by all email templates for Web Launch Academy
 */
export function EmailLayout({ children, previewText }: EmailLayoutProps) {
  return (
    <Html>
      <Head />
      {previewText && (
        <Text style={{ display: 'none', maxHeight: 0, overflow: 'hidden' }}>
          {previewText}
        </Text>
      )}
      <Body style={main}>
        <Container style={container}>
          {/* Header with Logo */}
          <Section style={header}>
            <Text style={headerTitle}>Web Launch Academy</Text>
          </Section>

          {/* Main Content */}
          <Section style={content}>{children}</Section>

          {/* Footer */}
          <Hr style={hr} />
          <Section style={footer}>
            <Text style={footerText}>
              Web Launch Academy | Professional Website Development Coaching
            </Text>
            <Text style={footerText}>
              <Link href="https://weblaunchacademy.com" style={link}>
                weblaunchacademy.com
              </Link>
            </Text>
            <Text style={footerTextSmall}>
              You're receiving this email because you signed up for Web Launch
              Academy. If you have any questions, just reply to this email.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
}

const header = {
  backgroundColor: '#1e40af',
  padding: '30px 20px',
  textAlign: 'center' as const,
}

const headerTitle = {
  color: '#ffffff',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '0',
}

const content = {
  padding: '0 40px',
}

const hr = {
  borderColor: '#e6ebf1',
  margin: '20px 0',
}

const footer = {
  padding: '0 40px',
  textAlign: 'center' as const,
}

const footerText = {
  color: '#8898aa',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '4px 0',
}

const footerTextSmall = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '20px',
  margin: '16px 0 0',
}

const link = {
  color: '#1e40af',
  textDecoration: 'none',
}
