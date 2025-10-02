"use client"

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Activity } from 'lucide-react'
import { cn } from '@/lib/utils'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface SessionCounterProps {
  userId: string
  className?: string
  variant?: 'full' | 'compact'
}

interface SessionData {
  sessions_total: number
  sessions_used: number
}

export function SessionCounter({ userId, className, variant = 'full' }: SessionCounterProps) {
  const [sessionData, setSessionData] = useState<SessionData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return

    async function loadSessions() {
      try {
        const { data, error } = await supabase
          .from('sessions')
          .select('sessions_total, sessions_used')
          .eq('user_id', userId)
          .eq('status', 'active')
          .maybeSingle()

        if (error) {
          console.error('Error loading sessions:', error)
          setSessionData(null)
        } else if (data) {
          setSessionData(data)
        } else {
          setSessionData(null)
        }
      } catch (err) {
        console.error('Error loading sessions:', err)
        setSessionData(null)
      } finally {
        setLoading(false)
      }
    }

    loadSessions()

    // Subscribe to changes
    const channel = supabase
      .channel(`sessions:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sessions',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          if (payload.new && (payload.new as any).status === 'active') {
            setSessionData({
              sessions_total: (payload.new as any).sessions_total,
              sessions_used: (payload.new as any).sessions_used
            })
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

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
