import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getFileContents } from '@/lib/integrations/github'

/**
 * Get file contents from GitHub repository
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

    if (!project.github_owner || !project.github_repo_name) {
      return NextResponse.json(
        { error: 'Project not connected to GitHub' },
        { status: 400 }
      )
    }

    // Get installation ID - either from query param or database
    const url = new URL(request.url)
    const requestedInstallationId = url.searchParams.get('installation_id')
    const filePath = url.searchParams.get('path')

    if (!filePath) {
      return NextResponse.json(
        { error: 'File path required' },
        { status: 400 }
      )
    }

    let installationId: number

    if (requestedInstallationId) {
      // Verify user has access to this installation
      const { data: installation } = await supabase
        .from('github_installations')
        .select('installation_id')
        .eq('user_id', user.id)
        .eq('installation_id', parseInt(requestedInstallationId))
        .single()

      if (!installation) {
        return NextResponse.json(
          { error: 'Installation not found or access denied' },
          { status: 403 }
        )
      }

      installationId = installation.installation_id
    } else {
      // Fall back to first installation
      const { data: installation } = await supabase
        .from('github_installations')
        .select('installation_id')
        .eq('user_id', user.id)
        .single()

      if (!installation) {
        return NextResponse.json(
          { error: 'GitHub not connected' },
          { status: 400 }
        )
      }

      installationId = installation.installation_id
    }

    // Fetch file contents from GitHub
    const content = await getFileContents(
      installationId,
      project.github_owner,
      project.github_repo_name,
      filePath
    )

    return NextResponse.json({
      content,
      path: filePath,
      project: {
        owner: project.github_owner,
        repo: project.github_repo_name
      }
    })
  } catch (error: any) {
    console.error('Error fetching file content:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch file content' },
      { status: 500 }
    )
  }
}
