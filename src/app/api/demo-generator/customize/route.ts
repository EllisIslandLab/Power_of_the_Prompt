import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'
import { generateWithClaude } from '@/lib/demo-generator/claude-generator'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { demoProjectId } = body

    if (!demoProjectId) {
      return NextResponse.json(
        { error: 'Demo project ID is required' },
        { status: 400 }
      )
    }

    // Get Supabase client with service role
    const supabase = getSupabase(true)

    // Fetch the demo project
    const { data: demoProject, error: fetchError } = await supabase
      .from('demo_projects')
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
        { error: 'This demo has expired. Please create a new one.' },
        { status: 410 }
      )
    }

    // Check if any service has enhancement details
    const services = demoProject.services as any[]
    const hasEnhancementDetails = services.some(
      (s: any) => s.additionalDetails && s.additionalDetails.trim().length > 0
    )

    if (!hasEnhancementDetails) {
      return NextResponse.json(
        { error: 'Please add AI enhancement details to at least one service to enable AI customization.' },
        { status: 400 }
      )
    }

    console.log('Generating AI-customized HTML for demo project:', demoProjectId)

    // Generate custom HTML using Claude AI
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
        { error: 'AI customization failed. Please try again or contact support.' },
        { status: 500 }
      )
    }

    // Update the demo project with AI-generated HTML
    const { error: updateError } = await supabase
      .from('demo_projects')
      .update({
        generated_html: customHTML,
        status: 'generated', // Update status to show it's been customized
      })
      .eq('id', demoProjectId)

    if (updateError) {
      console.error('Failed to update demo project:', updateError)
      return NextResponse.json(
        { error: 'Failed to save customized HTML' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      html: customHTML,
      demoProjectId: demoProjectId,
    })
  } catch (error) {
    console.error('Error customizing demo:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
