'use client'

import { useEffect, useState } from 'react'

interface PendingChangesAlertProps {
  count: number
  onScrollToDiffs: () => void
}

export default function PendingChangesAlert({ count, onScrollToDiffs }: PendingChangesAlertProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (count > 0) {
      setIsVisible(true)
    } else {
      setIsVisible(false)
    }
  }, [count])

  if (!isVisible) return null

  return (
    <div className="fixed bottom-24 right-4 z-50 animate-in slide-in-from-bottom">
      <button
        onClick={onScrollToDiffs}
        className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-4 rounded-lg shadow-2xl hover:scale-105 transition-transform flex items-center gap-3 border-2 border-yellow-300"
      >
        <div className="relative">
          <div className="absolute inset-0 bg-white/30 blur-lg rounded-full" />
          <svg
            className="w-6 h-6 relative z-10 animate-bounce"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </div>
        <div className="text-left">
          <div className="font-bold text-lg">{count} Changes Ready!</div>
          <div className="text-sm opacity-90">Click to review & approve</div>
        </div>
      </button>
    </div>
  )
}
