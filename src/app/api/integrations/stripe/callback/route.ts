import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { exchangeStripeCode, testStripeConnection } from '@/lib/integrations/stripe-connect'
import { encrypt } from '@/lib/encryption'

/**
 * Stripe Connect OAuth callback
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const state = searchParams.get('state') // Anti-CSRF token
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')

  if (error) {
    console.error('Stripe OAuth error:', error, errorDescription)
    return NextResponse.redirect(
      new URL(
        `/portal/projects/new?error=stripe_${error}&message=${encodeURIComponent(errorDescription || '')}`,
        request.url
      )
    )
  }

  if (!code) {
    return NextResponse.redirect(
      new URL('/portal/projects/new?error=stripe_no_code', request.url)
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
    return NextResponse.redirect(
      new URL('/signin?redirect=/portal/projects/new', request.url)
    )
  }

  // Verify state token matches (optional but recommended)
  // You would need to generate and store this when initiating OAuth

  try {
    // Exchange code for access token
    const tokenData = await exchangeStripeCode(code)

    // Test the connection
    const isValid = await testStripeConnection(tokenData.stripe_user_id)

    if (!isValid) {
      return NextResponse.redirect(
        new URL('/portal/projects/new?error=stripe_invalid_connection', request.url)
      )
    }

    // Store credentials (encrypted)
    const { error: saveError } = await supabase
      .from('client_service_credentials')
      .upsert({
        user_id: user.id,
        service_name: 'stripe',
        access_token_encrypted: encrypt(tokenData.access_token),
        refresh_token_encrypted: encrypt(tokenData.refresh_token),
        metadata: {
          stripe_user_id: tokenData.stripe_user_id,
          stripe_publishable_key: tokenData.stripe_publishable_key,
          scope: tokenData.scope,
          livemode: tokenData.livemode
        },
        is_valid: true,
        last_validated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,service_name'
      })

    if (saveError) {
      console.error('Failed to save Stripe credentials:', saveError)
      return NextResponse.redirect(
        new URL('/portal/projects/new?error=stripe_save_failed', request.url)
      )
    }

    // Check if there's a custom redirect URL
    const redirectTo = cookieStore.get('stripe_install_redirect')?.value
    const redirectUrl = redirectTo
      ? new URL(redirectTo, request.url)
      : new URL(`/portal/projects/new?step=stripe_connected&account_id=${tokenData.stripe_user_id}`, request.url)

    // Clear temporary cookies
    const response = NextResponse.redirect(redirectUrl)
    response.cookies.delete('stripe_install_user_id')
    response.cookies.delete('stripe_install_redirect')

    return response
  } catch (error: any) {
    console.error('Stripe Connect error:', error)
    return NextResponse.redirect(
      new URL(
        `/portal/projects/new?error=stripe_oauth_failed&message=${encodeURIComponent(error.message || '')}`,
        request.url
      )
    )
  }
}
