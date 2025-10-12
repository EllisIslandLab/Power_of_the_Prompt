import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, smsConsent } = await request.json()

    // Create Supabase client with cookie handling
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

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'You must be logged in to update preferences' },
        { status: 401 }
      )
    }

    // Update the user's profile in the public.users table
    const { error: updateError } = await supabase
      .from('users')
      .update({
        phone_number: phoneNumber || null,
        sms_consent: smsConsent,
        sms_consent_timestamp: smsConsent ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('Error updating user preferences:', updateError)
      return NextResponse.json(
        { error: 'Failed to save preferences' },
        { status: 500 }
      )
    }

    // Optionally, also save to Airtable if you have that integration
    // You can add Airtable integration here if needed

    return NextResponse.json({
      success: true,
      message: 'Preferences saved successfully'
    })

  } catch (error) {
    console.error('SMS consent error:', error)
    return NextResponse.json(
      { error: 'An error occurred while saving your preferences' },
      { status: 500 }
    )
  }
}
