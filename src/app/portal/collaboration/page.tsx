"use client"

export const dynamic = 'force-dynamic'

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { 
  Video, 
  Calendar, 
  Users, 
  Clock, 
  ExternalLink,
  Plus,
  Share2,
  FileText,
  Download,
  Upload,
  Settings,
  Play,
  CheckCircle,
  BookOpen
} from "lucide-react"
import VideoSessionManager from "@/components/video/VideoSessionManager"

interface SharedResource {
  id: string
  name: string
  type: 'DOCUMENT' | 'CODE' | 'IMAGE' | 'VIDEO'
  uploadedBy: string
  uploadDate: Date
  size: string
  downloadUrl: string
}

export default function CollaborationPage() {
  if (typeof window === 'undefined') {
    return null
  }
  
  const [isClient, setIsClient] = useState(false)
  const { user, loading } = useAuth()
  const [selectedTab, setSelectedTab] = useState<'sessions' | 'resources'>('sessions')
  const [quickJoinRoom, setQuickJoinRoom] = useState('')

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Mock shared resources (this would come from your API)
  const sharedResources: SharedResource[] = [
    {
      id: '1',
      name: 'Next.js Starter Template',
      type: 'CODE',
      uploadedBy: 'WebLaunchCoach',
      uploadDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
      size: '2.4 MB',
      downloadUrl: '/downloads/nextjs-starter.zip'
    },
    {
      id: '2',
      name: 'Deployment Checklist',
      type: 'DOCUMENT',
      uploadedBy: 'WebLaunchCoach',
      uploadDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
      size: '156 KB',
      downloadUrl: '/downloads/deployment-checklist.pdf'
    },
    {
      id: '3',
      name: 'API Integration Guide',
      type: 'DOCUMENT',
      uploadedBy: 'Sarah M.',
      uploadDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1),
      size: '892 KB',
      downloadUrl: '/downloads/api-guide.pdf'
    },
    {
      id: '4',
      name: 'Workshop Recording - CSS Grid',
      type: 'VIDEO',
      uploadedBy: 'WebLaunchCoach',
      uploadDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14),
      size: '125 MB',
      downloadUrl: '/recordings/css-grid-workshop.mp4'
    }
  ]

  const getResourceIcon = (type: SharedResource['type']) => {
    switch (type) {
      case 'CODE':
        return <FileText className="h-4 w-4 text-blue-600" />
      case 'DOCUMENT':
        return <BookOpen className="h-4 w-4 text-green-600" />
      case 'IMAGE':
        return <FileText className="h-4 w-4 text-purple-600" />
      case 'VIDEO':
        return <Play className="h-4 w-4 text-red-600" />
      default:
        return <FileText className="h-4 w-4 text-gray-600" />
    }
  }

  const handleQuickJoin = () => {
    if (quickJoinRoom.trim()) {
      // Extract room ID from URL or use as-is
      let roomId = quickJoinRoom.trim()
      if (roomId.includes('meet.jit.si/')) {
        roomId = roomId.split('meet.jit.si/')[1]
      }
      
      // Open Jitsi room in new tab
      const jitsiDomain = process.env.NEXT_PUBLIC_JITSI_DOMAIN || 'meet.jit.si'
      window.open(`https://${jitsiDomain}/${roomId}`, '_blank')
    }
  }

  if (!isClient || status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Collaboration Hub
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Connect with fellow students and instructors through video sessions, 
            share resources, and collaborate on projects in real-time.
          </p>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="h-5 w-5 text-blue-600" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Quick Join */}
              <div>
                <Label htmlFor="quick-join" className="text-sm font-medium mb-2 block">
                  Quick Join Session
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="quick-join"
                    placeholder="Enter room ID or paste Jitsi URL"
                    value={quickJoinRoom}
                    onChange={(e) => setQuickJoinRoom(e.target.value)}
                    className="flex-1"
                    onKeyPress={(e) => e.key === 'Enter' && handleQuickJoin()}
                  />
                  <Button 
                    onClick={handleQuickJoin}
                    disabled={!quickJoinRoom.trim()}
                  >
                    <Video className="h-4 w-4 mr-1" />
                    Join
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Join any Jitsi room instantly with a room ID or URL
                </p>
              </div>

              {/* Schedule Session (for admins/hosts) */}
              {user?.userType === 'admin' && (
                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Host Actions
                  </Label>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1">
                      <Plus className="h-4 w-4 mr-1" />
                      Schedule Session
                    </Button>
                    <Button variant="outline">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Create and manage video sessions for students
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tab Navigation */}
        <div className="flex justify-center">
          <div className="flex space-x-1 bg-muted p-1 rounded-lg">
            <Button
              variant={selectedTab === 'sessions' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSelectedTab('sessions')}
              className="px-6"
            >
              <Video className="h-4 w-4 mr-2" />
              Video Sessions
            </Button>
            <Button
              variant={selectedTab === 'resources' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSelectedTab('resources')}
              className="px-6"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Shared Resources
            </Button>
          </div>
        </div>

        {/* Content Sections */}
        {selectedTab === 'sessions' && (
          <div className="space-y-6">
            {/* Video Session Manager */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  Your Video Sessions
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Manage your scheduled sessions, join active meetings, and access recordings
                </p>
              </CardHeader>
              <CardContent>
                <VideoSessionManager
                  userId={user?.id || undefined}
                  viewMode="all"
                  showPastSessions={true}
                  embedded={false}
                />
              </CardContent>
            </Card>

            {/* Platform Integration Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-blue-600" />
                  Platform Features
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Video className="h-4 w-4" />
                      Jitsi Meet Integration
                    </h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      All scheduled meetings use Jitsi Meet for secure, browser-based video conferencing. 
                      No downloads required - join directly from your browser with enterprise-grade security.
                    </p>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-green-600" />
                        <span>Browser-based - no software installation</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-green-600" />
                        <span>End-to-end encrypted communication</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-green-600" />
                        <span>Screen sharing and whiteboard support</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-green-600" />
                        <span>Recording capabilities for paid sessions</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Session Types
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <Badge className="bg-green-100 text-green-800">Free</Badge>
                        <div>
                          <p className="text-sm font-medium">Free Consultations</p>
                          <p className="text-xs text-muted-foreground">30-minute intro sessions</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Badge className="bg-blue-100 text-blue-800">Paid</Badge>
                        <div>
                          <p className="text-sm font-medium">1-on-1 Coaching</p>
                          <p className="text-xs text-muted-foreground">Personalized guidance sessions</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Badge className="bg-purple-100 text-purple-800">Group</Badge>
                        <div>
                          <p className="text-sm font-medium">Group Coaching</p>
                          <p className="text-xs text-muted-foreground">Learn together with peers</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Badge className="bg-orange-100 text-orange-800">Workshop</Badge>
                        <div>
                          <p className="text-sm font-medium">Technical Workshops</p>
                          <p className="text-xs text-muted-foreground">Deep-dive learning sessions</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {selectedTab === 'resources' && (
          <div className="space-y-6">
            {/* Shared Resources */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Share2 className="h-5 w-5 text-blue-600" />
                    Shared Resources
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Download templates, guides, and recordings shared by instructors and students
                  </p>
                </div>
                <Button size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Resource
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {sharedResources.map((resource) => (
                    <div key={resource.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0">
                          {getResourceIcon(resource.type)}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{resource.name}</h4>
                          <p className="text-sm text-gray-500">
                            Uploaded by {resource.uploadedBy} • {resource.uploadDate.toLocaleDateString()} • {resource.size}
                          </p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" asChild>
                        <a href={resource.downloadUrl} download>
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </a>
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Resource Categories */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4 text-center">
                  <FileText className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <h3 className="font-medium mb-1">Code Templates</h3>
                  <p className="text-sm text-muted-foreground">Starter projects and snippets</p>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4 text-center">
                  <BookOpen className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <h3 className="font-medium mb-1">Documentation</h3>
                  <p className="text-sm text-muted-foreground">Guides and references</p>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4 text-center">
                  <Play className="h-8 w-8 text-red-600 mx-auto mb-2" />
                  <h3 className="font-medium mb-1">Recordings</h3>
                  <p className="text-sm text-muted-foreground">Session and workshop videos</p>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4 text-center">
                  <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <h3 className="font-medium mb-1">Student Projects</h3>
                  <p className="text-sm text-muted-foreground">Community submissions</p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Help Section */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <Video className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-blue-900 mb-2">
                  Need Help with Video Sessions?
                </h3>
                <p className="text-sm text-blue-700 mb-4">
                  Our video collaboration platform is designed to be simple and intuitive. 
                  If you experience any issues with joining sessions or accessing features, 
                  we're here to help.
                </p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-100">
                    <FileText className="h-4 w-4 mr-2" />
                    View Guide
                  </Button>
                  <Button size="sm" variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-100">
                    <Users className="h-4 w-4 mr-2" />
                    Contact Support
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}