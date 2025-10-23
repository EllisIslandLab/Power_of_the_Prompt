"use client"

import { Activity } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SessionCounterProps {
  userId: string
  className?: string
  variant?: 'full' | 'compact'
}

// TODO: Re-implement session credits using new points system
// The old 'sessions' table was removed. Need to create a new 'session_credits' table
// or integrate with the points system for tracking purchased consultation credits.
export function SessionCounter({ userId, className, variant = 'full' }: SessionCounterProps) {
  // Temporarily disabled - showing placeholder
  const sessionData = null
  const loading = false

  if (loading) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div className="animate-pulse h-4 w-24 bg-muted rounded"></div>
      </div>
    )
  }

  if (!sessionData) {
    return null
  }

  const remaining = sessionData.sessions_total - sessionData.sessions_used
  const percentage = (remaining / sessionData.sessions_total) * 100

  // Color based on remaining sessions
  const getColor = () => {
    if (percentage >= 50) return 'text-green-600'
    if (percentage >= 25) return 'text-yellow-600'
    return 'text-red-600'
  }

  if (variant === 'compact') {
    return (
      <div className={cn("inline-flex items-center gap-2", className)}>
        <Activity className={cn("h-4 w-4", getColor())} />
        <span className={cn("text-sm font-medium", getColor())}>
          {remaining} LVL UP{remaining !== 1 ? 's' : ''}
        </span>
      </div>
    )
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className={cn("h-5 w-5", getColor())} />
          <span className="font-medium">LVL UP Sessions</span>
        </div>
        <span className={cn("text-sm font-semibold", getColor())}>
          {remaining} / {sessionData.sessions_total}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
        <div
          className={cn(
            "h-full transition-all duration-300",
            percentage >= 50 ? "bg-green-600" :
            percentage >= 25 ? "bg-yellow-600" :
            "bg-red-600"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>

      <p className="text-xs text-muted-foreground">
        {remaining > 0
          ? `You have ${remaining} coaching session${remaining !== 1 ? 's' : ''} remaining`
          : 'No sessions remaining - purchase more to continue'
        }
      </p>
    </div>
  )
}
