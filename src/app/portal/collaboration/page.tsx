"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
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
  Upload
} from "lucide-react"

interface Meeting {
  id: string
  title: string
  description: string
  date: Date
  duration: number
  attendees: number
  type: 'GROUP_STUDY' | 'OFFICE_HOURS' | 'WORKSHOP' | 'ONE_ON_ONE'
  status: 'UPCOMING' | 'LIVE' | 'COMPLETED'
  meetingUrl?: string
  recordingUrl?: string
}

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
  const [selectedTab, setSelectedTab] = useState<'meetings' | 'resources'>('meetings')

  // Mock meetings data
  const meetings: Meeting[] = [
    {
      id: '1',
      title: 'Weekly Office Hours',
      description: 'Get help with your projects and ask questions',
      date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2), // 2 days from now
      duration: 60,
      attendees: 12,
      type: 'OFFICE_HOURS',
      status: 'UPCOMING',
      meetingUrl: 'https://zoom.us/j/123456789'
    },
    {
      id: '2',
      title: 'Next.js Deep Dive Workshop',
      description: 'Advanced Next.js concepts and best practices',
      date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5), // 5 days from now
      duration: 90,
      attendees: 25,
      type: 'WORKSHOP',
      status: 'UPCOMING',
      meetingUrl: 'https://zoom.us/j/987654321'
    },
    {
      id: '3',
      title: 'Student Project Showcase',
      description: 'Share your completed projects with fellow students',
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
      duration: 120,
      attendees: 18,
      type: 'GROUP_STUDY',
      status: 'COMPLETED',
      recordingUrl: 'https://zoom.us/rec/123456789'
    }
  ]

  // Mock shared resources
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
      uploadDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
      size: '156 KB',
      downloadUrl: '/downloads/deployment-checklist.pdf'
    },
    {
      id: '3',
      name: 'Database Schema Examples',
      type: 'DOCUMENT',
      uploadedBy: 'Sarah M.',
      uploadDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
      size: '892 KB',
      downloadUrl: '/downloads/database-schemas.pdf'
    }
  ]

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'LIVE':
        return <Badge className="bg-red-500 hover:bg-red-600">Live Now</Badge>
      case 'UPCOMING':
        return <Badge variant="outline">Upcoming</Badge>
      case 'COMPLETED':
        return <Badge variant="secondary">Completed</Badge>
      default:
        return null
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'DOCUMENT':
        return <FileText className="h-4 w-4 text-blue-500" />
      case 'CODE':
        return <FileText className="h-4 w-4 text-green-500" />
      case 'IMAGE':
        return <FileText className="h-4 w-4 text-purple-500" />
      case 'VIDEO':
        return <Video className="h-4 w-4 text-red-500" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 p-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Video className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Collaboration Hub</h1>
          </div>
          <p className="text-muted-foreground">
            Join meetings, share resources, and collaborate with fellow students
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-6">
          <Button
            variant={selectedTab === 'meetings' ? 'default' : 'outline'}
            onClick={() => setSelectedTab('meetings')}
            className="flex items-center gap-2"
          >
            <Video className="h-4 w-4" />
            Meetings
          </Button>
          <Button
            variant={selectedTab === 'resources' ? 'default' : 'outline'}
            onClick={() => setSelectedTab('resources')}
            className="flex items-center gap-2"
          >
            <Share2 className="h-4 w-4" />
            Shared Resources
          </Button>
        </div>

        {selectedTab === 'meetings' && (
          <div className="space-y-6">
            {/* Quick Join Section */}
            <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-5 w-5 text-primary" />
                  Quick Meeting Access
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="meeting-id">Meeting ID or URL</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        id="meeting-id"
                        placeholder="Enter meeting ID or paste Zoom URL"
                        className="flex-1"
                      />
                      <Button>Join</Button>
                    </div>
                  </div>
                  <div className="flex items-end">
                    <Button variant="outline" className="w-full">
                      <Plus className="mr-2 h-4 w-4" />
                      Schedule New Meeting
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Meetings List */}
            <div className="grid gap-4">
              {meetings.map((meeting) => (
                <Card key={meeting.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{meeting.title}</h3>
                          {getStatusBadge(meeting.status)}
                        </div>
                        
                        <p className="text-muted-foreground mb-4">
                          {meeting.description}
                        </p>
                        
                        <div className="grid sm:grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>{formatDate(meeting.date)}</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>{meeting.duration} minutes</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span>{meeting.attendees} attendees</span>
                          </div>
                          
                          <div>
                            <Badge variant="outline">
                              {meeting.type.replace('_', ' ')}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2 ml-4">
                        {meeting.status === 'UPCOMING' && meeting.meetingUrl && (
                          <Button asChild>
                            <a href={meeting.meetingUrl} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="mr-2 h-4 w-4" />
                              Join Meeting
                            </a>
                          </Button>
                        )}
                        
                        {meeting.status === 'LIVE' && meeting.meetingUrl && (
                          <Button className="bg-red-500 hover:bg-red-600" asChild>
                            <a href={meeting.meetingUrl} target="_blank" rel="noopener noreferrer">
                              <Video className="mr-2 h-4 w-4" />
                              Join Live
                            </a>
                          </Button>
                        )}
                        
                        {meeting.status === 'COMPLETED' && meeting.recordingUrl && (
                          <Button variant="outline" asChild>
                            <a href={meeting.recordingUrl} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="mr-2 h-4 w-4" />
                              View Recording
                            </a>
                          </Button>
                        )}
                        
                        <Button variant="ghost" size="sm">
                          Add to Calendar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {selectedTab === 'resources' && (
          <div className="space-y-6">
            {/* Upload Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Share a Resource
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="resource-name">Resource Name</Label>
                    <Input
                      id="resource-name"
                      placeholder="e.g., My Project Template"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="resource-type">Type</Label>
                    <select className="w-full mt-1 px-3 py-2 border border-input bg-background rounded-md">
                      <option value="DOCUMENT">Document</option>
                      <option value="CODE">Code</option>
                      <option value="IMAGE">Image</option>
                      <option value="VIDEO">Video</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="resource-description">Description (Optional)</Label>
                    <Textarea
                      id="resource-description"
                      placeholder="Brief description of the resource..."
                      className="mt-1"
                      rows={3}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                      <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground mb-2">
                        Drag and drop your file here, or click to browse
                      </p>
                      <Button variant="outline">
                        Choose File
                      </Button>
                      <p className="text-xs text-muted-foreground mt-2">
                        Max file size: 10MB. Supported formats: PDF, DOC, ZIP, PNG, JPG, MP4
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Resources List */}
            <div className="grid gap-4">
              {sharedResources.map((resource) => (
                <Card key={resource.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getTypeIcon(resource.type)}
                        <div>
                          <h3 className="font-medium">{resource.name}</h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>Shared by {resource.uploadedBy}</span>
                            <span>{resource.size}</span>
                            <span>{resource.uploadDate.toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      
                      <Button variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Integration Information */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Meeting Platform Integration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">🎥 Zoom Integration</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  All scheduled meetings use Zoom for the best video conferencing experience. 
                  Make sure you have the Zoom app installed for optimal performance.
                </p>
                <Button variant="outline" size="sm" asChild>
                  <a href="https://zoom.us/download" target="_blank" rel="noopener noreferrer">
                    Download Zoom
                  </a>
                </Button>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">📅 Calendar Sync</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Add meetings to your Google Calendar, Outlook, or Apple Calendar 
                  to never miss a session.
                </p>
                <Button variant="outline" size="sm">
                  Connect Calendar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}