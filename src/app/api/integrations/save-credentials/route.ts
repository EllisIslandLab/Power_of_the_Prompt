import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { encrypt } from '@/lib/encryption'

export async function POST(request: NextRequest) {
  try {
    const { projectId, serviceName, service, credentials, userId } = await request.json()

    // Support both 'serviceName' and 'service' for backward compatibility
    const actualServiceName = serviceName || service

    if (!actualServiceName || !credentials) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

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

    // If projectId is provided, verify it belongs to user
    if (projectId) {
      const { data: project } = await supabase
        .from('client_projects')
        .select('user_id')
        .eq('id', projectId)
        .single()

      if (!project || project.user_id !== user.id) {
        return NextResponse.json(
          { error: 'Project not found or unauthorized' },
          { status: 403 }
        )
      }
    }

    // Encrypt sensitive credentials
    let encryptedData: any = {}

    switch (actualServiceName) {
      case 'supabase':
        encryptedData = {
          metadata: {
            url: credentials.url || credentials.project_url // Support both formats
          },
          api_key_encrypted: encrypt(credentials.anonKey || credentials.anon_key),
          api_secret_encrypted: credentials.serviceKey || credentials.service_role_key
            ? encrypt(credentials.serviceKey || credentials.service_role_key)
            : null
        }
        break

      case 'vercel':
        encryptedData = {
          access_token_encrypted: encrypt(credentials.token || credentials.access_token)
        }
        break

      case 'stripe':
        encryptedData = {
          api_secret_encrypted: encrypt(credentials.secretKey || credentials.secret_key),
          api_key_encrypted: encrypt(credentials.publishableKey || credentials.publishable_key),
          metadata: {
            publishableKey: credentials.publishableKey || credentials.publishable_key || null,
            webhookSecret: credentials.webhookSecret || credentials.webhook_secret || null
          }
        }
        break

      case 'github':
        encryptedData = {
          access_token_encrypted: encrypt(credentials.personalAccessToken || credentials.personal_access_token)
        }
        break

      case 'resend':
        encryptedData = {
          api_key_encrypted: encrypt(credentials.apiKey || credentials.api_key)
        }
        break

      case 'clerk':
        encryptedData = {
          api_secret_encrypted: encrypt(credentials.secretKey),
          metadata: {
            publishableKey: credentials.publishableKey
          }
        }
        break

      case 'openai':
      case 'anthropic':
        encryptedData = {
          api_key_encrypted: encrypt(credentials.apiKey || credentials.api_key)
        }
        break

      case 'airtable':
        encryptedData = {
          api_key_encrypted: encrypt(credentials.apiKey || credentials.api_key || credentials.personalAccessToken),
          metadata: {
            baseId: credentials.baseId || credentials.base_id || null,
            tokenType: credentials.personalAccessToken ? 'pat' : 'api_key'
          }
        }
        break

      default:
        return NextResponse.json(
          { error: 'Unknown service type' },
          { status: 400 }
        )
    }

    // Upsert credentials
    const credentialData: any = {
      user_id: user.id,
      service_name: actualServiceName,
      ...encryptedData,
      is_valid: true,
      last_validated_at: new Date().toISOString()
    }

    // Add project_id if provided (project-level), otherwise null (user-level)
    if (projectId) {
      credentialData.project_id = projectId
    }

    const { error: credError } = await supabase
      .from('client_service_credentials')
      .upsert(credentialData, {
        onConflict: 'user_id,project_id,service_name'
      })

    if (credError) {
      console.error('Error saving credentials:', credError)
      return NextResponse.json(
        { error: 'Failed to save credentials' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `${actualServiceName} credentials saved successfully`
    })
  } catch (error) {
    console.error('Error in save-credentials:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
