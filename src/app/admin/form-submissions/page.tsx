"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import AdminDashboard from "@/components/portal/AdminDashboard"

export default function FormSubmissionsAdminPage() {
  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Client Form Submissions</h1>
          <p className="text-muted-foreground">
            Manage revision requests and video conference submissions from clients
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/admin">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Admin Dashboard
          </Link>
        </Button>
      </div>

      {/* Admin Dashboard Component */}
      <AdminDashboard />
    </div>
  )
}
