'use client'

import { useState, useEffect } from 'react'

interface WelcomeMessageProps {
  userName: string
  hasProject?: boolean
}

export default function WelcomeMessage({ userName, hasProject = false }: WelcomeMessageProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    // If no project, always show setup prompt
    if (!hasProject) {
      setIsVisible(true)
      return
    }

    // Otherwise check if user has dismissed the welcome message
    const dismissed = localStorage.getItem('portal-welcome-dismissed')
    if (!dismissed) {
      setIsVisible(true)
    } else {
      setIsDismissed(true)
    }
  }, [hasProject])

  const handleAcknowledge = (dontShowAgain: boolean) => {
    if (dontShowAgain) {
      localStorage.setItem('portal-welcome-dismissed', 'true')
      setIsDismissed(true)
    }
    setIsVisible(false)
  }

  if (!isVisible || (isDismissed && hasProject)) return null

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-40" />

      {/* Welcome Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="glass-panel rounded-xl border-t-8 border-white shadow-2xl shadow-black/80 max-w-lg w-full p-8 relative ring-2 ring-white/20 bg-[#0a0e27]">
          <div className="container-header">System.v1</div>
          {!hasProject ? (
            // Project Setup Prompt
            <>
              <h2 className="text-xl font-bold text-white mb-4 mt-4 uppercase tracking-wider">
                🚀 Connect Your Project
              </h2>

              <div className="text-sm text-white space-y-3 mb-6">
                <p className="text-[#c4c7c8]">Before we can start building, let's connect your website repository.</p>

                <div className="bg-[#080c25] rounded-lg p-4 space-y-2 border border-white/20 shadow-md">
                  <p className="font-bold text-[10px] uppercase tracking-widest text-[#FFB800]">Quick setup includes:</p>
                  <ul className="space-y-1 ml-4 text-xs text-[#c4c7c8]">
                    <li>• Connect your GitHub repository</li>
                    <li>• Detect frameworks and services</li>
                    <li>• Link deployment platforms (Vercel, etc.)</li>
                    <li>• Secure credential storage</li>
                  </ul>
                </div>

                <p className="text-[#c4c7c8] text-xs">
                  Takes about 2 minutes to complete
                </p>
              </div>

              <div className="flex gap-3">
                <a
                  href="/portal/projects/new"
                  className="flex-1 px-4 py-2 bg-[#FFB800] text-[#271900] rounded-lg hover:brightness-110 transition-all text-xs font-bold uppercase tracking-wider shadow-md shadow-[#FFB800]/20 text-center"
                >
                  Connect Project →
                </a>
                <button
                  onClick={() => setIsVisible(false)}
                  className="px-4 py-2 border-2 border-white/30 bg-[#080c25] rounded-lg hover:border-white/40 hover:bg-[#0a0e27] transition-all text-xs font-bold uppercase tracking-wider text-white shadow-md"
                >
                  Later
                </button>
              </div>
            </>
          ) : (
            // Regular Welcome
            <>
              <h2 className="text-xl font-bold text-white mb-4 mt-4 uppercase tracking-wider">
                Welcome, {userName}!
              </h2>

              <div className="text-sm text-white space-y-3 mb-6">
                <p className="text-[#c4c7c8]">I'm here to help you manage website revisions.</p>

                <div className="bg-[#080c25] rounded-lg p-4 space-y-2 border border-white/20 shadow-md">
                  <p className="font-bold text-[10px] uppercase tracking-widest text-[#FFB800]">How it works:</p>
                  <ul className="space-y-1 ml-4 text-xs text-[#c4c7c8]">
                    <li>• Describe one change at a time for clarity</li>
                    <li>• I'll implement the change and generate a preview</li>
                    <li>• Review and approve before deploying to production</li>
                  </ul>
                </div>

                <p className="text-[#c4c7c8] text-xs">
                  Tip: Use the "?" icon in the toolbar for more tips and shortcuts
                </p>
              </div>

              <p className="text-sm text-white mb-6 font-medium">
                What would you like to update?
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => handleAcknowledge(true)}
                  className="flex-1 px-4 py-2 bg-[#FFB800] text-[#271900] rounded-lg hover:brightness-110 transition-all text-xs font-bold uppercase tracking-wider shadow-md shadow-[#FFB800]/20"
                >
                  Acknowledge and don't show again
                </button>
                <button
                  onClick={() => handleAcknowledge(false)}
                  className="px-4 py-2 border-2 border-white/30 bg-[#080c25] rounded-lg hover:border-white/40 hover:bg-[#0a0e27] transition-all text-xs font-bold uppercase tracking-wider text-white shadow-md"
                >
                  Thanks for the reminder
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}
