'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import Link from 'next/link'
import { Check } from 'lucide-react'

export default function OnboardingPage() {
  const router = useRouter()
  const [phoneNumber, setPhoneNumber] = useState('')
  const [smsConsent, setSmsConsent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const formatPhoneNumber = (value: string) => {
    // Remove all non-numeric characters
    const phoneNumber = value.replace(/\D/g, '')

    // Format as (XXX) XXX-XXXX
    if (phoneNumber.length <= 3) {
      return phoneNumber
    } else if (phoneNumber.length <= 6) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`
    } else {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`
    }
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value)
    setPhoneNumber(formatted)
  }

  const validatePhoneNumber = (phone: string): boolean => {
    // Remove formatting and check if it's 10 digits
    const digits = phone.replace(/\D/g, '')
    return digits.length === 10
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Validate phone number if SMS consent is checked
    if (smsConsent && phoneNumber && !validatePhoneNumber(phoneNumber)) {
      setError('Please enter a valid 10-digit phone number')
      setLoading(false)
      return
    }

    // If SMS consent is checked, phone number is required
    if (smsConsent && !phoneNumber) {
      setError('Phone number is required for SMS notifications')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/onboarding/sms-consent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: phoneNumber.replace(/\D/g, ''), // Send only digits
          smsConsent,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save preferences')
      }

      setSuccess(true)

      // Redirect to portal after 2 seconds
      setTimeout(() => {
        router.push('/portal')
      }, 2000)
    } catch (err) {
      console.error('Onboarding error:', err)
      setError(err instanceof Error ? err.message : 'An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSkip = () => {
    router.push('/portal')
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-background">
        <div className="text-center max-w-md w-full space-y-6">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
            <Check className="h-8 w-8 text-green-600" />
          </div>

          <h1 className="text-3xl font-bold text-foreground">
            All Set! 🎉
          </h1>

          <p className="text-muted-foreground">
            Your preferences have been saved. Redirecting you to your student portal...
          </p>

          <div className="animate-pulse">
            <div className="h-1 bg-primary rounded-full w-24 mx-auto"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <div className="w-full max-w-lg space-y-8 py-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground">
            Welcome to Web Launch Academy! 🚀
          </h1>
          <p className="text-xl text-muted-foreground">
            Just one more step to get started
          </p>
        </div>

        <div className="bg-card rounded-lg border border-border p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phoneNumber" className="text-sm font-medium text-foreground">
                  Phone Number (Optional)
                </Label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  value={phoneNumber}
                  onChange={handlePhoneChange}
                  className="h-11"
                  placeholder="(555) 123-4567"
                  maxLength={14}
                />
                <p className="text-xs text-muted-foreground">
                  Get session reminders and important updates via text message
                </p>
              </div>

              <div className="bg-muted/50 border border-border rounded-lg p-4 space-y-4">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="smsConsent"
                    checked={smsConsent}
                    onCheckedChange={(checked) => setSmsConsent(checked as boolean)}
                    className="mt-1"
                  />
                  <div className="space-y-2 flex-1">
                    <Label
                      htmlFor="smsConsent"
                      className="text-sm font-medium leading-none cursor-pointer"
                    >
                      I consent to receive SMS notifications
                    </Label>
                    <div className="text-xs text-muted-foreground leading-relaxed space-y-2">
                      <p>
                        By checking this box, you agree to receive text messages from Web Launch Academy
                        at the phone number provided. Messages may include course updates, session reminders,
                        and important account notifications.
                      </p>
                      <p>
                        Message frequency varies (typically 2-8 messages per month). Message and data rates
                        may apply. Reply STOP to opt-out at any time. Reply HELP for assistance.
                      </p>
                      <p>
                        For more information, see our{' '}
                        <Link href="/privacy" className="text-primary hover:underline">
                          Privacy Policy
                        </Link>{' '}
                        and{' '}
                        <Link href="/terms" className="text-primary hover:underline">
                          Terms & Conditions
                        </Link>.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-md p-4">
                <div className="flex items-start gap-2">
                  <svg className="h-4 w-4 text-destructive mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                  </svg>
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-3">
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                size="lg"
              >
                {loading ? 'Saving...' : 'Continue to Portal'}
              </Button>

              <Button
                type="button"
                variant="ghost"
                onClick={handleSkip}
                disabled={loading}
                className="w-full h-11"
              >
                Skip for now
              </Button>
            </div>

            <p className="text-center text-xs text-muted-foreground">
              You can update these preferences anytime in your account settings
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
