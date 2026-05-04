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
      <div className="h-full flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="text-6xl mb-4">👀</div>
          <h3 className="text-lg font-semibold text-gray-700">Preview Panel</h3>
          <p className="text-sm text-gray-500 mt-2">
            Your website preview will appear here<br />
            once Claude makes changes
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Navigation Controls (if multiple changes) */}
      {changedElements.length > 1 && (
        <div className="bg-gray-50 border-b border-gray-200 px-4 py-2 flex items-center justify-between">
          <button
            onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
            disabled={currentIndex === 0}
            className="px-3 py-1 text-sm bg-white border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            ← Previous
          </button>
          <span className="text-sm text-gray-600">
            Change {currentIndex + 1} of {changedElements.length}
          </span>
          <button
            onClick={() => setCurrentIndex(Math.min(changedElements.length - 1, currentIndex + 1))}
            disabled={currentIndex === changedElements.length - 1}
            className="px-3 py-1 text-sm bg-white border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
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
      <div className="bg-gray-50 border-t border-gray-200 px-4 py-2">
        <p className="text-xs text-gray-500">
          Preview: <a href={previewUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
            {previewUrl}
          </a>
        </p>
      </div>
    </div>
  )
}
