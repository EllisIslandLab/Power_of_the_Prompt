'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'

function SignupContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  
  const [inviteData, setInviteData] = useState<{
    email: string
    full_name?: string
    tier: string
    valid: boolean
    error?: string
  } | null>(null)
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  
  const [loading, setLoading] = useState(true)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // Validate invite token on component mount
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setInviteData({ email: '', tier: '', valid: false, error: 'No invite token provided' })
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/auth/validate-invite?token=${token}`)
        const data = await response.json()
        
        if (response.ok && data.valid) {
          setInviteData({
            email: data.email,
            full_name: data.full_name,
            tier: data.tier,
            valid: true
          })
          
          // Pre-fill form with invite data
          setFormData(prev => ({
            ...prev,
            email: data.email,
            fullName: data.full_name || ''
          }))
        } else {
          setInviteData({
            email: '',
            tier: '',
            valid: false,
            error: data.error || 'Invalid or expired invite token'
          })
        }
      } catch (err) {
        setInviteData({
          email: '',
          tier: '',
          valid: false,
          error: 'Failed to validate invite token'
        })
      } finally {
        setLoading(false)
      }
    }

    validateToken()
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitLoading(true)

    // Basic validation
    if (!formData.fullName || !formData.email || !formData.password) {
      setError('All fields are required')
      setSubmitLoading(false)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setSubmitLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long')
      setSubmitLoading(false)
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
          inviteToken: token
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Signup failed')
      }

      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during signup')
    } finally {
      setSubmitLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Validating invite...</p>
        </div>
      </div>
    )
  }

  // Invalid token state
  if (!inviteData?.valid) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground">Invalid Invite</h2>
            <p className="mt-4 text-muted-foreground">
              {inviteData?.error || 'This signup link is invalid or has expired.'}
            </p>
            <div className="mt-6">
              <Link href="/">
                <Button variant="outline">
                  Return to Home
                </Button>
              </Link>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              If you believe this is an error, please contact us for a new invitation.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Success state
  if (success) {
    return (
      <section className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-6">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-foreground">
              Welcome to Web Launch Academy!
            </h1>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Your account has been created successfully! Please check your email and click the verification link to activate your account.
              </p>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-800">
                  <strong>Access Level:</strong> {inviteData.tier === 'full' ? 'Full Access' : 'Free Tier'} - 
                  You'll have access to {inviteData.tier === 'full' ? 'all course materials and premium features' : 'basic course materials and community features'}.
                </p>
              </div>
            </div>
            
            <Button asChild className="w-full h-11 bg-accent hover:bg-accent/90 text-accent-foreground font-semibold">
              <Link href="/signin">
                Continue to Sign In
              </Link>
            </Button>
          </div>
        </div>
      </section>
    )
  }

  // Signup form
  return (
    <section className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground">
            Join Web Launch Academy
          </h1>
          <p className="text-xl text-muted-foreground">
            Complete your student account setup
          </p>
          
          {/* Show invite details */}
          <div className="p-4 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-800">
              <strong>Invited to:</strong> {inviteData.tier === 'full' ? 'Full Access' : 'Free Tier'} • 
              <strong>Email:</strong> {inviteData.email}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="space-y-4">
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
                placeholder="Enter your email address"
                disabled // Email comes from invite
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
                placeholder="Create a secure password"
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

          <Button
            type="submit"
            disabled={submitLoading}
            className="w-full h-11 bg-accent hover:bg-accent/90 text-accent-foreground font-semibold"
            size="lg"
          >
            {submitLoading ? 'Creating Account...' : 'Create My Account'}
          </Button>
          
          <div className="text-center">
            <Link href="/signin" className="text-sm text-primary hover:text-primary/80">
              Already have an account? Sign in
            </Link>
          </div>
        </form>
      </div>
    </section>
  )
}

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <SignupContent />
    </Suspense>
  )
}