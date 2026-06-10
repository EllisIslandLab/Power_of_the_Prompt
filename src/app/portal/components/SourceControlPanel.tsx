'use client'

import { useState, useEffect, useRef } from 'react'

interface FileChange {
  path: string
  status: 'modified' | 'added' | 'deleted' | 'renamed'
  additions: number
  deletions: number
  staged?: boolean
}

interface SourceControlPanelProps {
  onCommit?: (message: string, files: string[]) => Promise<void>
}

/**
 * Source Control Panel - VS Code inspired
 * Shows in content area (not full screen) alongside previews
 */
export default function SourceControlPanel({ onCommit }: SourceControlPanelProps) {
  const [commitMessage, setCommitMessage] = useState('')
  const [files, setFiles] = useState<FileChange[]>([])
  const [loading, setLoading] = useState(false)
  const [committing, setCommitting] = useState(false)
  const [validationMessage, setValidationMessage] = useState<{ type: 'error' | 'warning' | 'info'; message: string } | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Fetch git status on mount
  useEffect(() => {
    fetchGitStatus()
  }, [])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.max(60, textareaRef.current.scrollHeight) + 'px'
    }
  }, [commitMessage])

  // Validate commit message
  useEffect(() => {
    if (commitMessage.length === 0) {
      setValidationMessage(null)
    } else if (commitMessage.length < 10) {
      setValidationMessage({
        type: 'warning',
        message: 'Commit message should be at least 10 characters'
      })
    } else if (commitMessage.length > 72) {
      setValidationMessage({
        type: 'info',
        message: 'Consider keeping the first line under 72 characters'
      })
    } else {
      setValidationMessage(null)
    }
  }, [commitMessage])

  const fetchGitStatus = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/portal/git-status')
      if (response.ok) {
        const data = await response.json()
        const fileChanges: FileChange[] = (data.files || []).map((file: any) => ({
          ...file,
          staged: false // All files start unstaged
        }))
        setFiles(fileChanges)
      }
    } catch (error) {
      console.error('Failed to fetch git status:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStageToggle = (filePath: string) => {
    setFiles(prev =>
      prev.map(file =>
        file.path === filePath ? { ...file, staged: !file.staged } : file
      )
    )
  }

  const handleStageAll = () => {
    const allStaged = files.every(f => f.staged)
    setFiles(prev => prev.map(file => ({ ...file, staged: !allStaged })))
  }

  const handleCommit = async () => {
    const stagedFiles = files.filter(f => f.staged).map(f => f.path)

    if (stagedFiles.length === 0) {
      setValidationMessage({
        type: 'error',
        message: 'No files selected to save'
      })
      return
    }

    if (commitMessage.trim().length === 0) {
      setValidationMessage({
        type: 'error',
        message: 'Please describe your changes'
      })
      return
    }

    setCommitting(true)
    try {
      await onCommit?.(commitMessage, stagedFiles)
      // Success - clear form
      setCommitMessage('')
      setFiles([])
      fetchGitStatus()
    } catch (error) {
      setValidationMessage({
        type: 'error',
        message: 'Failed to save changes. Please try again.'
      })
    } finally {
      setCommitting(false)
    }
  }

  const stagedFiles = files.filter(f => f.staged)
  const unstagedFiles = files.filter(f => !f.staged)

  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    const styles = {
      modified: 'text-blue-400 border-blue-400',
      added: 'text-green-400 border-green-400',
      deleted: 'text-red-400 border-red-400',
      renamed: 'text-purple-400 border-purple-400'
    }[status] || 'text-gray-400 border-gray-400'

    const label = {
      modified: 'M',
      added: '+',
      deleted: 'D',
      renamed: 'R'
    }[status] || '?'

    return (
      <span className={`w-4 h-4 flex items-center justify-center text-[10px] font-bold border rounded ${styles}`}>
        {label}
      </span>
    )
  }

  return (
    <div className="h-full flex flex-col bg-[#0a0e27] text-foreground">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <h2 className="text-sm font-semibold uppercase tracking-wider mb-2">Source Control</h2>
        <p className="text-xs text-muted-foreground">Save your changes to the project</p>
      </div>

      {/* Commit Message Input */}
      <div className="p-4 border-b border-white/10">
        <label className="text-xs text-muted-foreground mb-2 block">
          Describe your changes (optional)
        </label>
        <textarea
          ref={textareaRef}
          value={commitMessage}
          onChange={(e) => setCommitMessage(e.target.value)}
          placeholder="Updated homepage design..."
          className={`w-full px-3 py-2 bg-background border rounded-lg text-sm resize-none focus:outline-none focus:ring-2 transition-colors ${
            validationMessage?.type === 'error'
              ? 'border-red-500/50 focus:ring-red-500/30'
              : validationMessage?.type === 'warning'
              ? 'border-yellow-500/50 focus:ring-yellow-500/30'
              : 'border-border focus:ring-primary/30'
          }`}
          rows={3}
          style={{ minHeight: '60px', maxHeight: '200px' }}
        />

        {/* Validation Message */}
        {validationMessage && (
          <div
            className={`mt-2 p-2 rounded text-xs flex items-start gap-2 ${
              validationMessage.type === 'error'
                ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                : validationMessage.type === 'warning'
                ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30'
                : 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
            }`}
          >
            <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <span>{validationMessage.message}</span>
          </div>
        )}

        {/* Commit Button */}
        <button
          onClick={handleCommit}
          disabled={committing || files.length === 0 || stagedFiles.length === 0}
          className="mt-3 w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold text-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {committing ? (
            <>
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Saving...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Save Changes {stagedFiles.length > 0 && `(${stagedFiles.length})`}
            </>
          )}
        </button>
      </div>

      {/* File Lists */}
      <div className="flex-1 overflow-y-auto panel-scroll">
        {loading ? (
          <div className="p-4 text-center text-muted-foreground text-sm">
            Loading changes...
          </div>
        ) : files.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground text-sm">
            <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>No changes to save</p>
            <p className="text-xs mt-1">Your project is up to date</p>
          </div>
        ) : (
          <>
            {/* Unstaged Changes */}
            {unstagedFiles.length > 0 && (
              <div className="mb-4">
                <div className="px-4 py-2 bg-muted/20 flex items-center justify-between sticky top-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wider">Unsaved Changes</span>
                    <span className="px-2 py-0.5 bg-muted text-muted-foreground rounded-full text-[10px] font-semibold">
                      {unstagedFiles.length}
                    </span>
                  </div>
                  <button
                    onClick={handleStageAll}
                    className="text-xs text-primary hover:text-primary/80"
                    title="Select all for saving"
                  >
                    Select All
                  </button>
                </div>

                {unstagedFiles.map((file) => (
                  <div
                    key={file.path}
                    className="px-4 py-2 hover:bg-muted/30 flex items-center gap-3 cursor-pointer group"
                    onClick={() => handleStageToggle(file.path)}
                  >
                    <input
                      type="checkbox"
                      checked={false}
                      onChange={() => {}}
                      className="w-4 h-4 rounded border-border cursor-pointer"
                    />
                    <StatusBadge status={file.status} />
                    <span className="text-sm flex-1 truncate">{file.path}</span>
                    <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100">
                      +{file.additions} -{file.deletions}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Staged Changes */}
            {stagedFiles.length > 0 && (
              <div>
                <div className="px-4 py-2 bg-muted/20 flex items-center justify-between sticky top-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wider">Ready to Save</span>
                    <span className="px-2 py-0.5 bg-primary/20 text-primary rounded-full text-[10px] font-semibold">
                      {stagedFiles.length}
                    </span>
                  </div>
                  <button
                    onClick={handleStageAll}
                    className="text-xs text-primary hover:text-primary/80"
                    title="Unselect all"
                  >
                    Unselect All
                  </button>
                </div>

                {stagedFiles.map((file) => (
                  <div
                    key={file.path}
                    className="px-4 py-2 hover:bg-muted/30 flex items-center gap-3 cursor-pointer group"
                    onClick={() => handleStageToggle(file.path)}
                  >
                    <input
                      type="checkbox"
                      checked={true}
                      onChange={() => {}}
                      className="w-4 h-4 rounded border-border cursor-pointer accent-primary"
                    />
                    <StatusBadge status={file.status} />
                    <span className="text-sm flex-1 truncate">{file.path}</span>
                    <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100">
                      +{file.additions} -{file.deletions}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
