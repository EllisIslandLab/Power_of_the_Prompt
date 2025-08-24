'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface ExpiredLinkModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ExpiredLinkModal({ isOpen, onClose }: ExpiredLinkModalProps) {
  const [resending, setResending] = useState(false)
  const [resendMessage, setResendMessage] = useState('')
  const [email, setEmail] = useState('')
  const [showEmailInput, setShowEmailInput] = useState(false)

  if (!isOpen) return null

  const handleResend = async () => {
    if (!email) {
      setShowEmailInput(true)
      return
    }

    setResending(true)
    setResendMessage('')

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
        setResendMessage('✅ New verification email sent! Please check your inbox.')
        setShowEmailInput(false)
      } else {
        setResendMessage(`❌ ${data.error || 'Failed to send email'}`)
      }
    } catch (error) {
      // console.error('Resend error:', error) // Commented out for auth transition
      setResendMessage('❌ Failed to send email. Please try again.')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg border border-border p-6 w-full max-w-md shadow-lg">
        <div className="text-center space-y-4">
          {/* Warning Icon */}
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-amber-100">
            <svg className="h-8 w-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
          </div>
          
          <h2 className="text-2xl font-bold text-foreground">
            Verification Link Expired
          </h2>
          
          <p className="text-muted-foreground">
            The email verification link you clicked has expired. Don't worry - we'll get this fixed right away!
          </p>

          {resendMessage && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-800 font-medium">{resendMessage}</p>
            </div>
          )}

          {showEmailInput && (
            <div className="space-y-3">
              <input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                autoFocus
              />
            </div>
          )}
          
          <div className="space-y-3">
            {!showEmailInput ? (
              <>
                <Button 
                  onClick={() => setShowEmailInput(true)}
                  disabled={resending}
                  className="w-full h-11 bg-accent hover:bg-accent/90 text-accent-foreground font-semibold"
                >
                  Resend Verification Email
                </Button>
                
                <div className="flex gap-2">
                  <Button asChild variant="outline" className="flex-1 h-11">
                    <Link href="/signin">
                      Try Signing In
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="flex-1 h-11">
                    <Link href="/signup">
                      Sign Up Again
                    </Link>
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Button 
                  onClick={handleResend}
                  disabled={resending || !email}
                  className="w-full h-11 bg-accent hover:bg-accent/90 text-accent-foreground font-semibold"
                >
                  {resending ? 'Sending...' : 'Send New Verification Email'}
                </Button>
                
                <Button 
                  onClick={() => {
                    setShowEmailInput(false)
                    setEmail('')
                    setResendMessage('')
                  }}
                  variant="outline" 
                  className="w-full h-11"
                >
                  Back
                </Button>
              </>
            )}
          </div>
          
          <Button 
            onClick={onClose}
            variant="ghost" 
            className="w-full text-sm text-muted-foreground hover:text-foreground"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}