'use client'

import { useState, useEffect, useRef } from 'react'
import DiffOverlay from './DiffOverlay'

interface PendingDiff {
  changeId: string
  filePath: string
  oldContent: string
  newContent: string
  description: string
  type: 'diff' | 'file_preview'
}

interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  tokens_used?: number
  cost_usd?: number
}

interface PreviewPanelProps {
  previewUrl: string | null
  conversationId: string | null
  pendingDiffs?: PendingDiff[]
  currentDiffIndex?: number
  onNextDiff?: () => void
  onPreviousDiff?: () => void
  messages?: Message[]
  isLoading?: boolean
  outputFontSize?: number
}

export default function PreviewPanel({
  previewUrl,
  conversationId,
  pendingDiffs = [],
  currentDiffIndex = 0,
  onNextDiff,
  onPreviousDiff,
  messages = [],
  isLoading = false,
  outputFontSize = 9,
}: PreviewPanelProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [changedElements, setChangedElements] = useState<string[]>([])
  const [isFullscreen, setIsFullscreen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const currentDiff = pendingDiffs[currentDiffIndex]

  // Auto-scroll messages to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Handle ESC key to exit fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isFullscreen])

  if (!previewUrl) {
    return (
      <div className="h-full flex items-center justify-center bg-muted/30 relative">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-foreground">Website Preview</h3>
          <p className="text-sm text-muted-foreground mt-2 max-w-md">
            Your live preview will appear here once changes are implemented.
          </p>
        </div>

        {/* Messages Overlay - Right Side (shown even without preview) */}
        {messages.length > 0 && (
          <div className="absolute right-0 top-0 bottom-0 w-1/3 pointer-events-none">
            <div className="h-full flex flex-col justify-end px-4 py-4 overflow-y-auto">
              <div className="space-y-3">
                {messages.map(message => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} pointer-events-auto`}
                  >
                    <div
                      className={`max-w-[90%] rounded-lg px-3 py-2 backdrop-blur-sm ${
                        message.role === 'user'
                          ? 'bg-primary/90 text-primary-foreground shadow-lg'
                          : message.role === 'system'
                          ? 'bg-destructive/80 text-destructive-foreground border border-destructive/30 shadow-lg'
                          : 'bg-card/90 text-foreground shadow-lg'
                      }`}
                      style={{ fontSize: `${outputFontSize}pt` }}
                    >
                      <div className="whitespace-pre-wrap leading-relaxed">{message.content}</div>
                      {message.tokens_used && message.cost_usd && (
                        <div className="text-xs mt-1.5 opacity-70">
                          {message.tokens_used.toLocaleString()} tokens • ${message.cost_usd.toFixed(4)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start pointer-events-auto">
                    <div className="bg-card/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      {/* Fullscreen Mode */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-background flex flex-col">
          {/* Fullscreen iframe */}
          <div className="flex-1 relative">
            <iframe
              src={previewUrl}
              className="absolute inset-0 w-full h-full border-0"
              title="Website Preview Fullscreen"
              sandbox="allow-same-origin allow-scripts allow-forms"
            />
          </div>

          {/* Fullscreen Controls - Small floating button at bottom */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
            <button
              onClick={() => setIsFullscreen(false)}
              className="px-4 py-2 bg-card/90 backdrop-blur border border-border rounded-lg shadow-lg hover:bg-card transition-colors text-sm flex items-center gap-2"
              title="Exit Fullscreen (ESC)"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Exit Fullscreen (ESC)
            </button>
          </div>
        </div>
      )}

      {/* Normal Mode */}
      <div className="h-full flex flex-col bg-card relative">
        {/* Navigation Controls (if multiple changes) */}
        {changedElements.length > 1 && (
          <div className="bg-muted/30 border-b border-border px-4 py-2 flex items-center justify-between">
            <button
              onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
              disabled={currentIndex === 0}
              className="px-3 py-1 text-sm bg-card border border-border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted/50"
            >
              ← Previous
            </button>
            <span className="text-sm text-muted-foreground">
              Change {currentIndex + 1} of {changedElements.length}
            </span>
            <button
              onClick={() => setCurrentIndex(Math.min(changedElements.length - 1, currentIndex + 1))}
              disabled={currentIndex === changedElements.length - 1}
              className="px-3 py-1 text-sm bg-card border border-border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted/50"
            >
              Next →
            </button>
          </div>
        )}

        {/* Preview iframe */}
        <div className="flex-1 relative">
          <iframe
            src={previewUrl}
            className="absolute inset-0 w-full h-full border-0"
            title="Website Preview"
            sandbox="allow-same-origin allow-scripts allow-forms"
          />

          {/* Diff Overlay */}
          {currentDiff && (
            <DiffOverlay
              filePath={currentDiff.filePath}
              oldContent={currentDiff.oldContent}
              newContent={currentDiff.newContent}
              description={currentDiff.description}
              currentIndex={currentDiffIndex}
              totalCount={pendingDiffs.length}
              onNext={onNextDiff}
              onPrevious={onPreviousDiff}
            />
          )}

          {/* Messages Overlay - Right Side */}
          {messages.length > 0 && (
            <div className="absolute right-0 top-0 bottom-0 w-1/3 pointer-events-none">
              <div className="h-full flex flex-col justify-end px-4 py-4 overflow-y-auto">
                <div className="space-y-3">
                  {messages.map(message => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} pointer-events-auto`}
                    >
                      <div
                        className={`max-w-[90%] rounded-lg px-3 py-2 backdrop-blur-sm ${
                          message.role === 'user'
                            ? 'bg-primary/90 text-primary-foreground shadow-lg'
                            : message.role === 'system'
                            ? 'bg-destructive/80 text-destructive-foreground border border-destructive/30 shadow-lg'
                            : 'bg-card/90 text-foreground shadow-lg'
                        }`}
                        style={{ fontSize: `${outputFontSize}pt` }}
                      >
                        <div className="whitespace-pre-wrap leading-relaxed">{message.content}</div>
                        {message.tokens_used && message.cost_usd && (
                          <div className="text-xs mt-1.5 opacity-70">
                            {message.tokens_used.toLocaleString()} tokens • ${message.cost_usd.toFixed(4)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start pointer-events-auto">
                      <div className="bg-card/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Preview Controls at Bottom */}
        <div className="bg-muted/30 border-t border-border px-4 py-2 flex items-center justify-between">
          <p className="text-xs text-muted-foreground flex-1">
            Preview: <a href={previewUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              {previewUrl}
            </a>
          </p>

          {/* Fullscreen Toggle Button */}
          <button
            onClick={() => setIsFullscreen(true)}
            className="ml-4 px-3 py-2 flex items-center gap-2 hover:bg-muted/50 rounded-lg transition-colors text-sm border border-border"
            title="Enter Fullscreen Mode"
          >
            <svg className="w-4 h-4 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
            <span className="text-foreground">Fullscreen</span>
          </button>
        </div>
      </div>
    </>
  )
}
