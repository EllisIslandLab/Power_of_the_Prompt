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
      .from('user_emails')
      .select('id, user_id, is_primary')
      .eq('id', emailId)
      .eq('user_id', user.id)
      .maybeSingle()

    if (!emailRecord) {
      return NextResponse.json(
        { error: 'Email not found or does not belong to you' },
        { status: 404 }
      )
    }

    // Check if this is the last email (the trigger will prevent deletion, but we can provide a better error message)
    const { count } = await supabase
      .from('user_emails')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    if (count === 1) {
      return NextResponse.json(
        { error: 'Cannot delete your last email address. Add another email before deleting this one.' },
        { status: 400 }
      )
    }

    // Delete the email (trigger will handle making another email primary if needed)
    const { error: deleteError } = await supabase
      .from('user_emails')
      .delete()
      .eq('id', emailId)

    if (deleteError) {
      console.error('Delete error:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete email' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, message: 'Email deleted successfully' })
  } catch (error: any) {
    console.error('Delete email error:', error)

    // Handle the trigger error
    if (error.message && error.message.includes('Cannot delete the last email')) {
      return NextResponse.json(
        { error: 'Cannot delete your last email address. Add another email before deleting this one.' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
