"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Zap, BookOpen, MessageSquare, Settings, Users, Plus, Video, HelpCircle, Handshake } from "lucide-react"
import { createBrowserClient } from '@supabase/ssr'
import { OnlineIndicator, usePresence } from "@/components/ui/online-indicator"
import { SessionCounter } from "@/components/ui/session-counter"

// Use browser client for proper cookie handling
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
}

export default function PortalPage() {
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Track presence for current user
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
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-12 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8 bg-card/50 backdrop-blur border rounded-lg p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-foreground">
                  Welcome back, {user.full_name || user.email}!
                </h1>
                <OnlineIndicator userId={user.id} showLabel />
              </div>
              <p className="text-muted-foreground">
                Your Web Launch Academy dashboard
              </p>
            </div>
            <Link href="/">
              <Button variant="outline">
                Sign Out
              </Button>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            <Button variant="ghost" className="h-auto py-3 flex flex-col gap-2" asChild>
              <Link href="/portal/chat">
                <MessageSquare className="h-5 w-5" />
                <span className="text-sm">Chat</span>
              </Link>
            </Button>
            <Button variant="ghost" className="h-auto py-3 flex flex-col gap-2" asChild>
              <Link href="/portal/cohorts">
                <Users className="h-5 w-5" />
                <span className="text-sm">Cohorts</span>
              </Link>
            </Button>
            <Button variant="ghost" className="h-auto py-3 flex flex-col gap-2" asChild>
              <Link href="/portal/collaboration">
                <Handshake className="h-5 w-5" />
                <span className="text-sm">Collaboration</span>
              </Link>
            </Button>
            <Button variant="ghost" className="h-auto py-3 flex flex-col gap-2" asChild>
              <Link href="/portal/resources">
                <Zap className="h-5 w-5" />
                <span className="text-sm">Resources</span>
              </Link>
            </Button>
            <Button variant="ghost" className="h-auto py-3 flex flex-col gap-2" asChild>
              <Link href="/portal/support">
                <HelpCircle className="h-5 w-5" />
                <span className="text-sm">Support</span>
              </Link>
            </Button>
            <Button variant="ghost" className="h-auto py-3 flex flex-col gap-2" asChild>
              <Link href="/portal/textbook">
                <BookOpen className="h-5 w-5" />
                <span className="text-sm">Textbook</span>
              </Link>
            </Button>
            <Button variant="ghost" className="h-auto py-3 flex flex-col gap-2" asChild>
              <Link href="/portal/video">
                <Video className="h-5 w-5" />
                <span className="text-sm">Video</span>
              </Link>
            </Button>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Account Status</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                {user.role === 'admin' ? 'Admin' : 'Student'}
              </Badge>
              <p className="text-xs text-muted-foreground mt-2">
                {user.role === 'admin' ? 'Admin Access' : 'Student Access'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Tier: {user.tier}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">LVL UP Sessions</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <SessionCounter userId={user.id} variant="full" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Support</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24/7</div>
              <p className="text-xs text-muted-foreground">
                AI-powered assistance
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Student Resources */}
        <div className="mb-8">
          <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                WebLaunchCoach Student Textbook
              </CardTitle>
              <CardDescription>
                Complete guide to professional web development - &quot;Build Once, Own Forever&quot;
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    📖 8 comprehensive chapters covering everything from setup to long-term success
                  </p>
                  <p className="text-sm text-muted-foreground">
                    🔐 Student-exclusive content with progress tracking
                  </p>
                </div>
                <Button asChild className="shrink-0">
                  <Link href="/portal/textbook">
                    Access Textbook
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cohort Management */}
        {user.role === 'admin' && (
          <div className="mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Cohort Management
                </CardTitle>
                <CardDescription>
                  Manage your student cohorts and track progress
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <Button asChild>
                    <Link href="/portal/cohorts">
                      View All Cohorts
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/portal/cohorts/new">
                      <Plus className="h-4 w-4 mr-2" />
                      Create New Cohort
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Student Cohort View */}
        {user.role === 'student' && (
          <div className="mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  My Cohort
                </CardTitle>
                <CardDescription>
                  Connect with your learning group
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground mb-4">
                  Join a cohort to learn alongside other students
                </div>
                <Button variant="outline" asChild>
                  <Link href="/portal/cohorts">
                    View Available Cohorts
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Get Started
              </CardTitle>
              <CardDescription>
                Begin your website building journey
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full" asChild>
                <Link href="/portal/textbook">
                  📚 Student Textbook
                </Link>
              </Button>
              {user.role === 'admin' && (
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/portal/cohorts">
                    <Users className="h-4 w-4 mr-2" />
                    Manage Cohorts
                  </Link>
                </Button>
              )}
              <Button variant="outline" className="w-full" asChild>
                <Link href="/consultation">
                  Schedule Strategy Call
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                Account Settings
              </CardTitle>
              <CardDescription>
                Manage your profile and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-sm">
                <strong>Email:</strong> {user.email}
              </div>
              <div className="text-sm">
                <strong>Role:</strong> {user.role === 'admin' ? 'Admin' : 'Student'}
              </div>
              <Button variant="outline" size="sm" className="mt-4">
                Update Profile
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}