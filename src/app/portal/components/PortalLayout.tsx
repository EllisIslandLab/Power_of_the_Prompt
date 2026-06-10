'use client'

import { useState, useRef, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import ChatInterface from './ChatInterface'
import PreviewPanel from './PreviewPanel'
import TokenBudgetBar from './TokenBudgetBar'
import DeploymentNotifications from './DeploymentNotifications'
import Sidebar from './Sidebar'
import WelcomeMessage from './WelcomeMessage'
import DraggableChat from './DraggableChat'
import FileDropZone from './FileDropZone'
import FileViewer from './FileViewer'

interface PendingDiff {
  changeId: string
  filePath: string
  oldContent: string
  newContent: string
  description: string
  type: 'diff' | 'file_preview'
}

interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  tokens_used?: number
  cost_usd?: number
}

interface PortalLayoutProps {
  user: any
  clientAccount: any
  session: any
  userSettings?: any
  hasProject?: boolean
  activeProject?: any
  connectedServices?: any[]
}

export default function PortalLayout({
  user,
  clientAccount,
  session,
  userSettings,
  hasProject = false,
  activeProject = null,
  connectedServices = []
}: PortalLayoutProps) {
  const [currentConversation, setCurrentConversation] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [tokenBudget, setTokenBudget] = useState({
    used: 0,
    limit: 4, // $4 initial budget
    percentage: 0
  })
  const [mode, setMode] = useState<'builder' | 'chat'>('builder')
  const [chatLayout, setChatLayout] = useState<'left' | 'right' | 'top' | 'bottom' | 'floating'>('bottom')
  const [pendingDiffs, setPendingDiffs] = useState<PendingDiff[]>([])
  const [currentDiffIndex, setCurrentDiffIndex] = useState(0)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [outputFontSize, setOutputFontSize] = useState(9)
  const [attachedFiles, setAttachedFiles] = useState<File[]>([])
  const [sidebarPanelOpen, setSidebarPanelOpen] = useState(false)
  const [openFiles, setOpenFiles] = useState<Array<{ path: string; name: string; content: string }>>([])
  const [activeFileIndex, setActiveFileIndex] = useState(0)
  const [explorerOpen, setExplorerOpen] = useState(false)

  // Show preview only when no files are open
  const showPreview = openFiles.length === 0

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Load font size preferences
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const { data } = await supabase
          .from('client_preferences')
          .select('output_font_size')
          .eq('user_id', user.id)
          .maybeSingle()

        if (data?.output_font_size) {
          setOutputFontSize(data.output_font_size)
        }
      } catch (error) {
        console.error('Failed to load font preferences:', error)
      }
    }

    if (user?.id) {
      loadPreferences()
    }
  }, [user?.id])

  // Fetch preview URL from Vercel or use localhost
  useEffect(() => {
    const fetchPreviewUrl = async () => {
      if (!activeProject) {
        setPreviewUrl(null)
        return
      }

      try {
        const response = await fetch('/api/portal/preview')
        if (response.ok) {
          const data = await response.json()
          if (data.previewUrl) {
            console.log('[PortalLayout] Preview URL loaded:', data.previewUrl)
            setPreviewUrl(data.previewUrl)
          } else {
            // Fallback to localhost for local development
            console.log('[PortalLayout] No Vercel preview yet, using localhost')
            setPreviewUrl('http://localhost:3000')
          }
        } else if (response.status === 404) {
          // No active project yet - this is expected during setup
          console.log('[PortalLayout] No active project yet, using localhost for preview')
          setPreviewUrl('http://localhost:3000')
        } else {
          console.log('[PortalLayout] Preview API unavailable, using localhost')
          setPreviewUrl('http://localhost:3000')
        }
      } catch (error) {
        // Network error or API issue - fall back silently
        console.log('[PortalLayout] Using localhost for preview')
        setPreviewUrl('http://localhost:3000')
      }
    }

    fetchPreviewUrl()
  }, [activeProject?.id])

  const handleMessagesChange = (newMessages: ChatMessage[], loading: boolean) => {
    setMessages(newMessages)
    setIsLoading(loading)
  }

  const handleLayoutChange = (layout: 'left' | 'right' | 'top' | 'bottom' | 'floating') => {
    setChatLayout(layout)
  }

  const handlePendingDiffsChange = (diffs: PendingDiff[], index: number) => {
    setPendingDiffs(diffs)
    // Only update index if it's explicitly changing or if current index is out of bounds
    if (index !== currentDiffIndex || currentDiffIndex >= diffs.length) {
      setCurrentDiffIndex(Math.min(index, diffs.length - 1))
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

  const handleFilesAttached = (files: File[]) => {
    setAttachedFiles(files)
  }

  const handleRemoveFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleClearAttachedFiles = () => {
    setAttachedFiles([])
  }

  const handleFileOpen = (file: { path: string; name: string; content: string }) => {
    console.log('[PortalLayout] Opening file:', file.name, 'Content length:', file.content.length)
    console.log('[PortalLayout] Current layout:', chatLayout)
    // Check if file is already open
    const existingIndex = openFiles.findIndex(f => f.path === file.path)
    if (existingIndex >= 0) {
      console.log('[PortalLayout] File already open at index:', existingIndex)
      setActiveFileIndex(existingIndex)
    } else {
      console.log('[PortalLayout] Adding new file, will be at index:', openFiles.length)
      setOpenFiles([...openFiles, file])
      setActiveFileIndex(openFiles.length)
    }

    // If in floating mode, switch to bottom mode to show preview panel
    if (chatLayout === 'floating') {
      console.log('[PortalLayout] Switching from floating to bottom layout to show file')
      setChatLayout('bottom')
    }
  }

  const handleFileClose = (index: number) => {
    const newFiles = openFiles.filter((_, i) => i !== index)
    setOpenFiles(newFiles)
    if (activeFileIndex >= newFiles.length) {
      setActiveFileIndex(Math.max(0, newFiles.length - 1))
    }
  }

  const handleFileDetach = (index: number) => {
    const file = openFiles[index]
    // Open in new window
    const newWindow = window.open('', '_blank', 'width=800,height=600')
    if (newWindow) {
      newWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${file.name}</title>
            <style>
              body {
                margin: 0;
                padding: 20px;
                font-family: monospace;
                background: #1e1e1e;
                color: #d4d4d4;
              }
              pre {
                margin: 0;
                white-space: pre-wrap;
                word-wrap: break-word;
              }
              .header {
                padding: 10px;
                background: #2d2d2d;
                border-bottom: 1px solid #3e3e3e;
                margin-bottom: 20px;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <div style="font-size: 12px; color: #888;">${file.path}</div>
              <div style="font-size: 16px; margin-top: 5px;">${file.name}</div>
            </div>
            <pre>${file.content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
          </body>
        </html>
      `)
      newWindow.document.close()
    }
  }


  const handleFilesSaved = async (files: File[], folderPath: string) => {
    // TODO: Implement file saving to staging area
    // This will create the files in the specified folder and stage them for commit
    console.log('Saving files to:', folderPath, files)

    // For now, show a success message
    // In the future, this should:
    // 1. Upload files to the server
    // 2. Create them in the git repository folder
    // 3. Stage them (but not commit until user says so)
  }

  const firstName = user?.full_name?.split(' ')[0] || 'there'

  const chatComponent = (
    <ChatInterface
      user={user}
      clientAccount={clientAccount}
      session={session}
      activeProject={activeProject}
      connectedServices={connectedServices}
      onConversationStart={(id) => setCurrentConversation(id)}
      onPreviewReady={(url) => setPreviewUrl(url)}
      onTokenUpdate={(tokens) => setTokenBudget(tokens)}
      layout={chatLayout}
      onLayoutChange={handleLayoutChange}
      onPendingDiffsChange={handlePendingDiffsChange}
      onMessagesChange={handleMessagesChange}
      attachedFiles={attachedFiles}
      onRemoveFile={handleRemoveFile}
    />
  )

  const getLayoutClasses = () => {
    if (chatLayout === 'floating') {
      return 'flex-1 flex flex-col overflow-hidden'
    }

    switch (chatLayout) {
      case 'left':
        return 'flex-1 flex flex-row overflow-hidden'
      case 'right':
        return 'flex-1 flex flex-row overflow-hidden'
      case 'top':
        return 'flex-1 flex flex-col overflow-hidden'
      case 'bottom':
        return 'flex-1 flex flex-col overflow-hidden'
      default:
        return 'flex-1 flex flex-row overflow-hidden'
    }
  }

  return (
    <FileDropZone
      userId={user.id}
      onFilesAttached={handleFilesAttached}
      onFilesSaved={handleFilesSaved}
    >
      <div className="h-screen flex flex-col bg-[#050714]">
        {/* Welcome Message */}
        <WelcomeMessage userName={firstName} hasProject={hasProject} />

      {/* Sidebar - VS Code style - Hide when chat is left/right */}
      {chatLayout !== 'left' && chatLayout !== 'right' && (
        <Sidebar
          onModeChange={setMode}
          initialTheme={userSettings?.theme || 'dark'}
          user={user}
          clientAccount={clientAccount}
          onLayoutChange={handleLayoutChange}
          onPanelOpenChange={setSidebarPanelOpen}
          onFileOpen={handleFileOpen}
          onExplorerStateChange={setExplorerOpen}
          modifiedFiles={pendingDiffs.map(diff => ({
            path: diff.filePath,
            type: diff.type === 'file_preview' ? 'created' as const : 'modified' as const
          }))}
        />
      )}

      {/* Main content with left padding for sidebar (remove padding when sidebar is hidden) */}
      <div className={`h-full flex flex-col transition-all duration-300 ease-in-out ${
        chatLayout !== 'left' && chatLayout !== 'right'
          ? sidebarPanelOpen ? 'pl-[304px]' : 'pl-12'
          : ''
      }`}>
        {/* Token Budget Bar - Matches homepage scroll progress */}
        <TokenBudgetBar
          used={tokenBudget.used}
          limit={tokenBudget.limit}
          percentage={tokenBudget.percentage}
        />

        {/* Main Layout - Dynamic based on chat position */}
        <div className={getLayoutClasses()}>
          {chatLayout === 'left' && (
            <>
              <div className="w-1/4 border-r border-border">
                {chatComponent}
              </div>
              <div className="flex-1">
                <PreviewPanel
                  previewUrl={previewUrl}
                  conversationId={currentConversation}
                  pendingDiffs={pendingDiffs}
                  currentDiffIndex={currentDiffIndex}
                  onNextDiff={handleNextDiff}
                  onPreviousDiff={handlePreviousDiff}
                  messages={messages}
                  isLoading={isLoading}
                  outputFontSize={outputFontSize}
                  openFiles={openFiles}
                  activeFileIndex={activeFileIndex}
                  onFileSelect={setActiveFileIndex}
                  onFileClose={handleFileClose}
                  showPreview={showPreview}
                />
              </div>
            </>
          )}

          {chatLayout === 'right' && (
            <>
              <div className="flex-1">
                <PreviewPanel
                  previewUrl={previewUrl}
                  conversationId={currentConversation}
                  pendingDiffs={pendingDiffs}
                  currentDiffIndex={currentDiffIndex}
                  onNextDiff={handleNextDiff}
                  onPreviousDiff={handlePreviousDiff}
                  messages={messages}
                  isLoading={isLoading}
                  outputFontSize={outputFontSize}
                  openFiles={openFiles}
                  activeFileIndex={activeFileIndex}
                  onFileSelect={setActiveFileIndex}
                  onFileClose={handleFileClose}
                  showPreview={showPreview}
                />
              </div>
              <div className="w-1/4 border-l border-border">
                {chatComponent}
              </div>
            </>
          )}

          {chatLayout === 'top' && (
            <>
              <div className="h-2/5 border-b border-border">
                {chatComponent}
              </div>
              <div className="flex-1">
                <PreviewPanel
                  previewUrl={previewUrl}
                  conversationId={currentConversation}
                  pendingDiffs={pendingDiffs}
                  currentDiffIndex={currentDiffIndex}
                  onNextDiff={handleNextDiff}
                  onPreviousDiff={handlePreviousDiff}
                  messages={messages}
                  isLoading={isLoading}
                  outputFontSize={outputFontSize}
                  openFiles={openFiles}
                  activeFileIndex={activeFileIndex}
                  onFileSelect={setActiveFileIndex}
                  onFileClose={handleFileClose}
                  showPreview={showPreview}
                />
              </div>
            </>
          )}

          {chatLayout === 'bottom' && (
            <>
              <div className="flex-1 min-h-0">
                <PreviewPanel
                  previewUrl={previewUrl}
                  conversationId={currentConversation}
                  pendingDiffs={pendingDiffs}
                  currentDiffIndex={currentDiffIndex}
                  onNextDiff={handleNextDiff}
                  onPreviousDiff={handlePreviousDiff}
                  messages={messages}
                  isLoading={isLoading}
                  outputFontSize={outputFontSize}
                  openFiles={openFiles}
                  activeFileIndex={activeFileIndex}
                  onFileSelect={setActiveFileIndex}
                  onFileClose={handleFileClose}
                  showPreview={showPreview}
                />
              </div>
              <div className="border-t border-border flex-shrink-0 max-h-[40vh] flex flex-col">
                {chatComponent}
              </div>
            </>
          )}

          {chatLayout === 'floating' && (
            <>
              <div className="flex-1 relative">
                <PreviewPanel
                  previewUrl={previewUrl}
                  conversationId={currentConversation}
                  pendingDiffs={pendingDiffs}
                  currentDiffIndex={currentDiffIndex}
                  onNextDiff={handleNextDiff}
                  onPreviousDiff={handlePreviousDiff}
                  messages={messages}
                  isLoading={isLoading}
                  outputFontSize={outputFontSize}
                  isFullscreenLayout={true}
                />
              </div>
            </>
          )}
        </div>

        {/* Toast Notifications - Top Right */}
        <DeploymentNotifications userId={user?.id} />
      </div>
    </div>
    </FileDropZone>
  )
}
