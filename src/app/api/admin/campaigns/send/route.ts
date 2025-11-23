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
      .from('campaigns' as any)
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

function getRecipientName(recipient: any): string {
  // Priority: display_name > first_name > fallback greeting
  if (recipient.display_name) {
    return recipient.display_name
  }
  if (recipient.first_name) {
    return recipient.first_name
  }
  // Friendly fallback if no name available
  return 'there'
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

    // Get course data from campaign if available
    const courseData = campaign.target_audience?.selectedCourse || {}

    // Replace variables in content for test
    const processedContent = processEmailContent(
      campaign.content,
      {
        name: 'Test User',
        first_name: 'Test',
        last_name: 'User',
        unsubscribe_url: `${process.env.NEXT_PUBLIC_SITE_URL}/unsubscribe?email=${testEmail}`,
        // Course placeholders - use selected course or fallback
        course_name: courseData.name || process.env.NEXT_PUBLIC_COURSE_NAME || 'Our Latest Course',
        course_description: courseData.description || process.env.NEXT_PUBLIC_COURSE_DESCRIPTION || 'Learn to build professional websites',
        course_url: courseData.url || `${process.env.NEXT_PUBLIC_SITE_URL}/pricing`,
        course_price: courseData.price?.formatted || 'Contact for pricing',
        course_price_monthly: courseData.prices?.monthly?.formatted || '',
        course_price_onetime: courseData.prices?.oneTime?.formatted || ''
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
      .from('campaigns' as any)
      .update({ status: 'sending' })
      .eq('id', campaign.id)

    // Get recipients based on target audience
    const recipients = await getRecipients(campaign.target_audience)

    if (recipients.length === 0) {
      await supabase
        .from('campaigns' as any)
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
        .from('campaigns' as any)
        .update({ status: 'failed' })
        .eq('id', campaign.id)

      return {
        success: false,
        error: 'Email service not configured'
      }
    }

    let sentCount = 0
    let errors: string[] = []

    // Send emails one at a time with delay to avoid rate limits
    for (const recipient of recipients) {
        try {
          // Get the best available name
          const recipientName = getRecipientName(recipient)

          // Get course data from campaign if available
          const courseData = campaign.target_audience?.selectedCourse || {}

          const processedContent = processEmailContent(
            campaign.content,
            {
              name: recipientName,
              first_name: recipient.first_name || recipientName,
              last_name: recipient.last_name || '',
              unsubscribe_url: `${process.env.NEXT_PUBLIC_SITE_URL}/unsubscribe?email=${recipient.email}`,
              // Course placeholders - use selected course or fallback
              course_name: courseData.name || process.env.NEXT_PUBLIC_COURSE_NAME || 'Our Latest Course',
              course_description: courseData.description || process.env.NEXT_PUBLIC_COURSE_DESCRIPTION || 'Learn to build professional websites',
              course_url: courseData.url || `${process.env.NEXT_PUBLIC_SITE_URL}/pricing`,
              course_price: courseData.price?.formatted || 'Contact for pricing',
              course_price_monthly: courseData.prices?.monthly?.formatted || '',
              course_price_onetime: courseData.prices?.oneTime?.formatted || ''
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
            // Get Resend email ID from response
            const resendResponse = await response.json()
            const resendEmailId = resendResponse.id

            // Record successful send with Resend email ID
            await supabase
              .from('campaign_sends' as any)
              .insert({
                campaign_id: campaign.id,
                recipient_email: recipient.email,
                recipient_name: recipientName,
                sent_at: new Date().toISOString(),
                resend_email_id: resendEmailId // Store for webhook matching
              })

            console.log(`✅ Sent email to ${recipient.email} with Resend ID: ${resendEmailId}`)
            sentCount++
          } else {
            const error = await response.text()
            console.error(`Resend API error for ${recipient.email}:`, error)
            errors.push(`${recipient.email}: ${error}`)
          }

        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : String(error)
          console.error(`Failed to send to ${recipient.email}:`, errorMsg)
          errors.push(`${recipient.email}: ${errorMsg}`)
        }

        // Small delay between each email to avoid rate limits (300ms)
        await new Promise(resolve => setTimeout(resolve, 300))
    }

    // Update campaign with final status
    const finalStatus = sentCount > 0 ? 'sent' : 'failed'
    await supabase
      .from('campaigns' as any)
      .update({
        status: finalStatus,
        sent_count: sentCount,
        sent_at: sentCount > 0 ? new Date().toISOString() : null
      })
      .eq('id', campaign.id)

    // Log all errors for debugging
    if (errors.length > 0) {
      console.error(`Campaign ${campaign.id} had ${errors.length} errors:`)
      errors.forEach(err => console.error(`  - ${err}`))
    }

    return {
      success: sentCount > 0,
      message: `Campaign sent to ${sentCount} of ${recipients.length} recipients`,
      sentCount,
      totalRecipients: recipients.length,
      errorCount: errors.length,
      errors: errors // Return all errors, not just first 10
    }

  } catch (error) {
    console.error('Campaign send error:', error)

    // Update campaign status to failed
    await supabase
      .from('campaigns' as any)
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
    // Handle manual recipients
    if (targetAudience?.source === 'manual' && targetAudience?.manualRecipients?.length > 0) {
      const { data: recipients, error } = await supabase
        .from('leads' as any)
        .select('email, first_name, last_name, display_name')
        .in('email', targetAudience.manualRecipients)

      if (error) {
        console.error('Error fetching manual recipients:', error)
        return []
      }

      return recipients || []
    }

    // Handle automatic audience selection
    let query = supabase
      .from('leads' as any)
      .select('email, first_name, last_name, display_name')
      .eq('status', 'waitlist') // Only active waitlist leads by default

    // Apply filters based on target audience
    if (targetAudience?.status) {
      query = query.eq('status', targetAudience.status)
    }

    if (targetAudience?.source && targetAudience.source !== 'all') {
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

  // Add click tracking to all links (except unsubscribe)
  if (campaignId && recipientEmail) {
    // Regex to find all <a href="..."> tags
    processedContent = processedContent.replace(
      /<a\s+([^>]*?)href=["']([^"']+)["']([^>]*?)>/gi,
      (match, before, url, after) => {
        // Skip unsubscribe links and tracking URLs
        if (url.includes('/unsubscribe') || url.includes('/api/email-tracking')) {
          return match
        }

        // Create click tracking URL
        const trackingUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/api/email-tracking/click?c=${campaignId}&e=${encodeURIComponent(recipientEmail)}&url=${encodeURIComponent(url)}`

        return `<a ${before}href="${trackingUrl}"${after}>`
      }
    )
  }

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