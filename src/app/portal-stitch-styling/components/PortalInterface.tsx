'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface PortalInterfaceProps {
  user: any
}

export default function PortalInterface({ user }: PortalInterfaceProps) {
  const [showWelcome, setShowWelcome] = useState(true)

  // Force space theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'space')
    document.documentElement.classList.add('dark')
    document.body.style.backgroundColor = '#050714'
    document.body.style.color = '#e5e7eb'

    // Check if user has dismissed welcome before
    const dismissed = localStorage.getItem('portal-welcome-dismissed-v2')
    if (dismissed) {
      setShowWelcome(false)
    }
  }, [])

  const handleDismissWelcome = (dontShowAgain: boolean) => {
    if (dontShowAgain) {
      localStorage.setItem('portal-welcome-dismissed-v2', 'true')
    }
    setShowWelcome(false)
  }

  const firstName = user?.full_name?.split(' ')[0] || 'there'

  return (
    <div className="min-h-screen bg-[#050714]">
      {/* Top bar with token budget */}
      <div className="fixed top-0 left-0 w-full h-1 bg-[#080c25]/50 z-50">
        <div className="h-full bg-gradient-to-r from-[#b1c6f9] to-[#FFB800] transition-all duration-300" style={{ width: '25%' }} />
      </div>

      {/* Sidebar - Stitch Style */}
      <nav className="fixed left-0 top-0 h-screen w-16 glass-panel border-r border-white/10 flex flex-col items-center py-6 z-50">
        {/* Logo */}
        <div className="mb-8">
          <Link href="/">
            <span className="material-symbols-outlined text-white text-2xl" style={{ fontVariationSettings: '"FILL" 1' }}>
              rocket_launch
            </span>
          </Link>
        </div>

        {/* Main Tools */}
        <div className="flex flex-col gap-6 items-center flex-1">
          <button className="p-2 rounded-lg bg-white/10 text-[#b1c6f9] glow-blue transition-all duration-200">
            <span className="material-symbols-outlined">dashboard</span>
          </button>
          <Link href="/portal/history">
            <button className="p-2 rounded-lg text-[#c4c7c8] hover:bg-white/5 transition-all">
              <span className="material-symbols-outlined">folder_open</span>
            </button>
          </Link>
          <button className="p-2 rounded-lg text-[#c4c7c8] hover:bg-white/5 transition-all">
            <span className="material-symbols-outlined">search</span>
          </button>
          <Link href="/portal/deployments">
            <button className="p-2 rounded-lg text-[#c4c7c8] hover:bg-white/5 transition-all">
              <span className="material-symbols-outlined">account_tree</span>
            </button>
          </Link>
          <button className="p-2 rounded-lg text-[#c4c7c8] hover:bg-white/5 transition-all">
            <span className="material-symbols-outlined">publish</span>
          </button>
        </div>

        {/* Bottom Tools */}
        <div className="flex flex-col gap-6 items-center pb-4">
          <Link href="/portal/settings">
            <button className="p-2 rounded-lg text-[#c4c7c8] hover:bg-white/5 transition-all">
              <span className="material-symbols-outlined">settings</span>
            </button>
          </Link>
          <button className="p-2 rounded-lg text-[#c4c7c8] hover:bg-white/5 transition-all">
            <span className="material-symbols-outlined">help</span>
          </button>
        </div>
      </nav>

      {/* Welcome modal */}
      {showWelcome && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => handleDismissWelcome(false)} />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4 md:p-8 pointer-events-none overflow-y-auto">
            <div className="pointer-events-auto max-w-2xl w-full my-auto">
              <div className="glass-panel rounded-xl border-t-8 border-white p-6 md:p-8 relative max-h-[85vh] overflow-y-auto">
                <div className="container-header">Portal.v1</div>

                <div className="mt-4 text-center">
                  <div className="flex items-center justify-center gap-3 mb-6">
                    <span className="flex h-3 w-3 rounded-full bg-[#b1c6f9] pulse-blue"></span>
                    <span className="text-[10px] font-bold tracking-[0.2em] text-[#b1c6f9] uppercase">Systems Ready</span>
                  </div>

                  <h1 className="text-2xl md:text-4xl font-bold text-white mb-3 md:mb-4 uppercase tracking-wider">
                    Welcome, {firstName}!
                  </h1>

                  <p className="text-sm md:text-base text-[#c4c7c8] mb-6 md:mb-8">
                    Your website revision portal. Describe changes, review previews, and deploy with confidence.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-8">
                    <div className="glass-panel rounded-lg p-4 border-t-2 border-white/50">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-[#FFB800] mb-2">Fast</div>
                      <div className="text-[8px] font-bold uppercase tracking-widest text-white">AI-Powered</div>
                    </div>
                    <div className="glass-panel rounded-lg p-4 border-t-2 border-white/50">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-[#FFB800] mb-2">Safe</div>
                      <div className="text-[8px] font-bold uppercase tracking-widest text-white">Preview First</div>
                    </div>
                    <div className="glass-panel rounded-lg p-4 border-t-2 border-white/50">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-[#FFB800] mb-2">Yours</div>
                      <div className="text-[8px] font-bold uppercase tracking-widest text-white">Full Control</div>
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-lg p-4 md:p-6 border border-white/10 mb-4 md:mb-6">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#FFB800] mb-2 md:mb-3">How it works:</p>
                    <ul className="space-y-1 md:space-y-2 text-left text-xs text-[#c4c7c8]">
                      <li>• Describe one change at a time</li>
                      <li>• Review and approve previews</li>
                      <li>• Deploy when ready</li>
                    </ul>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => handleDismissWelcome(true)}
                      className="flex-1 px-4 py-2 bg-[#FFB800] text-[#271900] rounded-lg hover:brightness-110 transition-all text-xs font-bold uppercase tracking-wider"
                    >
                      Got it, don't show again
                    </button>
                    <button
                      onClick={() => handleDismissWelcome(false)}
                      className="px-4 py-2 border border-white/20 bg-white/5 rounded-lg hover:bg-white/10 transition-colors text-xs font-bold uppercase tracking-wider text-white"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Main content */}
      <div className="pl-12 h-screen flex flex-col">
        {/* Main portal content */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4 uppercase tracking-wider">Your Workspace</h2>
            <p className="text-[#c4c7c8] mb-6">Start a conversation to begin making changes to your website.</p>
            <div className="text-xs text-[#c4c7c8]">
              <em>Full chat interface coming next...</em>
            </div>
          </div>
        </div>

        {/* Chat input area placeholder */}
        <div className="border-t border-white/10 p-4 bg-[#080c25]/50 backdrop-blur-md">
          <div className="flex items-center gap-3 bg-[#080c25]/80 backdrop-blur-sm border border-white/10 rounded-full px-4 py-3 max-w-4xl mx-auto">
            <input
              type="text"
              placeholder="Describe the change you'd like to make..."
              className="flex-1 bg-transparent text-white placeholder:text-[#c4c7c8]/60 focus:outline-none text-sm"
              disabled
            />
            <button
              disabled
              className="w-10 h-10 rounded-full bg-[#FFB800] hover:brightness-110 disabled:opacity-30 flex items-center justify-center"
            >
              <svg className="w-5 h-5 text-[#271900]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
