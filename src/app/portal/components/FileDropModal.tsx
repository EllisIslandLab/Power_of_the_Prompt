'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'

interface FileWithPreview extends File {
  preview?: string
}

interface FolderPreferences {
  images?: string
  videos?: string
  pdfs?: string
  documents?: string
}

interface FileDropModalProps {
  files: FileWithPreview[]
  onClose: () => void
  onSaveToFolder: (files: FileWithPreview[], folderPath: string) => void
  onAttachToChat: (files: FileWithPreview[]) => void
  userId: string
}

export default function FileDropModal({
  files,
  onClose,
  onSaveToFolder,
  onAttachToChat,
  userId,
}: FileDropModalProps) {
  const [selectedOption, setSelectedOption] = useState<'folder' | 'chat' | null>(null)
  const [customFolder, setCustomFolder] = useState('')
  const [folderPreferences, setFolderPreferences] = useState<FolderPreferences>({})
  const [isLoading, setIsLoading] = useState(true)
  const [allFiles, setAllFiles] = useState<FileWithPreview[]>(files)
  const [isDraggingOver, setIsDraggingOver] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    loadFolderPreferences()
  }, [])

  useEffect(() => {
    setAllFiles(files)
  }, [files])

  const handleModalDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingOver(true)
  }

  const handleModalDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingOver(false)
  }

  const handleModalDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingOver(false)

    const droppedFiles = Array.from(e.dataTransfer.files)
    const newFiles = droppedFiles.map(file => {
      const fileWithPreview = file as FileWithPreview
      if (file.type.startsWith('image/')) {
        fileWithPreview.preview = URL.createObjectURL(file)
      }
      return fileWithPreview
    })

    setAllFiles(prev => [...prev, ...newFiles])
  }

  const handleRemoveFile = (index: number) => {
    setAllFiles(prev => {
      const newFiles = prev.filter((_, i) => i !== index)
      // Clean up preview URL
      if (prev[index].preview) {
        URL.revokeObjectURL(prev[index].preview!)
      }
      return newFiles
    })
  }

  const loadFolderPreferences = async () => {
    try {
      const { data } = await supabase
        .from('client_preferences')
        .select('folder_preferences')
        .eq('user_id', userId)
        .single()

      if (data?.folder_preferences) {
        setFolderPreferences(data.folder_preferences)
      }
    } catch (error) {
      console.error('Failed to load folder preferences:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const saveFolderPreference = async (type: string, path: string) => {
    try {
      const updated = { ...folderPreferences, [type]: path }
      await supabase
        .from('client_preferences')
        .upsert({
          user_id: userId,
          folder_preferences: updated,
        })
      setFolderPreferences(updated)
    } catch (error) {
      console.error('Failed to save folder preference:', error)
    }
  }

  const getFileType = (file: File): 'images' | 'videos' | 'pdfs' | 'documents' => {
    const ext = file.name.split('.').pop()?.toLowerCase()
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext || '')) return 'images'
    if (['mp4', 'webm', 'mov', 'avi'].includes(ext || '')) return 'videos'
    if (ext === 'pdf') return 'pdfs'
    return 'documents'
  }

  const getDefaultFolder = (type: string): string => {
    const defaults: Record<string, string> = {
      images: '/public/images',
      videos: '/public/videos',
      pdfs: '/public/documents',
      documents: '/public/documents',
    }
    return folderPreferences[type as keyof FolderPreferences] || defaults[type] || '/public'
  }

  const handleSaveToFolder = async () => {
    const fileType = getFileType(allFiles[0])
    const folder = customFolder || getDefaultFolder(fileType)

    // Save preference if custom folder was set
    if (customFolder) {
      await saveFolderPreference(fileType, customFolder)
    }

    onSaveToFolder(allFiles, folder)
    onClose()
  }

  const handleAttachToChat = () => {
    onAttachToChat(allFiles)
    onClose()
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-primary rounded-full animate-bounce" />
            <div className="w-4 h-4 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-4 h-4 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    )
  }

  const fileType = allFiles.length > 0 ? getFileType(allFiles[0]) : 'images'
  const suggestedFolder = getDefaultFolder(fileType)

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={onClose} />

      {/* Modal */}
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${isDraggingOver ? 'pointer-events-none' : ''}`}
        onDragOver={handleModalDragOver}
        onDragLeave={handleModalDragLeave}
        onDrop={handleModalDrop}
      >
        {/* Drag overlay for modal */}
        {isDraggingOver && (
          <div className="absolute inset-0 bg-primary/20 backdrop-blur-sm flex items-center justify-center pointer-events-none">
            <div className="bg-card/95 border-2 border-dashed border-primary rounded-lg p-8">
              <p className="text-lg font-semibold text-foreground">Drop to add more files</p>
            </div>
          </div>
        )}

        <div className="bg-card border border-border rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="border-b border-border p-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">
              {allFiles.length} {allFiles.length === 1 ? 'File' : 'Files'} Dropped
            </h2>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* File Previews */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Drop more files here to add them</p>
            </div>
            <div className="grid grid-cols-4 gap-3 max-h-48 overflow-y-auto">
              {allFiles.map((file, index) => (
                <div key={index} className="relative group">
                  {file.type.startsWith('image/') ? (
                    <img
                      src={file.preview || URL.createObjectURL(file)}
                      alt={file.name}
                      className="w-full h-24 object-cover rounded border border-border"
                    />
                  ) : (
                    <div className="w-full h-24 bg-muted rounded border border-border flex items-center justify-center">
                      <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  <button
                    onClick={() => handleRemoveFile(index)}
                    className="absolute top-1 right-1 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remove file"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  <p className="text-xs text-muted-foreground mt-1 truncate" title={file.name}>
                    {file.name}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Options */}
          <div className="p-4 space-y-3">
            <p className="text-sm text-muted-foreground mb-4">What would you like to do with {allFiles.length === 1 ? 'this file' : 'these files'}?</p>

            {/* Option 1: Save to Folder */}
            <div
              className={`w-full p-4 rounded-lg border-2 transition-all cursor-pointer ${
                selectedOption === 'folder'
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50 hover:bg-muted/30'
              }`}
              onClick={() => setSelectedOption('folder')}
            >
              <div className="flex items-start gap-3">
                <div className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  selectedOption === 'folder' ? 'border-primary' : 'border-muted-foreground'
                }`}>
                  {selectedOption === 'folder' && (
                    <div className="w-3 h-3 rounded-full bg-primary" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-1">Save to Project Folder</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Add {allFiles.length === 1 ? 'this file' : 'these files'} to your project folder. {allFiles.length === 1 ? 'It' : 'They'} will be staged for commit when you're ready to push changes. Files saved here are also available for reference in chat.
                  </p>

                  {selectedOption === 'folder' && (
                    <div className="mt-3 space-y-2" onClick={(e) => e.stopPropagation()}>
                      <label className="text-sm font-medium text-foreground">Destination Folder:</label>
                      <input
                        type="text"
                        value={customFolder || suggestedFolder}
                        onChange={(e) => setCustomFolder(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        placeholder={suggestedFolder}
                        className="w-full px-3 py-2 text-sm border border-border rounded bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <p className="text-xs text-muted-foreground">
                        Default: <code className="bg-muted px-1 py-0.5 rounded">{suggestedFolder}</code>
                        {!folderPreferences[fileType] && ' (will be created if it doesn\'t exist)'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Option 2: Attach to Chat */}
            <div
              onClick={() => setSelectedOption('chat')}
              className={`w-full p-4 rounded-lg border-2 transition-all cursor-pointer ${
                selectedOption === 'chat'
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50 hover:bg-muted/30'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  selectedOption === 'chat' ? 'border-primary' : 'border-muted-foreground'
                }`}>
                  {selectedOption === 'chat' && (
                    <div className="w-3 h-3 rounded-full bg-primary" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-1">Attach to Next Message</h3>
                  <p className="text-sm text-muted-foreground">
                    Claude will analyze {allFiles.length === 1 ? 'this file' : 'these files'} and reference {allFiles.length === 1 ? 'it' : 'them'} in your next conversation.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="border-t border-border p-4 flex items-center justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-muted/50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={selectedOption === 'folder' ? handleSaveToFolder : handleAttachToChat}
              disabled={!selectedOption}
              className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {selectedOption === 'folder' ? 'Save to Folder' : selectedOption === 'chat' ? 'Attach to Chat' : 'Select an Option'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
