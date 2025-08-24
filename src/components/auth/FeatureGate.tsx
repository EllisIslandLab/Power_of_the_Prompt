'use client'

import { ReactNode } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Lock, Crown, Mail } from 'lucide-react'
import Link from 'next/link'
import { 
  canAccessFeature, 
  needsUpgradeFor, 
  getUpgradeMessage,
  getAccessLevelDescription,
  type Student, 
  type Feature 
} from '@/lib/permissions'

interface FeatureGateProps {
  student: Student
  feature: Feature
  fallback?: ReactNode
  children: ReactNode
  showUpgradePrompt?: boolean
}

export function FeatureGate({ 
  student, 
  feature, 
  fallback, 
  children, 
  showUpgradePrompt = true 
}: FeatureGateProps) {
  // Check if student can access the feature
  if (canAccessFeature(student, feature)) {
    return <>{children}</>
  }

  // Custom fallback provided
  if (fallback) {
    return <>{fallback}</>
  }

  // Email verification required
  if (!student.email_verified) {
    return (
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-orange-600" />
            <div>
              <h3 className="font-medium text-orange-800">Email Verification Required</h3>
              <p className="text-sm text-orange-600">
                Please verify your email address to access course materials.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Show upgrade prompt for premium features
  if (showUpgradePrompt && needsUpgradeFor(student, feature)) {
    return (
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Crown className="h-5 w-5" />
            Premium Feature
          </CardTitle>
          <CardDescription className="text-blue-600">
            {getUpgradeMessage(feature)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Button asChild className="bg-blue-600 hover:bg-blue-700">
              <Link href="/upgrade">
                Upgrade Now
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/pricing">
                View Pricing
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Default locked state
  return (
    <Card className="border-gray-200 bg-gray-50">
      <CardContent className="pt-6">
        <div className="flex items-center gap-3 text-center">
          <Lock className="h-5 w-5 text-gray-600" />
          <div>
            <h3 className="font-medium text-gray-800">Access Restricted</h3>
            <p className="text-sm text-gray-600">
              {getAccessLevelDescription(student)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Hook for checking permissions in components
export function usePermissions(student: Student) {
  return {
    canAccess: (feature: Feature) => canAccessFeature(student, feature),
    needsUpgrade: (feature: Feature) => needsUpgradeFor(student, feature),
    getDescription: () => getAccessLevelDescription(student)
  }
}

// Simple permission check component
interface RequirePermissionProps {
  student: Student
  feature: Feature
  children: ReactNode
}

export function RequirePermission({ student, feature, children }: RequirePermissionProps) {
  if (!canAccessFeature(student, feature)) {
    return null
  }
  
  return <>{children}</>
}

// Access level indicator component
interface AccessLevelBadgeProps {
  student: Student
  className?: string
}

export function AccessLevelBadge({ student, className = '' }: AccessLevelBadgeProps) {
  const badgeColors = {
    free: 'bg-gray-100 text-gray-800 border-gray-200',
    full: 'bg-blue-100 text-blue-800 border-blue-200',
    expired: 'bg-red-100 text-red-800 border-red-200'
  }

  const getBadgeType = () => {
    if (student.tier === 'full' && student.payment_status === 'expired') {
      return 'expired'
    }
    return student.tier
  }

  const getBadgeText = () => {
    if (!student.email_verified) {
      return 'Unverified'
    }
    if (student.tier === 'full' && student.payment_status === 'expired') {
      return 'Expired'
    }
    return student.tier === 'full' ? 'Full Access' : 'Free Tier'
  }

  const badgeType = getBadgeType()
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${badgeColors[badgeType]} ${className}`}>
      {getBadgeText()}
    </span>
  )
}