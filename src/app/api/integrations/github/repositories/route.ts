import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Get user's accessible GitHub repositories
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
    // Get user's installations
    const { data: installations, error: installError } = await supabase
      .from('github_installations')
      .select('installation_id, account_login')
      .eq('user_id', user.id)
      .is('suspended_at', null)

    if (installError) {
      console.error('Error fetching installations:', installError)
      return NextResponse.json(
        { error: 'Failed to fetch installations' },
        { status: 500 }
      )
    }

    if (!installations || installations.length === 0) {
      return NextResponse.json({
        installations: [],
        repositories: []
      })
    }

    // Get repositories for these installations
    const installationIds = installations.map(i => i.installation_id)

    const { data: repositories, error: repoError } = await supabase
      .from('github_repositories')
      .select('*')
      .in('installation_id', installationIds)
      .order('repository_name')

    if (repoError) {
      console.error('Error fetching repositories:', repoError)
      return NextResponse.json(
        { error: 'Failed to fetch repositories' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      installations,
      repositories: repositories || []
    })
  } catch (error) {
    console.error('Error in repositories route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Refresh repositories from GitHub (sync)
 */
export async function POST(request: NextRequest) {
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
    const { installationId } = await request.json()

    if (!installationId) {
      return NextResponse.json(
        { error: 'Installation ID required' },
        { status: 400 }
      )
    }

    // Verify user owns this installation
    const { data: installation } = await supabase
      .from('github_installations')
      .select('installation_id')
      .eq('user_id', user.id)
      .eq('installation_id', installationId)
      .single()

    if (!installation) {
      return NextResponse.json(
        { error: 'Installation not found' },
        { status: 404 }
      )
    }

    // Fetch fresh repository list from GitHub
    const { listRepositories } = await import('@/lib/integrations/github')
    const repos = await listRepositories(installationId)

    // Update database
    for (const repo of repos) {
      await supabase
        .from('github_repositories')
        .upsert({
          installation_id: installationId,
          repository_id: repo.id,
          repository_name: repo.name,
          full_name: repo.full_name,
          owner: repo.owner,
          private: repo.private,
          default_branch: repo.default_branch,
          html_url: repo.html_url,
          language: repo.language,
          updated_at: new Date().toISOString()
        })
    }

    return NextResponse.json({
      success: true,
      repositories: repos
    })
  } catch (error) {
    console.error('Error syncing repositories:', error)
    return NextResponse.json(
      { error: 'Failed to sync repositories' },
      { status: 500 }
    )
  }
}
