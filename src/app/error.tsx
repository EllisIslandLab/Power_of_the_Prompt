'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'

/**
 * Root Error Boundary
 *
 * Catches all unhandled errors in the application and displays a fallback UI.
 * This is a Next.js 15 app router error boundary that automatically wraps
 * the root layout.
 *
 * Features:
 * - Graceful error handling with branded UI
 * - Error logging for debugging
 * - Reset and home navigation options
 * - Development mode error details
 *
 * @see https://nextjs.org/docs/app/building-your-application/routing/error-handling
 */

interface ErrorPageProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Root Error Boundary caught an error:', error)
    }

    // Send to Sentry if configured
    // To enable: Add NEXT_PUBLIC_SENTRY_DSN to .env.local and uncomment in sentry.client.config.ts
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(error, {
        tags: { errorBoundary: 'root' },
        contexts: { digest: error.digest }
      })
    }
  }, [error])

  return (
    <html lang="en">
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
          <div className="max-w-lg w-full">
            <div className="bg-white rounded-xl shadow-2xl p-8 text-center">
              {/* Error Icon */}
              <div className="flex justify-center mb-6">
                <div className="rounded-full bg-red-100 p-4">
                  <AlertTriangle className="h-12 w-12 text-red-600" />
                </div>
              </div>

              {/* Error Title */}
              <h1 className="text-3xl font-bold text-gray-900 mb-3">
                Oops! Something Went Wrong
              </h1>

              {/* Error Description */}
              <p className="text-gray-600 mb-6 leading-relaxed">
                We encountered an unexpected error. Don't worry, your data is safe and secure.
                Please try again or return to the homepage.
              </p>

              {/* Development Error Details */}
              {process.env.NODE_ENV === 'development' && (
                <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg text-left">
                  <p className="text-sm font-semibold text-red-800 mb-2">
                    🔧 Development Error Details:
                  </p>
                  <div className="space-y-2">
                    <p className="text-xs text-red-700 font-mono break-all">
                      <strong>Message:</strong> {error.message}
                    </p>
                    {error.digest && (
                      <p className="text-xs text-red-700 font-mono">
                        <strong>Digest:</strong> {error.digest}
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
                  size="lg"
                >
                  <RefreshCw className="h-5 w-5" />
                  Try Again
                </Button>

                <Button
                  variant="outline"
                  onClick={() => window.location.href = '/'}
                  size="lg"
                  className="flex items-center gap-2"
                >
                  <Home className="h-5 w-5" />
                  Go Home
                </Button>
              </div>

              {/* Support Message */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  If this problem persists, please{' '}
                  <a
                    href="mailto:support@weblaunchacademy.com"
                    className="text-blue-600 hover:text-blue-700 underline"
                  >
                    contact support
                  </a>
                  .
                </p>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
