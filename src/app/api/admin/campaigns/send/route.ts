import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'

const supabase = getSupabase(true) // Use service role

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { campaignId, testEmail } = body

    if (!campaignId) {
      return NextResponse.json(
        { error: 'Campaign ID is required' },
        { status: 400 }
      )
    }

    // Get campaign details
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', campaignId)
      .single()

    if (campaignError || !campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    if (testEmail) {
      // Send test email
      const result = await sendTestEmail(campaign, testEmail)
      return NextResponse.json(result)
    } else {
      // Send to all recipients
      const result = await sendCampaignToAll(campaign)
      return NextResponse.json(result)
    }

  } catch (error) {
    console.error('Send campaign error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function sendTestEmail(campaign: any, testEmail: string) {
  try {
    const resendApiKey = process.env.RESEND_API_KEY

    if (!resendApiKey) {
      return {
        success: false,
        error: 'Email service not configured'
      }
    }

    // Replace variables in content for test
    const processedContent = processEmailContent(
      campaign.content,
      {
        name: 'Test User',
        unsubscribe_url: `${process.env.NEXT_PUBLIC_SITE_URL}/unsubscribe?email=${testEmail}`
      }
      // No tracking for test emails
    )

    const emailData = {
      from: 'Web Launch Academy <hello@weblaunchacademy.com>',
      to: [testEmail],
      subject: `[TEST] ${campaign.subject}`,
      html: processedContent,
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to send test email: ${error}`)
    }

    return {
      success: true,
      message: `Test email sent to ${testEmail}`
    }

  } catch (error) {
    console.error('Test email error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send test email'
    }
  }
}

async function sendCampaignToAll(campaign: any) {
  try {
    // Update campaign status to sending
    await supabase
      .from('campaigns')
      .update({ status: 'sending' })
      .eq('id', campaign.id)

    // Get recipients based on target audience
    const recipients = await getRecipients(campaign.target_audience)

    if (recipients.length === 0) {
      await supabase
        .from('campaigns')
        .update({
          status: 'failed',
          sent_count: 0
        })
        .eq('id', campaign.id)

      return {
        success: false,
        error: 'No recipients found for this campaign'
      }
    }

    const resendApiKey = process.env.RESEND_API_KEY

    if (!resendApiKey) {
      await supabase
        .from('campaigns')
        .update({ status: 'failed' })
        .eq('id', campaign.id)

      return {
        success: false,
        error: 'Email service not configured'
      }
    }

    let sentCount = 0
    let errors: string[] = []

    // Send emails in batches to avoid rate limits
    const batchSize = 10
    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize)

      await Promise.all(batch.map(async (recipient) => {
        try {
          const processedContent = processEmailContent(
            campaign.content,
            {
              name: recipient.name || 'there',
              unsubscribe_url: `${process.env.NEXT_PUBLIC_SITE_URL}/unsubscribe?email=${recipient.email}`
            },
            campaign.id,
            recipient.email
          )

          const emailData = {
            from: 'Web Launch Academy <hello@weblaunchacademy.com>',
            to: [recipient.email],
            subject: campaign.subject,
            html: processedContent,
          }

          const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${resendApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(emailData),
          })

          if (response.ok) {
            // Record successful send
            await supabase
              .from('campaign_sends')
              .insert({
                campaign_id: campaign.id,
                recipient_email: recipient.email,
                recipient_name: recipient.name,
                sent_at: new Date().toISOString()
              })

            sentCount++
          } else {
            const error = await response.text()
            errors.push(`${recipient.email}: ${error}`)
          }

        } catch (error) {
          errors.push(`${recipient.email}: ${error}`)
        }
      }))

      // Small delay between batches
      if (i + batchSize < recipients.length) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    // Update campaign with final status
    const finalStatus = sentCount > 0 ? 'sent' : 'failed'
    await supabase
      .from('campaigns')
      .update({
        status: finalStatus,
        sent_count: sentCount,
        sent_at: sentCount > 0 ? new Date().toISOString() : null
      })
      .eq('id', campaign.id)

    return {
      success: sentCount > 0,
      message: `Campaign sent to ${sentCount} recipients`,
      sentCount,
      errorCount: errors.length,
      errors: errors.slice(0, 10) // Limit error details
    }

  } catch (error) {
    console.error('Campaign send error:', error)

    // Update campaign status to failed
    await supabase
      .from('campaigns')
      .update({ status: 'failed' })
      .eq('id', campaign.id)

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send campaign'
    }
  }
}

async function getRecipients(targetAudience: any) {
  try {
    let query = supabase
      .from('leads')
      .select('email, name')
      .eq('status', 'waitlist') // Only active waitlist leads by default

    // Apply filters based on target audience
    if (targetAudience?.status) {
      query = query.eq('status', targetAudience.status)
    }

    if (targetAudience?.source) {
      query = query.eq('source', targetAudience.source)
    }

    if (targetAudience?.tags && targetAudience.tags.length > 0) {
      query = query.contains('tags', targetAudience.tags)
    }

    if (targetAudience?.dateRange) {
      const { start, end } = targetAudience.dateRange
      if (start) query = query.gte('signup_date', start)
      if (end) query = query.lte('signup_date', end)
    }

    const { data: recipients, error } = await query

    if (error) {
      console.error('Error fetching recipients:', error)
      return []
    }

    return recipients || []
  } catch (error) {
    console.error('Get recipients error:', error)
    return []
  }
}

function processEmailContent(
  content: string,
  variables: Record<string, string>,
  campaignId?: string,
  recipientEmail?: string
): string {
  let processedContent = content

  // Replace all variables in the format {{variable}}
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g')
    processedContent = processedContent.replace(regex, value)
  })

  // Add tracking pixel for email opens
  if (campaignId && recipientEmail) {
    const trackingUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/api/email-tracking/open?c=${campaignId}&e=${encodeURIComponent(recipientEmail)}`
    const trackingPixel = `<img src="${trackingUrl}" width="1" height="1" style="display:none;" alt="" />`

    // Insert tracking pixel before closing body tag, or at the end if no body tag
    if (processedContent.includes('</body>')) {
      processedContent = processedContent.replace('</body>', `${trackingPixel}</body>`)
    } else {
      processedContent += trackingPixel
    }
  }

  return processedContent
}