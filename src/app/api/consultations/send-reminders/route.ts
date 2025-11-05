import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'
import { ResendAdapter } from '@/adapters/ResendAdapter'

/**
 * Send Consultation Reminders
 *
 * This endpoint should be called by a cron job every 15-30 minutes to send:
 * 1. 24-hour reminders (for consultations 23-25 hours away)
 * 2. 1-hour reminders (for consultations 0.5-1.5 hours away)
 *
 * Setup Cron Job:
 * - Vercel Cron: vercel.json with schedule "*/15 * * * *" (every 15 min)
 * - External: Call this endpoint every 15-30 minutes
 * - Auth: Use CRON_SECRET header for security
 */

export async function POST(request: NextRequest) {
  try {
    // Verify cron secret for security
    const cronSecret = request.headers.get('authorization')
    if (cronSecret !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabase = getSupabase(true) // Use service role
    const resend = ResendAdapter.getInstance()

    const now = new Date()
    const results = {
      reminders_24h_sent: 0,
      reminders_1h_sent: 0,
      errors: [] as string[]
    }

    // ============================================
    // 1. Send 24-Hour Reminders
    // ============================================

    // Find consultations 23-25 hours away that haven't received 24h reminder
    const twentyThreeHoursFromNow = new Date(now.getTime() + (23 * 60 * 60 * 1000))
    const twentyFiveHoursFromNow = new Date(now.getTime() + (25 * 60 * 60 * 1000))

    const { data: consultations24h } = await supabase
      .from('consultations')
      .select('*')
      .eq('status', 'scheduled')
      .eq('reminder_24h_sent', false)
      .gte('scheduled_date', twentyThreeHoursFromNow.toISOString())
      .lte('scheduled_date', twentyFiveHoursFromNow.toISOString())

    if (consultations24h && consultations24h.length > 0) {
      // Get 24-hour reminder template
      const { data: template24h } = await supabase
        .from('email_templates')
        .select('*')
        .eq('name', 'Consultation Reminder 24h')
        .single()

      for (const consultation of consultations24h) {
        try {
          if (!template24h) {
            throw new Error('24-hour reminder template not found')
          }

          const consultationTime = new Date(consultation.scheduled_date)
          const timeFormatted = consultationTime.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            timeZone: 'America/New_York'
          })

          let emailContent = template24h.content_template
            .replace(/{{name}}/g, consultation.full_name)
            .replace(/{{time}}/g, timeFormatted)
            .replace(/{{join_url}}/g, consultation.jitsi_join_url || '')

          let emailSubject = template24h.subject_template
            .replace(/{{time}}/g, timeFormatted)

          await resend.sendEmail({
            to: consultation.email,
            from: 'Web Launch Academy <hello@weblaunchacademy.com>',
            subject: emailSubject,
            html: emailContent
          })

          // Mark reminder as sent
          await supabase
            .from('consultations')
            .update({
              reminder_24h_sent: true,
              reminder_24h_sent_at: now.toISOString()
            })
            .eq('id', consultation.id)

          results.reminders_24h_sent++
        } catch (error) {
          console.error(`Error sending 24h reminder for consultation ${consultation.id}:`, error)
          results.errors.push(`24h reminder failed for ${consultation.email}: ${(error as Error).message}`)
        }
      }
    }

    // ============================================
    // 2. Send 1-Hour Reminders
    // ============================================

    // Find consultations 0.5-1.5 hours away that haven't received 1h reminder
    const thirtyMinutesFromNow = new Date(now.getTime() + (30 * 60 * 1000))
    const ninetyMinutesFromNow = new Date(now.getTime() + (90 * 60 * 1000))

    const { data: consultations1h } = await supabase
      .from('consultations')
      .select('*')
      .eq('status', 'scheduled')
      .eq('reminder_1h_sent', false)
      .gte('scheduled_date', thirtyMinutesFromNow.toISOString())
      .lte('scheduled_date', ninetyMinutesFromNow.toISOString())

    if (consultations1h && consultations1h.length > 0) {
      // Get 1-hour reminder template
      const { data: template1h } = await supabase
        .from('email_templates')
        .select('*')
        .eq('name', 'Consultation Reminder 1h')
        .single()

      for (const consultation of consultations1h) {
        try {
          if (!template1h) {
            throw new Error('1-hour reminder template not found')
          }

          const consultationTime = new Date(consultation.scheduled_date)
          const timeFormatted = consultationTime.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            timeZone: 'America/New_York'
          })

          let emailContent = template1h.content_template
            .replace(/{{name}}/g, consultation.full_name)
            .replace(/{{time}}/g, timeFormatted)
            .replace(/{{join_url}}/g, consultation.jitsi_join_url || '')

          let emailSubject = template1h.subject_template
            .replace(/{{time}}/g, timeFormatted)

          await resend.sendEmail({
            to: consultation.email,
            from: 'Web Launch Academy <hello@weblaunchacademy.com>',
            subject: emailSubject,
            html: emailContent
          })

          // Mark reminder as sent
          await supabase
            .from('consultations')
            .update({
              reminder_1h_sent: true,
              reminder_1h_sent_at: now.toISOString()
            })
            .eq('id', consultation.id)

          results.reminders_1h_sent++
        } catch (error) {
          console.error(`Error sending 1h reminder for consultation ${consultation.id}:`, error)
          results.errors.push(`1h reminder failed for ${consultation.email}: ${(error as Error).message}`)
        }
      }
    }

    return NextResponse.json({
      success: true,
      ...results,
      timestamp: now.toISOString()
    })

  } catch (error) {
    console.error('Error in reminder cron job:', error)

    return NextResponse.json(
      {
        error: 'Failed to process reminders',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    )
  }
}

/**
 * GET endpoint for manual testing
 */
export async function GET(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Only available in development' }, { status: 403 })
  }

  // Call the POST endpoint
  return POST(request)
}
