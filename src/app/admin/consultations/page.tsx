"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import {
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  Video,
  CheckCircle,
  XCircle,
  RefreshCw,
  Search,
  Filter,
  ArrowLeft,
  ExternalLink
} from "lucide-react"
import { createClientSupabase } from "@/lib/supabase"

const supabase = createClientSupabase()

interface Consultation {
  id: string
  full_name: string
  email: string
  phone: string
  business_name: string | null
  scheduled_date: string
  duration_minutes: number
  status: string
  jitsi_join_url: string | null
  website_description: string | null
  notes: string | null
  reminder_24h_sent: boolean
  reminder_1h_sent: boolean
  confirmation_sent: boolean
  created_at: string
}

export default function ConsultationsAdminPage() {
  const [consultations, setConsultations] = useState<Consultation[]>([])
  const [filteredConsultations, setFilteredConsultations] = useState<Consultation[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null)

  useEffect(() => {
    loadConsultations()
  }, [])

  useEffect(() => {
    filterConsultations()
  }, [searchTerm, statusFilter, consultations])

  const loadConsultations = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('consultations')
        .select('*')
        .order('scheduled_date', { ascending: true })

      if (error) throw error

      setConsultations(data || [])
    } catch (error) {
      console.error('Error loading consultations:', error)
      alert('Failed to load consultations')
    } finally {
      setLoading(false)
    }
  }

  const filterConsultations = () => {
    let filtered = consultations

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(c => c.status === statusFilter)
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(c =>
        c.full_name.toLowerCase().includes(term) ||
        c.email.toLowerCase().includes(term) ||
        c.phone.includes(term) ||
        (c.business_name && c.business_name.toLowerCase().includes(term))
      )
    }

    setFilteredConsultations(filtered)
  }

  const handleCancel = async (consultationId: string) => {
    if (!confirm('Are you sure you want to cancel this consultation?')) return

    const reason = prompt('Cancellation reason (optional):')

    try {
      const response = await fetch('/api/consultations/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'cancel',
          consultationId,
          reason
        })
      })

      if (!response.ok) throw new Error('Failed to cancel consultation')

      alert('Consultation cancelled successfully')
      loadConsultations()
    } catch (error) {
      console.error('Error cancelling consultation:', error)
      alert('Failed to cancel consultation')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZone: 'America/New_York',
      timeZoneName: 'short'
    })
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any, label: string }> = {
      scheduled: { variant: 'default', label: 'Scheduled' },
      confirmed: { variant: 'default', label: 'Confirmed' },
      completed: { variant: 'secondary', label: 'Completed' },
      cancelled: { variant: 'destructive', label: 'Cancelled' },
      'no-show': { variant: 'destructive', label: 'No-Show' },
      rescheduled: { variant: 'secondary', label: 'Rescheduled' }
    }

    const config = variants[status] || { variant: 'outline', label: status }
    return <Badge variant={config.variant as any}>{config.label}</Badge>
  }

  const upcomingConsultations = filteredConsultations.filter(c =>
    new Date(c.scheduled_date) > new Date() && c.status === 'scheduled'
  )

  const pastConsultations = filteredConsultations.filter(c =>
    new Date(c.scheduled_date) <= new Date() || c.status !== 'scheduled'
  )

  const stats = {
    total: consultations.length,
    upcoming: consultations.filter(c => new Date(c.scheduled_date) > new Date() && c.status === 'scheduled').length,
    completed: consultations.filter(c => c.status === 'completed').length,
    cancelled: consultations.filter(c => c.status === 'cancelled').length
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading consultations...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 p-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">Consultation Management</h1>
            </div>
            <Button variant="outline" asChild>
              <Link href="/admin">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Admin
              </Link>
            </Button>
          </div>
          <p className="text-muted-foreground">
            Manage consultation bookings, send reminders, and track attendance
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{stats.total}</div>
                <div className="text-sm text-muted-foreground">Total Consultations</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{stats.upcoming}</div>
                <div className="text-sm text-muted-foreground">Upcoming</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{stats.completed}</div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600">{stats.cancelled}</div>
                <div className="text-sm text-muted-foreground">Cancelled</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={statusFilter === 'all' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('all')}
                >
                  All
                </Button>
                <Button
                  variant={statusFilter === 'scheduled' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('scheduled')}
                >
                  Scheduled
                </Button>
                <Button
                  variant={statusFilter === 'completed' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('completed')}
                >
                  Completed
                </Button>
                <Button
                  variant={statusFilter === 'cancelled' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('cancelled')}
                >
                  Cancelled
                </Button>
              </div>
              <Button variant="outline" onClick={loadConsultations}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Consultations */}
        {upcomingConsultations.length > 0 && (
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-4">Upcoming Consultations</h2>
            <div className="grid gap-4">
              {upcomingConsultations.map((consultation) => (
                <Card key={consultation.id} className="border-l-4 border-l-green-500">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <User className="h-5 w-5" />
                          {consultation.full_name}
                          {consultation.business_name && (
                            <span className="text-sm font-normal text-muted-foreground">
                              ({consultation.business_name})
                            </span>
                          )}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-2">
                          <Clock className="h-4 w-4" />
                          {formatDate(consultation.scheduled_date)}
                        </CardDescription>
                      </div>
                      {getStatusBadge(consultation.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <a href={`mailto:${consultation.email}`} className="hover:underline">
                            {consultation.email}
                          </a>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <a href={`tel:${consultation.phone}`} className="hover:underline">
                            {consultation.phone}
                          </a>
                        </div>
                        {consultation.website_description && (
                          <div className="text-sm text-muted-foreground">
                            <strong>Website:</strong> {consultation.website_description}
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          {consultation.confirmation_sent ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                          Confirmation sent
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          {consultation.reminder_24h_sent ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-muted-foreground" />
                          )}
                          24h reminder sent
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          {consultation.reminder_1h_sent ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-muted-foreground" />
                          )}
                          1h reminder sent
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      {consultation.jitsi_join_url && (
                        <Button size="sm" asChild>
                          <a href={consultation.jitsi_join_url} target="_blank" rel="noopener noreferrer">
                            <Video className="h-4 w-4 mr-2" />
                            Join Call
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </a>
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleCancel(consultation.id)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Past Consultations */}
        {pastConsultations.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Past Consultations</h2>
            <div className="grid gap-4">
              {pastConsultations.map((consultation) => (
                <Card key={consultation.id} className="opacity-75">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <User className="h-5 w-5" />
                          {consultation.full_name}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-2">
                          <Clock className="h-4 w-4" />
                          {formatDate(consultation.scheduled_date)}
                        </CardDescription>
                      </div>
                      {getStatusBadge(consultation.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm space-y-1">
                      <div><strong>Email:</strong> {consultation.email}</div>
                      <div><strong>Phone:</strong> {consultation.phone}</div>
                      {consultation.notes && (
                        <div><strong>Notes:</strong> {consultation.notes}</div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {filteredConsultations.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No consultations found</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
