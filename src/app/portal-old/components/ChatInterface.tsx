'use client'

import { useState, useEffect, useRef } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import HorizontalToolbar from './HorizontalToolbar'
import ChatInput from './ChatInput'

interface PendingDiff {
  changeId: string
  filePath: string
  oldContent: string
  newContent: string
  description: string
  type: 'diff' | 'file_preview'
}

interface ChatInterfaceProps {
  user: any
  clientAccount: any
  session: any
  activeProject?: any
  connectedServices?: any[]
  onConversationStart: (id: string) => void
  onPreviewReady: (url: string) => void
  onTokenUpdate: (tokens: { used: number; limit: number; percentage: number }) => void
  layout?: 'left' | 'right' | 'top' | 'bottom' | 'floating'
  onLayoutChange?: (layout: 'left' | 'right' | 'top' | 'bottom' | 'floating') => void
  onPendingDiffsChange?: (diffs: PendingDiff[], currentIndex: number) => void
  onMessagesChange?: (messages: ChatMessage[], isLoading: boolean) => void
  attachedFiles?: File[]
  onRemoveFile?: (index: number) => void
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
  activeProject,
  connectedServices = [],
  onConversationStart,
  onPreviewReady,
  onTokenUpdate,
  layout = 'bottom',
  onLayoutChange,
  onPendingDiffsChange,
  onMessagesChange,
  attachedFiles = [],
  onRemoveFile,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [archivedMessages, setArchivedMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null)
  const [workingBranch, setWorkingBranch] = useState<string | null>(null)
  const [currentDiffIndex, setCurrentDiffIndex] = useState(0)
  const [pendingDiffs, setPendingDiffs] = useState<Array<{
    changeId: string
    filePath: string
    oldContent: string
    newContent: string
    description: string
    type: 'diff' | 'file_preview'
  }>>([])
  const diffsContainerRef = useRef<HTMLDivElement>(null)

  // Archive messages when total character count exceeds 5000
  const archiveOldMessages = (messageList: ChatMessage[]) => {
    const totalChars = messageList.reduce((sum, msg) => sum + msg.content.length, 0)

    if (totalChars > 5000) {
      let currentChars = 0
      const recentMessages: ChatMessage[] = []
      const toArchive: ChatMessage[] = []

      // Keep most recent messages up to ~5000 characters
      for (let i = messageList.length - 1; i >= 0; i--) {
        const msg = messageList[i]
        if (currentChars + msg.content.length <= 5000) {
          recentMessages.unshift(msg)
          currentChars += msg.content.length
        } else {
          toArchive.unshift(msg)
        }
      }

      if (toArchive.length > 0) {
        setArchivedMessages(prev => [...prev, ...toArchive])
        return recentMessages
      }
    }

    return messageList
  }

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Load active conversation on mount
  useEffect(() => {
    loadActiveConversation()
  }, [])

  // Notify parent when pending diffs change
  useEffect(() => {
    onPendingDiffsChange?.(pendingDiffs, currentDiffIndex)
  }, [pendingDiffs, currentDiffIndex, onPendingDiffsChange])

  // Notify parent when messages or loading state changes
  useEffect(() => {
    onMessagesChange?.(messages, isLoading)
  }, [messages, isLoading, onMessagesChange])

  // Poll for pending changes
  useEffect(() => {
    if (!currentConversationId) return

    const loadPendingChanges = async () => {
      try {
        const response = await fetch(
          `/api/portal/pending-changes?conversationId=${currentConversationId}`
        )

        if (!response.ok) return

        const { changes, workingBranch: branch } = await response.json()

        if (branch) {
          setWorkingBranch(branch)
        }

        if (changes && changes.length > 0) {
          const diffs = changes.map((change: any) => ({
            changeId: change.id,
            filePath: change.file_path,
            oldContent: change.old_content || '',
            newContent: change.new_content || '',
            description: change.description,
            type: change.change_type === 'create' ? 'file_preview' : 'diff',
          }))
          setPendingDiffs(diffs)
        } else {
          // Clear pending diffs if no changes
          if (pendingDiffs.length > 0) {
            setPendingDiffs([])
          }
        }
      } catch (error) {
        console.error('Failed to load pending changes:', error)
      }
    }

    // Load immediately when conversation changes
    loadPendingChanges()

    // Don't poll - let user manually refresh or approve changes
    // This prevents the annoying loop and works like VS Code workflow
  }, [currentConversationId])

