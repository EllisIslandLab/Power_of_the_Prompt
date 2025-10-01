import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    // Create a Supabase client with cookie access for server-side auth
    const cookieStore = await cookies()

    const supabase = createClient(
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

    // Check if user is admin in users table
    const { data: userRecord, error: dbError } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (dbError || !userRecord) {
      return NextResponse.json({ isAdmin: false, error: 'User not found in database' })
    }

    return NextResponse.json({
      isAdmin: userRecord.role === 'admin',
      role: userRecord.role,
      userId: user.id
    })

  } catch (error) {
    console.error('Admin role check error:', error)
    return NextResponse.json({ isAdmin: false, error: 'Server error' })
  }
}