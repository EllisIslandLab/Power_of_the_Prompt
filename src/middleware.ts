import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export const runtime = 'nodejs'

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

    // Check if user is admin
    const { data: userRecord } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!userRecord || userRecord.role !== 'admin') {
      // Not an admin - redirect to portal
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
