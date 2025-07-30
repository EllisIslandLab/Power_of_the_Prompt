"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Clock, CheckCircle } from "lucide-react"

interface TimeSlot {
  timestamp: string
  formatted: string
  date: string
  time: string
  period: 'morning' | 'afternoon'
}

interface TimeSlotPickerProps {
  onSlotSelect: (slot: TimeSlot) => void
  selectedSlot: TimeSlot | null
}

export function TimeSlotPicker({ onSlotSelect, selectedSlot }: TimeSlotPickerProps) {
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  useEffect(() => {
    fetchAvailableSlots()
  }, [])

  const fetchAvailableSlots = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/calendar/availability')
      
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.available_slots) {
          setAvailableSlots(data.available_slots)
          // Auto-select first date
          if (data.available_slots.length > 0) {
            setSelectedDate(data.available_slots[0].date)
          }
        } else {
          setError("No available time slots found")
        }
      } else {
        setError("Failed to load available times")
      }
    } catch (error) {
      console.error('Error fetching slots:', error)
      setError("Network error loading available times")
    } finally {
      setLoading(false)
    }
  }

  // Group slots by date
  const slotsByDate = availableSlots.reduce((acc, slot) => {
    if (!acc[slot.date]) {
      acc[slot.date] = []
    }
    acc[slot.date].push(slot)
    return acc
  }, {} as Record<string, TimeSlot[]>)

  const dates = Object.keys(slotsByDate).sort()
  const slotsForSelectedDate = selectedDate ? slotsByDate[selectedDate] || [] : []

  // Group slots by period for selected date
  const morningSlots = slotsForSelectedDate.filter(slot => slot.period === 'morning')
  const afternoonSlots = slotsForSelectedDate.filter(slot => slot.period === 'afternoon')

  const formatDateForDisplay = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading available times...</p>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchAvailableSlots} variant="outline">
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (dates.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">No available time slots at the moment</p>
          <p className="text-sm text-muted-foreground">Please try the call back option instead</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Date Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Select Date
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {dates.slice(0, 8).map((date) => (
              <Button
                key={date}
                variant={selectedDate === date ? "default" : "outline"}
                className="text-left justify-start h-auto py-3 px-4"
                onClick={() => setSelectedDate(date)}
              >
                <div>
                  <div className="font-medium">{formatDateForDisplay(date)}</div>
                  <div className="text-xs text-muted-foreground">
                    {slotsByDate[date].length} slots available
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Time Selection */}
      {selectedDate && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Available Times - {formatDateForDisplay(selectedDate)}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Morning Slots */}
            {morningSlots.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3 text-sm uppercase tracking-wide text-muted-foreground">
                  Morning (6:00 AM - 10:00 AM EST)
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                  {morningSlots.map((slot) => (
                    <Button
                      key={slot.timestamp}
                      variant={selectedSlot?.timestamp === slot.timestamp ? "default" : "outline"}
                      className="h-12 relative"
                      onClick={() => onSlotSelect(slot)}
                    >
                      {selectedSlot?.timestamp === slot.timestamp && (
                        <CheckCircle className="h-4 w-4 absolute top-1 right-1" />
                      )}
                      {slot.time}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Afternoon Slots */}
            {afternoonSlots.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3 text-sm uppercase tracking-wide text-muted-foreground">
                  Afternoon (2:00 PM - 6:00 PM EST)
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                  {afternoonSlots.map((slot) => (
                    <Button
                      key={slot.timestamp}
                      variant={selectedSlot?.timestamp === slot.timestamp ? "default" : "outline"}
                      className="h-12 relative"
                      onClick={() => onSlotSelect(slot)}
                    >
                      {selectedSlot?.timestamp === slot.timestamp && (
                        <CheckCircle className="h-4 w-4 absolute top-1 right-1" />
                      )}
                      {slot.time}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {morningSlots.length === 0 && afternoonSlots.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No available times for this date</p>
                <p className="text-sm text-muted-foreground mt-1">Please select a different date</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Selected Slot Confirmation */}
      {selectedSlot && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-800">Selected Time:</p>
                <p className="text-green-700">{selectedSlot.formatted}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}