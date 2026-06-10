'use client'

/**
 * Breadcrumb Navigation - VS Code inspired
 * Shows clickable path segments: Your Files > folder > file.tsx
 * Pattern based on VS Code's breadcrumbsControl.ts
 */

interface BreadcrumbProps {
  filePath: string
  fileName: string
  onNavigate?: (path: string) => void
}

export default function Breadcrumb({ filePath, fileName, onNavigate }: BreadcrumbProps) {
  // Parse path into segments
  const segments = filePath.split('/').filter(Boolean)

  // Get file icon based on extension
  const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase()

    switch (ext) {
      case 'tsx':
      case 'ts':
        return '📘' // TypeScript
      case 'jsx':
      case 'js':
        return '📜' // JavaScript
      case 'css':
      case 'scss':
        return '🎨' // Styles
      case 'html':
        return '🌐' // HTML
      case 'json':
        return '📋' // JSON
      case 'md':
        return '📝' // Markdown
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
      case 'svg':
        return '🖼️' // Image
      default:
        return '📄' // Generic file
    }
  }

  return (
    <div className="flex items-center gap-1 px-4 py-2 bg-[#1e1e1e]/50 border-b border-white/5 text-xs text-gray-400">
      {/* Root */}
      <button
        onClick={() => onNavigate?.('')}
        className="hover:text-gray-200 transition-colors flex items-center gap-1"
        title="Navigate to root"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
        <span>Your Files</span>
      </button>

      {/* Chevron separator */}
      <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>

      {/* Path segments (folders) */}
      {segments.slice(0, -1).map((segment, index) => {
        const pathToSegment = segments.slice(0, index + 1).join('/')

        return (
          <div key={pathToSegment} className="flex items-center gap-1">
            <button
              onClick={() => onNavigate?.(pathToSegment)}
              className="hover:text-gray-200 transition-colors"
              title={`Navigate to ${pathToSegment}`}
            >
              {segment}
            </button>
            <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        )
      })}

      {/* Current file (not clickable) */}
      <div className="flex items-center gap-1.5 text-gray-200">
        <span>{getFileIcon(fileName)}</span>
        <span className="font-medium">{fileName}</span>
      </div>
    </div>
  )
}
