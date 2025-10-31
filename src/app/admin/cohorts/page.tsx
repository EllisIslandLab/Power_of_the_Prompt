"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from '@supabase/ssr'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import {
  Users,
  Plus,
  Calendar,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  ArrowLeft
} from "lucide-react"
import { useRouter } from "next/navigation"

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Cohort {
  id: string
  name: string
  title: string
  description: string
  start_date: string
  end_date: string
  duration_weeks: number
  is_active: boolean
  created_at: string
  member_count?: number
  completion_rate?: number
}

interface CohortMember {
  user_id: string
  cohort_count: number
}

export default function AdminCohortsPage() {
  const router = useRouter()
  const [cohorts, setCohorts] = useState<Cohort[]>([])
  const [loading, setLoading] = useState(true)
  const [multiCohortUsers, setMultiCohortUsers] = useState<CohortMember[]>([])
  const [showMultiCohortWarning, setShowMultiCohortWarning] = useState(false)

  useEffect(() => {
    checkAdminAccess()
    loadCohorts()
    checkMultiCohortUsers()
  }, [])

  async function checkAdminAccess() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/signin')
      return
    }

    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userData?.role !== 'admin') {
      router.push('/portal')
    }
  }

  async function loadCohorts() {
    const { data, error } = await supabase
      .from('cohorts')
      .select('*')
      .order('start_date', { ascending: false })

    if (data && !error) {
      // Get member counts and completion rates for each cohort
      const cohortsWithStats = await Promise.all(
        data.map(async (cohort) => {
          const { count } = await supabase
            .from('cohort_members')
            .select('*', { count: 'exact', head: true })
            .eq('cohort_id', cohort.id)
            .eq('status', 'active')

          const { data: completedMembers } = await supabase
            .from('cohort_members')
            .select('user_id')
            .eq('cohort_id', cohort.id)
            .eq('status', 'completed')

          const totalMembers = count || 0
          const completedCount = completedMembers?.length || 0
          const completion_rate = totalMembers > 0
            ? Math.round((completedCount / totalMembers) * 100)
            : 0

          return {
            ...cohort,
            member_count: totalMembers,
            completion_rate
          }
        })
      )

      setCohorts(cohortsWithStats)
    }
    setLoading(false)
  }

  async function checkMultiCohortUsers() {
    // Find users who are in multiple cohorts
    const { data } = await supabase
      .from('cohort_members')
      .select('user_id, cohort_id')
      .eq('status', 'active')

    if (data) {
      const userCohortCounts: { [key: string]: number } = {}
      data.forEach(member => {
        userCohortCounts[member.user_id] = (userCohortCounts[member.user_id] || 0) + 1
      })

      const multiCohort = Object.entries(userCohortCounts)
        .filter(([_, count]) => count > 1)
        .map(([user_id, cohort_count]) => ({ user_id, cohort_count }))

      setMultiCohortUsers(multiCohort)
      setShowMultiCohortWarning(multiCohort.length > 0)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getCohortStatus = (cohort: Cohort) => {
    const now = new Date()
    const startDate = new Date(cohort.start_date)
    const endDate = new Date(cohort.end_date)

    if (now < startDate) return 'upcoming'
    if (now > endDate) return 'completed'
    return 'active'
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">Active</Badge>
      case 'upcoming':
        return <Badge className="bg-blue-500">Upcoming</Badge>
      case 'completed':
        return <Badge variant="secondary">Completed</Badge>
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading cohorts...</p>
        </div>
      </div>
    )
  }

  const activeCohort = cohorts.find(c => c.is_active)
  const upcomingCohorts = cohorts.filter(c => getCohortStatus(c) === 'upcoming')
  const pastCohorts = cohorts.filter(c => getCohortStatus(c) === 'completed')

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 p-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">Cohort Management</h1>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link href="/admin">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Admin
                </Link>
              </Button>
              <Button asChild>
                <Link href="/admin/cohorts/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Cohort
                </Link>
              </Button>
            </div>
          </div>
          <p className="text-muted-foreground">
            Manage student cohorts, track progress, and organize learning groups
          </p>
        </div>

        {/* Multi-Cohort Warning */}
        {showMultiCohortWarning && (
          <Card className="mb-6 border-yellow-500/50 bg-yellow-50 dark:bg-yellow-950/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-700 dark:text-yellow-500">
                <AlertCircle className="h-5 w-5" />
                Multiple Cohort Memberships Detected
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-yellow-700 dark:text-yellow-400 mb-3">
                {multiCohortUsers.length} student{multiCohortUsers.length !== 1 ? 's' : ''} {multiCohortUsers.length !== 1 ? 'are' : 'is'} enrolled in multiple cohorts simultaneously.
                This may indicate retakes or ongoing cohorts.
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowMultiCohortWarning(false)}
              >
                Dismiss
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Stats Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Cohorts</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{cohorts.length}</div>
              <p className="text-xs text-muted-foreground">
                All time cohorts created
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Students</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeCohort?.member_count || 0}</div>
              <p className="text-xs text-muted-foreground">
                In current cohort
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {activeCohort?.completion_rate || 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                Current cohort progress
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Active Cohort */}
        {activeCohort && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Active Cohort</h2>
            <Card className="border-primary/50 bg-gradient-to-r from-primary/5 to-accent/5">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-xl">{activeCohort.name}</CardTitle>
                      {getStatusBadge('active')}
                    </div>
                    <CardDescription className="text-base">
                      {activeCohort.title}
                    </CardDescription>
                  </div>
                  <Button asChild>
                    <Link href={`/admin/cohorts/${activeCohort.id}`}>
                      Manage
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {activeCohort.description}
                </p>
                <div className="grid md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="flex items-center gap-1 text-muted-foreground mb-1">
                      <Calendar className="h-3 w-3" />
                      <span className="text-xs">Start Date</span>
                    </div>
                    <p className="font-medium">{formatDate(activeCohort.start_date)}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-muted-foreground mb-1">
                      <Calendar className="h-3 w-3" />
                      <span className="text-xs">End Date</span>
                    </div>
                    <p className="font-medium">{formatDate(activeCohort.end_date)}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-muted-foreground mb-1">
                      <Users className="h-3 w-3" />
                      <span className="text-xs">Students</span>
                    </div>
                    <p className="font-medium">{activeCohort.member_count || 0}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-muted-foreground mb-1">
                      <TrendingUp className="h-3 w-3" />
                      <span className="text-xs">Duration</span>
                    </div>
                    <p className="font-medium">{activeCohort.duration_weeks} weeks</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Upcoming Cohorts */}
        {upcomingCohorts.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Upcoming Cohorts</h2>
            <div className="grid gap-4">
              {upcomingCohorts.map(cohort => (
                <Card key={cohort.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle>{cohort.name}</CardTitle>
                          {getStatusBadge('upcoming')}
                        </div>
                        <CardDescription>{cohort.title}</CardDescription>
                      </div>
                      <Button variant="outline" asChild>
                        <Link href={`/admin/cohorts/${cohort.id}`}>
                          View Details
                        </Link>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>Starts {formatDate(cohort.start_date)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{cohort.member_count || 0} students</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Past Cohorts */}
        {pastCohorts.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Past Cohorts</h2>
            <div className="grid gap-4">
              {pastCohorts.map(cohort => (
                <Card key={cohort.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle>{cohort.name}</CardTitle>
                          {getStatusBadge('completed')}
                        </div>
                        <CardDescription>{cohort.title}</CardDescription>
                      </div>
                      <Button variant="outline" asChild>
                        <Link href={`/admin/cohorts/${cohort.id}`}>
                          View Archive
                        </Link>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{formatDate(cohort.start_date)} - {formatDate(cohort.end_date)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{cohort.member_count || 0} students</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                        <span>{cohort.completion_rate}% completion</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {cohorts.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Cohorts Yet</h3>
              <p className="text-muted-foreground mb-6">
                Create your first cohort to start organizing students into learning groups
              </p>
              <Button asChild>
                <Link href="/admin/cohorts/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Cohort
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
