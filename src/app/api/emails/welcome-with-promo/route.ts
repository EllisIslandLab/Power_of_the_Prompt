import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'
import { ResendAdapter } from '@/adapters/ResendAdapter'

/**
 * Send Welcome Email with Auto-Generated Promo Codes
 *
 * This endpoint:
 * 1. Generates two unique promo codes (Course 90% off, Guarantee $240 off)
 * 2. Sends personalized welcome email with both codes
 * 3. Tracks promo codes in database with 72-hour expiration
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userEmail, userName, userId, source = 'signup' } = body

    if (!userEmail || !userName) {
      return NextResponse.json(
        { error: 'User email and name are required' },
        { status: 400 }
      )
    }

    const supabase = getSupabase(true) // Use service role
    const resend = ResendAdapter.getInstance()

    // ============================================
    // 1. Generate Promo Codes via API
    // ============================================

    const promoResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/promo-codes/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userEmail, userName, userId })
    })

    if (!promoResponse.ok) {
      throw new Error('Failed to generate promo codes')
    }

    const promoData = await promoResponse.json()
    const { promo_codes, expiration_formatted } = promoData

    // ============================================
    // 2. Get Welcome Email Template
    // ============================================

    const { data: template } = await supabase
      .from('email_templates')
      .select('*')
      .eq('name', 'Welcome Series - Email 1')
      .single()

    if (!template) {
      throw new Error('Welcome email template not found')
    }

    // ============================================
    // 3. Build Email Content with Promo Codes
    // ============================================

    // Parse the existing template and enhance it with promo codes
    const enhancedContent = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2>Welcome to Web Launch Academy, ${userName}!</h2>

  <p>Thank you for your interest in learning web development. You're about to embark on an exciting journey to build your own professional website.</p>

  <!-- PROMO CODE SECTION -->
  <div style="background-color: #ffdb57; padding: 25px; border-radius: 10px; margin: 25px 0; text-align: center; border: 3px solid #11296b;">
    <h3 style="color: #11296b; font-size: 22px; margin: 0 0 10px 0;">🎁 Your Exclusive Welcome Discount</h3>
    <p style="color: #11296b; margin: 0 0 15px 0; font-size: 16px;">
      These special codes expire in <strong>72 hours</strong>!
    </p>
    <p style="color: #e74c3c; font-weight: 600; margin: 0 0 20px 0; font-size: 14px;">
      ⏰ Expires: ${expiration_formatted}
    </p>

    <!-- Course Promo -->
    <div style="background-color: white; padding: 20px; border-radius: 8px; margin-bottom: 15px;">
      <h4 style="color: #11296b; margin: 0 0 10px 0;">8-Week Full Course</h4>
      <p style="margin: 0 0 10px 0; color: #2c3e50;"><strong>FREE</strong> (90% off)</p>
      <div style="background: #f8f9fa; padding: 12px; border-radius: 6px; margin: 10px 0;">
        <p style="margin: 0; font-size: 12px; color: #666; text-transform: uppercase;">Your Code:</p>
        <p style="margin: 5px 0 0 0; font-size: 24px; font-weight: 700; color: #11296b; letter-spacing: 2px;">
          ${promo_codes.course.code}
        </p>
      </div>
      <a href="${promo_codes.course.pricing_url}"
         style="background-color: #11296b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; margin-top: 10px;">
        Claim Free Course →
      </a>
    </div>

    <!-- Guarantee Promo -->
    <div style="background-color: white; padding: 20px; border-radius: 8px;">
      <h4 style="color: #11296b; margin: 0 0 10px 0;">A+ Guarantee Program</h4>
      <p style="margin: 0 0 10px 0; color: #2c3e50;"><strong>$240 OFF</strong> ($497 → $257)</p>
      <div style="background: #f8f9fa; padding: 12px; border-radius: 6px; margin: 10px 0;">
        <p style="margin: 0; font-size: 12px; color: #666; text-transform: uppercase;">Your Code:</p>
        <p style="margin: 5px 0 0 0; font-size: 24px; font-weight: 700; color: #11296b; letter-spacing: 2px;">
          ${promo_codes.guarantee.code}
        </p>
      </div>
      <a href="${promo_codes.guarantee.pricing_url}"
         style="background-color: #11296b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; margin-top: 10px;">
        Get $240 Off →
      </a>
    </div>

    <p style="color: #11296b; margin: 15px 0 0 0; font-size: 13px; font-style: italic;">
      💡 Pro tip: Book a consultation first to choose the best option for you!
    </p>
  </div>

  <!-- FREE CONSULTATION -->
  <div style="background-color: #e8f5e9; padding: 25px; border-radius: 10px; margin: 25px 0; text-align: center; border-left: 4px solid #2e7d32;">
    <h3 style="color: #2e7d32; font-size: 20px; margin-bottom: 15px;">🎯 Free 1-on-1 Consultation</h3>
    <p style="color: #2e7d32; margin-bottom: 15px; line-height: 1.6;">
      Want to learn more about what to expect in the course? Schedule your free consultation with Matthew!
    </p>
    <a href="https://weblaunchacademy.com/consultation"
       style="background-color: #2e7d32; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">
      Book Your Free Call
    </a>
    <p style="color: #1b5e20; margin: 15px 0 0 0; font-size: 13px;">
      📅 Next 72 hours highlighted in green - perfect timing for your promo codes!
    </p>
  </div>

  <!-- WHAT'S NEXT -->
  <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <h3>What's Next?</h3>
    <ul style="line-height: 1.8;">
      <li>🎯 Book your free consultation (highly recommended!)</li>
      <li>💰 Use your promo codes within 72 hours</li>
      <li>📚 Access comprehensive course materials</li>
      <li>🤝 Get one-on-one coaching sessions</li>
      <li>💼 Build your professional online presence</li>
    </ul>
  </div>

  <!-- PORTAL ACCESS -->
  <div style="text-align: center; margin: 30px 0;">
    <a href="https://weblaunchacademy.com/portal"
       style="background-color: #ffdb57; color: #11296b; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">
      Access Your Portal
    </a>
  </div>

  <!-- FOOTER -->
  <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 30px;">
    <p style="color: #475569; font-size: 14px; margin-bottom: 10px;">
      Questions? Just reply to this email - I personally read and respond to every message.
    </p>
    <p style="color: #475569; font-size: 14px; margin: 0;">
      Best regards,<br>
      <strong>Matthew Ellis</strong><br>
      Founder, Web Launch Academy<br>
      <a href="tel:4403549904" style="color: #475569; text-decoration: none;">(440) 354-9904</a>
    </p>
  </div>

  <p style="text-align: center; font-style: italic; color: #11296b; font-weight: 600; margin-top: 30px;">
    - Build Once, Own Forever! -
  </p>

  <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">

  <p style="color: #666; font-size: 12px; text-align: center;">
    You received this email because you signed up for Web Launch Academy.<br>
    Questions or feedback? Email us at <a href="mailto:hello@weblaunchacademy.com" style="color: #666;">hello@weblaunchacademy.com</a>
  </p>
</div>
    `

    // ============================================
    // 4. Send Email
    // ============================================

    await resend.sendEmail({
      to: userEmail,
      from: 'Web Launch Academy <hello@weblaunchacademy.com>',
      subject: `Welcome to Web Launch Academy, ${userName}! (Exclusive 72-Hour Offer Inside)`,
      html: enhancedContent
    })

    // ============================================
    // 5. Track Email Send
    // ============================================

    // Update lead record if exists
    await supabase
      .from('leads')
      .update({
        last_engagement: new Date().toISOString(),
        tags: supabase.rpc('array_append', { arr: 'tags', elem: 'welcome_sent' })
      })
      .eq('email', userEmail)

    return NextResponse.json({
      success: true,
      message: 'Welcome email sent with promo codes',
      promo_codes: {
        course: promo_codes.course.code,
        guarantee: promo_codes.guarantee.code
      },
      expires_at: expiration_formatted
    })

  } catch (error) {
    console.error('Error sending welcome email:', error)

    return NextResponse.json(
      {
        error: 'Failed to send welcome email',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    )
  }
}
