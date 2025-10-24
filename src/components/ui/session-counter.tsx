"use client"

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
  // Temporarily disabled - return null to hide component
  return null
}
