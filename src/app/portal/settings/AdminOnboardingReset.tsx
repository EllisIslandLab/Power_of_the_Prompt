'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

/**
 * Admin Onboarding Reset
 * Allows admin to reset their onboarding progress for testing
 * Only visible to admin users
 */

interface AdminOnboardingResetProps {
  user: any
  isAdmin: boolean
}

export default function AdminOnboardingReset({ user, isAdmin }: AdminOnboardingResetProps) {
  const [resetting, setResetting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Only show for admins
  if (!isAdmin) {
    return null
  }

  const handleResetOnboarding = async () => {
    if (!confirm('Reset onboarding progress? This will:\n\n• Clear project setup state\n• Reset service connections\n• Allow re-testing the full onboarding flow\n\nContinue?')) {
      return
    }

    setResetting(true)
    setMessage(null)

    try {
      // 1. Clear active project
      const { error: projectError } = await supabase
        .from('client_projects')
        .update({ is_active: false })
        .eq('user_id', user.id)

      if (projectError) throw projectError

      // 2. Clear service credentials (except essential ones)
      const { error: credentialsError } = await supabase
        .from('client_service_credentials')
        .delete()
        .eq('user_id', user.id)
        .not('service_name', 'in', '(vercel,github)') // Keep Vercel and GitHub

      if (credentialsError) throw credentialsError

      // 3. Clear client preferences (reset to defaults)
      const { error: prefsError } = await supabase
        .from('client_preferences')
        .delete()
        .eq('user_id', user.id)

      if (prefsError) throw prefsError

      setMessage({
        type: 'success',
        text: 'Onboarding reset successful! Refresh the page to start over.',
      })

      // Refresh after 2 seconds
      setTimeout(() => {
        window.location.href = '/portal'
      }, 2000)
    } catch (error: any) {
      console.error('Failed to reset onboarding:', error)
      setMessage({
        type: 'error',
        text: error.message || 'Failed to reset onboarding',
      })
    } finally {
      setResetting(false)
    }
  }

  return (
    <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-lg p-6">
      <div className="flex items-start gap-3 mb-4">
        <div className="flex-shrink-0">
          <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-yellow-400 mb-1">Admin: Test Onboarding</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Reset your onboarding progress to test the full flow from the beginning.
            This will clear your project setup and service connections.
          </p>

          <div className="bg-black/20 rounded-lg p-3 mb-4 text-xs space-y-1">
            <div className="flex items-start gap-2">
              <span className="text-yellow-400">•</span>
              <span>Deactivates current project</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-yellow-400">•</span>
              <span>Clears service credentials (keeps GitHub & Vercel)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-yellow-400">•</span>
              <span>Resets preferences to defaults</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-400">✓</span>
              <span>Preserves account balance & billing</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-400">✓</span>
              <span>Keeps GitHub & Vercel connections</span>
            </div>
          </div>

          {message && (
            <div
              className={`p-3 rounded-lg text-sm mb-4 ${
                message.type === 'success'
                  ? 'bg-green-500/10 border border-green-500/30 text-green-400'
                  : 'bg-red-500/10 border border-red-500/30 text-red-400'
              }`}
            >
              {message.text}
            </div>
          )}

          <button
            onClick={handleResetOnboarding}
            disabled={resetting}
            className="px-4 py-2 bg-yellow-500 text-black font-semibold rounded-lg hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {resetting ? 'Resetting...' : 'Reset Onboarding'}
          </button>
        </div>
      </div>
    </div>
  )
}
