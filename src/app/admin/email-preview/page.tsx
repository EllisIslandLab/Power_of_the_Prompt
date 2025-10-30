'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Eye, RefreshCw, Mail } from 'lucide-react'
import Link from 'next/link'

interface EmailTemplate {
  id: string
  name: string
  category: string
  subject_template: string
  content_template: string
}

/**
 * Email Preview Tool (Admin)
 *
 * Preview email templates before sending
 * Protected by admin authentication
 */
export default function AdminEmailPreviewPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [selectedType, setSelectedType] = useState<'react' | 'database'>('react')
  const [emailHtml, setEmailHtml] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [dbTemplates, setDbTemplates] = useState<EmailTemplate[]>([])
  const [loadingTemplates, setLoadingTemplates] = useState(true)

  // React Email templates (transactional)
  const reactTemplates = [
    { value: 'welcome', label: 'Welcome Email (React)' },
    { value: 'payment', label: 'Payment Confirmation (React)' },
    { value: 'password-reset', label: 'Password Reset (React)' },
  ]

  // Fetch database templates on mount
  useEffect(() => {
    fetchDbTemplates()
  }, [])

  const fetchDbTemplates = async () => {
    setLoadingTemplates(true)
    try {
      const response = await fetch('/api/admin/templates')
      const data = await response.json()

      if (data.success && data.templates) {
        setDbTemplates(data.templates)
        // Set first template as default if no template selected
        if (!selectedTemplate && data.templates.length > 0) {
          setSelectedTemplate(data.templates[0].id)
          setSelectedType('database')
        } else if (!selectedTemplate && data.templates.length === 0) {
          setSelectedTemplate('welcome')
          setSelectedType('react')
        }
      }
    } catch (error) {
      console.error('Failed to fetch database templates:', error)
    } finally {
      setLoadingTemplates(false)
    }
  }

  const loadPreview = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/email-preview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          template: selectedTemplate,
          type: selectedType
        }),
      })

      const data = await response.json()
      if (data.html) {
        setEmailHtml(data.html)
      }
    } catch (error) {
      console.error('Failed to load email preview:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTemplateChange = (value: string) => {
    setSelectedTemplate(value)
    // Determine if it's a React or database template
    const isReactTemplate = reactTemplates.some(t => t.value === value)
    setSelectedType(isReactTemplate ? 'react' : 'database')
    // Clear current preview
    setEmailHtml('')
  }

  const getCurrentTemplate = () => {
    if (selectedType === 'react') {
      return reactTemplates.find(t => t.value === selectedTemplate)
    } else {
      return dbTemplates.find(t => t.id === selectedTemplate)
    }
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Email Template Preview</h1>
          <p className="text-muted-foreground">
            Preview email templates before sending campaigns
          </p>
        </div>
        <Link href="/admin/campaigns">
          <Button variant="outline">
            <Mail className="h-4 w-4 mr-2" />
            Back to Campaigns
          </Button>
        </Link>
      </div>

      {/* Template Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Select Template</CardTitle>
          <CardDescription>
            Choose an email template to preview (React = transactional, Database = campaigns)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-start">
            <div className="flex-1">
              <Select value={selectedTemplate} onValueChange={handleTemplateChange} disabled={loadingTemplates}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={loadingTemplates ? "Loading templates..." : "Select template"} />
                </SelectTrigger>
                <SelectContent>
                  {/* React Email Templates */}
                  <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
                    React Email Templates (Transactional)
                  </div>
                  {reactTemplates.map((template) => (
                    <SelectItem key={template.value} value={template.value}>
                      {template.label}
                    </SelectItem>
                  ))}

                  {/* Database Templates */}
                  {dbTemplates.length > 0 && (
                    <>
                      <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground mt-2">
                        Database Templates (Campaigns)
                      </div>
                      {dbTemplates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name} ({template.category})
                        </SelectItem>
                      ))}
                    </>
                  )}

                  {dbTemplates.length === 0 && !loadingTemplates && (
                    <div className="px-2 py-1.5 text-sm text-muted-foreground">
                      No database templates found. Create one in the Templates page.
                    </div>
                  )}
                </SelectContent>
              </Select>

              {selectedType === 'database' && getCurrentTemplate() && (
                <div className="mt-2 text-sm text-muted-foreground">
                  <div><strong>Subject:</strong> {(getCurrentTemplate() as EmailTemplate)?.subject_template}</div>
                </div>
              )}
            </div>

            <Button onClick={loadPreview} disabled={loading || !selectedTemplate}>
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-2" />
                  Load Preview
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {emailHtml && (
        <Card>
          <CardHeader>
            <CardTitle>
              Preview: {selectedType === 'react'
                ? reactTemplates.find(t => t.value === selectedTemplate)?.label
                : (getCurrentTemplate() as EmailTemplate)?.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden">
              <iframe
                srcDoc={emailHtml}
                className="w-full h-[800px] border-0"
                title="Email Preview"
                sandbox="allow-same-origin"
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
