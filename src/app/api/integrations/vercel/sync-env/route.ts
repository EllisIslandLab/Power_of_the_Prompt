import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { encrypt } from '@/lib/encryption'

/**
 * Sync environment variables from Vercel to auto-connect services
 * This is the "Vercel-first" approach - one connection unlocks everything
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
    const { project_id, vercel_token } = await request.json()

    if (!project_id || !vercel_token) {
      return NextResponse.json(
        { error: 'Missing project_id or vercel_token' },
        { status: 400 }
      )
    }

    console.log('[Vercel Sync] Fetching env vars for project:', project_id)

    // Fetch environment variables from Vercel
    const response = await fetch(
      `https://api.vercel.com/v9/projects/${project_id}/env`,
      {
        headers: {
          Authorization: `Bearer ${vercel_token}`,
        },
      }
    )

    if (!response.ok) {
      throw new Error(`Vercel API error: ${response.status}`)
    }

    const data = await response.json()
    const envVars = data.envs || []

    console.log('[Vercel Sync] Found env vars:', envVars.length)

    // Parse env vars and detect services
    const detectedServices: any[] = []
    const envMap: Record<string, string> = {}

    // Build env var map (use production values)
    for (const env of envVars) {
      if (env.target?.includes('production') && env.value) {
        envMap[env.key] = env.value
      }
    }

    // Detect Airtable
    if (envMap.AIRTABLE_API_KEY) {
      console.log('[Vercel Sync] Detected Airtable')
      detectedServices.push({
        service_name: 'airtable',
        api_key: envMap.AIRTABLE_API_KEY,
        base_id: envMap.AIRTABLE_BASE_ID || null,
      })
    }

    // Detect Resend
    if (envMap.RESEND_API_KEY) {
      console.log('[Vercel Sync] Detected Resend')
      detectedServices.push({
        service_name: 'resend',
        api_key: envMap.RESEND_API_KEY,
        from_email: envMap.RESEND_FROM_EMAIL || null,
      })
    }

    // Detect Stripe
    if (envMap.STRIPE_SECRET_KEY) {
      console.log('[Vercel Sync] Detected Stripe')
      detectedServices.push({
        service_name: 'stripe',
        secret_key: envMap.STRIPE_SECRET_KEY,
        publishable_key: envMap.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || null,
        webhook_secret: envMap.STRIPE_WEBHOOK_SECRET || null,
      })
    }

    // Detect Supabase
    if (envMap.NEXT_PUBLIC_SUPABASE_URL) {
      console.log('[Vercel Sync] Detected Supabase')
      detectedServices.push({
        service_name: 'supabase',
        url: envMap.NEXT_PUBLIC_SUPABASE_URL,
        anon_key: envMap.NEXT_PUBLIC_SUPABASE_ANON_KEY || null,
        service_role_key: envMap.SUPABASE_SERVICE_ROLE_KEY || null,
      })
    }

    // Store credentials in database
    const connectedServices: string[] = []

    for (const service of detectedServices) {
      try {
        const { error } = await supabase
          .from('client_service_credentials')
          .upsert({
            user_id: user.id,
            service_name: service.service_name,
            is_valid: true,
            ...(service.api_key && {
              api_key_encrypted: encrypt(service.api_key),
            }),
            ...(service.secret_key && {
              api_secret_encrypted: encrypt(service.secret_key),
            }),
            ...(service.anon_key && {
              api_key_encrypted: encrypt(service.anon_key),
            }),
            ...(service.service_role_key && {
              api_secret_encrypted: encrypt(service.service_role_key),
            }),
            metadata: {
              ...(service.base_id && { baseId: service.base_id }),
              ...(service.from_email && { from_email: service.from_email }),
              ...(service.publishable_key && { publishable_key: service.publishable_key }),
              ...(service.webhook_secret && { webhook_secret: service.webhook_secret }),
              ...(service.url && { url: service.url }),
              synced_from_vercel: true,
              synced_at: new Date().toISOString(),
            },
          })

        if (error) {
          console.error(`[Vercel Sync] Failed to store ${service.service_name}:`, error)
        } else {
          connectedServices.push(service.service_name)
          console.log(`[Vercel Sync] ✓ Connected ${service.service_name}`)
        }
      } catch (err) {
        console.error(`[Vercel Sync] Error storing ${service.service_name}:`, err)
      }
    }

    return NextResponse.json({
      success: true,
      connected_services: connectedServices,
      total_env_vars: envVars.length,
      detected_services: detectedServices.length,
    })
  } catch (error: any) {
    console.error('[Vercel Sync] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to sync environment variables' },
      { status: 500 }
    )
  }
}
