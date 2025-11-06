"use client"

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { JitsiMeet } from '@/components/video/JitsiMeet'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Users, Video, Clock, ArrowLeft } from 'lucide-react'
import { usePresence } from "@/components/ui/online-indicator"
import Link from 'next/link'

// Use browser client for proper cookie handling in client components
const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function CollaborationPage() {
  const [user, setUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [currentRoom, setCurrentRoom] = useState<string | null>(null)
  const [roomName, setRoomName] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [participants, setParticipants] = useState<any[]>([])

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

  const handleJoinRoom = () => {
    if (!roomName.trim()) return
    setCurrentRoom(roomName.trim())
  }

  const handleLeaveRoom = () => {
    setCurrentRoom(null)
    setParticipants([])
  }

  const handleParticipantJoined = (participant: any) => {
    setParticipants(prev => [...prev, participant])
  }

  const handleParticipantLeft = (participant: any) => {
    setParticipants(prev => prev.filter(p => p.id !== participant.id))
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
                        className={`border-2 ${session.color} transition-all hover:shadow-lg cursor-pointer`}
                        onClick={() => {
                          setRoomName(session.id)
                          setCurrentRoom(session.id)
                        }}
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
                          <Button className="w-full" variant="default" size="sm">
                            Join {session.name}
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
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
              {/* Conference Header */}
              <div className="flex items-center justify-between bg-muted/30 p-4 rounded-lg">
                <div>
                  <h2 className="text-xl font-semibold">Room: {currentRoom}</h2>
                  <p className="text-sm text-muted-foreground">
                    Participants: {participants.length + 1} {/* +1 for current user */}
                  </p>
                </div>
                <Button variant="destructive" onClick={handleLeaveRoom}>
                  Leave Conference
                </Button>
              </div>

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
    </div>
  )
}
