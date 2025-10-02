"use client"

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { JitsiMeet } from '@/components/video/JitsiMeet'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Users, Video, Clock, Calendar } from 'lucide-react'
import VideoSessionManager from "@/components/video/VideoSessionManager"
import { usePresence } from "@/components/ui/online-indicator"

const supabase = createClient(
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

  // Quick room options
  const quickRooms = [
    { name: 'Office Hours', id: 'office-hours' },
    { name: 'Group Coaching', id: 'group-coaching' },
    { name: 'Workshop', id: 'workshop' },
    { name: 'Study Hall', id: 'study-hall' },
    { name: 'Q&A Session', id: 'qa-session' }
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
        <h1 className="text-3xl font-bold mb-2">Collaboration Hub</h1>
        <p className="text-muted-foreground">
          Connect with your coach and fellow students through video conferences and session management
        </p>
      </div>

      <Tabs defaultValue="video-conference" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="video-conference">Video Conference</TabsTrigger>
          <TabsTrigger value="session-manager">Session Manager</TabsTrigger>
        </TabsList>

        <TabsContent value="video-conference" className="space-y-6">
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

              {/* Quick Rooms */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Quick Join
                  </CardTitle>
                  <CardDescription>
                    Common rooms for Web Launch Academy activities
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {quickRooms.map((room) => (
                    <Button
                      key={room.id}
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => {
                        setRoomName(room.id)
                        setCurrentRoom(room.id)
                      }}
                    >
                      {room.name}
                    </Button>
                  ))}
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
        </TabsContent>

        <TabsContent value="session-manager" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Session Management
              </CardTitle>
              <CardDescription>
                Manage scheduled coaching sessions and workshops
              </CardDescription>
            </CardHeader>
            <CardContent>
              <VideoSessionManager />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
