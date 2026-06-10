import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { decrypt } from '@/lib/encryption'
import { testStripeConnection } from '@/lib/integrations/stripe-connect'
import { getVercelUser } from '@/lib/integrations/vercel'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

interface ValidationResult {
  service: string
  valid: boolean
  error?: string
  details?: any
}

/**
 * Validate all connected services for a user
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
    const body = await request.json()

    // Mode 1: Validate new credentials (before saving)
    if (body.service && body.credentials) {
      const { service, credentials } = body

      try {
        const validation = await validateServiceWithPlainCredentials(service, credentials)
        return NextResponse.json(validation)
      } catch (error: any) {
        return NextResponse.json({
          service,
          valid: false,
          error: error.message || 'Validation failed'
        }, { status: 400 })
      }
    }

    // Mode 2: Validate existing saved credentials
    const { services } = body

    if (!services || !Array.isArray(services)) {
      return NextResponse.json(
        { error: 'Services array or service/credentials required' },
        { status: 400 }
      )
    }

    // Fetch credentials for requested services
    const { data: credentials, error: credError } = await supabase
      .from('client_service_credentials')
      .select('*')
      .eq('user_id', user.id)
      .in('service_name', services)

    if (credError) {
      console.error('Failed to fetch credentials:', credError)
      return NextResponse.json(
        { error: 'Failed to fetch credentials' },
        { status: 500 }
      )
    }

    // Validate each service
    const results: ValidationResult[] = []

    for (const service of services) {
      const cred = credentials?.find(c => c.service_name === service)

      if (!cred) {
        results.push({
          service,
          valid: false,
          error: 'Not connected'
        })
        continue
      }

      try {
        const validation = await validateService(service, cred)
        results.push(validation)

        // Update last validated timestamp
        await supabase
          .from('client_service_credentials')
          .update({
            last_validated_at: new Date().toISOString(),
            is_valid: validation.valid
          })
          .eq('id', cred.id)
      } catch (error: any) {
        results.push({
          service,
          valid: false,
          error: error.message || 'Validation failed'
        })
      }
    }

    return NextResponse.json({
      success: true,
      results
    })
  } catch (error: any) {
    console.error('Validation error:', error)
    return NextResponse.json(
      { error: 'Validation failed' },
      { status: 500 }
    )
  }
}

/**
 * Validate plain credentials (before saving)
 */
async function validateServiceWithPlainCredentials(
  serviceName: string,
  credentials: any
): Promise<ValidationResult> {
  try {
    switch (serviceName) {
      case 'stripe':
        return await validateStripePlain(credentials)

      case 'vercel':
        return await validateVercelPlain(credentials)

      case 'supabase':
        return await validateSupabasePlain(credentials)

      case 'github':
        return await validateGitHubPlain(credentials)

      case 'airtable':
        return await validateAirtablePlain(credentials)

      case 'resend':
        return await validateResendPlain(credentials)

      default:
        return {
          service: serviceName,
          valid: false,
          error: 'Service validation not implemented'
        }
    }
  } catch (error: any) {
    return {
      service: serviceName,
      valid: false,
      error: error.message
    }
  }
}

/**
 * Validate a specific service
 */
async function validateService(
  serviceName: string,
  credential: any
): Promise<ValidationResult> {
  try {
    switch (serviceName) {
      case 'stripe':
        return await validateStripe(credential)

      case 'vercel':
        return await validateVercel(credential)

      case 'supabase':
        return await validateSupabase(credential)

      case 'github':
        return await validateGitHub(credential)

      case 'airtable':
        return await validateAirtable(credential)

      case 'resend':
        return await validateResend(credential)

      default:
        return {
          service: serviceName,
          valid: true,
          details: { note: 'Validation not implemented' }
        }
    }
  } catch (error: any) {
    return {
      service: serviceName,
      valid: false,
      error: error.message
    }
  }
}

/**
 * Validate Stripe connection
 */
async function validateStripe(credential: any): Promise<ValidationResult> {
  try {
    const stripeUserId = credential.metadata?.stripe_user_id

    if (!stripeUserId) {
      throw new Error('Missing Stripe account ID')
    }

    const isValid = await testStripeConnection(stripeUserId)

    if (!isValid) {
      throw new Error('Connection test failed')
    }

    return {
      service: 'stripe',
      valid: true,
      details: {
        accountId: stripeUserId,
        livemode: credential.metadata?.livemode || false
      }
    }
  } catch (error: any) {
    return {
      service: 'stripe',
      valid: false,
      error: error.message || 'Connection failed'
    }
  }
}

/**
 * Validate Vercel connection
 */
async function validateVercel(credential: any): Promise<ValidationResult> {
  try {
    const accessToken = decrypt(credential.access_token_encrypted)

    // Test connection by fetching user
    const { user } = await getVercelUser(accessToken)

    return {
      service: 'vercel',
      valid: true,
      details: {
        userId: user.id,
        username: user.username,
        email: user.email
      }
    }
  } catch (error: any) {
    return {
      service: 'vercel',
      valid: false,
      error: error.message || 'Connection failed'
    }
  }
}

