/*
COMMENTED OUT - Complex admin cohort creation page
This page contains complex admin functionality that may interfere with the new authentication system.
Commented out during auth transition - can be re-enabled later when admin functionality is needed.

Original functionality: Admin page for creating new student cohorts with form validation,
database integration, and complex permission checking.
*/

export default function NewCohortPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground mb-4">Page Temporarily Unavailable</h1>
        <p className="text-muted-foreground">This admin feature is currently disabled during system updates.</p>
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { ArrowLeft, Save } from "lucide-react"

export default function NewCohortPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'DRAFT',
    start_date: '',
    end_date: '',
    max_students: 20
  })

  useEffect(() => {
    if (loading) return
    if (!user) router.push("/signin")
    if (user && user.userType === 'student') {
      router.push("/portal/cohorts")
    }
  }, [user, loading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.id) return

    setSaving(true)
    try {
      const supabase = getSupabase()
      // Note: cohorts table doesn't exist yet, using placeholder for coming soon page
      const data = { 
        id: `cohort-${Date.now()}`,
        ...formData,
        coach_id: user.id,
        current_students: 0
      }
      const error = null // Simulate success for coming soon page

      if (error) throw error

      router.push(`/portal/cohorts/${data.id}`)
    } catch (error) {
      console.error('Error creating cohort:', error)
      alert('Failed to create cohort. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user || user.userType === 'student') return null

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-12 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-2xl">
        {/* Header *}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/portal/cohorts">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Cohorts
              </Link>
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Create New Cohort
          </h1>
          <p className="text-muted-foreground">
            Set up a new learning group for your students
          </p>
        </div>

        {/* Form *}
        <Card>
          <CardHeader>
            <CardTitle>Cohort Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="name">Cohort Name *</Label>
                <Input
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g., Web Development Bootcamp - Fall 2024"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Describe what students will learn in this cohort..."
                  rows={4}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_date">Start Date</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                  />
                </div>

                <div>
                  <Label htmlFor="end_date">End Date</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="max_students">Max Students</Label>
                  <Input
                    id="max_students"
                    type="number"
                    min="1"
                    max="100"
                    value={formData.max_students}
                    onChange={(e) => setFormData({...formData, max_students: parseInt(e.target.value)})}
                  />
                </div>

                <div>
                  <Label htmlFor="status">Initial Status</Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(value) => setFormData({...formData, status: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DRAFT">Draft</SelectItem>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <Button type="submit" disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Creating...' : 'Create Cohort'}
                </Button>
                <Button variant="outline" type="button" asChild>
                  <Link href="/portal/cohorts">Cancel</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

END COMMENTED OUT CODE */