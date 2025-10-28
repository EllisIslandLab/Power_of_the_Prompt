"use client"

import { useState, useEffect } from "react"
import { cleanupModalArtifacts } from "@/lib/modal-cleanup"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
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

interface Campaign {
  id: string
  subject: string
  content: string
  status: 'draft' | 'sending' | 'sent' | 'failed'
  target_audience: any
  scheduled_at?: string
}

interface CampaignComposerProps {
  onClose: () => void
  onSuccess: () => void
  editCampaign?: Campaign | null
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

export function CampaignComposer({ onClose, onSuccess, editCampaign }: CampaignComposerProps) {
  const isEditMode = !!editCampaign
  // When editing, start at step 3 (Content) so you can directly edit text
  const [currentStep, setCurrentStep] = useState(isEditMode ? 3 : 1)
  const [loading, setLoading] = useState(false)
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [recipientCount, setRecipientCount] = useState(0)
  const [testEmail, setTestEmail] = useState("")
  const [showPreview, setShowPreview] = useState(false)
  const [availableLeads, setAvailableLeads] = useState<any[]>([])
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([])
  const [stripeProducts, setStripeProducts] = useState<any[]>([])
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null)

  const [campaignData, setCampaignData] = useState({
    subject: editCampaign?.subject || "",
    content: editCampaign?.content || "",
    targetAudience: editCampaign?.target_audience || {
      source: "all",
      tags: [],
      dateRange: null,
      manualRecipients: [] as string[]
    },
    useTemplate: false,
    selectedTemplate: null as EmailTemplate | null,
    selectedCourse: null as any
  })

  useEffect(() => {
    fetchTemplates()
    fetchStripeProducts()

    // Cleanup function to remove modal artifacts when component unmounts
    return () => {
      cleanupModalArtifacts()
    }
  }, [])

  useEffect(() => {
    fetchRecipientCount()
  }, [campaignData.targetAudience, selectedRecipients])

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

  const fetchStripeProducts = async () => {
    try {
      const response = await fetch('/api/admin/stripe-products')
      const data = await response.json()
      if (data.success) {
        setStripeProducts(data.products)
      }
    } catch (error) {
      console.error('Failed to fetch Stripe products:', error)
    }
  }

