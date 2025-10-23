"use client"

// TODO: Re-implement admin sessions page for course_sessions
// This page was temporarily disabled during migration from video_sessions to course_sessions table
// Need to rebuild UI for managing course sessions with:
// - Session name, date, check-in code
// - Points configuration (live vs recording)
// - Recording URL management
// - Attendance tracking view

export default function AdminSessionsPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="max-w-2xl mx-auto text-center space-y-4">
        <h1 className="text-3xl font-bold">Course Sessions Management</h1>
        <p className="text-muted-foreground">
          This page is being rebuilt to work with the new points and attendance system.
        </p>
        <p className="text-sm text-muted-foreground">
          Coming soon: Create and manage course sessions, generate check-in codes, track attendance, and configure points.
        </p>
      </div>
    </div>
  )
}
