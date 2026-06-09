export interface VercelProject {
  id: string
  name: string
  framework: string | null
  gitRepository: {
    type: string
    repo: string
  } | null
  link: {
    type: string
    repo: string
    repoId: number
    org: string
    gitCredentialId: string
    productionBranch: string
  } | null
  productionDeployment: {
    id: string
    url: string
    state: string
    createdAt: number
  } | null
}

export interface VercelDeployment {
  id: string
  url: string
  name: string
  state: 'BUILDING' | 'ERROR' | 'INITIALIZING' | 'QUEUED' | 'READY' | 'CANCELED'
  type: 'PRODUCTION' | 'PREVIEW'
  createdAt: number
  readyState: 'READY' | 'ERROR' | 'BUILDING' | 'QUEUED' | 'CANCELED'
  target: 'production' | 'staging' | null
}

/**
 * Exchange OAuth code for access token
 */
export async function exchangeVercelCode(code: string): Promise<{
  access_token: string
  team_id?: string
  user_id: string
}> {
  const response = await fetch('https://api.vercel.com/v2/oauth/access_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      client_id: process.env.VERCEL_CLIENT_ID!,
      client_secret: process.env.VERCEL_CLIENT_SECRET!,
      code,
      redirect_uri: process.env.VERCEL_REDIRECT_URI!
    })
  })

  if (!response.ok) {
    const error = await response.text()
    console.error('Vercel token exchange failed:', error)
    throw new Error('Failed to exchange Vercel code for token')
  }

  return response.json()
}

/**
 * Get user details
 */
export async function getVercelUser(accessToken: string): Promise<{
  user: {
    id: string
    email: string
    name: string
    username: string
  }
}> {
  const response = await fetch('https://api.vercel.com/v2/user', {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  })

  if (!response.ok) {
    const error = await response.text()
    console.error('Failed to fetch Vercel user:', response.status, error)
    throw new Error(`Failed to fetch Vercel user: ${response.status}`)
  }

  return response.json()
}

/**
 * List all projects
 */
export async function listVercelProjects(
  accessToken: string,
  teamId?: string
): Promise<VercelProject[]> {
  const url = new URL('https://api.vercel.com/v9/projects')
  if (teamId) {
    url.searchParams.set('teamId', teamId)
  }

  const response = await fetch(url.toString(), {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  })

  if (!response.ok) {
    throw new Error('Failed to fetch Vercel projects')
  }

  const data = await response.json()
  return data.projects || []
}

/**
 * Get specific project details
 */
export async function getVercelProject(
  accessToken: string,
  projectId: string,
  teamId?: string
): Promise<VercelProject> {
  const url = new URL(`https://api.vercel.com/v9/projects/${projectId}`)
  if (teamId) {
    url.searchParams.set('teamId', teamId)
  }

  const response = await fetch(url.toString(), {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  })

  if (!response.ok) {
    throw new Error('Failed to fetch Vercel project')
  }

  return response.json()
}

/**
 * Create deployment from Git
 */
export async function createVercelDeployment(
  accessToken: string,
  projectName: string,
  gitSource: {
    type: 'github'
    repo: string // owner/repo
    ref?: string // branch name
  },
  teamId?: string
): Promise<VercelDeployment> {
  const url = new URL('https://api.vercel.com/v13/deployments')
  if (teamId) {
    url.searchParams.set('teamId', teamId)
  }

  const response = await fetch(url.toString(), {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: projectName,
      gitSource,
      target: gitSource.ref === 'main' || gitSource.ref === 'master' ? 'production' : null
    })
  })

  if (!response.ok) {
    const error = await response.text()
    console.error('Failed to create deployment:', error)
    throw new Error('Failed to create Vercel deployment')
  }

  return response.json()
}

/**
 * Get deployment details
 */
export async function getVercelDeployment(
  accessToken: string,
  deploymentId: string,
  teamId?: string
): Promise<VercelDeployment> {
  const url = new URL(`https://api.vercel.com/v13/deployments/${deploymentId}`)
  if (teamId) {
    url.searchParams.set('teamId', teamId)
  }

  const response = await fetch(url.toString(), {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  })

  if (!response.ok) {
    throw new Error('Failed to fetch deployment')
  }

  return response.json()
}

/**
 * Cancel a deployment
 */
export async function cancelVercelDeployment(
  accessToken: string,
  deploymentId: string,
  teamId?: string
): Promise<void> {
  const url = new URL(`https://api.vercel.com/v12/deployments/${deploymentId}/cancel`)
  if (teamId) {
    url.searchParams.set('teamId', teamId)
  }

  const response = await fetch(url.toString(), {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  })

  if (!response.ok) {
    throw new Error('Failed to cancel deployment')
  }
}

/**
 * Find Vercel project that matches a GitHub repository
 */
export async function findMatchingVercelProject(
  accessToken: string,
  githubFullName: string, // e.g., "user/repo"
  teamId?: string
): Promise<VercelProject | null> {
  const projects = await listVercelProjects(accessToken, teamId)

  // First try exact match on git repo
  let match = projects.find(p =>
    p.link?.repo === githubFullName ||
    p.gitRepository?.repo === githubFullName
  )

  if (match) return match

  // Fallback: try matching just the repo name
  const repoName = githubFullName.split('/')[1]
  match = projects.find(p => p.name === repoName)

  return match || null
}
