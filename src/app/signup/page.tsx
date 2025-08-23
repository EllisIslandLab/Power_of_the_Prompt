'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'

export default function SignupPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isResend, setIsResend] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Basic validation
    if (!formData.fullName || !formData.email || !formData.password) {
      setError('All fields are required')
      setLoading(false)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Signup failed')
      }

      setSuccess(true)
      setIsResend(data.isResend || false)
      console.log('Signup successful:', data)
    } catch (err) {
      console.error('Signup error:', err)
      setError(err instanceof Error ? err.message : 'An error occurred during signup')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  if (success) {
    return (
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-md w-full space-y-8">
          <div className="space-y-6">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-accent/20">
              <svg className="h-8 w-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.9a.99.99 0 001.78 0L21 8m-16 8v4a1 1 0 001 1h12a1 1 0 001-1v-4"></path>
              </svg>
            </div>
            
            <h1 className="text-3xl font-bold text-foreground">
              {isResend ? 'Verification Email Resent!' : 'Check Your Email'}
            </h1>
            
            <div className="space-y-4">
              <p className="text-muted-foreground">
                {isResend 
                  ? `We've sent a new verification link to ` 
                  : `We've sent a verification link to `}
                <span className="font-semibold text-foreground">{formData.email}</span>
              </p>
              <p className="text-sm text-muted-foreground">
                {isResend 
                  ? 'Please check your email for the new verification link. The previous link is no longer valid.'
                  : 'Please check your email and click the verification link to activate your account.'}
              </p>
              {isResend && (
                <div className="p-3 bg-accent/10 border border-accent/20 rounded-md">
                  <p className="text-sm text-accent-foreground">
                    <strong>Note:</strong> We've also updated your account details with any changes you made.
                  </p>
                </div>
              )}
            </div>
            
            <Button asChild variant="outline" className="w-full">
              <Link href="/signin">
                Return to Sign In
              </Link>
            </Button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground">
            Join Web Launch Academy
          </h1>
          <p className="text-xl text-muted-foreground">
            Create your student account and start your journey
          </p>
        </div>
        
        <div className="bg-card rounded-lg border border-border p-8 shadow-sm">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-sm font-medium text-foreground">
                  Full Name
                </Label>
                <Input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  className="h-11"
                  placeholder="Enter your full name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-foreground">
                  Email Address
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="h-11"
                  placeholder="Enter your email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-foreground">
                  Password
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="h-11"
                  placeholder="Enter your password"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
                  Confirm Password
                </Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="h-11"
                  placeholder="Confirm your password"
                />
              </div>
            </div>

            {error && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-md p-4">
                <div className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                  </svg>
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-accent hover:bg-accent/90 text-accent-foreground font-semibold"
              size="lg"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>

            <div className="text-center pt-4 border-t border-border/50">
              <span className="text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link href="/signin" className="text-primary hover:text-primary/80 font-medium">
                  Sign in
                </Link>
              </span>
            </div>
          </form>
        </div>
      </div>
    </section>
  )
}