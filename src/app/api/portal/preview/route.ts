import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Get preview URL for the active project
 * Returns the latest Vercel preview URL from webhooks
 */
export async function GET(request: NextRequest) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    // Get active project with Vercel URLs
    const { data: projects } = await supabase
      .from('client_projects')
      .select('id, project_name, vercel_preview_url, vercel_production_url, vercel_preview_updated_at, framework')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .limit(1)

    if (!projects || projects.length === 0) {
      return NextResponse.json(
        { error: 'No active project found' },
        { status: 404 }
      )
    }

    const project = projects[0]

    console.log('[Preview API] Project:', {
      id: project.id,
      name: project.project_name,
      preview_url: project.vercel_preview_url,
      production_url: project.vercel_production_url,
      updated_at: project.vercel_preview_updated_at
    })

    // Prefer preview URL, fall back to production URL
    const previewUrl = project.vercel_preview_url || project.vercel_production_url

    if (!previewUrl) {
      console.log('[Preview API] No Vercel deployment URL found')
      return NextResponse.json(
        {
          previewUrl: null,
          message: 'No Vercel deployment found. Push to GitHub to trigger a deployment, or connect Vercel in Settings.'
        },
        { status: 200 }
      )
    }

    console.log('[Preview API] Using URL:', previewUrl)

    return NextResponse.json({
      previewUrl,
      projectName: project.project_name,
      framework: project.framework,
      updatedAt: project.vercel_preview_updated_at
    })
  } catch (error: any) {
    console.error('[Preview API] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get preview URL' },
      { status: 500 }
    )
  }
}
