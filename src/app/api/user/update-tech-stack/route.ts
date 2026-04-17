import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const { tech_stack_preferences } = await request.json()

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

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Validate that tech_stack_preferences is an array
    if (!Array.isArray(tech_stack_preferences)) {
      return NextResponse.json(
        { error: 'Tech stack preferences must be an array' },
        { status: 400 }
      )
    }

    // Update tech stack preferences
    const { error: updateError } = await supabase
      .from('users' as any)
      .update({ tech_stack_preferences })
      .eq('id', user.id)

    if (updateError) {
      console.error('Tech stack update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update tech stack preferences' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Tech stack preferences updated successfully'
    })
  } catch (error) {
    console.error('Tech stack update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
