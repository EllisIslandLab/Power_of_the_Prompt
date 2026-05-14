'use client'

import { useState, useRef } from 'react'
import ChatInterface from './ChatInterface'
import PreviewPanel from './PreviewPanel'
import TokenBudgetBar from './TokenBudgetBar'
import DeploymentNotifications from './DeploymentNotifications'
import Sidebar from './Sidebar'
import WelcomeMessage from './WelcomeMessage'
import DraggableChat from './DraggableChat'

interface PendingDiff {
  changeId: string
  filePath: string
  oldContent: string
  newContent: string
  description: string
  type: 'diff' | 'file_preview'
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
  const chatFileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = () => {
    // This will be set by ChatInterface and can be triggered from sidebar
    chatFileInputRef.current?.click()
  }

  const handleLayoutChange = (layout: 'left' | 'right' | 'top' | 'bottom' | 'floating') => {
    setChatLayout(layout)
  }

  const handlePendingDiffsChange = (diffs: PendingDiff[], index: number) => {
    setPendingDiffs(diffs)
    setCurrentDiffIndex(index)
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
      onFileInputRefReady={(ref) => {
        chatFileInputRef.current = ref
      }}
      layout={chatLayout}
      onLayoutChange={handleLayoutChange}
      onImageUploadClick={handleImageUpload}
      onPendingDiffsChange={handlePendingDiffsChange}
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
    <div className="h-screen flex flex-col bg-background">
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
          onImageUpload={handleImageUpload}
          modifiedFiles={pendingDiffs.map(diff => ({
            path: diff.filePath,
            type: diff.type === 'file_preview' ? 'created' as const : 'modified' as const
          }))}
        />
      )}

      {/* Main content with left padding for sidebar (remove padding when sidebar is hidden) */}
      <div className={`h-full flex flex-col ${chatLayout !== 'left' && chatLayout !== 'right' ? 'pl-12' : ''}`}>
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
                />
              </div>
              <div className="border-t border-border flex-shrink-0 max-h-[40vh] flex flex-col">
                {chatComponent}
              </div>
            </>
          )}

          {chatLayout === 'floating' && (
            <>
              <div className="flex-1">
                <PreviewPanel
                  previewUrl={previewUrl}
                  conversationId={currentConversation}
                  pendingDiffs={pendingDiffs}
                  currentDiffIndex={currentDiffIndex}
                  onNextDiff={handleNextDiff}
                  onPreviousDiff={handlePreviousDiff}
                />
              </div>
              <DraggableChat isDraggable={true}>
                {chatComponent}
              </DraggableChat>
            </>
          )}
        </div>

        {/* Toast Notifications - Top Right */}
        <DeploymentNotifications userId={user?.id} />
      </div>
    </div>
  )
}
