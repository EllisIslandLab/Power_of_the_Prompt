'use client'

import { useState } from 'react'
import { diffLines, Change } from 'diff'

interface DiffViewerProps {
  changeId: string
  filePath: string
  oldContent: string
  newContent: string
  description: string
  onApprove: (changeId: string) => void
  onReject: (changeId: string) => void
}

export default function DiffViewer({
  changeId,
  filePath,
  oldContent,
  newContent,
  description,
  onApprove,
  onReject,
}: DiffViewerProps) {
  const [isProcessing, setIsProcessing] = useState(false)

  const diff = diffLines(oldContent, newContent)

  const handleApprove = async () => {
    setIsProcessing(true)
    try {
      await onApprove(changeId)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReject = async () => {
    setIsProcessing(true)
    try {
      await onReject(changeId)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="border-2 border-primary/40 rounded-lg p-4 my-4 bg-gradient-to-r from-primary/5 to-accent/5 shadow-lg animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            {/* File Icon with Glow */}
            <div className="relative">
              <div className="absolute inset-0 bg-primary/30 blur-md rounded-full" />
              <svg
                className="w-5 h-5 text-primary relative z-10"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div>
              <span className="text-sm font-mono text-primary font-semibold">{filePath}</span>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs px-2 py-0.5 bg-yellow-500/20 text-yellow-500 rounded-full border border-yellow-500/30">
                  Pending Approval
                </span>
              </div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-2 ml-8">{description}</p>
        </div>
      </div>

      {/* Diff Display */}
      <div className="bg-background border border-border rounded overflow-hidden mb-3">
        <div className="font-mono text-xs overflow-x-auto">
          {diff.map((part: Change, index: number) => {
            const bgColor = part.added
              ? 'bg-green-900/30'
              : part.removed
              ? 'bg-red-900/30'
              : 'bg-background'
            const textColor = part.added
              ? 'text-green-300'
              : part.removed
              ? 'text-red-300'
              : 'text-foreground'
            const symbol = part.added ? '+ ' : part.removed ? '- ' : '  '

            return (
              <div key={index} className={`${bgColor} ${textColor}`}>
                {part.value.split('\n').map((line, lineIndex) => (
                  <div key={lineIndex} className="px-3 py-0.5">
                    {line && (
                      <>
                        <span className="opacity-50">{symbol}</span>
                        {line}
                      </>
                    )}
                  </div>
                ))}
              </div>
            )
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleApprove}
          disabled={isProcessing}
          className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50 text-sm font-medium"
        >
          {isProcessing ? 'Committing...' : 'Approve & Commit'}
        </button>
        <button
          onClick={handleReject}
          disabled={isProcessing}
          className="px-4 py-2 bg-destructive/20 text-destructive rounded hover:bg-destructive/30 disabled:opacity-50 text-sm font-medium"
        >
          Reject
        </button>
      </div>
    </div>
  )
}
