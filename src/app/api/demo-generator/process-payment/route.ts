import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'
import { generateWithClaude } from '@/lib/demo-generator/claude-generator'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { sessionId } = body

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      )
    }

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    // Verify payment was successful
    if (session.payment_status !== 'paid') {
      return NextResponse.json(
        { error: 'Payment not completed' },
        { status: 400 }
      )
    }

    // Get demo project ID and tier from session metadata
    const demoProjectId = session.metadata?.demoProjectId || session.client_reference_id
    const tier = session.metadata?.tier

    if (!demoProjectId || !tier) {
      return NextResponse.json(
        { error: 'Invalid session metadata' },
        { status: 400 }
      )
    }

    // Get Supabase client with service role
    const supabase = getSupabase(true)

    // Fetch the demo project
    const { data: demoProject, error: fetchError } = await supabase
      .from('demo_projects' as any)
      .select('*')
      .eq('id', demoProjectId)
      .single() as any

    if (fetchError || !demoProject) {
      return NextResponse.json(
        { error: 'Demo project not found' },
        { status: 404 }
      )
    }

    // Check if expired
    if (new Date(demoProject.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'This demo has expired. Please contact support for a refund.' },
        { status: 410 }
      )
    }

    // Check if already has payment processed (prevent double processing)
    const customFields = demoProject.custom_fields as any
    if (customFields?.stripeSessionId === sessionId) {
      // Already processed, return existing data
      return NextResponse.json({
        success: true,
        demoProjectId: demoProject.id,
        html: demoProject.generated_html,
        businessName: demoProject.business_name,
        tier,
      })
    }

    // Generate AI-customized HTML using Claude
    console.log('Generating AI-customized HTML for paid demo:', demoProjectId)
    let customHTML: string

    try {
      customHTML = await generateWithClaude({
        businessName: demoProject.business_name,
        tagline: demoProject.tagline ?? undefined,
        phone: demoProject.phone ?? undefined,
        address: demoProject.address ?? undefined,
        city: demoProject.city ?? undefined,
        state: demoProject.state ?? undefined,
        zip: demoProject.zip ?? undefined,
        businessContactEmail: demoProject.business_contact_email ?? undefined,
        services: demoProject.services as any,
        colors: demoProject.colors as any,
      })
    } catch (claudeError: any) {
      console.error('Claude generation failed:', claudeError)
      return NextResponse.json(
        { error: 'AI customization failed. Please contact support for assistance.' },
        { status: 500 }
      )
    }

    // Update the demo project with AI-generated HTML and payment info
    const { error: updateError } = await supabase
      .from('demo_projects' as any)
      .update({
        generated_html: customHTML,
        status: 'generated',
        tier: tier,
        custom_fields: {
          ...(demoProject.custom_fields as any),
          stripeSessionId: sessionId,
          stripePaymentIntentId: session.payment_intent,
          tier,
          paidAt: new Date().toISOString(),
        },
      })
      .eq('id', demoProjectId)

    if (updateError) {
      console.error('Failed to update demo project:', updateError)
      // Don't fail here - we already charged them, just log the error
    }

    // TODO: Generate download token for magic link
    // This will be implemented in Phase 1 completion
    let downloadToken: string | null = null

    // Send email confirmation based on tier
    try {
      const emailType = tier === 'bundle' ? 'demo_bundle_confirmation' : 'demo_ai_confirmation'
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
      const downloadUrl = downloadToken
        ? `${baseUrl}/api/demo-generator/download?token=${downloadToken}`
        : null

      await fetch(`${baseUrl}/api/emails/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: demoProject.user_email,
          subject: tier === 'bundle'
            ? 'Your AI Demo + Code Bundle is Ready!'
            : 'Your AI-Customized Preview is Ready!',
          type: emailType,
          data: {
            businessName: demoProject.business_name,
            demoProjectId: demoProject.id,
            tier,
            downloadUrl,
          },
        }),
      })
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError)
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      demoProjectId: demoProject.id,
      html: customHTML,
      businessName: demoProject.business_name,
      tier,
    })
  } catch (error: any) {
    console.error('Error processing payment:', error)

    // Handle specific Stripe errors
    if (error.type === 'StripeInvalidRequestError') {
      return NextResponse.json(
        { error: 'Invalid session ID. Please contact support.' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
