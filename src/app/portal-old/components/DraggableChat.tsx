'use client'

import { useState, useRef, useEffect, ReactNode } from 'react'

interface DraggableChatProps {
  children: ReactNode
  isDraggable: boolean
}

export default function DraggableChat({ children, isDraggable }: DraggableChatProps) {
  const [position, setPosition] = useState({ x: 100, y: 100 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const chatRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isDraggable) {
      // Reset position when not draggable
      setPosition({ x: 0, y: 0 })
    } else {
      // Center the chat when switching to draggable mode
      if (chatRef.current) {
        const rect = chatRef.current.getBoundingClientRect()
        setPosition({
          x: (window.innerWidth - rect.width) / 2,
          y: (window.innerHeight - rect.height) / 2,
        })
      }
    }
  }, [isDraggable])

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isDraggable) return
    if ((e.target as HTMLElement).closest('input, textarea, button')) return

    setIsDragging(true)
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    })
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !isDraggable) return

    const newX = e.clientX - dragStart.x
    const newY = e.clientY - dragStart.y

    // Constrain to window bounds
    const maxX = window.innerWidth - (chatRef.current?.offsetWidth || 0)
    const maxY = window.innerHeight - (chatRef.current?.offsetHeight || 0)

    setPosition({
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY)),
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, dragStart, position])

  if (!isDraggable) {
    return <>{children}</>
  }

  return (
    <div
      ref={chatRef}
      onMouseDown={handleMouseDown}
      className="fixed z-30 shadow-2xl rounded-lg overflow-hidden"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: '400px',
        maxHeight: '600px',
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
    >
      {/* Drag Handle */}
      <div className="bg-primary text-primary-foreground px-3 py-2 text-xs font-medium flex items-center justify-between">
        <span>💬 Chat (Drag to move)</span>
        <span className="text-xs opacity-75">ESC to dock</span>
      </div>
      {children}
    </div>
  )
}
