'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Lock, Sparkles, ArrowRight } from 'lucide-react'
import { TierLevel, hasMinimumTier, getTierDisplayName, FEATURE_DESCRIPTIONS, FeatureName } from '@/lib/tier-permissions'

interface TierGateProps {
  children: ReactNode
  userTier: string | null | undefined
  requiredTier: TierLevel
  feature?: FeatureName
  fallback?: ReactNode
  showUpgrade?: boolean
}

export function TierGate({
  children,
  userTier,
  requiredTier,
  feature,
  fallback,
  showUpgrade = true,
}: TierGateProps) {
  const hasAccess = hasMinimumTier(userTier, requiredTier)

  if (hasAccess) {
    return <>{children}</>
  }

  if (fallback) {
    return <>{fallback}</>
  }

  const featureInfo = feature ? FEATURE_DESCRIPTIONS[feature] : null
  const displayName = getTierDisplayName(requiredTier)

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <Badge variant="outline" className="gap-1">
            <Lock className="h-3 w-3" />
            {displayName} Required
          </Badge>
          {showUpgrade && (
            <Badge variant="default" className="gap-1">
              <Sparkles className="h-3 w-3" />
              Premium
            </Badge>
          )}
        </div>
        <CardTitle className="flex items-center gap-2">
          {featureInfo?.title || 'Premium Feature'}
        </CardTitle>
        <CardDescription>
          {featureInfo?.description || `This feature requires ${displayName} or higher.`}
        </CardDescription>
      </CardHeader>

      {showUpgrade && (
        <CardContent>
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Upgrade your account to unlock this feature and more premium content.
            </div>

            <Button asChild className="w-full">
              <Link href={featureInfo?.upgradePath || '/pricing'}>
                Upgrade to {displayName}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>

            <div className="text-xs text-center text-muted-foreground">
              Current tier: {getTierDisplayName(userTier)}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}

interface TierBadgeProps {
  tier: string | null | undefined
  className?: string
}

export function TierBadge({ tier, className }: TierBadgeProps) {
  const displayName = getTierDisplayName(tier)
  const tierLevel = tier?.toLowerCase()

  const variant = tierLevel?.includes('4') || tierLevel?.includes('enterprise')
    ? 'default'
    : tierLevel?.includes('3') || tierLevel?.includes('vip')
    ? 'secondary'
    : tierLevel?.includes('2') || tierLevel?.includes('premium')
    ? 'outline'
    : 'secondary'

  return (
    <Badge variant={variant} className={className}>
      {displayName}
    </Badge>
  )
}

interface TierFeatureListProps {
  tier: string | null | undefined
  showAllFeatures?: boolean
}

export function TierFeatureList({ tier, showAllFeatures = false }: TierFeatureListProps) {
  const features = [
    { name: 'Code Download', hasTier: ['tier1', 'tier2', 'tier3', 'tier4', 'premium', 'vip', 'enterprise'] },
    { name: 'AI Modifications (20)', hasTier: ['tier1', 'tier2', 'premium'] },
    { name: 'AI Modifications (Unlimited)', hasTier: ['tier3', 'tier4', 'vip', 'enterprise'] },
    { name: 'Textbook Access', hasTier: ['tier1', 'tier2', 'tier3', 'tier4', 'premium', 'vip', 'enterprise'] },
    { name: 'Course Recordings', hasTier: ['tier2', 'tier3', 'tier4', 'premium', 'vip', 'enterprise'] },
    { name: 'Group Course Access', hasTier: ['tier3', 'tier4', 'vip', 'enterprise'] },
    { name: '1 LVL UP Session', hasTier: ['tier3', 'vip'] },
    { name: '10 LVL UP Sessions', hasTier: ['tier4', 'enterprise'] },
    { name: 'Guaranteed Website', hasTier: ['tier4', 'enterprise'] },
    { name: 'Master Architecture Toolkit', hasTier: ['tier4', 'enterprise'] },
  ]

  const userTierNormalized = tier?.toLowerCase() || ''

  return (
    <ul className="space-y-2 text-sm">
      {features.map((feature) => {
        const hasFeature = feature.hasTier.includes(userTierNormalized)
        const shouldShow = showAllFeatures || hasFeature

        if (!shouldShow) return null

        return (
          <li
            key={feature.name}
            className={`flex items-center gap-2 ${
              hasFeature ? 'text-foreground' : 'text-muted-foreground line-through'
            }`}
          >
            {hasFeature ? (
              <Sparkles className="h-4 w-4 text-primary flex-shrink-0" />
            ) : (
              <Lock className="h-4 w-4 flex-shrink-0" />
            )}
            {feature.name}
          </li>
        )
      })}
    </ul>
  )
}
