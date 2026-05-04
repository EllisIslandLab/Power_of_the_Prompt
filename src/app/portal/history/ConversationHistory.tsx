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
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Conversation History</h1>
          <button
            onClick={() => (window.location.href = '/portal')}
            className="text-blue-600 hover:underline"
          >
            ← Back to Portal
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Conversations List */}
          <div className="lg:col-span-1 space-y-3">
            {conversations.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <p className="text-gray-500">No conversations yet</p>
              </div>
            ) : (
              conversations.map(conv => {
                const cost = getTotalCost(conv.revision_chat_messages)
                const messageCount = conv.revision_chat_messages.length

                return (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv)}
                    className={`w-full text-left bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow ${
                      selectedConversation?.id === conv.id
                        ? 'ring-2 ring-blue-500'
                        : ''
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm font-semibold text-gray-900">
                        {new Date(conv.created_at).toLocaleDateString()}
                      </span>
                      <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded capitalize">
                        {conv.status}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
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
              <div className="bg-white rounded-lg shadow p-6">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    Conversation Details
                  </h2>
                  <div className="flex gap-4 text-sm text-gray-600">
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
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {selectedConversation.revision_chat_messages.map(msg => (
                    <div
                      key={msg.id}
                      className={`p-4 rounded-lg ${
                        msg.role === 'user'
                          ? 'bg-blue-50 ml-8'
                          : msg.role === 'assistant'
                          ? 'bg-gray-50 mr-8'
                          : 'bg-yellow-50'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-semibold text-gray-700 uppercase">
                          {msg.role}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(msg.created_at).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-800 whitespace-pre-wrap">
                        {msg.content}
                      </p>
                      {msg.tokens_used && (
                        <div className="text-xs text-gray-500 mt-2">
                          {msg.tokens_used.toLocaleString()} tokens • $
                          {((msg.tokens_used / 1000) * 0.003).toFixed(4)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Summary */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold text-gray-700">Total Cost:</span>
                    <span className="font-bold text-gray-900">
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
