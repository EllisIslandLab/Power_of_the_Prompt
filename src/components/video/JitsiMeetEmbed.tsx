"use client"

import { useEffect, useRef, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Phone, 
  Users,
  Settings,
  Maximize2,
  Clock
} from 'lucide-react'

declare global {
  interface Window {
    JitsiMeetExternalAPI: any;
  }
}

interface JitsiMeetEmbedProps {
  roomId: string
  displayName: string
  email?: string
  userRole?: 'host' | 'participant'
  sessionType?: 'free_consultation' | 'paid_session' | 'group_coaching'
  onMeetingEnd?: () => void
  onMeetingJoin?: () => void
  onParticipantJoined?: (participant: any) => void
  onParticipantLeft?: (participant: any) => void
  waitingRoomEnabled?: boolean
  recordingEnabled?: boolean
  maxParticipants?: number
  customConfig?: any
}

interface JitsiMeetConfig {
  roomName: string
  width: string | number
  height: string | number
  parentNode: HTMLElement
  configOverwrite: {
    startWithAudioMuted: boolean
    startWithVideoMuted: boolean
    enableWelcomePage: boolean
    enableClosePage: boolean
    disableModeratorIndicator: boolean
    disableInitialGUM: boolean
    disableDeepLinking: boolean
    disableInviteFunctions: boolean
    hideDisplayName: boolean
    hideConferenceTimer: boolean
    disableLocalVideoFlip: boolean
    enableNoisyMicDetection: boolean
    remoteVideoMenu?: {
      disableKick: boolean
    }
    toolbarButtons?: string[]
    prejoinPageEnabled: boolean
    enableInsecureRoomNameWarning: boolean
    readOnlyName?: boolean
    disableProfile?: boolean
    disableRecordAudioAndVideo?: boolean
    liveStreamingEnabled?: boolean
    recordingEnabled?: boolean
    backgroundAlpha?: number
    disableShortcuts?: boolean
    enableUserRolesBasedOnToken?: boolean
    enableLayerSuspension?: boolean
    p2p?: {
      enabled: boolean
    }
    analytics?: {
      disabled: boolean
    }
    disableThirdPartyRequests?: boolean
  }
  interfaceConfigOverwrite: {
    TOOLBAR_BUTTONS: string[]
    SETTINGS_SECTIONS: string[]
    DISPLAY_WELCOME_PAGE_CONTENT: boolean
    DISPLAY_WELCOME_PAGE_TOOLBAR_ADDITIONAL_CONTENT: boolean
    SHOW_JITSI_WATERMARK: boolean
    SHOW_WATERMARK_FOR_GUESTS: boolean
    SHOW_BRAND_WATERMARK: boolean
    BRAND_WATERMARK_LINK: string
    SHOW_POWERED_BY: boolean
    GENERATE_ROOMNAMES_ON_WELCOME_PAGE: boolean
    DISABLE_VIDEO_BACKGROUND: boolean
    HIDE_INVITE_MORE_HEADER: boolean
    MOBILE_APP_PROMO: boolean
    ENFORCE_NOTIFICATION_AUTO_DISMISS_TIMEOUT: number
    CONNECTION_INDICATOR_AUTO_HIDE_ENABLED: boolean
    CONNECTION_INDICATOR_AUTO_HIDE_TIMEOUT: number
    CONNECTION_INDICATOR_DISABLED: boolean
    VIDEO_LAYOUT_FIT: string
    filmStripOnly: boolean
    VERTICAL_FILMSTRIP: boolean
  }
  userInfo?: {
    displayName: string
    email?: string
  }
}

