import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

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
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user ?? null

  // Simple auth check for portal routes
  if (request.nextUrl.pathname.startsWith('/portal')) {
    if (!user) {
      return NextResponse.redirect(new URL('/signin', request.url))
    }
  }

  // Admin routes are protected by AdminAuthGuard component
  // Just let them through here

  // Protect signup route - require invite token
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
