/*
COMMENTED OUT - Complex cohorts management page with database queries
This page contains complex authentication logic and database dependencies that may interfere with the new authentication system.
Commented out during auth transition - can be re-enabled later when cohort functionality is needed.

Original functionality: Cohort listing and management page with role-based filtering,
database queries for cohort data, and complex admin/coach permissions.
*/

export default function CohortsPage() {
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

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { getSupabase } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Users, Calendar, UserPlus, Settings, ArrowLeft } from "lucide-react"

interface Cohort {
  id: string
  name: string
  description: string
  status: 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'
  start_date: string
  end_date: string
  max_students: number
  current_students: number
  coach_id: string
}

export default function CohortsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [cohorts, setCohorts] = useState<Cohort[]>([])
  const [loadingCohorts, setLoadingCohorts] = useState(true)

  useEffect(() => {
    if (loading) return
    if (!user) router.push("/signin")
    else loadCohorts()
  }, [user, loading, router])

  const loadCohorts = async () => {
    try {
      console.log('Attempting to load cohorts...')
      const supabase = getSupabase()
      const { data, error } = await supabase
        .from('cohorts')
        .select('*')
        .order('created_at', { ascending: false })

      console.log('Supabase response:', { data, error })
      if (error) {
        console.error('Supabase error details:', error)
        throw error
      }
      setCohorts((data as unknown as Cohort[]) || [])
    } catch (error) {
      console.error('Error loading cohorts:', error)
      // Show error to user for debugging
      alert(`Error loading cohorts: ${(error as Error)?.message || error}`)
    } finally {
      setLoadingCohorts(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'default'
      case 'DRAFT': return 'secondary'
      case 'COMPLETED': return 'outline'
      case 'CANCELLED': return 'destructive'
      default: return 'secondary'
    }
  }

  if (loading || loadingCohorts) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading cohorts...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  const isCoachOrAdmin = user.adminProfile?.role === 'Super Admin' || user.adminProfile?.role === 'Admin'

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
            {isCoachOrAdmin ? 'Cohort Management' : 'Available Cohorts'}
          </h1>
          <p className="text-muted-foreground">
            {isCoachOrAdmin 
              ? 'Manage your student cohorts and track progress'
              : 'Join a cohort to learn with other students'
            }
          </p>
        </div>

        {/* Actions */}
        {isCoachOrAdmin && (
          <div className="mb-6">
            <Button asChild>
              <Link href="/portal/cohorts/new">
                <UserPlus className="h-4 w-4 mr-2" />
                Create New Cohort
              </Link>
            </Button>
          </div>
        )}

        {/* Cohorts Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cohorts.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                {isCoachOrAdmin ? 'No cohorts yet' : 'No cohorts available'}
              </h3>
              <p className="text-muted-foreground">
                {isCoachOrAdmin 
                  ? 'Create your first cohort to start managing students'
                  : 'Check back later for available cohorts to join'
                }
              </p>
            </div>
          ) : (
            cohorts.map((cohort) => (
              <Card key={cohort.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{cohort.name}</CardTitle>
                    <Badge variant={getStatusColor(cohort.status)}>
                      {cohort.status}
                    </Badge>
                  </div>
                  <CardDescription className="line-clamp-2">
                    {cohort.description || 'No description provided'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-2" />
                      {cohort.start_date ? new Date(cohort.start_date).toLocaleDateString() : 'TBD'}
                      {cohort.end_date && ` - ${new Date(cohort.end_date).toLocaleDateString()}`}
                    </div>
                    
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Users className="h-4 w-4 mr-2" />
                      {cohort.current_students}/{cohort.max_students} students
                    </div>

                    <div className="flex gap-2 pt-2">
                      {isCoachOrAdmin ? (
                        <Button size="sm" asChild>
                          <Link href={`/portal/cohorts/${cohort.id}`}>
                            <Settings className="h-4 w-4 mr-1" />
                            Manage
                          </Link>
                        </Button>
                      ) : (
                        cohort.status === 'ACTIVE' && cohort.current_students < cohort.max_students && (
                          <Button size="sm" asChild>
                            <Link href={`/portal/cohorts/${cohort.id}/join`}>
                              <UserPlus className="h-4 w-4 mr-1" />
                              Join
                            </Link>
                          </Button>
                        )
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

END COMMENTED OUT CODE */