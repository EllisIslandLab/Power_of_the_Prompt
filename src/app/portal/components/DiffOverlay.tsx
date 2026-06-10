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
    <div className="absolute inset-0 flex flex-col pt-14 pr-[calc(33.333%+2rem)] pl-4 pb-4 bg-[#1e1e1e] overflow-auto z-10">
      {/* Full-width diff display */}
      <div className="flex flex-col">
        {/* Header */}
        <div className="mb-4">
          <div className="text-xs text-gray-400 font-mono mb-1">{filePath}</div>
          <div className="text-sm text-gray-300">{description}</div>
        </div>

        {/* Navigation if multiple changes */}
        {totalCount > 1 && (
          <div className="mb-3 flex items-center gap-3">
            <button
              onClick={onPrevious}
              disabled={currentIndex === 0}
              className="text-xs px-3 py-1 bg-[#0a0e27] text-white rounded border-2 border-white/30 disabled:opacity-30 disabled:cursor-not-allowed hover:border-white/40 hover:bg-[#080c25] transition-all shadow-md"
            >
              ← Prev
            </button>
            <span className="text-xs text-gray-400">
              {currentIndex + 1} of {totalCount}
            </span>
            <button
              onClick={onNext}
              disabled={currentIndex === totalCount - 1}
              className="text-xs px-3 py-1 bg-[#0a0e27] text-white rounded border-2 border-white/30 disabled:opacity-30 disabled:cursor-not-allowed hover:border-white/40 hover:bg-[#080c25] transition-all shadow-md"
            >
              Next →
            </button>
          </div>
        )}

        {/* Diff Display - Scrollable */}
        <div className="flex-1 overflow-auto">
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
      </div>
    </div>
  )
}
