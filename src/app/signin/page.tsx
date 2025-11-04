'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { Eye, EyeOff } from 'lucide-react'

export default function SigninPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [verificationMessage, setVerificationMessage] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setVerificationMessage('')
    setLoading(true)

    try {
      // Sign-in validation
      if (!formData.email || !formData.password) {
        setError('Email and password are required')
        setLoading(false)
        return
      }

      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.needsVerification) {
          setVerificationMessage(data.message || 'Please verify your email address before signing in.')
          return
        }
        throw new Error(data.error || 'Sign-in failed')
      }

      // Simple: All users go to portal after signin
      // Admins can manually go to /admin
      router.push('/portal')
    } catch (err) {
      console.error('Auth error:', err)
      setError(err instanceof Error ? err.message : 'An error occurred during sign-in')
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

  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground">
            Welcome Back
          </h1>
          <p className="text-xl text-muted-foreground">
            Sign in to your Web Launch Academy account
          </p>
        </div>

        <div className="bg-card rounded-lg border border-border p-8 shadow-sm">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-5">
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
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="h-11 pr-10"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
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

            {verificationMessage && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <div className="flex items-start gap-2">
                  <svg className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                  </svg>
                  <div>
                    <p className="text-sm text-blue-800 font-medium mb-1">Email Verification Required</p>
                    <p className="text-sm text-blue-700">{verificationMessage}</p>
                    <p className="text-xs text-blue-600 mt-2">
                      Don't see the email? Check your spam folder or contact support if you need help.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-accent hover:bg-accent/90 text-accent-foreground font-semibold"
              size="lg"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>

            <div className="text-center">
              <Link href="/forgot-password" className="text-sm text-primary hover:text-primary/80">
                Create New Password
              </Link>
            </div>
          </form>
        </div>
      </div>
    </section>
  )
}