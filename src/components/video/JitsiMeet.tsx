"use client"

import { useEffect, useRef, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { getJitsiConfig } from '@/lib/env-config'

declare global {
  interface Window {
    JitsiMeetExternalAPI: any;
  }
}

interface JitsiMeetProps {
  roomName: string
  displayName?: string
  onReady?: () => void
  onParticipantJoined?: (participant: any) => void
  onParticipantLeft?: (participant: any) => void
  onVideoConferenceJoined?: () => void
  onVideoConferenceLeft?: () => void
}

export function JitsiMeet({
  roomName,
  displayName,
  onReady,
  onParticipantJoined,
  onParticipantLeft,
  onVideoConferenceJoined,
  onVideoConferenceLeft
}: JitsiMeetProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const apiRef = useRef<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    if (!containerRef.current || !user) return

    const loadJitsiScript = async () => {
      try {
        const { appId: jitsiAppId } = getJitsiConfig()
        
        if (!jitsiAppId) {
          throw new Error('Jitsi App ID not configured')
        }
        
        // Load Jitsi script if not already loaded
        if (!window.JitsiMeetExternalAPI) {
          const script = document.createElement('script')
          script.src = `https://8x8.vc/${jitsiAppId}/external_api.js`
          script.async = true
          
          await new Promise((resolve, reject) => {
            script.onload = resolve
            script.onerror = reject
            document.head.appendChild(script)
          })
        }

        // Initialize Jitsi Meet
        const options = {
          roomName: `${jitsiAppId}/${roomName}`,
          parentNode: containerRef.current,
          configOverwrite: {
            startWithAudioMuted: true,
            startWithVideoMuted: false,
            enableWelcomePage: false,
            enableClosePage: false,
            prejoinPageEnabled: true, // Enable prejoin page to request permissions properly
          },
          interfaceConfigOverwrite: {
            TOOLBAR_BUTTONS: [
              'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
              'fodeviceselection', 'hangup', 'profile', 'chat', 'recording',
              'livestreaming', 'etherpad', 'sharedvideo', 'settings', 'raisehand',
              'videoquality', 'filmstrip', 'invite', 'feedback', 'stats', 'shortcuts',
              'tileview', 'videobackgroundblur', 'download', 'help', 'mute-everyone',
              'security'
            ],
            SETTINGS_SECTIONS: ['devices', 'language', 'moderator', 'profile', 'calendar'],
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
          },
          userInfo: {
            displayName: displayName || user.email || 'User',
            email: user.email || undefined
          }
          // Note: JWT commented out for now - add when you need premium features
          // jwt: "your-jwt-token-here"
        }

        apiRef.current = new window.JitsiMeetExternalAPI("8x8.vc", options)

        // Event listeners
        apiRef.current.addEventListener('ready', () => {
          console.log('Jitsi Meet is ready')
          setIsLoading(false)
          onReady?.()
        })

        apiRef.current.addEventListener('participantJoined', (participant: any) => {
          console.log('Participant joined:', participant)
          onParticipantJoined?.(participant)
        })

        apiRef.current.addEventListener('participantLeft', (participant: any) => {
          console.log('Participant left:', participant)
          onParticipantLeft?.(participant)
        })

        apiRef.current.addEventListener('videoConferenceJoined', () => {
          console.log('User joined the conference')
          onVideoConferenceJoined?.()
        })

        apiRef.current.addEventListener('videoConferenceLeft', () => {
          console.log('User left the conference')
          onVideoConferenceLeft?.()
        })

      } catch (err) {
        console.error('Failed to load Jitsi Meet:', err)
        setError('Failed to load video conference')
        setIsLoading(false)
      }
    }

    loadJitsiScript()

    // Cleanup
    return () => {
      if (apiRef.current) {
        apiRef.current.dispose()
        apiRef.current = null
      }
    }
  }, [roomName, displayName, user, onReady, onParticipantJoined, onParticipantLeft, onVideoConferenceJoined, onVideoConferenceLeft])

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full bg-muted rounded-lg">
        <p className="text-muted-foreground">Please sign in to join the video conference</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-destructive/10 rounded-lg">
        <p className="text-destructive">{error}</p>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted rounded-lg z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading video conference...</p>
          </div>
        </div>
      )}
      <div
        ref={containerRef}
        className="w-full h-full rounded-lg overflow-hidden"
        style={{ minHeight: '500px' }}
      />
    </div>
  )
}