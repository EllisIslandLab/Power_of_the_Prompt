'use client'

import { useState, useRef, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'

interface ChatInputProps {
  user: any
  clientAccount: any
  session: any
  onMessageSent: (content: string) => void
  onFileInputRefReady?: (ref: HTMLInputElement | null) => void
  onFileUploaded?: (result: any, error?: Error) => void
  disabled?: boolean
  layout?: 'left' | 'right' | 'top' | 'bottom' | 'floating'
  hasPendingDiffs?: boolean
  onApproveCurrentDiff?: () => void
  onRejectCurrentDiff?: () => void
  onSkipToNextDiff?: () => void
}

export default function ChatInput({
  user,
  clientAccount,
  session,
  onMessageSent,
  onFileInputRefReady,
  onFileUploaded,
  disabled = false,
  layout = 'bottom',
  hasPendingDiffs = false,
  onApproveCurrentDiff,
  onRejectCurrentDiff,
  onSkipToNextDiff,
}: ChatInputProps) {
  const [inputValue, setInputValue] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    if (onFileInputRefReady && fileInputRef.current) {
      onFileInputRefReady(fileInputRef.current)
    }
  }, [onFileInputRefReady])

  const handleSend = () => {
    if (!inputValue.trim() || disabled) return
    onMessageSent(inputValue.trim())
    setInputValue('')
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    // Handle keyboard shortcuts for pending diffs
    if (hasPendingDiffs && inputValue.trim() === '') {
      if (e.key === '1') {
        e.preventDefault()
        onApproveCurrentDiff?.()
        return
      } else if (e.key === '2') {
        e.preventDefault()
        setShowRejectModal(true)
        return
      } else if (e.key === '3') {
        e.preventDefault()
        onSkipToNextDiff?.()
        return
      }
    }

    // Normal message sending
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleRejectWithReason = () => {
    onRejectCurrentDiff?.()
    setShowRejectModal(false)
    setRejectReason('')
  }

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    const file = files[0]
    const formData = new FormData()
    formData.append('file', file)
    formData.append('conversationId', '')

    try {
      const response = await fetch('/api/portal/upload-image', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed')
      }

      onFileUploaded?.(result)
    } catch (error) {
      console.error('Upload error:', error)
      onFileUploaded?.(null, error as Error)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFileUpload(e.dataTransfer.files)
  }

  const isVertical = layout === 'left' || layout === 'right'

  return (
    <div
      className="border-t border-border p-2 bg-muted/30 relative flex-1 flex flex-col min-h-0"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drag & Drop Overlay */}
      {isDragging && (
        <div className="absolute inset-0 bg-primary/10 border-4 border-dashed border-primary z-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary mb-2">Drop Image Here</p>
            <p className="text-sm text-muted-foreground">Supported: JPG, PNG, WebP, GIF (max 10MB)</p>
          </div>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
        onChange={(e) => handleFileUpload(e.target.files)}
        className="hidden"
      />

      {/* Sleek input container */}
      <div className="flex items-center gap-3 flex-1 bg-card/50 backdrop-blur-sm border border-border/50 rounded-full px-4 py-2 shadow-sm hover:shadow-md transition-all">
        <textarea
          ref={textareaRef}
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={hasPendingDiffs ? "Press 1 to approve, 2 to reject, 3 to skip..." : "Describe the change you'd like to make..."}
          className="flex-1 resize-none bg-transparent focus:outline-none placeholder:text-muted-foreground/60 min-h-[40px] max-h-[120px] overflow-y-auto"
          disabled={disabled}
          rows={1}
        />
        <button
          onClick={handleSend}
          disabled={disabled || !inputValue.trim()}
          className="flex-shrink-0 w-9 h-9 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95 flex items-center justify-center shadow-sm"
          title="Send message (Enter)"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </div>

      {/* Reject Reason Modal */}
      {showRejectModal && (
        <>
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50" onClick={() => setShowRejectModal(false)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md">
            <div className="bg-card border-2 border-border rounded-lg shadow-2xl p-6">
              <h3 className="text-lg font-semibold mb-4">Reject Change</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Why are you rejecting this change? (Optional)
              </p>
              <textarea
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                placeholder="Reason for rejection..."
                className="w-full h-24 px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none mb-4"
                autoFocus
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="px-4 py-2 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRejectWithReason}
                  className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors"
                >
                  Reject Change
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
