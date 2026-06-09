import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') || '/portal'

  if (!code) {
    return NextResponse.redirect(new URL('/signin?error=no_code', request.url))
  }

  const cookieStore = await cookies()
  const response = NextResponse.redirect(new URL(next, origin))

  try {
    // Create Supabase client with cookie handling to properly set session
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            response.cookies.set(name, value, options)
          },
          remove(name: string, options: any) {
            response.cookies.delete(name)
          },
        },
      }
    )

    // Exchange the code for a session (automatically sets cookies)
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('Auth callback error:', error)
      return NextResponse.redirect(new URL('/signin?error=auth_failed', origin))
    }

    if (data.user) {
      console.log('User authenticated:', data.user.id)

      // Use service role client to create/update user records
      const adminClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      )

      try {
        // Check if user exists in users table
        const { data: existingUser } = await adminClient
          .from('users')
          .select('id')
          .eq('id', data.user.id)
          .single()

        if (!existingUser) {
          // First time OAuth sign-in - create user record
          console.log('Creating new user record for OAuth user:', data.user.id)

          // Extract name from GitHub metadata
          const fullName = data.user.user_metadata?.full_name ||
                          data.user.user_metadata?.name ||
                          data.user.email?.split('@')[0] ||
                          'User'

          // Create user record
          const { error: userError } = await adminClient
            .from('users')
            .insert({
              id: data.user.id,
              email: data.user.email,
              full_name: fullName,
              email_verified: !!data.user.email_confirmed_at,
              role: 'client',
            })

          if (userError) {
            console.error('Failed to create user record:', userError)
            throw userError
          }

          // Create client_account
          const { data: newAccount, error: accountError } = await adminClient
            .from('client_accounts')
            .insert({
              user_id: data.user.id,
              account_balance: 0,
              total_lifetime_spent: 0,
            })
            .select()
            .single()

          if (accountError) {
            console.error('Failed to create client account:', accountError)
            throw accountError
          }

          // Create user_settings
          const { error: settingsError } = await adminClient
            .from('user_settings')
            .insert({
              user_id: data.user.id,
              theme_preference: 'dark',
              enable_notifications: true,
            })

          if (settingsError) {
            console.error('Failed to create user settings:', settingsError)
            throw settingsError
          }

          console.log('Successfully created user records')
        } else {
          // Existing user - just sync email verification
          await adminClient
            .from('users')
            .update({
              email_verified: !!data.user.email_confirmed_at,
              updated_at: new Date().toISOString()
            })
            .eq('id', data.user.id)
        }
      } catch (syncError) {
        console.error('User creation/sync error:', syncError)
      }
    }

    return response

  } catch (error) {
    console.error('Callback error:', error)
    return NextResponse.redirect(new URL('/signin?error=callback_failed', origin))
  }
}