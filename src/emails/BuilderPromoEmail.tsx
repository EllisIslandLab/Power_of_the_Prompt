import {
  Text,
  Heading,
  Section,
  Button,
} from '@react-email/components'
import * as React from 'react'
import { EmailLayout } from './components/EmailLayout'

interface BuilderPromoEmailProps {
  customerName: string
  promoCode?: string
  builderUrl?: string
}

/**
 * Builder Promo Email
 * Sent to users who sign up via the get-started popup
 * Includes promo code and request to help build better templates
 */
export function BuilderPromoEmail({
  customerName,
  promoCode = 'BUILDER25',
  builderUrl = 'https://www.weblaunchacademy.com/get-started'
}: BuilderPromoEmailProps) {
  return (
    <EmailLayout previewText={`Your ${promoCode} promo code is inside - Help us build better!`}>
      <Heading style={heading}>
        Hey {customerName || 'there'}, let's build something amazing together!
      </Heading>

      <Text style={paragraph}>
        Thanks for your interest in Web Launch Academy. I have a special request
        for you - and a gift to say thanks in advance.
      </Text>

      {/* Promo Code Box */}
      <Section style={promoBox}>
        <Heading as="h2" style={promoHeading}>
          🎁 Your Exclusive Promo Code
        </Heading>
        <div style={promoCodeContainer}>
          <div style={promoCodeText}>{promoCode}</div>
        </div>
        <Text style={promoDescription}>
          Use this code to get the <strong>AI Premium Builder for just $3.75</strong> (25% off)
        </Text>
      </Section>

      {/* The Request */}
      <Section style={requestBox}>
        <Heading as="h3" style={requestHeading}>
          Here's what I need your help with:
        </Heading>
        <Text style={paragraph}>
          I'm building a library of AI-generated website templates, and I need
          real users like you to help me create better ones. When you use the
          AI Premium Builder, you're not just building your site - you're helping
          me understand what works and what doesn't.
        </Text>

        <ul style={list}>
          <li style={listItem}>
            <strong>Try different business categories</strong> - Restaurant, consulting,
            e-commerce, portfolio, etc.
          </li>
          <li style={listItem}>
            <strong>Experiment with components</strong> - Test different headers,
            CTAs, and layouts
          </li>
          <li style={listItem}>
            <strong>Use all 30 AI questions</strong> - The more you refine, the better
            our templates become
          </li>
          <li style={listItem}>
            <strong>Be honest with feedback</strong> - If something doesn't work,
            that's valuable data
          </li>
        </ul>

        <Text style={paragraph}>
          Your usage patterns, questions, and refinements help me train better
          templates for future users. You're literally helping shape the product.
        </Text>
      </Section>

      {/* Value Exchange */}
      <Section style={valueBox}>
        <Heading as="h3" style={valueHeading}>
          💎 What You Get
        </Heading>
        <ul style={list}>
          <li style={listItem}>30 AI-powered questions to perfect your site</li>
          <li style={listItem}>Professional, customized website preview</li>
          <li style={listItem}>Full code export when you upgrade</li>
          <li style={listItem}>Rollover pricing - your $5 counts toward any package</li>
          <li style={listItem}>First look at new features and templates</li>
        </ul>
      </Section>

      {/* CTA Button */}
      <Section style={buttonSection}>
        <Button style={ctaButton} href={builderUrl}>
          Start Building with AI Premium
        </Button>
      </Section>

      {/* How to Use */}
      <Section style={instructionsBox}>
        <Heading as="h3" style={instructionsHeading}>
          📋 How to Use Your Code:
        </Heading>
        <ol style={orderedList}>
          <li style={listItem}>Click "Start Building" above</li>
          <li style={listItem}>Choose "AI Premium Builder ($5)"</li>
          <li style={listItem}>On the Stripe checkout page, click "Add promotion code"</li>
          <li style={listItem}>Enter: <Code style={inlineCode}>{promoCode}</Code></li>
          <li style={listItem}>Watch the price drop to $3.75!</li>
        </ol>
      </Section>

      {/* Personal Note */}
      <Text style={paragraph}>
        I'm being completely transparent here: I need your help to make this product
        better. In return, you get access to cutting-edge AI website building at a
        discount. This is a genuine win-win.
      </Text>

      <Text style={paragraph}>
        If you have any questions or run into issues, just reply to this email.
        I personally read and respond to every message.
      </Text>

      <Text style={signature}>
        Let's build the future of web development together,
        <br />
        <strong>Matthew Ellis</strong>
        <br />
        Founder, Web Launch Academy
        <br />
        <span style={{ fontSize: '14px', color: '#64748b' }}>
          P.S. Your code is valid for the next 30 days, but the sooner you build,
          the more you help shape our template library! 🚀
        </span>
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
  lineHeight: '1.3',
}

const paragraph = {
  fontSize: '16px',
  lineHeight: '24px',
  color: '#333333',
  marginBottom: '16px',
}

const promoBox = {
  backgroundColor: '#fef3c7',
  padding: '32px',
  margin: '32px 0',
  borderRadius: '12px',
  border: '3px solid #f59e0b',
  textAlign: 'center' as const,
}

const promoHeading = {
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#92400e',
  marginTop: '0',
  marginBottom: '16px',
}

const promoCodeContainer = {
  backgroundColor: '#ffffff',
  padding: '20px',
  borderRadius: '8px',
  margin: '16px auto',
  display: 'inline-block',
}

const promoCodeText = {
  fontSize: '32px',
  fontWeight: 'bold',
  color: '#dc2626',
  letterSpacing: '3px',
  fontFamily: 'monospace',
}

const promoDescription = {
  fontSize: '16px',
  color: '#92400e',
  marginTop: '16px',
  marginBottom: '0',
}

const requestBox = {
  backgroundColor: '#f0f9ff',
  padding: '24px',
  margin: '24px 0',
  borderRadius: '8px',
  border: '2px solid #3b82f6',
}

const requestHeading = {
  fontSize: '20px',
  fontWeight: 'bold',
  color: '#1e40af',
  marginTop: '0',
  marginBottom: '12px',
}

const valueBox = {
  backgroundColor: '#f0fdf4',
  padding: '24px',
  margin: '24px 0',
  borderRadius: '8px',
  border: '2px solid #22c55e',
}

const valueHeading = {
  fontSize: '20px',
  fontWeight: 'bold',
  color: '#15803d',
  marginTop: '0',
  marginBottom: '12px',
}

const instructionsBox = {
  backgroundColor: '#f8f9fa',
  padding: '24px',
  margin: '24px 0',
  borderRadius: '8px',
  border: '1px solid #e2e8f0',
}

const instructionsHeading = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#333333',
  marginTop: '0',
  marginBottom: '12px',
}

const list = {
  margin: '12px 0',
  paddingLeft: '24px',
}

const orderedList = {
  margin: '12px 0',
  paddingLeft: '24px',
  listStyleType: 'decimal',
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

const ctaButton = {
  backgroundColor: '#3b82f6',
  color: '#ffffff',
  padding: '16px 40px',
  textDecoration: 'none',
  borderRadius: '8px',
  fontWeight: '600',
  fontSize: '18px',
  display: 'inline-block',
}

const inlineCode = {
  backgroundColor: '#f1f5f9',
  padding: '2px 6px',
  borderRadius: '4px',
  fontSize: '14px',
  fontFamily: 'monospace',
  color: '#dc2626',
  fontWeight: 'bold',
}

const signature = {
  fontSize: '16px',
  lineHeight: '24px',
  color: '#333333',
  marginTop: '32px',
  borderTop: '2px solid #e2e8f0',
  paddingTop: '24px',
}
