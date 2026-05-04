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
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="Menu"
      >
        <svg
          className="w-6 h-6 text-gray-700"
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
          <div className="absolute bottom-full left-0 mb-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
            {/* User Info */}
            <div className="px-4 py-3 border-b border-gray-200">
              <p className="text-sm font-semibold text-gray-900">
                {user?.full_name || 'User'}
              </p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>

            {/* Trial Status */}
            {clientAccount?.trial_status === 'active' && (
              <div className="px-4 py-3 bg-blue-50 border-b border-blue-100">
                <p className="text-xs font-semibold text-blue-900">
                  Trial Period Active
                </p>
                <p className="text-xs text-blue-700">
                  {trialDaysRemaining} days remaining
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Free bug fixes during trial!
                </p>
              </div>
            )}

            {/* Menu Items */}
            <div className="py-2">
              <button
                onClick={() => {
                  window.location.href = '/portal/history'
                  setIsOpen(false)
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                📜 Conversation History
              </button>
              <button
                onClick={() => {
                  window.location.href = '/portal/deployments'
                  setIsOpen(false)
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                🚀 Deployment History
              </button>
              <button
                onClick={() => {
                  window.location.href = '/portal/billing'
                  setIsOpen(false)
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                💳 Billing & Balance
              </button>
              <button
                onClick={() => {
                  window.location.href = '/portal/preferences'
                  setIsOpen(false)
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                ⚙️ Preferences
              </button>
            </div>

            {/* Sign Out */}
            <div className="border-t border-gray-200 py-2">
              <button
                onClick={handleSignOut}
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                🚪 Sign Out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
