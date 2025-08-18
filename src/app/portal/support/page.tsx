"use client"

export const dynamic = 'force-dynamic'

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { 
  HelpCircle, 
  MessageCircle, 
  Calendar, 
  Search,
  ChevronDown,
  ChevronUp,
  Clock,
  CheckCircle,
  AlertCircle
} from "lucide-react"

interface FAQ {
  id: string
  question: string
  answer: string
  category: string
  helpful: number
}

interface SupportTicket {
  id: string
  subject: string
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED'
  priority: 'LOW' | 'MEDIUM' | 'HIGH'
  createdAt: Date
  lastUpdate: Date
}

export default function SupportPage() {
  if (typeof window === 'undefined') {
    return null
  }
  
  const [isClient, setIsClient] = useState(false)
  const { data: session, status } = useSession()
  const [selectedTab, setSelectedTab] = useState<'faq' | 'contact' | 'tickets'>('faq')
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null)
  const [supportForm, setSupportForm] = useState({
    subject: '',
    category: 'TECHNICAL',
    priority: 'MEDIUM',
    message: ''
  })

  const faqs: FAQ[] = [
    {
      id: '1',
      question: 'How do I access the student textbook?',
      answer: 'You can access the textbook from your portal dashboard by clicking the "📚 Student Textbook" button, or by navigating directly to /portal/textbook. The textbook contains 8 comprehensive chapters covering everything from setup to long-term success.',
      category: 'GENERAL',
      helpful: 45
    },
    {
      id: '2',
      question: 'I\'m getting errors when trying to deploy to Vercel. What should I check?',
      answer: 'Common deployment issues include: 1) Environment variables not set in Vercel dashboard, 2) Build errors due to TypeScript or ESLint issues, 3) Missing dependencies in package.json. Check the Vercel deployment logs for specific error messages and refer to Chapter 5 of the textbook for detailed deployment instructions.',
      category: 'TECHNICAL',
      helpful: 38
    },
    {
      id: '3',
      question: 'How do I connect my Airtable database to my Next.js app?',
      answer: 'Follow these steps: 1) Get your Airtable API key and Base ID, 2) Add them to your .env.local file, 3) Set the same environment variables in Vercel, 4) Use the Airtable API to fetch/post data. Detailed instructions are in Chapter 3 of the textbook.',
      category: 'TECHNICAL',
      helpful: 52
    },
    {
      id: '4',
      question: 'Can I get one-on-one help with my project?',
      answer: 'Yes! You can schedule one-on-one sessions during office hours. Check the Collaboration Hub in your portal to see available times and book a session. You can also ask questions in the student chat for immediate help from peers and instructors.',
      category: 'GENERAL',
      helpful: 29
    },
    {
      id: '5',
      question: 'What if I get stuck on a specific chapter in the textbook?',
      answer: 'If you\'re stuck: 1) Use the student chat to ask specific questions, 2) Schedule office hours for detailed help, 3) Check the Resources section for additional guides and templates, 4) Submit a support ticket for complex issues that need detailed assistance.',
      category: 'GENERAL',
      helpful: 41
    },
    {
      id: '6',
      question: 'How do I set up my development environment correctly?',
      answer: 'Chapter 1 of the textbook covers complete environment setup including WSL, VS Code, Node.js, Git, and Claude CLI. Make sure to follow each step in order. If you encounter issues, the most common problems are Windows/WSL permissions and Node.js version compatibility.',
      category: 'TECHNICAL',
      helpful: 33
    },
    {
      id: '7',
      question: 'Can I use a different hosting service instead of Vercel?',
      answer: 'While the textbook focuses on Vercel for its excellent Next.js integration, you can use other platforms like Netlify, Railway, or traditional hosting. However, you may need to adjust the deployment instructions and some features may work differently.',
      category: 'TECHNICAL',
      helpful: 18
    },
    {
      id: '8',
      question: 'How often is the textbook updated?',
      answer: 'The textbook is updated regularly to reflect the latest best practices and technology updates. You\'ll receive notifications in the portal when new content is available. All updates are automatically available to current students.',
      category: 'GENERAL',
      helpful: 25
    }
  ]

  const supportTickets: SupportTicket[] = [
    {
      id: 'TICK-001',
      subject: 'Deployment failing with environment variable error',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
      lastUpdate: new Date(Date.now() - 1000 * 60 * 30)
    },
    {
      id: 'TICK-002',
      subject: 'Question about custom domain setup',
      status: 'RESOLVED',
      priority: 'MEDIUM',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
      lastUpdate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2)
    }
  ]

  const filteredFAQs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OPEN':
        return <Badge variant="outline" className="text-blue-600 border-blue-200">Open</Badge>
      case 'IN_PROGRESS':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-200">In Progress</Badge>
      case 'RESOLVED':
        return <Badge variant="outline" className="text-green-600 border-green-200">Resolved</Badge>
      default:
        return null
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return <Badge variant="destructive">High</Badge>
      case 'MEDIUM':
        return <Badge variant="outline">Medium</Badge>
      case 'LOW':
        return <Badge variant="secondary">Low</Badge>
      default:
        return null
    }
  }

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault()
    // In production, this would submit to your backend
    console.log('Support ticket submitted:', supportForm)
    // Reset form
    setSupportForm({
      subject: '',
      category: 'TECHNICAL',
      priority: 'MEDIUM',
      message: ''
    })
    // Show success message
    alert('Support ticket submitted successfully! We\'ll get back to you soon.')
  }

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient || status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 p-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <HelpCircle className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Support Center</h1>
          </div>
          <p className="text-muted-foreground">
            Get help with your web development journey - we&apos;re here to support your success
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedTab('faq')}>
            <CardContent className="p-6 text-center">
              <Search className="h-8 w-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Search FAQ</h3>
              <p className="text-sm text-muted-foreground">
                Find answers to common questions
              </p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedTab('contact')}>
            <CardContent className="p-6 text-center">
              <MessageCircle className="h-8 w-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Contact Support</h3>
              <p className="text-sm text-muted-foreground">
                Submit a detailed support request
              </p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center">
              <Calendar className="h-8 w-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Book Office Hours</h3>
              <p className="text-sm text-muted-foreground">
                Schedule one-on-one help session
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-6">
          <Button
            variant={selectedTab === 'faq' ? 'default' : 'outline'}
            onClick={() => setSelectedTab('faq')}
          >
            FAQ
          </Button>
          <Button
            variant={selectedTab === 'contact' ? 'default' : 'outline'}
            onClick={() => setSelectedTab('contact')}
          >
            Contact Support
          </Button>
          <Button
            variant={selectedTab === 'tickets' ? 'default' : 'outline'}
            onClick={() => setSelectedTab('tickets')}
          >
            My Tickets
          </Button>
        </div>

        {/* FAQ Tab */}
        {selectedTab === 'faq' && (
          <div className="space-y-6">
            {/* FAQ Search */}
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

            {/* FAQ List */}
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
                          <span className="text-xs text-muted-foreground">
                            {faq.helpful} people found this helpful
                          </span>
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
                        <div className="flex items-center gap-4 mt-4">
                          <span className="text-sm text-muted-foreground">Was this helpful?</span>
                          <Button variant="outline" size="sm">
                            👍 Yes
                          </Button>
                          <Button variant="outline" size="sm">
                            👎 No
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Contact Support Tab */}
        {selectedTab === 'contact' && (
          <Card>
            <CardHeader>
              <CardTitle>Submit Support Request</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitTicket} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="subject">Subject *</Label>
                    <Input
                      id="subject"
                      value={supportForm.subject}
                      onChange={(e) => setSupportForm({...supportForm, subject: e.target.value})}
                      placeholder="Brief description of your issue"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <select
                      id="category"
                      value={supportForm.category}
                      onChange={(e) => setSupportForm({...supportForm, category: e.target.value})}
                      className="w-full px-3 py-2 border border-input bg-background rounded-md"
                    >
                      <option value="TECHNICAL">Technical Issue</option>
                      <option value="ACCOUNT">Account & Billing</option>
                      <option value="CONTENT">Textbook & Content</option>
                      <option value="GENERAL">General Question</option>
                    </select>
                  </div>
                  
                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <select
                      id="priority"
                      value={supportForm.priority}
                      onChange={(e) => setSupportForm({...supportForm, priority: e.target.value})}
                      className="w-full px-3 py-2 border border-input bg-background rounded-md"
                    >
                      <option value="LOW">Low - General question</option>
                      <option value="MEDIUM">Medium - Need help but not urgent</option>
                      <option value="HIGH">High - Blocking my progress</option>
                    </select>
                  </div>
                  
                  <div>
                    <Label>Your Information</Label>
                    <div className="p-3 bg-muted/50 rounded-md text-sm">
                      <p><strong>Name:</strong> {session?.user?.name || 'Not available'}</p>
                      <p><strong>Email:</strong> {session?.user?.email || 'Not available'}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="message">Detailed Description *</Label>
                  <Textarea
                    id="message"
                    value={supportForm.message}
                    onChange={(e) => setSupportForm({...supportForm, message: e.target.value})}
                    placeholder="Please provide as much detail as possible about your issue, including any error messages, steps you've tried, and what you expected to happen."
                    rows={6}
                    required
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    We typically respond within 24 hours during business days.
                  </p>
                  <Button type="submit">
                    Submit Request
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Support Tickets Tab */}
        {selectedTab === 'tickets' && (
          <div className="space-y-4">
            {supportTickets.length > 0 ? (
              supportTickets.map((ticket) => (
                <Card key={ticket.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg mb-2">{ticket.subject}</h3>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-muted-foreground">#{ticket.id}</span>
                          {getStatusBadge(ticket.status)}
                          {getPriorityBadge(ticket.priority)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid sm:grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>Created: {ticket.createdAt.toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-muted-foreground" />
                        <span>Last update: {ticket.lastUpdate.toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No support tickets</h3>
                  <p className="text-muted-foreground mb-4">
                    You haven&apos;t submitted any support requests yet.
                  </p>
                  <Button onClick={() => setSelectedTab('contact')}>
                    Submit First Request
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Additional Help Resources */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Other Ways to Get Help</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 text-primary" />
                  Student Chat
                </h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Get real-time help from fellow students and instructors in our chat rooms.
                </p>
                <Button variant="outline" size="sm" asChild>
                  <a href="/portal/chat">Join Chat</a>
                </Button>
              </div>
              
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  Office Hours
                </h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Schedule one-on-one time with an instructor for detailed help.
                </p>
                <Button variant="outline" size="sm" asChild>
                  <a href="/portal/collaboration">Book Session</a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}