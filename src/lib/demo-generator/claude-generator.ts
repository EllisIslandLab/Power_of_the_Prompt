import Anthropic from '@anthropic-ai/sdk'

interface Service {
  title: string
  description: string
  additionalDetails?: string
}

interface ClaudeGeneratorInput {
  businessName: string
  tagline?: string
  phone?: string
  address?: string
  city?: string
  state?: string
  zip?: string
  businessContactEmail?: string
  services: Service[]
  colors: {
    primary: string
    secondary: string
    accent: string
  }
}

export async function generateWithClaude(data: ClaudeGeneratorInput): Promise<string> {
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY!,
  })

  const {
    businessName,
    tagline,
    phone,
    address,
    city,
    state,
    zip,
    businessContactEmail,
    services,
    colors,
  } = data

  const fullAddress = [address, city, state, zip].filter(Boolean).join(', ')

  const prompt = `You are an expert web designer creating a custom, professional website. Generate a complete, production-ready HTML page with the following requirements:

BUSINESS INFORMATION:
- Business Name: ${businessName}
${tagline ? `- Tagline: ${tagline}` : ''}
${phone ? `- Phone: ${phone}` : ''}
${businessContactEmail ? `- Email: ${businessContactEmail}` : ''}
${fullAddress ? `- Address: ${fullAddress}` : ''}

SERVICES WITH ENHANCEMENT DETAILS:
${services.map((s, i) => `${i + 1}. ${s.title}: ${s.description}${s.additionalDetails ? `\n   ✨ AI Enhancement: ${s.additionalDetails}` : ''}`).join('\n')}

COLOR SCHEME:
- Primary: ${colors.primary}
- Secondary: ${colors.secondary}
- Accent: ${colors.accent}

REQUIREMENTS:
1. Create a complete, modern, responsive HTML page with embedded CSS and JavaScript
2. Use the provided color scheme throughout
3. Include these sections in order:
   - Header with navigation (Services, About, Schedule, Contact)
   - Hero section with business name, tagline, and prominent CTA
   - Services section showcasing all ${services.length} services
   - About section (create compelling copy based on the business type and client vision)
   - Calendar/Schedule section with demo booking interface
   - Contact section with contact info and a contact form
   - Footer
4. For the calendar section: Create time slot buttons that call showFeatureModal() when clicked
5. For the contact form: Set onsubmit="showFeatureModal(); return false;"
6. Make the services section engaging - each service should have visual appeal and connect to booking
7. Pay special attention to services with AI Enhancement details - implement those specific features and functionality requests (calendar modals, booking systems, payment processing hints, database integration references, etc.)
8. Add smooth scrolling for navigation links
9. Make it mobile-responsive
10. Use modern CSS with gradients, shadows, and animations where appropriate
11. The design should feel UNIQUE and tailored to this specific business based on the service enhancement details provided

IMPORTANT: Return ONLY the complete HTML code, no explanations or markdown. Start with <!DOCTYPE html> and end with </html>. The HTML must be complete and ready to display in an iframe.`

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  })

  const htmlContent = message.content[0].type === 'text' ? message.content[0].text : ''

  // Clean up any markdown code blocks that Claude might add
  let cleanedHTML = htmlContent.trim()
  if (cleanedHTML.startsWith('```html')) {
    cleanedHTML = cleanedHTML.replace(/^```html\n/, '').replace(/\n```$/, '')
  } else if (cleanedHTML.startsWith('```')) {
    cleanedHTML = cleanedHTML.replace(/^```\n/, '').replace(/\n```$/, '')
  }

  return cleanedHTML
}
