"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { createBrowserClient } from '@supabase/ssr'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Users, Calendar, ArrowLeft, BookOpen, TrendingUp } from "lucide-react"
import { usePresence } from "@/components/ui/online-indicator"

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
  member_count?: number
  my_status?: string
  my_joined_at?: string
  my_completion?: number
}

export default function StudentCohortsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [myCohorts, setMyCohorts] = useState<Cohort[]>([])
  const [loading, setLoading] = useState(true)

  usePresence()

  useEffect(() => {
    async function loadData() {
      const { data: { user: authUser } } = await supabase.auth.getUser()

      if (!authUser) {
        router.push("/signin")
        return
      }

      setUser(authUser)

      // Check if admin
      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', authUser.id)
        .single()

      const userIsAdmin = userData?.role === 'admin'
      setIsAdmin(userIsAdmin)

      // Redirect admins to admin cohort page
      if (userIsAdmin) {
        router.push('/admin/cohorts')
        return
      }

      // Load student's cohorts
      const { data: memberData } = await supabase
        .from('cohort_members')
        .select(`
          status,
          joined_at,
          completion_percentage,
          cohort:cohorts(*)
        `)
        .eq('user_id', authUser.id)

      if (memberData) {
        // Get member counts for each cohort
        const cohortsWithCounts = await Promise.all(
          memberData.map(async (member: any) => {
            const { count } = await supabase
              .from('cohort_members')
              .select('*', { count: 'exact', head: true })
              .eq('cohort_id', member.cohort.id)
              .eq('status', 'active')

            return {
              ...member.cohort,
              member_count: count || 0,
              my_status: member.status,
              my_joined_at: member.joined_at,
              my_completion: member.completion_percentage
            }
          })
        )

        setMyCohorts(cohortsWithCounts)
      }

      setLoading(false)
    }

    loadData()
  }, [router])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
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
    return 'in-progress'
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'in-progress':
        return <Badge className="bg-green-500">In Progress</Badge>
      case 'upcoming':
        return <Badge className="bg-blue-500">Upcoming</Badge>
      case 'completed':
        return <Badge variant="secondary">Completed</Badge>
      default:
        return null
    }
  }

  const getMemberStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">Active</Badge>
      case 'completed':
        return <Badge className="bg-blue-500">Completed</Badge>
      case 'dropped':
        return <Badge variant="secondary">Dropped</Badge>
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your cohorts...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  const activeCohort = myCohorts.find(c => c.my_status === 'active' && c.is_active)
  const pastCohorts = myCohorts.filter(c => c.my_status !== 'active' || !c.is_active)

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-12 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/portal">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Portal
              </Link>
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            My Learning Cohorts
          </h1>
          <p className="text-muted-foreground">
            Track your progress and connect with your learning group
          </p>
        </div>

        {/* Active Cohort */}
        {activeCohort && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Current Cohort</h2>
            <Card className="border-primary/50 bg-gradient-to-r from-primary/5 to-accent/5">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-xl">{activeCohort.name}</CardTitle>
                      {getStatusBadge(getCohortStatus(activeCohort))}
                      {activeCohort.is_active && <Badge className="bg-purple-500">Active Cohort</Badge>}
                    </div>
                    <CardDescription className="text-base">
                      {activeCohort.title}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-6">
                  {activeCohort.description}
                </p>

                <div className="grid md:grid-cols-4 gap-6 mb-6">
                  <div>
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Calendar className="h-4 w-4" />
                      <span className="text-xs">Start Date</span>
                    </div>
                    <p className="font-medium">{formatDate(activeCohort.start_date)}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Calendar className="h-4 w-4" />
                      <span className="text-xs">End Date</span>
                    </div>
                    <p className="font-medium">{formatDate(activeCohort.end_date)}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Users className="h-4 w-4" />
                      <span className="text-xs">Classmates</span>
                    </div>
                    <p className="font-medium">{activeCohort.member_count || 0} students</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <TrendingUp className="h-4 w-4" />
                      <span className="text-xs">Your Progress</span>
                    </div>
                    <p className="font-medium">{activeCohort.my_completion || 0}%</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button asChild>
                    <Link href="/portal/textbook">
                      <BookOpen className="h-4 w-4 mr-2" />
                      View Textbook
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href={`/portal/cohorts/${activeCohort.id}`}>
                      View Cohort Details
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
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
                          {getMemberStatusBadge(cohort.my_status || '')}
                        </div>
                        <CardDescription>{cohort.title}</CardDescription>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/portal/cohorts/${cohort.id}`}>
                          View Details
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
                        <span>{cohort.member_count} students</span>
                      </div>
                      {cohort.my_completion !== undefined && (
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-muted-foreground" />
                          <span>{cohort.my_completion}% completed</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {myCohorts.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Welcome to Web Launch Academy!</h3>
              <p className="text-muted-foreground mb-6">
                You'll be automatically added to the active cohort when one is available.
                In the meantime, check out the resources below to get started.
              </p>
              <div className="flex gap-3 justify-center">
                <Button asChild>
                  <Link href="/portal/textbook">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Browse Textbook
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/portal/resources">
                    View Resources
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