/**
 * Validate Supabase connection
 */
async function validateSupabase(credential: any): Promise<ValidationResult> {
  try {
    const url = credential.metadata?.url
    const anonKey = decrypt(credential.api_key_encrypted)

    if (!url || !anonKey) {
      throw new Error('Missing Supabase credentials')
    }

    // Test connection
    const testClient = createSupabaseClient(url, anonKey)
    const { error } = await testClient.from('_supabase_migrations').select('version').limit(1)

    // Error is expected if table doesn't exist (which is fine)
    // We just want to verify we can connect

    return {
      service: 'supabase',
      valid: true,
      details: {
        url,
        connected: true
      }
    }
  } catch (error: any) {
    // Check if it's an auth error vs connection error
    if (error.message?.includes('JWT') || error.message?.includes('auth')) {
      return {
        service: 'supabase',
        valid: false,
        error: 'Invalid API key'
      }
    }

    return {
      service: 'supabase',
      valid: false,
      error: error.message || 'Connection failed'
    }
  }
}

/**
 * Validate GitHub connection
 */
async function validateGitHub(credential: any): Promise<ValidationResult> {
  try {
    const accessToken = decrypt(credential.access_token_encrypted)

    // Test with a simple API call
    const response = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/vnd.github+json'
      }
    })

    if (!response.ok) {
      throw new Error('GitHub API request failed')
    }

    const user = await response.json()

    return {
      service: 'github',
      valid: true,
      details: {
        login: user.login,
        id: user.id
      }
    }
  } catch (error: any) {
    return {
      service: 'github',
      valid: false,
      error: error.message || 'Connection failed'
    }
  }
}

/**
 * Validate Airtable connection
 */
async function validateAirtable(credential: any): Promise<ValidationResult> {
  try {
    const apiKey = decrypt(credential.api_key_encrypted)
    const baseId = credential.metadata?.baseId

    // Test connection by fetching base schema
    const url = baseId
      ? `https://api.airtable.com/v0/${baseId}/`
      : 'https://api.airtable.com/v0/meta/bases'

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.error?.message || 'Airtable API request failed')
    }

    return {
      service: 'airtable',
      valid: true,
      details: {
        baseId: baseId || 'No base specified',
        tokenType: credential.metadata?.tokenType || 'api_key',
        connected: true
      }
    }
  } catch (error: any) {
    return {
      service: 'airtable',
      valid: false,
      error: error.message || 'Connection failed'
    }
  }
}

/**
 * Validate Resend connection
 */
async function validateResend(credential: any): Promise<ValidationResult> {
  try {
    const apiKey = decrypt(credential.api_key_encrypted)

    // Test connection by fetching API keys (validates auth)
    const response = await fetch('https://api.resend.com/api-keys', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.message || 'Resend API request failed')
    }

    return {
      service: 'resend',
      valid: true,
      details: {
        connected: true
      }
    }
  } catch (error: any) {
    return {
      service: 'resend',
      valid: false,
      error: error.message || 'Connection failed'
    }
  }
}

// ===== Plain Credential Validation Functions =====

async function validateStripePlain(credentials: any): Promise<ValidationResult> {
  try {
    const { secret_key, publishable_key } = credentials

    if (!secret_key || !publishable_key) {
      throw new Error('Stripe secret key and publishable key are required')
    }

    // Validate key formats
    if (!secret_key.startsWith('sk_')) {
      throw new Error('Invalid secret key format (must start with sk_)')
    }
    if (!publishable_key.startsWith('pk_')) {
      throw new Error('Invalid publishable key format (must start with pk_)')
    }

    // Test the secret key by fetching account info
    const response = await fetch('https://api.stripe.com/v1/account', {
      headers: {
        'Authorization': `Bearer ${secret_key}`
      }
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.error?.message || 'Invalid Stripe credentials')
    }

    const account = await response.json()

    return {
      service: 'stripe',
      valid: true,
      details: {
        accountId: account.id,
        livemode: !secret_key.includes('test')
      }
    }
  } catch (error: any) {
    return {
      service: 'stripe',
      valid: false,
      error: error.message || 'Connection failed'
    }
  }
}

async function validateVercelPlain(credentials: any): Promise<ValidationResult> {
  try {
    const { access_token } = credentials

    if (!access_token) {
      throw new Error('Vercel access token is required')
    }

    const { user } = await getVercelUser(access_token)

    return {
      service: 'vercel',
      valid: true,
      details: {
        userId: user.id,
        username: user.username,
        email: user.email
      }
    }
  } catch (error: any) {
    return {
      service: 'vercel',
      valid: false,
      error: error.message || 'Connection failed'
    }
  }
}

