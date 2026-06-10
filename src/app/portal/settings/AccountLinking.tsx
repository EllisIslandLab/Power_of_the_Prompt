'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

/**
 * Account Linking Component
 * Allows users to add email/password login to their GitHub OAuth account
 * Solves the issue of having two separate accounts for the same email
 */

interface AccountLinkingProps {
  user: any
}

export default function AccountLinking({ user }: AccountLinkingProps) {
  const [email, setEmail] = useState(user?.email || '')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Check what login methods are currently available
  const hasEmailLogin = user?.app_metadata?.providers?.includes('email') || user?.identities?.some((i: any) => i.provider === 'email')
  const hasGitHubLogin = user?.app_metadata?.providers?.includes('github') || user?.identities?.some((i: any) => i.provider === 'github')

  const handleAddEmailPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)

    // Validation
    if (password.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters' })
      return
    }

    if (password !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' })
      return
    }

    setLoading(true)

    try {
      // Update user email and password
      const { error } = await supabase.auth.updateUser({
        email: email,
        password: password,
      })

      if (error) {
        throw error
      }

      setMessage({
        type: 'success',
        text: 'Email and password added successfully! You can now sign in with either GitHub or email/password.',
      })

      // Clear password fields
      setPassword('')
      setConfirmPassword('')
    } catch (error: any) {
      console.error('Failed to add email/password:', error)
      setMessage({
        type: 'error',
        text: error.message || 'Failed to add email/password login',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Account Login Methods</h3>

      {/* Current Login Methods */}
      <div className="mb-6">
        <p className="text-sm text-muted-foreground mb-3">Current login methods:</p>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            {hasGitHubLogin ? (
              <span className="text-green-500">✓</span>
            ) : (
              <span className="text-gray-400">○</span>
            )}
            <span>GitHub OAuth</span>
            {hasGitHubLogin && <span className="text-xs text-muted-foreground">(active)</span>}
          </div>
          <div className="flex items-center gap-2 text-sm">
            {hasEmailLogin ? (
              <span className="text-green-500">✓</span>
            ) : (
              <span className="text-gray-400">○</span>
            )}
            <span>Email & Password</span>
            {hasEmailLogin && <span className="text-xs text-muted-foreground">(active)</span>}
          </div>
        </div>
      </div>

      {/* Add Email/Password Form */}
      {!hasEmailLogin && (
        <>
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-4">
            <p className="text-sm text-blue-400">
              <strong>Add email/password login</strong> to access your account without GitHub.
              This is useful if you have trouble signing in with GitHub.
            </p>
          </div>

          <form onSubmit={handleAddEmailPassword} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                required
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Using your GitHub email: {user?.email}
              </p>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                required
                minLength={8}
                disabled={loading}
                placeholder="At least 8 characters"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                required
                minLength={8}
                disabled={loading}
                placeholder="Re-type your password"
              />
            </div>

            {/* Message Display */}
            {message && (
              <div
                className={`p-3 rounded-lg text-sm ${
                  message.type === 'success'
                    ? 'bg-green-500/10 border border-green-500/30 text-green-400'
                    : 'bg-red-500/10 border border-red-500/30 text-red-400'
                }`}
              >
                {message.text}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Adding...' : 'Add Email & Password Login'}
            </button>
          </form>
        </>
      )}

      {hasEmailLogin && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
          <p className="text-sm text-green-400">
            ✓ You can sign in with either GitHub or email/password.
          </p>
        </div>
      )}
    </div>
  )
}
