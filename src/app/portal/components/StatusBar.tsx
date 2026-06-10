'use client'

import { useState, useEffect } from 'react'

/**
 * Status Bar - VS Code inspired
 * Shows at bottom with friendly status messages
 * Pattern based on VS Code's statusbarPart.ts
 */

interface StatusBarProps {
  unsavedChangesCount?: number
  lastSavedAt?: Date | null
  currentFile?: string | null
  fileSize?: number
}

export default function StatusBar({
  unsavedChangesCount = 0,
  lastSavedAt = null,
  currentFile = null,
  fileSize = 0
}: StatusBarProps) {
  const [timeAgo, setTimeAgo] = useState('')

  // Update time ago every minute
  useEffect(() => {
    const updateTimeAgo = () => {
      if (!lastSavedAt) {
        setTimeAgo('')
        return
      }

      const now = new Date()
      const diff = now.getTime() - lastSavedAt.getTime()
      const minutes = Math.floor(diff / 60000)
      const hours = Math.floor(minutes / 60)
      const days = Math.floor(hours / 24)

      if (days > 0) {
        setTimeAgo(`${days} day${days > 1 ? 's' : ''} ago`)
      } else if (hours > 0) {
        setTimeAgo(`${hours} hour${hours > 1 ? 's' : ''} ago`)
      } else if (minutes > 0) {
        setTimeAgo(`${minutes} minute${minutes > 1 ? 's' : ''} ago`)
      } else {
        setTimeAgo('just now')
      }
    }

    updateTimeAgo()
    const interval = setInterval(updateTimeAgo, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [lastSavedAt])

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return ''
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="fixed bottom-0 left-12 right-0 h-6 bg-[#0a0e27] border-t border-white/10 flex items-center justify-between px-4 text-xs z-20">
      {/* Left side */}
      <div className="flex items-center gap-4">
        {/* Unsaved changes indicator */}
        {unsavedChangesCount > 0 && (
          <div className="flex items-center gap-1.5 text-yellow-400">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">
              {unsavedChangesCount} file{unsavedChangesCount > 1 ? 's have' : ' has'} unsaved changes
            </span>
          </div>
        )}

        {/* Last saved */}
        {lastSavedAt && timeAgo && (
          <div className="flex items-center gap-1.5 text-gray-400">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Last saved: {timeAgo}</span>
          </div>
        )}

        {/* No changes indicator */}
        {unsavedChangesCount === 0 && !lastSavedAt && (
          <div className="flex items-center gap-1.5 text-green-400">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Everything saved</span>
          </div>
        )}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4 text-gray-400">
        {/* Current file name */}
        {currentFile && (
          <div className="flex items-center gap-1.5">
            <span>📄</span>
            <span>{currentFile}</span>
          </div>
        )}

        {/* File size */}
        {fileSize > 0 && (
          <div className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>{formatFileSize(fileSize)}</span>
          </div>
        )}

        {/* Portal indicator */}
        <div className="flex items-center gap-1.5 text-blue-400">
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
          <span>Portal Mode</span>
        </div>
      </div>
    </div>
  )
}
