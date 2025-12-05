'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { X, Mail, Sparkles, Gift } from 'lucide-react'
import { prefetchCategories } from '@/lib/prefetch-categories'

interface EmailSignupModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  source?: string
}

/**
 * Email Signup Modal
 *
 * Collects email addresses with ownership checkbox
 * Used on /get-started page to build waitlist and send promo codes
 *
 * Features:
 * - Email validation
 * - Ownership checkbox: "Yes, I want a website I actually OWN"
 * - Minimizes to bottom tab when clicking outside
 * - Can re-open from bottom tab
 * - Tab disappears after successful signup
 */
export function EmailSignupModal({ isOpen, onClose, onSuccess, source = 'popup' }: EmailSignupModalProps) {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [wantsOwnership, setWantsOwnership] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isMinimized, setIsMinimized] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  // Reset minimized state when modal opens
  useEffect(() => {
    if (isOpen && !success) {
      setIsMinimized(false)
    }
  }, [isOpen, success])

  if (!isOpen && !isMinimized) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      // Start prefetching categories immediately (don't await - let it run in background)
      prefetchCategories().catch(err => console.error('[Prefetch] Background prefetch failed:', err))

      const response = await fetch('/api/waitlist/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          name: name || undefined,
          wantsOwnership,
          source,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to sign up')
      }

      setSuccess(true)
      setEmail('')
      setName('')
      setWantsOwnership(false)

      // Call onSuccess callback if provided (for localStorage tracking)
      if (onSuccess) {
        onSuccess()
      }

      // Don't auto-close - let user read and dismiss manually
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleBackdropClick() {
    if (success) {
      // After success, clicking backdrop closes completely and hides tab
      setIsMinimized(false)
      onClose()
    } else {
      // Before success, minimize to bottom tab
      setIsAnimating(true)
      setTimeout(() => {
        setIsMinimized(true)
        setIsAnimating(false)
      }, 300)
    }
  }

  function handleRestore() {
    setIsMinimized(false)
  }

  function handleClose() {
    if (success) {
      // After success, close completely
      setIsMinimized(false)
      onClose()
    } else {
      // Before success, minimize instead
      handleBackdropClick()
    }
  }

  // Show minimized tab at bottom
  if (isMinimized && !success) {
    return (
      <button
        onClick={handleRestore}
        className="fixed bottom-4 right-4 z-50 flex items-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-full shadow-lg hover:bg-blue-700 transition-all hover:scale-105 animate-in slide-in-from-bottom duration-300"
      >
        <Gift className="h-5 w-5" />
        <span className="font-semibold">Get Promo Code</span>
      </button>
    )
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-50 ${
          isAnimating ? 'animate-out fade-out duration-300' : 'animate-in fade-in duration-200'
        }`}
        onClick={handleBackdropClick}
      />

      {/* Modal */}
      <div
        className={`fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md ${
          isAnimating
            ? 'animate-out zoom-out-95 slide-out-to-bottom duration-300'
            : 'animate-in zoom-in-95 duration-200'
        }`}
      >
        <div className="bg-white rounded-2xl shadow-2xl p-8 relative">
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close modal"
          >
            <X className="h-6 w-6" />
          </button>

          {success ? (
            /* Success State - stays until user dismisses */
            <div className="text-center py-6">
              <div className="mb-4">
                <Sparkles className="h-16 w-16 text-green-600 mx-auto animate-pulse" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                You're on the list! 🎉
              </h3>
              <p className="text-gray-600 mb-4">
                Check your email for your <strong>BUILDER25</strong> promo code!
              </p>
              <p className="text-sm text-gray-500 mb-6">
                Don't forget to check your spam/junk folder.
              </p>
              <Button
                onClick={handleClose}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Got it!
              </Button>
            </div>
          ) : (
            /* Signup Form */
            <>
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                  <Mail className="h-8 w-8 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Get Your Promo Code
                </h2>
                <p className="text-gray-600">
                  Sign up and receive <strong>BUILDER25</strong> for 25% off AI Premium
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name Input (Optional) */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Name (Optional)
                  </label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full"
                  />
                </div>

                {/* Email Input */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isSubmitting}
                    className="w-full"
                  />
                </div>

                {/* Ownership Checkbox */}
                <div className="flex items-start space-x-3 bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <Checkbox
                    id="ownership"
                    checked={wantsOwnership}
                    onCheckedChange={(checked) => setWantsOwnership(checked as boolean)}
                    disabled={isSubmitting}
                    className="mt-1"
                  />
                  <label
                    htmlFor="ownership"
                    className="text-sm font-medium text-gray-900 cursor-pointer leading-tight"
                  >
                    Yes, I want a website I actually OWN.
                    <span className="block text-xs text-gray-600 font-normal mt-1">
                      No monthly fees, complete control over your code
                    </span>
                  </label>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isSubmitting || !email}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Getting your code...
                    </span>
                  ) : (
                    'Get My Promo Code'
                  )}
                </Button>

                {/* Privacy Note */}
                <p className="text-xs text-center text-gray-500 mt-4">
                  We respect your privacy. Unsubscribe anytime.
                </p>
              </form>
            </>
          )}
        </div>
      </div>
    </>
  )
}
