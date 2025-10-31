"use client"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/hooks/useAuth"
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
  ArrowLeft
} from "lucide-react"

interface Message {
  id: string
  content: string
  userId: string
  userName: string
  userRole: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN'
  timestamp: Date
  isRead: boolean
}

interface ChatRoom {
  id: string
  name: string
  description: string
  type: 'GENERAL' | 'HELP' | 'ANNOUNCEMENTS'
  participants: number
  lastMessage?: Message
}

export default function ChatPage() {
  const { user } = useAuth()
  const [selectedRoom, setSelectedRoom] = useState<string>('general')
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Mock chat rooms - in production, these would come from your database
  const chatRooms: ChatRoom[] = [
    {
      id: 'general',
      name: 'General Discussion',
      description: 'General chat for all students',
      type: 'GENERAL',
      participants: 12,
      lastMessage: {
        id: '1',
        content: 'Welcome to the student chat!',
        userId: 'instructor-1',
        userName: 'WebLaunchCoach',
        userRole: 'INSTRUCTOR',
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        isRead: true
      }
    },
    {
      id: 'help',
      name: 'Help & Support',
      description: 'Get help with your projects',
      type: 'HELP',
      participants: 8,
      lastMessage: {
        id: '2',
        content: 'How do I deploy to Vercel?',
        userId: 'student-1',
        userName: 'John S.',
        userRole: 'STUDENT',
        timestamp: new Date(Date.now() - 1000 * 60 * 15),
        isRead: false
      }
    },
    {
      id: 'announcements',
      name: 'Announcements',
      description: 'Important updates and news',
      type: 'ANNOUNCEMENTS',
      participants: 25,
      lastMessage: {
        id: '3',
        content: 'New chapter added to the textbook!',
        userId: 'instructor-1',
        userName: 'WebLaunchCoach',
        userRole: 'INSTRUCTOR',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
        isRead: true
      }
    }
  ]

  // Mock messages - in production, these would be fetched based on selected room
  const mockMessages: Message[] = [
    {
      id: '1',
      content: 'Welcome to the WebLaunchCoach student chat! This is where you can connect with fellow students and get real-time help.',
      userId: 'instructor-1',
      userName: 'WebLaunchCoach',
      userRole: 'INSTRUCTOR',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      isRead: true
    },
    {
      id: '2',
      content: 'Hi everyone! Excited to be here and start learning.',
      userId: 'student-1',
      userName: 'Sarah M.',
      userRole: 'STUDENT',
      timestamp: new Date(Date.now() - 1000 * 60 * 45),
      isRead: true
    },
    {
      id: '3',
      content: 'Has anyone successfully deployed their first Next.js app yet? I\'m working through Chapter 5.',
      userId: 'student-2',
      userName: 'Mike K.',
      userRole: 'STUDENT',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      isRead: true
    },
    {
      id: '4',
      content: 'Yes! Just deployed mine yesterday. The Vercel integration works perfectly. Make sure your environment variables are set correctly.',
      userId: 'student-3',
      userName: 'Lisa R.',
      userRole: 'STUDENT',
      timestamp: new Date(Date.now() - 1000 * 60 * 25),
      isRead: true
    }
  ]

  useEffect(() => {
    // Simulate real-time connection
    setIsConnected(true)
    setMessages(mockMessages)
    
    // In production, you would set up WebSocket connection here
    // const ws = new WebSocket('wss://your-websocket-server.com')
    // ws.onmessage = (event) => {
    //   const message = JSON.parse(event.data)
    //   setMessages(prev => [...prev, message])
    // }
    
    return () => {
      setIsConnected(false)
    }
  }, [selectedRoom])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = () => {
    if (!newMessage.trim() || !user) return

    const message: Message = {
      id: Date.now().toString(),
      content: newMessage,
      userId: user.id || 'current-user',
      userName: user.studentProfile?.full_name || user.adminProfile?.full_name || 'You',
      userRole: (user.userType as string) === 'admin' ? 'ADMIN' : 'STUDENT',
      timestamp: new Date(),
      isRead: false
    }

    setMessages(prev => [...prev, message])
    setNewMessage('')

    // In production, send to WebSocket server
    // ws.send(JSON.stringify(message))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(date)
  }

  const formatDate = (date: Date) => {
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
    switch (role) {
      case 'INSTRUCTOR':
      case 'ADMIN':
        return <Crown className="h-3 w-3 text-yellow-500" />
      default:
        return <User className="h-3 w-3 text-muted-foreground" />
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'INSTRUCTOR':
        return <Badge variant="secondary" className="text-xs">Instructor</Badge>
      case 'ADMIN':
        return <Badge variant="default" className="text-xs">Admin</Badge>
      default:
        return null
    }
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
                          {room.participants}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        {room.description}
                      </p>
                      {room.lastMessage && (
                        <div className="text-xs text-muted-foreground">
                          <span className="font-medium">{room.lastMessage.userName}:</span>{' '}
                          <span className="truncate">
                            {room.lastMessage.content.substring(0, 30)}...
                          </span>
                        </div>
                      )}
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
                      {chatRooms.find(r => r.id === selectedRoom)?.participants} participants
                    </p>
                  </div>
                  <Badge variant={isConnected ? "default" : "secondary"}>
                    {isConnected ? "Live" : "Offline"}
                  </Badge>
                </div>
              </CardHeader>

              {/* Messages */}
              <div className="flex-1 p-4 overflow-y-auto">
                <div className="space-y-4">
                  {messages.map((message, index) => {
                    const showDate = index === 0 || 
                      formatDate(message.timestamp) !== formatDate(messages[index - 1]?.timestamp)
                    
                    return (
                      <div key={message.id}>
                        {showDate && (
                          <div className="flex items-center justify-center my-4">
                            <Separator className="flex-1" />
                            <Badge variant="outline" className="mx-4 text-xs">
                              {formatDate(message.timestamp)}
                            </Badge>
                            <Separator className="flex-1" />
                          </div>
                        )}
                        
                        <div className={`flex gap-3 ${
                          message.userId === user?.id ? 'flex-row-reverse' : ''
                        }`}>
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              {getRoleIcon(message.userRole)}
                            </div>
                          </div>
                          
                          <div className={`flex-1 max-w-[80%] ${
                            message.userId === user?.id ? 'text-right' : ''
                          }`}>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm">{message.userName}</span>
                              {getRoleBadge(message.userRole)}
                              <span className="text-xs text-muted-foreground">
                                {formatTime(message.timestamp)}
                              </span>
                            </div>
                            
                            <div className={`inline-block p-3 rounded-lg text-sm ${
                              message.userId === user?.id
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            }`}>
                              {message.content}
                            </div>
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
                <div className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
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
                <p className="text-xs text-muted-foreground mt-2">
                  Press Enter to send, Shift+Enter for new line
                </p>
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
                  <li>• Search previous messages before asking</li>
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