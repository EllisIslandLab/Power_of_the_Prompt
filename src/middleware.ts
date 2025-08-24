import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
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
  matcher: ['/signup']
}