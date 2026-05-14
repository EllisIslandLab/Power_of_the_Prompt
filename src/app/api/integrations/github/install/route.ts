import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Initiates GitHub App installation
 * Redirects user to GitHub to install the app
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

  // Store user ID in session for callback
  const response = NextResponse.redirect(
    `https://github.com/apps/${process.env.GITHUB_APP_SLUG}/installations/new`
  )

  // Set a temporary cookie to identify the user after redirect
  response.cookies.set('github_install_user_id', user.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600 // 10 minutes
  })

  return response
}
