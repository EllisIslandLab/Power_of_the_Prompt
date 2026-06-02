// Feature gating system for client tiers

export type StudentTier = 'free' | 'full'
export type Feature = 
  | 'basic_courses'
  | 'premium_courses' 
  | 'community_forum'
  | 'one_on_one'
  | 'live_sessions'
  | 'video_calls'
  | 'priority_support'
  | 'downloadable_resources'
  | 'course_certificates'
  | 'advanced_tools'

export interface Client {
  id: string
  tier: StudentTier
  payment_status: 'pending' | 'paid' | 'trial' | 'expired'
  email_verified: boolean
}

// Define permissions for each tier
const tierPermissions: Record<StudentTier, Feature[]> = {
  'free': [
    'basic_courses',
    'community_forum'
  ],
  'full': [
    'basic_courses',
    'premium_courses',
    'community_forum',
    'one_on_one',
    'live_sessions',
    'video_calls',
    'priority_support',
    'downloadable_resources',
    'course_certificates',
    'advanced_tools'
  ]
}

/**
 * Check if a client can access a specific feature
 */
export function canAccessFeature(client: Client, feature: Feature): boolean {
  // Must be email verified to access any features
  if (!client.email_verified) {
    return false
  }

  // Check if payment is required for full tier features
  if (client.tier === 'full' && client.payment_status === 'expired') {
    // Downgrade to free tier permissions if payment expired
    return tierPermissions.free.includes(feature)
  }

  return tierPermissions[client.tier]?.includes(feature) || false
}

/**
 * Check if client can access any premium features
 */
export function hasPremiumAccess(client: Client): boolean {
  return client.tier === 'full' && 
         client.payment_status !== 'expired' && 
         client.email_verified
}

/**
 * Get all available features for a client
 */
export function getStudentFeatures(client: Client): Feature[] {
  if (!client.email_verified) {
    return []
  }

  if (client.tier === 'full' && client.payment_status === 'expired') {
    return tierPermissions.free
  }

  return tierPermissions[client.tier] || []
}

/**
 * Get a user-friendly description of access level
 */
export function getAccessLevelDescription(client: Client): string {
  if (!client.email_verified) {
    return 'Please verify your email to access course materials'
  }

  if (client.tier === 'free') {
    return 'Free Tier - Access to basic course materials and community'
  }

  if (client.tier === 'full') {
    if (client.payment_status === 'expired') {
      return 'Payment Expired - Currently limited to free tier access'
    }
    if (client.payment_status === 'pending') {
      return 'Full Access - Payment processing'
    }
    return 'Full Access - All course materials and premium features'
  }

  return 'Unknown access level'
}

/**
 * Check if client needs to upgrade for a specific feature
 */
export function needsUpgradeFor(client: Client, feature: Feature): boolean {
  if (!client.email_verified) {
    return false // Need to verify email first
  }

  // If they already have access, no upgrade needed
  if (canAccessFeature(client, feature)) {
    return false
  }

  // Check if upgrading to full tier would give them access
  return tierPermissions.full.includes(feature)
}

/**
 * Get upgrade message for a specific feature
 */
export function getUpgradeMessage(feature: Feature): string {
  const featureNames: Record<Feature, string> = {
    'basic_courses': 'Basic Courses',
    'premium_courses': 'Premium Courses',
    'community_forum': 'Community Forum',
    'one_on_one': 'One-on-One Sessions',
    'live_sessions': 'Live Group Sessions',
    'video_calls': 'Video Calls',
    'priority_support': 'Priority Support',
    'downloadable_resources': 'Downloadable Resources',
    'course_certificates': 'Course Certificates',
    'advanced_tools': 'Advanced Tools'
  }

  return `Upgrade to Full Access to unlock ${featureNames[feature] || feature}`
}

/**
 * Feature gate component props helper
 */
export interface FeatureGateProps {
  client: Client
  feature: Feature
  fallback?: React.ReactNode
  children: React.ReactNode
}

// Export for use in React components
export const FeaturePermissions = {
  canAccessFeature,
  hasPremiumAccess,
  getStudentFeatures,
  getAccessLevelDescription,
  needsUpgradeFor,
  getUpgradeMessage
}