"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Send,
  Eye,
  Users,
  Mail,
  Calendar,
  FileText,
  TestTube,
  X,
  Sparkles,
  Target
} from "lucide-react"

interface CampaignComposerProps {
  onClose: () => void
  onSuccess: () => void
}

interface EmailTemplate {
  id: string
  name: string
  description: string
  category: string
  subject_template: string
  content_template: string
  variables: string[]
}

export function CampaignComposer({ onClose, onSuccess }: CampaignComposerProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [recipientCount, setRecipientCount] = useState(0)
  const [testEmail, setTestEmail] = useState("")
  const [showPreview, setShowPreview] = useState(false)

  const [campaignData, setCampaignData] = useState({
    subject: "",
    content: "",
    targetAudience: {
      source: "all",
      tags: [],
      dateRange: null
    },
    useTemplate: false,
    selectedTemplate: null as EmailTemplate | null
  })

  useEffect(() => {
    fetchTemplates()
    fetchRecipientCount()
  }, [campaignData.targetAudience])

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/admin/templates')
      const data = await response.json()
      if (data.success) {
        setTemplates(data.templates)
      }
    } catch (error) {
      console.error('Failed to fetch templates:', error)
    }
  }

  const fetchRecipientCount = async () => {
    try {
      const params = new URLSearchParams()
      if (campaignData.targetAudience.source !== 'all') {
        params.append('source', campaignData.targetAudience.source)
      }

      const response = await fetch(`/api/admin/leads?${params}`)
      const data = await response.json()
      if (data.success) {
        setRecipientCount(data.count)
      }
    } catch (error) {
      console.error('Failed to fetch recipient count:', error)
    }
  }

  const handleTemplateSelect = (template: EmailTemplate) => {
    setCampaignData(prev => ({
      ...prev,
      subject: template.subject_template,
      content: template.content_template,
      selectedTemplate: template,
      useTemplate: true
    }))
  }

  const handleSaveDraft = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          subject: campaignData.subject,
          content: campaignData.content,
          targetAudience: campaignData.targetAudience,
          createdBy: 'admin'
        })
      })

      const data = await response.json()
      if (data.success) {
        onSuccess()
      } else {
        alert('Failed to save campaign: ' + data.error)
      }
    } catch (error) {
      alert('Failed to save campaign')
    } finally {
      setLoading(false)
    }
  }

  const handleSendTest = async () => {
    if (!testEmail) {
      alert('Please enter a test email address')
      return
    }

    try {
      setLoading(true)

      // First save as draft
      const saveResponse = await fetch('/api/admin/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          subject: campaignData.subject,
          content: campaignData.content,
          targetAudience: campaignData.targetAudience,
          createdBy: 'admin'
        })
      })

      const saveData = await saveResponse.json()
      if (!saveData.success) {
        alert('Failed to save campaign')
        return
      }

      // Then send test
      const testResponse = await fetch('/api/admin/campaigns/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          campaignId: saveData.campaign.id,
          testEmail
        })
      })

      const testData = await testResponse.json()
      if (testData.success) {
        alert(`Test email sent to ${testEmail}`)
      } else {
        alert('Failed to send test email: ' + testData.error)
      }
    } catch (error) {
      alert('Failed to send test email')
    } finally {
      setLoading(false)
    }
  }

  const getAudienceDescription = () => {
    if (campaignData.targetAudience.source === 'all') {
      return 'All active leads'
    } else if (campaignData.targetAudience.source === 'website_analyzer') {
      return 'Website analyzer leads'
    } else {
      return `${campaignData.targetAudience.source} leads`
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Create New Campaign
          </DialogTitle>
          <DialogDescription>
            Design and send targeted email campaigns to your leads
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Steps */}
          <div className="flex items-center gap-4">
            {[
              { step: 1, title: "Template", icon: FileText },
              { step: 2, title: "Content", icon: Mail },
              { step: 3, title: "Audience", icon: Users },
              { step: 4, title: "Review", icon: Eye }
            ].map(({ step, title, icon: Icon }) => (
              <div key={step} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step === currentStep ? 'bg-primary text-primary-foreground' :
                  step < currentStep ? 'bg-green-500 text-white' :
                  'bg-muted text-muted-foreground'
                }`}>
                  <Icon className="h-4 w-4" />
                </div>
                <span className={`text-sm ${
                  step === currentStep ? 'font-semibold' : 'text-muted-foreground'
                }`}>
                  {title}
                </span>
                {step < 4 && <div className="w-8 h-px bg-border" />}
              </div>
            ))}
          </div>

          {/* Step 1: Template Selection */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="h-5 w-5" />
                <h3 className="text-lg font-semibold">Choose Template</h3>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {/* Start from scratch option */}
                <Card
                  className={`cursor-pointer transition-colors ${
                    !campaignData.useTemplate ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                  }`}
                  onClick={() => setCampaignData(prev => ({
                    ...prev,
                    useTemplate: false,
                    selectedTemplate: null,
                    subject: "",
                    content: ""
                  }))}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Sparkles className="h-8 w-8 text-primary" />
                      <div>
                        <h4 className="font-semibold">Start from Scratch</h4>
                        <p className="text-sm text-muted-foreground">Create a custom email</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Template options */}
                {templates.map((template) => (
                  <Card
                    key={template.id}
                    className={`cursor-pointer transition-colors ${
                      campaignData.selectedTemplate?.id === template.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                    }`}
                    onClick={() => handleTemplateSelect(template)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold">{template.name}</h4>
                            <Badge variant="outline">{template.category}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{template.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex justify-end">
                <Button onClick={() => setCurrentStep(2)}>
                  Next: Content
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Content Creation */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Mail className="h-5 w-5" />
                <h3 className="text-lg font-semibold">Email Content</h3>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject Line</Label>
                  <Input
                    id="subject"
                    value={campaignData.subject}
                    onChange={(e) => setCampaignData(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="Enter your email subject..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Email Content</Label>
                  <Textarea
                    id="content"
                    value={campaignData.content}
                    onChange={(e) => setCampaignData(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Write your email content here..."
                    rows={15}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Use {`{{name}}`} for personalization and {`{{unsubscribe_url}}`} for unsubscribe link
                  </p>
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setCurrentStep(1)}>
                  Back
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setShowPreview(true)}>
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                  <Button onClick={() => setCurrentStep(3)}>
                    Next: Audience
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Audience Selection */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Target className="h-5 w-5" />
                <h3 className="text-lg font-semibold">Target Audience</h3>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Lead Source</Label>
                  <Select
                    value={campaignData.targetAudience.source}
                    onValueChange={(value) => setCampaignData(prev => ({
                      ...prev,
                      targetAudience: { ...prev.targetAudience, source: value }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Leads</SelectItem>
                      <SelectItem value="website_analyzer">Website Analyzer</SelectItem>
                      <SelectItem value="consultation">Consultation</SelectItem>
                      <SelectItem value="manual">Manual Entry</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <Users className="h-8 w-8 text-primary" />
                      <div>
                        <div className="text-2xl font-bold">{recipientCount.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">
                          Recipients ({getAudienceDescription()})
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setCurrentStep(2)}>
                  Back
                </Button>
                <Button onClick={() => setCurrentStep(4)}>
                  Next: Review
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Review & Send */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Eye className="h-5 w-5" />
                <h3 className="text-lg font-semibold">Review & Send</h3>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Campaign Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium">Subject</Label>
                      <p className="text-sm">{campaignData.subject}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Recipients</Label>
                      <p className="text-sm">{recipientCount.toLocaleString()} leads</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Audience</Label>
                      <p className="text-sm">{getAudienceDescription()}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Test Email</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="testEmail">Send test to:</Label>
                      <Input
                        id="testEmail"
                        type="email"
                        value={testEmail}
                        onChange={(e) => setTestEmail(e.target.value)}
                        placeholder="your@email.com"
                      />
                    </div>
                    <Button
                      onClick={handleSendTest}
                      disabled={loading || !testEmail}
                      variant="outline"
                      className="w-full"
                    >
                      <TestTube className="h-4 w-4 mr-2" />
                      Send Test Email
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setCurrentStep(3)}>
                  Back
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleSaveDraft} disabled={loading}>
                    Save as Draft
                  </Button>
                  <Button onClick={handleSaveDraft} disabled={loading}>
                    <Send className="h-4 w-4 mr-2" />
                    {loading ? 'Creating...' : 'Create Campaign'}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Preview Modal */}
        {showPreview && (
          <Dialog open={showPreview} onOpenChange={setShowPreview}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Email Preview</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label className="font-semibold">Subject:</Label>
                  <p className="text-sm border rounded p-2 bg-muted">{campaignData.subject}</p>
                </div>
                <div>
                  <Label className="font-semibold">Content:</Label>
                  <div
                    className="text-sm border rounded p-4 bg-white max-h-96 overflow-y-auto"
                    dangerouslySetInnerHTML={{
                      __html: campaignData.content.replace(/\n/g, '<br>')
                    }}
                  />
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </DialogContent>
    </Dialog>
  )
}