  const fetchRecipientCount = async () => {
    try {
      // If manual entry, use selected recipients count
      if (campaignData.targetAudience.source === 'manual') {
        setRecipientCount(selectedRecipients.length)
        // Fetch all leads for manual selection
        const response = await fetch('/api/admin/leads')
        const data = await response.json()
        if (data.success) {
          setAvailableLeads(data.leads || [])
        }
        return
      }

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

  const toggleRecipient = (email: string) => {
    setSelectedRecipients(prev => {
      if (prev.includes(email)) {
        return prev.filter(e => e !== email)
      } else {
        return [...prev, email]
      }
    })
  }

  const selectAllLeads = () => {
    setSelectedRecipients(availableLeads.map(lead => lead.email))
  }

  const deselectAllLeads = () => {
    setSelectedRecipients([])
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

      // Include manual recipients and selected course if applicable
      const targetAudience = {
        ...campaignData.targetAudience,
        manualRecipients: campaignData.targetAudience.source === 'manual' ? selectedRecipients : [],
        selectedCourse: selectedProduct || null
      }

      const url = '/api/admin/campaigns'
      const method = isEditMode ? 'PUT' : 'POST'
      const body = isEditMode
        ? {
            id: editCampaign!.id,
            subject: campaignData.subject,
            content: campaignData.content,
            targetAudience: targetAudience
          }
        : {
            subject: campaignData.subject,
            content: campaignData.content,
            targetAudience: targetAudience,
            createdBy: 'admin'
          }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      })

      const data = await response.json()
      if (data.success) {
        onSuccess()
      } else {
        alert(`Failed to ${isEditMode ? 'update' : 'save'} campaign: ` + data.error)
      }
    } catch (error) {
      alert(`Failed to ${isEditMode ? 'update' : 'save'} campaign`)
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

      // Include manual recipients and selected course if applicable
      const targetAudience = {
        ...campaignData.targetAudience,
        manualRecipients: campaignData.targetAudience.source === 'manual' ? selectedRecipients : [],
        selectedCourse: selectedProduct || null
      }

      // First save as draft
      const saveResponse = await fetch('/api/admin/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          subject: campaignData.subject,
          content: campaignData.content,
          targetAudience: targetAudience,
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
    <Dialog open={true} onOpenChange={(open) => {
      if (!open) {
        onClose()
      }
    }}>
      <DialogContent className="max-w-5xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              {isEditMode ? 'Edit Campaign' : 'Create New Campaign'}
            </div>
            {/* Compact Progress Steps */}
            <div className="flex items-center gap-2">
              {[
                { step: 1, title: "Template", icon: FileText },
                { step: 2, title: "Content", icon: Mail },
                { step: 3, title: "Audience", icon: Users },
                { step: 4, title: "Review", icon: Eye }
              ].map(({ step, title, icon: Icon }) => (
                <div key={step} className="flex items-center gap-1">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
                    step === currentStep ? 'bg-primary text-primary-foreground' :
                    step < currentStep ? 'bg-green-500 text-white' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <span className={`text-xs hidden sm:inline ${
                    step === currentStep ? 'font-semibold' : 'text-muted-foreground'
                  }`}>
                    {title}
                  </span>
                  {step < 4 && <div className="w-6 h-px bg-border hidden sm:block" />}
                </div>
              ))}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 pr-2">

          {/* Step 1: Template Selection */}
          {currentStep === 1 && (
            <div className="space-y-3">
              <div className="grid md:grid-cols-2 gap-3">
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
            <div className="space-y-3">
              <div className="space-y-3">
                {/* Course/Product Selector */}
                {stripeProducts.length > 0 && (
                  <div className="space-y-2">
                    <Select
                      value={selectedProduct?.id || ''}
                      onValueChange={(value) => {
                        const product = stripeProducts.find(p => p.id === value)
                        setSelectedProduct(product || null)
                        setCampaignData(prev => ({ ...prev, selectedCourse: product || null }))
                      }}
                    >
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="📚 Select Course/Product (optional)..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No course selected</SelectItem>
                        {stripeProducts.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name}
                            {product.prices?.monthly && ` - ${product.prices.monthly.formatted}/mo`}
                            {product.prices?.oneTime && ` (or ${product.prices.oneTime.formatted} one-time)`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedProduct && (
                      <Card className="bg-blue-50 border-blue-200">
                        <CardContent className="p-2 text-xs">
                          <p className="font-semibold text-blue-900 mb-1">Available variables:</p>
                          <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-blue-800">
                            <div><code className="bg-white px-1 text-xs">{`{{course_name}}`}</code></div>
                            <div><code className="bg-white px-1 text-xs">{`{{course_url}}`}</code></div>
                            {selectedProduct.prices?.monthly && (
                              <div><code className="bg-white px-1 text-xs">{`{{course_price_monthly}}`}</code></div>
                            )}
                            {selectedProduct.prices?.oneTime && (
                              <div><code className="bg-white px-1 text-xs">{`{{course_price_onetime}}`}</code></div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}

                <Input
                  value={campaignData.subject}
                  onChange={(e) => setCampaignData(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="✉️ Email Subject Line..."
                  className="h-10"
                />

                <div className="space-y-1">
                  <Textarea
                    value={campaignData.content}
                    onChange={(e) => setCampaignData(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Write your email content here...&#10;&#10;💡 Available variables: {{name}}, {{first_name}}, {{last_name}}, {{unsubscribe_url}}"
                    rows={12}
                    className="font-mono text-sm resize-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    Variables: {`{{name}}`}, {`{{first_name}}`}, {`{{last_name}}`}{selectedProduct && ', course vars'}, {`{{unsubscribe_url}}`}
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
            <div className="space-y-3">
              <Select
                value={campaignData.targetAudience.source}
                onValueChange={(value) => setCampaignData(prev => ({
                  ...prev,
                  targetAudience: { ...prev.targetAudience, source: value }
                }))}
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="🎯 Select Lead Source..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Leads</SelectItem>
                  <SelectItem value="website_analyzer">Website Analyzer</SelectItem>
                  <SelectItem value="consultation">Consultation</SelectItem>
                  <SelectItem value="manual">Manual Entry</SelectItem>
                </SelectContent>
              </Select>

              {/* Manual Recipient Selection */}
              {campaignData.targetAudience.source === 'manual' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Select Recipients ({selectedRecipients.length} selected)</span>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={selectAllLeads}
                        disabled={availableLeads.length === 0}
                        className="h-8 text-xs"
                      >
                        Select All
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={deselectAllLeads}
                        disabled={selectedRecipients.length === 0}
                        className="h-8 text-xs"
                      >
                        Clear
                      </Button>
                    </div>
                  </div>

                  <Card className="max-h-48 overflow-y-auto">
                    <CardContent className="p-3 space-y-2">
                      {availableLeads.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No leads available. Add some leads first.
                        </p>
                      ) : (
                        availableLeads.map((lead) => (
                          <div
                            key={lead.id}
                            className="flex items-center space-x-3 p-2 rounded hover:bg-muted/50"
                          >
                            <Checkbox
                              id={`lead-${lead.id}`}
                              checked={selectedRecipients.includes(lead.email)}
                              onCheckedChange={() => toggleRecipient(lead.email)}
                            />
                            <label
                              htmlFor={`lead-${lead.id}`}
                              className="flex-1 text-sm cursor-pointer"
                            >
                              <div className="font-medium">{lead.name}</div>
                              <div className="text-muted-foreground text-xs">{lead.email}</div>
                              {lead.source && (
                                <Badge variant="outline" className="mt-1 text-xs">
                                  {lead.source}
                                </Badge>
                              )}
                            </label>
                          </div>
                        ))
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}

              <Card>
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <Users className="h-7 w-7 text-primary" />
                    <div>
                      <div className="text-2xl font-bold">{recipientCount.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">
                        {campaignData.targetAudience.source === 'manual'
                          ? 'Manually selected recipients'
                          : `Recipients (${getAudienceDescription()})`}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

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
            <div className="space-y-3">
              <div className="grid md:grid-cols-2 gap-3">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold">📋 Campaign Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Subject:</span> {campaignData.subject}
                    </div>
                    <div>
                      <span className="font-medium">Recipients:</span> {recipientCount.toLocaleString()} leads
                    </div>
                    <div>
                      <span className="font-medium">Audience:</span> {getAudienceDescription()}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold">✉️ Test Email</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Input
                      type="email"
                      value={testEmail}
                      onChange={(e) => setTestEmail(e.target.value)}
                      placeholder="your@email.com to send test"
                      className="h-9"
                    />
                    <Button
                      onClick={handleSendTest}
                      disabled={loading || !testEmail}
                      variant="outline"
                      size="sm"
                      className="w-full h-9"
                    >
                      <TestTube className="h-3.5 w-3.5 mr-2" />
                      Send Test
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
                    {loading
                      ? (isEditMode ? 'Updating...' : 'Creating...')
                      : (isEditMode ? 'Update Campaign' : 'Create Campaign')
                    }
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
                    className="text-sm border rounded p-4 bg-white text-gray-900 max-h-96 overflow-y-auto"
                    dangerouslySetInnerHTML={{
                      __html: (() => {
                        let content = campaignData.content

                        // Replace variables with preview data
                        const previewVars: Record<string, string> = {
                          name: 'John Doe',
                          first_name: 'John',
                          last_name: 'Doe',
                          unsubscribe_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://weblaunchacademy.com'}/unsubscribe?email=preview@example.com`,
                        }

                        // Add course variables if selected
                        if (selectedProduct) {
                          previewVars.course_name = selectedProduct.name
                          previewVars.course_description = selectedProduct.description || 'Learn to build professional websites'
                          previewVars.course_url = selectedProduct.url || `${process.env.NEXT_PUBLIC_SITE_URL || 'https://weblaunchacademy.com'}/pricing`
                          previewVars.course_price = selectedProduct.price?.formatted || 'Contact for pricing'
                          previewVars.course_price_monthly = selectedProduct.prices?.monthly?.formatted || ''
                          previewVars.course_price_onetime = selectedProduct.prices?.oneTime?.formatted || ''
                        }

                        // Replace all variables
                        Object.entries(previewVars).forEach(([key, value]) => {
                          const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g')
                          content = content.replace(regex, value)
                        })

                        // Convert newlines to br only if content doesn't already have HTML
                        if (!content.includes('<div') && !content.includes('<p')) {
                          content = content.replace(/\n/g, '<br>')
                        }

                        return content
                      })()
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