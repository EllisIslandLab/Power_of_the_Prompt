"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Plus,
  Send,
  Eye,
  Edit,
  MoreHorizontal,
  Search,
  Filter,
  Calendar,
  Mail,
  Clock,
  CheckCircle,
  AlertTriangle,
  Copy,
  Trash2
} from "lucide-react"
import { CampaignDetails } from "./CampaignDetails"

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

interface CampaignHistoryProps {
  campaigns: Campaign[]
  onRefresh: () => void
  onNewCampaign: () => void
  onEditCampaign: (campaign: Campaign) => void
}

export function CampaignHistory({ campaigns, onRefresh, onNewCampaign, onEditCampaign }: CampaignHistoryProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState("created_at")
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null)

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

  const handleSendCampaign = async (campaignId: string) => {
    if (!confirm('Are you sure you want to send this campaign? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch('/api/admin/campaigns/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ campaignId })
      })

      const data = await response.json()
      if (data.success) {
        alert(`Campaign sent successfully to ${data.sentCount} recipients`)
        onRefresh()
      } else {
        alert('Failed to send campaign: ' + data.error)
      }
    } catch (error) {
      alert('Failed to send campaign')
    }
  }

  const handleDuplicateCampaign = async (campaign: Campaign) => {
    try {
      const response = await fetch('/api/admin/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          subject: `Copy of ${campaign.subject}`,
          content: campaign.content,
          targetAudience: campaign.target_audience,
          createdBy: 'admin'
        })
      })

      const data = await response.json()
      if (data.success) {
        alert('Campaign duplicated successfully')
        onRefresh()
      } else {
        alert('Failed to duplicate campaign: ' + data.error)
      }
    } catch (error) {
      alert('Failed to duplicate campaign')
    }
  }

  const handleDeleteCampaign = async (campaignId: string, campaignSubject: string) => {
    if (!confirm(`Are you sure you want to delete "${campaignSubject}"? This action cannot be undone.`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/campaigns/delete?id=${campaignId}`, {
        method: 'DELETE'
      })

      const data = await response.json()
      if (data.success) {
        alert('Campaign deleted successfully')
        onRefresh()
      } else {
        alert('Failed to delete campaign: ' + data.error)
      }
    } catch (error) {
      alert('Failed to delete campaign')
    }
  }

  const filteredCampaigns = campaigns
    .filter(campaign => {
      const matchesSearch = campaign.subject.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      if (sortBy === 'created_at') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      } else if (sortBy === 'sent_at') {
        const aDate = a.sent_at ? new Date(a.sent_at).getTime() : 0
        const bDate = b.sent_at ? new Date(b.sent_at).getTime() : 0
        return bDate - aDate
      } else if (sortBy === 'recipient_count') {
        return b.recipient_count - a.recipient_count
      }
      return 0
    })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Campaign History</h2>
          <p className="text-muted-foreground">View and manage all your email campaigns</p>
        </div>
        <Button onClick={onNewCampaign}>
          <Plus className="h-4 w-4 mr-2" />
          New Campaign
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search campaigns..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="sending">Sending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at">Created Date</SelectItem>
                <SelectItem value="sent_at">Send Date</SelectItem>
                <SelectItem value="recipient_count">Recipients</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Campaigns List */}
      {filteredCampaigns.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No campaigns found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || statusFilter !== 'all'
                ? "Try adjusting your search or filters"
                : "Create your first email campaign to get started"
              }
            </p>
            <Button onClick={onNewCampaign}>
              <Plus className="h-4 w-4 mr-2" />
              Create Campaign
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredCampaigns.map((campaign) => (
            <Card key={campaign.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-3">
                    {/* Header */}
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold">{campaign.subject}</h3>
                      {getStatusBadge(campaign.status)}
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Recipients</div>
                        <div className="font-semibold">{campaign.recipient_count.toLocaleString()}</div>
                      </div>
                      {campaign.sent_count > 0 && (
                        <>
                          <div>
                            <div className="text-muted-foreground">Sent</div>
                            <div className="font-semibold">{campaign.sent_count.toLocaleString()}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Open Rate</div>
                            <div className="font-semibold">
                              {campaign.sent_count > 0
                                ? `${((campaign.opened_count / campaign.sent_count) * 100).toFixed(1)}%`
                                : 'N/A'
                              }
                            </div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Click Rate</div>
                            <div className="font-semibold">
                              {campaign.sent_count > 0
                                ? `${((campaign.clicked_count / campaign.sent_count) * 100).toFixed(1)}%`
                                : 'N/A'
                              }
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Dates */}
                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Created {new Date(campaign.created_at).toLocaleDateString()}
                      </div>
                      {campaign.sent_at && (
                        <div className="flex items-center gap-1">
                          <Send className="h-3 w-3" />
                          Sent {new Date(campaign.sent_at).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {campaign.status === 'draft' && (
                      <>
                        <Button
                          onClick={() => onEditCampaign(campaign)}
                          size="sm"
                          variant="outline"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          onClick={() => handleSendCampaign(campaign.id)}
                          size="sm"
                        >
                          <Send className="h-4 w-4 mr-1" />
                          Send
                        </Button>
                      </>
                    )}

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setSelectedCampaignId(campaign.id)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicateCampaign(campaign)}>
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDeleteCampaign(campaign.id, campaign.subject)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Campaign Details Dialog */}
      {selectedCampaignId && (
        <CampaignDetails
          campaignId={selectedCampaignId}
          onClose={() => setSelectedCampaignId(null)}
          onRefresh={onRefresh}
        />
      )}
    </div>
  )
}