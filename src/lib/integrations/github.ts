import { Octokit } from '@octokit/rest'
import { App } from '@octokit/app'
import crypto from 'crypto'
import fs from 'fs'

// Lazy initialization of GitHub App
let githubApp: App | null = null

function getGitHubApp(): App {
  if (!githubApp) {
    const privateKey = fs.readFileSync(process.env.GITHUB_APP_PRIVATE_KEY_PATH!, 'utf-8')
    const appId = parseInt(process.env.GITHUB_APP_ID!, 10)

    console.log('[GitHub] Initializing app with ID:', appId, 'type:', typeof appId)

    githubApp = new App({
      appId,
      privateKey
    })
  }
  return githubApp
}

export interface GitHubRepo {
  id: number
  name: string
  full_name: string
  owner: string
  private: boolean
  html_url: string
  description: string | null
  default_branch: string
  language: string | null
}

export interface GitHubFile {
  name: string
  path: string
  sha: string
  size: number
  content?: string
  type: 'file' | 'dir'
}

export interface GitHubInstallation {
  id: number
  account: {
    login: string
    type: string
  }
}

/**
 * List all installations for this GitHub App
 */
export async function listInstallations(): Promise<GitHubInstallation[]> {
  try {
    const app = getGitHubApp()
    const { data } = await app.octokit.request('GET /app/installations')
    return data
      .filter(installation => installation.account !== null)
      .map(installation => ({
        id: installation.id,
        account: {
          login: installation.account!.login,
          type: installation.account!.type
        }
      }))
  } catch (error) {
    console.error('Failed to list installations:', error)
    throw new Error('Failed to list GitHub installations')
  }
}

/**
 * Get installation access token for a specific installation
 * Tokens expire after 1 hour
 */
export async function getInstallationToken(installationId: number): Promise<string> {
  try {
    console.log('[GitHub] Getting installation token for installation:', installationId)
    console.log('[GitHub] App ID:', process.env.GITHUB_APP_ID)
    console.log('[GitHub] Private key path:', process.env.GITHUB_APP_PRIVATE_KEY_PATH)

    const app = getGitHubApp()
    console.log('[GitHub] App initialized, making request...')

    const { data } = await app.octokit.request(
      'POST /app/installations/{installation_id}/access_tokens',
      { installation_id: installationId }
    )
    console.log('[GitHub] Successfully got installation token')
    return data.token
  } catch (error: any) {
    console.error('Failed to get installation token:', error)
    console.error('Error details:', {
      status: error.status,
      message: error.message,
      response: error.response?.data
    })
    throw new Error('Failed to authenticate with GitHub')
  }
}

/**
 * Get Octokit instance with installation token
 */
export async function getInstallationOctokit(installationId: number): Promise<Octokit> {
  const token = await getInstallationToken(installationId)
  return new Octokit({ auth: token })
}

/**
 * List all repositories accessible by this installation
 */
export async function listRepositories(installationId: number): Promise<GitHubRepo[]> {
  const octokit = await getInstallationOctokit(installationId)

  try {
    const { data } = await octokit.request('GET /installation/repositories', {
      per_page: 100
    })

    return data.repositories.map(repo => ({
      id: repo.id,
      name: repo.name,
      full_name: repo.full_name,
      owner: repo.owner.login,
      private: repo.private,
      html_url: repo.html_url,
      description: repo.description,
      default_branch: repo.default_branch,
      language: repo.language
    }))
  } catch (error) {
    console.error('Failed to list repositories:', error)
    throw new Error('Failed to fetch repositories')
  }
}

/**
 * Get specific repository details
 */
export async function getRepository(
  installationId: number,
  owner: string,
  repo: string
): Promise<GitHubRepo> {
  const octokit = await getInstallationOctokit(installationId)

  try {
    const { data } = await octokit.repos.get({ owner, repo })

    return {
      id: data.id,
      name: data.name,
      full_name: data.full_name,
      owner: data.owner.login,
      private: data.private,
      html_url: data.html_url,
      description: data.description,
      default_branch: data.default_branch,
      language: data.language
    }
  } catch (error) {
    console.error('Failed to get repository:', error)
    throw new Error('Repository not found or access denied')
  }
}

/**
 * Get file contents from repository
 */
export async function getFileContents(
  installationId: number,
  owner: string,
  repo: string,
  path: string,
  ref?: string
): Promise<string> {
  const octokit = await getInstallationOctokit(installationId)

  try {
    const { data } = await octokit.repos.getContent({
      owner,
      repo,
      path,
      ...(ref && { ref })
    })

    if (Array.isArray(data) || data.type !== 'file') {
      throw new Error('Path is not a file')
    }

    return Buffer.from(data.content, 'base64').toString('utf-8')
  } catch (error: any) {
    if (error.status === 404) {
      throw new Error(`File not found: ${path}`)
    }
    console.error('Failed to get file contents:', error)
    throw new Error('Failed to read file')
  }
}

/**
 * Get multiple files in parallel
 */
export async function getMultipleFiles(
  installationId: number,
  owner: string,
  repo: string,
  paths: string[],
  ref?: string
): Promise<Record<string, string | null>> {
  const results: Record<string, string | null> = {}

  await Promise.all(
    paths.map(async (path) => {
      try {
        results[path] = await getFileContents(installationId, owner, repo, path, ref)
      } catch (error) {
        results[path] = null
      }
    })
  )

  return results
}

/**
 * List directory contents
 */
