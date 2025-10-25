'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Eye, EyeOff, Shield } from 'lucide-react'

export default function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [credentials, setCredentials] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [signingIn, setSigningIn] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    checkAdminStatus()
  }, [])

  const checkAdminStatus = async () => {
    try {
      const response = await fetch('/api/admin/check-role', {
        credentials: 'include'
      })
      const data = await response.json()

      if (data.isAdmin) {
        setIsAdmin(true)
        setShowModal(false)
      } else {
        setShowModal(true)
      }
    } catch (error) {
      console.error('Admin check error:', error)
      setShowModal(true)
    } finally {
      setLoading(false)
    }
  }

  const handleAdminSignin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSigningIn(true)

    try {
      // Sign in via API
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Signin failed')
      }

      // Check if user is admin
      const roleCheck = await fetch('/api/admin/check-role', {
        credentials: 'include'
      })
      const roleData = await roleCheck.json()

      if (roleData.isAdmin) {
        setIsAdmin(true)
        setShowModal(false)
      } else {
        setError('You do not have admin access. Admin credentials required.')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Admin signin failed')
    } finally {
      setSigningIn(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!isAdmin && showModal) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-card rounded-lg border border-border shadow-xl max-w-md w-full p-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Admin Access Required
            </h2>
            <p className="text-muted-foreground">
              Please sign in with admin credentials to access this area
            </p>
          </div>

          <form onSubmit={handleAdminSignin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-email">Email</Label>
              <Input
                id="admin-email"
                type="email"
                value={credentials.email}
                onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                placeholder="admin@weblaunchacademy.com"
                required
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin-password">Password</Label>
              <div className="relative">
                <Input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  placeholder="Enter admin password"
                  required
                  className="pr-10"
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

            {error && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/portal')}
                className="flex-1"
              >
                Go to Portal
              </Button>
              <Button
                type="submit"
                disabled={signingIn}
                className="flex-1"
              >
                {signingIn ? 'Signing In...' : 'Sign In as Admin'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
