'use client'

import { useState, useEffect } from 'react'

interface PreviewPanelProps {
  previewUrl: string | null
  conversationId: string | null
}

export default function PreviewPanel({ previewUrl, conversationId }: PreviewPanelProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [changedElements, setChangedElements] = useState<string[]>([])

  if (!previewUrl) {
    return (
      <div className="h-full flex items-center justify-center bg-muted/30">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-foreground">Website Preview</h3>
          <p className="text-sm text-muted-foreground mt-2 max-w-md">
            Your live preview will appear here once changes are implemented.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-card">
      {/* Navigation Controls (if multiple changes) */}
      {changedElements.length > 1 && (
        <div className="bg-muted/30 border-b border-border px-4 py-2 flex items-center justify-between">
          <button
            onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
            disabled={currentIndex === 0}
            className="px-3 py-1 text-sm bg-card border border-border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted/50"
          >
            ← Previous
          </button>
          <span className="text-sm text-muted-foreground">
            Change {currentIndex + 1} of {changedElements.length}
          </span>
          <button
            onClick={() => setCurrentIndex(Math.min(changedElements.length - 1, currentIndex + 1))}
            disabled={currentIndex === changedElements.length - 1}
            className="px-3 py-1 text-sm bg-card border border-border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted/50"
          >
            Next →
          </button>
        </div>
      )}

      {/* Preview iframe */}
      <div className="flex-1 relative">
        <iframe
          src={previewUrl}
          className="absolute inset-0 w-full h-full border-0"
          title="Website Preview"
          sandbox="allow-same-origin allow-scripts allow-forms"
        />
      </div>

      {/* Preview Info */}
      <div className="bg-muted/30 border-t border-border px-4 py-2">
        <p className="text-xs text-muted-foreground">
          Preview: <a href={previewUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            {previewUrl}
          </a>
        </p>
      </div>
    </div>
  )
}