export default function JitsiMeetEmbed({
  roomId,
  displayName,
  email,
  userRole = 'participant',
  sessionType = 'free_consultation',
  onMeetingEnd,
  onMeetingJoin,
  onParticipantJoined,
  onParticipantLeft,
  waitingRoomEnabled = true,
  recordingEnabled = false,
  maxParticipants = 10,
  customConfig = {}
}: JitsiMeetEmbedProps) {
  const jitsiContainerRef = useRef<HTMLDivElement>(null)
  const [api, setApi] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoDisabled, setIsVideoDisabled] = useState(false)
  const [participantCount, setParticipantCount] = useState(0)
  const [meetingStarted, setMeetingStarted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Get Jitsi domain from environment or use default
  const jitsiDomain = process.env.NEXT_PUBLIC_JITSI_DOMAIN || 'meet.jit.si'

  // Load Jitsi Meet External API
  useEffect(() => {
    const loadJitsiAPI = () => {
      if (window.JitsiMeetExternalAPI) {
        initializeJitsi()
        return
      }

      const script = document.createElement('script')
      script.src = `https://${jitsiDomain}/external_api.js`
      script.async = true
      script.onload = initializeJitsi
      script.onerror = () => {
        setError('Failed to load Jitsi Meet. Please check your internet connection.')
        setIsLoading(false)
      }
      document.head.appendChild(script)
    }

    loadJitsiAPI()

    return () => {
      if (api) {
        api.dispose()
      }
    }
  }, [])

  const initializeJitsi = () => {
    if (!jitsiContainerRef.current) {
      setError('Container not ready')
      setIsLoading(false)
      return
    }

    try {
      // Custom toolbar buttons based on session type and user role
      const getToolbarButtons = () => {
        const baseButtons = [
          'microphone', 'camera', 'desktop', 'chat', 'participants-pane'
        ]
        
        if (userRole === 'host') {
          baseButtons.push('security', 'settings')
          if (recordingEnabled) {
            baseButtons.push('recording')
          }
        }
        
        if (sessionType === 'group_coaching' || sessionType === 'paid_session') {
          baseButtons.push('raise-hand', 'whiteboard')
        }
        
        baseButtons.push('hangup')
        return baseButtons
      }

      const config: JitsiMeetConfig = {
        roomName: roomId,
        width: '100%',
        height: 500,
        parentNode: jitsiContainerRef.current,
        configOverwrite: {
          startWithAudioMuted: true,
          startWithVideoMuted: sessionType === 'free_consultation',
          enableWelcomePage: false,
          enableClosePage: false,
          disableModeratorIndicator: false,
          disableInitialGUM: false,
          disableDeepLinking: true,
          disableInviteFunctions: true,
          hideDisplayName: false,
          hideConferenceTimer: false,
          disableLocalVideoFlip: false,
          enableNoisyMicDetection: true,
          remoteVideoMenu: {
            disableKick: userRole !== 'host'
          },
          toolbarButtons: getToolbarButtons(),
          prejoinPageEnabled: waitingRoomEnabled,
          enableInsecureRoomNameWarning: false,
          readOnlyName: false,
          disableProfile: false,
          disableRecordAudioAndVideo: !recordingEnabled,
          liveStreamingEnabled: false,
          recordingEnabled: recordingEnabled && userRole === 'host',
          backgroundAlpha: 0.5,
          disableShortcuts: false,
          enableUserRolesBasedOnToken: true,
          enableLayerSuspension: true,
          p2p: {
            enabled: maxParticipants <= 2
          },
          analytics: {
            disabled: true
          },
          disableThirdPartyRequests: true,
          ...customConfig
        },
        interfaceConfigOverwrite: {
          TOOLBAR_BUTTONS: getToolbarButtons(),
          SETTINGS_SECTIONS: ['devices', 'language', 'moderator', 'profile', 'calendar'],
          DISPLAY_WELCOME_PAGE_CONTENT: false,
          DISPLAY_WELCOME_PAGE_TOOLBAR_ADDITIONAL_CONTENT: false,
          SHOW_JITSI_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false,
          SHOW_BRAND_WATERMARK: true,
          BRAND_WATERMARK_LINK: process.env.NEXT_PUBLIC_SITE_URL || 'https://weblaunchcoach.com',
          SHOW_POWERED_BY: false,
          GENERATE_ROOMNAMES_ON_WELCOME_PAGE: false,
          DISABLE_VIDEO_BACKGROUND: false,
          HIDE_INVITE_MORE_HEADER: true,
          MOBILE_APP_PROMO: false,
          ENFORCE_NOTIFICATION_AUTO_DISMISS_TIMEOUT: 15000,
          CONNECTION_INDICATOR_AUTO_HIDE_ENABLED: true,
          CONNECTION_INDICATOR_AUTO_HIDE_TIMEOUT: 5000,
          CONNECTION_INDICATOR_DISABLED: false,
          VIDEO_LAYOUT_FIT: 'both',
          filmStripOnly: false,
          VERTICAL_FILMSTRIP: true
        },
        userInfo: {
          displayName,
          email
        }
      }

      const jitsiAPI = new window.JitsiMeetExternalAPI(jitsiDomain, config)
      setApi(jitsiAPI)

      // Event listeners
      jitsiAPI.addEventListener('readyToClose', () => {
        jitsiAPI.dispose()
        setMeetingStarted(false)
        onMeetingEnd?.()
      })

      jitsiAPI.addEventListener('videoConferenceJoined', () => {
        setMeetingStarted(true)
        setIsLoading(false)
        onMeetingJoin?.()
      })

      jitsiAPI.addEventListener('participantJoined', (participant: any) => {
        setParticipantCount(prev => prev + 1)
        onParticipantJoined?.(participant)
      })

      jitsiAPI.addEventListener('participantLeft', (participant: any) => {
        setParticipantCount(prev => Math.max(0, prev - 1))
        onParticipantLeft?.(participant)
      })

      jitsiAPI.addEventListener('audioMuteStatusChanged', (event: any) => {
        setIsMuted(event.muted)
      })

      jitsiAPI.addEventListener('videoMuteStatusChanged', (event: any) => {
        setIsVideoDisabled(event.muted)
      })

      jitsiAPI.addEventListener('log', (event: any) => {
        if (event.logLevel === 'ERROR') {
          console.error('Jitsi Error:', event)
        }
      })

      setIsLoading(false)

    } catch (error) {
      console.error('Failed to initialize Jitsi:', error)
      setError('Failed to initialize video conference. Please try refreshing the page.')
      setIsLoading(false)
    }
  }

  const toggleAudio = () => {
    if (api) {
      api.executeCommand('toggleAudio')
    }
  }

  const toggleVideo = () => {
    if (api) {
      api.executeCommand('toggleVideo')
    }
  }

  const hangUp = () => {
    if (api) {
      api.executeCommand('hangup')
    }
  }

  const getSessionTypeDisplay = () => {
    switch (sessionType) {
      case 'free_consultation':
        return { label: 'Free Consultation', color: 'bg-green-100 text-green-800' }
      case 'paid_session':
        return { label: 'Paid Session', color: 'bg-blue-100 text-blue-800' }
      case 'group_coaching':
        return { label: 'Group Coaching', color: 'bg-purple-100 text-purple-800' }
      default:
        return { label: 'Session', color: 'bg-gray-100 text-gray-800' }
    }
  }

  const sessionDisplay = getSessionTypeDisplay()

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <VideoOff className="h-5 w-5" />
            Video Conference Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="w-full space-y-4">
      {/* Session Info Header */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Video className="h-5 w-5 text-blue-600" />
                <span className="font-medium">Video Session</span>
              </div>
              <Badge className={sessionDisplay.color}>
                {sessionDisplay.label}
              </Badge>
              {userRole === 'host' && (
                <Badge variant="outline">Host</Badge>
              )}
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{participantCount} participants</span>
              </div>
              {meetingStarted && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>Live</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Jitsi Meet Container */}
      <Card>
        <CardContent className="p-0">
          {isLoading && (
            <div className="flex items-center justify-center h-96 bg-gray-50">
              <div className="text-center">
                <Video className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-pulse" />
                <p className="text-lg font-medium mb-2">Loading video conference...</p>
                <p className="text-sm text-muted-foreground">
                  Please wait while we connect you to the session
                </p>
              </div>
            </div>
          )}
          <div 
            ref={jitsiContainerRef} 
            className={`w-full ${isLoading ? 'hidden' : 'block'}`}
            style={{ minHeight: '500px' }}
          />
        </CardContent>
      </Card>

      {/* Quick Controls (optional - Jitsi has its own toolbar) */}
      {meetingStarted && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-center gap-2">
              <Button
                size="sm"
                variant={isMuted ? "destructive" : "outline"}
                onClick={toggleAudio}
              >
                {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
              <Button
                size="sm"
                variant={isVideoDisabled ? "destructive" : "outline"}
                onClick={toggleVideo}
              >
                {isVideoDisabled ? <VideoOff className="h-4 w-4" /> : <Video className="h-4 w-4" />}
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={hangUp}
              >
                <Phone className="h-4 w-4" />
                Leave
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}