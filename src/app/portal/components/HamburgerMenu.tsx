'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

interface HamburgerMenuProps {
  user: any
  clientAccount: any
}

export default function HamburgerMenu({ user, clientAccount }: HamburgerMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const trialDaysRemaining = clientAccount?.trial_status === 'active'
    ? Math.ceil(
        (new Date(clientAccount.trial_expiration_date).getTime() - Date.now()) /
          (1000 * 60 * 60 * 24)
      )
    : 0

  return (
    <div className="relative">
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-muted/50 rounded-lg transition-colors"
        aria-label="Menu"
      >
        <svg
          className="w-6 h-6 text-foreground"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu Panel */}
          <div className="absolute bottom-full left-0 mb-2 w-72 bg-card rounded-lg shadow-lg border border-border z-20">
            {/* User Info */}
            <div className="px-4 py-3 border-b border-border">
              <p className="text-sm font-semibold text-foreground">
                {user?.full_name || 'User'}
              </p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>

            {/* Trial Status */}
            {clientAccount?.trial_status === 'active' && (
              <div className="px-4 py-3 bg-accent/10 border-b border-border">
                <p className="text-xs font-semibold text-accent-foreground">
                  Trial Period Active
                </p>
                <p className="text-xs text-muted-foreground">
                  {trialDaysRemaining} days remaining
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Free bug fixes during trial
                </p>
              </div>
            )}

            {/* Menu Items */}
            <div className="py-2">
              <button
                onClick={() => {
                  window.location.href = '/portal/website-settings'
                  setIsOpen(false)
                }}
                className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-muted/50 transition-colors"
              >
                Website Settings
              </button>
              <button
                onClick={() => {
                  window.location.href = '/portal/history'
                  setIsOpen(false)
                }}
                className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-muted/50 transition-colors"
              >
                Conversation History
              </button>
              <button
                onClick={() => {
                  window.location.href = '/portal/deployments'
                  setIsOpen(false)
                }}
                className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-muted/50 transition-colors"
              >
                Deployment History
              </button>
              <button
                onClick={() => {
                  window.location.href = '/portal/billing'
                  setIsOpen(false)
                }}
                className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-muted/50 transition-colors"
              >
                Billing & Balance
              </button>
              <button
                onClick={() => {
                  window.location.href = '/portal/preferences'
                  setIsOpen(false)
                }}
                className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-muted/50 transition-colors"
              >
                Preferences
              </button>
            </div>

            {/* Sign Out */}
            <div className="border-t border-border py-2">
              <button
                onClick={handleSignOut}
                className="w-full px-4 py-2 text-left text-sm text-destructive hover:bg-destructive/10 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
