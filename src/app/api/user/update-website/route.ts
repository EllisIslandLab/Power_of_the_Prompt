import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const { website_url } = await request.json()

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

    // Validate URL if provided
    if (website_url && website_url.trim() !== '') {
      try {
        new URL(website_url)
      } catch (e) {
        return NextResponse.json(
          { error: 'Invalid URL format' },
          { status: 400 }
        )
      }
    }

    // Update website URL
    const { error: updateError } = await supabase
      .from('users' as any)
      .update({ website_url: website_url || null })
      .eq('id', user.id)

    if (updateError) {
      console.error('Website update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update website URL' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Website URL updated successfully'
    })
  } catch (error) {
    console.error('Website update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
