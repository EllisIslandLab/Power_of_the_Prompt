/**
 * Affiliate utility functions for badge tracking and compensation
 */

/**
 * Generate a badge click tracking URL
 * @param referrerId - The UUID of the affiliate who owns the badge
 * @param sourceDomain - The domain where the badge is placed
 */
export function generateBadgeClickUrl(
  referrerId: string,
  sourceDomain?: string
): string {
  const params = new URLSearchParams({
    ref: referrerId,
    ...(sourceDomain && { src: sourceDomain }),
  })

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://weblaunchacademy.com'
  return `${baseUrl}?${params.toString()}`
}

/**
 * Track a badge click on the client side
 * This should be called when someone clicks an affiliate badge
 */
export async function trackBadgeClick(
  referrerId: string,
  referrerEmail: string,
  sourceDomain?: string,
  sourceUrl?: string
): Promise<{ badgeClickId: string; success: boolean }> {
  try {
    const sessionId = generateSessionId()

    const response = await fetch('/api/affiliate/badge-click', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        referrerId,
        referrerEmail,
        sourceDomain: sourceDomain || window.location.hostname,
        sourceUrl: sourceUrl || window.location.href,
        sessionId,
      }),
    })

    if (!response.ok) {
      console.error('Failed to track badge click:', response.statusText)
      return { badgeClickId: '', success: false }
    }

    const data = await response.json()

    // Store session ID in localStorage for later matching with purchase
    if (data.badgeClickId) {
      sessionStorage.setItem('wla_badge_click_id', data.badgeClickId)
      sessionStorage.setItem('wla_badge_click_time', new Date().toISOString())
    }

    return {
      badgeClickId: data.badgeClickId || '',
      success: !!data.success,
    }
  } catch (error) {
    console.error('Error tracking badge click:', error)
    return { badgeClickId: '', success: false }
  }
}

/**
 * Generate a unique session ID for tracking
 */
function generateSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Get the stored badge click ID from session storage
 */
export function getBadgeClickId(): string | null {
  if (typeof window === 'undefined') return null
  return sessionStorage.getItem('wla_badge_click_id')
}

/**
 * Clear stored badge click data after purchase
 */
export function clearBadgeClickData(): void {
  if (typeof window === 'undefined') return
  sessionStorage.removeItem('wla_badge_click_id')
  sessionStorage.removeItem('wla_badge_click_time')
}

/**
 * Check if a user clicked through an affiliate badge
 * by looking for ref parameter in URL
 */
export function getAffiliateRefFromUrl(): {
  referrerId: string | null
  sourceDomain: string | null
} {
  if (typeof window === 'undefined') {
    return { referrerId: null, sourceDomain: null }
  }

  const params = new URLSearchParams(window.location.search)
  const referrerId = params.get('ref')
  const sourceDomain = params.get('src')

  return { referrerId, sourceDomain }
}
