'use client'

import { useState } from 'react'

interface GitHubInstallation {
  installation_id: number
  account_login: string
  account_type: string
  repository_count?: number
}

interface GitHubAccountSelectorProps {
  installations: GitHubInstallation[]
  onSelect: (installationId: number) => void
  onCancel: () => void
}

export default function GitHubAccountSelector({
  installations,
  onSelect,
  onCancel
}: GitHubAccountSelectorProps) {
  const [selectedId, setSelectedId] = useState<number | null>(null)

  const handleConfirm = () => {
    if (selectedId) {
      onSelect(selectedId)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl max-w-md w-full p-6 shadow-xl">
        <h2 className="text-xl font-bold text-foreground mb-2">
          Select GitHub Account
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          Multiple GitHub accounts found. Choose which one to use for this project.
        </p>

        <div className="space-y-3 mb-6">
          {installations.map((installation) => (
            <button
              key={installation.installation_id}
              onClick={() => setSelectedId(installation.installation_id)}
              className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                selectedId === installation.installation_id
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/50 bg-muted/30'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <svg className="w-5 h-5 text-foreground" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                    </svg>
                    <span className="font-semibold text-foreground">
                      {installation.account_login}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="capitalize">{installation.account_type}</span>
                    {installation.repository_count !== undefined && (
                      <>
                        <span>•</span>
                        <span>{installation.repository_count} {installation.repository_count === 1 ? 'repo' : 'repos'}</span>
                      </>
                    )}
                  </div>
                </div>
                {selectedId === installation.installation_id && (
                  <svg className="w-6 h-6 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted/50 transition-colors text-sm font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedId}
            className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Confirm Selection
          </button>
        </div>

        <p className="text-xs text-muted-foreground mt-4 text-center">
          💡 Tip: Use separate browser profiles for each client to avoid account conflicts
        </p>
      </div>
    </div>
  )
}
