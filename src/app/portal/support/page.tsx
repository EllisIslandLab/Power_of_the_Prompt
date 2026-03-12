"use client"

export const dynamic = 'force-dynamic'

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import {
  HelpCircle,
  Search,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  FileText,
  MessageCircle
} from "lucide-react"
import RevisionStartForm from "@/components/portal/forms/RevisionStartForm"
import RevisionModifierForm from "@/components/portal/forms/RevisionModifierForm"
import VideoConferenceForm from "@/components/portal/forms/VideoConferenceForm"

interface FAQ {
  id: string
  question: string
  answer: string
  category: string
  helpful: number
}

type MainTab = 'faq' | 'contact' | 'tickets'
type ContactTab = 'revision-start' | 'revision-modifier' | 'video-conference'

export default function SupportPage() {
  const { user, loading } = useAuth()
  const [selectedMainTab, setSelectedMainTab] = useState<MainTab>('faq')
  const [selectedContactTab, setSelectedContactTab] = useState<ContactTab>('revision-start')
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null)
  const [userSubmissions, setUserSubmissions] = useState<any[]>([])
  const [loadingSubmissions, setLoadingSubmissions] = useState(false)
  const [mounted, setMounted] = useState(false)

  const faqs: FAQ[] = [
    {
      id: '1',
      question: 'How do I submit a website revision request?',
      answer: 'Navigate to the "Contact Support" tab and select either "Revision Start Round" or "Revision Modifier Round" depending on whether this is your first round of revisions or you\'re modifying previous requests. Fill out the form with detailed instructions about what you\'d like changed.',
      category: 'GENERAL',
      helpful: 45
    },
    {
      id: '2',
      question: 'What types of changes are included in a revision round?',
      answer: 'Revision rounds include minor changes such as text updates, image replacements, color/font adjustments, layout refinements, and visibility changes. Major features like new forms, database integrations, or custom functionality are billed separately at $250 per feature.',
      category: 'GENERAL',
      helpful: 52
    },
    {
      id: '3',
      question: 'How long does it take to process a revision request?',
      answer: 'Revision services are usually completed within 5 business days. You\'ll receive updates via email and can track the status in the "My Tickets" tab.',
      category: 'GENERAL',
      helpful: 38
    },
    {
      id: '4',
      question: 'Can I request a video conference to discuss my website?',
      answer: 'Yes! Use the "Video Conference Request" form under Contact Support. You can specify 1-2 topics you\'d like to discuss, and we\'ll send you a calendar invite with available time slots.',
      category: 'GENERAL',
      helpful: 29
    }
  ]

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (selectedMainTab === 'tickets') {
      fetchUserSubmissions()
    }
  }, [selectedMainTab])

  const fetchUserSubmissions = async () => {
    setLoadingSubmissions(true)
    try {
      const response = await fetch('/api/portal/form-submissions')
      const data = await response.json()
      if (data.success) {
        setUserSubmissions(data.submissions || [])
      }
    } catch (error) {
      console.error('Failed to fetch submissions:', error)
    } finally {
      setLoadingSubmissions(false)
    }
  }

  const filteredFAQs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <Badge variant="outline" className="text-blue-600 border-blue-200">New</Badge>
      case 'reviewed':
        return <Badge variant="outline" className="text-purple-600 border-purple-200">Reviewed</Badge>
      case 'in-progress':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-200">In Progress</Badge>
      case 'completed':
        return <Badge variant="outline" className="text-green-600 border-green-200">Completed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getFormTypeLabel = (formType: string) => {
    switch (formType) {
      case 'revision-start':
        return 'Revision Start'
      case 'revision-modifier':
        return 'Revision Modifier'
      case 'video-conference':
        return 'Video Conference'
      default:
        return formType
    }
  }

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 p-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <HelpCircle className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">Support Center</h1>
            </div>
            <Button variant="outline" asChild>
              <Link href="/portal">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Portal
              </Link>
            </Button>
          </div>
          <p className="text-muted-foreground">
            Submit revision requests, schedule video conferences, and track your support tickets
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedMainTab('faq')}>
            <CardContent className="p-6 text-center">
              <Search className="h-8 w-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Search FAQ</h3>
              <p className="text-sm text-muted-foreground">
                Find answers to common questions
              </p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedMainTab('contact')}>
            <CardContent className="p-6 text-center">
              <MessageCircle className="h-8 w-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Submit Request</h3>
              <p className="text-sm text-muted-foreground">
                Submit revision or meeting request
              </p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedMainTab('tickets')}>
            <CardContent className="p-6 text-center">
              <FileText className="h-8 w-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-2">My Tickets</h3>
              <p className="text-sm text-muted-foreground">
                Track your submission status
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Tab Navigation */}
        <div className="flex gap-4 mb-6">
          <Button
            variant={selectedMainTab === 'faq' ? 'default' : 'outline'}
            onClick={() => setSelectedMainTab('faq')}
          >
            <Search className="h-4 w-4 mr-2" />
            Search FAQ
          </Button>
          <Button
            variant={selectedMainTab === 'contact' ? 'default' : 'outline'}
            onClick={() => setSelectedMainTab('contact')}
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            Contact Support
          </Button>
          <Button
            variant={selectedMainTab === 'tickets' ? 'default' : 'outline'}
            onClick={() => setSelectedMainTab('tickets')}
          >
            <FileText className="h-4 w-4 mr-2" />
            My Tickets
            {userSubmissions.length > 0 && (
              <Badge className="ml-2" variant="secondary">{userSubmissions.length}</Badge>
            )}
          </Button>
        </div>

        {/* FAQ Tab */}
        {selectedMainTab === 'faq' && (
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search frequently asked questions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              {filteredFAQs.map((faq) => (
                <Card key={faq.id}>
                  <CardContent className="p-0">
                    <button
                      onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                      className="w-full p-6 text-left flex items-center justify-between hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <h3 className="font-medium text-lg mb-1">{faq.question}</h3>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {faq.category}
                          </Badge>
                        </div>
                      </div>
                      {expandedFAQ === faq.id ? (
                        <ChevronUp className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      )}
                    </button>

                    {expandedFAQ === faq.id && (
                      <div className="px-6 pb-6 border-t">
                        <p className="text-muted-foreground leading-relaxed mt-4">
                          {faq.answer}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Contact Support Tab */}
        {selectedMainTab === 'contact' && (
          <div className="space-y-6">
            {/* Contact Sub-Tabs */}
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={selectedContactTab === 'revision-start' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedContactTab('revision-start')}
              >
                Revision Start Round
              </Button>
              <Button
                variant={selectedContactTab === 'revision-modifier' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedContactTab('revision-modifier')}
              >
                Revision Modifier Round
              </Button>
              <Button
                variant={selectedContactTab === 'video-conference' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedContactTab('video-conference')}
              >
                Video Conference Request
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>
                  {selectedContactTab === 'revision-start' && 'Website Revision - Revision Start Round'}
                  {selectedContactTab === 'revision-modifier' && 'Website Revision - Revision Modifier Round'}
                  {selectedContactTab === 'video-conference' && 'Video Conference Request'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedContactTab === 'revision-start' && (
                  <RevisionStartForm
                    userEmail={user?.email || ''}
                    userName={user?.adminProfile?.full_name || user?.studentProfile?.full_name || ''}
                    onSuccess={() => {
                      setSelectedMainTab('tickets')
                      fetchUserSubmissions()
                    }}
                  />
                )}
                {selectedContactTab === 'revision-modifier' && (
                  <RevisionModifierForm
                    userEmail={user?.email || ''}
                    userName={user?.adminProfile?.full_name || user?.studentProfile?.full_name || ''}
                    onSuccess={() => {
                      setSelectedMainTab('tickets')
                      fetchUserSubmissions()
                    }}
                  />
                )}
                {selectedContactTab === 'video-conference' && (
                  <VideoConferenceForm
                    userEmail={user?.email || ''}
                    userName={user?.adminProfile?.full_name || user?.studentProfile?.full_name || ''}
                    onSuccess={() => {
                      setSelectedMainTab('tickets')
                      fetchUserSubmissions()
                    }}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* My Tickets Tab */}
        {selectedMainTab === 'tickets' && (
          <div className="space-y-4">
            {loadingSubmissions ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">Loading your submissions...</p>
                </CardContent>
              </Card>
            ) : userSubmissions.length > 0 ? (
              userSubmissions.map((submission) => (
                <Card key={submission.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{getFormTypeLabel(submission.form_type)}</h3>
                          {getStatusBadge(submission.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Submitted: {new Date(submission.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {submission.form_type !== 'video-conference' && (
                      <div className="mt-4">
                        <p className="text-sm font-medium mb-1">Instructions:</p>
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {submission.detailed_instructions}
                        </p>
                      </div>
                    )}

                    {submission.form_type === 'video-conference' && submission.selected_items && Array.isArray(submission.selected_items) && (
                      <div className="mt-4">
                        <p className="text-sm font-medium mb-2">Topics ({submission.selected_items.length}):</p>
                        {submission.selected_items.map((topic: any, index: number) => (
                          <p key={index} className="text-sm text-muted-foreground">
                            {index + 1}. {topic.name || `Topic ${index + 1}`}
                          </p>
                        ))}
                        <p className="text-xs text-muted-foreground mt-2">💰 $200 for 40-minute session</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No submissions yet</h3>
                  <p className="text-muted-foreground mb-4">
                    You haven't submitted any requests yet.
                  </p>
                  <Button onClick={() => setSelectedMainTab('contact')}>
                    Submit Your First Request
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}

      </div>
    </div>
  )
}
