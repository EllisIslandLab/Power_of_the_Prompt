// GitHub API helpers for fetching repository files

export interface GitHubFile {
  name: string
  path: string
  type: 'file' | 'dir'
  content?: string
}

export async function fetchRepoStructure(
  repoUrl: string,
  branch: string = 'main'
): Promise<GitHubFile[]> {
  try {
    // Parse GitHub URL: https://github.com/owner/repo
    const urlParts = repoUrl.replace('https://github.com/', '').split('/')
    const owner = urlParts[0]
    const repo = urlParts[1]

    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`,
      {
        headers: {
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
          Accept: 'application/vnd.github.v3+json',
        },
        next: { revalidate: 300 }, // Cache for 5 minutes
      }
    )

    if (!response.ok) {
      console.error('GitHub API error:', await response.text())
      return []
    }

    const data = await response.json()
    return data.tree.map((item: any) => ({
      name: item.path.split('/').pop(),
      path: item.path,
      type: item.type === 'tree' ? 'dir' : 'file',
    }))
  } catch (error) {
    console.error('Error fetching repo structure:', error)
    return []
  }
}

export async function fetchFileContent(
  repoUrl: string,
  filePath: string,
  branch: string = 'main'
): Promise<string | null> {
  try {
    const urlParts = repoUrl.replace('https://github.com/', '').split('/')
    const owner = urlParts[0]
    const repo = urlParts[1]

    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}?ref=${branch}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
          Accept: 'application/vnd.github.v3.raw',
        },
        next: { revalidate: 300 },
      }
    )

    if (!response.ok) {
      return null
    }

    return await response.text()
  } catch (error) {
    console.error(`Error fetching file ${filePath}:`, error)
    return null
  }
}

export async function fetchKeyProjectFiles(
  repoUrl: string,
  branch: string = 'main'
): Promise<{ [key: string]: string }> {
  const keyFiles = [
    'package.json',
    'README.md',
    'next.config.js',
    'next.config.mjs',
    'tsconfig.json',
    'tailwind.config.js',
    'tailwind.config.ts',
  ]

  const files: { [key: string]: string } = {}

  for (const file of keyFiles) {
    const content = await fetchFileContent(repoUrl, file, branch)
    if (content) {
      files[file] = content
    }
  }

  return files
}
