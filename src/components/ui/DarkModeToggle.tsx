"use client"

import { useDarkMode } from '@/contexts/DarkModeContext'
import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function DarkModeToggle() {
  const { isDarkMode, toggleDarkMode } = useDarkMode()

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Button
        onClick={toggleDarkMode}
        size="lg"
        variant={isDarkMode ? "secondary" : "outline"}
        className={`
          rounded-full p-3 shadow-lg transition-all duration-300 hover:scale-110
          ${isDarkMode 
            ? 'bg-gray-800 text-yellow-400 border-gray-600 hover:bg-gray-700' 
            : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-50'
          }
        `}
        aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {isDarkMode ? (
          <Sun className="h-6 w-6" />
        ) : (
          <Moon className="h-6 w-6" />
        )}
      </Button>
    </div>
  )
}