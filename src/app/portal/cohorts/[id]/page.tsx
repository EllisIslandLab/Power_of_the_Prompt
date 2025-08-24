/*
COMMENTED OUT - Complex cohort details page with database queries
This page contains complex authentication logic and database dependencies that may interfere with the new authentication system.
Commented out during auth transition - can be re-enabled later when cohort functionality is needed.

Original functionality: Detailed cohort management page with student enrollment tracking,
progress monitoring, curriculum management, and complex role-based permissions.
*/

export default function CohortDetailsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground mb-4">Page Temporarily Unavailable</h1>
        <p className="text-muted-foreground">This cohort management feature is currently disabled during system updates.</p>
      </div>
    </div>
  )
}

/*
ORIGINAL CODE - COMMENTED OUT FOR AUTH TRANSITION:

"use client"

import { useRouter, useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { getSupabase } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { ArrowLeft, Users, Calendar, Settings, UserPlus, Mail } from "lucide-react"

interface Cohort {
  id: string
  name: string
  description: string | null
  status: string | null
  start_date: string | null
  end_date: string | null
  max_students: number | null
  current_students: number | null
  coach_id: string | null
  price: number | null
  is_active: boolean | null
  created_at: string | null
  updated_at: string | null
}

interface Student {
  id: string
  name: string
  email: string
  joined_at: string
}

export default function CohortDetailsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const cohortId = params.id as string
  
  const [cohort, setCohort] = useState<Cohort | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    if (loading) return
    if (!user) router.push("/signin")
    else loadCohortData()
  }, [user, loading, router])

  const loadCohortData = async () => {
    try {
      const supabase = getSupabase()
      
      // Load cohort details
      const { data: cohortData, error: cohortError } = await supabase
        .from('cohorts')
        .select('*')
        .eq('id', cohortId)
        .single()
      if (cohortError) throw cohortError
      
      // Ensure cohortData has all required fields
      if (cohortData && typeof cohortData === 'object') {
        setCohort(cohortData as unknown as Cohort)
      } else {
        throw new Error('Invalid cohort data received')
      }

      // Load enrolled students
      const { data: studentsData, error: studentsError } = await supabase
        .from('cohort_memberships')
        .select('*')
        .eq('cohort_id', cohortId)
      if (studentsError) throw studentsError
      
      // For now, just show basic membership info without profile details
      const formattedStudents = studentsData?.map((membership: any) => ({
        id: membership.student_id,
        name: `Student ${String(membership.student_id).slice(0, 8)}...`, // Show partial ID for now
        email: 'Email not available',
        joined_at: membership.joined_at
      })) || []
      
      setStudents(formattedStudents)
    } catch (error) {
      console.error('Error loading cohort data:', error)
      router.push('/portal/cohorts')
    } finally {
      setLoadingData(false)
    }
  }

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'ACTIVE': return 'default'
      case 'DRAFT': return 'secondary'
      case 'COMPLETED': return 'outline'
      case 'CANCELLED': return 'destructive'
      default: return 'secondary'
    }
  }

  if (loading || loadingData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading cohort...</p>
        </div>
      </div>
    )
  }

  if (!user || !cohort) return null

  const isCoachOrAdmin = user.adminProfile?.role === 'Super Admin' || user.adminProfile?.role === 'Admin'
  const isOwner = cohort.coach_id === user.id

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-12 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/portal/cohorts">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Cohorts
              </Link>
            </Button>
          </div>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {cohort.name}
              </h1>
              <p className="text-muted-foreground">
                {cohort.description || 'No description provided'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={getStatusColor(cohort.status)}>
                {cohort.status || 'DRAFT'}
              </Badge>
              {isOwner && (
                <Button size="sm" asChild>
                  <Link href={`/portal/cohorts/${cohort.id}/settings`}>
                    <Settings className="h-4 w-4 mr-1" />
                    Settings
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {cohort.current_students || 0}/{cohort.max_students || 20}
              </div>
              <p className="text-xs text-muted-foreground">
                {(cohort.max_students || 20) - (cohort.current_students || 0)} spots available
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Start Date</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {cohort.start_date ? new Date(cohort.start_date).toLocaleDateString() : 'TBD'}
              </div>
              <p className="text-xs text-muted-foreground">
                Program begins
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Duration</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {cohort.start_date && cohort.end_date
                  ? Math.ceil((new Date(cohort.end_date).getTime() - new Date(cohort.start_date).getTime()) / (1000 * 60 * 60 * 24 * 7))
                  : '–'
                }
              </div>
              <p className="text-xs text-muted-foreground">
                weeks
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="students" className="w-full">
          <TabsList>
            <TabsTrigger value="students">Students</TabsTrigger>
            {isCoachOrAdmin && <TabsTrigger value="progress">Progress</TabsTrigger>}
            {isCoachOrAdmin && <TabsTrigger value="lessons">Lessons</TabsTrigger>}
          </TabsList>

          <TabsContent value="students" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Enrolled Students</CardTitle>
                  {isOwner && (
                    <Button size="sm">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add Student
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {students.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-muted-foreground mb-2">
                      No students enrolled yet
                    </h3>
                    <p className="text-muted-foreground">
                      Students will appear here once they join the cohort
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {students.map((student) => (
                      <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{student.name}</h4>
                          <p className="text-sm text-muted-foreground flex items-center">
                            <Mail className="h-4 w-4 mr-1" />
                            {student.email}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Joined {new Date(student.joined_at).toLocaleDateString()}
                          </p>
                        </div>
                        {isOwner && (
                          <Button variant="outline" size="sm">
                            View Progress
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {isCoachOrAdmin && (
            <TabsContent value="progress" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Student Progress</CardTitle>
                  <CardDescription>
                    Track how students are progressing through the curriculum
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    Progress tracking coming soon...
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {isCoachOrAdmin && (
            <TabsContent value="lessons" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Curriculum & Lessons</CardTitle>
                  <CardDescription>
                    Manage the learning content for this cohort
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    Lesson management coming soon...
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  )
}

END COMMENTED OUT CODE */