"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, Clock, ArrowLeft, Video, Zap, CheckCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { createBrowserClient } from '@supabase/ssr'
import { Textarea } from '@/components/ui/textarea'
import { CalendarPicker } from '@/components/ui/calendar-picker'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type SessionType = 'check-in' | 'lvl-up-session' | 'group-coaching'

interface TimeSlot {
  start_time: string
  end_time: string
  available: boolean
  slot_type: 'check-in' | 'lvl-up' | 'both'
}

interface Booking {
  id: string
  session_type: SessionType
  booking_date: string
  start_time: string
  duration_minutes: number
  status: string
  meeting_link: string
  notes: string | null
}

export default function SchedulePage() {
  const [user, setUser] = useState<any>(null)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedType, setSelectedType] = useState<SessionType | null>(null)
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([])
  const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(false)
  const [bookingNotes, setBookingNotes] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)

  // Load user
  useEffect(() => {
    async function loadUser() {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      setUser(authUser)
    }
    loadUser()
  }, [])

  // Load upcoming bookings
  useEffect(() => {
    if (!user) return

    async function loadBookings() {
      const now = new Date().toISOString()
      const { data, error } = await supabase
        .from('session_bookings')
        .select('*')
        .eq('user_id', user.id)
        .gte('start_time', now)
        .in('status', ['pending', 'confirmed'])
        .order('start_time', { ascending: true })
        .limit(5)

      if (!error && data) {
        setUpcomingBookings(data)
      }
    }

    loadBookings()
  }, [user, showSuccess])

  // Load available slots when date or session type changes
  useEffect(() => {
    if (!selectedType) {
      setAvailableSlots([])
      return
    }

    loadAvailableSlots()
  }, [selectedDate, selectedType])

  async function loadAvailableSlots() {
    setLoading(true)
    try {
      const dateString = selectedDate.toISOString().split('T')[0]

      // Get admin/coach ID
      const { data: adminUsers } = await supabase
        .from('users')
        .select('id')
        .eq('role', 'admin')
        .limit(1)

      if (!adminUsers || adminUsers.length === 0) {
        return
      }

      const coachId = adminUsers[0].id
      const dayOfWeek = selectedDate.getDay()

      // Get availability slots
      const { data: availSlots } = await supabase
        .from('availability_slots')
        .select('*')
        .eq('coach_id', coachId)
        .eq('is_active', true)
        .or(`day_of_week.eq.${dayOfWeek},specific_date.eq.${dateString}`)

      if (!availSlots || availSlots.length === 0) {
        setAvailableSlots([])
        return
      }

      // Get existing bookings for this date
      const { data: existingBookings } = await supabase
        .from('session_bookings')
        .select('start_time, duration_minutes')
        .eq('coach_id', coachId)
        .eq('booking_date', dateString)
        .in('status', ['pending', 'confirmed'])

      // Generate all slots (including unavailable ones)
      const slots: TimeSlot[] = []
      const requiredSlots = selectedType === 'lvl-up-session' ? 4 : 1

      for (const slot of availSlots) {
        const [startHour, startMin] = slot.start_time.split(':').map(Number)
        const [endHour, endMin] = slot.end_time.split(':').map(Number)

        let currentTime = new Date(selectedDate)
        currentTime.setHours(startHour, startMin, 0, 0)

        const slotEnd = new Date(selectedDate)
        slotEnd.setHours(endHour, endMin, 0, 0)

        while (currentTime < slotEnd) {
          const slotStart = new Date(currentTime)
          const slotDuration = 15 * requiredSlots

          // Check if we have enough consecutive slots
          if (new Date(currentTime.getTime() + slotDuration * 60 * 1000) > slotEnd) {
            break
          }

          // Check for conflicts
          let hasConflict = false
          for (let i = 0; i < requiredSlots; i++) {
            const checkTime = new Date(currentTime.getTime() + i * 15 * 60 * 1000)
            const isBooked = existingBookings?.some(booking => {
              const bookingStart = new Date(booking.start_time)
              const bookingEnd = new Date(bookingStart.getTime() + booking.duration_minutes * 60 * 1000)
              return checkTime >= bookingStart && checkTime < bookingEnd
            })
            if (isBooked) {
              hasConflict = true
              break
            }
          }

          // Add slot regardless of availability (but mark as available/unavailable)
          slots.push({
            start_time: slotStart.toISOString(),
            end_time: new Date(slotStart.getTime() + slotDuration * 60 * 1000).toISOString(),
            available: !hasConflict,
            slot_type: selectedType === 'lvl-up-session' ? 'lvl-up' : 'check-in'
          })

          // Move to next slot
          currentTime = new Date(currentTime.getTime() + 15 * 60 * 1000)
        }
      }

      setAvailableSlots(slots)
    } catch (error) {
      console.error('Error loading slots:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleBookSlot(slot: TimeSlot) {
    if (!user || !selectedType) return

    setLoading(true)
    try {
      const dateString = selectedDate.toISOString().split('T')[0]

      // Get coach ID
      const { data: adminUsers } = await supabase
        .from('users')
        .select('id')
        .eq('role', 'admin')
        .limit(1)

      if (!adminUsers || adminUsers.length === 0) return

      const coachId = adminUsers[0].id
      const duration = selectedType === 'lvl-up-session' ? 60 : 15
      const meetingLink = `${selectedType}-${Date.now()}`

      // Create booking
      const { error } = await supabase
        .from('session_bookings')
        .insert({
          user_id: user.id,
          coach_id: coachId,
          session_type: selectedType,
          booking_date: dateString,
          start_time: slot.start_time,
          duration_minutes: duration,
          meeting_link: meetingLink,
          notes: bookingNotes || null,
          status: 'confirmed'
        })

      if (error) {
        console.error('Booking error:', error)
        alert('Failed to book session. Please try again.')
        return
      }

      // Show success message
      setShowSuccess(true)
      setBookingNotes('')
      setSelectedType(null)
      setTimeout(() => setShowSuccess(false), 5000)

      // Reload slots
      loadAvailableSlots()

    } catch (error) {
      console.error('Error booking slot:', error)
      alert('Failed to book session. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleCancelBooking(bookingId: string) {
    if (!confirm('Are you sure you want to cancel this booking?')) return

    const { error } = await supabase
      .from('session_bookings')
      .update({ status: 'cancelled' })
      .eq('id', bookingId)

    if (!error) {
      setUpcomingBookings(bookings => bookings.filter(b => b.id !== bookingId))
    }
  }

  const sessionTypes = [
    {
      name: 'Check-In',
      id: 'check-in' as SessionType,
      duration: '15 minutes',
      icon: <Zap className="h-6 w-6" />,
      description: 'Quick consultation for minor questions',
      color: 'border-purple-500/50'
    },
    {
      name: 'LVL UP Session',
      id: 'lvl-up-session' as SessionType,
      duration: '1 hour',
      icon: <Video className="h-6 w-6" />,
      description: 'One-on-one focused session',
      premium: true,
      color: 'border-green-500/50'
    }
  ]

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-12 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl text-center">
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-12 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold">Session Scheduler</h1>
            <Button variant="outline" asChild>
              <Link href="/portal/collaboration">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Collaboration
              </Link>
            </Button>
          </div>
          <p className="text-muted-foreground">
            Schedule your coaching sessions in advance and get email confirmations
          </p>
        </div>

        {showSuccess && (
          <Alert className="mb-6 border-green-500/50 bg-green-500/10">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-600 dark:text-green-400">
              <strong>Session booked successfully!</strong> You'll receive a confirmation email shortly.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          {/* Left Column - Booking Interface */}
          <div className="md:col-span-2 space-y-6">
            {/* Step 1: Select Session Type */}
            <Card>
              <CardHeader>
                <CardTitle>Step 1: Choose Session Type</CardTitle>
                <CardDescription>Click to select your session type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  {sessionTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setSelectedType(type.id)}
                      className={`group relative text-left transition-all duration-200 rounded-xl p-5 shadow-lg cursor-pointer ${
                        selectedType === type.id
                          ? 'border-2 border-yellow-400 bg-gradient-to-br from-royal-blue-600 to-polynesian-blue-600 text-white shadow-xl'
                          : 'border-4 border-yellow-300 bg-gradient-to-br from-royal-blue-800 to-polynesian-blue-800 text-white hover:border-yellow-400 hover:shadow-xl hover:translate-y-[-1px] active:translate-y-0'
                      }`}
                    >
                      <div className="relative flex items-start gap-3">
                        <div className="text-white drop-shadow-lg">{type.icon}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-lg text-white drop-shadow">{type.name}</h3>
                            {type.premium && (
                              <Badge className="text-xs bg-yellow-400 text-blue-900 font-bold">PREMIUM</Badge>
                            )}
                          </div>
                          <p className="text-xs text-white/90 mb-2 font-semibold">{type.duration}</p>
                          <p className="text-sm text-white/80">{type.description}</p>
                        </div>
                      </div>

                      {/* Selection indicator */}
                      {selectedType === type.id && (
                        <div className="absolute top-2 right-2">
                          <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                            <CheckCircle className="h-4 w-4 text-blue-900" />
                          </div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Step 2: Select Date & Notes */}
            {selectedType && (
              <div className="grid md:grid-cols-3 gap-6">
                {/* Calendar - 2 columns */}
                <div className="md:col-span-2">
                  <CalendarPicker
                    selectedDate={selectedDate}
                    onDateSelect={setSelectedDate}
                    minDate={new Date()}
                  />
                </div>

                {/* Notes Input - 1 column */}
                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Session Notes</CardTitle>
                      <CardDescription className="text-xs">Optional details</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Textarea
                        id="notes"
                        placeholder="Any specific topics or questions you'd like to cover during the session..."
                        value={bookingNotes}
                        onChange={(e) => setBookingNotes(e.target.value)}
                        rows={8}
                        className="resize-none"
                      />
                      <p className="text-xs text-muted-foreground mt-2">
                        These notes will be shared with your coach before the session.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Step 3: Select Time Slot */}
            {selectedType && selectedDate && (
              <Card>
                <CardHeader>
                  <CardTitle>Step 3: Choose Time Slot</CardTitle>
                  <CardDescription>
                    Available {selectedType === 'lvl-up-session' ? '1-hour' : '15-minute'} slots on{' '}
                    {selectedDate.toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : availableSlots.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No time slots for this date.</p>
                      <p className="text-sm mt-2">Try selecting a different date.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {availableSlots.map((slot, index) => (
                        <button
                          key={index}
                          onClick={() => slot.available && handleBookSlot(slot)}
                          disabled={!slot.available || loading}
                          className={`flex flex-col items-center gap-2 h-auto py-4 px-3 rounded-lg border-2 transition-all duration-200 font-semibold ${
                            slot.available
                              ? 'border-royal-blue-600 bg-gradient-to-b from-royal-blue-50 to-polynesian-blue-100 dark:from-royal-blue-900 dark:to-polynesian-blue-900 hover:border-royal-blue-700 hover:shadow-lg hover:translate-y-[-1px] active:translate-y-0 cursor-pointer text-royal-blue-900 dark:text-slate-200'
                              : 'border-slate-300 dark:border-slate-700 bg-slate-200 dark:bg-slate-800 opacity-50 cursor-not-allowed'
                          }`}
                        >
                          <Clock className={`h-5 w-5 ${slot.available ? 'text-royal-blue-800 dark:text-polynesian-blue-400' : 'text-slate-400'}`} />
                          <span className={`text-sm font-bold ${slot.available ? 'text-royal-blue-900 dark:text-slate-100' : 'text-muted-foreground line-through'}`}>
                            {new Date(slot.start_time).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                          {!slot.available && (
                            <span className="text-xs text-muted-foreground">Booked</span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Upcoming Bookings */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Upcoming Sessions
                </CardTitle>
                <CardDescription>Your scheduled coaching sessions</CardDescription>
              </CardHeader>
              <CardContent>
                {upcomingBookings.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No upcoming sessions
                  </p>
                ) : (
                  <div className="space-y-3">
                    {upcomingBookings.map((booking) => (
                      <div
                        key={booking.id}
                        className="p-3 border rounded-lg space-y-2"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold text-sm">
                              {booking.session_type.replace('-', ' ').toUpperCase()}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(booking.booking_date).toLocaleDateString()}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(booking.start_time).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })} ({booking.duration_minutes} min)
                            </p>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {booking.status}
                          </Badge>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full text-xs border-2 hover:border-destructive hover:text-destructive transition-all cursor-pointer"
                          onClick={() => handleCancelBooking(booking.id)}
                        >
                          Cancel
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
