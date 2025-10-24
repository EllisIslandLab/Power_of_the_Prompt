"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  CheckCircle,
  XCircle,
  Mail,
  RefreshCw,
  AlertTriangle,
  Download,
  Eye,
  Clock,
  FileText
} from "lucide-react"

interface CampaignDetailsProps {
  campaignId: string
  onClose: () => void
  onRefresh: () => void
}

interface SendStatus {
  email: string
  name: string
  status: 'sent' | 'failed' | 'pending'
  sent_at?: string
  error?: string
}

export function CampaignDetails({ campaignId, onClose, onRefresh }: CampaignDetailsProps) {
  const [loading, setLoading] = useState(true)
  const [campaign, setCampaign] = useState<any>(null)
  const [sendStatuses, setSendStatuses] = useState<SendStatus[]>([])
  const [retrying, setRetrying] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  useEffect(() => {
    fetchCampaignDetails()
  }, [campaignId])

  const fetchCampaignDetails = async () => {
    try {
      setLoading(true)

      // Fetch campaign
      const campaignResponse = await fetch(`/api/admin/campaigns?id=${campaignId}`)
      const campaignData = await campaignResponse.json()

      if (!campaignData.success || !campaignData.campaigns?.[0]) {
        throw new Error('Campaign not found')
      }

      const camp = campaignData.campaigns[0]
      setCampaign(camp)

      // Fetch campaign sends
      const sendsResponse = await fetch(`/api/admin/campaigns/sends?campaignId=${campaignId}`)
      const sendsData = await sendsResponse.json()

      // Get all intended recipients
      const targetAudience = camp.target_audience || {}
      let intendedRecipients: string[] = []

      if (targetAudience.source === 'manual' && targetAudience.manualRecipients) {
        intendedRecipients = targetAudience.manualRecipients
      } else {
        // For automatic targeting, we need to fetch who should have received it
        const leadsResponse = await fetch('/api/admin/leads')
        const leadsData = await leadsResponse.json()

        if (leadsData.success) {
          // Filter based on target audience criteria
          let leads = leadsData.leads || []

          if (targetAudience.source && targetAudience.source !== 'all') {
            leads = leads.filter((l: any) => l.source === targetAudience.source)
          }

          // Only include waitlist by default
          leads = leads.filter((l: any) => l.status === 'waitlist')

          intendedRecipients = leads.map((l: any) => l.email)
        }
      }

      // Build status list
      const sentEmails = new Set((sendsData.sends || []).map((s: any) => s.recipient_email))
      const statuses: SendStatus[] = intendedRecipients.map(email => {
        const sendRecord = sendsData.sends?.find((s: any) => s.recipient_email === email)

        if (sendRecord) {
          return {
            email,
            name: sendRecord.recipient_name || 'Unknown',
            status: 'sent',
            sent_at: sendRecord.sent_at
          }
        } else {
          return {
            email,
            name: 'Unknown',
            status: camp.status === 'sent' ? 'failed' : 'pending',
          }
        }
      })

      setSendStatuses(statuses)

    } catch (error) {
      console.error('Failed to fetch campaign details:', error)
      alert('Failed to load campaign details')
    } finally {
      setLoading(false)
    }
  }

  const handleRetryFailed = async () => {
    const failedEmails = sendStatuses
      .filter(s => s.status === 'failed')
      .map(s => s.email)

    if (failedEmails.length === 0) {
      alert('No failed recipients to retry')
      return
    }

    if (!confirm(`Retry sending to ${failedEmails.length} failed recipients?`)) {
      return
    }

    try {
      setRetrying(true)

      const response = await fetch('/api/admin/campaigns/retry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          campaignId,
          recipients: failedEmails
        })
      })

      const data = await response.json()

      if (data.success) {
        alert(`Successfully sent to ${data.sentCount} of ${failedEmails.length} recipients`)
        fetchCampaignDetails()
        onRefresh()
      } else {
        alert('Failed to retry: ' + data.error)
      }

    } catch (error) {
      alert('Failed to retry sending')
    } finally {
      setRetrying(false)
    }
  }

  const exportFailedRecipients = () => {
    const failed = sendStatuses.filter(s => s.status === 'failed')
    const csv = 'Email,Name\n' + failed.map(s => `${s.email},${s.name}`).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `failed-recipients-${campaignId}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const sentCount = sendStatuses.filter(s => s.status === 'sent').length
  const failedCount = sendStatuses.filter(s => s.status === 'failed').length
  const pendingCount = sendStatuses.filter(s => s.status === 'pending').length

  if (loading) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Loading...</DialogTitle>
          </DialogHeader>
          <div className="animate-pulse space-y-4">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-5xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Campaign Details
          </DialogTitle>
          <DialogDescription>
            {campaign?.subject}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4">
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <div>
                    <div className="text-2xl font-bold text-green-600">{sentCount}</div>
                    <div className="text-sm text-muted-foreground">Sent Successfully</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <div>
                    <div className="text-2xl font-bold text-red-600">{failedCount}</div>
                    <div className="text-sm text-muted-foreground">Failed to Send</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-600" />
                  <div>
                    <div className="text-2xl font-bold text-gray-600">{pendingCount}</div>
                    <div className="text-sm text-muted-foreground">Pending</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={() => setShowPreview(!showPreview)}
              variant="outline"
            >
              <FileText className="h-4 w-4 mr-2" />
              {showPreview ? 'Hide' : 'View'} Email Content
            </Button>
            {failedCount > 0 && (
              <>
                <Button
                  onClick={handleRetryFailed}
                  disabled={retrying}
                  variant="default"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${retrying ? 'animate-spin' : ''}`} />
                  Retry Failed ({failedCount})
                </Button>
                <Button
                  onClick={exportFailedRecipients}
                  variant="outline"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Failed List
                </Button>
              </>
            )}
          </div>

          {/* Email Content Preview */}
          {showPreview && campaign?.content && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Email Content</CardTitle>
                <CardDescription>
                  This is the raw HTML content that was sent. Variables like {`{{name}}`} are replaced with actual values when sent.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg p-4 bg-gray-50 max-h-96 overflow-y-auto">
                  <div className="mb-4">
                    <div className="text-sm font-semibold text-gray-700 mb-2">Subject:</div>
                    <div className="text-sm bg-white text-gray-900 p-2 rounded border">{campaign.subject}</div>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-700 mb-2">HTML Content:</div>
                    <pre className="text-xs bg-white text-gray-900 p-3 rounded border overflow-x-auto whitespace-pre-wrap font-mono">
                      {campaign.content}
                    </pre>
                  </div>
                </div>
                <div className="mt-4">
                  <Button
                    onClick={() => {
                      navigator.clipboard.writeText(campaign.content)
                      alert('Email content copied to clipboard!')
                    }}
                    variant="outline"
                    size="sm"
                  >
                    Copy HTML to Clipboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recipients Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Send Status by Recipient</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Sent At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sendStatuses.map((status, idx) => (
                    <TableRow key={idx}>
                      <TableCell>
                        {status.status === 'sent' && (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Sent
                          </Badge>
                        )}
                        {status.status === 'failed' && (
                          <Badge variant="destructive">
                            <XCircle className="h-3 w-3 mr-1" />
                            Failed
                          </Badge>
                        )}
                        {status.status === 'pending' && (
                          <Badge variant="secondary">
                            <Clock className="h-3 w-3 mr-1" />
                            Pending
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-sm">{status.email}</TableCell>
                      <TableCell>{status.name}</TableCell>
                      <TableCell>
                        {status.sent_at
                          ? new Date(status.sent_at).toLocaleString()
                          : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
