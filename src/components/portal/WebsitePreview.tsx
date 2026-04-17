"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Globe, Plus, X, ExternalLink, AlertCircle } from "lucide-react"
import { createBrowserClient } from '@supabase/ssr'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface WebsitePage {
  id: string
  page_name: string
  page_path: string
  full_url: string | null
  is_primary: boolean
  order_index: number
}

export function WebsitePreview({ userId, websiteUrl }: { userId: string; websiteUrl: string | null }) {
  const [pages, setPages] = useState<WebsitePage[]>([])
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null)
  const [showAddPage, setShowAddPage] = useState(false)
  const [loading, setLoading] = useState(true)

  // Add page form
  const [pageName, setPageName] = useState('')
  const [pagePath, setPagePath] = useState('')
  const [addLoading, setAddLoading] = useState(false)

  useEffect(() => {
    loadPages()
  }, [userId])

  async function loadPages() {
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
        if (data.length > 0 && !selectedPageId) {
          setSelectedPageId(data.find(p => p.is_primary)?.id || data[0].id)
        }
      }
    } catch (error) {
      console.error('Error loading pages:', error)
    } finally {
      setLoading(false)
    }
  }

  async function addPage() {
    if (!pageName || !pagePath) return

    setAddLoading(true)
    try {
      const { error } = await supabase
        .from('website_pages')
        .insert({
          user_id: userId,
          page_name: pageName,
          page_path: pagePath.startsWith('/') ? pagePath : '/' + pagePath,
          is_primary: pages.length === 0,
          order_index: pages.length
        })

      if (error) {
        console.error('Error adding page:', error)
        alert('Failed to add page')
      } else {
        setPageName('')
        setPagePath('')
        setShowAddPage(false)
        loadPages()
      }
    } catch (error) {
      console.error('Error adding page:', error)
    } finally {
      setAddLoading(false)
    }
  }

  async function deletePage(pageId: string) {
    if (!confirm('Are you sure you want to remove this page?')) return

    try {
      const { error } = await supabase
        .from('website_pages')
        .delete()
        .eq('id', pageId)

      if (error) {
        console.error('Error deleting page:', error)
      } else {
        loadPages()
        if (selectedPageId === pageId) {
          setSelectedPageId(null)
        }
      }
    } catch (error) {
      console.error('Error deleting page:', error)
    }
  }

  const selectedPage = pages.find(p => p.id === selectedPageId)
  const previewUrl = selectedPage
    ? (selectedPage.full_url || (websiteUrl ? `${websiteUrl}${selectedPage.page_path}` : null))
    : websiteUrl

  if (loading) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    )
  }

  if (!websiteUrl) {
    return (
      <Card className="h-full">
        <CardContent className="flex flex-col items-center justify-center p-12 text-center">
          <Globe className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Website Added</h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            Add your website URL in settings to see a live preview here
          </p>
          <Button asChild>
            <a href="/portal/settings">Add Website URL</a>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Website Preview
              </CardTitle>
              <CardDescription>{websiteUrl}</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowAddPage(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Page
              </Button>
              {previewUrl && (
                <Button variant="outline" size="sm" asChild>
                  <a href={previewUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open
                  </a>
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {pages.length > 0 ? (
            <Tabs value={selectedPageId || undefined} onValueChange={setSelectedPageId}>
              <TabsList className="w-full justify-start overflow-x-auto">
                {pages.map((page) => (
                  <TabsTrigger key={page.id} value={page.id} className="relative group">
                    <span>{page.page_name}</span>
                    {page.is_primary && (
                      <Badge variant="outline" className="ml-2 text-xs">Primary</Badge>
                    )}
                    {pages.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          deletePage(page.id)
                        }}
                        className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </TabsTrigger>
                ))}
              </TabsList>
              {pages.map((page) => (
                <TabsContent key={page.id} value={page.id} className="mt-4">
                  {previewUrl ? (
                    <div className="relative w-full rounded-lg overflow-hidden border bg-white" style={{ height: '600px' }}>
                      <iframe
                        src={previewUrl}
                        className="w-full h-full"
                        title={`Preview of ${page.page_name}`}
                        sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-48 border rounded-lg bg-muted/50">
                      <div className="text-center text-muted-foreground">
                        <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                        <p>Unable to load preview</p>
                      </div>
                    </div>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          ) : (
            <div className="text-center py-12">
              <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground mb-4">No pages added yet</p>
              <Button onClick={() => setShowAddPage(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Page
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Page Dialog */}
      <Dialog open={showAddPage} onOpenChange={setShowAddPage}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Website Page</DialogTitle>
            <DialogDescription>
              Add a page from your website to track and test
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="page_name">Page Name</Label>
              <Input
                id="page_name"
                value={pageName}
                onChange={(e) => setPageName(e.target.value)}
                placeholder="e.g., Home, About, Contact"
              />
            </div>
            <div>
              <Label htmlFor="page_path">Page Path</Label>
              <Input
                id="page_path"
                value={pagePath}
                onChange={(e) => setPagePath(e.target.value)}
                placeholder="e.g., /, /about, /contact"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Full URL will be: {websiteUrl}{pagePath.startsWith('/') ? pagePath : '/' + pagePath}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddPage(false)}>
              Cancel
            </Button>
            <Button onClick={addPage} disabled={!pageName || !pagePath || addLoading}>
              {addLoading ? 'Adding...' : 'Add Page'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
