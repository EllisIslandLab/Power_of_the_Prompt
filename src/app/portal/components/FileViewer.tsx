'use client'

import { useState } from 'react'

interface OpenFile {
  path: string
  name: string
  content: string
}

interface FileViewerProps {
  files: OpenFile[]
  activeFileIndex: number
  onClose: (index: number) => void
  onSelectFile: (index: number) => void
  onDetach: (index: number) => void
}

export default function FileViewer({
  files,
  activeFileIndex,
  onClose,
  onSelectFile,
  onDetach
}: FileViewerProps) {
  const [collapsed, setCollapsed] = useState(false)

  if (files.length === 0) return null

  const activeFile = files[activeFileIndex]

  return (
    <div className={`fixed right-4 top-20 z-40 bg-card border border-border rounded-lg shadow-xl transition-all duration-300 ${
      collapsed ? 'w-64' : 'w-[600px] max-w-[90vw]'
    }`}>
      {/* Header with tabs */}
      <div className="flex items-center gap-2 p-2 border-b border-border bg-muted/30">
        <div className="flex-1 flex items-center gap-1 overflow-x-auto">
          {files.map((file, index) => (
            <div
              key={file.path}
              onClick={() => onSelectFile(index)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs transition-colors cursor-pointer ${
                index === activeFileIndex
                  ? 'bg-card text-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              <span className="truncate max-w-[120px]">{file.name}</span>
              <span
                onClick={(e) => {
                  e.stopPropagation()
                  onClose(index)
                }}
                className="hover:text-destructive cursor-pointer"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </span>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 hover:bg-muted rounded text-muted-foreground hover:text-foreground"
            title={collapsed ? 'Expand' : 'Collapse'}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {collapsed ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              )}
            </svg>
          </button>
          <button
            onClick={() => onDetach(activeFileIndex)}
            className="p-1.5 hover:bg-muted rounded text-muted-foreground hover:text-foreground"
            title="Open in new window"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      {!collapsed && (
        <div className="p-4 max-h-[60vh] overflow-auto">
          <div className="mb-2 text-xs text-muted-foreground font-mono">
            {activeFile.path}
          </div>
          <pre className="text-xs bg-muted/30 p-4 rounded overflow-x-auto">
            <code>{activeFile.content}</code>
          </pre>
        </div>
      )}
    </div>
  )
}