export async function listDirectory(
  installationId: number,
  owner: string,
  repo: string,
  path: string = '',
  ref?: string
): Promise<GitHubFile[]> {
  const octokit = await getInstallationOctokit(installationId)

  try {
    const { data } = await octokit.repos.getContent({
      owner,
      repo,
      path,
      ...(ref && { ref })
    })

    if (!Array.isArray(data)) {
      throw new Error('Path is not a directory')
    }

    return data.map(item => ({
      name: item.name,
      path: item.path,
      sha: item.sha,
      size: item.size,
      type: item.type as 'file' | 'dir'
    }))
  } catch (error: any) {
    if (error.status === 404) {
      throw new Error(`Directory not found: ${path}`)
    }
    console.error('Failed to list directory:', error)
    throw new Error('Failed to read directory')
  }
}

/**
 * Create a new branch
 */
export async function createBranch(
  installationId: number,
  owner: string,
  repo: string,
  branchName: string,
  fromBranch: string = 'main'
): Promise<void> {
  const octokit = await getInstallationOctokit(installationId)

  try {
    // Get the SHA of the source branch
    const { data: refData } = await octokit.git.getRef({
      owner,
      repo,
      ref: `heads/${fromBranch}`
    })

    // Create new branch
    await octokit.git.createRef({
      owner,
      repo,
      ref: `refs/heads/${branchName}`,
      sha: refData.object.sha
    })
  } catch (error: any) {
    if (error.status === 422) {
      throw new Error(`Branch ${branchName} already exists`)
    }
    console.error('Failed to create branch:', error)
    throw new Error('Failed to create branch')
  }
}

/**
 * Get current file SHA from branch (returns null if file doesn't exist)
 */
export async function getFileSha(
  installationId: number,
  owner: string,
  repo: string,
  path: string,
  branch: string
): Promise<string | null> {
  const octokit = await getInstallationOctokit(installationId)

  try {
    const { data } = await octokit.repos.getContent({
      owner,
      repo,
      path,
      ref: branch
    })

    if ('sha' in data) {
      return data.sha
    }
    return null
  } catch (error: any) {
    if (error.status === 404) {
      return null // File doesn't exist
    }
    throw error
  }
}

/**
 * Create or update a file
 */
export async function createOrUpdateFile(
  installationId: number,
  owner: string,
  repo: string,
  path: string,
  content: string,
  message: string,
  branch: string,
  sha?: string // Required for updates
): Promise<void> {
  const octokit = await getInstallationOctokit(installationId)

  try {
    // If no SHA provided, try to fetch current file SHA
    let fileSha = sha
    if (!fileSha) {
      fileSha = await getFileSha(installationId, owner, repo, path, branch) || undefined
    }

    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path,
      message,
      content: Buffer.from(content).toString('base64'),
      branch,
      ...(fileSha && { sha: fileSha })
    })
  } catch (error) {
    console.error('Failed to create/update file:', error)
    throw new Error('Failed to update file')
  }
}

/**
 * Create a pull request
 */
export async function createPullRequest(
  installationId: number,
  owner: string,
  repo: string,
  title: string,
  head: string,
  base: string,
  body?: string
): Promise<{ number: number; html_url: string }> {
  const octokit = await getInstallationOctokit(installationId)

  try {
    const { data } = await octokit.pulls.create({
      owner,
      repo,
      title,
      head,
      base,
      body: body || ''
    })

    return {
      number: data.number,
      html_url: data.html_url
    }
  } catch (error) {
    console.error('Failed to create pull request:', error)
    throw new Error('Failed to create pull request')
  }
}

/**
 * Merge a pull request
 */
export async function mergePullRequest(
  installationId: number,
  owner: string,
  repo: string,
  pullNumber: number,
  commitMessage?: string
): Promise<void> {
  const octokit = await getInstallationOctokit(installationId)

  try {
    await octokit.pulls.merge({
      owner,
      repo,
      pull_number: pullNumber,
      ...(commitMessage && { commit_message: commitMessage })
    })
  } catch (error) {
    console.error('Failed to merge pull request:', error)
    throw new Error('Failed to merge pull request')
  }
}

/**
 * Delete a branch
 */
export async function deleteBranch(
  installationId: number,
  owner: string,
  repo: string,
  branchName: string
): Promise<void> {
  const octokit = await getInstallationOctokit(installationId)

  try {
    await octokit.git.deleteRef({
      owner,
      repo,
      ref: `heads/${branchName}`
    })
  } catch (error) {
    console.error('Failed to delete branch:', error)
    throw new Error('Failed to delete branch')
  }
}

/**
 * Verify webhook signature
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const hmac = crypto.createHmac('sha256', secret)
  const digest = 'sha256=' + hmac.update(payload).digest('hex')

  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(digest)
    )
  } catch {
    return false
  }
}

/**
 * Exchange OAuth code for user access token
 */
export async function exchangeCodeForToken(code: string): Promise<{
  access_token: string
  token_type: string
  scope: string
}> {
  const response = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      client_id: process.env.GITHUB_APP_CLIENT_ID,
      client_secret: process.env.GITHUB_APP_CLIENT_SECRET,
      code
    })
  })

  if (!response.ok) {
    throw new Error('Failed to exchange code for token')
  }

  return response.json()
}

/**
 * Get user details with OAuth token
 */
export async function getUserWithToken(accessToken: string): Promise<{
  id: number
  login: string
  name: string
  email: string
  avatar_url: string
}> {
  const octokit = new Octokit({ auth: accessToken })

  try {
    const { data } = await octokit.users.getAuthenticated()

    return {
      id: data.id,
      login: data.login,
      name: data.name || data.login,
      email: data.email || '',
      avatar_url: data.avatar_url
    }
  } catch (error) {
    console.error('Failed to get user:', error)
    throw new Error('Failed to get user information')
  }
}
