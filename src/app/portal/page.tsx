"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { BookOpen, Settings, Zap, FileEdit, Menu, X } from "lucide-react"
import { createBrowserClient } from '@supabase/ssr'
import { OnlineIndicator, usePresence } from "@/components/ui/online-indicator"
import { WebsitePreview } from "@/components/portal/WebsitePreview"
import { LighthouseScores } from "@/components/portal/LighthouseScores"
import RevisionStartForm from "@/components/portal/forms/RevisionStartForm"
import RevisionModifierForm from "@/components/portal/forms/RevisionModifierForm"

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface UserData {
  id: string
  email: string
  full_name?: string
  role: string
  tier: string
  website_url?: string
}

export default function PortalPage() {
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const router = useRouter()

  usePresence()

  useEffect(() => {
    async function loadUser() {
      const { data: { user: authUser } } = await supabase.auth.getUser()

      if (!authUser) {
        router.push('/signin')
        return
      }

      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single()

      if (userData) {
        setUser(userData)
      }
      setLoading(false)
    }

    loadUser()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="flex">
        {/* Mobile Sidebar Toggle */}
        <Button
          variant="ghost"
          size="sm"
          className="fixed top-4 left-4 z-50 md:hidden"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X /> : <Menu />}
        </Button>

        {/* Left Sidebar */}
        <aside
          className={`fixed md:sticky top-0 left-0 h-screen bg-card border-r transition-all duration-300 z-40 ${
            sidebarOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full md:translate-x-0 md:w-16'
          }`}
        >
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b">
              {sidebarOpen ? (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h2 className="font-bold text-lg">Web Launch</h2>
                    <OnlineIndicator userId={user.id} />
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {user.full_name || user.email}
                  </p>
                  <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="mt-2 text-xs">
                    {user.role === 'admin' ? 'Admin' : 'Client'}
                  </Badge>
                </div>
              ) : (
                <div className="flex justify-center">
                  <OnlineIndicator userId={user.id} />
                </div>
              )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto p-2">
              <div className="space-y-1">
                <Button
                  variant="ghost"
                  className={`w-full ${sidebarOpen ? 'justify-start' : 'justify-center'}`}
                  asChild
                >
                  <a href="#revision-rounds">
                    <FileEdit className="h-4 w-4" />
                    {sidebarOpen && <span className="ml-2">Revision Rounds</span>}
                  </a>
                </Button>

                <Button
                  variant="ghost"
                  className={`w-full ${sidebarOpen ? 'justify-start' : 'justify-center'}`}
                  asChild
                >
                  <Link href="/portal/textbook">
                    <BookOpen className="h-4 w-4" />
                    {sidebarOpen && <span className="ml-2">Dev Guide</span>}
                  </Link>
                </Button>

                <Button
                  variant="ghost"
                  className={`w-full ${sidebarOpen ? 'justify-start' : 'justify-center'}`}
                  asChild
                >
                  <Link href="/portal/resources">
                    <Zap className="h-4 w-4" />
                    {sidebarOpen && <span className="ml-2">Resources</span>}
                  </Link>
                </Button>

                <Button
                  variant="ghost"
                  className={`w-full ${sidebarOpen ? 'justify-start' : 'justify-center'}`}
                  asChild
                >
                  <Link href="/portal/settings">
                    <Settings className="h-4 w-4" />
                    {sidebarOpen && <span className="ml-2">Settings</span>}
                  </Link>
                </Button>
              </div>
            </nav>

            {/* Footer */}
            <div className="p-4 border-t">
              {sidebarOpen ? (
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link href="/">Sign Out</Link>
                </Button>
              ) : (
                <Button variant="ghost" size="sm" className="w-full" asChild>
                  <Link href="/">→</Link>
                </Button>
              )}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">
                Welcome back, {user.full_name || user.email}!
              </h1>
            </div>
            <p className="text-muted-foreground">Your Web Launch Academy dashboard</p>
          </div>

          {/* Revision Rounds Section */}
          <div id="revision-rounds" className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Revision Rounds</h2>
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <Card>
                <CardHeader>
                  <CardTitle>Start New Revision</CardTitle>
                  <CardDescription>
                    Request changes or improvements to your website
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RevisionStartForm
                    userEmail={user.email}
                    userName={user.full_name || user.email}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Modify Revision</CardTitle>
                  <CardDescription>
                    Adjust an existing revision request
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RevisionModifierForm
                    userEmail={user.email}
                    userName={user.full_name || user.email}
                  />
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Website Preview Section */}
          <div className="mb-8">
            <WebsitePreview userId={user.id} websiteUrl={user.website_url || null} />
          </div>

          {/* Lighthouse Scores Section */}
          <div className="mb-8">
            <LighthouseScores userId={user.id} />
          </div>
        </main>
      </div>
    </div>
  )
}
