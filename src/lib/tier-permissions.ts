// Tier-based access control utilities

export type TierLevel = 'basic' | 'tier1' | 'tier2' | 'premium' | 'tier3' | 'vip' | 'tier4' | 'enterprise'

export interface TierPermissions {
  code_download: boolean
  ai_modifications: number // -1 means unlimited
  textbook: boolean
  recordings: boolean
  group_course: boolean
  lvl_ups: number
  guaranteed_website: boolean
  master_toolkit: boolean
}

export const TIER_PERMISSIONS: Record<TierLevel, TierPermissions> = {
  basic: {
    code_download: false,
    ai_modifications: 0,
    textbook: false,
    recordings: false,
    group_course: false,
    lvl_ups: 0,
    guaranteed_website: false,
    master_toolkit: false,
  },
  tier1: {
    code_download: true,
    ai_modifications: 20,
    textbook: true,
    recordings: false,
    group_course: false,
    lvl_ups: 0,
    guaranteed_website: false,
    master_toolkit: false,
  },
  tier2: {
    code_download: true,
    ai_modifications: 20,
    textbook: true,
    recordings: true,
    group_course: false,
    lvl_ups: 0,
    guaranteed_website: false,
    master_toolkit: false,
  },
  premium: {
    code_download: true,
    ai_modifications: 20,
    textbook: true,
    recordings: true,
    group_course: false,
    lvl_ups: 0,
    guaranteed_website: false,
    master_toolkit: false,
  },
  tier3: {
    code_download: true,
    ai_modifications: -1, // Unlimited
    textbook: true,
    recordings: true,
    group_course: true,
    lvl_ups: 1,
    guaranteed_website: false,
    master_toolkit: false,
  },
  vip: {
    code_download: true,
    ai_modifications: -1, // Unlimited
    textbook: true,
    recordings: true,
    group_course: true,
    lvl_ups: 1,
    guaranteed_website: false,
    master_toolkit: false,
  },
  tier4: {
    code_download: true,
    ai_modifications: -1, // Unlimited
    textbook: true,
    recordings: true,
    group_course: true,
    lvl_ups: 10,
    guaranteed_website: true,
    master_toolkit: true,
  },
  enterprise: {
    code_download: true,
    ai_modifications: -1, // Unlimited
    textbook: true,
    recordings: true,
    group_course: true,
    lvl_ups: 10,
    guaranteed_website: true,
    master_toolkit: true,
  },
}

export function getTierPermissions(tier: string | null | undefined): TierPermissions {
  if (!tier) return TIER_PERMISSIONS.basic

  const normalizedTier = tier.toLowerCase() as TierLevel
  return TIER_PERMISSIONS[normalizedTier] || TIER_PERMISSIONS.basic
}

export function hasPermission(tier: string | null | undefined, permission: keyof TierPermissions): boolean {
  const permissions = getTierPermissions(tier)
  const value = permissions[permission]

  if (typeof value === 'boolean') return value
  if (typeof value === 'number') return value > 0 || value === -1

  return false
}

export function canAccessTextbook(tier: string | null | undefined): boolean {
  return hasPermission(tier, 'textbook')
}

export function canAccessRecordings(tier: string | null | undefined): boolean {
  return hasPermission(tier, 'recordings')
}

export function canAccessGroupCourse(tier: string | null | undefined): boolean {
  return hasPermission(tier, 'group_course')
}

export function canAccessMasterToolkit(tier: string | null | undefined): boolean {
  return hasPermission(tier, 'master_toolkit')
}

export function canDownloadCode(tier: string | null | undefined): boolean {
  return hasPermission(tier, 'code_download')
}

export function getAIModificationsLimit(tier: string | null | undefined): number {
  const permissions = getTierPermissions(tier)
  return permissions.ai_modifications
}

export function getLvlUpsIncluded(tier: string | null | undefined): number {
  const permissions = getTierPermissions(tier)
  return permissions.lvl_ups
}

export function hasGuaranteedWebsite(tier: string | null | undefined): boolean {
  return hasPermission(tier, 'guaranteed_website')
}

// Tier comparison utilities
export function getTierLevel(tier: string | null | undefined): number {
  const tierMap: Record<string, number> = {
    'basic': 0,
    'tier1': 1,
    'tier2': 2,
    'premium': 2,
    'tier3': 3,
    'vip': 3,
    'tier4': 4,
    'enterprise': 4,
  }

  if (!tier) return 0
  return tierMap[tier.toLowerCase()] || 0
}

export function hasMinimumTier(userTier: string | null | undefined, requiredTier: TierLevel): boolean {
  return getTierLevel(userTier) >= getTierLevel(requiredTier)
}

// Tier display utilities
export function getTierDisplayName(tier: string | null | undefined): string {
  const displayNames: Record<string, string> = {
    'basic': 'Basic',
    'tier1': 'Tier 1 - Starter',
    'tier2': 'Tier 2 - Plus',
    'premium': 'Tier 2 - Plus',
    'tier3': 'Tier 3 - Pro',
    'vip': 'Tier 3 - Pro',
    'tier4': 'Tier 4 - Elite',
    'enterprise': 'Tier 4 - Elite',
  }

  if (!tier) return 'Basic'
  return displayNames[tier.toLowerCase()] || 'Basic'
}

export function getTierDescription(tier: TierLevel): string {
  const descriptions: Record<TierLevel, string> = {
    'basic': 'No access to premium features',
    'tier1': 'Code download, 20 AI modifications, Textbook access',
    'tier2': 'Everything in Tier 1 + Recordings access',
    'premium': 'Everything in Tier 1 + Recordings access',
    'tier3': 'Everything in Tier 2 + Group course, 1 LVL UP, Unlimited AI mods',
    'vip': 'Everything in Tier 2 + Group course, 1 LVL UP, Unlimited AI mods',
    'tier4': 'Everything + Guaranteed website, 10 LVL UPs, Master Toolkit',
    'enterprise': 'Everything + Guaranteed website, 10 LVL UPs, Master Toolkit',
  }

  return descriptions[tier] || descriptions.basic
}

// Feature descriptions for paywalls
export const FEATURE_DESCRIPTIONS = {
  recordings: {
    title: 'Course Recordings',
    description: 'Access to all course recordings and video content',
    requiredTier: 'tier2' as TierLevel,
    upgradePath: '/pricing?upgrade=tier2',
  },
  group_course: {
    title: 'Group Course Access',
    description: 'Join live group courses with instructor support',
    requiredTier: 'tier3' as TierLevel,
    upgradePath: '/pricing?upgrade=tier3',
  },
  master_toolkit: {
    title: 'Master Architecture Toolkit',
    description: 'Advanced tools and resources for professional development',
    requiredTier: 'tier4' as TierLevel,
    upgradePath: '/pricing?upgrade=tier4',
  },
  guaranteed_website: {
    title: 'Guaranteed Website Build',
    description: 'Professional website development guaranteed',
    requiredTier: 'tier4' as TierLevel,
    upgradePath: '/pricing?upgrade=tier4',
  },
}

export type FeatureName = keyof typeof FEATURE_DESCRIPTIONS
