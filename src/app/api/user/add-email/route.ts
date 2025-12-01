import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
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
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          },
        },
      }
    )

    const { email, makePrimary } = await request.json()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Validate email
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const { data: existingEmail } = await supabase
      .from('user_emails' as any)
      .select('id, user_id')
      .eq('email', email)
      .maybeSingle() as any

    if (existingEmail) {
      return NextResponse.json(
        { error: 'This email is already in use' },
        { status: 400 }
      )
    }

    // Add the email
    const { error: insertError } = await supabase
      .from('user_emails' as any)
      .insert({
        user_id: user.id,
        email,
        is_primary: makePrimary || false,
        verified: false
      })

    if (insertError) {
      console.error('Insert error:', insertError)
      return NextResponse.json(
        { error: 'Failed to add email' },
        { status: 500 }
      )
    }

    // TODO: Send verification email

    return NextResponse.json({
      success: true,
      message: 'Email added successfully. Please check your email for verification.'
    })
  } catch (error) {
    console.error('Add email error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