  const loadActiveConversation = async () => {
    try {
      // Find the most recent active conversation
      const { data: conversations } = await supabase
        .from('revision_conversations')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'in_progress')
        .order('created_at', { ascending: false })
        .limit(1)

      if (conversations && conversations.length > 0) {
        const conversationId = conversations[0].id
        setCurrentConversationId(conversationId)
        onConversationStart(conversationId)

        // Load messages for this conversation
        const { data: chatMessages } = await supabase
          .from('revision_chat_messages')
          .select('*')
          .eq('conversation_id', conversationId)
          .order('created_at', { ascending: true })

        if (chatMessages) {
          const loadedMessages: ChatMessage[] = chatMessages.map(msg => ({
            id: msg.id,
            role: msg.message_type === 'user_message' ? 'user' : 'assistant',
            content: msg.message_text,
            timestamp: new Date(msg.created_at),
            tokens_used: (msg.tokens_in || 0) + (msg.tokens_out || 0),
          }))
          setMessages(archiveOldMessages(loadedMessages))
        }
      }
    } catch (error) {
      console.error('Failed to load conversation:', error)
    }
  }

  const convertFilesToBase64 = async (files: File[]): Promise<Array<{ type: string; data: string; name: string; mimeType: string }>> => {
    const conversions = files.map(file => {
      return new Promise<{ type: string; data: string; name: string; mimeType: string }>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
          const base64 = (reader.result as string).split(',')[1] // Remove data:image/png;base64, prefix
          resolve({
            type: file.type.startsWith('image/') ? 'image' : 'document',
            data: base64,
            name: file.name,
            mimeType: file.type,
          })
        }
        reader.onerror = reject
        reader.readAsDataURL(file)
      })
    })
    return Promise.all(conversions)
  }

  const handleSendMessage = async (content: string, files?: File[]) => {
    if (!content.trim() || isLoading) return

    // Convert files to base64 if present
    let fileAttachments: Array<{ type: string; data: string; name: string; mimeType: string }> | undefined
    if (files && files.length > 0) {
      try {
        fileAttachments = await convertFilesToBase64(files)
      } catch (error) {
        console.error('Failed to convert files:', error)
        setMessages(prev => [
          ...prev,
          {
            id: `error-${Date.now()}`,
            role: 'system',
            content: 'Error: Failed to process attached files. Please try again.',
            timestamp: new Date(),
          },
        ])
        return
      }

      // Clear attached files after converting
      if (onRemoveFile) {
        setTimeout(() => {
          for (let i = attachedFiles.length - 1; i >= 0; i--) {
            onRemoveFile(i)
          }
        }, 100)
      }
    }

    // Check if client account exists
    if (!clientAccount) {
      setMessages(prev => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: 'system',
          content: 'Error: Client account not found. Please contact support.',
          timestamp: new Date(),
        },
      ])
      return
    }

    // Check if account has sufficient balance
    const balance = clientAccount.account_balance || 0
    if (balance <= 0) {
      setMessages(prev => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: 'system',
          content: 'Insufficient balance. Please add funds to your account to continue using the website builder.',
          timestamp: new Date(),
        },
      ])
      return
    }

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    }

    setMessages(prev => archiveOldMessages([...prev, userMessage]))
    setIsLoading(true)

    try {
      // Create or continue conversation
      let conversationId: string
      if (!currentConversationId) {
        const { data: conversation, error } = await supabase
          .from('revision_conversations')
          .insert({
            user_id: user.id,
            project_id: activeProject?.id || null,
            conversation_type: 'feature_change',
            is_trial_period: (clientAccount?.account_balance || 0) < 0.01,
            status: 'in_progress',
          })
          .select()
          .single()

        if (error || !conversation?.id) {
          console.error('Failed to create conversation:', error)
          throw new Error('Failed to create conversation')
        }
        conversationId = conversation.id
        setCurrentConversationId(conversationId)
        onConversationStart(conversationId)
      } else {
        conversationId = currentConversationId
      }

      // Save user message
      await supabase.from('revision_chat_messages').insert({
        conversation_id: conversationId,
        user_id: user.id,
        message_type: 'user_message',
        message_text: userMessage.content,
      })

      // Call Claude API
      const response = await fetch('/api/portal/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          message: userMessage.content,
          clientAccountId: clientAccount.id,
          projectId: activeProject?.id,
          connectedServices: connectedServices?.map(s => s.service_name) || [],
          attachments: fileAttachments,
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
            const jsonStr = line.slice(6)

            // Skip the [DONE] marker
            if (jsonStr === '[DONE]') continue

            try {
              const data = JSON.parse(jsonStr)

              if (data.type === 'content') {
                assistantContent += data.text
                setMessages(prev =>
                  archiveOldMessages(
                    prev.map(m =>
                      m.id === assistantMessageId
                        ? { ...m, content: assistantContent }
                        : m
                    )
                  )
                )
              } else if (data.type === 'diff') {
                // Add diff to pending diffs
                setPendingDiffs(prev => [
                  ...prev,
                  {
                    changeId: data.change_id,
                    filePath: data.file_path,
                    oldContent: data.old_content,
                    newContent: data.new_content,
                    description: data.description,
                    type: 'diff',
                  },
                ])
              } else if (data.type === 'file_preview') {
                // Add file preview to pending diffs
                setPendingDiffs(prev => [
                  ...prev,
                  {
                    changeId: data.change_id,
                    filePath: data.file_path,
                    oldContent: '',
                    newContent: data.content,
                    description: data.description,
                    type: 'file_preview',
                  },
                ])
              } else if (data.type === 'branch_created') {
                // Update working branch
                setWorkingBranch(data.branch_name)
              } else if (data.type === 'preview') {
                onPreviewReady(data.url)
              } else if (data.type === 'usage') {
                // Update token budget
                const totalTokens = data.input_tokens + data.output_tokens
                const costPer1kTokens = 0.003 // Sonnet 3.5 pricing
                const cost = (totalTokens / 1000) * costPer1kTokens

                // Update message with token info
                setMessages(prev =>
                  archiveOldMessages(
                    prev.map(m =>
                      m.id === assistantMessageId
                        ? { ...m, tokens_used: totalTokens, cost_usd: cost }
                        : m
                    )
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

  const handleFileUploaded = (result: any, error?: Error) => {
    if (error) {
      setMessages(prev => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: 'system',
          content: `Upload failed: ${error.message}`,
          timestamp: new Date(),
        },
      ])
    } else {
      setMessages(prev => [
        ...prev,
        {
          id: `upload-${Date.now()}`,
          role: 'system',
          content: `Image uploaded successfully: ${result.filename}\nPath: ${result.url}\n\nYou can now reference this image in your requests.`,
          timestamp: new Date(),
        },
      ])
    }
  }

  const handleApproveChange = async (changeId: string) => {
    try {
      const response = await fetch('/api/portal/approve-change', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ changeId, action: 'approve' }),
      })

      if (!response.ok) {
        throw new Error('Failed to approve change')
      }

      // Remove from pending diffs
      setPendingDiffs(prev => prev.filter(d => d.changeId !== changeId))

      // Reset index if needed
      if (currentDiffIndex >= pendingDiffs.length - 1) {
        setCurrentDiffIndex(Math.max(0, pendingDiffs.length - 2))
      }

      // Add success message
      setMessages(prev => [
        ...prev,
        {
          id: `approve-${Date.now()}`,
          role: 'system',
          content: '✅ Change approved and committed to branch!',
          timestamp: new Date(),
        },
      ])
    } catch (error) {
      console.error('Failed to approve change:', error)
      setMessages(prev => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: 'system',
          content: 'Error: Failed to approve change',
          timestamp: new Date(),
        },
      ])
    }
  }

  const handleRejectChange = async (changeId: string) => {
    try {
      const response = await fetch('/api/portal/approve-change', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ changeId, action: 'reject' }),
      })

      if (!response.ok) {
        throw new Error('Failed to reject change')
      }

      // Remove from pending diffs
      setPendingDiffs(prev => prev.filter(d => d.changeId !== changeId))

      // Reset index if needed
      if (currentDiffIndex >= pendingDiffs.length - 1) {
        setCurrentDiffIndex(Math.max(0, pendingDiffs.length - 2))
      }

      // Add message
      setMessages(prev => [
        ...prev,
        {
          id: `reject-${Date.now()}`,
          role: 'system',
          content: '❌ Change rejected',
          timestamp: new Date(),
        },
      ])
    } catch (error) {
      console.error('Failed to reject change:', error)
    }
  }

  const handleApproveCurrentDiff = () => {
    if (pendingDiffs[currentDiffIndex]) {
      handleApproveChange(pendingDiffs[currentDiffIndex].changeId)
    }
  }

  const handleRejectCurrentDiff = () => {
    if (pendingDiffs[currentDiffIndex]) {
      handleRejectChange(pendingDiffs[currentDiffIndex].changeId)
    }
  }

  const handleSkipToNextDiff = () => {
    if (currentDiffIndex < pendingDiffs.length - 1) {
      setCurrentDiffIndex(currentDiffIndex + 1)
    }
  }

  const handleNextDiff = () => {
    if (currentDiffIndex < pendingDiffs.length - 1) {
      setCurrentDiffIndex(currentDiffIndex + 1)
    }
  }

  const handlePreviousDiff = () => {
    if (currentDiffIndex > 0) {
      setCurrentDiffIndex(currentDiffIndex - 1)
    }
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Horizontal Toolbar - Only show for left/right layouts */}
      {(layout === 'left' || layout === 'right') && (
        <HorizontalToolbar
          user={user}
          clientAccount={clientAccount}
          onLayoutChange={onLayoutChange}
          currentLayout={layout}
        />
      )}

      {/* Chat Input - Fixed at bottom */}
      <div className="flex-shrink-0 mt-auto">
        <ChatInput
          user={user}
          clientAccount={clientAccount}
          session={session}
          onMessageSent={handleSendMessage}
          disabled={isLoading}
          layout={layout}
          hasPendingDiffs={pendingDiffs.length > 0}
          attachedFiles={attachedFiles}
          onRemoveFile={onRemoveFile}
        />
      </div>
    </div>
  )
}
