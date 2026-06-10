'use client'

import { useState, useRef, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import Image from 'next/image'

interface ChatInputProps {
  user: any
  clientAccount: any
  session: any
  onMessageSent: (content: string, files?: File[]) => void
  disabled?: boolean
  layout?: 'left' | 'right' | 'top' | 'bottom' | 'floating'
  hasPendingDiffs?: boolean
  attachedFiles?: File[]
  onRemoveFile?: (index: number) => void
}

export default function ChatInput({
  user,
  clientAccount,
  session,
  onMessageSent,
  disabled = false,
  layout = 'bottom',
  hasPendingDiffs = false,
  attachedFiles = [],
  onRemoveFile,
}: ChatInputProps) {
  const [inputValue, setInputValue] = useState('')
  const [isButtonPressed, setIsButtonPressed] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSend = () => {
    if (!inputValue.trim() || disabled) return

    // Send message with attached files
    onMessageSent(inputValue.trim(), attachedFiles.length > 0 ? attachedFiles : undefined)
    setInputValue('')
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    // Normal message sending
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const isVertical = layout === 'left' || layout === 'right'

  return (
    <div className="border-t border-white/10 p-2 bg-[#080c25]/50 backdrop-blur-md relative flex-1 flex flex-col min-h-0">
      {/* Attached Files Preview */}
      {attachedFiles.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {attachedFiles.map((file, index) => (
            <div
              key={index}
              className="relative group bg-white/5 border border-white/10 rounded-lg p-2 flex items-center gap-2 pr-8"
            >
              {file.type.startsWith('image/') ? (
                <img
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  className="w-12 h-12 object-cover rounded"
                />
              ) : (
                <div className="w-12 h-12 bg-white/10 rounded flex items-center justify-center">
                  <svg className="w-6 h-6 text-[#c4c7c8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white truncate uppercase tracking-wider">{file.name}</p>
                <p className="text-[10px] text-[#c4c7c8] font-medium">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
              <button
                onClick={() => onRemoveFile?.(index)}
                className="absolute top-1 right-1 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                title="Remove file"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Sleek input container */}
      <div className="flex items-center gap-3 flex-1 bg-[#080c25]/80 backdrop-blur-sm border border-white/10 rounded-full px-4 py-2 hover:border-white/20 transition-all">
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
          disabled={disabled || !inputValue.trim()}
          className="flex-shrink-0 w-10 h-10 rounded-full bg-[#FFB800] hover:brightness-110 disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95 flex items-center justify-center"
          title="Send message (Enter)"
        >
          <svg className="w-5 h-5 text-[#271900]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </div>

    </div>
  )
}
