'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

function VerifyEmailContent() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'expired'>('loading')
  const [message, setMessage] = useState('')
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('Invalid verification link')
      return
    }

    verifyEmail(token)
  }, [token])

  const verifyEmail = async (verificationToken: string) => {
    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: verificationToken }),
      })

      const data = await response.json()

      if (response.ok) {
        setStatus('success')
        setMessage('Your email has been verified successfully!')
      } else {
        if (data.error?.includes('expired')) {
          setStatus('expired')
          setMessage('Your verification link has expired')
        } else {
          setStatus('error')
          setMessage(data.error || 'Verification failed')
        }
      }
    } catch (error) {
      console.error('Verification error:', error)
      setStatus('error')
      setMessage('An error occurred during verification')
    }
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-md w-full space-y-8">
        <div className="space-y-6">
          {status === 'loading' && (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <h1 className="text-3xl font-bold text-foreground">
                Verifying your email...
              </h1>
              <p className="text-muted-foreground">
                Please wait while we verify your email address.
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-accent/20">
                <svg className="h-8 w-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-foreground">
                Email Verified!
              </h1>
              <p className="text-muted-foreground">
                {message}
              </p>
              <Button asChild className="w-full h-11 bg-accent hover:bg-accent/90 text-accent-foreground font-semibold">
                <Link href="/signin">
                  Sign In to Your Account
                </Link>
              </Button>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-destructive/10">
                <svg className="h-8 w-8 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-foreground">
                Verification Failed
              </h1>
              <p className="text-muted-foreground">
                {message}
              </p>
              <div className="space-y-3">
                <Button asChild variant="outline" className="w-full h-11">
                  <Link href="/signup">
                    Create New Account
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full h-11">
                  <Link href="/signin">
                    Back to Sign In
                  </Link>
                </Button>
              </div>
            </>
          )}

          {status === 'expired' && (
            <>
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-amber-100">
                <svg className="h-8 w-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-foreground">
                Link Expired
              </h1>
              <p className="text-muted-foreground">
                {message}. Please request a new verification email.
              </p>
              <div className="space-y-3">
                <ResendButton />
                <Button asChild variant="outline" className="w-full h-11">
                  <Link href="/signin">
                    Back to Sign In
                  </Link>
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  )
}

function ResendButtonContent() {
  const [resending, setResending] = useState(false)
  const [resendMessage, setResendMessage] = useState('')
  const searchParams = useSearchParams()

  const handleResend = async () => {
    setResending(true)
    setResendMessage('')

    // Try to get email from URL or ask user for it
    const email = prompt('Please enter your email address to resend verification:')
    
    if (!email) {
      setResending(false)
      return
    }

    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setResendMessage('✅ Verification email sent! Please check your inbox.')
      } else {
        setResendMessage(`❌ ${data.error || 'Failed to send email'}`)
      }
    } catch (error) {
      console.error('Resend error:', error)
      setResendMessage('❌ Failed to send email. Please try again.')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="space-y-3">
      <Button 
        onClick={handleResend}
        disabled={resending}
        className="w-full h-11 bg-accent hover:bg-accent/90 text-accent-foreground font-semibold"
      >
        {resending ? 'Sending...' : 'Resend Verification Email'}
      </Button>
      {resendMessage && (
        <p className="text-sm text-center text-muted-foreground">
          {resendMessage}
        </p>
      )}
    </div>
  )
}

function ResendButton() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResendButtonContent />
    </Suspense>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  )
}