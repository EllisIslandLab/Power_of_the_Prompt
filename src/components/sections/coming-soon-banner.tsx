'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"

export function ComingSoonBanner() {
  const [email, setEmail] = useState('')
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
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong')
      }

      setIsSubmitted(true)
      setEmail('')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="py-24 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10">
      <div className="container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            Something Amazing is
            <span className="block text-primary">Coming Soon</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            We're putting the finishing touches on our new platform. 
            Be the first to know when we launch!
          </p>

          <Card className="max-w-md mx-auto mb-8">
            <CardContent className="p-6">
              {isSubmitted ? (
                <div className="text-center">
                  <div className="text-2xl mb-2">🎉</div>
                  <h3 className="font-semibold mb-2">Thanks for signing up!</h3>
                  <p className="text-muted-foreground text-sm">
                    Check your email for confirmation. We'll notify you as soon as we launch!
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <h3 className="font-semibold text-lg">Get Early Access</h3>
                  {error && (
                    <div className="text-sm text-red-600 bg-red-50 p-2 rounded border">
                      {error}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value)
                        if (error) setError('') // Clear error when user starts typing
                      }}
                      required
                      className="flex-1"
                      disabled={isSubmitting}
                    />
                    <Button 
                      type="submit" 
                      disabled={isSubmitting || !email.trim()}
                    >
                      {isSubmitting ? 'Signing up...' : 'Notify Me'}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    No spam, just updates on our launch.
                  </p>
                </form>
              )}
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-3xl mb-2">🚀</div>
              <h3 className="font-semibold mb-1">Built for Speed</h3>
              <p className="text-sm text-muted-foreground">Lightning fast websites that convert</p>
            </div>
            <div>
              <div className="text-3xl mb-2">🎯</div>
              <h3 className="font-semibold mb-1">AI-Powered</h3>
              <p className="text-sm text-muted-foreground">Smart development with Claude CLI</p>
            </div>
            <div>
              <div className="text-3xl mb-2">💎</div>
              <h3 className="font-semibold mb-1">Own Forever</h3>
              <p className="text-sm text-muted-foreground">No monthly fees, complete ownership</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}