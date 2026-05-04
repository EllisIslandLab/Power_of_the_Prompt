'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'

interface Notification {
  id: string
  type: 'deployment' | 'approval' | 'error' | 'success'
  title: string
  message: string
  timestamp: Date
}

interface DeploymentNotificationsProps {
  userId: string
}

export default function DeploymentNotifications({ userId }: DeploymentNotificationsProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    // Fetch initial notifications
    const fetchNotifications = async () => {
      const { data } = await supabase
        .from('deployment_notifications')
        .select('*')
        .eq('user_id', userId)
        .eq('read', false)
        .order('created_at', { ascending: false })
        .limit(5)

      if (data) {
        setNotifications(
          data.map(n => ({
            id: n.id,
            type: n.notification_type,
            title: n.title,
            message: n.message,
            timestamp: new Date(n.created_at),
          }))
        )
      }
    }

    fetchNotifications()

    // Subscribe to new notifications
    const channel = supabase
      .channel('deployment_notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'deployment_notifications',
          filter: `user_id=eq.${userId}`,
        },
        payload => {
          const newNotification: Notification = {
            id: payload.new.id,
            type: payload.new.notification_type,
            title: payload.new.title,
            message: payload.new.message,
            timestamp: new Date(payload.new.created_at),
          }
          setNotifications(prev => [newNotification, ...prev].slice(0, 5))
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [userId, supabase])

  const dismissNotification = async (id: string) => {
    await supabase
      .from('deployment_notifications')
      .update({ read: true })
      .eq('id', id)

    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'deployment':
        return '🚀'
      case 'approval':
        return '✅'
      case 'error':
        return '❌'
      case 'success':
        return '🎉'
      default:
        return '🔔'
    }
  }

  const getColor = (type: string) => {
    switch (type) {
      case 'deployment':
        return 'bg-blue-50 border-blue-200'
      case 'approval':
        return 'bg-green-50 border-green-200'
      case 'error':
        return 'bg-red-50 border-red-200'
      case 'success':
        return 'bg-green-50 border-green-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  if (notifications.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 w-80">
      {notifications.map(notification => (
        <div
          key={notification.id}
          className={`border rounded-lg shadow-lg p-4 ${getColor(notification.type)} animate-slide-in`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-2 flex-1">
              <span className="text-lg">{getIcon(notification.type)}</span>
              <div className="flex-1">
                <p className="font-semibold text-sm text-gray-900">
                  {notification.title}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  {notification.message}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {notification.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
            <button
              onClick={() => dismissNotification(notification.id)}
              className="text-gray-400 hover:text-gray-600 ml-2"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
