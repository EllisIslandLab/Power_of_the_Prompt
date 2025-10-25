"use client"

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { cn } from '@/lib/utils'

// Use browser client for proper cookie handling in client components
const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface OnlineIndicatorProps {
  userId?: string
  showLabel?: boolean
  className?: string
}

export function OnlineIndicator({ userId, showLabel = false, className }: OnlineIndicatorProps) {
  const [isOnline, setIsOnline] = useState(false)

  useEffect(() => {
    if (!userId) return

    // Check if user is currently online
    async function checkOnlineStatus() {
      const { data } = await supabase
        .from('user_presence')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (data) {
        // Consider online if last seen within 5 minutes
        const lastSeen = new Date(data.last_seen)
        const now = new Date()
        const diffMinutes = (now.getTime() - lastSeen.getTime()) / (1000 * 60)
        setIsOnline(diffMinutes < 5)
      }
    }

    checkOnlineStatus()

    // Subscribe to presence changes
    const channel = supabase
      .channel(`presence:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_presence',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          if (payload.new) {
            const lastSeen = new Date((payload.new as any).last_seen)
            const now = new Date()
            const diffMinutes = (now.getTime() - lastSeen.getTime()) / (1000 * 60)
            setIsOnline(diffMinutes < 5)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      <div
        className={cn(
          "h-2 w-2 rounded-full",
          isOnline ? "bg-green-500 animate-pulse" : "bg-gray-300"
        )}
        title={isOnline ? "Online" : "Offline"}
      />
      {showLabel && (
        <span className="text-xs text-muted-foreground">
          {isOnline ? "Online" : "Offline"}
        </span>
      )}
    </div>
  )
}

// Hook for managing current user's presence
export function usePresence() {
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    let interval: NodeJS.Timeout

    async function initPresence() {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) return

      setUser(authUser)

      // Update presence every 60 seconds
      const updatePresence = async () => {
        await supabase
          .from('user_presence')
          .upsert({
            user_id: authUser.id,
            last_seen: new Date().toISOString(),
            status: 'online'
          })
      }

      // Initial update
      await updatePresence()

      // Set up interval
      interval = setInterval(updatePresence, 60000)

      // Mark offline on page unload
      window.addEventListener('beforeunload', async () => {
        await supabase
          .from('user_presence')
          .update({
            status: 'offline',
            last_seen: new Date().toISOString()
          })
          .eq('user_id', authUser.id)
      })
    }

    initPresence()

    return () => {
      if (interval) clearInterval(interval)

      // Mark offline on unmount
      if (user) {
        supabase
          .from('user_presence')
          .update({
            status: 'offline',
            last_seen: new Date().toISOString()
          })
          .eq('user_id', user.id)
      }
    }
  }, [])

  return user
}
