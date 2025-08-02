// Jitsi Meet configuration utilities
export interface JitsiConfig {
  domain: string
  appId?: string
  jwt?: {
    secret: string
    appId: string
    kid: string
  }
  defaultConfig: {
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
    prejoinPageEnabled: boolean
    enableInsecureRoomNameWarning: boolean
    readOnlyName: boolean
    disableProfile: boolean
    disableRecordAudioAndVideo: boolean
    liveStreamingEnabled: boolean
    recordingEnabled: boolean
    backgroundAlpha: number
    disableShortcuts: boolean
    enableUserRolesBasedOnToken: boolean
    enableLayerSuspension: boolean
    p2p: {
      enabled: boolean
    }
    analytics: {
      disabled: boolean
    }
    disableThirdPartyRequests: boolean
  }
  defaultInterfaceConfig: {
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
}

export const getJitsiConfig = (): JitsiConfig => {
  const domain = process.env.NEXT_PUBLIC_JITSI_DOMAIN || 'meet.jit.si'
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://weblaunchcoach.com'
  
  return {
    domain,
    appId: process.env.JITSI_APP_ID,
    jwt: process.env.JITSI_JWT_SECRET ? {
      secret: process.env.JITSI_JWT_SECRET,
      appId: process.env.JITSI_JWT_APP_ID || 'weblaunchcoach',
      kid: process.env.JITSI_JWT_KID || 'weblaunchcoach/default'
    } : undefined,
    defaultConfig: {
      startWithAudioMuted: true,
      startWithVideoMuted: false,
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
      prejoinPageEnabled: false, // Can be overridden per session
      enableInsecureRoomNameWarning: false,
      readOnlyName: false,
      disableProfile: false,
      disableRecordAudioAndVideo: false,
      liveStreamingEnabled: false,
      recordingEnabled: process.env.SESSION_RECORDING_ENABLED === 'true',
      backgroundAlpha: 0.5,
      disableShortcuts: false,
      enableUserRolesBasedOnToken: true,
      enableLayerSuspension: true,
      p2p: {
        enabled: true // Will be disabled for larger groups
      },
      analytics: {
        disabled: true // Privacy-focused
      },
      disableThirdPartyRequests: true
    },
    defaultInterfaceConfig: {
      TOOLBAR_BUTTONS: [
        'microphone', 'camera', 'desktop', 'chat', 'participants-pane',
        'raise-hand', 'settings', 'hangup'
      ],
      SETTINGS_SECTIONS: ['devices', 'language', 'moderator', 'profile'],
      DISPLAY_WELCOME_PAGE_CONTENT: false,
      DISPLAY_WELCOME_PAGE_TOOLBAR_ADDITIONAL_CONTENT: false,
      SHOW_JITSI_WATERMARK: false,
      SHOW_WATERMARK_FOR_GUESTS: false,
      SHOW_BRAND_WATERMARK: true,
      BRAND_WATERMARK_LINK: siteUrl,
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
    }
  }
}

// Get toolbar buttons based on session type and user role
export const getToolbarButtons = (sessionType: string, userRole: 'host' | 'participant', recordingEnabled = false): string[] => {
  const baseButtons = [
    'microphone', 'camera', 'desktop', 'chat', 'participants-pane'
  ]
  
  if (userRole === 'host') {
    baseButtons.push('security', 'settings')
    if (recordingEnabled) {
      baseButtons.push('recording')
    }
  }
  
  if (sessionType === 'group_coaching' || sessionType === 'workshop') {
    baseButtons.push('raise-hand', 'whiteboard')
  }
  
  baseButtons.push('hangup')
  return baseButtons
}

// Generate room name with proper formatting
export const generateRoomName = (sessionType: string, identifier?: string): string => {
  const timestamp = Date.now()
  const randomId = Math.random().toString(36).substr(2, 9)
  const prefix = sessionType.toLowerCase().replace('_', '-')
  
  if (identifier) {
    return `${prefix}-${identifier}-${timestamp}-${randomId}`
  }
  
  return `${prefix}-${timestamp}-${randomId}`
}

// JWT token generation for authenticated rooms (if using Jitsi JWT)
export const generateJWT = (roomName: string, userName: string, userEmail?: string, isModerator = false): string | null => {
  const config = getJitsiConfig()
  
  if (!config.jwt) {
    return null
  }
  
  // In a real implementation, you would use a JWT library like 'jsonwebtoken'
  // For now, we'll return null and use public rooms
  // TODO: Implement JWT generation when private rooms are needed
  
  return null
}

// Get Jitsi domain for room URLs
export const getJitsiDomain = (): string => {
  return process.env.NEXT_PUBLIC_JITSI_DOMAIN || 'meet.jit.si'
}

// Generate complete join URL
export const generateJoinUrl = (roomName: string): string => {
  const domain = getJitsiDomain()
  return `https://${domain}/${roomName}`
}

// Configuration for different session types
export const getSessionTypeConfig = (sessionType: string, userRole: 'host' | 'participant') => {
  const config = getJitsiConfig()
  const baseConfig = { ...config.defaultConfig }
  const baseInterfaceConfig = { ...config.defaultInterfaceConfig }
  
  switch (sessionType) {
    case 'free_consultation':
      return {
        ...baseConfig,
        startWithVideoMuted: true,
        prejoinPageEnabled: true,
        maxParticipants: 2,
        recordingEnabled: false,
        interfaceConfig: {
          ...baseInterfaceConfig,
          TOOLBAR_BUTTONS: getToolbarButtons('free_consultation', userRole, false)
        }
      }
      
    case 'paid_session':
      return {
        ...baseConfig,
        startWithVideoMuted: false,
        prejoinPageEnabled: true,
        maxParticipants: 2,
        recordingEnabled: userRole === 'host',
        interfaceConfig: {
          ...baseInterfaceConfig,
          TOOLBAR_BUTTONS: getToolbarButtons('paid_session', userRole, true)
        }
      }
      
    case 'group_coaching':
      return {
        ...baseConfig,
        startWithVideoMuted: false,
        prejoinPageEnabled: true,
        maxParticipants: parseInt(process.env.MAX_PARTICIPANTS_PER_SESSION || '10'),
        p2p: { enabled: false }, // Disable P2P for group sessions
        recordingEnabled: userRole === 'host',
        interfaceConfig: {
          ...baseInterfaceConfig,
          TOOLBAR_BUTTONS: getToolbarButtons('group_coaching', userRole, true)
        }
      }
      
    case 'workshop':
      return {
        ...baseConfig,
        startWithVideoMuted: true,
        prejoinPageEnabled: true,
        maxParticipants: 50,
        p2p: { enabled: false },
        recordingEnabled: userRole === 'host',
        interfaceConfig: {
          ...baseInterfaceConfig,
          TOOLBAR_BUTTONS: getToolbarButtons('workshop', userRole, true)
        }
      }
      
    case 'office_hours':
      return {
        ...baseConfig,
        startWithVideoMuted: false,
        prejoinPageEnabled: false, // Easy access for office hours
        maxParticipants: 20,
        p2p: { enabled: false },
        recordingEnabled: false,
        interfaceConfig: {
          ...baseInterfaceConfig,
          TOOLBAR_BUTTONS: getToolbarButtons('office_hours', userRole, false)
        }
      }
      
    default:
      return {
        ...baseConfig,
        interfaceConfig: {
          ...baseInterfaceConfig,
          TOOLBAR_BUTTONS: getToolbarButtons('default', userRole, false)
        }
      }
  }
}