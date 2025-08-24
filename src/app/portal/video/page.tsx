/*
COMMENTED OUT - Complex video conferencing page with Jitsi integration
This page contains complex authentication dependencies and video components that may interfere with the new authentication system.
Commented out during auth transition - can be re-enabled later when video conferencing features are needed.

Original functionality: Standalone video conferencing page with Jitsi Meet integration,
participant management, admin quick rooms, and real-time video communication.
*/

export default function VideoConferencePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground mb-4">Page Temporarily Unavailable</h1>
        <p className="text-muted-foreground">This video conferencing feature is currently disabled during system updates.</p>
      </div>
    </div>
  )
}

/*
ORIGINAL CODE - COMMENTED OUT FOR AUTH TRANSITION:

"use client"

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { JitsiMeet } from '@/components/video/JitsiMeet'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Users, Video, Clock } from 'lucide-react'

export default function VideoConferencePage() {
  const { user, isAdmin } = useAuth()
  const [currentRoom, setCurrentRoom] = useState<string | null>(null)
  const [roomName, setRoomName] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [participants, setParticipants] = useState<any[]>([])

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

  // Quick room options for admins
  const quickRooms = [
    { name: 'Office Hours', id: 'office-hours' },
    { name: 'Group Coaching', id: 'group-coaching' },
    { name: 'Workshop', id: 'workshop' },
    { name: 'Study Hall', id: 'study-hall' }
  ]

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Video Conference</h1>
          <p className="text-muted-foreground">Please sign in to access video conferencing</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Video Conference</h1>
        <p className="text-muted-foreground">
          Join or create video conferences for coaching sessions, workshops, and collaboration
        </p>
      </div>

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

          {/* Quick Rooms (Admin only) */}
          {isAdmin && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Quick Rooms
                </CardTitle>
                <CardDescription>
                  Pre-configured rooms for common activities
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
          )}

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
  )
}

END COMMENTED OUT CODE */