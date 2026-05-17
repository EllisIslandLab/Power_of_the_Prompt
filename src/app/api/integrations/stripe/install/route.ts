import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Initiates Stripe Connect OAuth flow
 * Redirects user to Stripe to authorize the app
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

  // Verify user is authenticated
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL('/signin', request.url))
  }

  // Get redirect URL from query params
  const searchParams = request.nextUrl.searchParams
  const redirectTo = searchParams.get('redirect_to')

  const callbackUri = `${request.nextUrl.origin}/api/integrations/stripe/callback`
  const stripeAuthUrl = `https://connect.stripe.com/oauth/authorize?response_type=code&client_id=${process.env.NEXT_PUBLIC_STRIPE_CLIENT_ID}&scope=read_write&redirect_uri=${encodeURIComponent(callbackUri)}`

  const response = NextResponse.redirect(stripeAuthUrl)

  // Store user ID for callback
  response.cookies.set('stripe_install_user_id', user.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600 // 10 minutes
  })

  // Store redirect URL if provided
  if (redirectTo) {
    response.cookies.set('stripe_install_redirect', redirectTo, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600 // 10 minutes
    })
  }

  return response
}
