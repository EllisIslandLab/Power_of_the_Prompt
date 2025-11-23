import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const token = searchParams.get('token')
    const sessionId = searchParams.get('session_id')

    if (!token && !sessionId) {
      return NextResponse.json(
        { error: 'Token or session ID is required' },
        { status: 400 }
      )
    }

    const supabase = getSupabase(true)

    let demoProjectId: string
    let userEmail: string

    // Option 1: Download via magic link token
    if (token) {
      // Temporarily disabled - will be implemented with Phase 1 migration
      return NextResponse.json(
        { error: 'Token-based downloads will be available soon' },
        { status: 501 }
      )
    }
    // Option 2: Download immediately after payment via Stripe session
    else if (sessionId) {
      // Import Stripe only if needed
      const Stripe = require('stripe')
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
        apiVersion: '2025-06-30.basil',
      })

      // Verify the session
      const session = await stripe.checkout.sessions.retrieve(sessionId)

      if (session.payment_status !== 'paid') {
        return NextResponse.json(
          { error: 'Payment not completed' },
          { status: 400 }
        )
      }

      demoProjectId = session.metadata?.demoProjectId || session.client_reference_id
      userEmail = session.customer_email || session.metadata?.userEmail

      if (!demoProjectId) {
        return NextResponse.json(
          { error: 'Invalid session metadata' },
          { status: 400 }
        )
      }
    } else {
      return NextResponse.json(
        { error: 'Invalid request' },
        { status: 400 }
      )
    }

    // Fetch the demo project
    const { data: demoProject, error: fetchError } = await supabase
      .from('demo_projects' as any)
      .select('*')
      .eq('id', demoProjectId)
      .single()

    if (fetchError || !demoProject) {
      return NextResponse.json(
        { error: 'Demo project not found' },
        { status: 404 }
      )
    }

    // Check if expired
    if (new Date(demoProject.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'This demo has expired. Please contact support.' },
        { status: 410 }
      )
    }

    const html = demoProject.generated_html

    if (!html) {
      return NextResponse.json(
        { error: 'No generated HTML found for this demo' },
        { status: 404 }
      )
    }

    // Prepare the HTML file for download
    const fileName = `${demoProject.business_name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-website.html`

    // Return the file as a download
    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    })
  } catch (error: any) {
    console.error('Error downloading code:', error)
    return NextResponse.json(
      { error: 'Failed to download code' },
      { status: 500 }
    )
  }
}

// POST endpoint for generating new download tokens
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { demoProjectId, userEmail } = body

    if (!demoProjectId || !userEmail) {
      return NextResponse.json(
        { error: 'Demo project ID and email are required' },
        { status: 400 }
      )
    }

    const supabase = getSupabase(true)

    // Verify demo exists and belongs to user
    const { data: demoProject, error: demoError } = await supabase
      .from('demo_projects' as any)
      .select('*')
      .eq('id', demoProjectId)
      .eq('user_email', userEmail)
      .single()

    if (demoError || !demoProject) {
      return NextResponse.json(
        { error: 'Demo project not found or unauthorized' },
        { status: 404 }
      )
    }

    // Temporarily disabled - will be implemented with Phase 1 migration
    return NextResponse.json(
      { error: 'Token generation will be available soon' },
      { status: 501 }
    )
  } catch (error: any) {
    console.error('Error creating download link:', error)
    return NextResponse.json(
      { error: 'Failed to create download link' },
      { status: 500 }
    )
  }
}
