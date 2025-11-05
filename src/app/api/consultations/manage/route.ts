import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'
import { ResendAdapter } from '@/adapters/ResendAdapter'

/**
 * Consultation Management API
 *
 * Handles:
 * - Cancel consultations
 * - Reschedule consultations
 * - Update consultation status
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, consultationId, reason, newSlot } = body

    if (!consultationId || !action) {
      return NextResponse.json(
        { error: 'Consultation ID and action are required' },
        { status: 400 }
      )
    }

    const supabase = getSupabase(true) // Use service role
    const resend = ResendAdapter.getInstance()

    // Get consultation details
    const { data: consultation, error: fetchError } = await supabase
      .from('consultations')
      .select('*')
      .eq('id', consultationId)
      .single()

    if (fetchError || !consultation) {
      return NextResponse.json(
        { error: 'Consultation not found' },
        { status: 404 }
      )
    }

    // ============================================
    // Handle Cancel Action
    // ============================================

    if (action === 'cancel') {
      const { error: cancelError } = await supabase
        .from('consultations')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          cancellation_reason: reason || 'No reason provided'
        })
        .eq('id', consultationId)

      if (cancelError) {
        throw cancelError
      }

      // Send cancellation confirmation email
      await resend.sendEmail({
        to: consultation.email,
        from: 'Web Launch Academy <hello@weblaunchacademy.com>',
        subject: 'Consultation Cancelled - Web Launch Academy',
        html: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2>Consultation Cancelled</h2>

  <p>Hi ${consultation.full_name},</p>

  <p>Your consultation scheduled for <strong>${new Date(consultation.scheduled_date).toLocaleString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'America/New_York',
    timeZoneName: 'short'
  })}</strong> has been cancelled.</p>

  ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}

  <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <h3>Want to Reschedule?</h3>
    <p>No problem! You can book a new time slot anytime.</p>
    <div style="text-align: center; margin-top: 20px;">
      <a href="https://weblaunchacademy.com/consultation"
         style="background-color: #ffdb57; color: #11296b; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">
        Book a New Consultation
      </a>
    </div>
  </div>

  <p>If you have any questions, just reply to this email.</p>

  <p>
    Best regards,<br>
    <strong>Matthew Ellis</strong><br>
    Web Launch Academy
  </p>
</div>
        `
      })

      // Send notification to admin
      await resend.sendEmail({
        to: 'hello@weblaunchacademy.com',
        from: 'Web Launch Academy <hello@weblaunchacademy.com>',
        subject: `Consultation Cancelled: ${consultation.full_name}`,
        html: `
          <h2>Consultation Cancelled</h2>
          <p><strong>Name:</strong> ${consultation.full_name}</p>
          <p><strong>Email:</strong> ${consultation.email}</p>
          <p><strong>Phone:</strong> ${consultation.phone}</p>
          <p><strong>Original Time:</strong> ${new Date(consultation.scheduled_date).toLocaleString()}</p>
          <p><strong>Reason:</strong> ${reason || 'No reason provided'}</p>
        `
      })

      return NextResponse.json({
        success: true,
        message: 'Consultation cancelled successfully'
      })
    }

    // ============================================
    // Handle Reschedule Action
    // ============================================

    if (action === 'reschedule') {
      if (!newSlot || !newSlot.timestamp) {
        return NextResponse.json(
          { error: 'New time slot is required for rescheduling' },
          { status: 400 }
        )
      }

      const newDate = new Date(newSlot.timestamp)

      // Check if new slot is available
      const slotEnd = new Date(newDate.getTime() + (60 * 60 * 1000))
      const { data: existingBlocks } = await supabase
        .from('consultation_blocks')
        .select('*')
        .or(`and(start_time.lte.${newDate.toISOString()},end_time.gt.${newDate.toISOString()}),and(start_time.lt.${slotEnd.toISOString()},end_time.gte.${slotEnd.toISOString()})`)

      if (existingBlocks && existingBlocks.length > 0) {
        return NextResponse.json(
          { error: 'The selected time slot is no longer available' },
          { status: 409 }
        )
      }

      // Update consultation
      const { error: rescheduleError } = await supabase
        .from('consultations')
        .update({
          scheduled_date: newDate.toISOString(),
          rescheduled_from: consultationId,
          status: 'scheduled',
          reminder_24h_sent: false,
          reminder_1h_sent: false
        })
        .eq('id', consultationId)

      if (rescheduleError) {
        throw rescheduleError
      }

      // Send reschedule confirmation email
      await resend.sendEmail({
        to: consultation.email,
        from: 'Web Launch Academy <hello@weblaunchacademy.com>',
        subject: 'Consultation Rescheduled - Web Launch Academy',
        html: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2>Consultation Rescheduled! 🎉</h2>

  <p>Hi ${consultation.full_name},</p>

  <p>Your consultation has been successfully rescheduled.</p>

  <div style="background-color: #e8f5e9; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2e7d32;">
    <h3 style="color: #2e7d32; margin: 0 0 10px 0;">📅 New Appointment Details</h3>
    <p style="margin: 5px 0;"><strong>Date & Time:</strong> ${newSlot.formatted || newDate.toLocaleString()}</p>
    <p style="margin: 5px 0;"><strong>Duration:</strong> 60 minutes</p>
  </div>

  <div style="text-align: center; margin: 30px 0;">
    <a href="${consultation.jitsi_join_url}"
       style="background-color: #ffdb57; color: #11296b; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">
      Join Your Consultation
    </a>
  </div>

  <div style="background-color: #fff3cd; padding: 15px; border-radius: 6px; margin: 20px 0;">
    <p style="margin: 0; color: #856404;">
      <strong>⏰ Reminders:</strong> We'll send you reminder emails 24 hours and 1 hour before your new consultation time.
    </p>
  </div>

  <p>Need to change this again? Just reply to this email or call me at (440) 354-9904.</p>

  <p>
    Best regards,<br>
    <strong>Matthew Ellis</strong><br>
    Web Launch Academy
  </p>
</div>
        `
      })

      // Send notification to admin
      await resend.sendEmail({
        to: 'hello@weblaunchacademy.com',
        from: 'Web Launch Academy <hello@weblaunchacademy.com>',
        subject: `Consultation Rescheduled: ${consultation.full_name}`,
        html: `
          <h2>Consultation Rescheduled</h2>
          <p><strong>Name:</strong> ${consultation.full_name}</p>
          <p><strong>Email:</strong> ${consultation.email}</p>
          <p><strong>Original Time:</strong> ${new Date(consultation.scheduled_date).toLocaleString()}</p>
          <p><strong>New Time:</strong> ${newDate.toLocaleString()}</p>
        `
      })

      return NextResponse.json({
        success: true,
        message: 'Consultation rescheduled successfully',
        new_time: newSlot.formatted || newDate.toLocaleString()
      })
    }

    return NextResponse.json(
      { error: 'Invalid action. Use "cancel" or "reschedule"' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Error managing consultation:', error)

    return NextResponse.json(
      {
        error: 'Failed to manage consultation',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    )
  }
}

/**
 * GET endpoint to retrieve consultation details
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const consultationId = searchParams.get('id')

    if (!consultationId) {
      return NextResponse.json(
        { error: 'Consultation ID is required' },
        { status: 400 }
      )
    }

    const supabase = getSupabase(true)

    const { data: consultation, error } = await supabase
      .from('consultations')
      .select('*')
      .eq('id', consultationId)
      .single()

    if (error || !consultation) {
      return NextResponse.json(
        { error: 'Consultation not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      consultation
    })

  } catch (error) {
    console.error('Error fetching consultation:', error)

    return NextResponse.json(
      {
        error: 'Failed to fetch consultation',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    )
  }
}
