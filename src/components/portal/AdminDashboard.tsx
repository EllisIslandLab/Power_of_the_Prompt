"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, Edit, Trash2, RefreshCw, Filter, Search } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface FormSubmission {
  id: string
  user_id: string
  client_name: string
  client_email: string
  form_type: string
  date_submitted: string
  selected_items: string[]
  detailed_instructions: string
  revision_status: string | null
  topic_1_name: string | null
  topic_1_details: string | null
  topic_2_name: string | null
  topic_2_details: string | null
  status: string
  internal_notes: string | null
  created_at: string
  updated_at: string
}

export default function AdminDashboard() {
  const [submissions, setSubmissions] = useState<FormSubmission[]>([])
  const [filteredSubmissions, setFilteredSubmissions] = useState<FormSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSubmission, setSelectedSubmission] = useState<FormSubmission | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editStatus, setEditStatus] = useState('')
  const [editNotes, setEditNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [formTypeFilter, setFormTypeFilter] = useState('all')

  useEffect(() => {
    fetchSubmissions()
  }, [])

  useEffect(() => {
    filterSubmissions()
  }, [submissions, searchTerm, statusFilter, formTypeFilter])

  const fetchSubmissions = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/portal/form-submissions?admin=true')
      const data = await response.json()

      if (data.success) {
        setSubmissions(data.submissions || [])
      } else {
        setError(data.error || 'Failed to fetch submissions')
      }
    } catch (err) {
      setError('Failed to load submissions')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const filterSubmissions = () => {
    let filtered = submissions

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(s => s.status === statusFilter)
    }

    // Filter by form type
    if (formTypeFilter !== 'all') {
      filtered = filtered.filter(s => s.form_type === formTypeFilter)
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(s =>
        s.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.client_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.detailed_instructions?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredSubmissions(filtered)
  }

  const handleEdit = (submission: FormSubmission) => {
    setSelectedSubmission(submission)
    setEditStatus(submission.status)
    setEditNotes(submission.internal_notes || '')
    setIsEditModalOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!selectedSubmission) return

    setSaving(true)
    setError('')

    try {
      const response = await fetch(`/api/portal/form-submissions/${selectedSubmission.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: editStatus,
          internal_notes: editNotes
        })
      })

      const data = await response.json()

      if (data.success) {
        // Update local state
        setSubmissions(submissions.map(s =>
          s.id === selectedSubmission.id
            ? { ...s, status: editStatus, internal_notes: editNotes }
            : s
        ))
        setIsEditModalOpen(false)
      } else {
        setError(data.error || 'Failed to update submission')
      }
    } catch (err) {
      setError('Failed to save changes')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to archive this submission?')) return

    try {
      const response = await fetch(`/api/portal/form-submissions/${id}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (data.success) {
        fetchSubmissions() // Refresh list
      } else {
        alert('Failed to delete submission')
      }
    } catch (err) {
      alert('Failed to delete submission')
      console.error(err)
    }
  }

  const exportToCSV = () => {
    const headers = [
      'Client Name',
      'Email',
      'Form Type',
      'Status',
      'Submitted',
      'Instructions'
    ]

    const rows = filteredSubmissions.map(s => [
      s.client_name,
      s.client_email,
      getFormTypeLabel(s.form_type),
      s.status,
      new Date(s.created_at).toLocaleDateString(),
      s.detailed_instructions || `Topic 1: ${s.topic_1_name || 'N/A'}`
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `form-submissions-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; className: string }> = {
      'new': { label: 'New', className: 'bg-blue-100 text-blue-800 border-blue-200' },
      'reviewed': { label: 'Reviewed', className: 'bg-purple-100 text-purple-800 border-purple-200' },
      'in-progress': { label: 'In Progress', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
      'completed': { label: 'Completed', className: 'bg-green-100 text-green-800 border-green-200' },
      'archived': { label: 'Archived', className: 'bg-gray-100 text-gray-800 border-gray-200' }
    }

    const variant = variants[status] || { label: status, className: '' }

    return (
      <Badge variant="outline" className={variant.className}>
        {variant.label}
      </Badge>
    )
  }

  const getFormTypeLabel = (formType: string) => {
    const labels: Record<string, string> = {
      'revision-start': 'Revision Start',
      'revision-modifier': 'Revision Modifier',
      'video-conference': 'Video Conference'
    }
    return labels[formType] || formType
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Loading submissions...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Form Submissions</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={fetchSubmissions}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" size="sm" onClick={exportToCSV} disabled={filteredSubmissions.length === 0}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="reviewed">Reviewed</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>

            <Select value={formTypeFilter} onValueChange={setFormTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="revision-start">Revision Start</SelectItem>
                <SelectItem value="revision-modifier">Revision Modifier</SelectItem>
                <SelectItem value="video-conference">Video Conference</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Summary */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>Total: {submissions.length}</span>
            <span>|</span>
            <span>Showing: {filteredSubmissions.length}</span>
            <span>|</span>
            <span>New: {submissions.filter(s => s.status === 'new').length}</span>
          </div>
        </CardContent>
      </Card>

      {/* Submissions Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubmissions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No submissions found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSubmissions.map((submission) => (
                    <TableRow key={submission.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{submission.client_name}</div>
                          <div className="text-sm text-muted-foreground">{submission.client_email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getFormTypeLabel(submission.form_type)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {new Date(submission.created_at).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(submission.status)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(submission)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(submission.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Submission</DialogTitle>
            <DialogDescription>
              Update the status and add internal notes for this submission
            </DialogDescription>
          </DialogHeader>

          {selectedSubmission && (
            <div className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Submission Details */}
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <div><strong>Client:</strong> {selectedSubmission.client_name}</div>
                <div><strong>Email:</strong> {selectedSubmission.client_email}</div>
                <div><strong>Type:</strong> {getFormTypeLabel(selectedSubmission.form_type)}</div>
                <div><strong>Submitted:</strong> {new Date(selectedSubmission.created_at).toLocaleString()}</div>
              </div>

              {/* Content */}
              {selectedSubmission.form_type !== 'video-conference' ? (
                <div>
                  <Label>Instructions</Label>
                  <div className="p-4 bg-muted rounded-lg mt-2">
                    <p className="whitespace-pre-wrap text-sm">{selectedSubmission.detailed_instructions}</p>
                  </div>
                  {selectedSubmission.selected_items && selectedSubmission.selected_items.length > 0 && (
                    <div className="mt-2">
                      <Label>Selected Changes</Label>
                      <ul className="list-disc list-inside text-sm text-muted-foreground mt-1">
                        {selectedSubmission.selected_items.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Video Conference Topics */}
                  {selectedSubmission.selected_items && Array.isArray(selectedSubmission.selected_items) && selectedSubmission.selected_items.length > 0 ? (
                    <>
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm font-semibold text-blue-900">💰 Investment: $200 for 40-minute session</p>
                      </div>
                      <Label className="text-base">Selected Topics ({selectedSubmission.selected_items.length}):</Label>
                      {selectedSubmission.selected_items.map((topic: any, index: number) => (
                        <div key={index}>
                          <Label>Topic {index + 1}: {topic.name || `Topic ${index + 1}`}</Label>
                          <div className="p-4 bg-muted rounded-lg mt-2 text-sm whitespace-pre-wrap">
                            {topic.details || 'No details provided'}
                          </div>
                        </div>
                      ))}
                      <div>
                        <Label>Additional Details or Other Questions:</Label>
                        <div className="p-4 bg-muted rounded-lg mt-2 text-sm whitespace-pre-wrap">
                          {selectedSubmission.detailed_instructions || 'No additional details provided'}
                        </div>
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">No topics selected</p>
                  )}
                </div>
              )}

              {/* Edit Fields */}
              <div className="space-y-4 pt-4 border-t">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={editStatus} onValueChange={setEditStatus}>
                    <SelectTrigger id="status" className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="reviewed">Reviewed</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="notes">Internal Notes</Label>
                  <Textarea
                    id="notes"
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    placeholder="Add notes for internal tracking..."
                    className="mt-2 min-h-[100px]"
                  />
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
