"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Mail,
  Users,
  BarChart3,
  UserPlus,
  Wrench,
  TrendingUp,
  Send,
  Eye,
  Calendar,
  Plus,
  ArrowRight,
  Activity
} from "lucide-react"

interface DashboardStats {
  campaigns: {
    total: number
    sent: number
    drafts: number
    totalEmails: number
    avgOpenRate: number
  }
  leads: {
    total: number
    recent: number
    sources: Record<string, number>
  }
  services: {
    total: number
    active: number
    synced: number
  }
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [recentCampaigns, setRecentCampaigns] = useState<any[]>([])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)

      // Fetch all data in parallel for better performance
      const [campaignsResponse, leadsResponse, servicesResponse] = await Promise.all([
        fetch('/api/admin/campaigns?limit=5'),
        fetch('/api/admin/leads?limit=100'),
        fetch('/api/services')
      ])

      const [campaignsData, leadsData, servicesData] = await Promise.all([
        campaignsResponse.json(),
        leadsResponse.json(),
        servicesResponse.json()
      ])

      if (campaignsData.success && leadsData.success && servicesData.success) {
        const campaigns = campaignsData.campaigns || []
        const leads = leadsData.leads || []
        const services = servicesData.data || []

        // Calculate campaign stats
        const sentCampaigns = campaigns.filter((c: any) => c.status === 'sent')
        const totalEmails = sentCampaigns.reduce((sum: number, c: any) => sum + c.sent_count, 0)
        const totalOpened = sentCampaigns.reduce((sum: number, c: any) => sum + c.opened_count, 0)
        const avgOpenRate = totalEmails > 0 ? (totalOpened / totalEmails) * 100 : 0

        // Calculate lead sources
        const sources = leads.reduce((acc: Record<string, number>, lead: any) => {
          acc[lead.source || 'unknown'] = (acc[lead.source || 'unknown'] || 0) + 1
          return acc
        }, {})

        // Recent leads (last 7 days)
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        const recentLeads = leads.filter((lead: any) =>
          new Date(lead.signup_date) > weekAgo
        )

        setStats({
          campaigns: {
            total: campaigns.length,
            sent: sentCampaigns.length,
            drafts: campaigns.filter((c: any) => c.status === 'draft').length,
            totalEmails,
            avgOpenRate
          },
          leads: {
            total: leads.length,
            recent: recentLeads.length,
            sources
          },
          services: {
            total: services.length,
            active: services.filter((s: any) => s.is_active).length,
            synced: services.filter((s: any) => s.stripe_price_id && s.stripe_product_id).length
          }
        })

        setRecentCampaigns(campaigns.slice(0, 3))
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening with your campaigns and leads.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild>
            <Link href="/admin/campaigns">
              <Plus className="h-4 w-4 mr-2" />
              New Campaign
            </Link>
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Mail className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats?.campaigns.totalEmails.toLocaleString() || 0}</div>
                <div className="text-sm text-muted-foreground">Emails Sent</div>
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
                <div className="text-2xl font-bold">{stats?.campaigns.avgOpenRate.toFixed(1) || 0}%</div>
                <div className="text-sm text-muted-foreground">Avg Open Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats?.leads.total.toLocaleString() || 0}</div>
                <div className="text-sm text-muted-foreground">Total Leads</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats?.leads.recent || 0}</div>
                <div className="text-sm text-muted-foreground">New This Week</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Campaigns */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Recent Campaigns
                </CardTitle>
                <CardDescription>Your latest email campaigns</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/admin/campaigns">
                  View All
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recentCampaigns.length === 0 ? (
              <div className="text-center py-8">
                <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No campaigns yet</p>
                <Button asChild>
                  <Link href="/admin/campaigns">
                    Create Your First Campaign
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {recentCampaigns.map((campaign) => (
                  <div key={campaign.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm">{campaign.subject}</h4>
                        <Badge variant={
                          campaign.status === 'sent' ? 'default' :
                          campaign.status === 'draft' ? 'secondary' :
                          'destructive'
                        } className="text-xs">
                          {campaign.status}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {campaign.status === 'sent' ? (
                          <>
                            Sent to {campaign.sent_count.toLocaleString()} recipients •{' '}
                            {((campaign.opened_count / campaign.sent_count) * 100).toFixed(1)}% open rate
                          </>
                        ) : (
                          <>Ready for {campaign.recipient_count.toLocaleString()} recipients</>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(campaign.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* System Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              System Overview
            </CardTitle>
            <CardDescription>Quick system health and metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Campaign Stats */}
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Send className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Campaigns</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold">{stats?.campaigns.total || 0} total</div>
                <div className="text-xs text-muted-foreground">
                  {stats?.campaigns.drafts || 0} drafts
                </div>
              </div>
            </div>

            {/* Services Stats */}
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Wrench className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Services</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold">{stats?.services.active || 0} active</div>
                <div className="text-xs text-muted-foreground">
                  {stats?.services.synced || 0} synced with Stripe
                </div>
              </div>
            </div>

            {/* Lead Sources */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Lead Sources</h4>
              <div className="space-y-1">
                {Object.entries(stats?.leads.sources || {}).map(([source, count]) => (
                  <div key={source} className="flex justify-between items-center text-sm">
                    <span className="capitalize">{source.replace('_', ' ')}</span>
                    <span className="font-medium">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="pt-4 border-t">
              <h4 className="text-sm font-medium mb-2">Quick Actions</h4>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/admin/invites">
                    <UserPlus className="h-3 w-3 mr-1" />
                    Invite
                  </Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/admin/services">
                    <Wrench className="h-3 w-3 mr-1" />
                    Services
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaign Performance Insights */}
      {stats && stats.campaigns.total > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Performance Insights
            </CardTitle>
            <CardDescription>How your campaigns are performing</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{stats.campaigns.avgOpenRate.toFixed(1)}%</div>
                <div className="text-sm text-muted-foreground">Average Open Rate</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {stats.campaigns.avgOpenRate > 20 ? '🟢 Above industry average' : '🟡 Below industry average (20%)'}
                </div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{stats.campaigns.sent}</div>
                <div className="text-sm text-muted-foreground">Campaigns Sent</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {stats.campaigns.drafts > 0 && `${stats.campaigns.drafts} drafts pending`}
                </div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{Math.round(stats.campaigns.totalEmails / (stats.campaigns.sent || 1))}</div>
                <div className="text-sm text-muted-foreground">Avg Recipients</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Per campaign
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}