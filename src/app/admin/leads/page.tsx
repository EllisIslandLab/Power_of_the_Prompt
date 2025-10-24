"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Users, Trash2, Search, Filter, Calendar, Mail, Tag } from "lucide-react"

interface Lead {
  id: string
  email: string
  name: string | null
  status: 'waitlist' | 'interested' | 'nurturing' | 'converted'
  source: string | null
  signup_date: string
  last_engagement: string | null
  tags: string[]
  notes: string | null
  created_at: string
}

export default function LeadsManagementPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [sourceFilter, setSourceFilter] = useState<string>("all")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    fetchLeads()
  }, [statusFilter])

  const fetchLeads = async () => {
    try {
      setLoading(true)
      setError(null)
      const params = new URLSearchParams({ limit: '1000' })

      if (statusFilter !== 'all') {
        params.append('status', statusFilter)
      }

      const response = await fetch(`/api/admin/leads?${params.toString()}`)
      const data = await response.json()

      if (data.success) {
        setLeads(data.leads || [])
      } else {
        setError("Failed to fetch leads")
      }
    } catch (error) {
      console.error('Failed to fetch leads:', error)
      setError("Failed to fetch leads")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteLead = async (lead: Lead) => {
    setLeadToDelete(lead)
  }

  const confirmDelete = async () => {
    if (!leadToDelete) return

    try {
      setDeleting(leadToDelete.id)
      setError(null)
      setSuccess(null)

      const response = await fetch(`/api/admin/leads?id=${leadToDelete.id}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (data.success) {
        setSuccess(`Lead ${leadToDelete.email} has been removed`)

        // Remove from local state
        setLeads(leads.filter(l => l.id !== leadToDelete.id))

        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(null), 3000)
      } else {
        setError(data.error || "Failed to delete lead")
      }
    } catch (error) {
      console.error('Failed to delete lead:', error)
      setError("Failed to delete lead")
    } finally {
      setDeleting(null)
      setLeadToDelete(null)
    }
  }

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = !searchQuery ||
      lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (lead.name && lead.name.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesSource = sourceFilter === 'all' || lead.source === sourceFilter

    return matchesSearch && matchesSource
  })

  const uniqueSources = Array.from(new Set(leads.map(l => l.source).filter(Boolean)))

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'waitlist': return 'secondary'
      case 'interested': return 'default'
      case 'nurturing': return 'outline'
      case 'converted': return 'default'
      default: return 'secondary'
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Lead Management</h1>
          <p className="text-muted-foreground">
            Manage your leads and unsubscribe requests
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-lg px-3 py-1">
            <Users className="h-4 w-4 mr-2" />
            {filteredLeads.length} {filteredLeads.length === 1 ? 'lead' : 'leads'}
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by email or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="waitlist">Waitlist</SelectItem>
                <SelectItem value="interested">Interested</SelectItem>
                <SelectItem value="nurturing">Nurturing</SelectItem>
                <SelectItem value="converted">Converted</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                {uniqueSources.map(source => (
                  <SelectItem key={source} value={source || 'unknown'}>
                    {source?.replace('_', ' ') || 'Unknown'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Leads Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Leads</CardTitle>
          <CardDescription>
            Remove leads who have requested to unsubscribe or no longer want to receive emails
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredLeads.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchQuery || statusFilter !== 'all' || sourceFilter !== 'all'
                  ? 'No leads match your filters'
                  : 'No leads found'}
              </p>
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Signup Date</TableHead>
                    <TableHead>Last Engagement</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeads.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          {lead.email}
                        </div>
                      </TableCell>
                      <TableCell>{lead.name || '-'}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(lead.status)}>
                          {lead.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Tag className="h-3 w-3 text-muted-foreground" />
                          <span className="capitalize">
                            {lead.source?.replace('_', ' ') || 'Unknown'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          {new Date(lead.signup_date).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        {lead.last_engagement
                          ? new Date(lead.last_engagement).toLocaleDateString()
                          : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteLead(lead)}
                          disabled={deleting === lead.id}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!leadToDelete} onOpenChange={() => setLeadToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Lead</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove <strong>{leadToDelete?.email}</strong> from your leads list?
              <br /><br />
              This action cannot be undone. The lead will be permanently removed from your database
              and will not receive any future emails.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Remove Lead
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
