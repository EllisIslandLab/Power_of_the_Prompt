"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CalendarPickerProps {
  selectedDate: Date
  onDateSelect: (date: Date) => void
  minDate?: Date
}

// Season icons based on month
const getSeasonIcon = (month: number) => {
  // Spring: March (2), April (3), May (4)
  if (month >= 2 && month <= 4) return '🌸'
  // Summer: June (5), July (6), August (7)
  if (month >= 5 && month <= 7) return '😎'
  // Fall: September (8), October (9), November (10)
  if (month >= 8 && month <= 10) return '🍂'
  // Winter: December (11), January (0), February (1)
  return '⛄'
}

export function CalendarPicker({ selectedDate, onDateSelect, minDate }: CalendarPickerProps) {
  const [currentMonth, setCurrentMonth] = useState(selectedDate.getMonth())
  const [currentYear, setCurrentYear] = useState(selectedDate.getFullYear())

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  // Get the first day of the month
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1)
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0)

  // Get the day of week for the first day (0 = Sunday, 6 = Saturday)
  const startingDayOfWeek = firstDayOfMonth.getDay()

  // Total days in the month
  const daysInMonth = lastDayOfMonth.getDate()

  // Generate calendar days
  const calendarDays: (number | null)[] = []

  // Add empty slots for days before the first day of the month
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null)
  }

  // Add all days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day)
  }

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear(currentYear - 1)
    } else {
      setCurrentMonth(currentMonth - 1)
    }
  }

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear(currentYear + 1)
    } else {
      setCurrentMonth(currentMonth + 1)
    }
  }

  const handleDateClick = (day: number) => {
    const newDate = new Date(currentYear, currentMonth, day)

    // Check if date is before minDate
    if (minDate && newDate < minDate) {
      return
    }

    onDateSelect(newDate)
  }

  const isDateSelected = (day: number) => {
    return (
      day === selectedDate.getDate() &&
      currentMonth === selectedDate.getMonth() &&
      currentYear === selectedDate.getFullYear()
    )
  }

  const isDateDisabled = (day: number) => {
    if (!minDate) return false
    const date = new Date(currentYear, currentMonth, day)
    return date < minDate
  }

  const isToday = (day: number) => {
    const today = new Date()
    return (
      day === today.getDate() &&
      currentMonth === today.getMonth() &&
      currentYear === today.getFullYear()
    )
  }

  return (
    <Card className="overflow-hidden">
      {/* Month Header - Gradient background */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-4">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePrevMonth}
            className="h-10 w-10 hover:bg-white/20 text-white"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>

          <div className="text-xl font-bold flex items-center gap-3">
            <span className="text-3xl drop-shadow-lg">{getSeasonIcon(currentMonth)}</span>
            <span className="tracking-wide">{monthNames[currentMonth]} {currentYear}</span>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleNextMonth}
            className="h-10 w-10 hover:bg-white/20 text-white"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>
      </div>

      {/* Calendar Body - Paper white style */}
      <CardContent className="p-4 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
        {/* Days of week header */}
        <div className="grid grid-cols-7 mb-2">
          {daysOfWeek.map((day) => (
            <div
              key={day}
              className="text-center text-xs font-bold text-blue-700 dark:text-blue-400 py-2 border-b-2 border-slate-200 dark:border-slate-700"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid with borders */}
        <div className="grid grid-cols-7 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden shadow-inner">
          {calendarDays.map((day, index) => {
            if (day === null) {
              return (
                <div
                  key={`empty-${index}`}
                  className="aspect-square border-r border-b border-slate-200 dark:border-slate-700 bg-slate-100/50 dark:bg-slate-900/50"
                />
              )
            }

            const selected = isDateSelected(day)
            const disabled = isDateDisabled(day)
            const today = isToday(day)

            return (
              <button
                key={day}
                onClick={() => !disabled && handleDateClick(day)}
                disabled={disabled}
                className={cn(
                  'aspect-square border-r border-b border-slate-200 dark:border-slate-700 font-semibold transition-all relative',
                  !disabled && 'cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:scale-105 hover:z-10',
                  selected && 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold shadow-lg scale-105 z-20',
                  disabled && 'opacity-40 cursor-not-allowed hover:bg-transparent hover:scale-100 text-slate-400',
                  today && !selected && 'ring-2 ring-inset ring-blue-500 font-bold bg-blue-50 dark:bg-blue-950 text-blue-900 dark:text-blue-100',
                  !selected && !disabled && !today && 'bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200'
                )}
              >
                <span className="flex items-center justify-center h-full">
                  {day}
                </span>
                {today && !selected && (
                  <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full" />
                )}
              </button>
            )
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 mt-4 text-xs font-medium">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 ring-2 ring-blue-500 rounded flex items-center justify-center bg-blue-50 dark:bg-blue-950">
              <div className="w-1 h-1 bg-blue-500 rounded-full" />
            </div>
            <span>Today</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded shadow" />
            <span>Selected</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
