'use client'

import { useState } from 'react'

interface AdminDashboardProps {
  clientAccounts: any[]
  activeConversations: any[]
  pendingDbWork: any[]
  pendingDeployments: any[]
}

export default function AdminDashboard({
  clientAccounts,
  activeConversations,
  pendingDbWork,
  pendingDeployments,
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'db-work' | 'deployments'>('overview')

  const totalActiveClients = clientAccounts.filter(
    acc => acc.trial_status === 'active' || acc.account_balance > 0
  ).length

  const totalRevenue = clientAccounts.reduce((sum, acc) => {
    return sum + (parseFloat(acc.account_balance) || 0)
  }, 0)

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <button
            onClick={() => (window.location.href = '/portal')}
            className="text-blue-600 hover:underline"
          >
            ← Back to Portal
          </button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-500 mb-1">Total Clients</p>
            <p className="text-3xl font-bold text-gray-900">{clientAccounts.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-500 mb-1">Active Clients</p>
            <p className="text-3xl font-bold text-green-600">{totalActiveClients}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-500 mb-1">Active Conversations</p>
            <p className="text-3xl font-bold text-blue-600">{activeConversations.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-500 mb-1">Total Balance</p>
            <p className="text-3xl font-bold text-purple-600">${totalRevenue.toFixed(2)}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 font-semibold transition-colors ${
              activeTab === 'overview'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Client Overview
          </button>
          <button
            onClick={() => setActiveTab('db-work')}
            className={`px-4 py-2 font-semibold transition-colors ${
              activeTab === 'db-work'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Database Work ({pendingDbWork.length})
          </button>
          <button
            onClick={() => setActiveTab('deployments')}
            className={`px-4 py-2 font-semibold transition-colors ${
              activeTab === 'deployments'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Pending Deployments ({pendingDeployments.length})
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Balance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Held
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Trial Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {clientAccounts.map(account => (
                  <tr key={account.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {account.users?.full_name || 'Unknown'}
                      </div>
                      <div className="text-xs text-gray-500">{account.users?.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${parseFloat(account.account_balance).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${parseFloat(account.held_balance).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          account.trial_status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {account.trial_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(account.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'db-work' && (
          <div className="space-y-4">
            {pendingDbWork.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <p className="text-gray-500">No pending database work</p>
              </div>
            ) : (
              pendingDbWork.map(work => (
                <div key={work.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {work.client_accounts?.users?.full_name || 'Unknown Client'}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">{work.description}</p>
                      <div className="flex gap-3 text-xs text-gray-500">
                        <span>Created: {new Date(work.created_at).toLocaleString()}</span>
                        <span>Conversation ID: {work.conversation_id.slice(0, 8)}...</span>
                      </div>
                    </div>
                    <button
                      onClick={() => alert('Open conversation to view full context')}
                      className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'deployments' && (
          <div className="space-y-4">
            {pendingDeployments.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <p className="text-gray-500">No pending deployments</p>
              </div>
            ) : (
              pendingDeployments.map(deployment => (
                <div key={deployment.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {deployment.client_accounts?.users?.full_name || 'Unknown Client'}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">{deployment.commit_message}</p>
                      <div className="flex gap-3 text-xs text-gray-500">
                        <span>Branch: {deployment.branch_name}</span>
                        <span>Created: {new Date(deployment.created_at).toLocaleString()}</span>
                        {deployment.estimated_cost && (
                          <span>Cost: ${deployment.estimated_cost.toFixed(4)}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {deployment.preview_url && (
                        <a
                          href={deployment.preview_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                        >
                          Preview
                        </a>
                      )}
                      <button className="px-4 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700">
                        Approve
                      </button>
                      <button className="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700">
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
