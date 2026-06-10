import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { decrypt } from '@/lib/encryption'

/**
 * Sync API - Returns environment variables as JSON
 * Used by @weblaunchacademy/env-sync package
 */
export async function GET(request: NextRequest) {
  try {
    // Get auth token from header
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json(
        { error: 'Authorization token required' },
        { status: 401 }
      )
    }

    // Verify token and get user
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

    // Use the token to authenticate
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

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

    // Get all service credentials
    const { data: credentials } = await supabase
      .from('client_service_credentials')
      .select('*')
      .or(`and(user_id.eq.${user.id},project_id.is.null),and(user_id.eq.${user.id},project_id.eq.${project.id})`)
      .eq('is_valid', true)

    console.log('[Env Sync] Found credentials:', credentials?.length || 0)

    // Build environment variables object
    const envVars: Record<string, string> = {}

    // Process each service
    for (const cred of credentials || []) {
      switch (cred.service_name) {
        case 'vercel':
          if (cred.access_token_encrypted) {
            envVars['VERCEL_TOKEN'] = decrypt(cred.access_token_encrypted)
            if (cred.metadata?.vercel_team_id) {
              envVars['VERCEL_TEAM_ID'] = cred.metadata.vercel_team_id
            }
          }
          break

        case 'github':
          if (cred.access_token_encrypted) {
            envVars['GITHUB_TOKEN'] = decrypt(cred.access_token_encrypted)
          }
          break

        case 'supabase':
          if (cred.metadata?.url) {
            envVars['NEXT_PUBLIC_SUPABASE_URL'] = cred.metadata.url
          }
          if (cred.api_key_encrypted) {
            envVars['NEXT_PUBLIC_SUPABASE_ANON_KEY'] = decrypt(cred.api_key_encrypted)
          }
          if (cred.api_secret_encrypted) {
            envVars['SUPABASE_SERVICE_ROLE_KEY'] = decrypt(cred.api_secret_encrypted)
          }
          break

        case 'stripe':
          if (cred.metadata?.publishable_key) {
            envVars['NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY'] = cred.metadata.publishable_key
          }
          if (cred.api_secret_encrypted) {
            envVars['STRIPE_SECRET_KEY'] = decrypt(cred.api_secret_encrypted)
          }
          if (cred.metadata?.webhook_secret) {
            envVars['STRIPE_WEBHOOK_SECRET'] = cred.metadata.webhook_secret
          }
          break

        case 'airtable':
          if (cred.api_key_encrypted) {
            envVars['AIRTABLE_API_KEY'] = decrypt(cred.api_key_encrypted)
          }
          if (cred.metadata?.baseId) {
            envVars['AIRTABLE_BASE_ID'] = cred.metadata.baseId
          }
          break
      }
    }

    // Return as JSON
    return NextResponse.json({
      success: true,
      project: {
        id: project.id,
        name: project.project_name
      },
      env: envVars
    })
  } catch (error: any) {
    console.error('[Env Sync] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to sync environment variables' },
      { status: 500 }
    )
  }
}
