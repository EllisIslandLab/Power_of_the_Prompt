"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  BarChart3,
  TrendingUp,
  Mail,
  Eye,
  MousePointer,
  Users,
  Calendar,
  Target
} from "lucide-react"

interface Campaign {
  id: string
  subject: string
  status: string
  recipient_count: number
  sent_count: number
  opened_count: number
  clicked_count: number
  sent_at?: string
  created_at: string
}

interface CampaignStatsProps {
  campaigns: Campaign[]
}

export function CampaignStats({ campaigns }: CampaignStatsProps) {
  const sentCampaigns = campaigns.filter(c => c.status === 'sent')
  const totalSent = sentCampaigns.reduce((sum, c) => sum + c.sent_count, 0)
  const totalOpened = sentCampaigns.reduce((sum, c) => sum + c.opened_count, 0)
  const totalClicked = sentCampaigns.reduce((sum, c) => sum + c.clicked_count, 0)

  const avgOpenRate = totalSent > 0 ? (totalOpened / totalSent) * 100 : 0
  const avgClickRate = totalSent > 0 ? (totalClicked / totalSent) * 100 : 0
  const avgClickToOpenRate = totalOpened > 0 ? (totalClicked / totalOpened) * 100 : 0

  // Get campaigns from last 30 days
  const last30Days = new Date()
  last30Days.setDate(last30Days.getDate() - 30)

  const recentCampaigns = sentCampaigns.filter(c =>
    c.sent_at && new Date(c.sent_at) > last30Days
  )

  const recentSent = recentCampaigns.reduce((sum, c) => sum + c.sent_count, 0)
  const recentOpened = recentCampaigns.reduce((sum, c) => sum + c.opened_count, 0)

  // Best performing campaigns
  const topCampaigns = sentCampaigns
    .filter(c => c.sent_count > 0)
    .map(c => ({
      ...c,
      openRate: (c.opened_count / c.sent_count) * 100,
      clickRate: (c.clicked_count / c.sent_count) * 100
    }))
    .sort((a, b) => b.openRate - a.openRate)
    .slice(0, 5)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Campaign Analytics</h2>
        <p className="text-muted-foreground">Performance metrics for your email campaigns</p>
      </div>

      {/* Overview Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Mail className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{totalSent.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Total Emails Sent</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Eye className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{avgOpenRate.toFixed(1)}%</div>
                <div className="text-sm text-muted-foreground">Average Open Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <MousePointer className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{avgClickRate.toFixed(1)}%</div>
                <div className="text-sm text-muted-foreground">Average Click Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Target className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{sentCampaigns.length}</div>
                <div className="text-sm text-muted-foreground">Campaigns Sent</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Performance */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Last 30 Days
            </CardTitle>
            <CardDescription>Recent campaign performance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="text-2xl font-bold text-blue-600">{recentCampaigns.length}</div>
                <div className="text-sm text-muted-foreground">Campaigns Sent</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-green-600">{recentSent.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Emails Delivered</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-purple-600">
                  {recentSent > 0 ? ((recentOpened / recentSent) * 100).toFixed(1) : '0'}%
                </div>
                <div className="text-sm text-muted-foreground">Open Rate</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-orange-600">{avgClickToOpenRate.toFixed(1)}%</div>
                <div className="text-sm text-muted-foreground">Click-to-Open</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Industry Benchmarks
            </CardTitle>
            <CardDescription>How you compare to industry averages</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Open Rate</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{avgOpenRate.toFixed(1)}%</span>
                  <Badge variant={avgOpenRate > 20 ? "default" : "secondary"}>
                    {avgOpenRate > 20 ? "Above" : "Below"} Average
                  </Badge>
                </div>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full"
                  style={{ width: `${Math.min(avgOpenRate / 30 * 100, 100)}%` }}
                />
              </div>
              <div className="text-xs text-muted-foreground">Industry average: 20-22%</div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Click Rate</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{avgClickRate.toFixed(1)}%</span>
                  <Badge variant={avgClickRate > 2.5 ? "default" : "secondary"}>
                    {avgClickRate > 2.5 ? "Above" : "Below"} Average
                  </Badge>
                </div>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full"
                  style={{ width: `${Math.min(avgClickRate / 5 * 100, 100)}%` }}
                />
              </div>
              <div className="text-xs text-muted-foreground">Industry average: 2.5-3%</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Campaigns */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Top Performing Campaigns
          </CardTitle>
          <CardDescription>Your most successful email campaigns by open rate</CardDescription>
        </CardHeader>
        <CardContent>
          {topCampaigns.length === 0 ? (
            <div className="text-center py-8">
              <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No sent campaigns to analyze yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {topCampaigns.map((campaign, index) => (
                <div key={campaign.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-semibold">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-medium">{campaign.subject}</h4>
                      <div className="text-sm text-muted-foreground">
                        Sent to {campaign.sent_count.toLocaleString()} recipients
                        {campaign.sent_at && (
                          <> • {new Date(campaign.sent_at).toLocaleDateString()}</>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-green-600">
                      {campaign.openRate.toFixed(1)}%
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {campaign.clickRate.toFixed(1)}% click rate
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}