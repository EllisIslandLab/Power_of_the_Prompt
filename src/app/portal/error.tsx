'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw, LayoutDashboard, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

/**
 * Portal Error Boundary
 *
 * Catches errors specific to the student portal and displays a contextual fallback UI.
 * This error boundary is scoped to /portal routes only.
 *
 * Features:
 * - Portal-branded error UI
 * - Quick navigation back to portal dashboard
 * - Error logging for debugging
 * - Development mode error details
 */

interface PortalErrorPageProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function PortalErrorPage({ error, reset }: PortalErrorPageProps) {
  useEffect(() => {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Portal Error Boundary caught an error:', error)
    }

    // TODO: Send to error tracking service with portal context
    // Example:
    // Sentry.captureException(error, {
    //   tags: { errorBoundary: 'portal', route: window.location.pathname },
    //   contexts: { digest: error.digest }
    // })
  }, [error])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Back to Portal Link */}
        <div className="mb-4">
          <Link
            href="/portal"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Portal
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 text-center border border-gray-200">
          {/* Error Icon */}
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-red-100 p-3">
              <AlertTriangle className="h-10 w-10 text-red-600" />
            </div>
          </div>

          {/* Error Title */}
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Portal Error
          </h1>

          {/* Error Description */}
          <p className="text-gray-600 mb-6">
            We encountered an error while loading this page in your student portal.
            Your progress and data are safe.
          </p>

          {/* Development Error Details */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-left">
              <p className="text-sm font-semibold text-red-800 mb-2">
                🔧 Development Error Details:
              </p>
              <div className="space-y-1">
                <p className="text-xs text-red-700 font-mono break-all">
                  {error.message}
                </p>
                {error.digest && (
                  <p className="text-xs text-red-600 font-mono">
                    Digest: {error.digest}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={reset}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>

            <Link href="/portal">
              <Button
                variant="outline"
                className="w-full sm:w-auto flex items-center gap-2"
              >
                <LayoutDashboard className="h-4 w-4" />
                Portal Dashboard
              </Button>
            </Link>
          </div>

          {/* Help Section */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-2">
              Need help?
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center text-sm">
              <Link
                href="/portal/support"
                className="text-blue-600 hover:text-blue-700 underline"
              >
                Contact Support
              </Link>
              <span className="hidden sm:inline text-gray-300">•</span>
              <Link
                href="/portal/resources"
                className="text-blue-600 hover:text-blue-700 underline"
              >
                View Resources
              </Link>
            </div>
          </div>
        </div>

        {/* Additional Help Text */}
        <p className="text-center text-sm text-gray-500 mt-4">
          If this problem persists, please reach out to your instructor or{' '}
          <a
            href="mailto:support@weblaunchacademy.com"
            className="text-blue-600 hover:text-blue-700 underline"
          >
            email support
          </a>
          .
        </p>
      </div>
    </div>
  )
}
