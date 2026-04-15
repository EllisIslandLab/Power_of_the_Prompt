import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

/**
 * Test endpoint to diagnose auth.signUp issues
 * DELETE THIS FILE after debugging
 */
export async function POST(request: NextRequest) {
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  try {
    const { email, password, fullName } = await request.json()

    console.log('🔍 Testing auth.signUp with:', { email, fullName })

    // Try to create user
    const { data, error } = await supabase.auth.signUp({
      email: email.toLowerCase(),
      password: password,
      options: {
        data: {
          full_name: fullName,
        }
      }
    })

    if (error) {
      // Return detailed error info
      return NextResponse.json({
        success: false,
        error: {
          message: error.message,
          status: error.status,
          code: error.code,
          name: error.name,
          fullError: JSON.stringify(error, null, 2)
        }
      })
    }

    if (!data.user) {
      return NextResponse.json({
        success: false,
        error: 'No user returned but no error thrown'
      })
    }

    // Success - now check if public.users was created
    const { data: publicUser, error: publicError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single()

    return NextResponse.json({
      success: true,
      userId: data.user.id,
      email: data.user.email,
      emailConfirmed: !!data.user.email_confirmed_at,
      publicUserExists: !!publicUser,
      publicUserError: publicError?.message
    })

  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: {
        message: err.message,
        stack: err.stack
      }
    }, { status: 500 })
  }
}
