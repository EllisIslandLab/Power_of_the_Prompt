"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Gauge, Accessibility, Shield, Search, Smartphone } from "lucide-react"
import { createBrowserClient } from '@supabase/ssr'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface LighthouseScore {
  page_id: string
  page_name: string
  page_path: string
  performance: number | null
  accessibility: number | null
  best_practices: number | null
  seo: number | null
  pwa: number | null
  overall_score: number | null
  tested_at: string | null
}

export function LighthouseScores({ userId }: { userId: string }) {
  const [scores, setScores] = useState<LighthouseScore[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadScores()
  }, [userId])

  async function loadScores() {
    try {
      const { data, error } = await supabase
        .rpc('get_latest_lighthouse_scores', { p_user_id: userId })

      if (error) {
        console.error('Error loading scores:', error)
      } else if (data) {
        setScores(data)
      }
    } catch (error) {
      console.error('Error loading scores:', error)
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (score: number | null) => {
    if (score === null) return 'text-gray-400'
    if (score >= 90) return 'text-green-600'
    if (score >= 50) return 'text-orange-600'
    return 'text-red-600'
  }

  const getScoreBadge = (score: number | null) => {
    if (score === null) return 'bg-gray-100 text-gray-600'
    if (score >= 90) return 'bg-green-100 text-green-800 border-green-200'
    if (score >= 50) return 'bg-orange-100 text-orange-800 border-orange-200'
    return 'bg-red-100 text-red-800 border-red-200'
  }

  const averageScore = scores.length > 0
    ? Math.round(scores.reduce((sum, s) => sum + (s.overall_score || 0), 0) / scores.length)
    : null

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

  if (scores.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gauge className="h-5 w-5" />
            Lighthouse Scores
          </CardTitle>
          <CardDescription>Performance metrics for your website pages</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Gauge className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No Lighthouse scores yet</p>
            <p className="text-sm mt-1">Scores will appear once your website has been tested</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Gauge className="h-5 w-5" />
              Lighthouse Scores
            </CardTitle>
            <CardDescription>Performance metrics for your website pages</CardDescription>
          </div>
          {averageScore !== null && (
            <div className="text-right">
              <div className="text-3xl font-bold" style={{ color: getScoreColor(averageScore).replace('text-', '') }}>
                {averageScore}
              </div>
              <div className="text-xs text-muted-foreground">Average</div>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {scores.map((score) => (
          <div key={score.page_id} className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">{score.page_name}</h4>
                <p className="text-xs text-muted-foreground">{score.page_path}</p>
              </div>
              {score.overall_score !== null && (
                <Badge className={getScoreBadge(score.overall_score)}>
                  {score.overall_score}/100
                </Badge>
              )}
            </div>

            {score.tested_at && (
              <p className="text-xs text-muted-foreground">
                Last tested: {new Date(score.tested_at).toLocaleDateString()}
              </p>
            )}

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Gauge className="h-3 w-3" />
                  <span>Performance</span>
                </div>
                {score.performance !== null ? (
                  <>
                    <Progress value={score.performance} className="h-2" />
                    <p className={`text-xs font-medium ${getScoreColor(score.performance)}`}>
                      {score.performance}
                    </p>
                  </>
                ) : (
                  <p className="text-xs text-gray-400">Not tested</p>
                )}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Accessibility className="h-3 w-3" />
                  <span>Accessibility</span>
                </div>
                {score.accessibility !== null ? (
                  <>
                    <Progress value={score.accessibility} className="h-2" />
                    <p className={`text-xs font-medium ${getScoreColor(score.accessibility)}`}>
                      {score.accessibility}
                    </p>
                  </>
                ) : (
                  <p className="text-xs text-gray-400">Not tested</p>
                )}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Shield className="h-3 w-3" />
                  <span>Best Practices</span>
                </div>
                {score.best_practices !== null ? (
                  <>
                    <Progress value={score.best_practices} className="h-2" />
                    <p className={`text-xs font-medium ${getScoreColor(score.best_practices)}`}>
                      {score.best_practices}
                    </p>
                  </>
                ) : (
                  <p className="text-xs text-gray-400">Not tested</p>
                )}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Search className="h-3 w-3" />
                  <span>SEO</span>
                </div>
                {score.seo !== null ? (
                  <>
                    <Progress value={score.seo} className="h-2" />
                    <p className={`text-xs font-medium ${getScoreColor(score.seo)}`}>
                      {score.seo}
                    </p>
                  </>
                ) : (
                  <p className="text-xs text-gray-400">Not tested</p>
                )}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Smartphone className="h-3 w-3" />
                  <span>PWA</span>
                </div>
                {score.pwa !== null ? (
                  <>
                    <Progress value={score.pwa} className="h-2" />
                    <p className={`text-xs font-medium ${getScoreColor(score.pwa)}`}>
                      {score.pwa}
                    </p>
                  </>
                ) : (
                  <p className="text-xs text-gray-400">Not tested</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
