"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Mail, Users, Send, CheckCircle, XCircle, Loader2 } from "lucide-react"

interface EmailTemplate {
  id: string
  name: string
  description: string
  subject_template: string
  content_template: string
  category: string
}

interface SendResult {
  total: number
  sent: number
  failed: number
  errors: string[]
}

export default function AdminEmailsPage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("")
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null)
  const [leadCount, setLeadCount] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [sendResult, setSendResult] = useState<SendResult | null>(null)

  useEffect(() => {
    fetchTemplates()
    fetchLeadCount()
  }, [])

  useEffect(() => {
    if (selectedTemplateId) {
      const template = templates.find(t => t.id === selectedTemplateId)
      setSelectedTemplate(template || null)
    } else {
      setSelectedTemplate(null)
    }
  }, [selectedTemplateId, templates])

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/admin/email-templates')
      const data = await response.json()
      if (data.templates) {
        setTemplates(data.templates)
      }
    } catch (error) {
      console.error('Failed to fetch templates:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchLeadCount = async () => {
    try {
      const response = await fetch('/api/admin/leads')
      const data = await response.json()
      if (data.leads) {
        // Filter out barnabas.financial.coach.1@gmail.com
        const filteredLeads = data.leads.filter(
          (lead: any) => lead.email !== 'barnabas.financial.coach.1@gmail.com'
        )
        setLeadCount(filteredLeads.length)
      }
    } catch (error) {
      console.error('Failed to fetch lead count:', error)
    }
  }

  const handleSendCampaign = async () => {
    if (!selectedTemplateId) return

    setSending(true)
    setSendResult(null)
    setShowConfirmDialog(false)

    try {
      const response = await fetch('/api/admin/send-campaign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId: selectedTemplateId })
      })

      const data = await response.json()

      if (data.success) {
        setSendResult(data.results)
      } else {
        alert(`Failed to send campaign: ${data.error}`)
      }
    } catch (error) {
      console.error('Failed to send campaign:', error)
      alert('Failed to send campaign. Please try again.')
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Email Campaign Manager</h1>
        <p className="text-gray-600">Send batch emails to your leads</p>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leadCount}</div>
            <p className="text-xs text-muted-foreground">
              Will receive this email
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Email Templates</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{templates.length}</div>
            <p className="text-xs text-muted-foreground">
              Available templates
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            {sending ? (
              <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
            ) : (
              <CheckCircle className="h-4 w-4 text-green-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sending ? 'Sending...' : 'Ready'}
            </div>
            <p className="text-xs text-muted-foreground">
              Campaign status
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Template Selection */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Select Email Template</CardTitle>
          <CardDescription>
            Choose a template to send to your leads
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a template" />
            </SelectTrigger>
            <SelectContent>
              {templates.map((template) => (
                <SelectItem key={template.id} value={template.id}>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span>{template.name}</span>
                    <Badge variant="secondary" className="ml-2">
                      {template.category}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Template Preview */}
      {selectedTemplate && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Email Preview</CardTitle>
            <CardDescription>{selectedTemplate.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Subject:</label>
              <p className="text-lg mt-1">{selectedTemplate.subject_template}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Content:</label>
              <div
                className="mt-2 p-4 border rounded-lg bg-gray-50"
                dangerouslySetInnerHTML={{ __html: selectedTemplate.content_template }}
              />
            </div>
            <div className="pt-4">
              <Button
                onClick={() => setShowConfirmDialog(true)}
                disabled={sending || leadCount === 0}
                className="w-full"
                size="lg"
              >
                {sending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending to {leadCount} leads...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Campaign to {leadCount} Leads
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Send Results */}
      {sendResult && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Campaign Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-2xl font-bold">{sendResult.total}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Sent</p>
                  <p className="text-2xl font-bold text-green-600">{sendResult.sent}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-600" />
                <div>
                  <p className="text-sm text-gray-600">Failed</p>
                  <p className="text-2xl font-bold text-red-600">{sendResult.failed}</p>
                </div>
              </div>
            </div>

            {sendResult.errors.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium text-red-600 mb-2">Errors:</h4>
                <div className="bg-red-50 border border-red-200 rounded p-3 max-h-48 overflow-y-auto">
                  {sendResult.errors.map((error, index) => (
                    <p key={index} className="text-sm text-red-800">{error}</p>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Email Campaign</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to send this email to <strong>{leadCount} leads</strong>?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSendCampaign}>
              Send Campaign
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
