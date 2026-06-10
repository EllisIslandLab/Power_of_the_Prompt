import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')
  const next = searchParams.get('next') || '/portal'

  // Check if OAuth provider returned an error
  if (error) {
    console.error('OAuth provider error:', error, errorDescription)

    // Handle specific OAuth errors with user-friendly messages
    if (error === 'server_error' || errorDescription?.includes('user profile')) {
      // This is the cached state issue
      return NextResponse.redirect(new URL('/signin?error=no_code', origin))
    }

    return NextResponse.redirect(new URL(`/signin?error=${error}`, origin))
  }

  if (!code) {
    return NextResponse.redirect(new URL('/signin?error=no_code', origin))
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

          // Check for active invite for this email
          const { data: invite } = await adminClient
            .from('invite_tokens')
            .select('*')
            .eq('email', data.user.email?.toLowerCase())
            .is('used_at', null)
            .gt('expires_at', new Date().toISOString())
            .single()

          // Extract name from GitHub metadata or invite
          const fullName = invite?.full_name ||
                          data.user.user_metadata?.full_name ||
                          data.user.user_metadata?.name ||
                          data.user.email?.split('@')[0] ||
                          'User'

          const tier = invite?.tier || 'basic'
          const initialBalance = invite?.initial_balance || 0

          console.log('OAuth signup settings:', { fullName, tier, initialBalance, hasInvite: !!invite })

          // Create user record
          const { error: userError } = await adminClient
            .from('users')
            .insert({
              id: data.user.id,
              email: data.user.email,
              full_name: fullName,
              email_verified: !!data.user.email_confirmed_at,
              role: 'client',
              tier: tier,
              payment_status: tier === 'full' ? 'paid' : 'trial'
            })

          if (userError) {
            console.error('Failed to create user record:', userError)
            throw userError
          }

          // Create client_account with initial balance from invite (if any)
          const { data: newAccount, error: accountError } = await adminClient
            .from('client_accounts')
            .insert({
              user_id: data.user.id,
              account_balance: initialBalance,
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

          // Mark invite as used if one was found
          if (invite) {
            await adminClient
              .from('invite_tokens')
              .update({
                used_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              })
              .eq('id', invite.id)
            console.log('Marked invite as used:', invite.id)
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