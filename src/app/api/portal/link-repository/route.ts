import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Link a GitHub repository to the active project
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
    const body = await request.json()
    const { installation_id, repository_id, repository_name, owner, default_branch } = body

    if (!installation_id || !repository_id || !repository_name || !owner) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get the repository UUID from github_repositories table
    const { data: repoData, error: repoError } = await supabase
      .from('github_repositories')
      .select('id')
      .eq('installation_id', installation_id)
      .eq('repository_id', repository_id)
      .single()

    if (repoError || !repoData) {
      console.error('[Link Repository] Repository not found:', repoError)
      return NextResponse.json(
        { error: 'Repository not found in database' },
        { status: 404 }
      )
    }

    // Get the active project for this user
    const { data: project, error: projectError } = await supabase
      .from('client_projects')
      .select('id, project_name')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    if (projectError || !project) {
      console.error('[Link Repository] No active project found:', projectError)
      return NextResponse.json(
        { error: 'No active project found' },
        { status: 404 }
      )
    }

    // Link the repository to the project
    const { error: updateError } = await supabase
      .from('client_projects')
      .update({
        github_installation_id: installation_id,
        github_repository_id: repoData.id,
        github_owner: owner,
        github_repo_name: repository_name,
        github_default_branch: default_branch || 'main'
      })
      .eq('id', project.id)

    if (updateError) {
      console.error('[Link Repository] Failed to link:', updateError)
      return NextResponse.json(
        { error: 'Failed to link repository' },
        { status: 500 }
      )
    }

    console.log('[Link Repository] Successfully linked', repository_name, 'to project', project.project_name)

    return NextResponse.json({
      success: true,
      project: project.project_name,
      repository: `${owner}/${repository_name}`
    })
  } catch (error: any) {
    console.error('[Link Repository] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
