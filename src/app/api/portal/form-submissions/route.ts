import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { resendAdapter } from '@/adapters'
import { logger } from '@/lib/logger'

const EMAIL_FROM = 'Web Launch Academy <noreply@weblaunchacademy.com>'
const EMAIL_TO = 'hello@weblaunchacademy.com'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://weblaunchacademy.com'

interface FormSubmissionRequest {
  formType: 'revision-start' | 'revision-modifier' | 'video-conference'
  clientName: string
  clientEmail: string
  selectedItems?: string[]
  detailedInstructions?: string
  revisionStatus?: string
  selectedTopics?: Array<{ name: string; details: string }>
  additionalDetails?: string
}

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {}
          },
        },
      }
    )

    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse request body
    const body: FormSubmissionRequest = await request.json()
    const {
      formType,
      clientName,
      clientEmail,
      selectedItems,
      detailedInstructions,
      revisionStatus,
      selectedTopics,
      additionalDetails
    } = body

    // Validate required fields
    if (!formType || !clientName || !clientEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Prepare data based on form type
    let insertData: any = {
      user_id: user.id,
      client_name: clientName,
      client_email: clientEmail,
      form_type: formType,
      status: 'new'
    }

    if (formType === 'video-conference') {
      // Store topics as JSONB
      insertData.selected_items = selectedTopics || []
      insertData.detailed_instructions = additionalDetails || ''
    } else {
      // Revision forms
      insertData.selected_items = selectedItems || []
      insertData.detailed_instructions = detailedInstructions || ''
      insertData.revision_status = revisionStatus || null
    }

    // Insert into database
    const { data: submission, error: dbError } = await supabase
      .from('form_submissions')
      .insert(insertData)
      .select()
      .single()

    if (dbError) {
      logger.error({ type: 'db', error: dbError }, 'Failed to save form submission')
      return NextResponse.json(
        { error: 'Failed to save submission' },
        { status: 500 }
      )
    }

    // Send email notification
    try {
      const emailHtml = generateEmailHtml(formType, {
        clientName,
        clientEmail,
        selectedItems,
        detailedInstructions,
        revisionStatus,
        selectedTopics,
        additionalDetails,
        submissionId: submission.id
      })

      const emailSubject = getEmailSubject(formType, clientName)

      await resendAdapter.sendEmail({
        from: EMAIL_FROM,
        to: EMAIL_TO,
        subject: emailSubject,
        html: emailHtml
      })

      logger.info({
        type: 'email',
        formType,
        clientName,
        submissionId: submission.id
      }, 'Form submission email sent')
    } catch (emailError) {
      logger.error({ type: 'email', error: emailError }, 'Failed to send notification email')
      // Don't fail the request if email fails - submission is already saved
    }

    return NextResponse.json({
      success: true,
      submissionId: submission.id
    })

  } catch (error) {
    logger.error({ type: 'api', error }, 'Form submission error')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {}
          },
        },
      }
    )

    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const { searchParams } = new URL(request.url)
    const isAdminView = searchParams.get('admin') === 'true'

    let query = supabase
      .from('form_submissions')
      .select('*')
      .order('created_at', { ascending: false })

    // If not admin view, only show user's own submissions
    if (!isAdminView) {
      query = query.eq('user_id', user.id)
    } else {
      // Verify user is actually an admin
      const { data: userRecord } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

      if (!userRecord || userRecord.role !== 'admin') {
        return NextResponse.json(
          { error: 'Forbidden' },
          { status: 403 }
        )
      }
    }

    const { data: submissions, error: queryError } = await query

    if (queryError) {
      logger.error({ type: 'db', error: queryError }, 'Failed to fetch submissions')
      return NextResponse.json(
        { error: 'Failed to fetch submissions' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      submissions
    })

  } catch (error) {
    logger.error({ type: 'api', error }, 'Failed to fetch submissions')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function getEmailSubject(formType: string, clientName: string): string {
  switch (formType) {
    case 'revision-start':
      return `[Revision Start] ${clientName} - Website Revision Request`
    case 'revision-modifier':
      return `[Revision Modifier] ${clientName} - Website Revision Modification`
    case 'video-conference':
      return `[Video Conference] ${clientName} - Meeting Request`
    default:
      return `[Form Submission] ${clientName}`
  }
}

function generateEmailHtml(formType: string, data: any): string {
  const { clientName, clientEmail, submissionId } = data
  const viewUrl = `${SITE_URL}/portal/support?view=submission&id=${submissionId}`

  let specificContent = ''

  if (formType === 'revision-start' || formType === 'revision-modifier') {
    const selectedChanges = data.selectedItems || []
    specificContent = `
      ${formType === 'revision-modifier' ? `<p><strong>Revision Status:</strong> ${data.revisionStatus || 'N/A'}</p>` : ''}

      <h3>Selected Change Types:</h3>
      <ul>
        ${selectedChanges.map((change: string) => `<li>${formatChangeType(change)}</li>`).join('')}
      </ul>

      <h3>Detailed Instructions:</h3>
      <p style="white-space: pre-wrap; background: #f5f5f5; padding: 16px; border-radius: 4px; border-left: 4px solid #333;">
        ${data.detailedInstructions || 'No instructions provided'}
      </p>
    `
  } else if (formType === 'video-conference') {
    const topics = data.selectedTopics || []
    const topicsHtml = topics.map((topic: any, index: number) => `
      <h3>Topic ${index + 1}: ${topic.name}</h3>
      <p style="white-space: pre-wrap; background: #f5f5f5; padding: 16px; border-radius: 4px; margin-bottom: 20px;">
        ${topic.details || 'No details provided'}
      </p>
    `).join('')

    specificContent = `
      <div style="background: #e3f2fd; padding: 16px; border-radius: 4px; margin-bottom: 20px; border-left: 4px solid #2196F3;">
        <p style="margin: 0; font-weight: bold; color: #1976D2;">💰 Investment: $200 for 40-minute session</p>
      </div>

      <h3>Selected Topics (${topics.length}):</h3>
      ${topicsHtml}

      <h3>Additional Details or Other Questions:</h3>
      <p style="white-space: pre-wrap; background: #f5f5f5; padding: 16px; border-radius: 4px; border-left: 4px solid #333;">
        ${data.additionalDetails || 'No additional details provided'}
      </p>
    `
  }

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          h2 {
            color: #000;
            border-bottom: 3px solid #333;
            padding-bottom: 10px;
            margin-bottom: 20px;
          }
          h3 {
            color: #333;
            margin-top: 24px;
            margin-bottom: 8px;
          }
          .header-info {
            background: #f9f9f9;
            padding: 16px;
            border-radius: 4px;
            margin-bottom: 24px;
          }
          .header-info p {
            margin: 4px 0;
          }
          .cta-button {
            display: inline-block;
            background: #333;
            color: #fff !important;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 4px;
            margin: 20px 0;
            font-weight: 600;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            font-size: 14px;
            color: #666;
          }
          ul {
            margin: 12px 0;
            padding-left: 24px;
          }
          li {
            margin: 6px 0;
          }
        </style>
      </head>
      <body>
        <h2>New ${formatFormType(formType)} Submission</h2>

        <div class="header-info">
          <p><strong>Client Name:</strong> ${clientName}</p>
          <p><strong>Client Email:</strong> ${clientEmail}</p>
          <p><strong>Submitted:</strong> ${new Date().toLocaleString('en-US', {
            dateStyle: 'full',
            timeStyle: 'short'
          })}</p>
        </div>

        ${specificContent}

        <div style="text-align: center;">
          <a href="${viewUrl}" class="cta-button">View in Admin Dashboard</a>
        </div>

        <div class="footer">
          <p><em>This is an automated submission from the Web Launch Academy client portal. Please review and respond to the client within 5-7 business days.</em></p>
        </div>
      </body>
    </html>
  `
}

function formatFormType(formType: string): string {
  switch (formType) {
    case 'revision-start':
      return 'Revision Start Round'
    case 'revision-modifier':
      return 'Revision Modifier Round'
    case 'video-conference':
      return 'Video Conference Request'
    default:
      return formType
  }
}

function formatChangeType(changeType: string): string {
  const types: Record<string, string> = {
    'text': 'Text or content updates',
    'images': 'Image additions or replacements',
    'styling': 'Color, font, or styling adjustments',
    'layout': 'Layout refinements or spacing',
    'positioning': 'Visibility or positioning changes'
  }
  return types[changeType] || changeType
}
