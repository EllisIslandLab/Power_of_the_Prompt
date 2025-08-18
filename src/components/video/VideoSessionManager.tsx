"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Video, 
  Calendar, 
  Clock, 
  Users, 
  DollarSign,
  Play,
  CheckCircle,
  XCircle,
  AlertCircle,
  ExternalLink,
  CreditCard,
  FileText,
  Download
} from 'lucide-react'
import { format, isPast, isToday, isTomorrow, differenceInMinutes } from 'date-fns'
import JitsiMeetEmbed from './JitsiMeetEmbed'

interface VideoSession {
  id: string
  sessionName: string
  jitsiRoomId: string
  hostUserId: string
  participantUserIds: string[]
  sessionType: 'FREE_CONSULTATION' | 'PAID_SESSION' | 'GROUP_COACHING' | 'WORKSHOP' | 'OFFICE_HOURS'
  scheduledStart: Date
  scheduledEnd: Date
  actualStart?: Date
  actualEnd?: Date
  stripePaymentIntentId?: string
  sessionStatus: 'SCHEDULED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'
  meetingNotes?: string
  recordingUrl?: string
  jitsiConfig?: any
  waitingRoomEnabled: boolean
  maxParticipants: number
  createdAt: Date
  updatedAt: Date
  host: {
    id: string
    name: string
    email: string
  }
  participants: Array<{
    id: string
    name: string
    email: string
  }>
}

interface VideoSessionManagerProps {
  userId?: string
  viewMode?: 'host' | 'participant' | 'all'
  showPastSessions?: boolean
  embedded?: boolean
}

