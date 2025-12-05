'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Sparkles } from "lucide-react"

export function ComingSoonBanner() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/waitlist/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          name: name || undefined,
          source: 'coming-soon-banner',
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to sign up')
      }

      setSuccess(true)
      setEmail('')
      setName('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section id="email-signup" className="py-24 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10">
      <div className="container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            Build Once,
            <span className="block text-primary">Own Forever</span>
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Build a startup website where you own the code - no hosting fees, no hidden costs, just pure creativity.
          </p>

          {/* Simple Email Signup Form */}
          <Card className="max-w-xl mx-auto mb-8 border-2 border-primary/20 shadow-lg">
            <CardContent className="p-8">
              <div className="flex items-center justify-center gap-2 mb-6">
                <Sparkles className="h-6 w-6 text-primary animate-pulse" />
                <h2 className="font-bold text-2xl">Get Early Access</h2>
                <Sparkles className="h-6 w-6 text-primary animate-pulse" />
              </div>

              {success ? (
                <div className="text-center py-6">
                  <div className="text-4xl mb-4">🎉</div>
                  <h3 className="text-xl font-semibold mb-2">You're on the list!</h3>
                  <p className="text-muted-foreground">
                    We'll notify you when we launch.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Name Input (Optional) */}
                  <div className="text-left">
                    <label htmlFor="name" className="block text-sm font-medium mb-2">
                      Your name (optional)
                    </label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={isSubmitting}
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Optional - helps us greet you properly in emails
                    </p>
                  </div>

                  {/* Email Input */}
                  <div className="text-left">
                    <label htmlFor="email" className="block text-sm font-medium mb-2">
                      Enter your email <span className="text-red-500">*</span>
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
                    className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Signing up...
                      </span>
                    ) : (
                      'Notify Me'
                    )}
                  </Button>

                  {/* Privacy Note */}
                  <p className="text-xs text-center text-muted-foreground mt-4">
                    No spam, just updates on the next launch.
                  </p>
                </form>
              )}
            </CardContent>
          </Card>

          <h2 className="text-2xl font-semibold text-center mb-8">Why Web Launch Academy?</h2>

          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-3xl mb-2">🚀</div>
              <h3 className="font-semibold text-lg mb-1">Built for Speed</h3>
              <p className="text-sm text-muted-foreground">Lightning fast websites that convert</p>
            </div>
            <div>
              <div className="text-3xl mb-2">⚡</div>
              <h3 className="font-semibold text-lg mb-1">AI-Powered</h3>
              <p className="text-sm text-muted-foreground">Smart development with Claude Code</p>
            </div>
            <div>
              <div className="text-3xl mb-2">💎</div>
              <h3 className="font-semibold text-lg mb-1">Own Forever</h3>
              <p className="text-sm text-muted-foreground">No startup subscription fees, complete ownership</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}