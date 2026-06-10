'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { Eye, EyeOff } from 'lucide-react'
import { createBrowserClient } from '@supabase/ssr'

function SigninContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [verificationMessage, setVerificationMessage] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [redirectTo, setRedirectTo] = useState<string | null>(null)

  // Get redirect parameter from URL
  useEffect(() => {
    const redirect = searchParams.get('redirect')
    if (redirect) {
      setRedirectTo(redirect)
    }

    // Check for error parameter
    const errorParam = searchParams.get('error')
    if (errorParam === 'session_expired') {
      setError('Your session expired. Please sign in again to continue.')
    }
  }, [searchParams])

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

      // Redirect to specified page or default to portal
      router.push(redirectTo || '/portal')
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

  const handleGitHubSignIn = async () => {
    setError('')
    setLoading(true)

    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback?next=${redirectTo || '/portal'}`
        }
      })

      if (error) throw error
    } catch (err) {
      console.error('GitHub auth error:', err)
      setError(err instanceof Error ? err.message : 'Failed to sign in with GitHub')
      setLoading(false)
    }
  }

  return (
    <>
      <div className="starfield"></div>
      <div className="nebula-glow" style={{ top: '20%', left: '15%' }}></div>
      <div className="nebula-glow" style={{ bottom: '20%', right: '15%' }}></div>
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-[#050714] pt-24">
        <div className="w-full max-w-md space-y-8 relative z-10">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="flex h-3 w-3 rounded-full bg-[#b1c6f9] pulse-blue"></span>
              <span className="text-[10px] font-bold tracking-[0.2em] text-[#b1c6f9] uppercase">Mission Control Access</span>
            </div>
            <h1 className="text-4xl font-bold text-white">
              Welcome Back
            </h1>
            <p className="text-base text-[#c4c7c8]">
              Sign in to your Web Launch Academy account
            </p>
          </div>

          <div className="glass-panel rounded-xl border-t-8 border-white p-8 relative">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[10px] font-bold uppercase tracking-widest text-[#c4c7c8]">
                  Email Address
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="h-11 bg-[#080c25] border-white/10 text-white placeholder:text-white/30 focus:border-white"
                  placeholder="your.email@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-[10px] font-bold uppercase tracking-widest text-[#c4c7c8]">
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
                    className="h-11 pr-10 bg-[#080c25] border-white/10 text-white placeholder:text-white/30 focus:border-white"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#c4c7c8] hover:text-white"
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
              className="w-full h-11 bg-[#FFB800] hover:brightness-110 text-[#271900] font-bold uppercase tracking-wider text-xs transition-all disabled:opacity-50"
              size="lg"
            >
              {loading ? 'Initializing...' : 'Access Portal'}
            </Button>

            <div className="text-center">
              <Link href="/forgot-password" className="text-sm text-[#b1c6f9] hover:text-white transition-colors">
                Create New Password
              </Link>
            </div>
          </form>

          {/* OAuth Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full blue-glow-line"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-[#050714] text-[#c4c7c8] text-[10px] font-bold uppercase tracking-widest">Or continue with</span>
            </div>
          </div>

          {/* GitHub Sign In */}
          <Button
            type="button"
            onClick={handleGitHubSignIn}
            disabled={loading}
            variant="outline"
            className="w-full h-11 font-semibold bg-white/5 border-white/20 text-white hover:bg-white/10"
            size="lg"
          >
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
            </svg>
            {loading ? 'Signing In...' : 'Sign in with GitHub'}
          </Button>
        </div>
        </div>
      </section>
    </>
  )
}

export default function SigninPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SigninContent />
    </Suspense>
  )
}