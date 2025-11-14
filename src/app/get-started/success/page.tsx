'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, CheckCircle2, XCircle, Eye, Download } from 'lucide-react'
import PreviewModal from '@/components/demo-generator/PreviewModal'

function SuccessPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const [previewData, setPreviewData] = useState<any>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [tier, setTier] = useState<'demo' | 'bundle' | null>(null)

  useEffect(() => {
    const sessionId = searchParams.get('session_id')

    if (!sessionId) {
      setStatus('error')
      setMessage('No session ID found. Please try again.')
      return
    }

    processPayment(sessionId)
  }, [searchParams])

  const processPayment = async (sessionId: string) => {
    try {
      const response = await fetch('/api/demo-generator/process-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Payment processing failed')
      }

      const result = await response.json()

      setTier(result.tier)
      setPreviewData({
        demoProjectId: result.demoProjectId,
        html: result.html,
        businessName: result.businessName,
      })
      setStatus('success')

      if (result.tier === 'demo') {
        setMessage('Your AI-customized preview is ready! Click below to view it.')
      } else {
        setMessage('Your AI-customized preview is ready! You can now download your code and access the Walkthrough Guide.')
      }
    } catch (error: any) {
      console.error('Payment processing error:', error)
      setStatus('error')
      setMessage(error.message || 'Failed to process payment. Please contact support.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {status === 'loading' && (
              <Loader2 className="h-16 w-16 text-primary animate-spin" />
            )}
            {status === 'success' && (
              <CheckCircle2 className="h-16 w-16 text-green-500" />
            )}
            {status === 'error' && (
              <XCircle className="h-16 w-16 text-destructive" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {status === 'loading' && 'Processing Your Payment...'}
            {status === 'success' && 'Payment Successful!'}
            {status === 'error' && 'Payment Error'}
          </CardTitle>
          <CardDescription className="text-base mt-2">
            {status === 'loading' && 'Please wait while we process your payment and generate your AI-customized preview...'}
            {message}
          </CardDescription>
        </CardHeader>

        {status === 'success' && previewData && (
          <CardContent className="space-y-4">
            <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4 space-y-2">
              <h3 className="font-semibold text-green-900 dark:text-green-100 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                What's Next?
              </h3>
              <ul className="text-sm text-green-800 dark:text-green-200 space-y-1.5 ml-7">
                <li>✓ Payment confirmed</li>
                <li>✓ AI customization complete</li>
                <li>✓ Your preview is ready to view</li>
                {tier === 'bundle' && (
                  <>
                    <li>✓ Code download available</li>
                    <li>✓ Walkthrough Guide access granted</li>
                  </>
                )}
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => setShowPreview(true)}
                className="flex-1"
                size="lg"
              >
                <Eye className="h-5 w-5 mr-2" />
                View AI-Customized Preview
              </Button>

              {tier === 'bundle' && (
                <Button
                  variant="outline"
                  className="flex-1"
                  size="lg"
                  onClick={() => {
                    const sessionId = searchParams.get('session_id')
                    if (sessionId) {
                      // Direct download using session_id
                      window.location.href = `/api/demo-generator/download?session_id=${sessionId}`
                    }
                  }}
                >
                  <Download className="h-5 w-5 mr-2" />
                  Download Code & Guide
                </Button>
              )}
            </div>

            {tier === 'bundle' && (
              <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4 space-y-3">
                <p className="text-sm text-blue-900 dark:text-blue-100">
                  <strong>Bundle Customers:</strong> Your code and download link have been sent to your email. You can re-download anytime using the link (valid for 7 days).
                </p>
                <div className="flex items-center gap-2 text-xs text-blue-800 dark:text-blue-200">
                  <span className="font-semibold">Want full portal access?</span>
                  <Button
                    variant="link"
                    size="sm"
                    className="h-auto p-0 text-xs underline"
                    onClick={() => router.push(`/signup?email=${encodeURIComponent(previewData.userEmail || '')}&tier=${tier}`)}
                  >
                    Create a free account
                  </Button>
                </div>
              </div>
            )}

            {tier === 'demo' && (
              <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-4 space-y-3">
                <p className="text-sm text-amber-900 dark:text-amber-100">
                  <strong>Create Account:</strong> Sign up for free to save your demo and access the textbook included in your purchase.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => router.push(`/signup?email=${encodeURIComponent(previewData.userEmail || '')}&demo_id=${previewData.demoProjectId}&tier=tier1`)}
                >
                  Create Free Account
                </Button>
              </div>
            )}

            <div className="text-center pt-4">
              <Button
                variant="ghost"
                onClick={() => router.push('/portal')}
              >
                Go to Portal
              </Button>
            </div>
          </CardContent>
        )}

        {status === 'error' && (
          <CardContent className="text-center">
            <Button
              onClick={() => router.push('/get-started')}
              variant="outline"
            >
              Back to Demo Generator
            </Button>
          </CardContent>
        )}
      </Card>

      {/* Preview Modal */}
      {previewData && (
        <PreviewModal
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
          onBack={() => {
            setShowPreview(false)
            router.push('/get-started')
          }}
          hasAdditionalDetails={true}
          previewData={previewData}
        />
      )}
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Loader2 className="h-16 w-16 text-primary animate-spin" />
            </div>
            <CardTitle className="text-2xl">Loading...</CardTitle>
            <CardDescription className="text-base mt-2">
              Please wait while we load your payment details...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    }>
      <SuccessPageContent />
    </Suspense>
  )
}
