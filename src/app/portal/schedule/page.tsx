"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, Clock, ArrowLeft, Video, Users, Zap } from 'lucide-react'
import Link from 'next/link'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function SchedulePage() {
  return (
    <div className="container mx-auto p-6">
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
          Schedule your coaching sessions in advance and get calendar invites
        </p>
      </div>

      <div className="space-y-6">
        {/* Coming Soon Alert */}
        <Alert className="border-blue-500 bg-blue-50 dark:bg-blue-950">
          <Calendar className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800 dark:text-blue-200">
            <strong>Calendar Scheduling Coming Soon!</strong> We're building a full scheduling system with calendar integration, email reminders, and time slot booking. For now, please use the instant join feature in the Collaboration Hub or contact your coach directly to schedule sessions.
          </AlertDescription>
        </Alert>

        {/* Session Types Available for Scheduling */}
        <Card>
          <CardHeader>
            <CardTitle>Available Session Types</CardTitle>
            <CardDescription>
              These sessions will be available for advance booking
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {/* Group Coaching */}
              <div className="p-4 border-2 border-blue-500 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <Users className="h-8 w-8 text-blue-600" />
                  <div>
                    <h3 className="font-semibold">Group Coaching</h3>
                    <p className="text-xs text-muted-foreground">Unlimited time</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Interactive group learning sessions with your coach and peers
                </p>
                <ul className="text-xs space-y-1 text-muted-foreground">
                  <li>• Recurring weekly sessions</li>
                  <li>• Calendar invite included</li>
                  <li>• Email reminders</li>
                </ul>
              </div>

              {/* LVL UP Session */}
              <div className="p-4 border-2 border-green-500 bg-green-50 dark:bg-green-950 rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <Video className="h-8 w-8 text-green-600" />
                  <div>
                    <h3 className="font-semibold">LVL UP Session</h3>
                    <p className="text-xs text-muted-foreground">1 hour maximum</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  One-on-one focused session to improve your website or fix issues
                </p>
                <ul className="text-xs space-y-1 text-muted-foreground">
                  <li>• Book specific time slots</li>
                  <li>• Premium session type</li>
                  <li>• Personalized attention</li>
                </ul>
              </div>

              {/* Check-In */}
              <div className="p-4 border-2 border-purple-500 bg-purple-50 dark:bg-purple-950 rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <Zap className="h-8 w-8 text-purple-600" />
                  <div>
                    <h3 className="font-semibold">Check-In</h3>
                    <p className="text-xs text-muted-foreground">15 minutes</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Quick troubleshooting and surface-level consultation
                </p>
                <ul className="text-xs space-y-1 text-muted-foreground">
                  <li>• Instant or scheduled</li>
                  <li>• Free for all students</li>
                  <li>• Quick problem solving</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Planned Features */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Upcoming Scheduler Features
            </CardTitle>
            <CardDescription>
              What to expect when the scheduler launches
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Booking Features</h4>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>✓ View coach's available time slots</li>
                  <li>✓ Book sessions up to 2 weeks in advance</li>
                  <li>✓ Recurring session scheduling</li>
                  <li>✓ Automatic timezone conversion</li>
                  <li>✓ Instant confirmation emails</li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Calendar Integration</h4>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>✓ Add to Google Calendar</li>
                  <li>✓ Add to Outlook Calendar</li>
                  <li>✓ iCal file download</li>
                  <li>✓ Email reminders (24hr & 1hr before)</li>
                  <li>✓ Reschedule or cancel easily</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Temporary Workaround */}
        <Card className="border-2 border-primary">
          <CardHeader>
            <CardTitle>Schedule a Session Now</CardTitle>
            <CardDescription>
              While the scheduler is in development, here's how to book sessions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-semibold">For Instant Sessions:</h4>
              <p className="text-sm text-muted-foreground">
                Head back to the Collaboration Hub and join using the "Quick Join" buttons for Group Coaching, LVL UP, or Check-In sessions.
              </p>
              <Button asChild>
                <Link href="/portal/collaboration">
                  <Video className="h-4 w-4 mr-2" />
                  Go to Collaboration Hub
                </Link>
              </Button>
            </div>

            <div className="border-t pt-4 space-y-2">
              <h4 className="font-semibold">For Scheduled Sessions:</h4>
              <p className="text-sm text-muted-foreground">
                Contact your coach directly via email or during office hours to book a specific date and time. You'll receive a calendar invite and reminder emails.
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                💡 Coach email: <a href="mailto:coach@weblaunchacademy.com" className="text-primary hover:underline">coach@weblaunchacademy.com</a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
