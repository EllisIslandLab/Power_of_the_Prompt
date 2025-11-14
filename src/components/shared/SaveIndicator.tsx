'use client'

interface SaveIndicatorProps {
  isSaving: boolean
  lastSaved: Date | null
}

export function SaveIndicator({ isSaving, lastSaved }: SaveIndicatorProps) {
  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)

    if (seconds < 60) return 'just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    return `${Math.floor(seconds / 3600)}h ago`
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      {isSaving ? (
        <>
          <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
          <span className="text-gray-600">Saving...</span>
        </>
      ) : lastSaved ? (
        <>
          <div className="w-2 h-2 bg-green-500 rounded-full" />
          <span className="text-gray-600">Saved {getTimeAgo(lastSaved)}</span>
        </>
      ) : (
        <>
          <div className="w-2 h-2 bg-gray-300 rounded-full" />
          <span className="text-gray-400">Not saved yet</span>
        </>
      )}
    </div>
  )
}
