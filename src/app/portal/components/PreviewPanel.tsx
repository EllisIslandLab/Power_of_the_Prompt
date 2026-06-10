'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import DiffOverlay from './DiffOverlay'
import MobilePhoneFrame from './MobilePhoneFrame'
import DesktopBrowserFrame from './DesktopBrowserFrame'
import SourceControlPanel from './SourceControlPanel'
import Breadcrumb from './Breadcrumb'

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
  sourceControlOpen?: boolean
  onSourceControlClose?: () => void
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
  sourceControlOpen = false,
  onSourceControlClose,
}: PreviewPanelProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [changedElements, setChangedElements] = useState<string[]>([])
  const [isFullscreen, setIsFullscreen] = useState(false)
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
        {/* Source Control Tab - Show when source control is open */}
        {sourceControlOpen && (
          <div className="absolute top-2 left-2 right-[calc(33.333%+1rem)] z-30 flex items-center gap-2">
            <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-[#1e1e1e]/95 backdrop-blur-sm">
              <div className="flex items-center gap-2 px-3 py-1 text-xs bg-blue-600 text-white rounded">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                <span>Source Control</span>
                <span
                  onClick={(e) => {
                    e.stopPropagation()
                    onSourceControlClose?.()
                  }}
                  className="hover:text-red-300 cursor-pointer ml-1"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Floating File Tabs - Only show when viewing files */}
        {!showPreview && !sourceControlOpen && openFiles.length > 0 && (
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


        {/* Preview iframe or File Content or Source Control */}
        <div className="flex-1 relative">
          {sourceControlOpen ? (
            // Source Control Panel
            <div className="absolute inset-0 overflow-auto pt-14 pr-[calc(33.333%+2rem)] pl-0 pb-0 bg-[#0a0e27]">
              <SourceControlPanel />
            </div>
          ) : shouldShowDiff ? (
            null  // Don't render iframe when showing diff
          ) : showPreview ? (
            previewUrl ? (
              isFullscreenLayout ? (
                // Desktop View - Full screen browser
                <DesktopBrowserFrame url={previewUrl}>
                  <iframe
                    src={previewUrl}
                    className="absolute inset-0 w-full h-full border-0"
                    title="Website Preview (Desktop)"
                    sandbox="allow-same-origin allow-scripts allow-forms"
                  />
                </DesktopBrowserFrame>
              ) : (
                // Mobile-First Preview - Phone frame
                <MobilePhoneFrame>
                  <iframe
                    src={previewUrl}
                    className="absolute inset-0 w-full h-full border-0"
                    title="Website Preview (Mobile)"
                    sandbox="allow-same-origin allow-scripts allow-forms"
                  />
                </MobilePhoneFrame>
              )
            ) : (
              // Show placeholder when no preview URL
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
            )
          ) : openFiles[activeFileIndex] ? (
            <div className="absolute inset-0 flex flex-col bg-[#1e1e1e]">
              {/* Breadcrumb Navigation */}
              <Breadcrumb
                filePath={openFiles[activeFileIndex].path}
                fileName={openFiles[activeFileIndex].name}
                onNavigate={(path) => {
                  // TODO: Navigate to folder in Explorer
                  console.log('Navigate to:', path)
                }}
              />

              {/* File Content */}
              <div className="flex-1 overflow-auto pr-[calc(33.333%+2rem)] pl-4 pb-4 group file-content-scroll">
                <pre className="text-sm text-gray-200 leading-relaxed whitespace-pre-wrap break-words max-w-full">
                  <code>{openFiles[activeFileIndex].content}</code>
                </pre>
              </div>
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
