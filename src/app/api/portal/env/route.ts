import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { decrypt } from '@/lib/encryption'

/**
 * Generate .env.local file for the active project
 * Includes credentials from all connected services
 */
export async function GET(request: NextRequest) {
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
    // Get active project
    const { data: projects } = await supabase
      .from('client_projects')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .limit(1)

    if (!projects || projects.length === 0) {
      return NextResponse.json(
        { error: 'No active project found' },
        { status: 404 }
      )
    }

    const project = projects[0]

    // Get all service credentials (user-level and project-level)
    const { data: credentials } = await supabase
      .from('client_service_credentials')
      .select('*')
      .or(`and(user_id.eq.${user.id},project_id.is.null),and(user_id.eq.${user.id},project_id.eq.${project.id})`)
      .eq('is_valid', true)

    console.log('[Env Generator] Found credentials:', credentials?.length || 0)

    // Build environment variables
    const envVars: Record<string, string> = {}

    // Add project info
    envVars['# Project: '] = project.project_name
    envVars['# Generated: '] = new Date().toISOString()
    envVars[''] = ''

    // Process each service
    for (const cred of credentials || []) {
      const serviceName = cred.service_name.toUpperCase()

      switch (cred.service_name) {
        case 'vercel':
          envVars[`# Vercel`] = ''
          if (cred.access_token_encrypted) {
            const token = decrypt(cred.access_token_encrypted)
            envVars['VERCEL_TOKEN'] = token
            if (cred.metadata?.vercel_team_id) {
              envVars['VERCEL_TEAM_ID'] = cred.metadata.vercel_team_id
            }
          }
          envVars[' '] = ''
          break

        case 'github':
          envVars[`# GitHub`] = ''
          if (cred.access_token_encrypted) {
            const token = decrypt(cred.access_token_encrypted)
            envVars['GITHUB_TOKEN'] = token
          }
          envVars['  '] = ''
          break

        case 'supabase':
          envVars[`# Supabase`] = ''
          if (cred.metadata?.url) {
            envVars['NEXT_PUBLIC_SUPABASE_URL'] = cred.metadata.url
          }
          if (cred.api_key_encrypted) {
            const anonKey = decrypt(cred.api_key_encrypted)
            envVars['NEXT_PUBLIC_SUPABASE_ANON_KEY'] = anonKey
          }
          if (cred.api_secret_encrypted) {
            const serviceRole = decrypt(cred.api_secret_encrypted)
            envVars['SUPABASE_SERVICE_ROLE_KEY'] = serviceRole
          }
          envVars['   '] = ''
          break

        case 'stripe':
          envVars[`# Stripe`] = ''
          if (cred.metadata?.publishable_key) {
            envVars['NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY'] = cred.metadata.publishable_key
          }
          if (cred.api_secret_encrypted) {
            const secret = decrypt(cred.api_secret_encrypted)
            envVars['STRIPE_SECRET_KEY'] = secret
          }
          if (cred.metadata?.webhook_secret) {
            envVars['STRIPE_WEBHOOK_SECRET'] = cred.metadata.webhook_secret
          }
          envVars['    '] = ''
          break

        case 'airtable':
          envVars[`# Airtable`] = ''
          if (cred.api_key_encrypted) {
            const token = decrypt(cred.api_key_encrypted)
            envVars['AIRTABLE_API_KEY'] = token
          }
          if (cred.metadata?.baseId) {
            envVars['AIRTABLE_BASE_ID'] = cred.metadata.baseId
          }
          envVars['     '] = ''
          break

        default:
          // Generic service
          envVars[`# ${serviceName}`] = ''
          if (cred.access_token_encrypted) {
            const token = decrypt(cred.access_token_encrypted)
            envVars[`${serviceName}_TOKEN`] = token
          }
          break
      }
    }

    // Format as .env file
    const envContent = Object.entries(envVars)
      .map(([key, value]) => {
        if (key.startsWith('#')) {
          return key + value // Comments
        }
        if (key.trim() === '') {
          return '' // Empty lines
        }
        return `${key}="${value}"`
      })
      .join('\n')

    // Return as downloadable file
    return new NextResponse(envContent, {
      headers: {
        'Content-Type': 'text/plain',
        'Content-Disposition': `attachment; filename=".env.local"`,
      },
    })
  } catch (error: any) {
    console.error('[Env Generator] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate environment file' },
      { status: 500 }
    )
  }
}
