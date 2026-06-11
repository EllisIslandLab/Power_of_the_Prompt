import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { decrypt } from '@/lib/encryption'

/**
 * Detect services from Vercel environment variables
 * Reads env vars from user's Vercel project and detects which services are configured
 */
export async function POST(request: NextRequest) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    const { projectId } = await request.json()

    // Get active project if no projectId provided
    let targetProjectId = projectId
    if (!targetProjectId) {
      const { data: projects } = await supabase
        .from('client_projects')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .limit(1)

      if (!projects || projects.length === 0) {
        return NextResponse.json(
          { error: 'No active project found' },
          { status: 404 }
        )
      }

      targetProjectId = projects[0].id
    }

    // Get Vercel credentials
    const { data: vercelCred } = await supabase
      .from('client_service_credentials')
      .select('*')
      .eq('user_id', user.id)
      .eq('service_name', 'vercel')
      .or(`project_id.eq.${targetProjectId},project_id.is.null`)
      .single()

    if (!vercelCred || !vercelCred.access_token_encrypted) {
      return NextResponse.json(
        { error: 'Vercel not connected. Please connect Vercel first.' },
        { status: 400 }
      )
    }

    const vercelToken = decrypt(vercelCred.access_token_encrypted)
    const vercelProjectId = vercelCred.metadata?.vercel_project_id

    if (!vercelProjectId) {
      return NextResponse.json(
        { error: 'Vercel project not configured' },
        { status: 400 }
      )
    }

    // Fetch environment variables from Vercel API
    const envVarsUrl = `https://api.vercel.com/v9/projects/${vercelProjectId}/env`
    const envResponse = await fetch(envVarsUrl, {
      headers: {
        'Authorization': `Bearer ${vercelToken}`,
        'Content-Type': 'application/json'
      }
    })

    if (!envResponse.ok) {
      console.error('[Detect Services] Vercel API error:', await envResponse.text())
      return NextResponse.json(
        { error: 'Failed to fetch environment variables from Vercel' },
        { status: 500 }
      )
    }

    const envData = await envResponse.json()
    const envVars = envData.envs || []

    console.log(`[Detect Services] Found ${envVars.length} env vars in Vercel project`)

    // Extract env var keys
    const envKeys = envVars.map((env: any) => env.key)

    // Detect services from env var patterns
    const detectedServices = new Set<string>()

    for (const key of envKeys) {
      if (key.includes('SUPABASE')) detectedServices.add('supabase')
      if (key.includes('STRIPE')) detectedServices.add('stripe')
      if (key.includes('AIRTABLE')) detectedServices.add('airtable')
      if (key.includes('RESEND')) detectedServices.add('resend')
      if (key.includes('CLERK')) detectedServices.add('clerk')
      if (key.includes('OPENAI')) detectedServices.add('openai')
      if (key.includes('ANTHROPIC') || key.includes('CLAUDE')) detectedServices.add('anthropic')
      if (key.includes('SENDGRID')) detectedServices.add('sendgrid')
      if (key.includes('TWILIO')) detectedServices.add('twilio')
      if (key.includes('GOOGLE') && !key.includes('ANALYTICS')) detectedServices.add('google')
    }

    console.log('[Detect Services] Detected:', Array.from(detectedServices))

    // Build service details with required env vars
    const serviceConfigs: Record<string, { required: string[], optional: string[], detected: string[] }> = {
      supabase: {
        required: ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY'],
        optional: [],
        detected: []
      },
      stripe: {
        required: ['STRIPE_SECRET_KEY', 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY'],
        optional: ['STRIPE_WEBHOOK_SECRET'],
        detected: []
      },
      airtable: {
        required: ['AIRTABLE_API_KEY'],
        optional: ['AIRTABLE_BASE_ID'],
        detected: []
      },
      resend: {
        required: ['RESEND_API_KEY'],
        optional: ['RESEND_FROM_EMAIL'],
        detected: []
      },
      clerk: {
        required: ['NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY', 'CLERK_SECRET_KEY'],
        optional: [],
        detected: []
      },
      openai: {
        required: ['OPENAI_API_KEY'],
        optional: ['OPENAI_ORGANIZATION_ID'],
        detected: []
      },
      anthropic: {
        required: ['ANTHROPIC_API_KEY'],
        optional: [],
        detected: []
      },
      sendgrid: {
        required: ['SENDGRID_API_KEY'],
        optional: ['SENDGRID_FROM_EMAIL'],
        detected: []
      },
      twilio: {
        required: ['TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN'],
        optional: ['TWILIO_PHONE_NUMBER'],
        detected: []
      },
      google: {
        required: ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'],
        optional: [],
        detected: []
      }
    }

    // Check which required vars exist
    for (const service of Array.from(detectedServices)) {
      const config = serviceConfigs[service]
      if (config) {
        config.detected = envKeys.filter((key: string) =>
          config.required.some(req => key === req) ||
          config.optional.some(opt => key === opt)
        )
      }
    }

    // Build response
    const services = Array.from(detectedServices).map(serviceName => {
      const config = serviceConfigs[serviceName]
      const hasAllRequired = config.required.every(req => envKeys.includes(req))

      return {
        name: serviceName,
        detected: true,
        configured: hasAllRequired,
        confidence: hasAllRequired ? 'high' : 'medium',
        requiredVars: config.required,
        optionalVars: config.optional,
        detectedVars: config.detected,
        missingVars: config.required.filter(req => !envKeys.includes(req))
      }
    })

    return NextResponse.json({
      success: true,
      projectId: targetProjectId,
      vercelProjectId,
      services,
      totalEnvVars: envVars.length
    })
  } catch (error: any) {
    console.error('[Detect Services] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to detect services' },
      { status: 500 }
    )
  }
}
