'use client'

import { diffLines, Change } from 'diff'

interface DiffOverlayProps {
  filePath: string
  oldContent: string
  newContent: string
  description: string
  currentIndex: number
  totalCount: number
  onNext?: () => void
  onPrevious?: () => void
}

export default function DiffOverlay({
  filePath,
  oldContent,
  newContent,
  description,
  currentIndex,
  totalCount,
  onNext,
  onPrevious,
}: DiffOverlayProps) {
  const diff = diffLines(oldContent, newContent)

  return (
    <div className="absolute inset-0 pointer-events-none flex items-start justify-end p-4">
      {/* Semi-transparent overlay panel on the right side */}
      <div className="pointer-events-auto w-[400px] max-h-[90vh] bg-card/95 backdrop-blur-md border-2 border-primary/40 rounded-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/20 to-accent/20 p-4 border-b border-border">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
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
              <span className="text-sm font-mono text-primary font-semibold truncate">
                {filePath}
              </span>
            </div>
            <span className="text-xs px-2 py-0.5 bg-yellow-500/20 text-yellow-500 rounded-full border border-yellow-500/30 whitespace-nowrap ml-2">
              Pending
            </span>
          </div>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>

        {/* Navigation if multiple changes */}
        {totalCount > 1 && (
          <div className="bg-muted/30 px-4 py-2 border-b border-border flex items-center justify-between">
            <button
              onClick={onPrevious}
              disabled={currentIndex === 0}
              className="text-xs px-2 py-1 bg-card border border-border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted/50"
            >
              ← Prev
            </button>
            <span className="text-xs text-muted-foreground">
              {currentIndex + 1} of {totalCount}
            </span>
            <button
              onClick={onNext}
              disabled={currentIndex === totalCount - 1}
              className="text-xs px-2 py-1 bg-card border border-border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted/50"
            >
              Next →
            </button>
          </div>
        )}

        {/* Diff Display - Scrollable */}
        <div className="flex-1 overflow-y-auto bg-background/95">
          <div className="font-mono text-xs">
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

        {/* Keyboard Shortcuts Help */}
        <div className="bg-muted/30 px-4 py-3 border-t border-border">
          <div className="text-xs space-y-1.5">
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-0.5 bg-card border border-border rounded text-[10px] font-mono">1</kbd>
              <span className="text-muted-foreground">Approve & Commit</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-0.5 bg-card border border-border rounded text-[10px] font-mono">2</kbd>
              <span className="text-muted-foreground">Reject</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-0.5 bg-card border border-border rounded text-[10px] font-mono">3</kbd>
              <span className="text-muted-foreground">Skip to next</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
