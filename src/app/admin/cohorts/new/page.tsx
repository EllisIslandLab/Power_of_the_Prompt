"use client"

import { useState } from "react"
import { createBrowserClient } from '@supabase/ssr'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"
import { ArrowLeft, Save } from "lucide-react"
import { useRouter } from "next/navigation"

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function NewCohortPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [startDate, setStartDate] = useState('')
  const [durationWeeks, setDurationWeeks] = useState(8)
  const [isActive, setIsActive] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSaving(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('Not authenticated')
        return
      }

      const { error: insertError } = await supabase
        .from('cohorts')
        .insert({
          name,
          title,
          description,
          start_date: startDate,
          duration_weeks: durationWeeks,
          is_active: isActive,
          created_by: user.id
        })

      if (insertError) {
        setError(insertError.message)
      } else {
        router.push('/admin/cohorts')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create cohort')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 p-4">
      <div className="container mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold">Create New Cohort</h1>
            <Button variant="outline" asChild>
              <Link href="/admin/cohorts">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Cohorts
              </Link>
            </Button>
          </div>
          <p className="text-muted-foreground">
            Create a new cohort to organize students into learning groups
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Cohort Details</CardTitle>
              <CardDescription>
                Enter the information for your new cohort. The end date will be automatically calculated based on the start date and duration.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {error && (
                <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded">
                  {error}
                </div>
              )}

              {/* Cohort Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Cohort Name *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Ramsey Preferred Coaching"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  A unique identifier for this cohort (e.g., sponsor name, season, batch number)
                </p>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Cohort Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Financial Coaching Websites"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  The focus or theme of this cohort's curriculum
                </p>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="A brief description of this cohort, its goals, and target audience..."
                  rows={4}
                />
                <p className="text-xs text-muted-foreground">
                  Optional: Provide context about this cohort for students and administrators
                </p>
              </div>

              {/* Start Date */}
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  The first day of the cohort (e.g., November 3, 2025)
                </p>
              </div>

              {/* Duration */}
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (weeks) *</Label>
                <Input
                  id="duration"
                  type="number"
                  min="1"
                  max="52"
                  value={durationWeeks}
                  onChange={(e) => setDurationWeeks(parseInt(e.target.value))}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Typically 8 weeks. End date will be calculated automatically.
                </p>
              </div>

              {/* Active Status */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <div>
                  <Label htmlFor="isActive" className="cursor-pointer">
                    Set as Active Cohort
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    New student signups will automatically join the active cohort. Only one cohort can be active at a time.
                  </p>
                </div>
              </div>

              {/* Summary Info */}
              {startDate && (
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Cohort Summary</h4>
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="text-muted-foreground">Start:</span>{' '}
                      {new Date(startDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                    <p>
                      <span className="text-muted-foreground">End:</span>{' '}
                      {new Date(new Date(startDate).getTime() + durationWeeks * 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Total Duration:</span> {durationWeeks} weeks ({durationWeeks * 7} days)
                    </p>
                  </div>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={saving || !name || !title || !startDate}
                  className="flex-1"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Creating...' : 'Create Cohort'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/admin/cohorts')}
                  disabled={saving}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  )
}
