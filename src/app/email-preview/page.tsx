'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

/**
 * Email Preview Tool
 *
 * Development tool for previewing email templates
 * Visit /email-preview during development to see your emails
 *
 * IMPORTANT: Remove this in production or add authentication!
 */
export default function EmailPreviewPage() {
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
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Email Template Preview</CardTitle>
            <CardDescription>
              Development tool for previewing email templates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                <SelectTrigger className="w-[200px]">
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
                {loading ? 'Loading...' : 'Load Preview'}
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
    </div>
  )
}
