"use client"

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { JitsiMeet } from '@/components/video/JitsiMeet'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Users, Video, Clock, ArrowLeft, Calendar, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'
import { usePresence } from "@/components/ui/online-indicator"
import Link from 'next/link'
import { Alert, AlertDescription } from '@/components/ui/alert'

// Use browser client for proper cookie handling in client components
const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type SessionType = 'group-coaching' | 'lvl-up-session' | 'check-in' | 'custom'

export default function CollaborationPage() {
  const [user, setUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [currentRoom, setCurrentRoom] = useState<string | null>(null)
  const [currentSessionType, setCurrentSessionType] = useState<SessionType>('custom')
  const [roomName, setRoomName] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [participants, setParticipants] = useState<any[]>([])

  // Session timer states
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)
  const [warningShown, setWarningShown] = useState({ ten: false, five: false, one: false })

  // Pre-session check states
  const [showSetupCheck, setShowSetupCheck] = useState(false)
  const [setupCheckComplete, setSetupCheckComplete] = useState(false)
  const [micPermission, setMicPermission] = useState<'granted' | 'denied' | 'pending'>('pending')
  const [cameraPermission, setCameraPermission] = useState<'granted' | 'denied' | 'pending'>('pending')

  // Track presence for current user
  usePresence()

  useEffect(() => {
    async function loadUser() {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (authUser) {
        setUser(authUser)

        // Check if admin
        const { data: userData } = await supabase
          .from('users')
          .select('role')
          .eq('id', authUser.id)
          .single()

        setIsAdmin(userData?.role === 'admin')
      }
    }
    loadUser()
  }, [])

  // Session timer logic
  useEffect(() => {
    if (!sessionStartTime || !currentSessionType) return

    const interval = setInterval(() => {
      const now = new Date()
      const elapsed = Math.floor((now.getTime() - sessionStartTime.getTime()) / 1000)
      setTimeElapsed(elapsed)

      // Calculate time limits in seconds
      const limits: Record<SessionType, number | null> = {
        'check-in': 15 * 60,      // 15 minutes
        'lvl-up-session': 60 * 60, // 1 hour
        'group-coaching': null,    // unlimited
        'custom': null             // unlimited
      }

      const limit = limits[currentSessionType]
      if (limit) {
        const remaining = limit - elapsed
        setTimeRemaining(remaining)

        // Show warnings
        if (remaining <= 600 && remaining > 598 && !warningShown.ten) {
          setWarningShown(prev => ({ ...prev, ten: true }))
        }
        if (remaining <= 300 && remaining > 298 && !warningShown.five) {
          setWarningShown(prev => ({ ...prev, five: true }))
        }
        if (remaining <= 60 && remaining > 58 && !warningShown.one) {
          setWarningShown(prev => ({ ...prev, one: true }))
        }

        // Auto-end at 0 for admins only (soft reminder for students)
        if (remaining <= 0 && isAdmin) {
          handleLeaveRoom()
          alert('Session time limit reached. Thank you for your time!')
        }
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [sessionStartTime, currentSessionType, warningShown, isAdmin])

  // Pre-session setup check
  const checkMediaPermissions = async () => {
    try {
      // Check microphone
      const micStream = await navigator.mediaDevices.getUserMedia({ audio: true })
      setMicPermission('granted')
      micStream.getTracks().forEach(track => track.stop())
    } catch (error) {
      setMicPermission('denied')
    }

    try {
      // Check camera
      const cameraStream = await navigator.mediaDevices.getUserMedia({ video: true })
      setCameraPermission('granted')
      cameraStream.getTracks().forEach(track => track.stop())
    } catch (error) {
      setCameraPermission('denied')
    }
  }

  const handleStartSetupCheck = () => {
    setShowSetupCheck(true)
    checkMediaPermissions()
  }

  const handleSetupCheckComplete = () => {
    setSetupCheckComplete(true)
    setShowSetupCheck(false)
    setCurrentRoom(roomName.trim())
    setSessionStartTime(new Date())
    setWarningShown({ ten: false, five: false, one: false })
  }

  const handleJoinRoom = (sessionType?: SessionType) => {
    if (!roomName.trim()) return
    setCurrentSessionType(sessionType || 'custom')
    handleStartSetupCheck()
  }

  const handleLeaveRoom = () => {
    setCurrentRoom(null)
    setParticipants([])
    setSessionStartTime(null)
    setTimeElapsed(0)
    setTimeRemaining(null)
    setSetupCheckComplete(false)
    setWarningShown({ ten: false, five: false, one: false })
  }

  const handleParticipantJoined = (participant: any) => {
    setParticipants(prev => [...prev, participant])
  }

  const handleParticipantLeft = (participant: any) => {
    setParticipants(prev => prev.filter(p => p.id !== participant.id))
  }

  // Format time for display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(Math.abs(seconds) / 60)
    const secs = Math.abs(seconds) % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Get warning color based on time remaining
  const getWarningColor = (remaining: number | null) => {
    if (!remaining) return ''
    if (remaining <= 60) return 'bg-red-500 text-white'
    if (remaining <= 300) return 'bg-orange-500 text-white'
    if (remaining <= 600) return 'bg-yellow-500 text-yellow-950'
    return 'bg-green-500 text-white'
  }

  // Session types with descriptions and time limits
  const sessionTypes = [
    {
      name: 'Group Coaching',
      id: 'group-coaching',
      description: 'Interactive group class learning sessions with your coach and fellow students. Perfect for collaborative learning, Q&A, and building together.',
      timeLimit: 'Unlimited',
      typicalDuration: 'Usually ~1 hour',
      icon: '👥',
      color: 'border-blue-500 bg-blue-50 dark:bg-blue-950',
      isPremium: false
    },
    {
      name: 'LVL UP Session',
      id: 'lvl-up-session',
      description: 'One-on-one video session dedicated to improving your website, fixing issues, or learning new techniques. Focused, personalized guidance for your project.',
      timeLimit: '1 hour',
      typicalDuration: '1 hour maximum',
      icon: '🚀',
      color: 'border-green-500 bg-green-50 dark:bg-green-950',
      isPremium: true
    },
    {
      name: 'Check-In',
      id: 'check-in',
      description: 'Quick, free surface-level consultation for minor questions, brief code reviews, or quick troubleshooting. Great for getting unstuck fast.',
      timeLimit: '15 minutes',
      typicalDuration: '15 mins maximum',
      icon: '⚡',
      color: 'border-purple-500 bg-purple-50 dark:bg-purple-950',
      isPremium: false
    }
  ]

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Collaboration Hub</h1>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold">Collaboration Hub</h1>
          <Button variant="outline" asChild>
            <Link href="/portal">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Portal
            </Link>
          </Button>
        </div>
        <p className="text-muted-foreground">
          Connect with your coach and fellow students through video conferences
        </p>
      </div>

      <div className="space-y-6">
          {!currentRoom ? (
            <div className="grid gap-6 md:grid-cols-2">
              {/* Join Room Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Video className="h-5 w-5" />
                    Join Conference
                  </CardTitle>
                  <CardDescription>
                    Enter a room name to join or create a video conference
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="roomName">Room Name</Label>
                    <Input
                      id="roomName"
                      value={roomName}
                      onChange={(e) => setRoomName(e.target.value)}
                      placeholder="Enter room name..."
                      onKeyPress={(e) => e.key === 'Enter' && handleJoinRoom()}
                    />
                  </div>
                  <div>
                    <Label htmlFor="displayName">Display Name (Optional)</Label>
                    <Input
                      id="displayName"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder={user.email || 'Your name...'}
                    />
                  </div>
                  <Button
                    onClick={handleJoinRoom}
                    disabled={!roomName.trim()}
                    className="w-full"
                  >
                    Join Conference
                  </Button>
                </CardContent>
              </Card>

              {/* Session Types */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Session Types
                  </CardTitle>
                  <CardDescription>
                    Choose the type of session that fits your needs
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    {sessionTypes.map((session) => (
                      <Card
                        key={session.id}
                        className={`border-2 ${session.color} transition-all hover:shadow-lg`}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <span className="text-3xl">{session.icon}</span>
                            {session.isPremium && (
                              <span className="text-xs bg-yellow-500 text-yellow-950 px-2 py-1 rounded-full font-semibold">
                                PREMIUM
                              </span>
                            )}
                          </div>
                          <CardTitle className="text-lg mt-2">{session.name}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {session.description}
                          </p>
                          <div className="flex items-center gap-2 text-sm pt-2 border-t">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="font-semibold">{session.timeLimit}</span>
                            <span className="text-muted-foreground text-xs">({session.typicalDuration})</span>
                          </div>
                          <Button
                            className="w-full"
                            variant="default"
                            size="sm"
                            onClick={() => {
                              setRoomName(session.id)
                              handleJoinRoom(session.id as SessionType)
                            }}
                          >
                            Join {session.name}
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Schedule Sessions CTA */}
              <Card className="md:col-span-2 border-2 border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Schedule a Session in Advance
                  </CardTitle>
                  <CardDescription>
                    Book your LVL UP sessions or Group Coaching in advance with calendar invites and automatic reminders
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        📅 View available time slots • ⏰ Get email reminders • 📱 Add to your calendar
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Perfect for LVL UP sessions, workshops, and planned Group Coaching
                      </p>
                    </div>
                    <Button asChild size="lg" variant="default" className="flex-shrink-0">
                      <Link href="/portal/schedule">
                        <Calendar className="h-4 w-4 mr-2" />
                        Open Scheduler
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Instructions */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    How It Works
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Enter any room name to create or join a conference</li>
                    <li>• Share the room name with others to invite them</li>
                    <li>• Your microphone starts muted for privacy</li>
                    <li>• Use the toolbar to control audio, video, and screen sharing</li>
                    <li>• Perfect for coaching sessions, group work, and office hours</li>
                    {isAdmin && <li>• As an admin, you have moderator privileges in all rooms</li>}
                  </ul>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Conference Header with Timer */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-muted/30 p-4 rounded-lg gap-4">
                <div className="flex-grow">
                  <h2 className="text-xl font-semibold">Room: {currentRoom}</h2>
                  <p className="text-sm text-muted-foreground">
                    Participants: {participants.length + 1} {/* +1 for current user */}
                  </p>
                </div>

                {/* Session Timer */}
                {sessionStartTime && (
                  <div className="flex items-center gap-3">
                    {timeRemaining !== null ? (
                      <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono font-semibold ${getWarningColor(timeRemaining)}`}>
                        <Clock className="h-5 w-5" />
                        <div className="text-center">
                          <div className="text-sm">Time Remaining</div>
                          <div className="text-lg">{formatTime(timeRemaining)}</div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 text-white font-mono font-semibold">
                        <Clock className="h-5 w-5" />
                        <div className="text-center">
                          <div className="text-sm">Time Elapsed</div>
                          <div className="text-lg">{formatTime(timeElapsed)}</div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <Button variant="destructive" onClick={handleLeaveRoom}>
                  Leave Conference
                </Button>
              </div>

              {/* Time Warnings */}
              {timeRemaining !== null && (
                <>
                  {timeRemaining <= 600 && timeRemaining > 300 && (
                    <Alert className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      <AlertDescription className="text-yellow-800 dark:text-yellow-200">
                        <strong>10 minutes remaining</strong> - Please start wrapping up your session.
                      </AlertDescription>
                    </Alert>
                  )}
                  {timeRemaining <= 300 && timeRemaining > 60 && (
                    <Alert className="border-orange-500 bg-orange-50 dark:bg-orange-950">
                      <AlertTriangle className="h-4 w-4 text-orange-600" />
                      <AlertDescription className="text-orange-800 dark:text-orange-200">
                        <strong>5 minutes remaining</strong> - Session will end soon.
                      </AlertDescription>
                    </Alert>
                  )}
                  {timeRemaining <= 60 && timeRemaining > 0 && (
                    <Alert className="border-red-500 bg-red-50 dark:bg-red-950">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-red-800 dark:text-red-200">
                        <strong>1 minute remaining</strong> - Session ending very soon!
                      </AlertDescription>
                    </Alert>
                  )}
                </>
              )}

              {/* Jitsi Meet Component */}
              <div className="h-[600px] rounded-lg overflow-hidden border">
                <JitsiMeet
                  roomName={currentRoom}
                  displayName={displayName || user.email || undefined}
                  onParticipantJoined={handleParticipantJoined}
                  onParticipantLeft={handleParticipantLeft}
                  onVideoConferenceLeft={handleLeaveRoom}
                />
              </div>
            </div>
          )}
      </div>

      {/* Pre-Session Setup Check Modal */}
      <Dialog open={showSetupCheck} onOpenChange={setShowSetupCheck}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Pre-Session Setup Check</DialogTitle>
            <DialogDescription>
              Let's make sure your microphone and camera are working before joining the session
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Microphone Check */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                  micPermission === 'granted' ? 'bg-green-100 dark:bg-green-900' :
                  micPermission === 'denied' ? 'bg-red-100 dark:bg-red-900' :
                  'bg-gray-100 dark:bg-gray-800'
                }`}>
                  {micPermission === 'granted' ? <CheckCircle className="h-6 w-6 text-green-600" /> :
                   micPermission === 'denied' ? <XCircle className="h-6 w-6 text-red-600" /> :
                   <Clock className="h-6 w-6 text-gray-400" />}
                </div>
                <div>
                  <p className="font-medium">Microphone</p>
                  <p className="text-sm text-muted-foreground">
                    {micPermission === 'granted' ? 'Ready' :
                     micPermission === 'denied' ? 'Permission denied' :
                     'Checking...'}
                  </p>
                </div>
              </div>
            </div>

            {/* Camera Check */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                  cameraPermission === 'granted' ? 'bg-green-100 dark:bg-green-900' :
                  cameraPermission === 'denied' ? 'bg-red-100 dark:bg-red-900' :
                  'bg-gray-100 dark:bg-gray-800'
                }`}>
                  {cameraPermission === 'granted' ? <CheckCircle className="h-6 w-6 text-green-600" /> :
                   cameraPermission === 'denied' ? <XCircle className="h-6 w-6 text-red-600" /> :
                   <Clock className="h-6 w-6 text-gray-400" />}
                </div>
                <div>
                  <p className="font-medium">Camera</p>
                  <p className="text-sm text-muted-foreground">
                    {cameraPermission === 'granted' ? 'Ready' :
                     cameraPermission === 'denied' ? 'Permission denied' :
                     'Checking...'}
                  </p>
                </div>
              </div>
            </div>

            {/* Permissions Denied Warning */}
            {(micPermission === 'denied' || cameraPermission === 'denied') && (
              <Alert className="border-orange-500 bg-orange-50 dark:bg-orange-950">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-orange-800 dark:text-orange-200">
                  <strong>Permission denied.</strong> You can still join, but you'll need to enable permissions in your browser settings to use {micPermission === 'denied' && cameraPermission === 'denied' ? 'microphone and camera' : micPermission === 'denied' ? 'microphone' : 'camera'}.
                </AlertDescription>
              </Alert>
            )}

            {/* Network Info */}
            <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                💡 <strong>Tip:</strong> For the best experience, use a stable internet connection and close unnecessary browser tabs.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowSetupCheck(false)} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleSetupCheckComplete}
              className="flex-1"
              disabled={micPermission === 'pending' || cameraPermission === 'pending'}
            >
              Continue to Session
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
