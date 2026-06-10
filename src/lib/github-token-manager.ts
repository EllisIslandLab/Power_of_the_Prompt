import jwt from 'jsonwebtoken'

/**
 * GitHub Token Manager
 * Centralized management of GitHub App installation tokens with automatic refresh
 *
 * GitHub installation tokens expire after 1 hour, so we:
 * - Cache tokens with their expiry time
 * - Automatically refresh before expiry
 * - Handle refresh failures gracefully
 */

interface CachedToken {
  token: string
  expiresAt: Date
}

// In-memory cache of installation tokens
// Key: installation_id, Value: { token, expiresAt }
const tokenCache = new Map<number, CachedToken>()

// Refresh tokens 5 minutes before they expire to avoid edge cases
const REFRESH_BUFFER_MS = 5 * 60 * 1000 // 5 minutes

/**
 * Generate GitHub App JWT for authentication
 * This is used to request installation tokens
 */
function generateAppJWT(): string {
  const privateKey = process.env.GITHUB_PRIVATE_KEY?.replace(/\\n/g, '\n') || ''
  const appId = process.env.GITHUB_APP_ID || ''

  if (!privateKey || !appId) {
    throw new Error('GitHub App credentials not configured')
  }

  const now = Math.floor(Date.now() / 1000)

  const payload = {
    iat: now - 60, // Issued 60 seconds ago (clock skew tolerance)
    exp: now + (10 * 60), // Expires in 10 minutes
    iss: appId,
  }

  return jwt.sign(payload, privateKey, { algorithm: 'RS256' })
}

/**
 * Fetch a fresh installation token from GitHub API
 */
async function fetchInstallationToken(installationId: number): Promise<CachedToken> {
  const appJWT = generateAppJWT()

  const response = await fetch(
    `https://api.github.com/app/installations/${installationId}/access_tokens`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${appJWT}`,
        Accept: 'application/vnd.github.v3+json',
      },
    }
  )

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(
      `Failed to get GitHub installation token: ${response.status} - ${errorText}`
    )
  }

  const data = await response.json()

  return {
    token: data.token,
    expiresAt: new Date(data.expires_at),
  }
}

/**
 * Get a valid installation token, using cache or refreshing if needed
 *
 * @param installationId - GitHub installation ID
 * @returns Valid installation token
 */
export async function getInstallationToken(installationId: number): Promise<string> {
  const cached = tokenCache.get(installationId)
  const now = new Date()

  // Check if we have a cached token that's still valid (with buffer)
  if (cached && cached.expiresAt.getTime() - now.getTime() > REFRESH_BUFFER_MS) {
    console.log(`[GitHub Token] Using cached token for installation ${installationId}`)
    return cached.token
  }

  // Token is expired or about to expire - fetch a new one
  console.log(`[GitHub Token] Fetching fresh token for installation ${installationId}`)

  try {
    const freshToken = await fetchInstallationToken(installationId)
    tokenCache.set(installationId, freshToken)

    console.log(
      `[GitHub Token] ✓ Token cached until ${freshToken.expiresAt.toISOString()}`
    )

    return freshToken.token
  } catch (error: any) {
    console.error(
      `[GitHub Token] Failed to fetch token for installation ${installationId}:`,
      error.message
    )

    // If we have an expired cached token, try to use it anyway
    // (better than failing completely)
    if (cached) {
      console.warn('[GitHub Token] Using expired cached token as fallback')
      return cached.token
    }

    throw error
  }
}

/**
 * Clear cached token for an installation
 * Useful when we know a token is invalid (e.g., after uninstall/reinstall)
 */
export function clearInstallationToken(installationId: number): void {
  tokenCache.delete(installationId)
  console.log(`[GitHub Token] Cleared cached token for installation ${installationId}`)
}

/**
 * Clear all cached tokens
 * Useful for testing or when credentials change
 */
export function clearAllTokens(): void {
  tokenCache.clear()
  console.log('[GitHub Token] Cleared all cached tokens')
}

/**
 * Get cache statistics (for debugging)
 */
export function getTokenCacheStats() {
  const now = new Date()
  const stats = {
    totalCached: tokenCache.size,
    valid: 0,
    expiringSoon: 0,
    expired: 0,
    entries: [] as Array<{
      installationId: number
      expiresAt: string
      timeRemaining: string
      isValid: boolean
    }>,
  }

  for (const [installationId, cached] of tokenCache.entries()) {
    const timeRemaining = cached.expiresAt.getTime() - now.getTime()
    const isValid = timeRemaining > REFRESH_BUFFER_MS

    if (isValid) {
      stats.valid++
    } else if (timeRemaining > 0) {
      stats.expiringSoon++
    } else {
      stats.expired++
    }

    stats.entries.push({
      installationId,
      expiresAt: cached.expiresAt.toISOString(),
      timeRemaining: `${Math.floor(timeRemaining / 1000 / 60)} minutes`,
      isValid,
    })
  }

  return stats
}
