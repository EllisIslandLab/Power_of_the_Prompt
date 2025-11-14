import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const { email, demoProjectId } = await req.json()

    // Validate input
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email address is required' },
        { status: 400 }
      )
    }

    if (!demoProjectId) {
      return NextResponse.json(
        { error: 'Demo project ID is required' },
        { status: 400 }
      )
    }

    // Get the demo project details to personalize tips
    const supabase = getSupabase(true)
    const { data: demoProject, error: dbError } = await supabase
      .from('demo_projects')
      .select('*')
      .eq('id', demoProjectId)
      .single()

    if (dbError || !demoProject) {
      return NextResponse.json(
        { error: 'Demo project not found' },
        { status: 404 }
      )
    }

    // Track interaction
    try {
      await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/demo-generator/track-interaction`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          demoProjectId,
          interactionType: 'requested_tips',
        }),
      })
    } catch (error) {
      console.error('Failed to track interaction:', error)
    }

    // Send personalized tips email
    try {
      await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/emails/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: email,
          subject: `Personalized Tips for ${demoProject.business_name}`,
          type: 'demo_personalized_tips',
          data: {
            businessName: demoProject.business_name,
            services: demoProject.services,
            colors: demoProject.colors,
            demoProjectId,
          },
        }),
      })
    } catch (emailError) {
      console.error('Failed to send tips email:', emailError)
      return NextResponse.json(
        { error: 'Failed to send tips email' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Personalized tips sent successfully',
    })
  } catch (error) {
    console.error('Error sending tips:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
