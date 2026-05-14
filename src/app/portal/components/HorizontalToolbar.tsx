'use client'

import { useState } from 'react'

interface HorizontalToolbarProps {
  user?: any
  clientAccount?: any
  onImageUpload?: () => void
  onLayoutChange?: (layout: 'left' | 'right' | 'top' | 'bottom' | 'floating') => void
  currentLayout: string
}

export default function HorizontalToolbar({
  user,
  clientAccount,
  onImageUpload,
  onLayoutChange,
  currentLayout
}: HorizontalToolbarProps) {
  const [showLayoutMenu, setShowLayoutMenu] = useState(false)
  const [showHelpMenu, setShowHelpMenu] = useState(false)
  const [showExplorer, setShowExplorer] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [showGit, setShowGit] = useState(false)
  const [showTargets, setShowTargets] = useState(false)

  return (
    <div className="bg-card border-b border-border p-1 grid grid-cols-6 gap-0.5">
      {/* Upload Image */}
      <button
        onClick={onImageUpload}
        className="p-1 hover:bg-muted/50 rounded transition-colors"
        title="Upload Image • Drag & drop images into chat or click here"
      >
        <svg className="w-5 h-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </button>

      {/* Layout Config */}
      <div className="relative">
        <button
          onClick={() => setShowLayoutMenu(!showLayoutMenu)}
          className="p-1 hover:bg-muted/50 rounded transition-colors"
          title="Chat Layout Configuration"
        >
          <svg className="w-5 h-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h14a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3z" />
          </svg>
        </button>
        {showLayoutMenu && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setShowLayoutMenu(false)} />
            <div className="absolute top-full left-0 mt-1 bg-card border border-border rounded-lg shadow-lg p-2 z-20 min-w-[150px]">
              {['left', 'right', 'top', 'bottom', 'floating'].map(layout => (
                <button
                  key={layout}
                  onClick={() => {
                    onLayoutChange?.(layout as any)
                    setShowLayoutMenu(false)
                  }}
                  className={`w-full px-3 py-2 text-left rounded transition-colors text-sm ${
                    currentLayout === layout
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted/50'
                  }`}
                >
                  <span className="capitalize">{layout}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Explorer */}
      <button
        onClick={() => setShowExplorer(!showExplorer)}
        className="p-1 hover:bg-muted/50 rounded transition-colors"
        title="Explorer"
      >
        <svg className="w-5 h-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
      </button>

      {/* Search */}
      <button
        onClick={() => setShowSearch(!showSearch)}
        className="p-1 hover:bg-muted/50 rounded transition-colors"
        title="Search"
      >
        <svg className="w-5 h-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </button>

      {/* Version Control */}
      <button
        onClick={() => setShowGit(!showGit)}
        className="p-1 hover:bg-muted/50 rounded transition-colors"
        title="Version Control"
      >
        <svg className="w-5 h-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      </button>

      {/* Targets */}
      <button
        onClick={() => setShowTargets(!showTargets)}
        className="p-1 hover:bg-muted/50 rounded transition-colors"
        title="Targets"
      >
        <svg className="w-5 h-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      </button>

      {/* Mode Toggle */}
      <button
        className="p-1 hover:bg-muted/50 rounded transition-colors"
        title="Switch Mode"
      >
        <svg className="w-5 h-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      </button>

      {/* Help */}
      <div className="relative">
        <button
          onClick={() => setShowHelpMenu(!showHelpMenu)}
          className="p-1 hover:bg-muted/50 rounded transition-colors"
          title="Help & Tips"
        >
          <svg className="w-5 h-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
        {showHelpMenu && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setShowHelpMenu(false)} />
            <div className="absolute top-full left-0 mt-1 bg-card border border-border rounded-lg shadow-lg p-3 z-20 w-80">
              <div className="text-xs space-y-3">
                <div className="font-semibold text-foreground mb-2">Making Changes to Your Website</div>

                <div className="space-y-2 text-muted-foreground">
                  <div><strong className="text-foreground">1. Ask for changes:</strong> Tell me what you want in plain English</div>
                  <div className="pl-4 text-xs">Example: "Make the contact button bigger and green"</div>

                  <div><strong className="text-foreground">2. Review changes:</strong> I'll show you exactly what will change with a side-by-side comparison</div>

                  <div><strong className="text-foreground">3. Approve:</strong> Click "Approve & Commit" on each change you like, or "Reject" to skip it</div>

                  <div><strong className="text-foreground">4. Test locally:</strong> Pull the branch to your computer to test before going live</div>
                  <div className="pl-4 text-xs">Look for the branch name in the top-right corner</div>

                  <div><strong className="text-foreground">5. Go live:</strong> Merge the changes when you're happy with them</div>
                  <div className="pl-4 text-xs">Changes go live after merging - test first!</div>
                </div>

                <div className="pt-2 border-t border-border">
                  <div className="text-yellow-500"><strong>💡 Tip:</strong> Make one change at a time to keep things simple</div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Balance */}
      <button
        onClick={() => window.location.href = '/portal/billing'}
        className="p-1 hover:bg-muted/50 rounded transition-colors"
        title={`Account Balance: $${(clientAccount?.account_balance || 0).toFixed(2)}`}
      >
        <svg className="w-5 h-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>

      {/* Settings */}
      <button
        onClick={() => window.location.href = '/portal/settings'}
        className="p-1 hover:bg-muted/50 rounded transition-colors"
        title="Account Settings"
      >
        <svg className="w-5 h-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>
    </div>
  )
}
