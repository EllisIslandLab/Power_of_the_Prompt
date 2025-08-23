import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') || '/portal'

  if (!code) {
    return NextResponse.redirect(new URL('/signin?error=no_code', request.url))
  }

  try {
    // Exchange the code for a session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('❌ Auth callback error:', error)
      return NextResponse.redirect(new URL('/signin?error=auth_failed', request.url))
    }

    if (data.user) {
      console.log('✅ Email verified for user:', data.user.id)
      
      // Manually sync the email verification status to our students table
      try {
        const { error: updateError } = await supabase
          .from('students')
          .update({ 
            email_verified: !!data.user.email_confirmed_at,
            updated_at: new Date().toISOString()
          })
          .eq('id', data.user.id)

        if (updateError) {
          console.error('Failed to sync email verification:', updateError)
        } else {
          console.log('✅ Email verification synced to students table')
        }
      } catch (syncError) {
        console.error('Sync error:', syncError)
      }
    }

    // Redirect to success page or portal
    return NextResponse.redirect(new URL('/email-verified', request.url))

  } catch (error) {
    console.error('Callback error:', error)
    return NextResponse.redirect(new URL('/signin?error=callback_failed', request.url))
  }
}