'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Eye, RefreshCw, Mail } from 'lucide-react'
import Link from 'next/link'

/**
 * Email Preview Tool (Admin)
 *
 * Preview email templates before sending
 * Protected by admin authentication
 */
export default function AdminEmailPreviewPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('welcome')
  const [emailHtml, setEmailHtml] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const templates = [
    { value: 'welcome', label: 'Welcome Email' },
    { value: 'payment', label: 'Payment Confirmation' },
    { value: 'password-reset', label: 'Password Reset' },
  ]

  const loadPreview = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/email-preview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ template: selectedTemplate }),
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
            Choose an email template to preview
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="Select template" />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template.value} value={template.value}>
                    {template.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button onClick={loadPreview} disabled={loading}>
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
            <CardTitle>Preview: {templates.find(t => t.value === selectedTemplate)?.label}</CardTitle>
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
