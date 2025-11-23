'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatedBackground } from '@/components/effects/AnimatedBackground'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Mail, Sparkles, Shield, Clock } from 'lucide-react'

export default function GetStartedPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [promoCode, setPromoCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      // Create session with email and optional promo code
      const response = await fetch('/api/sessions/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          promoCode: promoCode || undefined
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to start')
      }

      // Check if payment required (no valid promo code)
      if (data.requiresPayment) {
        // Redirect to Stripe checkout
        window.location.href = data.checkoutUrl
        return
      }

      // Promo code valid or paid - redirect to builder
      router.push(`/get-started/build/${data.sessionId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setIsLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen bg-background">
      <AnimatedBackground />

      <div className="relative z-10 container mx-auto px-4 py-16">
        <div className="max-w-xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-primary rounded-2xl mb-6 shadow-lg">
              <Sparkles className="h-10 w-10 text-primary-foreground" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-primary">
              See Your Website in 60 Seconds
            </h1>
            <p className="text-lg text-muted-foreground">
              AI generates a cohesive, professional preview tailored to your business
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-card rounded-2xl shadow-xl p-8 border border-border">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Input */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    className="pl-10"
                  />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  One free preview per email address
                </p>
              </div>

              {/* Promo Code Input */}
              <div>
                <label htmlFor="promoCode" className="block text-sm font-medium text-foreground mb-2">
                  Promo Code <span className="text-muted-foreground">(optional)</span>
                </label>
                <Input
                  id="promoCode"
                  type="text"
                  placeholder="Enter code for free access"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  disabled={isLoading}
                  className="uppercase"
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading || !email}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6 text-lg shadow-lg"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="h-5 w-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                    Starting...
                  </span>
                ) : (
                  'Generate My Preview'
                )}
              </Button>

              {/* Pricing Note */}
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  {promoCode ? (
                    'Promo code will be validated on submit'
                  ) : (
                    <>$5 entry fee • <span className="text-green-600 dark:text-green-400">Rolls over to any purchase</span></>
                  )}
                </p>
              </div>
            </form>
          </div>

          {/* Benefits */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3 p-4 bg-card/50 rounded-xl">
              <Clock className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium text-foreground text-sm">60 Second Preview</p>
                <p className="text-xs text-muted-foreground">AI generates instantly</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-card/50 rounded-xl">
              <Sparkles className="h-5 w-5 text-accent mt-0.5" />
              <div>
                <p className="font-medium text-foreground text-sm">Cohesive Design</p>
                <p className="text-xs text-muted-foreground">Not a Frankenstein site</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-card/50 rounded-xl">
              <Shield className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
              <div>
                <p className="font-medium text-foreground text-sm">Price Rolls Over</p>
                <p className="text-xs text-muted-foreground">Never pay twice</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
