import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { listDirectory, getInstallationToken } from '@/lib/integrations/github'

/**
 * Get file tree from GitHub repository
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
    const url = new URL(request.url)

    // Get active project
    const { data: projects } = await supabase
      .from('client_projects')
      .select('*')
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

    console.log('[Files API] Project:', {
      id: project.id,
      name: project.project_name,
      github_owner: project.github_owner,
      github_repo_name: project.github_repo_name
    })

    if (!project.github_owner || !project.github_repo_name) {
      console.log('[Files API] Project not connected to GitHub')
      return NextResponse.json(
        { error: 'Project not connected to GitHub' },
        { status: 400 }
      )
    }

    // Get installation ID from the project's linked repository
    let installationId: number | null = null

    if (project.github_repository_id) {
      // Get installation from the linked repository
      const { data: repo } = await supabase
        .from('github_repositories')
        .select('installation_id')
        .eq('id', project.github_repository_id)
        .single()

      if (repo) {
        installationId = repo.installation_id
        console.log('[Files API] Using installation from linked repo:', installationId)
      }
    }

    // Fallback: try query param or user's installation
    if (!installationId) {
      const requestedInstallationId = url.searchParams.get('installation_id')

      if (requestedInstallationId) {
        // Verify user has access to this installation
        const { data: installation } = await supabase
          .from('github_installations')
          .select('installation_id')
          .eq('user_id', user.id)
          .eq('installation_id', parseInt(requestedInstallationId))
          .single()

        if (installation) {
          installationId = installation.installation_id
        }
      } else {
        // Last resort: use user's first installation
        const { data: installation } = await supabase
          .from('github_installations')
          .select('installation_id')
          .eq('user_id', user.id)
          .single()

        if (installation) {
          installationId = installation.installation_id
        }
      }
    }

    if (!installationId) {
      console.log('[Files API] No valid installation found')
      return NextResponse.json(
        { error: 'GitHub not connected' },
        { status: 400 }
      )
    }

    console.log('[Files API] Using installation ID:', installationId)

    // Get path from query params (optional, defaults to root)
    const path = url.searchParams.get('path') || ''

    // Fetch directory contents from GitHub
    const files = await listDirectory(
      installationId,
      project.github_owner,
      project.github_repo_name,
      path
    )

    return NextResponse.json({
      files,
      project: {
        owner: project.github_owner,
        repo: project.github_repo_name,
        path
      }
    })
  } catch (error: any) {
    console.error('Error fetching files:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch files' },
      { status: 500 }
    )
  }
}
