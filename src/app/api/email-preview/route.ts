import { NextRequest, NextResponse } from 'next/server'
import {
  renderWelcomeEmail,
  renderPaymentConfirmationEmail,
  renderPasswordResetEmail,
} from '@/lib/email-builder'
import { getSupabase } from '@/lib/supabase'

const supabase = getSupabase(true) // Use service role

/**
 * Email Preview API
 *
 * Returns rendered email HTML for preview
 * Handles both React Email components and database templates
 */
export async function POST(request: NextRequest) {
  try {
    const { template, type = 'react' } = await request.json()

    let html: string

    if (type === 'database') {
      // Fetch template from database
      const { data: dbTemplate, error } = await supabase
        .from('email_templates' as any)
        .select('*')
        .eq('id', template)
        .single()

      if (error || !dbTemplate) {
        return NextResponse.json(
          { error: 'Template not found' },
          { status: 404 }
        )
      }

      // Replace variables with sample data
      const sampleData: Record<string, string> = {
        name: 'John Doe',
        email: 'john.doe@example.com',
        course_name: 'Web Launch Academy - Website Development Course',
        date: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        url: 'https://www.weblaunchacademy.com',
        discount_code: 'SAMPLE20',
        amount: '$299.00',
        first_name: 'John',
        last_name: 'Doe',
        phone: '(440) 354-9904',
      }

      // Render template with sample data
      let content = dbTemplate.content_template
      let subject = dbTemplate.subject_template

      // Replace all {{variable}} placeholders
      Object.entries(sampleData).forEach(([key, value]) => {
        const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g')
        content = content.replace(regex, value)
        subject = subject.replace(regex, value)
      })

      // Convert newlines to <br> tags for HTML rendering
      content = content.replace(/\n/g, '<br>')

      // Wrap in basic HTML email structure
      html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .email-container {
      background-color: white;
      padding: 40px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .email-header {
      border-bottom: 2px solid #f59e0b;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .email-subject {
      font-size: 24px;
      font-weight: bold;
      color: #1f2937;
      margin: 0 0 10px 0;
    }
    .email-body {
      color: #374151;
      font-size: 16px;
    }
    .email-footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      font-size: 14px;
      color: #6b7280;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="email-header">
      <h1 class="email-subject">${subject}</h1>
      <div style="color: #6b7280; font-size: 14px;">Category: ${dbTemplate.category}</div>
    </div>
    <div class="email-body">
      ${content}
    </div>
    <div class="email-footer">
      <strong>Web Launch Academy LLC</strong><br>
      Build Once, Own Forever!<br>
      <a href="mailto:support@weblaunchacademy.com" style="color: #f59e0b; text-decoration: none;">support@weblaunchacademy.com</a>
    </div>
  </div>
</body>
</html>
      `
    } else {
      // Render React Email components
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
