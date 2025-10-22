import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

// Cache admin status in cookie for better performance
const ADMIN_CACHE_KEY = 'is_admin'
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

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

  // Get user session
  const { data: { user } } = await supabase.auth.getUser()

  // Protect admin routes - require admin authentication
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!user) {
      // Not authenticated - redirect to signin
      return NextResponse.redirect(new URL('/signin', request.url))
    }

    // Check cached admin status first
    const cachedAdminStatus = request.cookies.get(ADMIN_CACHE_KEY)
    let isAdmin = false

    if (cachedAdminStatus && cachedAdminStatus.value === user.id) {
      // Use cached admin status
      isAdmin = true
    } else {
      // Check database for admin role
      const { data: userRecord } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

      isAdmin = userRecord?.role === 'admin'

      // Cache the result if user is admin
      if (isAdmin) {
        response.cookies.set(ADMIN_CACHE_KEY, user.id, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: CACHE_DURATION / 1000, // in seconds
        })
      }
    }

    if (!isAdmin) {
      // Not an admin - clear cache and redirect to portal
      response.cookies.delete(ADMIN_CACHE_KEY)
      return NextResponse.redirect(new URL('/portal', request.url))
    }
  }

  // Protect portal routes - require authentication
  if (request.nextUrl.pathname.startsWith('/portal')) {
    if (!user) {
      // Not authenticated - redirect to signin
      return NextResponse.redirect(new URL('/signin', request.url))
    }
  }

  // Protect the signup route - only accessible with valid invite tokens
  if (request.nextUrl.pathname === '/signup') {
    const token = request.nextUrl.searchParams.get('token')

    if (!token) {
      // Redirect to home page if no invite token provided
      return NextResponse.redirect(new URL('/', request.url))
    }

    // Token exists, allow access (we'll validate the token server-side in the signup page)
  }

  return response
}

export const config = {
  matcher: ['/signup', '/admin/:path*', '/portal/:path*']
}
