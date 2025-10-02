"use client"

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Video, Calendar, Users, Plus, Clock, Search } from 'lucide-react'
import { useRouter } from 'next/navigation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface VideoSession {
  id: string
  title: string
  room_name: string
  host_id: string
  type: string
  scheduled_for: string | null
  status: string
  max_participants: number | null
  created_at: string
}

export default function AdminSessionsPage() {
  const router = useRouter()
  const [sessions, setSessions] = useState<VideoSession[]>([])
  const [filteredSessions, setFilteredSessions] = useState<VideoSession[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  // Form state for creating sessions
  const [newSession, setNewSession] = useState({
    title: '',
    room_name: '',
    type: 'office-hours' as 'office-hours' | 'group-coaching' | 'workshop' | 'one-on-one',
    scheduled_for: '',
    max_participants: 10
  })

  useEffect(() => {
    loadCurrentUser()
    loadSessions()
  }, [])

  useEffect(() => {
    filterSessions()
  }, [searchTerm, statusFilter, typeFilter, sessions])

  async function loadCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      setCurrentUserId(user.id)
    }
  }

  async function loadSessions() {
    try {
      const { data, error } = await supabase
        .from('video_sessions')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setSessions(data || [])
      setFilteredSessions(data || [])
    } catch (error) {
      console.error('Error loading sessions:', error)
    } finally {
      setLoading(false)
    }
  }

  function filterSessions() {
    let filtered = [...sessions]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(session =>
        session.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.room_name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(session => session.status === statusFilter)
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(session => session.type === typeFilter)
    }

    setFilteredSessions(filtered)
  }

  async function createSession() {
    if (!currentUserId) {
      alert('You must be logged in to create a session')
      return
    }

    if (!newSession.title || !newSession.room_name) {
      alert('Please fill in all required fields')
      return
    }

    try {
      const { error } = await supabase
        .from('video_sessions')
        .insert({
          title: newSession.title,
          room_name: newSession.room_name,
          host_id: currentUserId,
          type: newSession.type,
          scheduled_for: newSession.scheduled_for || null,
          status: 'scheduled',
          max_participants: newSession.max_participants
        })

      if (error) throw error

      alert('Session created successfully!')
      setShowCreateDialog(false)
      setNewSession({
        title: '',
        room_name: '',
        type: 'office-hours',
        scheduled_for: '',
        max_participants: 10
      })
      loadSessions()
    } catch (error) {
      console.error('Error creating session:', error)
      alert('Failed to create session')
    }
  }

  async function joinSession(roomName: string) {
    router.push(`/portal/collaboration?room=${roomName}`)
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default'
      case 'scheduled': return 'secondary'
      case 'completed': return 'outline'
      case 'cancelled': return 'destructive'
      default: return 'secondary'
    }
  }

  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case 'office-hours': return 'default'
      case 'group-coaching': return 'secondary'
      case 'workshop': return 'outline'
      case 'one-on-one': return 'default'
      default: return 'secondary'
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading sessions...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Video className="h-8 w-8" />
            Video Sessions
          </h1>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Session
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Video Session</DialogTitle>
                <DialogDescription>
                  Schedule a new coaching session or office hours
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Session Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Office Hours - Week 1"
                    value={newSession.title}
                    onChange={(e) => setNewSession({ ...newSession, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="room_name">Room Name *</Label>
                  <Input
                    id="room_name"
                    placeholder="e.g., office-hours-week-1"
                    value={newSession.room_name}
                    onChange={(e) => setNewSession({ ...newSession, room_name: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Use lowercase letters and hyphens only
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Session Type</Label>
                  <Select
                    value={newSession.type}
                    onValueChange={(value: any) => setNewSession({ ...newSession, type: value })}
                  >
                    <SelectTrigger id="type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="office-hours">Office Hours</SelectItem>
                      <SelectItem value="group-coaching">Group Coaching</SelectItem>
                      <SelectItem value="workshop">Workshop</SelectItem>
                      <SelectItem value="one-on-one">One-on-One</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="scheduled_for">Scheduled Time (Optional)</Label>
                  <Input
                    id="scheduled_for"
                    type="datetime-local"
                    value={newSession.scheduled_for}
                    onChange={(e) => setNewSession({ ...newSession, scheduled_for: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max_participants">Max Participants</Label>
                  <Input
                    id="max_participants"
                    type="number"
                    value={newSession.max_participants}
                    onChange={(e) => setNewSession({ ...newSession, max_participants: parseInt(e.target.value) || 10 })}
                  />
                </div>
                <Button onClick={createSession} className="w-full">
                  Create Session
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <p className="text-muted-foreground">
          Manage video sessions, office hours, and coaching calls
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <Video className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sessions.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sessions.filter(s => s.status === 'scheduled').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sessions.filter(s => s.status === 'active').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sessions.filter(s => s.status === 'completed').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search & Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by title or room..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="office-hours">Office Hours</SelectItem>
                  <SelectItem value="group-coaching">Group Coaching</SelectItem>
                  <SelectItem value="workshop">Workshop</SelectItem>
                  <SelectItem value="one-on-one">One-on-One</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sessions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Sessions ({filteredSessions.length})</CardTitle>
          <CardDescription>
            View and manage all video sessions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Room Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Scheduled</TableHead>
                  <TableHead>Max Participants</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSessions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No sessions found matching your filters
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSessions.map((session) => (
                    <TableRow key={session.id}>
                      <TableCell className="font-medium">{session.title}</TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {session.room_name}
                        </code>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getTypeBadgeVariant(session.type)}>
                          {session.type.replace('-', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(session.status)}>
                          {session.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {session.scheduled_for ? (
                          <div className="text-sm">
                            {new Date(session.scheduled_for).toLocaleString()}
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">Not scheduled</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {session.max_participants || 'Unlimited'}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          onClick={() => joinSession(session.room_name)}
                          disabled={session.status === 'cancelled'}
                        >
                          <Video className="h-4 w-4 mr-1" />
                          Join
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
