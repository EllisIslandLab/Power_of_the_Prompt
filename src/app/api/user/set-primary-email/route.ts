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

    const { emailId } = await request.json()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Validate emailId
    if (!emailId) {
      return NextResponse.json(
        { error: 'Email ID is required' },
        { status: 400 }
      )
    }

    // Verify the email belongs to the user
    const { data: emailRecord } = await supabase
      .from('user_emails' as any)
      .select('id, user_id')
      .eq('id', emailId)
      .eq('user_id', user.id)
      .maybeSingle() as any

    if (!emailRecord) {
      return NextResponse.json(
        { error: 'Email not found or does not belong to you' },
        { status: 404 }
      )
    }

    // Set this email as primary (trigger will automatically unset other primary emails)
    const { error: updateError } = await supabase
      .from('user_emails' as any)
      .update({ is_primary: true })
      .eq('id', emailId)

    if (updateError) {
      console.error('Update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to set primary email' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, message: 'Primary email updated successfully' })
  } catch (error) {
    console.error('Set primary email error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
