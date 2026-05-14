'use client'

import { useState, useEffect } from 'react'

interface BranchStatusBarProps {
  workingBranch: string | null
  pendingChanges: number
  onViewChanges?: () => void
}

export default function BranchStatusBar({
  workingBranch,
  pendingChanges,
  onViewChanges,
}: BranchStatusBarProps) {
  const [isAnimating, setIsAnimating] = useState(false)

  // Animate when branch changes
  useEffect(() => {
    if (workingBranch) {
      setIsAnimating(true)
      setTimeout(() => setIsAnimating(false), 1000)
    }
  }, [workingBranch])

  if (!workingBranch) return null

  return (
    <div
      className={`fixed top-16 right-4 z-50 transition-all duration-300 ${
        isAnimating ? 'scale-110' : 'scale-100'
      }`}
    >
      <div className="bg-primary/10 border-2 border-primary/30 rounded-lg px-4 py-2 backdrop-blur-sm shadow-lg">
        <div className="flex items-center gap-3">
          {/* Branch Icon */}
          <div className="flex items-center gap-2">
            <svg
              className="w-4 h-4 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
              />
            </svg>
            <span className="text-sm font-mono text-primary font-semibold">
              {workingBranch}
            </span>
          </div>

          {/* Pending Changes Badge */}
          {pendingChanges > 0 && (
            <>
              <div className="w-px h-4 bg-primary/30" />
              <button
                onClick={onViewChanges}
                className="flex items-center gap-2 hover:bg-primary/20 rounded px-2 py-1 transition-colors animate-pulse"
              >
                <div className="relative">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                  <div className="absolute inset-0 w-2 h-2 bg-yellow-500 rounded-full animate-ping" />
                </div>
                <span className="text-xs text-yellow-500 font-semibold">
                  ⬇️ {pendingChanges} pending {pendingChanges === 1 ? 'change' : 'changes'} - Scroll down!
                </span>
              </button>
            </>
          )}

          {/* Success indicator when no pending changes */}
          {pendingChanges === 0 && (
            <>
              <div className="w-px h-4 bg-primary/30" />
              <div className="flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span className="text-xs text-green-500 font-medium">All changes committed</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
