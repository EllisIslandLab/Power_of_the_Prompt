import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Get git status for the current repository
 * Returns modified, added, deleted files with their status
 * Pattern inspired by VS Code's git status provider
 */
export async function GET(request: NextRequest) {
  try {
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

    // Get user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get active project with GitHub info
    const { data: project, error: projectError } = await supabase
      .from('client_projects')
      .select('id, github_installation_id, github_repository_id, github_owner, github_repo_name, github_default_branch')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    if (projectError || !project) {
      return NextResponse.json({ error: 'No active project found' }, { status: 404 })
    }

    if (!project.github_installation_id || !project.github_repository_id) {
      return NextResponse.json({ error: 'GitHub not connected' }, { status: 404 })
    }

    // Get GitHub installation
    const { data: installation } = await supabase
      .from('github_installations')
      .select('installation_id')
      .eq('installation_id', project.github_installation_id)
      .single()

    if (!installation) {
      return NextResponse.json({ error: 'GitHub installation not found' }, { status: 404 })
    }

    // Get installation token
    const tokenResponse = await fetch(
      `https://api.github.com/app/installations/${installation.installation_id}/access_tokens`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${generateJWT()}`,
          Accept: 'application/vnd.github.v3+json',
        },
      }
    )

    if (!tokenResponse.ok) {
      return NextResponse.json({ error: 'Failed to get installation token' }, { status: 500 })
    }

    const { token } = await tokenResponse.json()

    // Get repository info
    const { data: repo } = await supabase
      .from('github_repositories')
      .select('repository_id, owner, name')
      .eq('id', project.github_repository_id)
      .single()

    if (!repo) {
      return NextResponse.json({ error: 'Repository not found' }, { status: 404 })
    }

    // Get commits comparing working branch to default branch
    // This gives us the list of changed files
    const defaultBranch = project.github_default_branch || 'main'

    // Get latest commit on default branch
    const branchResponse = await fetch(
      `https://api.github.com/repos/${repo.owner}/${repo.name}/branches/${defaultBranch}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github.v3+json',
        },
      }
    )

    if (!branchResponse.ok) {
      return NextResponse.json({ error: 'Failed to fetch branch info' }, { status: 500 })
    }

    const branchData = await branchResponse.json()
    const baseSha = branchData.commit.sha

    // Get recent commits
    const commitsResponse = await fetch(
      `https://api.github.com/repos/${repo.owner}/${repo.name}/commits?per_page=10`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github.v3+json',
        },
      }
    )

    if (!commitsResponse.ok) {
      return NextResponse.json({ error: 'Failed to fetch commits' }, { status: 500 })
    }

    const commits = await commitsResponse.json()

    // Get changed files from recent commits
    const changedFiles = new Map<string, { status: string; additions: number; deletions: number }>()

    for (const commit of commits.slice(0, 5)) {
      const commitResponse = await fetch(
        `https://api.github.com/repos/${repo.owner}/${repo.name}/commits/${commit.sha}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github.v3+json',
          },
        }
      )

      if (commitResponse.ok) {
        const commitData = await commitResponse.json()

        if (commitData.files) {
          for (const file of commitData.files) {
            // Map GitHub status to VS Code-style status
            let status = 'modified'
            if (file.status === 'added') status = 'added'
            else if (file.status === 'removed') status = 'deleted'
            else if (file.status === 'renamed') status = 'renamed'
            else if (file.status === 'modified') status = 'modified'

            changedFiles.set(file.filename, {
              status,
              additions: file.additions || 0,
              deletions: file.deletions || 0,
            })
          }
        }
      }
    }

    // Convert to array format
    const files = Array.from(changedFiles.entries()).map(([path, info]) => ({
      path,
      status: info.status,
      additions: info.additions,
      deletions: info.deletions,
    }))

    return NextResponse.json({
      files,
      repository: {
        owner: repo.owner,
        name: repo.name,
        defaultBranch,
      },
    })
  } catch (error: any) {
    console.error('[Git Status] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch git status' },
      { status: 500 }
    )
  }
}

/**
 * Generate JWT for GitHub App authentication
 */
function generateJWT() {
  const jwt = require('jsonwebtoken')
  const privateKey = process.env.GITHUB_PRIVATE_KEY?.replace(/\\n/g, '\n') || ''
  const appId = process.env.GITHUB_APP_ID || ''

  const payload = {
    iat: Math.floor(Date.now() / 1000) - 60,
    exp: Math.floor(Date.now() / 1000) + 10 * 60,
    iss: appId,
  }

  return jwt.sign(payload, privateKey, { algorithm: 'RS256' })
}
