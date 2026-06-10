'use client'

import { useState } from 'react'

interface Message {
  id: string
  role: string
  content: string
  tokens_used: number | null
  created_at: string
}

interface Conversation {
  id: string
  created_at: string
  updated_at: string
  status: string
  revision_chat_messages: Message[]
}

interface ConversationHistoryProps {
  conversations: Conversation[]
}

export default function ConversationHistory({ conversations }: ConversationHistoryProps) {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)

  const getTotalCost = (messages: Message[]) => {
    return messages.reduce((sum, msg) => {
      const tokens = msg.tokens_used || 0
      return sum + (tokens / 1000) * 0.003
    }, 0)
  }

  return (
    <div className="min-h-screen bg-[#050714] py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white uppercase tracking-wider">Conversation History</h1>
          <button
            onClick={() => (window.location.href = '/portal')}
            className="text-[#b1c6f9] hover:text-white text-xs font-bold uppercase tracking-wider transition-colors"
          >
            ← Back to Portal
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Conversations List */}
          <div className="lg:col-span-1 space-y-3">
            {conversations.length === 0 ? (
              <div className="glass-panel rounded-lg p-6 text-center">
                <p className="text-[#c4c7c8] text-sm">No conversations yet</p>
              </div>
            ) : (
              conversations.map(conv => {
                const cost = getTotalCost(conv.revision_chat_messages)
                const messageCount = conv.revision_chat_messages.length

                return (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv)}
                    className={`w-full text-left glass-panel rounded-lg p-4 hover:border-white/40 transition-all ${
                      selectedConversation?.id === conv.id
                        ? 'border-[#FFB800] border-t-4'
                        : ''
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-bold text-white uppercase tracking-wider">
                        {new Date(conv.created_at).toLocaleDateString()}
                      </span>
                      <span className="text-[10px] px-2 py-1 bg-white/10 text-[#c4c7c8] rounded uppercase tracking-widest font-bold">
                        {conv.status}
                      </span>
                    </div>
                    <div className="text-[10px] text-[#c4c7c8] font-medium">
                      {messageCount} messages • ${cost.toFixed(4)}
                    </div>
                  </button>
                )
              })
            )}
          </div>

          {/* Conversation Detail */}
          <div className="lg:col-span-2">
            {selectedConversation ? (
              <div className="glass-panel rounded-xl border-t-8 border-white p-6 relative">
                <div className="container-header">Log.View</div>
                <div className="mb-6 mt-4">
                  <h2 className="text-lg font-bold text-white mb-2 uppercase tracking-wider">
                    Conversation Details
                  </h2>
                  <div className="flex gap-4 text-[10px] text-[#c4c7c8] uppercase tracking-widest font-bold">
                    <span>
                      Started: {new Date(selectedConversation.created_at).toLocaleString()}
                    </span>
                    <span>
                      Updated: {new Date(selectedConversation.updated_at).toLocaleString()}
                    </span>
                    <span className="capitalize">
                      Status: {selectedConversation.status}
                    </span>
                  </div>
                </div>

                {/* Messages */}
                <div className="space-y-4 max-h-[600px] overflow-y-auto scrollbar-thin">
                  {selectedConversation.revision_chat_messages.map(msg => (
                    <div
                      key={msg.id}
                      className={`p-4 rounded-lg border ${
                        msg.role === 'user'
                          ? 'bg-[#FFB800]/10 border-[#FFB800]/30 ml-8'
                          : msg.role === 'assistant'
                          ? 'bg-white/5 border-white/10 mr-8'
                          : 'bg-[#b1c6f9]/10 border-[#b1c6f9]/30'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-bold text-[#FFB800] uppercase tracking-widest">
                          {msg.role}
                        </span>
                        <span className="text-[10px] text-[#c4c7c8]">
                          {new Date(msg.created_at).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-xs text-white whitespace-pre-wrap">
                        {msg.content}
                      </p>
                      {msg.tokens_used && (
                        <div className="text-[10px] text-[#c4c7c8] mt-2 font-medium">
                          {msg.tokens_used.toLocaleString()} tokens • $
                          {((msg.tokens_used / 1000) * 0.003).toFixed(4)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Summary */}
                <div className="mt-6 pt-4 border-t border-white/10">
                  <div className="flex justify-between text-xs uppercase tracking-widest">
                    <span className="font-bold text-[#c4c7c8]">Total Cost:</span>
                    <span className="font-bold text-[#FFB800]">
                      ${getTotalCost(selectedConversation.revision_chat_messages).toFixed(4)}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <div className="text-6xl mb-4">💬</div>
                <p className="text-gray-500">Select a conversation to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
