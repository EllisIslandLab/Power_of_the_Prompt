import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    // Create a Supabase client with cookie access for server-side auth
    const cookieStore = await cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {}
          },
        },
      }
    )

    // Get current user session
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ isAdmin: false, error: 'Not authenticated' })
    }

    // Use service role to check user role (bypass RLS)
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Check if user exists in public.users table and get their role
    const { data: userRecord, error: dbError } = await supabaseAdmin
      .from('users' as any)
      .select('role, email, full_name')
      .eq('id', user.id)
      .single()

    if (dbError || !userRecord) {
      // User exists in auth but not in public.users - trigger may have failed
      // This is a critical error that needs admin intervention
      console.error('User exists in auth but not in public.users:', {
        userId: user.id,
        email: user.email,
        error: dbError
      })

      return NextResponse.json({
        isAdmin: false,
        error: 'User profile not found. Please contact support.',
        needsProfile: true
      })
    }

    return NextResponse.json({
      isAdmin: userRecord.role === 'admin',
      role: userRecord.role,
      userId: user.id,
      email: userRecord.email
    })

  } catch (error) {
    console.error('Admin role check error:', error)
    return NextResponse.json({ isAdmin: false, error: 'Server error' })
  }
}