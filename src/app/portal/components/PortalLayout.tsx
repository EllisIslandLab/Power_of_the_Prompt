'use client'

import { useState } from 'react'
import ChatInterface from './ChatInterface'
import PreviewPanel from './PreviewPanel'
import TokenBudgetBar from './TokenBudgetBar'
import HamburgerMenu from './HamburgerMenu'
import BalanceDisplay from './BalanceDisplay'
import DeploymentNotifications from './DeploymentNotifications'

interface PortalLayoutProps {
  user: any
  clientAccount: any
  session: any
}

export default function PortalLayout({ user, clientAccount, session }: PortalLayoutProps) {
  const [currentConversation, setCurrentConversation] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [tokenBudget, setTokenBudget] = useState({
    used: 0,
    limit: 4, // $4 initial budget
    percentage: 0
  })

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Token Budget Bar - Thin life bar at top */}
      <TokenBudgetBar
        used={tokenBudget.used}
        limit={tokenBudget.limit}
        percentage={tokenBudget.percentage}
      />

      {/* Main Layout - Desktop: Side-by-side, Mobile: Stacked */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">

        {/* Mobile: Preview on top, Desktop: Preview on right (60%) */}
        <div className="lg:order-2 h-1/2 lg:h-full lg:w-3/5 border-b lg:border-b-0 lg:border-l border-gray-200">
          <PreviewPanel
            previewUrl={previewUrl}
            conversationId={currentConversation}
          />
        </div>

        {/* Mobile: Chat on bottom, Desktop: Chat on left (40%) */}
        <div className="lg:order-1 flex-1 lg:w-2/5 flex flex-col">
          <ChatInterface
            user={user}
            clientAccount={clientAccount}
            session={session}
            onConversationStart={(id) => setCurrentConversation(id)}
            onPreviewReady={(url) => setPreviewUrl(url)}
            onTokenUpdate={(tokens) => setTokenBudget(tokens)}
          />
        </div>
      </div>

      {/* Footer Bar - Hamburger Menu & Balance */}
      <div className="bg-white border-t border-gray-200 px-4 py-2 flex items-center justify-between">
        <HamburgerMenu user={user} clientAccount={clientAccount} />
        <BalanceDisplay balance={clientAccount?.account_balance || 0} />
      </div>

      {/* Toast Notifications - Top Right */}
      <DeploymentNotifications userId={user?.id} />
    </div>
  )
}
