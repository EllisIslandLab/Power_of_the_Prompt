import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { id: sessionId } = await params
    const formData = await req.json()

    const supabase = getSupabase(true)

    // Get session
    const { data: session, error: fetchError } = await supabase
      .from('demo_projects')
      .select('*')
      .eq('id', sessionId)
      .single()

    if (fetchError || !session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    // TODO: Integrate with AI to generate actual preview
    // For now, generate a placeholder preview based on form data

    const previewHtml = generatePlaceholderPreview(formData)

    // Update session with preview
    const { error: updateError } = await supabase
      .from('demo_projects')
      .update({
        preview_html: previewHtml,
        preview_generated_at: new Date().toISOString(),
        form_data: formData,
        business_name: formData.businessName,
        tagline: formData.tagline,
        primary_service: formData.primaryService,
        target_audience: formData.targetAudience,
        num_sections: formData.numSections,
        color_palette: formData.colorPalette,
        category_id: formData.categoryId,
        subcategory_id: formData.subcategoryId,
        custom_category: formData.customCategory
      })
      .eq('id', sessionId)

    if (updateError) {
      console.error('Error updating session:', updateError)
      throw updateError
    }

    return NextResponse.json({ previewHtml })

  } catch (error) {
    console.error('Error generating preview:', error)
    return NextResponse.json(
      { error: 'Failed to generate preview' },
      { status: 500 }
    )
  }
}

function generatePlaceholderPreview(data: any): string {
  const colors = getColorPalette(data.colorPalette || 'professional')

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.businessName || 'Your Website'}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui, -apple-system, sans-serif; color: ${colors.text}; }

    .header {
      background: ${colors.primary};
      color: white;
      padding: 1.5rem 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .header h1 { font-size: 1.5rem; }
    .header nav { display: flex; gap: 1.5rem; }
    .header nav a { color: white; text-decoration: none; font-size: 0.9rem; }

    .hero {
      background: linear-gradient(135deg, ${colors.primary}, ${colors.secondary});
      color: white;
      padding: 4rem 2rem;
      text-align: center;
    }
    .hero h2 { font-size: 2.5rem; margin-bottom: 1rem; }
    .hero p { font-size: 1.1rem; opacity: 0.9; max-width: 600px; margin: 0 auto 2rem; }
    .hero button {
      background: white;
      color: ${colors.primary};
      border: none;
      padding: 0.75rem 2rem;
      font-size: 1rem;
      font-weight: 600;
      border-radius: 0.5rem;
      cursor: pointer;
    }

    .section {
      padding: 3rem 2rem;
      text-align: center;
    }
    .section:nth-child(even) { background: ${colors.background}; }
    .section h3 { font-size: 1.75rem; margin-bottom: 1rem; color: ${colors.primary}; }
    .section p { color: #666; max-width: 700px; margin: 0 auto; }

    .footer {
      background: ${colors.primary};
      color: white;
      padding: 2rem;
      text-align: center;
    }
    .footer p { opacity: 0.8; font-size: 0.9rem; }
  </style>
</head>
<body>
  <header class="header">
    <h1>${data.businessName || 'Your Business'}</h1>
    <nav>
      <a href="#">Home</a>
      <a href="#">Services</a>
      <a href="#">About</a>
      <a href="#">Contact</a>
    </nav>
  </header>

  <section class="hero">
    <h2>${data.tagline || 'Your Compelling Tagline Here'}</h2>
    <p>${data.primaryService || 'Describe your main service or product that helps your target audience achieve their goals.'}</p>
    <button>Get Started</button>
  </section>

  <section class="section">
    <h3>Our Services</h3>
    <p>We provide tailored solutions for ${data.targetAudience || 'our valued clients'}. Our expertise helps you achieve measurable results.</p>
  </section>

  <section class="section">
    <h3>Why Choose Us</h3>
    <p>With years of experience and a commitment to excellence, we deliver results that matter to your business.</p>
  </section>

  <section class="section">
    <h3>Get In Touch</h3>
    <p>Ready to take the next step? Contact us today to discuss how we can help you succeed.</p>
  </section>

  <footer class="footer">
    <p>&copy; ${new Date().getFullYear()} ${data.businessName || 'Your Business'}. All rights reserved.</p>
  </footer>
</body>
</html>
  `
}

function getColorPalette(palette: string) {
  const palettes: Record<string, { primary: string; secondary: string; background: string; text: string }> = {
    professional: { primary: '#1e3a8a', secondary: '#3b82f6', background: '#f8fafc', text: '#1e293b' },
    modern: { primary: '#18181b', secondary: '#6366f1', background: '#f4f4f5', text: '#18181b' },
    warm: { primary: '#7c2d12', secondary: '#f97316', background: '#fffbeb', text: '#292524' },
    nature: { primary: '#14532d', secondary: '#22c55e', background: '#f0fdf4', text: '#14532d' },
    elegant: { primary: '#1c1917', secondary: '#a8a29e', background: '#fafaf9', text: '#1c1917' },
    vibrant: { primary: '#be185d', secondary: '#f472b6', background: '#fdf2f8', text: '#831843' },
  }

  return palettes[palette] || palettes.professional
}
