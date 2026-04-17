"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Gauge, CheckCircle2, AlertCircle } from "lucide-react"
import { createBrowserClient } from '@supabase/ssr'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Client {
  id: string
  email: string
  full_name: string | null
  website_url: string | null
}

interface WebsitePage {
  id: string
  page_name: string
  page_path: string
  full_url: string | null
}

export function LighthouseTester() {
  const [clients, setClients] = useState<Client[]>([])
  const [selectedClient, setSelectedClient] = useState<string>('')
  const [pages, setPages] = useState<WebsitePage[]>([])
  const [selectedPage, setSelectedPage] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [testLoading, setTestLoading] = useState(false)
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null)

  // Score inputs
  const [performance, setPerformance] = useState('')
  const [accessibility, setAccessibility] = useState('')
  const [bestPractices, setBestPractices] = useState('')
  const [seo, setSeo] = useState('')
  const [pwa, setPwa] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    loadClients()
  }, [])

  useEffect(() => {
    if (selectedClient) {
      loadPages(selectedClient)
    } else {
      setPages([])
      setSelectedPage('')
    }
  }, [selectedClient])

  async function loadClients() {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, email, full_name, website_url')
        .eq('role', 'student')
        .order('full_name')

      if (error) {
        console.error('Error loading clients:', error)
      } else if (data) {
        setClients(data)
      }
    } catch (error) {
      console.error('Error loading clients:', error)
    } finally {
      setLoading(false)
    }
  }

  async function loadPages(userId: string) {
    try {
      const { data, error } = await supabase
        .from('website_pages')
        .select('*')
        .eq('user_id', userId)
        .order('order_index')

      if (error) {
        console.error('Error loading pages:', error)
      } else if (data) {
        setPages(data)
        if (data.length > 0) {
          setSelectedPage(data[0].id)
        }
      }
    } catch (error) {
      console.error('Error loading pages:', error)
    }
  }

  async function runTest() {
    if (!selectedClient || !selectedPage) {
      setMessage({ type: 'error', text: 'Please select a client and page' })
      return
    }

    setTestLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/admin/lighthouse-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: selectedClient,
          page_id: selectedPage,
          performance: performance ? parseInt(performance) : null,
          accessibility: accessibility ? parseInt(accessibility) : null,
          best_practices: bestPractices ? parseInt(bestPractices) : null,
          seo: seo ? parseInt(seo) : null,
          pwa: pwa ? parseInt(pwa) : null,
          test_notes: notes
        })
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({ type: 'success', text: 'Lighthouse scores saved successfully!' })
        // Reset form
        setPerformance('')
        setAccessibility('')
        setBestPractices('')
        setSeo('')
        setPwa('')
        setNotes('')
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to save scores' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred' })
    } finally {
      setTestLoading(false)
    }
  }

  const selectedClientData = clients.find(c => c.id === selectedClient)
  const selectedPageData = pages.find(p => p.id === selectedPage)
  const testUrl = selectedPageData
    ? (selectedPageData.full_url || (selectedClientData?.website_url ? `${selectedClientData.website_url}${selectedPageData.page_path}` : null))
    : null

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gauge className="h-5 w-5" />
          Lighthouse Tester
        </CardTitle>
        <CardDescription>
          Test client websites and record Lighthouse scores
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {message && (
          <div className={`flex items-center gap-2 p-3 rounded-md ${
            message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <p className="text-sm">{message.text}</p>
          </div>
        )}

        {/* Client Selection */}
        <div className="space-y-2">
          <Label>Select Client</Label>
          <Select value={selectedClient} onValueChange={setSelectedClient}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a client" />
            </SelectTrigger>
            <SelectContent>
              {clients.map((client) => (
                <SelectItem key={client.id} value={client.id}>
                  {client.full_name || client.email}
                  {client.website_url && (
                    <span className="text-xs text-muted-foreground ml-2">
                      ({client.website_url})
                    </span>
                  )}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Page Selection */}
        {pages.length > 0 && (
          <div className="space-y-2">
            <Label>Select Page</Label>
            <Select value={selectedPage} onValueChange={setSelectedPage}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a page" />
              </SelectTrigger>
              <SelectContent>
                {pages.map((page) => (
                  <SelectItem key={page.id} value={page.id}>
                    {page.page_name} ({page.page_path})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Test URL Display */}
        {testUrl && (
          <div className="p-3 bg-muted rounded-lg">
            <Label className="text-xs text-muted-foreground">Test URL</Label>
            <p className="text-sm font-mono">{testUrl}</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              asChild
            >
              <a href={testUrl} target="_blank" rel="noopener noreferrer">
                Open in New Tab
              </a>
            </Button>
          </div>
        )}

        {/* Score Inputs */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div>
            <Label htmlFor="performance">Performance</Label>
            <Input
              id="performance"
              type="number"
              min="0"
              max="100"
              value={performance}
              onChange={(e) => setPerformance(e.target.value)}
              placeholder="0-100"
            />
          </div>

          <div>
            <Label htmlFor="accessibility">Accessibility</Label>
            <Input
              id="accessibility"
              type="number"
              min="0"
              max="100"
              value={accessibility}
              onChange={(e) => setAccessibility(e.target.value)}
              placeholder="0-100"
            />
          </div>

          <div>
            <Label htmlFor="best_practices">Best Practices</Label>
            <Input
              id="best_practices"
              type="number"
              min="0"
              max="100"
              value={bestPractices}
              onChange={(e) => setBestPractices(e.target.value)}
              placeholder="0-100"
            />
          </div>

          <div>
            <Label htmlFor="seo">SEO</Label>
            <Input
              id="seo"
              type="number"
              min="0"
              max="100"
              value={seo}
              onChange={(e) => setSeo(e.target.value)}
              placeholder="0-100"
            />
          </div>

          <div>
            <Label htmlFor="pwa">PWA</Label>
            <Input
              id="pwa"
              type="number"
              min="0"
              max="100"
              value={pwa}
              onChange={(e) => setPwa(e.target.value)}
              placeholder="0-100"
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <Label htmlFor="notes">Test Notes (Optional)</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any notes about this test..."
            rows={3}
          />
        </div>

        {/* Submit Button */}
        <Button
          onClick={runTest}
          disabled={!selectedClient || !selectedPage || testLoading}
          className="w-full"
        >
          {testLoading ? 'Saving Scores...' : 'Save Lighthouse Scores'}
        </Button>

        <p className="text-xs text-muted-foreground">
          💡 Tip: Run Lighthouse in Chrome DevTools (F12 → Lighthouse tab) and manually enter the scores here.
        </p>
      </CardContent>
    </Card>
  )
}
