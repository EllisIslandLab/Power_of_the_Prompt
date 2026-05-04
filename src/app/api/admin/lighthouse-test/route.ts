import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const {
      user_id,
      page_id,
      performance,
      accessibility,
      best_practices,
      seo,
      pwa,
      test_notes
    } = await request.json()

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

    // Verify admin
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()

    if (authError || !authUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { data: userData } = await supabase
      .from('users' as any)
      .select('role')
      .eq('id', authUser.id)
      .single()

    if (userData?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    // Get page details for tested_url
    const { data: pageData } = await supabase
      .from('website_pages')
      .select('page_path, full_url, users!inner(website_url)')
      .eq('id', page_id)
      .single()

    const tested_url = pageData?.full_url ||
      (pageData?.users?.[0]?.website_url ? `${pageData.users[0].website_url}${pageData.page_path}` : null)

    // Insert lighthouse scores
    const { error: insertError } = await supabase
      .from('lighthouse_scores')
      .insert({
        user_id,
        page_id,
        performance: performance || null,
        accessibility: accessibility || null,
        best_practices: best_practices || null,
        seo: seo || null,
        pwa: pwa || null,
        tested_url,
        tested_by: authUser.id,
        test_notes
      })

    if (insertError) {
      console.error('Error inserting scores:', insertError)
      return NextResponse.json(
        { error: 'Failed to save lighthouse scores' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Lighthouse scores saved successfully'
    })
  } catch (error) {
    console.error('Lighthouse test error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
