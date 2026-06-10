import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getInstallationToken } from '@/lib/integrations/github'

/**
 * Detect services used in a repository by reading .env.example
 * Parses environment variables to determine which services the project needs
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
    const { repositoryId } = await request.json()

    if (!repositoryId) {
      return NextResponse.json(
        { error: 'Repository ID required' },
        { status: 400 }
      )
    }

    // Get repository details
    const { data: repo } = await supabase
      .from('github_repositories')
      .select('*')
      .eq('id', repositoryId)
      .single()

    if (!repo) {
      return NextResponse.json(
        { error: 'Repository not found' },
        { status: 404 }
      )
    }

    // Get installation access token to fetch files
    const installationToken = await getInstallationToken(repo.installation_id)

    // Try to fetch .env.example or .env.local.example
    let envContent = ''
    const envFiles = ['.env.example', '.env.local.example', '.env.template']

    for (const envFile of envFiles) {
      try {
        const response = await fetch(
          `https://api.github.com/repos/${repo.full_name}/contents/${envFile}?ref=${repo.default_branch}`,
          {
            headers: {
              'Authorization': `Bearer ${installationToken}`,
              'Accept': 'application/vnd.github.v3.raw',
              'User-Agent': 'Web-Launch-Academy'
            }
          }
        )

        if (response.ok) {
          envContent = await response.text()
          console.log(`[Detect Services] Found ${envFile}`)
          break
        }
      } catch (err) {
        console.log(`[Detect Services] ${envFile} not found, trying next...`)
      }
    }

    // Parse env vars to detect services
    const detectedServices = new Set<string>()
    const envVarsNeeded: string[] = []

    if (envContent) {
      const lines = envContent.split('\n')
      for (const line of lines) {
        const trimmed = line.trim()

        // Skip comments and empty lines
        if (!trimmed || trimmed.startsWith('#')) continue

        // Extract variable name
        const match = trimmed.match(/^([A-Z_][A-Z0-9_]*)=?/)
        if (match) {
          const varName = match[1]
          envVarsNeeded.push(varName)

          // Detect services from env var patterns
          if (varName.includes('AIRTABLE')) detectedServices.add('airtable')
          if (varName.includes('SUPABASE')) detectedServices.add('supabase')
          if (varName.includes('VERCEL')) detectedServices.add('vercel')
          if (varName.includes('STRIPE')) detectedServices.add('stripe')
          if (varName.includes('RESEND')) detectedServices.add('resend')
          if (varName.includes('CLERK')) detectedServices.add('clerk')
          if (varName.includes('OPENAI')) detectedServices.add('openai')
          if (varName.includes('ANTHROPIC') || varName.includes('CLAUDE')) detectedServices.add('anthropic')
        }
      }
    }

    console.log('[Detect Services] Detected from env:', Array.from(detectedServices))

    // Detect framework based on language
    let framework = {
      name: 'Unknown',
      type: 'unknown',
      version: undefined
    }

    if (repo.language === 'JavaScript' || repo.language === 'TypeScript') {
      framework = {
        name: 'Next.js',
        type: 'nextjs',
        version: undefined
      }
    }

    // Build services array with credentials mapping
    const serviceCredentials: Record<string, { required: string[], optional: string[] }> = {
      airtable: {
        required: ['api_key', 'base_id'],
        optional: []
      },
      supabase: {
        required: ['url', 'anon_key', 'service_role_key'],
        optional: []
      },
      vercel: {
        required: ['access_token'],
        optional: ['team_id']
      },
      stripe: {
        required: ['secret_key', 'publishable_key'],
        optional: ['webhook_secret']
      },
      resend: {
        required: ['api_key'],
        optional: []
      },
      clerk: {
        required: ['publishable_key', 'secret_key'],
        optional: []
      },
      openai: {
        required: ['api_key'],
        optional: ['organization_id']
      },
      anthropic: {
        required: ['api_key'],
        optional: []
      }
    }

    type DetectedService = {
      name: string
      confidence: 'high' | 'medium' | 'low'
      detected: boolean
      requiredCredentials: string[]
      optionalCredentials: string[]
    }

    const services: DetectedService[] = Array.from(detectedServices).map(serviceName => ({
      name: serviceName,
      confidence: 'high' as const,
      detected: true,
      requiredCredentials: serviceCredentials[serviceName]?.required || [],
      optionalCredentials: serviceCredentials[serviceName]?.optional || []
    }))

    // If no services detected, provide common defaults
    if (services.length === 0) {
      services.push(
        {
          name: 'airtable',
          confidence: 'medium' as const,
          detected: false,
          requiredCredentials: ['api_key', 'base_id'],
          optionalCredentials: []
        },
        {
          name: 'supabase',
          confidence: 'medium' as const,
          detected: false,
          requiredCredentials: ['url', 'anon_key', 'service_role_key'],
          optionalCredentials: []
        }
      )
    }

    const analysis = {
      framework,
      services,
      packageManager: 'npm',
      envVarsNeeded,
      recommendations: services.map(s => `Connect ${s.name} for your project`)
    }

    return NextResponse.json({
      success: true,
      analysis
    })
  } catch (error: any) {
    console.error('[Detect Services] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to analyze repository' },
      { status: 500 }
    )
  }
}