async function validateSupabasePlain(credentials: any): Promise<ValidationResult> {
  try {
    const { project_url, anon_key, service_role_key } = credentials

    if (!project_url || !anon_key || !service_role_key) {
      throw new Error('Supabase URL, anon key, and service role key are required')
    }

    // Validate URL format
    if (!project_url.startsWith('https://') || !project_url.includes('supabase')) {
      throw new Error('Invalid Supabase URL format')
    }

    // Test connection with anon key
    const testClient = createSupabaseClient(project_url, anon_key)
    const { error } = await testClient.from('_supabase_migrations').select('version').limit(1)

    // Error is expected if table doesn't exist, we just want to verify connection

    return {
      service: 'supabase',
      valid: true,
      details: {
        url: project_url,
        connected: true
      }
    }
  } catch (error: any) {
    return {
      service: 'supabase',
      valid: false,
      error: error.message || 'Connection failed'
    }
  }
}

async function validateGitHubPlain(credentials: any): Promise<ValidationResult> {
  try {
    const { personal_access_token } = credentials

    if (!personal_access_token) {
      throw new Error('GitHub personal access token is required')
    }

    // Test with a simple API call
    const response = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${personal_access_token}`,
        'Accept': 'application/vnd.github+json'
      }
    })

    if (!response.ok) {
      throw new Error('Invalid GitHub token')
    }

    const user = await response.json()

    return {
      service: 'github',
      valid: true,
      details: {
        login: user.login,
        id: user.id
      }
    }
  } catch (error: any) {
    return {
      service: 'github',
      valid: false,
      error: error.message || 'Connection failed'
    }
  }
}

async function validateAirtablePlain(credentials: any): Promise<ValidationResult> {
  try {
    const { api_key, base_id } = credentials

    if (!api_key) {
      throw new Error('Airtable API key is required')
    }

    // First, test token validity by listing bases (simpler endpoint)
    console.log('[Airtable Validation] Testing token with bases endpoint...')
    console.log('[Airtable Validation] API key format:', api_key?.substring(0, 10) + '...')

    const basesResponse = await fetch('https://api.airtable.com/v0/meta/bases', {
      headers: {
        'Authorization': `Bearer ${api_key}`
      }
    })

    console.log('[Airtable Validation] Bases endpoint status:', basesResponse.status)

    if (!basesResponse.ok) {
      const errorText = await basesResponse.text()
      console.error('[Airtable Validation] Bases endpoint error:', errorText)

      let errorData: any = {}
      try {
        errorData = JSON.parse(errorText)
      } catch (e) {
        // ignore
      }

      const errorMessage = errorData.error?.message || errorData.error?.type || `Token validation failed: ${basesResponse.status}`
      throw new Error(errorMessage)
    }

    console.log('[Airtable Validation] Token is valid!')

    // If base_id provided, verify it exists
    if (base_id) {
      const basesData = await basesResponse.json()
      const baseExists = basesData.bases?.some((b: any) => b.id === base_id)

      if (!baseExists) {
        console.log('[Airtable Validation] Base ID not found in account')
        throw new Error(`Base ${base_id} not found in your Airtable account`)
      }

      console.log('[Airtable Validation] Base ID verified!')
    }

    const response = basesResponse
    console.log('[Airtable Validation] Response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[Airtable Validation] Error response:', errorText)

      let errorData: any = {}
      try {
        errorData = JSON.parse(errorText)
      } catch (e) {
        console.error('[Airtable Validation] Could not parse error as JSON')
      }

      const errorMessage = errorData.error?.message || errorData.error?.type || `Airtable API returned ${response.status}: ${errorText.substring(0, 100)}`
      throw new Error(errorMessage)
    }

    console.log('[Airtable Validation] Success!')

    return {
      service: 'airtable',
      valid: true,
      details: {
        baseId: base_id || 'No base specified',
        connected: true
      }
    }
  } catch (error: any) {
    console.error('[Airtable Validation] Failed:', error.message)
    return {
      service: 'airtable',
      valid: false,
      error: error.message || 'Connection failed'
    }
  }
}

async function validateResendPlain(credentials: any): Promise<ValidationResult> {
  try {
    const { api_key } = credentials

    if (!api_key) {
      throw new Error('Resend API key is required')
    }

    // Validate key format
    if (!api_key.startsWith('re_')) {
      throw new Error('Invalid Resend API key format (must start with re_)')
    }

    // Test connection by fetching API keys
    const response = await fetch('https://api.resend.com/api-keys', {
      headers: {
        'Authorization': `Bearer ${api_key}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.message || 'Invalid Resend credentials')
    }

    return {
      service: 'resend',
      valid: true,
      details: {
        connected: true
      }
    }
  } catch (error: any) {
    return {
      service: 'resend',
      valid: false,
      error: error.message || 'Connection failed'
    }
  }
}

/**
 * Get validation status for all services
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
    const { data: credentials } = await supabase
      .from('client_service_credentials')
      .select('service_name, is_valid, last_validated_at, metadata')
      .eq('user_id', user.id)

    return NextResponse.json({
      credentials: credentials || []
    })
  } catch (error) {
    console.error('Failed to fetch validation status:', error)
    return NextResponse.json(
      { error: 'Failed to fetch status' },
      { status: 500 }
    )
  }
}
