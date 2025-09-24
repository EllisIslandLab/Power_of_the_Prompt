import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Protect admin routes - require admin authentication
  if (request.nextUrl.pathname.startsWith('/admin') && !request.nextUrl.pathname.startsWith('/admin/login')) {
    // For now, redirect to admin login - you can enhance this with session checking later
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  // Protect the signup route - only accessible with valid invite tokens
  if (request.nextUrl.pathname === '/signup') {
    const token = request.nextUrl.searchParams.get('token')

    if (!token) {
      // Redirect to home page if no invite token provided
      return NextResponse.redirect(new URL('/', request.url))
    }

    // Token exists, allow access (we'll validate the token server-side in the signup page)
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/signup', '/admin/:path*']
}