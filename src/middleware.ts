import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

/**
 * Middleware for authentication and route protection
 *
 * IMPORTANT: This middleware is intentionally SIMPLE to avoid auth conflicts
 * - Only checks if user is authenticated (not their role)
 * - Admin role checking is done in AdminAuthGuard component
 * - This prevents "Multiple GoTrueClient instances" errors
 */
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Create a single Supabase client for this request
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Get and verify user session (getUser validates with server, getSession does not)
  // This is critical - getSession() can return stale/invalid data from cookies
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  // PORTAL ROUTES: Require authentication only (no role check)
  if (request.nextUrl.pathname.startsWith('/portal')) {
    if (!user || authError) {
      // User not authenticated or session invalid
      const redirectUrl = new URL('/signin', request.url)
      return NextResponse.redirect(redirectUrl)
    }
  }

  // ADMIN ROUTES: No middleware check - AdminAuthGuard component handles it
  // This prevents double authentication and cookie conflicts
  // The component shows a modal requiring admin credentials

  // SIGNUP ROUTE: Require invite token (for invite-based signups)
  if (request.nextUrl.pathname === '/signup') {
    const token = request.nextUrl.searchParams.get('token')
    if (!token) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return response
}

export const config = {
  matcher: ['/signup', '/admin/:path*', '/portal/:path*']
}
