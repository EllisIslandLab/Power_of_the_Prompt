'use client'

import { useState, useCallback, useEffect } from 'react'
import FileDropModal from './FileDropModal'

interface FileWithPreview extends File {
  preview?: string
}

interface FileDropZoneProps {
  onFilesAttached?: (files: FileWithPreview[]) => void
  onFilesSaved?: (files: FileWithPreview[], folderPath: string) => void
  userId: string
  children: React.ReactNode
}

const ACCEPTED_TYPES = {
  images: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
  videos: ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'],
  documents: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'],
}

const ALL_ACCEPTED_TYPES = [
  ...ACCEPTED_TYPES.images,
  ...ACCEPTED_TYPES.videos,
  ...ACCEPTED_TYPES.documents,
]

export default function FileDropZone({
  onFilesAttached,
  onFilesSaved,
  userId,
  children,
}: FileDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [droppedFiles, setDroppedFiles] = useState<FileWithPreview[]>([])
  const [showModal, setShowModal] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const validateFiles = (files: File[]): { valid: FileWithPreview[]; errors: string[] } => {
    const valid: FileWithPreview[] = []
    const errors: string[] = []

    files.forEach(file => {
      // Check file type
      if (!ALL_ACCEPTED_TYPES.includes(file.type)) {
        errors.push(`${file.name}: Unsupported file type`)
        return
      }

      // Check file size (50MB limit)
      const maxSize = 50 * 1024 * 1024 // 50MB
      if (file.size > maxSize) {
        errors.push(`${file.name}: File too large (max 50MB)`)
        return
      }

      // Create preview for images
      const fileWithPreview = file as FileWithPreview
      if (file.type.startsWith('image/')) {
        fileWithPreview.preview = URL.createObjectURL(file)
      }

      valid.push(fileWithPreview)
    })

    return { valid, errors }
  }

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'copy'
    }

    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    // Only set dragging to false if we're leaving the window entirely
    if (e.target === document.body || e.relatedTarget === null) {
      setIsDragging(false)
    }
  }, [])

  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer?.files || [])
    if (files.length === 0) return

    const { valid, errors } = validateFiles(files)

    if (errors.length > 0) {
      setError(errors.join('\n'))
      setTimeout(() => setError(null), 5000)
    }

    if (valid.length > 0) {
      setDroppedFiles(valid)
      setShowModal(true)
    }
  }, [])

  useEffect(() => {
    const dragOverHandler = (e: DragEvent) => handleDragOver(e)
    const dragLeaveHandler = (e: DragEvent) => handleDragLeave(e)
    const dropHandler = (e: DragEvent) => handleDrop(e)

    document.addEventListener('dragover', dragOverHandler)
    document.addEventListener('dragleave', dragLeaveHandler)
    document.addEventListener('drop', dropHandler)

    return () => {
      document.removeEventListener('dragover', dragOverHandler)
      document.removeEventListener('dragleave', dragLeaveHandler)
      document.removeEventListener('drop', dropHandler)
    }
  }, [handleDragOver, handleDragLeave, handleDrop])

  const handleModalClose = () => {
    setShowModal(false)
    // Clean up preview URLs
    droppedFiles.forEach(file => {
      if (file.preview) {
        URL.revokeObjectURL(file.preview)
      }
    })
    setDroppedFiles([])
  }

  const handleSaveToFolder = (files: FileWithPreview[], folderPath: string) => {
    onFilesSaved?.(files, folderPath)
  }

  const handleAttachToChat = (files: FileWithPreview[]) => {
    onFilesAttached?.(files)
  }

  return (
    <>
      {children}

      {/* Drag Overlay */}
      {isDragging && (
        <div className="fixed inset-0 bg-primary/10 backdrop-blur-sm z-40 flex items-center justify-center pointer-events-none">
          <div className="bg-card/95 border-2 border-dashed border-primary rounded-2xl p-12 shadow-2xl">
            <div className="flex flex-col items-center gap-4">
              <svg className="w-16 h-16 text-primary animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <div className="text-center">
                <p className="text-xl font-semibold text-foreground">Drop Files Here</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Images, Videos, PDFs & Documents
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Toast */}
      {error && (
        <div className="fixed top-4 right-4 z-50 bg-destructive text-destructive-foreground px-4 py-3 rounded-lg shadow-lg max-w-md animate-slide-in">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <p className="font-semibold mb-1">File Upload Error</p>
              <p className="text-sm whitespace-pre-line">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-destructive-foreground/80 hover:text-destructive-foreground"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* File Drop Modal */}
      {showModal && droppedFiles.length > 0 && (
        <FileDropModal
          files={droppedFiles}
          onClose={handleModalClose}
          onSaveToFolder={handleSaveToFolder}
          onAttachToChat={handleAttachToChat}
          userId={userId}
        />
      )}
    </>
  )
}
