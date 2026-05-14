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
        <div className="bg-card rounded-lg border border-border shadow-xl max-w-lg w-full p-6">
          {!hasProject ? (
            // Project Setup Prompt
            <>
              <h2 className="text-xl font-bold text-foreground mb-4">
                🚀 Connect Your Project
              </h2>

              <div className="text-sm text-foreground space-y-3 mb-6">
                <p>Before we can start building, let's connect your website repository.</p>

                <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                  <p className="font-semibold">Quick setup includes:</p>
                  <ul className="space-y-1 ml-4">
                    <li>• Connect your GitHub repository</li>
                    <li>• Detect frameworks and services</li>
                    <li>• Link deployment platforms (Vercel, etc.)</li>
                    <li>• Secure credential storage</li>
                  </ul>
                </div>

                <p className="text-muted-foreground text-xs">
                  Takes about 2 minutes to complete
                </p>
              </div>

              <div className="flex gap-3">
                <a
                  href="/portal/projects/new"
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium text-center"
                >
                  Connect Project →
                </a>
                <button
                  onClick={() => setIsVisible(false)}
                  className="px-4 py-2 border border-border rounded-lg hover:bg-muted/50 transition-colors text-sm font-medium"
                >
                  Later
                </button>
              </div>
            </>
          ) : (
            // Regular Welcome
            <>
              <h2 className="text-xl font-bold text-foreground mb-4">
                Welcome, {userName}!
              </h2>

              <div className="text-sm text-foreground space-y-3 mb-6">
                <p>I'm here to help you manage website revisions.</p>

                <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                  <p className="font-semibold">How it works:</p>
                  <ul className="space-y-1 ml-4">
                    <li>• Describe one change at a time for clarity</li>
                    <li>• I'll implement the change and generate a preview</li>
                    <li>• Review and approve before deploying to production</li>
                  </ul>
                </div>

                <p className="text-muted-foreground text-xs">
                  Tip: Use the "?" icon in the toolbar for more tips and shortcuts
                </p>
              </div>

              <p className="text-sm text-foreground mb-6 font-medium">
                What would you like to update?
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => handleAcknowledge(true)}
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                >
                  Acknowledge and don't show again
                </button>
                <button
                  onClick={() => handleAcknowledge(false)}
                  className="px-4 py-2 border border-border rounded-lg hover:bg-muted/50 transition-colors text-sm font-medium"
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
