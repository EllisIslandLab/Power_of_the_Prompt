import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Initiates Vercel OAuth flow
 * Redirects user to Vercel to authorize the app
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

  const callbackUri = `${request.nextUrl.origin}/api/integrations/vercel/callback`
  const vercelAuthUrl = `https://vercel.com/integrations/${process.env.NEXT_PUBLIC_VERCEL_INTEGRATION_SLUG}/new?redirect_uri=${encodeURIComponent(callbackUri)}`

  const response = NextResponse.redirect(vercelAuthUrl)

  // Store user ID for callback
  response.cookies.set('vercel_install_user_id', user.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600 // 10 minutes
  })

  // Store redirect URL if provided
  if (redirectTo) {
    response.cookies.set('vercel_install_redirect', redirectTo, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600 // 10 minutes
    })
  }

  return response
}
