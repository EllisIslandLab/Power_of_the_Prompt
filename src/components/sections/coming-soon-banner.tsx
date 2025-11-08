'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { parseApiError } from "@/lib/error-parser"

export function ComingSoonBanner() {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [wantsOwnership, setWantsOwnership] = useState(false) // Default unchecked for conversion psychology
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/waitlist/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          name: name.trim() || undefined,
          wantsOwnership
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        // Parse Zod validation errors for user-friendly messages
        throw new Error(parseApiError(data, 'Failed to sign up for waitlist'))
      }

      // Success - show confirmation message
      console.log('Signup successful:', data)
      setIsSubmitted(true)
      setEmail('')
      setName('')
      setWantsOwnership(true)
    } catch (error) {
      console.error('Signup error:', error)
      setError(error instanceof Error ? error.message : 'Something went wrong. Please try again.')
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

          <Card className="max-w-md mx-auto mb-8">
            <CardContent className="p-6">
              {isSubmitted ? (
                <div className="text-center py-6">
                  <div className="text-6xl mb-4">🎉</div>
                  <h2 className="font-bold text-2xl mb-3 text-green-600">You're all set!</h2>
                  <p className="text-lg mb-2 font-semibold">
                    Check your email inbox
                  </p>
                  <p className="text-muted-foreground text-sm mb-4">
                    We just sent you a welcome message with next steps.
                    <br />
                    Don't see it? Check your spam folder.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => setIsSubmitted(false)}
                    className="mt-2"
                  >
                    Sign up another email
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <h2 className="font-semibold text-lg">Get Early Access</h2>
                  {error && (
                    <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-200">
                      <div className="font-semibold mb-1">⚠️ Signup Failed</div>
                      {error}
                    </div>
                  )}
                  <div className="space-y-3">
                    <div>
                      <Input
                        type="text"
                        placeholder="Your name (optional)"
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value)
                          if (error) setError('')
                        }}
                        className="w-full"
                        disabled={isSubmitting}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Optional - helps us greet you properly in emails
                      </p>
                    </div>
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value)
                        if (error) setError('') // Clear error when user starts typing
                      }}
                      required
                      className="w-full"
                      disabled={isSubmitting}
                    />
                    <div className="flex items-start gap-2 py-2">
                      <input
                        type="checkbox"
                        id="wantsOwnership"
                        checked={wantsOwnership}
                        onChange={(e) => setWantsOwnership(e.target.checked)}
                        className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        disabled={isSubmitting}
                      />
                      <label
                        htmlFor="wantsOwnership"
                        className="text-sm font-medium leading-tight cursor-pointer select-none"
                      >
                        Yes, I want a website I actually OWN.
                      </label>
                    </div>
                    <Button
                      type="submit"
                      disabled={isSubmitting || !email.trim()}
                      className="w-full relative"
                    >
                      {isSubmitting ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="animate-spin">⏳</span>
                          Signing you up...
                        </span>
                      ) : (
                        'Notify Me'
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
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