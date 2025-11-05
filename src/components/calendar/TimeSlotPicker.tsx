"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Clock, CheckCircle, ChevronLeft, ChevronRight } from "lucide-react"

interface TimeSlot {
  timestamp: string
  formatted: string
  date: string
  time: string
  period: 'morning' | 'afternoon'
  isWithin72h?: boolean
  monthYear?: string
}

interface TimeSlotPickerProps {
  onSlotSelect: (slot: TimeSlot) => void
  selectedSlot: TimeSlot | null
}

export function TimeSlotPicker({ onSlotSelect, selectedSlot }: TimeSlotPickerProps) {
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null)
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
          // Auto-select first month and date
          if (data.available_slots.length > 0) {
            const firstSlot = data.available_slots[0]
            setSelectedMonth(firstSlot.monthYear)
            setSelectedDate(firstSlot.date)
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

  // Group slots by month
  const slotsByMonth = availableSlots.reduce((acc, slot) => {
    const monthYear = slot.monthYear || new Date(slot.timestamp).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
    if (!acc[monthYear]) {
      acc[monthYear] = []
    }
    acc[monthYear].push(slot)
    return acc
  }, {} as Record<string, TimeSlot[]>)

  const months = Object.keys(slotsByMonth).sort((a, b) => {
    return new Date(a).getTime() - new Date(b).getTime()
  })

  // Get current month index
  const currentMonthIndex = selectedMonth ? months.indexOf(selectedMonth) : 0

  // Group slots by date for selected month
  const slotsForSelectedMonth = selectedMonth ? slotsByMonth[selectedMonth] || [] : []
  const slotsByDate = slotsForSelectedMonth.reduce((acc, slot) => {
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

  // Check if any slots are within 72 hours for highlighting
  const hasHighlightedSlots = slotsForSelectedDate.some(slot => slot.isWithin72h)

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
      {/* Month Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Select Month
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                const newIndex = Math.max(0, currentMonthIndex - 1)
                setSelectedMonth(months[newIndex])
                setSelectedDate(null) // Reset date selection
              }}
              disabled={currentMonthIndex === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1 text-center">
              <h3 className="text-xl font-semibold">{selectedMonth}</h3>
              <p className="text-sm text-muted-foreground">
                {slotsForSelectedMonth.length} slots available
              </p>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                const newIndex = Math.min(months.length - 1, currentMonthIndex + 1)
                setSelectedMonth(months[newIndex])
                setSelectedDate(null) // Reset date selection
              }}
              disabled={currentMonthIndex === months.length - 1}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Date Selection */}
      {selectedMonth && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Select Date
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {dates.map((date) => {
                const hasHighlightedSlot = slotsByDate[date].some(slot => slot.isWithin72h)
                return (
                  <Button
                    key={date}
                    variant={selectedDate === date ? "default" : "outline"}
                    className={`text-left justify-start h-auto py-3 px-4 ${
                      hasHighlightedSlot ? 'ring-2 ring-green-500 ring-offset-2' : ''
                    }`}
                    onClick={() => setSelectedDate(date)}
                  >
                    <div className="w-full">
                      <div className="font-medium flex items-center justify-between">
                        {formatDateForDisplay(date)}
                        {hasHighlightedSlot && (
                          <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">
                            72h
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {slotsByDate[date].length} slots available
                      </div>
                    </div>
                  </Button>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Time Selection */}
      {selectedDate && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Available Times - {formatDateForDisplay(selectedDate)}
            </CardTitle>
            {hasHighlightedSlots && (
              <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800 font-medium">
                  🎯 Slots highlighted in green are within the next 72 hours - perfect for taking advantage of your promo code expiration!
                </p>
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Morning Slots */}
            {morningSlots.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3 text-sm uppercase tracking-wide text-muted-foreground">
                  Morning (9:00 AM - 12:00 PM EST)
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                  {morningSlots.map((slot) => {
                    const isSelected = selectedSlot?.timestamp === slot.timestamp
                    const isHighlighted = slot.isWithin72h
                    return (
                      <Button
                        key={slot.timestamp}
                        variant={isSelected ? "default" : "outline"}
                        className={`h-12 relative ${
                          isHighlighted && !isSelected ? 'bg-green-50 border-green-500 hover:bg-green-100 text-green-800' : ''
                        }`}
                        onClick={() => onSlotSelect(slot)}
                      >
                        {isSelected && (
                          <CheckCircle className="h-4 w-4 absolute top-1 right-1" />
                        )}
                        {slot.time}
                      </Button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Afternoon Slots */}
            {afternoonSlots.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3 text-sm uppercase tracking-wide text-muted-foreground">
                  Afternoon (1:00 PM - 5:00 PM EST)
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                  {afternoonSlots.map((slot) => {
                    const isSelected = selectedSlot?.timestamp === slot.timestamp
                    const isHighlighted = slot.isWithin72h
                    return (
                      <Button
                        key={slot.timestamp}
                        variant={isSelected ? "default" : "outline"}
                        className={`h-12 relative ${
                          isHighlighted && !isSelected ? 'bg-green-50 border-green-500 hover:bg-green-100 text-green-800' : ''
                        }`}
                        onClick={() => onSlotSelect(slot)}
                      >
                        {isSelected && (
                          <CheckCircle className="h-4 w-4 absolute top-1 right-1" />
                        )}
                        {slot.time}
                      </Button>
                    )
                  })}
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