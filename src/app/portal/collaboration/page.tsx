"use client"

export const dynamic = 'force-dynamic'

import { useState, useEffect, useMemo } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { JitsiMeet } from '@/components/video/JitsiMeet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Users, Video, Clock, ArrowLeft, Calendar, CheckCircle, XCircle, AlertTriangle, Play, Pause } from 'lucide-react'
import { usePresence } from "@/components/ui/online-indicator"
import Link from 'next/link'
import { Alert, AlertDescription } from '@/components/ui/alert'

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

  // Timer states - only for admin, manually controlled
  const [timerRunning, setTimerRunning] = useState(false)
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null)
  const [timeElapsed, setTimeElapsed] = useState(0)

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

  // Timer logic - only runs when manually started by admin
  useEffect(() => {
    if (!timerRunning || !sessionStartTime) return

    const interval = setInterval(() => {
      const now = new Date()
      const elapsed = Math.floor((now.getTime() - sessionStartTime.getTime()) / 1000)
      setTimeElapsed(elapsed)
    }, 1000)

    return () => clearInterval(interval)
  }, [timerRunning, sessionStartTime])

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
  }

  const handleJoinRoom = (sessionType?: SessionType, room?: string) => {
    const roomToJoin = room || roomName
    if (!roomToJoin.trim()) return
    setRoomName(roomToJoin)
    setCurrentSessionType(sessionType || 'custom')
    handleStartSetupCheck()
  }

  const handleLeaveRoom = () => {
    setCurrentRoom(null)
    setParticipants([])
    setTimerRunning(false)
    setSessionStartTime(null)
    setTimeElapsed(0)
    setSetupCheckComplete(false)
  }

  const handleParticipantJoined = (participant: any) => {
    setParticipants(prev => [...prev, participant])
  }

  const handleParticipantLeft = (participant: any) => {
    setParticipants(prev => prev.filter(p => p.id !== participant.id))
  }

  const handleStartTimer = () => {
    if (!sessionStartTime) {
      setSessionStartTime(new Date())
    }
    setTimerRunning(true)
  }

  const handleStopTimer = () => {
    setTimerRunning(false)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Session types with descriptions
  const sessionTypes = [
    {
      name: 'Group Coaching',
      id: 'group-coaching',
      description: 'Interactive group class learning sessions with your coach and fellow students. Perfect for collaborative learning, Q&A, and building together.',
      timeLimit: 'Unlimited',
      typicalDuration: 'Usually ~1 hour',
      icon: '👥',
      borderColor: 'border-blue-500/50',
      isPremium: false
    },
    {
      name: 'LVL UP Session',
      id: 'lvl-up-session',
      description: 'One-on-one video session dedicated to improving your website, fixing issues, or learning new techniques. Focused, personalized guidance for your project.',
      timeLimit: '1 hour',
      typicalDuration: '1 hour maximum',
      icon: '🚀',
      borderColor: 'border-green-500/50',
      isPremium: true
    },
    {
      name: 'Check-In',
      id: 'check-in',
      description: 'Quick, free surface-level consultation for minor questions, brief code reviews, or quick troubleshooting. Great for general advice and periodic accountability to stay on pace.',
      timeLimit: '15 minutes',
      typicalDuration: '15 mins maximum',
      icon: '⚡',
      borderColor: 'border-purple-500/50',
      isPremium: false
    }
  ]

  // Memoize Jitsi component to prevent re-renders from timer updates
  const jitsiComponent = useMemo(
    () => currentRoom ? (
      <JitsiMeet
        roomName={currentRoom}
        displayName={displayName || user?.email || undefined}
        onParticipantJoined={handleParticipantJoined}
        onParticipantLeft={handleParticipantLeft}
        onVideoConferenceLeft={handleLeaveRoom}
      />
    ) : null,
    [currentRoom, displayName, user?.email]
  )

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-12 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Collaboration Hub</h1>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-12 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-6xl">
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
                  onClick={() => handleJoinRoom()}
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
                      className={`${session.borderColor} transition-all hover:shadow-lg`}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <span className="text-3xl">{session.icon}</span>
                          {session.isPremium && (
                            <Badge variant="secondary" className="text-xs">
                              PREMIUM
                            </Badge>
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
                          <span className="font-semibold text-foreground">{session.timeLimit}</span>
                          <span className="text-muted-foreground text-xs">({session.typicalDuration})</span>
                        </div>
                        <Button
                          className="w-full"
                          variant="default"
                          size="sm"
                          onClick={() => {
                            handleJoinRoom(session.id as SessionType, session.id)
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
            <Card className="md:col-span-2 border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
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
                  <Button asChild size="lg" className="flex-shrink-0">
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

              {/* Admin-only timer controls */}
              {isAdmin && (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 text-white font-mono font-semibold">
                    <Clock className="h-5 w-5" />
                    <div className="text-center">
                      <div className="text-sm">Time Elapsed</div>
                      <div className="text-lg">{formatTime(timeElapsed)}</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {!timerRunning ? (
                      <Button
                        onClick={handleStartTimer}
                        size="sm"
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        <Play className="h-4 w-4" />
                        Start Timer
                      </Button>
                    ) : (
                      <Button
                        onClick={handleStopTimer}
                        size="sm"
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        <Pause className="h-4 w-4" />
                        Stop Timer
                      </Button>
                    )}
                  </div>
                </div>
              )}

              <Button variant="destructive" onClick={handleLeaveRoom}>
                Leave Conference
              </Button>
            </div>

            {/* Jitsi Meet Component */}
            <div className="h-[600px] rounded-lg overflow-hidden border">
              {jitsiComponent}
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
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Permission denied.</strong> You can still join, but you'll need to enable permissions in your browser settings to use {micPermission === 'denied' && cameraPermission === 'denied' ? 'microphone and camera' : micPermission === 'denied' ? 'microphone' : 'camera'}.
                </AlertDescription>
              </Alert>
            )}

            {/* Network Info */}
            <div className="p-4 bg-muted/30 rounded-lg border">
              <p className="text-sm text-muted-foreground">
                💡 <strong className="text-foreground">Tip:</strong> For the best experience, use a stable internet connection and close unnecessary browser tabs.
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
    </div>
  )
}
