'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw, LayoutDashboard, ArrowLeft, Bug } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

/**
 * Admin Error Boundary
 *
 * Catches errors specific to the admin dashboard and displays a contextual fallback UI.
 * This error boundary is scoped to /admin routes only.
 *
 * Features:
 * - Admin-branded error UI with detailed debugging info
 * - Quick navigation back to admin dashboard
 * - Error logging for debugging
 * - Full error stack in development mode
 */

interface AdminErrorPageProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function AdminErrorPage({ error, reset }: AdminErrorPageProps) {
  useEffect(() => {
    // Log error to console
    console.error('Admin Error Boundary caught an error:', error)

    // TODO: Send to error tracking service with admin context
    // Example:
    // Sentry.captureException(error, {
    //   tags: {
    //     errorBoundary: 'admin',
    //     route: window.location.pathname,
    //     severity: 'high'
    //   },
    //   contexts: { digest: error.digest }
    // })
  }, [error])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        {/* Back to Admin Link */}
        <div className="mb-4">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Admin Dashboard
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 border border-red-200">
          {/* Error Icon */}
          <div className="flex items-center gap-3 mb-6">
            <div className="rounded-full bg-red-100 p-3">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Admin Panel Error
              </h1>
              <p className="text-sm text-gray-500">
                An error occurred in the admin dashboard
              </p>
            </div>
          </div>

          {/* Error Description */}
          <p className="text-gray-700 mb-6 leading-relaxed">
            The admin panel encountered an unexpected error. This has been logged and no data was lost.
            You can try again or return to the dashboard.
          </p>

          {/* Error Details - Always shown for admins */}
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Bug className="h-4 w-4 text-red-600" />
              <p className="text-sm font-semibold text-red-800">
                Error Details
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-xs font-semibold text-red-700 mb-1">Message:</p>
                <p className="text-sm text-red-900 font-mono bg-white p-2 rounded border border-red-200 break-all">
                  {error.message}
                </p>
              </div>

              {error.digest && (
                <div>
                  <p className="text-xs font-semibold text-red-700 mb-1">Error Digest:</p>
                  <p className="text-xs text-red-800 font-mono bg-white p-2 rounded border border-red-200">
                    {error.digest}
                  </p>
                </div>
              )}

              {process.env.NODE_ENV === 'development' && error.stack && (
                <div>
                  <p className="text-xs font-semibold text-red-700 mb-1">Stack Trace:</p>
                  <pre className="text-xs text-red-800 font-mono bg-white p-2 rounded border border-red-200 overflow-x-auto max-h-48 overflow-y-auto">
                    {error.stack}
                  </pre>
                </div>
              )}

              <div>
                <p className="text-xs font-semibold text-red-700 mb-1">Timestamp:</p>
                <p className="text-xs text-red-800 font-mono bg-white p-2 rounded border border-red-200">
                  {new Date().toISOString()}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <Button
              onClick={reset}
              className="flex items-center gap-2"
              size="lg"
            >
              <RefreshCw className="h-5 w-5" />
              Try Again
            </Button>

            <Link href="/admin" className="flex-1">
              <Button
                variant="outline"
                className="w-full flex items-center gap-2"
                size="lg"
              >
                <LayoutDashboard className="h-5 w-5" />
                Admin Dashboard
              </Button>
            </Link>
          </div>

          {/* Admin Navigation Links */}
          <div className="pt-6 border-t border-gray-200">
            <p className="text-sm font-medium text-gray-700 mb-3">
              Quick Navigation:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <Link
                href="/admin/users"
                className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
              >
                Users
              </Link>
              <Link
                href="/admin/leads"
                className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
              >
                Leads
              </Link>
              <Link
                href="/admin/campaigns"
                className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
              >
                Campaigns
              </Link>
              <Link
                href="/admin/services"
                className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
              >
                Services
              </Link>
            </div>
          </div>

          {/* Support Message */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center">
              If this error persists or seems critical, please investigate the logs
              or contact the development team.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
