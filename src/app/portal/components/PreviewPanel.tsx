'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import DiffOverlay from './DiffOverlay'
import MobilePhoneFrame from './MobilePhoneFrame'
import DesktopBrowserFrame from './DesktopBrowserFrame'

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

interface OpenFile {
  path: string
  name: string
  content: string
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
  isFullscreenLayout?: boolean
  openFiles?: OpenFile[]
  activeFileIndex?: number
  onFileSelect?: (index: number) => void
  onFileClose?: (index: number) => void
  showPreview?: boolean
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
  isFullscreenLayout = false,
  openFiles = [],
  activeFileIndex = 0,
  onFileSelect,
  onFileClose,
  showPreview = true,
}: PreviewPanelProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [changedElements, setChangedElements] = useState<string[]>([])
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [viewMode, setViewMode] = useState<'mobile' | 'desktop'>('mobile')
  const [showEnvInstructions, setShowEnvInstructions] = useState(false)
  const [setupCommand, setSetupCommand] = useState<string | null>(null)
  const [generatingSetup, setGeneratingSetup] = useState(false)

  console.log('[PreviewPanel] State:', {
    showPreview,
    openFilesCount: openFiles.length,
    activeFileIndex,
    hasActiveFile: !!openFiles[activeFileIndex],
    hasPreviewUrl: !!previewUrl,
    isFullscreen
  })
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  // Generate setup command
  const generateSetupCommand = async () => {
    setGeneratingSetup(true)
    try {
      const response = await fetch('/api/setup/generate', { method: 'POST' })
      const data = await response.json()

      if (data.success) {
        setSetupCommand(data.command)
      } else {
        console.error('Failed to generate setup command:', data.error)
      }
    } catch (error) {
      console.error('Error generating setup command:', error)
    } finally {
      setGeneratingSetup(false)
    }
  }

  // Drag-to-scroll state
  const [isDragging, setIsDragging] = useState(false)
  const [startY, setStartY] = useState(0)
  const [scrollTop, setScrollTop] = useState(0)
  const dragThreshold = 5 // pixels to move before considering it a drag

  const currentDiff = pendingDiffs[currentDiffIndex]

  const shouldShowDiff = !!(currentDiff && openFiles.length === 0 && !isFullscreenLayout)

  // Auto-scroll messages to bottom when new messages arrive
  useEffect(() => {
    if (!isDragging && messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
    }
  }, [messages, isDragging])

  // Drag-to-scroll handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Only start drag if clicking on the container (not on a message bubble)
    if (e.target === messagesContainerRef.current) {
      setIsDragging(true)
      setStartY(e.pageY)
      setScrollTop(messagesContainerRef.current?.scrollTop || 0)
      e.preventDefault()
    }
  }, [])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !messagesContainerRef.current) return

    const y = e.pageY
    const walk = (startY - y) * 2 // Multiply by 2 for faster scrolling
    messagesContainerRef.current.scrollTop = scrollTop + walk
  }, [isDragging, startY, scrollTop])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  // Add/remove mouse event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      // Prevent text selection while dragging
      document.body.style.userSelect = 'none'
      document.body.style.cursor = 'grabbing'
    } else {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.userSelect = ''
      document.body.style.cursor = ''
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.userSelect = ''
      document.body.style.cursor = ''
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

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


  // Only show the simple message if no preview AND no files to show
  if (!previewUrl && (showPreview || openFiles.length === 0)) {
    return (
      <div className="h-full flex items-center justify-center bg-[#0a0e27]/50 relative">
        <div className="text-center">
          <h3 className="text-sm font-bold text-white uppercase tracking-widest">Website Preview</h3>
          <p className="text-xs text-[#c4c7c8] mt-2 max-w-md">
            Your live preview will appear here once changes are implemented.
          </p>
        </div>

        {/* Messages Overlay - Right Side */}
        {messages.length > 0 && !isFullscreenLayout && (
          <div className="absolute right-0 top-0 bottom-0 w-1/3 pointer-events-none">
            <div
              ref={messagesContainerRef}
              onMouseDown={handleMouseDown}
              className="h-full flex flex-col px-4 py-4 overflow-y-auto pointer-events-auto group chat-scroll"
              style={{
                cursor: isDragging ? 'grabbing' : 'default'
              }}
            >
              <div className="flex-1 min-h-0" />
              <div className="space-y-3">
                {messages.map(message => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[90%] rounded-lg px-3 py-2 backdrop-blur-md ${
                        message.role === 'user'
                          ? 'bg-[#b1c6f9] text-[#001945] shadow-lg shadow-[#b1c6f9]/20 font-medium'
                          : message.role === 'system'
                          ? 'bg-destructive text-destructive-foreground border-2 border-destructive/50 shadow-lg'
                          : 'bg-[#0a0e27] text-white shadow-lg shadow-black/50 border-2 border-white/20'
                      }`}
                      style={{ fontSize: `${outputFontSize}pt` }}
                    >
                      <div className="whitespace-pre-wrap leading-relaxed select-text">{message.content}</div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-[#0a0e27] backdrop-blur-md rounded-lg px-3 py-2 shadow-lg shadow-black/50 border-2 border-white/20">
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
      {/* Normal Mode */}
      <div className="h-full flex flex-col relative">
        {/* Floating File Tabs - Only show when viewing files */}
        {!showPreview && openFiles.length > 0 && (
          <div className="absolute top-2 left-2 right-[calc(33.333%+1rem)] z-30 flex items-center gap-2 overflow-x-auto group tabs-scroll">
            <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-[#1e1e1e]/0 group-hover:bg-[#1e1e1e]/95 transition-all duration-200 backdrop-blur-sm">
              {/* File Tabs */}
              {openFiles.map((file, index) => (
                <div
                  key={file.path}
                  onClick={() => onFileSelect?.(index)}
                  className={`flex items-center gap-2 px-3 py-1 text-xs cursor-pointer transition-colors whitespace-nowrap rounded ${
                    index === activeFileIndex
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-[#252526]'
                  }`}
                >
                  <span>📄</span>
                  <span className="truncate max-w-[120px]">{file.name}</span>
                  <span
                    onClick={(e) => {
                      e.stopPropagation()
                      onFileClose?.(index)
                    }}
                    className="hover:text-red-400 cursor-pointer ml-1"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

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

        {/* Preview Controls - Mobile/Desktop Toggle */}
        {showPreview && !shouldShowDiff && (
          <div className="bg-[#0a0e27] border-b-2 border-white/20 px-4 py-2 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              {/* Mobile/Desktop Toggle */}
              <div className="flex bg-[#080c25] border-2 border-white/30 rounded-lg p-1 gap-1">
                <button
                  onClick={() => setViewMode('mobile')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                    viewMode === 'mobile'
                      ? 'bg-[#0a0e27] text-[#b1c6f9] shadow-md'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="7" y="2.5" width="10" height="19" rx="2.4" />
                    <line x1="11" y1="18.3" x2="13" y2="18.3" />
                  </svg>
                  Mobile
                </button>
                <button
                  onClick={() => setViewMode('desktop')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                    viewMode === 'desktop'
                      ? 'bg-[#0a0e27] text-[#b1c6f9] shadow-md'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2.5" y="4" width="19" height="13" rx="2" />
                    <line x1="8.5" y1="20.5" x2="15.5" y2="20.5" />
                    <line x1="12" y1="17" x2="12" y2="20.5" />
                  </svg>
                  Desktop
                </button>
              </div>
              <span className="text-xs text-white/50 font-mono tracking-wide">
                {viewMode === 'mobile' ? '390 × 844' : 'responsive'}
              </span>
            </div>

            {/* Download .env.local button */}
            <a
              href="/api/portal/env"
              download=".env.local"
              onClick={(e) => {
                // Show instructions after download starts
                setTimeout(() => setShowEnvInstructions(true), 100)
              }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold bg-[#080c25] border-2 border-white/30 text-white/70 hover:text-white hover:bg-[#0a0e27] transition-all"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Download .env
            </a>
          </div>
        )}

        {/* Preview iframe or File Content */}
        <div className="flex-1 relative">
          {shouldShowDiff ? (
            null  // Don't render iframe when showing diff
          ) : showPreview ? (
            previewUrl ? (
              viewMode === 'mobile' ? (
                <MobilePhoneFrame>
                  <iframe
                    src={previewUrl}
                    className="absolute inset-0 w-full h-full border-0"
                    title="Website Preview (Mobile)"
                    sandbox="allow-same-origin allow-scripts allow-forms"
                  />
                </MobilePhoneFrame>
              ) : (
                <DesktopBrowserFrame url={previewUrl.replace(/^https?:\/\//, '')}>
                  <iframe
                    src={previewUrl}
                    className="absolute inset-0 w-full h-full border-0"
                    title="Website Preview (Desktop)"
                    sandbox="allow-same-origin allow-scripts allow-forms"
                  />
                </DesktopBrowserFrame>
              )
            ) : (
              // Show placeholder when no preview URL
              viewMode === 'mobile' ? (
                <MobilePhoneFrame>
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#050714] to-[#0a0e27]">
                    <div className="text-center px-6">
                      <div className="text-5xl mb-3">🚀</div>
                      <p className="text-white/90 font-semibold mb-2 text-sm">How to See Your Preview</p>
                      <p className="text-white/50 text-xs mb-3">Ask Claude to make changes and they'll appear here!</p>
                      <div className="text-left bg-black/30 rounded-lg p-2.5 text-[10px] leading-relaxed text-white/70 space-y-1.5">
                        <div className="flex items-start gap-1.5">
                          <span className="text-green-400 flex-shrink-0">✓</span>
                          <span>Ask Claude to make changes in chat</span>
                        </div>
                        <div className="flex items-start gap-1.5">
                          <span className="text-green-400 flex-shrink-0">✓</span>
                          <span>Claude creates a new branch</span>
                        </div>
                        <div className="flex items-start gap-1.5">
                          <span className="text-green-400 flex-shrink-0">✓</span>
                          <span>Claude commits & pushes to GitHub</span>
                        </div>
                        <div className="flex items-start gap-1.5">
                          <span className="text-blue-400 flex-shrink-0">→</span>
                          <span>Claude creates Pull Request</span>
                        </div>
                        <div className="flex items-start gap-1.5">
                          <span className="text-blue-400 flex-shrink-0">→</span>
                          <span>Vercel deploys preview</span>
                        </div>
                        <div className="flex items-start gap-1.5">
                          <span className="text-blue-400 flex-shrink-0">→</span>
                          <span>Webhook sends preview URL</span>
                        </div>
                        <div className="flex items-start gap-1.5">
                          <span className="text-yellow-400 flex-shrink-0">★</span>
                          <span className="font-semibold text-white/90">Preview appears here!</span>
                        </div>
                      </div>
                      <p className="text-white/40 text-[9px] mt-2">Usually takes 1-2 minutes after requesting changes</p>
                    </div>
                  </div>
                </MobilePhoneFrame>
              ) : (
                <DesktopBrowserFrame url="waiting-for-deployment.vercel.app">
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#050714] to-[#0a0e27]">
                    <div className="text-center px-8">
                      <div className="text-6xl mb-4">🚀</div>
                      <p className="text-white/90 font-semibold mb-2">How to See Your Preview</p>
                      <p className="text-white/60 text-sm mb-4">Ask Claude to make changes and they'll appear here!</p>
                      <div className="text-left bg-black/30 rounded-lg p-4 text-xs text-white/70 space-y-2 max-w-md mx-auto">
                        <div className="flex items-start gap-2">
                          <span className="text-green-400 flex-shrink-0 font-bold">✓</span>
                          <span>Ask Claude to make changes in chat</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-green-400 flex-shrink-0 font-bold">✓</span>
                          <span>Claude creates a new branch</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-green-400 flex-shrink-0 font-bold">✓</span>
                          <span>Claude commits & pushes to GitHub</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-blue-400 flex-shrink-0 font-bold">→</span>
                          <span>Claude creates Pull Request (triggers Vercel preview)</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-blue-400 flex-shrink-0 font-bold">→</span>
                          <span>Vercel deploys preview deployment</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-blue-400 flex-shrink-0 font-bold">→</span>
                          <span>Webhook sends preview URL to portal</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-yellow-400 flex-shrink-0 font-bold text-base">★</span>
                          <span className="font-semibold text-white/90">Preview appears here - Success!</span>
                        </div>
                      </div>
                      <p className="text-white/50 text-xs mt-3">Usually takes 1-2 minutes after requesting changes</p>
                        <div>4. Preview shows at localhost:3000</div>
                      </div>
                    </div>
                  </div>
                </DesktopBrowserFrame>
              )
            )
          ) : openFiles[activeFileIndex] ? (
            <div className="absolute inset-0 overflow-auto pt-14 pr-[calc(33.333%+2rem)] pl-4 pb-4 bg-[#1e1e1e] group file-content-scroll">
              <pre className="text-sm text-gray-200 leading-relaxed whitespace-pre-wrap break-words max-w-full">
                <code>{openFiles[activeFileIndex].content}</code>
              </pre>
            </div>
          ) : null}

          {/* Diff Overlay */}
          {shouldShowDiff && currentDiff && (
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

          {/* Messages Overlay - Right Side - Always show unless fullscreen */}
          {messages.length > 0 && !isFullscreenLayout && (
            <div className="absolute right-0 top-0 bottom-0 w-1/3 pointer-events-none z-20">
              <div
                ref={messagesContainerRef}
                onMouseDown={handleMouseDown}
                className="h-full flex flex-col px-4 py-4 overflow-y-auto pointer-events-auto group chat-scroll"
                style={{
                  cursor: isDragging ? 'grabbing' : 'default'
                }}
              >
                {/* Spacer to push messages to bottom initially */}
                <div className="flex-1 min-h-0" />
                <div className="space-y-3">
                  {messages.map(message => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[90%] rounded-lg px-3 py-2 backdrop-blur-md ${
                          message.role === 'user'
                            ? 'bg-[#b1c6f9] text-[#001945] shadow-lg shadow-[#b1c6f9]/20 font-medium'
                            : message.role === 'system'
                            ? 'bg-destructive text-destructive-foreground border-2 border-destructive/50 shadow-lg'
                            : 'bg-[#0a0e27] text-white shadow-lg shadow-black/50 border-2 border-white/20'
                        }`}
                        style={{ fontSize: `${outputFontSize}pt` }}
                      >
                        <div className="whitespace-pre-wrap leading-relaxed select-text">{message.content}</div>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-[#0a0e27] backdrop-blur-md rounded-lg px-3 py-2 shadow-lg shadow-black/50 border-2 border-white/20">
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

        {/* Preview Controls at Bottom - Only show in preview mode */}
        {showPreview && (
        <div className="bg-muted/30 border-t border-border px-4 py-2 flex items-center justify-between">
          <p className="text-xs text-muted-foreground flex-1">
            Preview: <a href={previewUrl || undefined} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
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
        )}
      </div>

      {/* Environment Setup Instructions Modal */}
      {showEnvInstructions && (
        <>
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50" onClick={() => setShowEnvInstructions(false)} />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-[#0a0e27] border-2 border-white/20 rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Environment Setup</h2>
                <button
                  onClick={() => setShowEnvInstructions(false)}
                  className="text-white/50 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Recommended: One-Command Setup */}
              <div className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 border-2 border-blue-500/50 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">⚡</span>
                  <h3 className="font-bold text-white text-lg">One Command Does Everything!</h3>
                </div>
                <p className="text-sm text-white/80 mb-3">
                  Run one command in your project terminal - installs, configures, and syncs all environment variables automatically.
                </p>

                {!setupCommand ? (
                  <button
                    onClick={generateSetupCommand}
                    disabled={generatingSetup}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                  >
                    {generatingSetup ? 'Generating...' : 'Generate Setup Command'}
                  </button>
                ) : (
                  <div className="space-y-2">
                    <div className="bg-black/60 border border-blue-500/30 rounded-lg p-4">
                      <div className="text-xs text-gray-400 mb-2">Copy and run in your project directory:</div>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 text-sm text-white font-mono bg-black/40 px-3 py-2 rounded">
                          {setupCommand}
                        </code>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(setupCommand)
                          }}
                          className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold whitespace-nowrap"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                    <div className="text-xs text-white/60">
                      ✓ Installs env-sync • ✓ Auto-configures • ✓ Updates next.config.js • ✓ Ready to run!
                    </div>
                    <div className="bg-yellow-900/20 border border-yellow-600/30 rounded p-2 text-xs text-yellow-200">
                      <strong>⏱️ Code expires in 1 hour</strong> - Generate a new one if needed
                    </div>
                  </div>
                )}
              </div>

              {/* Alternative: Manual Download */}
              <details className="bg-black/20 border border-white/10 rounded-lg">
                <summary className="cursor-pointer p-3 text-sm font-semibold text-white/70 hover:text-white">
                  Alternative: Manual Download (.env file)
                </summary>
                <div className="space-y-4 text-white/80 p-4 pt-0">
                <div className="bg-black/30 rounded-lg p-4 border border-white/10">
                  <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                    <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">1</span>
                    Locate the downloaded file
                  </h3>
                  <p className="text-sm ml-8">
                    Find <code className="bg-black/50 px-2 py-1 rounded text-[#FFB800]">.env.local</code> in your Downloads folder
                  </p>
                </div>

                <div className="bg-black/30 rounded-lg p-4 border border-white/10">
                  <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                    <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">2</span>
                    Move to project root
                  </h3>
                  <p className="text-sm ml-8 mb-2">
                    Using your <strong>file manager</strong> (Finder/Explorer), drag the file from Downloads into your project's root directory
                  </p>
                  <div className="ml-8 mb-2 bg-blue-900/30 border border-blue-500/30 rounded p-2 text-xs text-blue-200">
                    <strong>⚠️ Don't drag into browser!</strong> Use your computer's file manager to move the file.
                  </div>
                  <div className="ml-8 bg-black/50 rounded p-2 text-xs font-mono text-gray-300">
                    your-project/<br />
                    ├── .env.local <span className="text-green-400">← place here (same level as package.json)</span><br />
                    ├── package.json<br />
                    ├── src/<br />
                    └── ...
                  </div>
                </div>

                <div className="bg-black/30 rounded-lg p-4 border border-white/10">
                  <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                    <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">3</span>
                    Start your development server
                  </h3>
                  <div className="ml-8 bg-black/50 rounded p-3 text-sm font-mono">
                    <span className="text-gray-400">$</span> <span className="text-white">npm run dev</span>
                  </div>
                </div>

                <div className="bg-black/30 rounded-lg p-4 border border-white/10">
                  <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                    <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">4</span>
                    View the preview
                  </h3>
                  <p className="text-sm ml-8">
                    Your project will appear in the preview panel above at{' '}
                    <code className="bg-black/50 px-2 py-1 rounded text-blue-400">localhost:3000</code>
                  </p>
                </div>

                <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-4 mt-4">
                  <div className="flex items-start gap-2">
                    <span className="text-yellow-400 text-xl">⚠️</span>
                    <div>
                      <h4 className="font-semibold text-yellow-400 mb-1">Important</h4>
                      <p className="text-sm text-yellow-200/80">
                        Never commit <code className="bg-black/50 px-1 rounded">.env.local</code> to Git.
                        It contains secret credentials. Make sure it's in your <code className="bg-black/50 px-1 rounded">.gitignore</code> file.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              </details>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowEnvInstructions(false)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold transition-colors"
                >
                  Got it!
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}
