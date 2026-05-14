'use client'

import { useState, useRef, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import Image from 'next/image'

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
}: ChatInputProps) {
  const [inputValue, setInputValue] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [isButtonPressed, setIsButtonPressed] = useState(false)
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

    // Send message
    onMessageSent(inputValue.trim())
    setInputValue('')
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    // Normal message sending
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
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
          placeholder={hasPendingDiffs ? "Review the changes above, then ask me to commit and push..." : "Describe the change you'd like to make..."}
          className="flex-1 resize-none bg-transparent focus:outline-none placeholder:text-muted-foreground/60 min-h-[40px] max-h-[120px] overflow-y-auto"
          disabled={disabled}
          rows={1}
        />
        <button
          onClick={handleSend}
          onMouseDown={() => setIsButtonPressed(true)}
          onMouseUp={() => {
            // Keep glow for a moment, then fade back
            setTimeout(() => setIsButtonPressed(false), 150)
          }}
          onMouseLeave={() => setIsButtonPressed(false)}
          disabled={disabled || !inputValue.trim()}
          className="flex-shrink-0 w-12 h-12 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-transform hover:scale-[1.02] active:scale-95 relative overflow-hidden"
          title="Send message (Enter)"
          style={{ background: 'transparent' }}
        >
          {/* Base button image */}
          <Image
            src="/images/elements/button.webp"
            alt="Send"
            fill
            className={`object-cover transition-all ${
              isButtonPressed
                ? 'opacity-0 duration-150 ease-in'
                : 'opacity-100 duration-200 ease-out'
            }`}
            priority
          />
          {/* Glow button image - crossfades in when pressed */}
          <Image
            src="/images/elements/glow-button.webp"
            alt="Send"
            fill
            className={`object-cover transition-all ${
              isButtonPressed
                ? 'opacity-100 duration-150 ease-out'
                : 'opacity-0 duration-200 ease-in'
            }`}
            priority
          />
        </button>
      </div>

    </div>
  )
}
