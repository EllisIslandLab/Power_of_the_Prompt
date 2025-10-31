"use client"

import { useState, useEffect, useRef } from "react"
import { createBrowserClient } from '@supabase/ssr'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
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
  Code,
  Smile,
  Edit2,
  Trash2,
  Paperclip,
  Image as ImageIcon,
  FileText,
  Download,
  Copy,
  Check
} from "lucide-react"

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Reaction {
  id: string
  message_id: string
  user_id: string
  emoji: string
  user?: {
    full_name: string
  }
}

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
  attachment_url?: string
  attachment_type?: string
  attachment_name?: string
  attachment_size?: number
  user?: {
    full_name: string
    role: string
  }
  reply_to?: Message
  reactions?: Reaction[]
}

interface ChatRoom {
  id: string
  name: string
  description: string
  type: 'GENERAL' | 'HELP' | 'ANNOUNCEMENTS' | 'CUSTOM'
  message_count?: number
  participant_count?: number
}

interface TypingUser {
  user_id: string
  user?: {
    full_name: string
  }
}

const COMMON_EMOJIS = ['👍', '❤️', '😂', '🎉', '🚀', '💯']

export default function ChatPage() {
  const [user, setUser] = useState<any>(null)
  const [selectedRoom, setSelectedRoom] = useState<string>('')
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [replyingTo, setReplyingTo] = useState<Message | null>(null)
  const [editingMessage, setEditingMessage] = useState<Message | null>(null)
  const [editContent, setEditContent] = useState('')
  const [showReactionPicker, setShowReactionPicker] = useState<string | null>(null)
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([])
  const [uploadingFile, setUploadingFile] = useState(false)
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

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

      if (roomsWithCounts.length > 0 && !selectedRoom) {
        setSelectedRoom(roomsWithCounts[0].id)
      }
    }
  }

  // Load messages with reactions
  async function loadMessages() {
    const { data, error } = await supabase
      .from('chat_messages')
      .select(`
        *,
        user:users!chat_messages_user_id_fkey(full_name, role)
      `)
      .eq('room_id', selectedRoom)
      .eq('is_deleted', false)
      .order('created_at', { ascending: true })

    if (data && !error) {
      // Load reactions and reply info for all messages
      const messagesWithReactions = await Promise.all(
        data.map(async (msg) => {
          const { data: reactions } = await supabase
            .from('message_reactions')
            .select('*, user:users!message_reactions_user_id_fkey(full_name)')
            .eq('message_id', msg.id)

          // Load reply_to message and user if exists
          let replyData = null
          if (msg.reply_to_message_id) {
            const { data: replyMsg } = await supabase
              .from('chat_messages')
              .select('id, content, user_id')
              .eq('id', msg.reply_to_message_id)
              .single()

            if (replyMsg) {
              const { data: replyUser } = await supabase
                .from('users')
                .select('full_name')
                .eq('id', replyMsg.user_id)
                .single()

              replyData = {
                ...replyMsg,
                user: replyUser
              }
            }
          }

          return {
            ...msg,
            reply_to: replyData,
            reactions: reactions || []
          }
        })
      )

      setMessages(messagesWithReactions as any)
      setIsConnected(true)

      // Auto-join room
      await supabase
        .from('chat_room_members')
        .upsert({
          room_id: selectedRoom,
          user_id: user.id,
          last_read_at: new Date().toISOString()
        })
    }
  }

  // Load messages for selected room
  useEffect(() => {
    if (!selectedRoom || !user) return

    loadMessages()

    // Subscribe to real-time messages
    const messageChannel = supabase
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
          const { data } = await supabase
            .from('chat_messages')
            .select(`
              *,
              user:users!chat_messages_user_id_fkey(full_name, role)
            `)
            .eq('id', payload.new.id)
            .single()

          if (data) {
            // Load reply_to message and user if exists
            let replyData = null
            if (data.reply_to_message_id) {
              const { data: replyMsg } = await supabase
                .from('chat_messages')
                .select('id, content, user_id')
                .eq('id', data.reply_to_message_id)
                .single()

              if (replyMsg) {
                const { data: replyUser } = await supabase
                  .from('users')
                  .select('full_name')
                  .eq('id', replyMsg.user_id)
                  .single()

                replyData = {
                  ...replyMsg,
                  user: replyUser
                }
              }
            }

            const messageWithReply = {
              ...data,
              reply_to: replyData
            }

            setMessages(prev => [...prev, { ...messageWithReply, reactions: [] } as any])
            loadChatRooms()
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'chat_messages',
          filter: `room_id=eq.${selectedRoom}`
        },
        async (payload) => {
          setMessages(prev => prev.map(msg =>
            msg.id === payload.new.id
              ? { ...msg, ...payload.new, is_edited: true }
              : msg
          ))
        }
      )
      .subscribe()

    // Subscribe to reactions
    const reactionChannel = supabase
      .channel(`reactions:${selectedRoom}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'message_reactions'
        },
        async () => {
          // Reload messages with updated reactions
          loadMessages()
        }
      )
      .subscribe()

    // Subscribe to typing indicators
    const typingChannel = supabase
      .channel(`typing:${selectedRoom}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_typing',
          filter: `room_id=eq.${selectedRoom}`
        },
        async () => {
          const { data } = await supabase
            .from('chat_typing')
            .select('user_id, user:users!chat_typing_user_id_fkey(full_name)')
            .eq('room_id', selectedRoom)
            .gt('typing_at', new Date(Date.now() - 10000).toISOString())

          if (data) {
            setTypingUsers(data.filter(t => t.user_id !== user.id) as any)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(messageChannel)
      supabase.removeChannel(reactionChannel)
      supabase.removeChannel(typingChannel)
    }
  }, [selectedRoom, user])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Typing indicator handler
  const handleTyping = async () => {
    if (!user || !selectedRoom) return

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
      typingTimeoutRef.current = null
    }

    // Update typing status
    await supabase
      .from('chat_typing')
      .upsert({
        room_id: selectedRoom,
        user_id: user.id,
        typing_at: new Date().toISOString()
      })

    // Clear typing status after 3 seconds of inactivity
    typingTimeoutRef.current = setTimeout(async () => {
      await supabase
        .from('chat_typing')
        .delete()
        .eq('room_id', selectedRoom)
        .eq('user_id', user.id)
    }, 3000)
  }

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

      // Clear typing indicator
      await supabase
        .from('chat_typing')
        .delete()
        .eq('room_id', selectedRoom)
        .eq('user_id', user.id)
    }
  }

  // Edit message
  const saveEdit = async () => {
    if (!editingMessage || !editContent.trim()) return

    const { error } = await supabase
      .from('chat_messages')
      .update({
        content: editContent.trim(),
        is_edited: true
      })
      .eq('id', editingMessage.id)

    if (!error) {
      setEditingMessage(null)
      setEditContent('')
      loadMessages()
    }
  }

  // Delete message
  const deleteMessage = async (messageId: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return

    const { error } = await supabase
      .from('chat_messages')
      .update({ is_deleted: true })
      .eq('id', messageId)

    if (!error) {
      setMessages(prev => prev.filter(msg => msg.id !== messageId))
      loadChatRooms()
    }
  }

  // Add reaction
  const addReaction = async (messageId: string, emoji: string) => {
    if (!user) return

    // Check if user already reacted with this emoji
    const message = messages.find(m => m.id === messageId)
    const existingReaction = message?.reactions?.find(
      r => r.user_id === user.id && r.emoji === emoji
    )

    if (existingReaction) {
      // Remove reaction
      await supabase
        .from('message_reactions')
        .delete()
        .eq('id', existingReaction.id)
    } else {
      // Add reaction
      await supabase
        .from('message_reactions')
        .insert({
          message_id: messageId,
          user_id: user.id,
          emoji
        })
    }

    setShowReactionPicker(null)
  }

  // Copy message to clipboard
  const copyMessage = async (message: Message) => {
    const textToCopy = `From ${message.user?.full_name} in Announcements:\n\n${message.content}`

    try {
      await navigator.clipboard.writeText(textToCopy)
      setCopiedMessageId(message.id)
      setTimeout(() => setCopiedMessageId(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
      alert('Failed to copy message')
    }
  }

  // Handle file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !user || !selectedRoom) return

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB')
      return
    }

    setUploadingFile(true)

    try {
      // Upload to Supabase storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/${Date.now()}.${fileExt}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('chat-attachments')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('chat-attachments')
        .getPublicUrl(fileName)

      // Create message with attachment
      await supabase
        .from('chat_messages')
        .insert({
          room_id: selectedRoom,
          user_id: user.id,
          content: `Shared ${file.type.startsWith('image/') ? 'an image' : 'a file'}: ${file.name}`,
          attachment_url: publicUrl,
          attachment_type: file.type,
          attachment_name: file.name,
          attachment_size: file.size,
          reply_to_message_id: replyingTo?.id || null
        })

      setReplyingTo(null)
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload file')
    } finally {
      setUploadingFile(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (editingMessage) {
        saveEdit()
      } else {
        sendMessage()
      }
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

  // Check if message can be edited (within 5 minutes)
  const canEditMessage = (message: Message) => {
    if (message.user_id !== user?.id) return false
    const messageTime = new Date(message.created_at).getTime()
    const now = Date.now()
    return (now - messageTime) < 5 * 60 * 1000 // 5 minutes
  }

  // Format message content with code blocks
  const formatMessageContent = (content: string) => {
    const parts = content.split(/(```[\s\S]*?```|`[^`]+`)/g)

    return parts.map((part, index) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const code = part.slice(3, -3).trim()
        return (
          <pre key={index} className="bg-muted p-3 rounded-md my-2 overflow-x-auto">
            <code className="text-sm font-mono">{code}</code>
          </pre>
        )
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={index} className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">
            {part.slice(1, -1)}
          </code>
        )
      }
      return <span key={index}>{part}</span>
    })
  }

  const truncateReply = (content: string, maxLength: number = 50) => {
    if (content.length <= maxLength) return content
    return content.substring(0, maxLength) + '...'
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  // Get current room
  const currentRoom = chatRooms.find(r => r.id === selectedRoom)

  // Filter messages by search
  const filteredMessages = searchTerm
    ? messages.filter(msg =>
        msg.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.user?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : messages

  // Group reactions by emoji
  const getGroupedReactions = (reactions: Reaction[]) => {
    const grouped: { [emoji: string]: Reaction[] } = {}
    reactions.forEach(reaction => {
      if (!grouped[reaction.emoji]) {
        grouped[reaction.emoji] = []
      }
      grouped[reaction.emoji].push(reaction)
    })
    return grouped
  }

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

                    const isEditing = editingMessage?.id === message.id
                    const groupedReactions = getGroupedReactions(message.reactions || [])

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

                            {isEditing ? (
                              <div className="space-y-2">
                                <Textarea
                                  value={editContent}
                                  onChange={(e) => setEditContent(e.target.value)}
                                  className="min-h-[60px]"
                                  autoFocus
                                />
                                <div className="flex gap-2">
                                  <Button size="sm" onClick={saveEdit}>Save</Button>
                                  <Button size="sm" variant="outline" onClick={() => {
                                    setEditingMessage(null)
                                    setEditContent('')
                                  }}>Cancel</Button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className={`inline-block p-3 rounded-lg text-sm ${
                                  message.user_id === user?.id
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted'
                                }`}>
                                  {formatMessageContent(message.content)}

                                  {/* File Attachment */}
                                  {message.attachment_url && (
                                    <div className="mt-2 pt-2 border-t border-border/50">
                                      {message.attachment_type?.startsWith('image/') ? (
                                        <a
                                          href={message.attachment_url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="block"
                                        >
                                          <img
                                            src={message.attachment_url}
                                            alt={message.attachment_name}
                                            className="max-w-full max-h-64 rounded"
                                          />
                                        </a>
                                      ) : (
                                        <a
                                          href={message.attachment_url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="flex items-center gap-2 text-xs hover:underline"
                                        >
                                          <FileText className="h-4 w-4" />
                                          <span>{message.attachment_name}</span>
                                          <span className="text-muted-foreground">
                                            ({formatFileSize(message.attachment_size || 0)})
                                          </span>
                                          <Download className="h-3 w-3" />
                                        </a>
                                      )}
                                    </div>
                                  )}
                                </div>

                                {/* Reactions */}
                                {Object.keys(groupedReactions).length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {Object.entries(groupedReactions).map(([emoji, reactions]) => {
                                      const userReacted = reactions.some(r => r.user_id === user?.id)
                                      return (
                                        <button
                                          key={emoji}
                                          onClick={() => addReaction(message.id, emoji)}
                                          className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs border ${
                                            userReacted
                                              ? 'bg-primary/20 border-primary'
                                              : 'bg-muted border-border hover:border-primary'
                                          }`}
                                          title={reactions.map(r => r.user?.full_name).join(', ')}
                                        >
                                          <span>{emoji}</span>
                                          <span>{reactions.length}</span>
                                        </button>
                                      )
                                    })}
                                  </div>
                                )}

                                {/* Action Buttons */}
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity mt-1 flex items-center gap-2">
                                  {/* Reply button */}
                                  <button
                                    onClick={() => setReplyingTo(message)}
                                    className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                                  >
                                    <Reply className="h-3 w-3" />
                                    Reply
                                  </button>

                                  {/* React button */}
                                  <div className="relative">
                                    <button
                                      onClick={() => setShowReactionPicker(
                                        showReactionPicker === message.id ? null : message.id
                                      )}
                                      className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                                    >
                                      <Smile className="h-3 w-3" />
                                      React
                                    </button>

                                    {/* Reaction Picker */}
                                    {showReactionPicker === message.id && (
                                      <div className="absolute bottom-full left-0 mb-2 bg-background border rounded-lg p-2 shadow-lg flex gap-1 z-10">
                                        {['👍', '❤️', '😂', '🎉', '🤔', '👀'].map(emoji => (
                                          <button
                                            key={emoji}
                                            onClick={() => {
                                              addReaction(message.id, emoji)
                                              setShowReactionPicker(null)
                                            }}
                                            className="hover:bg-muted p-1 rounded text-lg"
                                          >
                                            {emoji}
                                          </button>
                                        ))}
                                      </div>
                                    )}
                                  </div>

                                  {/* Edit button for own messages */}
                                  {message.user_id === user?.id && (
                                    <button
                                      onClick={() => {
                                        setEditingMessage(message)
                                        setEditContent(message.content)
                                      }}
                                      className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                                    >
                                      <Edit2 className="h-3 w-3" />
                                      Edit
                                    </button>
                                  )}

                                  {(message.user_id === user?.id || user?.role === 'admin') && (
                                    <button
                                      onClick={() => deleteMessage(message.id)}
                                      className="text-xs text-destructive hover:text-destructive/80 flex items-center gap-1"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                      Delete
                                    </button>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}

                  {/* Typing Indicators */}
                  {typingUsers.length > 0 && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground italic">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                        <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                        <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                      </div>
                      <span>
                        {typingUsers.length === 1
                          ? `${typingUsers[0].user?.full_name} is typing...`
                          : `${typingUsers.length} people are typing...`}
                      </span>
                    </div>
                  )}

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
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={handleFileUpload}
                    accept="image/*,.pdf,.doc,.docx,.txt"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingFile || !isConnected}
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Input
                    value={newMessage}
                    onChange={(e) => {
                      setNewMessage(e.target.value)
                      handleTyping()
                    }}
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
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Code className="h-3 w-3" />
                      <span>Use `code` or ```code block```</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Paperclip className="h-3 w-3" />
                      <span>Upload files (max 10MB)</span>
                    </div>
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
                  <li>• React to messages to show appreciation</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">❌ Don&apos;t:</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Share personal contact information</li>
                  <li>• Post spam or off-topic content</li>
                  <li>• Use inappropriate language</li>
                  <li>• Share copyrighted materials</li>
                  <li>• Edit messages to change meaning after replies</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