export default function VideoSessionManager({
  userId,
  viewMode = 'all',
  showPastSessions = true,
  embedded = false
}: VideoSessionManagerProps) {
  const { data: session, status } = useSession()
  const [sessions, setSessions] = useState<VideoSession[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedSession, setSelectedSession] = useState<VideoSession | null>(null)
  const [isJoining, setIsJoining] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming')

  // Use current session user ID if not provided
  const currentUserId = userId || session?.user?.id || null

  useEffect(() => {
    if (currentUserId) {
      fetchSessions()
    }
  }, [currentUserId, viewMode])

  const fetchSessions = async () => {
    try {
      setLoading(true)
      const queryParams = new URLSearchParams({
        userId: currentUserId!,
        viewMode,
        includePast: showPastSessions.toString()
      })

      const response = await fetch(`/api/sessions/user/${currentUserId}?${queryParams}`)
      if (!response.ok) {
        throw new Error('Failed to fetch sessions')
      }

      const data = await response.json()
      setSessions(data.map((session: any) => ({
        ...session,
        scheduledStart: new Date(session.scheduledStart),
        scheduledEnd: new Date(session.scheduledEnd),
        actualStart: session.actualStart ? new Date(session.actualStart) : undefined,
        actualEnd: session.actualEnd ? new Date(session.actualEnd) : undefined,
        createdAt: new Date(session.createdAt),
        updatedAt: new Date(session.updatedAt)
      })))
    } catch (error) {
      console.error('Error fetching sessions:', error)
      setError('Failed to load video sessions')
    } finally {
      setLoading(false)
    }
  }

  const joinSession = async (session: VideoSession) => {
    try {
      setIsJoining(session.id)

      // Check if payment is required and completed
      if (session.sessionType === 'PAID_SESSION' && !session.stripePaymentIntentId) {
        // Redirect to payment
        window.location.href = `/payment/session/${session.id}`
        return
      }

      // Mark user as joined
      await fetch(`/api/sessions/${session.id}/join`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUserId })
      })

      setSelectedSession(session)
    } catch (error) {
      console.error('Error joining session:', error)
      alert('Failed to join session. Please try again.')
    } finally {
      setIsJoining(null)
    }
  }

  const leaveSession = async (sessionId: string) => {
    try {
      await fetch(`/api/sessions/${sessionId}/leave`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUserId })
      })

      setSelectedSession(null)
      fetchSessions() // Refresh sessions
    } catch (error) {
      console.error('Error leaving session:', error)
    }
  }

  const getSessionTypeDisplay = (type: VideoSession['sessionType']) => {
    switch (type) {
      case 'FREE_CONSULTATION':
        return { label: 'Free Consultation', color: 'bg-green-100 text-green-800', icon: CheckCircle }
      case 'PAID_SESSION':
        return { label: 'Paid Session', color: 'bg-blue-100 text-blue-800', icon: DollarSign }
      case 'GROUP_COACHING':
        return { label: 'Group Coaching', color: 'bg-purple-100 text-purple-800', icon: Users }
      case 'WORKSHOP':
        return { label: 'Workshop', color: 'bg-orange-100 text-orange-800', icon: FileText }
      case 'OFFICE_HOURS':
        return { label: 'Office Hours', color: 'bg-indigo-100 text-indigo-800', icon: Clock }
      default:
        return { label: 'Session', color: 'bg-gray-100 text-gray-800', icon: Video }
    }
  }

  const getSessionStatusDisplay = (status: VideoSession['sessionStatus']) => {
    switch (status) {
      case 'SCHEDULED':
        return { label: 'Scheduled', color: 'bg-blue-100 text-blue-800', icon: Calendar }
      case 'ACTIVE':
        return { label: 'Live', color: 'bg-green-100 text-green-800', icon: Play }
      case 'COMPLETED':
        return { label: 'Completed', color: 'bg-gray-100 text-gray-800', icon: CheckCircle }
      case 'CANCELLED':
        return { label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: XCircle }
      case 'NO_SHOW':
        return { label: 'No Show', color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle }
      default:
        return { label: 'Unknown', color: 'bg-gray-100 text-gray-800', icon: AlertCircle }
    }
  }

  const getTimeDisplay = (date: Date) => {
    if (isToday(date)) {
      return `Today at ${format(date, 'h:mm a')}`
    } else if (isTomorrow(date)) {
      return `Tomorrow at ${format(date, 'h:mm a')}`
    } else {
      return format(date, 'MMM d, yyyy \'at\' h:mm a')
    }
  }

  const getTimeUntilSession = (date: Date) => {
    const minutes = differenceInMinutes(date, new Date())
    if (minutes < 0) return null
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return `${hours}h ${remainingMinutes}m`
  }

  const canJoinSession = (session: VideoSession) => {
    const now = new Date()
    const startTime = session.scheduledStart
    const endTime = session.scheduledEnd
    
    // Can join 15 minutes before scheduled start
    const joinWindow = new Date(startTime.getTime() - 15 * 60 * 1000)
    
    return now >= joinWindow && now <= endTime && session.sessionStatus !== 'CANCELLED'
  }

  const upcomingSessions = sessions.filter(s => !isPast(s.scheduledEnd) || s.sessionStatus === 'ACTIVE')
  const pastSessions = sessions.filter(s => isPast(s.scheduledEnd) && s.sessionStatus !== 'ACTIVE')

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Video className="h-8 w-8 text-blue-600 animate-pulse mr-3" />
            <span>Loading video sessions...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <AlertCircle className="h-8 w-8 mx-auto mb-2" />
            <p>{error}</p>
            <Button onClick={fetchSessions} variant="outline" className="mt-2">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // If in embedded mode and a session is selected, show the Jitsi embed
  if (embedded && selectedSession) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">{selectedSession.sessionName}</h3>
            <p className="text-sm text-muted-foreground">
              {getTimeDisplay(selectedSession.scheduledStart)}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => leaveSession(selectedSession.id)}
          >
            Leave Session
          </Button>
        </div>
        
        <JitsiMeetEmbed
          roomId={selectedSession.jitsiRoomId}
          displayName={session?.user?.name || 'Guest'}
          email={session?.user?.email}
          userRole={selectedSession.hostUserId === currentUserId ? 'host' : 'participant'}
          sessionType={selectedSession.sessionType.toLowerCase() as any}
          waitingRoomEnabled={selectedSession.waitingRoomEnabled}
          recordingEnabled={selectedSession.sessionType !== 'FREE_CONSULTATION'}
          maxParticipants={selectedSession.maxParticipants}
          customConfig={selectedSession.jitsiConfig}
          onMeetingEnd={() => leaveSession(selectedSession.id)}
        />
      </div>
    )
  }

  if (status === 'loading') {
    return <div className="flex items-center justify-center p-8">Loading...</div>
  }

  return (
    <div className="space-y-6">
      {/* Session Tabs */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg">
        <Button
          variant={activeTab === 'upcoming' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('upcoming')}
          className="flex-1"
        >
          Upcoming ({upcomingSessions.length})
        </Button>
        {showPastSessions && (
          <Button
            variant={activeTab === 'past' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('past')}
            className="flex-1"
          >
            Past ({pastSessions.length})
          </Button>
        )}
      </div>

      {/* Sessions List */}
      <ScrollArea className="h-[600px]">
        <div className="space-y-4">
          {activeTab === 'upcoming' && (
            <>
              {upcomingSessions.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-medium mb-2">No upcoming sessions</h3>
                    <p className="text-sm text-muted-foreground">
                      Check back later or schedule a new session.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                upcomingSessions.map((session) => {
                  const typeDisplay = getSessionTypeDisplay(session.sessionType)
                  const statusDisplay = getSessionStatusDisplay(session.sessionStatus)
                  const timeUntil = getTimeUntilSession(session.scheduledStart)
                  const TypeIcon = typeDisplay.icon
                  const StatusIcon = statusDisplay.icon

                  return (
                    <Card key={session.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <TypeIcon className="h-4 w-4" />
                              <h4 className="font-medium">{session.sessionName}</h4>
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>{getTimeDisplay(session.scheduledStart)}</span>
                                {timeUntil && (
                                  <Badge variant="outline" className="ml-2">
                                    in {timeUntil}
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                <span>{session.participants.length} / {session.maxParticipants}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 mb-3">
                              <Badge className={typeDisplay.color}>
                                {typeDisplay.label}
                              </Badge>
                              <Badge className={statusDisplay.color}>
                                <StatusIcon className="h-3 w-3 mr-1" />
                                {statusDisplay.label}
                              </Badge>
                              {session.hostUserId === currentUserId && (
                                <Badge variant="outline">Host</Badge>
                              )}
                            </div>

                            {session.sessionType === 'PAID_SESSION' && !session.stripePaymentIntentId && (
                              <div className="flex items-center gap-2 p-2 bg-yellow-50 rounded-md mb-2">
                                <CreditCard className="h-4 w-4 text-yellow-600" />
                                <span className="text-sm text-yellow-800">Payment required to join</span>
                              </div>
                            )}
                          </div>

                          <div className="flex flex-col gap-2">
                            {canJoinSession(session) ? (
                              <Button
                                onClick={() => joinSession(session)}
                                disabled={isJoining === session.id}
                                className="w-24"
                              >
                                {isJoining === session.id ? 'Joining...' : 'Join'}
                              </Button>
                            ) : (
                              <Button disabled variant="outline" className="w-24">
                                {isPast(session.scheduledEnd) ? 'Ended' : 'Soon'}
                              </Button>
                            )}
                            
                            {session.recordingUrl && (
                              <Button
                                size="sm"
                                variant="outline"
                                asChild
                              >
                                <a
                                  href={session.recordingUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <Download className="h-3 w-3 mr-1" />
                                  Recording
                                </a>
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })
              )}
            </>
          )}

          {activeTab === 'past' && showPastSessions && (
            <>
              {pastSessions.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-medium mb-2">No past sessions</h3>
                    <p className="text-sm text-muted-foreground">
                      Your completed sessions will appear here.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                pastSessions.map((session) => {
                  const typeDisplay = getSessionTypeDisplay(session.sessionType)
                  const statusDisplay = getSessionStatusDisplay(session.sessionStatus)
                  const TypeIcon = typeDisplay.icon
                  const StatusIcon = statusDisplay.icon

                  return (
                    <Card key={session.id} className="opacity-75">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <TypeIcon className="h-4 w-4" />
                              <h4 className="font-medium">{session.sessionName}</h4>
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>{format(session.scheduledStart, 'MMM d, yyyy \'at\' h:mm a')}</span>
                              </div>
                              {session.actualStart && session.actualEnd && (
                                <div className="flex items-center gap-1">
                                  <Play className="h-3 w-3" />
                                  <span>
                                    {differenceInMinutes(session.actualEnd, session.actualStart)} min
                                  </span>
                                </div>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              <Badge className={typeDisplay.color}>
                                {typeDisplay.label}
                              </Badge>
                              <Badge className={statusDisplay.color}>
                                <StatusIcon className="h-3 w-3 mr-1" />
                                {statusDisplay.label}
                              </Badge>
                            </div>

                            {session.meetingNotes && (
                              <p className="text-sm text-muted-foreground mt-2 p-2 bg-gray-50 rounded">
                                {session.meetingNotes}
                              </p>
                            )}
                          </div>

                          <div className="flex flex-col gap-2">
                            {session.recordingUrl && (
                              <Button
                                size="sm"
                                variant="outline"
                                asChild
                              >
                                <a
                                  href={session.recordingUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <Download className="h-3 w-3 mr-1" />
                                  Recording
                                </a>
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })
              )}
            </>
          )}
        </div>
      </ScrollArea>

      {/* Quick Join Dialog */}
      <Dialog open={!!selectedSession} onOpenChange={(open) => !open && setSelectedSession(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>
              {selectedSession?.sessionName}
            </DialogTitle>
          </DialogHeader>
          {selectedSession && (
            <JitsiMeetEmbed
              roomId={selectedSession.jitsiRoomId}
              displayName={session?.user?.name || 'Guest'}
              email={session?.user?.email}
              userRole={selectedSession.hostUserId === currentUserId ? 'host' : 'participant'}
              sessionType={selectedSession.sessionType.toLowerCase() as any}
              waitingRoomEnabled={selectedSession.waitingRoomEnabled}
              recordingEnabled={selectedSession.sessionType !== 'FREE_CONSULTATION'}
              maxParticipants={selectedSession.maxParticipants}
              customConfig={selectedSession.jitsiConfig}
              onMeetingEnd={() => leaveSession(selectedSession.id)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}