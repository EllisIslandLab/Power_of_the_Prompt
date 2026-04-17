"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, Circle, Clock, AlertCircle, Play } from "lucide-react"
import { createBrowserClient } from '@supabase/ssr'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Milestone {
  id: string
  title: string
  description: string
  status: 'pending' | 'in_progress' | 'completed' | 'blocked'
  category: string
  order_index: number
  completed_at: string | null
}

interface VideoProgress {
  id: string
  video_id: string
  video_title: string
  watched: boolean
  watch_percentage: number
  last_watched_at: string | null
}

export function ProgressTracker({ userId }: { userId: string }) {
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [videos, setVideos] = useState<VideoProgress[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProgress()
  }, [userId])

  async function loadProgress() {
    try {
      // Load milestones
      const { data: milestonesData } = await supabase
        .from('project_milestones')
        .select('*')
        .eq('user_id', userId)
        .order('order_index', { ascending: true })

      if (milestonesData) {
        setMilestones(milestonesData)
      }

      // Load video progress
      const { data: videosData } = await supabase
        .from('video_progress')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true })

      if (videosData) {
        setVideos(videosData)
      }
    } catch (error) {
      console.error('Error loading progress:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case 'in_progress':
        return <Clock className="h-5 w-5 text-blue-500" />
      case 'blocked':
        return <AlertCircle className="h-5 w-5 text-red-500" />
      default:
        return <Circle className="h-5 w-5 text-muted-foreground" />
    }
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      completed: 'bg-green-100 text-green-800 border-green-200',
      in_progress: 'bg-blue-100 text-blue-800 border-blue-200',
      blocked: 'bg-red-100 text-red-800 border-red-200',
      pending: 'bg-gray-100 text-gray-800 border-gray-200'
    }
    return (
      <Badge className={styles[status as keyof typeof styles] || styles.pending}>
        {status.replace('_', ' ')}
      </Badge>
    )
  }

  const completedMilestones = milestones.filter(m => m.status === 'completed').length
  const totalMilestones = milestones.length
  const progressPercentage = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0

  const watchedVideos = videos.filter(v => v.watched).length
  const totalVideos = videos.length
  const videoProgressPercentage = totalVideos > 0 ? (watchedVideos / totalVideos) * 100 : 0

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Project Progress</CardTitle>
          <CardDescription>Track your website development journey</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Milestones</span>
              <span className="text-muted-foreground">{completedMilestones} / {totalMilestones}</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>

          {totalVideos > 0 && (
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Tutorial Videos</span>
                <span className="text-muted-foreground">{watchedVideos} / {totalVideos}</span>
              </div>
              <Progress value={videoProgressPercentage} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Milestones */}
      {milestones.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Project Milestones</CardTitle>
            <CardDescription>Key checkpoints in your website development</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {milestones.map((milestone) => (
                <div
                  key={milestone.id}
                  className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="mt-0.5">
                    {getStatusIcon(milestone.status)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="font-medium">{milestone.title}</h4>
                      {getStatusBadge(milestone.status)}
                    </div>
                    {milestone.description && (
                      <p className="text-sm text-muted-foreground">{milestone.description}</p>
                    )}
                    {milestone.category && (
                      <span className="text-xs text-muted-foreground mt-1 inline-block">
                        {milestone.category}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Video Progress */}
      {videos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Tutorial Videos</CardTitle>
            <CardDescription>Your custom learning materials</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {videos.map((video) => (
                <div
                  key={video.id}
                  className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className={video.watched ? 'text-green-500' : 'text-muted-foreground'}>
                    {video.watched ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <Play className="h-5 w-5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{video.video_title || `Video ${video.video_id}`}</p>
                    {video.watch_percentage > 0 && !video.watched && (
                      <div className="mt-1">
                        <Progress value={video.watch_percentage} className="h-1" />
                      </div>
                    )}
                  </div>
                  {video.watched && (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      Completed
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {milestones.length === 0 && videos.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Circle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Progress Yet</h3>
            <p className="text-muted-foreground">
              Your project milestones and tutorial videos will appear here once they&apos;re set up.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
