"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from '@supabase/ssr'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import {
  Users,
  Calendar,
  Edit2,
  Save,
  X,
  ArrowLeft,
  UserPlus,
  UserMinus,
  Mail,
  Shield
} from "lucide-react"
import { useParams, useRouter } from "next/navigation"

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
}

interface CohortMember {
  user_id: string
  cohort_id: string
  joined_at: string
  status: string
  completion_percentage: number
  user: {
    full_name: string
    email: string
    role: string
  }
}

export default function CohortDetailPage() {
  const params = useParams()
  const router = useRouter()
  const cohortId = params.id as string

  const [cohort, setCohort] = useState<Cohort | null>(null)
  const [members, setMembers] = useState<CohortMember[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Edit form state
  const [editName, setEditName] = useState('')
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')

  useEffect(() => {
    loadCohort()
    loadMembers()
  }, [cohortId])

  async function loadCohort() {
    const { data, error } = await supabase
      .from('cohorts')
      .select('*')
      .eq('id', cohortId)
      .single()

    if (data && !error) {
      setCohort(data)
      setEditName(data.name)
      setEditTitle(data.title)
      setEditDescription(data.description || '')
    }
    setLoading(false)
  }

  async function loadMembers() {
    const { data, error } = await supabase
      .from('cohort_members')
      .select(`
        *,
        user:users!cohort_members_user_id_fkey(full_name, email, role)
      `)
      .eq('cohort_id', cohortId)
      .order('joined_at', { ascending: false })

    if (data && !error) {
      setMembers(data as any)
    }
  }

  async function handleSave() {
    if (!cohort) return
    setSaving(true)
    setError(null)

    const { error: updateError } = await supabase
      .from('cohorts')
      .update({
        name: editName,
        title: editTitle,
        description: editDescription
      })
      .eq('id', cohortId)

    if (updateError) {
      setError(updateError.message)
    } else {
      await loadCohort()
      setEditing(false)
    }
    setSaving(false)
  }

  async function setActiveStatus(isActive: boolean) {
    const { error: updateError } = await supabase
      .from('cohorts')
      .update({ is_active: isActive })
      .eq('id', cohortId)

    if (!updateError) {
      await loadCohort()
    }
  }

  async function removeMember(userId: string) {
    if (!confirm('Are you sure you want to remove this student from the cohort?')) return

    const { error } = await supabase
      .from('cohort_members')
      .delete()
      .eq('cohort_id', cohortId)
      .eq('user_id', userId)

    if (!error) {
      await loadMembers()
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getStatusBadge = (status: string) => {
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading cohort...</p>
        </div>
      </div>
    )
  }

  if (!cohort) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg mb-4">Cohort not found</p>
          <Button asChild>
            <Link href="/admin/cohorts">Back to Cohorts</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 p-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold">Cohort Details</h1>
            <Button variant="outline" asChild>
              <Link href="/admin/cohorts">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Cohorts
              </Link>
            </Button>
          </div>
          <p className="text-muted-foreground">
            Manage cohort settings and member list
          </p>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Cohort Info */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {editing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Cohort Name</label>
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Title</label>
                      <Input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Description</label>
                      <Input
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-2xl">{cohort.name}</CardTitle>
                      {cohort.is_active && <Badge className="bg-green-500">Active</Badge>}
                    </div>
                    <CardDescription className="text-base">{cohort.title}</CardDescription>
                    {cohort.description && (
                      <p className="text-sm text-muted-foreground mt-2">{cohort.description}</p>
                    )}
                  </>
                )}
              </div>
              <div className="flex gap-2 ml-4">
                {editing ? (
                  <>
                    <Button onClick={handleSave} disabled={saving}>
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                    <Button variant="outline" onClick={() => setEditing(false)} disabled={saving}>
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button onClick={() => setEditing(true)}>
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-6">
              <div>
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">Start Date</span>
                </div>
                <p className="font-medium">{formatDate(cohort.start_date)}</p>
              </div>
              <div>
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">End Date</span>
                </div>
                <p className="font-medium">{formatDate(cohort.end_date)}</p>
              </div>
              <div>
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Users className="h-4 w-4" />
                  <span className="text-sm">Total Students</span>
                </div>
                <p className="font-medium">{members.length}</p>
              </div>
              <div>
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">Duration</span>
                </div>
                <p className="font-medium">{cohort.duration_weeks} weeks</p>
              </div>
            </div>

            {!cohort.is_active && (
              <div className="mt-6 pt-6 border-t">
                <Button
                  onClick={() => setActiveStatus(true)}
                  variant="outline"
                >
                  Set as Active Cohort
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  New student signups will automatically join the active cohort
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Members List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Cohort Members</CardTitle>
                <CardDescription>
                  Students enrolled in this cohort ({members.length})
                </CardDescription>
              </div>
              <Button variant="outline" disabled>
                <UserPlus className="h-4 w-4 mr-2" />
                Add Student
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {members.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No students enrolled yet</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Students will automatically join when they sign up if this is the active cohort
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {members.map((member) => (
                  <div
                    key={member.user_id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        {member.user.role === 'admin' ? (
                          <Shield className="h-5 w-5 text-primary" />
                        ) : (
                          <Users className="h-5 w-5 text-primary" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{member.user.full_name || 'Unknown'}</p>
                          {getStatusBadge(member.status)}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          <span>{member.user.email}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right text-sm">
                        <p className="text-muted-foreground">Joined</p>
                        <p className="font-medium">
                          {new Date(member.joined_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeMember(member.user_id)}
                      >
                        <UserMinus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
