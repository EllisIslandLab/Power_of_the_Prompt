'use client'

import { useState, useEffect, useRef } from 'react'
import { createBrowserClient } from '@supabase/ssr'

interface ChatInterfaceProps {
  user: any
  clientAccount: any
  session: any
  onConversationStart: (id: string) => void
  onPreviewReady: (url: string) => void
  onTokenUpdate: (tokens: { used: number; limit: number; percentage: number }) => void
}

type MessageRole = 'user' | 'assistant' | 'system'

interface ChatMessage {
  id: string
  role: MessageRole
  content: string
  timestamp: Date
  tokens_used?: number
  cost_usd?: number
}

export default function ChatInterface({
  user,
  clientAccount,
  session,
  onConversationStart,
  onPreviewReady,
  onTokenUpdate,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Load initial greeting
  useEffect(() => {
    const firstName = user?.full_name?.split(' ')[0] || 'there'
    const greeting: ChatMessage = {
      id: 'greeting',
      role: 'assistant',
      content: `Welcome, ${firstName}. I'm here to help you manage website revisions.

**How it works:**
• Describe one change at a time for clarity
• I'll implement the change and generate a preview
• Review and approve before deploying to production

**Your account:**
Balance: $${clientAccount?.account_balance?.toFixed(2) || '0.00'}
${clientAccount?.trial_status === 'active' ? `Trial: ${Math.ceil((new Date(clientAccount.trial_expiration_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days remaining` : ''}

What would you like to update?`,
      timestamp: new Date(),
    }
    setMessages([greeting])
  }, [user, clientAccount])

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    try {
      // Create or continue conversation
      let conversationId = currentConversationId
      if (!conversationId) {
        const { data: conversation, error } = await supabase
          .from('revision_conversations')
          .insert({
            client_account_id: clientAccount.id,
            status: 'active',
          })
          .select()
          .single()

        if (error) throw error
        conversationId = conversation.id
        setCurrentConversationId(conversationId)
        onConversationStart(conversationId)
      }

      // Save user message
      await supabase.from('revision_chat_messages').insert({
        conversation_id: conversationId,
        role: 'user',
        content: userMessage.content,
      })

      // Call Claude API
      const response = await fetch('/api/portal/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          message: userMessage.content,
          clientAccountId: clientAccount.id,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response from Claude')
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let assistantContent = ''
      let assistantMessageId = `assistant-${Date.now()}`

      // Add placeholder for streaming response
      setMessages(prev => [
        ...prev,
        {
          id: assistantMessageId,
          role: 'assistant',
          content: '',
          timestamp: new Date(),
        },
      ])

      // Stream Claude's response
      while (reader) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))

              if (data.type === 'content') {
                assistantContent += data.text
                setMessages(prev =>
                  prev.map(m =>
                    m.id === assistantMessageId
                      ? { ...m, content: assistantContent }
                      : m
                  )
                )
              } else if (data.type === 'preview') {
                onPreviewReady(data.url)
              } else if (data.type === 'usage') {
                // Update token budget
                const totalTokens = data.input_tokens + data.output_tokens
                const costPer1kTokens = 0.003 // Sonnet 3.5 pricing
                const cost = (totalTokens / 1000) * costPer1kTokens

                // Update message with token info
                setMessages(prev =>
                  prev.map(m =>
                    m.id === assistantMessageId
                      ? { ...m, tokens_used: totalTokens, cost_usd: cost }
                      : m
                  )
                )

                // Update total usage
                const newUsed = (clientAccount.account_balance || 0) - cost
                const limit = 4 // $4 initial budget
                const percentage = ((limit - newUsed) / limit) * 100
                onTokenUpdate({ used: limit - newUsed, limit, percentage })
              }
            } catch (e) {
              console.error('Failed to parse SSE data:', e)
            }
          }
        }
      }
    } catch (error) {
      console.error('Error sending message:', error)
      setMessages(prev => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: 'system',
          content: 'Error: Unable to process request. Please try again.',
          timestamp: new Date(),
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    const file = files[0]
    const formData = new FormData()
    formData.append('file', file)
    formData.append('conversationId', currentConversationId || '')

    try {
      setIsLoading(true)
      const response = await fetch('/api/portal/upload-image', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed')
      }

      // Add success message
      setMessages(prev => [
        ...prev,
        {
          id: `upload-${Date.now()}`,
          role: 'system',
          content: `Image uploaded successfully: ${result.filename}\nPath: ${result.url}\n\nYou can now reference this image in your requests.`,
          timestamp: new Date(),
        },
      ])

      setUploadedImages(prev => [...prev, result.url])
    } catch (error) {
      console.error('Upload error:', error)
      setMessages(prev => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: 'system',
          content: `Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          timestamp: new Date(),
        },
      ])
    } finally {
      setIsLoading(false)
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

  return (
    <div
      className="h-full flex flex-col bg-card relative"
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

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(message => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                message.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : message.role === 'system'
                  ? 'bg-destructive/10 text-destructive border border-destructive/20'
                  : 'bg-muted text-foreground'
              }`}
            >
              <div className="whitespace-pre-wrap">{message.content}</div>
              {message.tokens_used && message.cost_usd && (
                <div className="text-xs mt-2 opacity-70">
                  {message.tokens_used.toLocaleString()} tokens • ${message.cost_usd.toFixed(4)}
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-lg px-4 py-2">
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

      {/* Input Area */}
      <div className="border-t border-border p-4 bg-muted/30">
        <div className="flex gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="px-3 py-2 border border-border rounded-lg hover:bg-muted/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Upload Image"
          >
            <svg className="w-5 h-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </button>
          <textarea
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Describe the change you'd like to make..."
            className="flex-1 resize-none border border-border rounded-lg px-4 py-2 bg-card focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            rows={2}
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !inputValue.trim()}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Tip: Drag & drop images or click the image icon to upload • Request one change at a time
        </p>
      </div>
    </div>
  )
}
