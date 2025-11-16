'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function BuildPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function handlePaymentSuccess() {
      const stripeSessionId = searchParams.get('session_id')
      const paymentStatus = searchParams.get('payment')

      // If no payment params, redirect to get-started
      if (!stripeSessionId || paymentStatus !== 'success') {
        router.push('/get-started')
        return
      }

      try {
        // Create demo session after successful payment
        const response = await fetch('/api/sessions/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            builderType: 'ai_premium',
            stripeSessionId // Pass Stripe session ID for verification
          })
        })

        if (!response.ok) {
          throw new Error('Failed to create builder session')
        }

        const { sessionId } = await response.json()

        // Redirect to builder with new session
        router.push(`/get-started/build/${sessionId}`)
      } catch (err) {
        console.error('Error creating session after payment:', err)
        setError('Payment successful, but failed to start builder. Please contact support.')
      }
    }

    handlePaymentSuccess()
  }, [searchParams, router])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md p-8">
          <h1 className="text-2xl font-bold text-destructive mb-4">Error</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <button
            onClick={() => router.push('/get-started')}
            className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90"
          >
            Back to Start
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Setting up your AI Premium builder...</p>
      </div>
    </div>
  )
}

export default function GetStartedBuildPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <BuildPageContent />
    </Suspense>
  )
}
