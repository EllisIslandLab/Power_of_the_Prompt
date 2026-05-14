import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { encrypt } from '@/lib/encryption'

export async function POST(request: NextRequest) {
  try {
    const { projectId, serviceName, credentials } = await request.json()

    if (!projectId || !serviceName || !credentials) {
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

    // Verify project belongs to user
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

    // Encrypt sensitive credentials
    let encryptedData: any = {}

    switch (serviceName) {
      case 'supabase':
        encryptedData = {
          metadata: {
            url: credentials.url // URL is not sensitive
          },
          api_key_encrypted: encrypt(credentials.anonKey),
          api_secret_encrypted: credentials.serviceKey
            ? encrypt(credentials.serviceKey)
            : null
        }
        break

      case 'vercel':
        encryptedData = {
          access_token_encrypted: encrypt(credentials.token)
        }
        break

      case 'stripe':
        encryptedData = {
          api_secret_encrypted: encrypt(credentials.secretKey),
          metadata: {
            publishableKey: credentials.publishableKey || null
          }
        }
        break

      case 'resend':
        encryptedData = {
          api_key_encrypted: encrypt(credentials.apiKey)
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
          api_key_encrypted: encrypt(credentials.apiKey)
        }
        break

      case 'airtable':
        encryptedData = {
          api_key_encrypted: encrypt(credentials.apiKey || credentials.personalAccessToken),
          metadata: {
            baseId: credentials.baseId || null,
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
    const { error: credError } = await supabase
      .from('client_service_credentials')
      .upsert({
        project_id: projectId,
        user_id: user.id,
        service_name: serviceName,
        ...encryptedData,
        is_valid: true,
        last_validated_at: new Date().toISOString()
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
      message: `${serviceName} credentials saved successfully`
    })
  } catch (error) {
    console.error('Error in save-credentials:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
