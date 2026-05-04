/**
 * Trial Period and Pricing Utilities
 *
 * Business Rules:
 * - Trial period: 90 days from account creation
 * - During trial: Free bug fixes (revisions under $0.50)
 * - After trial: $5/month basic support or $9/month enhanced support (optional)
 * - All AI revisions charged at cost: $0.003 per 1K tokens
 */

export interface ClientAccount {
  id: string
  trial_start_date: string
  trial_expiration_date: string
  trial_status: 'active' | 'expired' | 'converted'
  account_balance: number
  held_balance: number
}

export function isTrialActive(account: ClientAccount): boolean {
  return (
    account.trial_status === 'active' &&
    new Date(account.trial_expiration_date) > new Date()
  )
}

export function getDaysRemainingInTrial(account: ClientAccount): number {
  if (!isTrialActive(account)) return 0

  const now = new Date()
  const expiration = new Date(account.trial_expiration_date)
  const diffMs = expiration.getTime() - now.getTime()
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

  return Math.max(0, diffDays)
}

export function isBugFix(description: string): boolean {
  const bugFixKeywords = [
    'bug',
    'fix',
    'broken',
    'error',
    'issue',
    'problem',
    'not working',
    "doesn't work",
  ]

  const lowerDesc = description.toLowerCase()
  return bugFixKeywords.some(keyword => lowerDesc.includes(keyword))
}

export function shouldWaiveCost(
  account: ClientAccount,
  description: string,
  estimatedCost: number
): boolean {
  // Free bug fixes during trial if under $0.50
  if (isTrialActive(account) && isBugFix(description) && estimatedCost < 0.5) {
    return true
  }

  return false
}

export function getPricingTier(account: ClientAccount): 'trial' | 'basic' | 'enhanced' | 'payg' {
  if (isTrialActive(account)) {
    return 'trial'
  }

  // This would be set via a subscription field in the future
  // For now, all post-trial accounts are pay-as-you-go
  return 'payg'
}

export function getMonthlyRate(tier: 'trial' | 'basic' | 'enhanced' | 'payg'): number {
  switch (tier) {
    case 'trial':
      return 0
    case 'basic':
      return 5
    case 'enhanced':
      return 9
    case 'payg':
      return 0
  }
}

export function formatTrialStatus(account: ClientAccount): string {
  if (!isTrialActive(account)) {
    return 'Trial expired'
  }

  const daysRemaining = getDaysRemainingInTrial(account)
  if (daysRemaining === 0) {
    return 'Trial expires today'
  } else if (daysRemaining === 1) {
    return '1 day remaining in trial'
  } else {
    return `${daysRemaining} days remaining in trial`
  }
}

export function calculateRevisionCost(tokens: number): number {
  // Sonnet 3.5 pricing: $0.003 per 1K tokens
  return (tokens / 1000) * 0.003
}

export function estimateTokensForChange(description: string): number {
  // Simple estimation based on description length
  // This is a rough heuristic and should be refined with actual usage data
  const words = description.split(/\s+/).length
  const baseTokens = 2000 // Minimum for Claude to understand and respond
  const perWordTokens = 50 // Estimated tokens per word of description

  return baseTokens + words * perWordTokens
}

export function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2)}`
}

export function formatSmallCurrency(amount: number): string {
  // For very small amounts, show more decimals
  if (amount < 0.01) {
    return `$${amount.toFixed(4)}`
  }
  return formatCurrency(amount)
}
