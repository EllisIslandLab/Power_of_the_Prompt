"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Plus,
  Send,
  Eye,
  BarChart3,
  Users,
  Calendar,
  Mail,
  Clock,
  CheckCircle,
  AlertTriangle,
  RefreshCw
} from "lucide-react"
import { CampaignComposer } from "@/components/admin/CampaignComposer"
import { CampaignHistory } from "@/components/admin/CampaignHistory"
import { CampaignStats } from "@/components/admin/CampaignStats"

interface Campaign {
  id: string
  subject: string
  content: string
  status: 'draft' | 'sending' | 'sent' | 'failed'
  recipient_count: number
  sent_count: number
  opened_count: number
  clicked_count: number
  target_audience: any
  scheduled_at?: string
  sent_at?: string
  created_at: string
  created_by: string
}

export default function AdminCampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  const [showComposer, setShowComposer] = useState(false)

  useEffect(() => {
    fetchCampaigns()
  }, [])

  const fetchCampaigns = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/campaigns')
      const data = await response.json()

      if (data.success) {
        setCampaigns(data.campaigns)
      }
    } catch (error) {
      console.error('Failed to fetch campaigns:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Draft</Badge>
      case 'sending':
        return <Badge className="bg-blue-100 text-blue-800"><Send className="h-3 w-3 mr-1" />Sending</Badge>
      case 'sent':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Sent</Badge>
      case 'failed':
        return <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" />Failed</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const recentCampaigns = campaigns.slice(0, 5)
  const totalSent = campaigns.reduce((sum, campaign) => sum + campaign.sent_count, 0)
  const totalRecipients = campaigns.reduce((sum, campaign) => sum + campaign.recipient_count, 0)
  const avgOpenRate = campaigns.length > 0
    ? campaigns.reduce((sum, campaign) => {
        const rate = campaign.sent_count > 0 ? (campaign.opened_count / campaign.sent_count) * 100 : 0
        return sum + rate
      }, 0) / campaigns.length
    : 0

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="grid md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Campaign Management</h1>
          <p className="text-muted-foreground">Send targeted email campaigns to your leads</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={fetchCampaigns} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setShowComposer(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Campaign
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="campaigns" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Campaigns
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="audience" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Audience
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Quick Stats */}
          <div className="grid md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{campaigns.length}</div>
                <div className="text-sm text-muted-foreground">Total Campaigns</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-600">{totalSent.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Emails Sent</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-blue-600">{avgOpenRate.toFixed(1)}%</div>
                <div className="text-sm text-muted-foreground">Avg Open Rate</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-purple-600">{totalRecipients.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Total Reach</div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Campaigns */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Recent Campaigns</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab("campaigns")}
                >
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {recentCampaigns.length === 0 ? (
                <div className="text-center py-8">
                  <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No campaigns yet</p>
                  <Button
                    onClick={() => setShowComposer(true)}
                    className="mt-4"
                  >
                    Create Your First Campaign
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentCampaigns.map((campaign) => (
                    <div key={campaign.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{campaign.subject}</h3>
                          {getStatusBadge(campaign.status)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {campaign.sent_count > 0 ? (
                            <>Sent to {campaign.sent_count.toLocaleString()} recipients</>
                          ) : (
                            <>Ready to send to {campaign.recipient_count.toLocaleString()} recipients</>
                          )}
                          {campaign.sent_at && (
                            <> • {new Date(campaign.sent_at).toLocaleDateString()}</>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {campaign.status === 'sent' && (
                          <div className="text-sm text-right">
                            <div className="font-medium">{((campaign.opened_count / campaign.sent_count) * 100).toFixed(1)}%</div>
                            <div className="text-muted-foreground">Open Rate</div>
                          </div>
                        )}
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="campaigns">
          <CampaignHistory
            campaigns={campaigns}
            onRefresh={fetchCampaigns}
            onNewCampaign={() => setShowComposer(true)}
          />
        </TabsContent>

        <TabsContent value="analytics">
          <CampaignStats campaigns={campaigns} />
        </TabsContent>

        <TabsContent value="audience">
          <Card>
            <CardHeader>
              <CardTitle>Audience Management</CardTitle>
              <CardDescription>Manage your email leads and segmentation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Audience management coming soon</p>
                <p className="text-sm text-muted-foreground mt-2">
                  This will show your leads, segmentation options, and unsubscribe management
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Campaign Composer Modal */}
      {showComposer && (
        <CampaignComposer
          onClose={() => setShowComposer(false)}
          onSuccess={() => {
            setShowComposer(false)
            fetchCampaigns()
          }}
        />
      )}
    </div>
  )
}