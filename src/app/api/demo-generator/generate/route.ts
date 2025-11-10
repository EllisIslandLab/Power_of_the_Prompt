import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'
import { generateRamseyCoachHTML } from '@/lib/demo-generator/ramsey-coach-template'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { templateId, ...formData } = body

    // Validate required fields
    if (!formData.businessName || !formData.userEmail) {
      return NextResponse.json(
        { error: 'Business name and email are required' },
        { status: 400 }
      )
    }

    if (!formData.services || formData.services.length < 1 || formData.services.length > 5) {
      return NextResponse.json(
        { error: 'Please provide 1-5 services' },
        { status: 400 }
      )
    }

    // Get Supabase client with service role
    const supabase = getSupabase(true)

    // Generate HTML using the template generator
    const generatedHTML = generateRamseyCoachHTML({
      businessName: formData.businessName,
      tagline: formData.tagline || '',
      phone: formData.phone || '',
      address: formData.address || '',
      city: formData.city || '',
      state: formData.state || '',
      zip: formData.zip || '',
      businessContactEmail: formData.businessContactEmail || '',
      services: formData.services,
      colors: {
        primary: formData.primaryColor,
        secondary: formData.secondaryColor,
        accent: formData.accentColor,
      },
    })

    // Create demo project in database
    const { data: demoProject, error: dbError } = await supabase
      .from('demo_projects')
      .insert({
        template_id: templateId,
        user_email: formData.userEmail,
        business_contact_email: formData.businessContactEmail || null,
        business_name: formData.businessName,
        tagline: formData.tagline || null,
        phone: formData.phone || null,
        address: formData.address || null,
        city: formData.city || null,
        state: formData.state || null,
        zip: formData.zip || null,
        services: formData.services,
        colors: {
          primary: formData.primaryColor,
          secondary: formData.secondaryColor,
          accent: formData.accentColor,
        },
        generated_html: generatedHTML,
        status: 'generated',
      })
      .select('id')
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json(
        { error: 'Failed to save demo project' },
        { status: 500 }
      )
    }

    // Send email notification to admin
    try {
      await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/emails/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: 'hello@weblaunchacademy.com',
          subject: `New Demo Submission: ${formData.businessName}`,
          type: 'admin_demo_notification',
          data: {
            businessName: formData.businessName,
            userEmail: formData.userEmail,
            demoProjectId: demoProject.id,
          },
        }),
      })
    } catch (emailError) {
      // Log but don't fail the request if email fails
      console.error('Failed to send admin notification email:', emailError)
    }

    // Send confirmation email to user
    try {
      await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/emails/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: formData.userEmail,
          subject: 'Your Website Preview is Ready!',
          type: 'demo_confirmation',
          data: {
            businessName: formData.businessName,
            demoProjectId: demoProject.id,
          },
        }),
      })
    } catch (emailError) {
      // Log but don't fail the request if email fails
      console.error('Failed to send confirmation email:', emailError)
    }

    return NextResponse.json({
      success: true,
      demoProjectId: demoProject.id,
      html: generatedHTML,
      businessName: formData.businessName,
    })
  } catch (error) {
    console.error('Error generating demo:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
