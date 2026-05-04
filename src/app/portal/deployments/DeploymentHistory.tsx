'use client'

import { useState } from 'react'

interface Deployment {
  id: string
  branch_name: string
  commit_message: string
  deployment_status: string
  deployment_type: string
  preview_url: string | null
  created_at: string
  deployed_at: string | null
  estimated_cost: number | null
}

interface DeploymentHistoryProps {
  deployments: Deployment[]
}

export default function DeploymentHistory({ deployments }: DeploymentHistoryProps) {
  const [selectedDeployment, setSelectedDeployment] = useState<Deployment | null>(null)
  const [isActioning, setIsActioning] = useState(false)

  const handleAction = async (deploymentId: string, action: 'approve' | 'reject') => {
    if (!confirm(`Are you sure you want to ${action} this deployment?`)) {
      return
    }

    setIsActioning(true)

    try {
      const response = await fetch('/api/portal/deploy', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deploymentId, action }),
      })

      const result = await response.json()

      if (result.success) {
        alert(result.message)
        window.location.reload()
      } else {
        alert(`Error: ${result.error}`)
      }
    } catch (error) {
      console.error('Action error:', error)
      alert('Failed to process action. Please try again.')
    } finally {
      setIsActioning(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      deployed: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      failed: 'bg-red-100 text-red-800',
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Deployment History</h1>
          <button
            onClick={() => (window.location.href = '/portal')}
            className="text-blue-600 hover:underline"
          >
            ← Back to Portal
          </button>
        </div>

        {/* Deployments List */}
        {deployments.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">🚀</div>
            <p className="text-gray-500">No deployments yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {deployments.map(deployment => (
              <div
                key={deployment.id}
                className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {deployment.branch_name}
                      </h3>
                      <span
                        className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadge(
                          deployment.deployment_status
                        )}`}
                      >
                        {deployment.deployment_status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {deployment.commit_message}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>
                        Created: {new Date(deployment.created_at).toLocaleString()}
                      </span>
                      {deployment.deployed_at && (
                        <span>
                          Deployed: {new Date(deployment.deployed_at).toLocaleString()}
                        </span>
                      )}
                      {deployment.estimated_cost && (
                        <span>Cost: ${deployment.estimated_cost.toFixed(4)}</span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {deployment.deployment_status === 'pending' && (
                    <div className="flex gap-2 ml-4">
                      {deployment.preview_url && (
                        <a
                          href={deployment.preview_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                        >
                          View Preview
                        </a>
                      )}
                      <button
                        onClick={() => handleAction(deployment.id, 'approve')}
                        disabled={isActioning}
                        className="px-4 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleAction(deployment.id, 'reject')}
                        disabled={isActioning}
                        className="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  )}

                  {deployment.deployment_status === 'deployed' && deployment.preview_url && (
                    <a
                      href={deployment.preview_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                      View Live
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
