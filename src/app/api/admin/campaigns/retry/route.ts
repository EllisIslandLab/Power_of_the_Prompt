import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'

const supabase = getSupabase(true) // Use service role

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { campaignId, recipients } = body

    if (!campaignId || !recipients || !Array.isArray(recipients)) {
      return NextResponse.json(
        { error: 'Campaign ID and recipients array are required' },
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

    // Get lead details for the recipients
    const { data: leads, error: leadsError } = await supabase
      .from('leads' as any)
      .select('email, first_name, last_name, display_name')
      .in('email', recipients)

    if (leadsError) {
      console.error('Error fetching leads:', leadsError)
      return NextResponse.json(
        { error: 'Failed to fetch recipient details' },
        { status: 500 }
      )
    }

    const resendApiKey = process.env.RESEND_API_KEY

    if (!resendApiKey) {
      return NextResponse.json(
        { error: 'Email service not configured' },
        { status: 500 }
      )
    }

    let sentCount = 0
    let errors: string[] = []

    // Get course data from campaign if available
    const targetAudience = campaign.target_audience as any
    const courseData = targetAudience?.selectedCourse || {}

    // Send emails to each recipient with delay to avoid rate limits
    for (const lead of leads || []) {
      try {
        const recipientName = lead.display_name || lead.first_name || 'there'

        // Process email content with variables
        let processedContent = campaign.content

        // Replace variables
        const variables = {
          name: recipientName,
          first_name: lead.first_name || recipientName,
          last_name: lead.last_name || '',
          unsubscribe_url: `${process.env.NEXT_PUBLIC_SITE_URL}/unsubscribe?email=${lead.email}`,
          course_name: courseData.name || process.env.NEXT_PUBLIC_COURSE_NAME || 'Our Latest Course',
          course_description: courseData.description || process.env.NEXT_PUBLIC_COURSE_DESCRIPTION || 'Learn to build professional websites',
          course_url: courseData.url || `${process.env.NEXT_PUBLIC_SITE_URL}/pricing`,
          course_price: courseData.price?.formatted || 'Contact for pricing',
          course_price_monthly: courseData.prices?.monthly?.formatted || '',
          course_price_onetime: courseData.prices?.oneTime?.formatted || ''
        }

        Object.entries(variables).forEach(([key, value]) => {
          const regex = new RegExp(`{{${key}}}`, 'g')
          processedContent = processedContent.replace(regex, value)
        })

        // Add tracking pixel
        const trackingUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/api/email-tracking/open?c=${campaignId}&e=${encodeURIComponent(lead.email)}`
        const trackingPixel = `<img src="${trackingUrl}" width="1" height="1" style="display:none;" alt="" />`

        if (processedContent.includes('</body>')) {
          processedContent = processedContent.replace('</body>', `${trackingPixel}</body>`)
        } else {
          processedContent += trackingPixel
        }

        const emailData = {
          from: 'Web Launch Academy <hello@weblaunchacademy.com>',
          to: [lead.email],
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
            .from('campaign_sends' as any)
            .insert({
              campaign_id: campaignId,
              recipient_email: lead.email,
              recipient_name: recipientName,
              sent_at: new Date().toISOString()
            })

          sentCount++
          console.log(`✓ Retry sent to ${lead.email}`)
        } else {
          const error = await response.text()
          console.error(`Resend API error for ${lead.email}:`, error)
          errors.push(`${lead.email}: ${error}`)
        }

      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        console.error(`Failed to send to ${lead.email}:`, errorMsg)
        errors.push(`${lead.email}: ${errorMsg}`)
      }

      // Small delay to avoid rate limiting (300ms between emails)
      await new Promise(resolve => setTimeout(resolve, 300))
    }

    // Update campaign sent_count
    if (sentCount > 0) {
      await supabase
        .from('campaigns' as any)
        .update({
          sent_count: campaign.sent_count + sentCount
        })
        .eq('id', campaignId)
    }

    return NextResponse.json({
      success: sentCount > 0,
      message: `Sent to ${sentCount} of ${recipients.length} recipients`,
      sentCount,
      errorCount: errors.length,
      errors
    })

  } catch (error) {
    console.error('Retry campaign error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
