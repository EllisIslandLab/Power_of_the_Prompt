"use client"

import { useState, useEffect, useRef } from "react"
import { createBrowserClient } from '@supabase/ssr'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import {
  MessageCircle,
  Send,
  Users,
  User,
  Crown,
  ArrowLeft,
  Search,
  X,
  Reply,
  Code
} from "lucide-react"

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Message {
  id: string
  content: string
  user_id: string
  room_id: string
  reply_to_message_id?: string
  created_at: string
  updated_at: string
  is_edited: boolean
  is_deleted: boolean
  user?: {
    full_name: string
    role: string
  }
  reply_to?: Message
}

interface ChatRoom {
  id: string
  name: string
  description: string
  type: 'GENERAL' | 'HELP' | 'ANNOUNCEMENTS' | 'CUSTOM'
  message_count?: number
  participant_count?: number
}

export default function ChatPage() {
  const [user, setUser] = useState<any>(null)
  const [selectedRoom, setSelectedRoom] = useState<string>('')
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [replyingTo, setReplyingTo] = useState<Message | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Load user and initialize
  useEffect(() => {
    async function loadUser() {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) return

      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single()

      setUser({ ...authUser, ...userData })
      loadChatRooms()
    }

    loadUser()
  }, [])

  // Load chat rooms with counts
  async function loadChatRooms() {
    const { data: rooms, error } = await supabase
      .from('chat_rooms')
      .select('*')
      .eq('is_active', true)
      .order('type', { ascending: true })

    if (rooms && !error) {
      // Get message counts for each room
      const roomsWithCounts = await Promise.all(
        rooms.map(async (room) => {
          const { count } = await supabase
            .from('chat_messages')
            .select('*', { count: 'exact', head: true })
            .eq('room_id', room.id)
            .eq('is_deleted', false)

          const { data: members } = await supabase
            .from('chat_room_members')
            .select('user_id')
            .eq('room_id', room.id)

          return {
            ...room,
            message_count: count || 0,
            participant_count: members?.length || 0
          }
        })
      )

      setChatRooms(roomsWithCounts)

      // Select first room by default
      if (roomsWithCounts.length > 0 && !selectedRoom) {
        setSelectedRoom(roomsWithCounts[0].id)
      }
    }
  }

  // Load messages for selected room
  useEffect(() => {
    if (!selectedRoom || !user) return

    async function loadMessages() {
      const { data, error } = await supabase
        .from('chat_messages')
        .select(`
          *,
          user:users!chat_messages_user_id_fkey(full_name, role),
          reply_to:chat_messages!chat_messages_reply_to_message_id_fkey(
            id,
            content,
            user_id,
            user:users!chat_messages_user_id_fkey(full_name)
          )
        `)
        .eq('room_id', selectedRoom)
        .eq('is_deleted', false)
        .order('created_at', { ascending: true })

      if (data && !error) {
        setMessages(data as any)
        setIsConnected(true)

        // Auto-join room if not already a member
        await supabase
          .from('chat_room_members')
          .upsert({
            room_id: selectedRoom,
            user_id: user.id,
            last_read_at: new Date().toISOString()
          })
      }
    }

    loadMessages()

    // Subscribe to real-time messages
    const channel = supabase
      .channel(`room:${selectedRoom}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `room_id=eq.${selectedRoom}`
        },
        async (payload) => {
          // Fetch the complete message with user data
          const { data } = await supabase
            .from('chat_messages')
            .select(`
              *,
              user:users!chat_messages_user_id_fkey(full_name, role),
              reply_to:chat_messages!chat_messages_reply_to_message_id_fkey(
                id,
                content,
                user_id,
                user:users!chat_messages_user_id_fkey(full_name)
              )
            `)
            .eq('id', payload.new.id)
            .single()

          if (data) {
            setMessages(prev => [...prev, data as any])
            // Update room counts
            loadChatRooms()
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [selectedRoom, user])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Send message
  const sendMessage = async () => {
    if (!newMessage.trim() || !user || !selectedRoom) return

    const { error } = await supabase
      .from('chat_messages')
      .insert({
        room_id: selectedRoom,
        user_id: user.id,
        content: newMessage.trim(),
        reply_to_message_id: replyingTo?.id || null
      })

    if (!error) {
      setNewMessage('')
      setReplyingTo(null)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const formatTime = (dateString: string) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(new Date(dateString))
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return 'Today'
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString()
    }
  }

  const getRoleIcon = (role: string) => {
    if (role === 'admin') {
      return <Crown className="h-3 w-3 text-yellow-500" />
    }
    return <User className="h-3 w-3 text-muted-foreground" />
  }

  const getRoleBadge = (role: string) => {
    if (role === 'admin') {
      return <Badge variant="default" className="text-xs">Admin</Badge>
    }
    return null
  }

  // Format message content with code blocks
  const formatMessageContent = (content: string) => {
    // Split by code blocks
    const parts = content.split(/(```[\s\S]*?```|`[^`]+`)/g)

    return parts.map((part, index) => {
      // Multi-line code block
      if (part.startsWith('```') && part.endsWith('```')) {
        const code = part.slice(3, -3).trim()
        return (
          <pre key={index} className="bg-muted p-3 rounded-md my-2 overflow-x-auto">
            <code className="text-sm font-mono">{code}</code>
          </pre>
        )
      }
      // Inline code
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={index} className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">
            {part.slice(1, -1)}
          </code>
        )
      }
      // Regular text
      return <span key={index}>{part}</span>
    })
  }

  // Truncate reply preview
  const truncateReply = (content: string, maxLength: number = 50) => {
    if (content.length <= maxLength) return content
    return content.substring(0, maxLength) + '...'
  }

  // Filter messages by search
  const filteredMessages = searchTerm
    ? messages.filter(msg =>
        msg.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.user?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : messages

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading chat...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 p-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <MessageCircle className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">Student Chat</h1>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-sm text-muted-foreground">
                  {isConnected ? 'Connected' : 'Connecting...'}
                </span>
              </div>
            </div>
            <Button variant="outline" asChild>
              <Link href="/portal">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Portal
              </Link>
            </Button>
          </div>
          <p className="text-muted-foreground">
            Connect with fellow students and get real-time help from instructors
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Chat Rooms Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Chat Rooms
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-1">
                  {chatRooms.map((room) => (
                    <button
                      key={room.id}
                      onClick={() => setSelectedRoom(room.id)}
                      className={`w-full p-4 text-left border-b last:border-b-0 hover:bg-muted/50 transition-colors ${
                        selectedRoom === room.id ? 'bg-primary/10 border-r-2 border-r-primary' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-medium text-sm">{room.name}</h3>
                        <Badge variant="outline" className="text-xs">
                          {room.message_count || 0}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        {room.description}
                      </p>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {room.participant_count || 0} members
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-3">
            <Card className="h-[600px] flex flex-col">
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {chatRooms.find(r => r.id === selectedRoom)?.name}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {chatRooms.find(r => r.id === selectedRoom)?.participant_count || 0} members · {chatRooms.find(r => r.id === selectedRoom)?.message_count || 0} messages
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search messages..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 w-64"
                      />
                      {searchTerm && (
                        <button
                          onClick={() => setSearchTerm('')}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        >
                          <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                        </button>
                      )}
                    </div>
                    <Badge variant={isConnected ? "default" : "secondary"}>
                      {isConnected ? "Live" : "Offline"}
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              {/* Messages */}
              <div className="flex-1 p-4 overflow-y-auto">
                {filteredMessages.length === 0 && searchTerm && (
                  <div className="text-center text-muted-foreground py-8">
                    No messages found matching &quot;{searchTerm}&quot;
                  </div>
                )}
                {filteredMessages.length === 0 && !searchTerm && (
                  <div className="text-center text-muted-foreground py-8">
                    No messages yet. Start the conversation!
                  </div>
                )}
                <div className="space-y-4">
                  {filteredMessages.map((message, index) => {
                    const showDate = index === 0 ||
                      formatDate(message.created_at) !== formatDate(filteredMessages[index - 1]?.created_at)

                    return (
                      <div key={message.id}>
                        {showDate && (
                          <div className="flex items-center justify-center my-4">
                            <Separator className="flex-1" />
                            <Badge variant="outline" className="mx-4 text-xs">
                              {formatDate(message.created_at)}
                            </Badge>
                            <Separator className="flex-1" />
                          </div>
                        )}

                        <div className={`flex gap-3 group ${
                          message.user_id === user?.id ? 'flex-row-reverse' : ''
                        }`}>
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              {getRoleIcon(message.user?.role || 'student')}
                            </div>
                          </div>

                          <div className={`flex-1 max-w-[80%] ${
                            message.user_id === user?.id ? 'text-right' : ''
                          }`}>
                            <div className={`flex items-center gap-2 mb-1 ${
                              message.user_id === user?.id ? 'justify-end' : ''
                            }`}>
                              <span className="font-medium text-sm">{message.user?.full_name || 'Unknown User'}</span>
                              {getRoleBadge(message.user?.role || 'student')}
                              <span className="text-xs text-muted-foreground">
                                {formatTime(message.created_at)}
                              </span>
                              {message.is_edited && (
                                <span className="text-xs text-muted-foreground italic">(edited)</span>
                              )}
                            </div>

                            {/* Reply Preview */}
                            {message.reply_to && (
                              <div className={`mb-2 p-2 rounded-md bg-muted/50 border-l-2 border-primary text-xs ${
                                message.user_id === user?.id ? 'text-left' : ''
                              }`}>
                                <div className="flex items-center gap-1 mb-1">
                                  <Reply className="h-3 w-3" />
                                  <span className="font-medium">@{message.reply_to.user?.full_name}</span>
                                </div>
                                <p className="text-muted-foreground">
                                  {truncateReply(message.reply_to.content)}
                                </p>
                              </div>
                            )}

                            <div className={`inline-block p-3 rounded-lg text-sm ${
                              message.user_id === user?.id
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            }`}>
                              {formatMessageContent(message.content)}
                            </div>

                            {/* Reply Button */}
                            <button
                              onClick={() => setReplyingTo(message)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity mt-1 text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                            >
                              <Reply className="h-3 w-3" />
                              Reply
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Message Input */}
              <div className="border-t p-4">
                {/* Reply Preview */}
                {replyingTo && (
                  <div className="mb-3 p-3 bg-muted/50 rounded-md border-l-2 border-primary">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2 text-sm">
                        <Reply className="h-4 w-4" />
                        <span className="font-medium">Replying to @{replyingTo.user?.full_name}</span>
                      </div>
                      <button onClick={() => setReplyingTo(null)}>
                        <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                      </button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {truncateReply(replyingTo.content, 100)}
                    </p>
                  </div>
                )}

                <div className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message... Use ` for inline code or ``` for code blocks"
                    className="flex-1"
                    disabled={!isConnected}
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || !isConnected}
                    size="icon"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-muted-foreground">
                    Press Enter to send, Shift+Enter for new line
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Code className="h-3 w-3" />
                    <span>Use `code` or ```code block```</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Chat Guidelines */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Chat Guidelines</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium mb-2">✅ Do:</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Be respectful and professional</li>
                  <li>• Help fellow students when you can</li>
                  <li>• Use appropriate chat rooms for your questions</li>
                  <li>• Use code formatting for code snippets</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">❌ Don&apos;t:</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Share personal contact information</li>
                  <li>• Post spam or off-topic content</li>
                  <li>• Use inappropriate language</li>
                  <li>• Share copyrighted materials</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
