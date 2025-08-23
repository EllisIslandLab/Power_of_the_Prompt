"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"
// import { useAuth } from "@/hooks/useAuth" // Temporarily disabled
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Zap, BookOpen, MessageSquare, Settings, Users, Plus } from "lucide-react"

export default function PortalPage() {
  // Temporarily disable auth - allow access to portal for testing
  const user = {
    email: 'test@weblaunchacademy.com',
    studentProfile: {
      full_name: 'Test Student'
    }
  }
  const loading = false

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-12 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Welcome back, {user.studentProfile?.full_name || user.adminProfile?.full_name || user.email}!
            </h1>
            <p className="text-muted-foreground">
              Your Web Launch Academy dashboard
            </p>
          </div>
          <Link href="/signin">
            <Button variant="outline">
              Sign Out
            </Button>
          </Link>
        </div>

        {/* Status Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Account Status</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Badge variant={user.userType === 'admin' ? 'default' : 'secondary'}>
                {user.userType === 'admin' ? 
                  user.adminProfile?.role || 'Admin' : 'Student'}
              </Badge>
              <p className="text-xs text-muted-foreground mt-2">
                {user.userType === 'admin' ? 'Admin Access' : 'Student Access'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Course Progress</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {user.studentProfile?.progress || 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                {user.studentProfile?.course_enrolled || 'Ready to start building'}
              </p>
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
        {user.userType === 'admin' && (
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
        {user.userType === 'student' && (
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
              {user.userType === 'admin' && (
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
                <strong>Role:</strong> {user.userType === 'admin' ? 
                  user.adminProfile?.role || 'Admin' : 'Student'}
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