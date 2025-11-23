interface PurchaseHistory {
  tiers: Array<{
    tier: string
    amount_paid: number
  }>
}

interface PricingResult {
  originalPrice: number
  rolloverCredit: number
  skipDiscount: number
  finalPrice: number
  totalSpentSoFar: number
}

const TIER_PRICES = {
  ai_premium: 5,
  textbook: 19,
  basic: 300,
  mid: 1000,
  pro: 3000
}

export function calculateRolloverPrice(
  targetTier: string,
  purchaseHistory: PurchaseHistory
): PricingResult {
  const originalPrice = TIER_PRICES[targetTier as keyof typeof TIER_PRICES]

  // Calculate total spent so far
  const totalSpentSoFar = purchaseHistory.tiers.reduce(
    (sum, purchase) => sum + purchase.amount_paid,
    0
  )

  // Determine if skip discount applies
  const lastTier = purchaseHistory.tiers[purchaseHistory.tiers.length - 1]?.tier
  const isSkipping = lastTier && !isConsecutiveTier(lastTier, targetTier)

  // Calculate skip discount (10% of target tier)
  const skipDiscount = isSkipping ? originalPrice * 0.1 : 0

  // Calculate rollover credit (what they've paid already)
  const rolloverCredit = totalSpentSoFar

  // Apply ONLY the better discount (rollover OR skip, not both)
  // This prevents loopholes where users could stack discounts
  const bestDiscount = Math.max(rolloverCredit, skipDiscount)
  const finalPrice = Math.max(0, originalPrice - bestDiscount)

  return {
    originalPrice,
    rolloverCredit,
    skipDiscount,
    finalPrice,
    totalSpentSoFar: totalSpentSoFar + finalPrice
  }
}

function isConsecutiveTier(fromTier: string, toTier: string): boolean {
  const order = ['ai_premium', 'textbook', 'basic', 'mid', 'pro']
  const fromIndex = order.indexOf(fromTier)
  const toIndex = order.indexOf(toTier)
  return toIndex === fromIndex + 1
}

// Helper function to get tier prices
export function getTierPrice(tier: string): number {
  return TIER_PRICES[tier as keyof typeof TIER_PRICES] || 0
}

// Calculate pricing for display purposes
export function calculateTierPricing(userPurchases: Array<{ tier: string; amount_paid: number }>) {
  const purchaseHistory: PurchaseHistory = {
    tiers: userPurchases.map(p => ({
      tier: p.tier,
      amount_paid: p.amount_paid
    }))
  }

  return {
    ai_premium: calculateRolloverPrice('ai_premium', purchaseHistory),
    textbook: calculateRolloverPrice('textbook', purchaseHistory),
    basic: calculateRolloverPrice('basic', purchaseHistory),
    mid: calculateRolloverPrice('mid', purchaseHistory),
    pro: calculateRolloverPrice('pro', purchaseHistory)
  }
}
