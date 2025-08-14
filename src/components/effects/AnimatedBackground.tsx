"use client"

import { useEffect, useState } from 'react'
import { useDarkMode } from '@/contexts/DarkModeContext'
import './animated-background.css'

interface Cube {
  id: number
  x: number
  y: number
  size: 'small' | 'medium' | 'large'
  delay: number
  duration: number
  glinting: boolean
}

interface ConnectionLine {
  id: string
  x1: number
  y1: number
  x2: number
  y2: number
  length: number
  angle: number
}

export function AnimatedBackground() {
  const { isDarkMode } = useDarkMode()
  const [cubes, setCubes] = useState<Cube[]>([])
  const [connections, setConnections] = useState<ConnectionLine[]>([])

  useEffect(() => {
    if (!isDarkMode) {
      setCubes([])
      setConnections([])
      return
    }

    // Create fewer, larger cubes for dramatic effect
    const newCubes: Cube[] = Array.from({ length: 8 }, (_, i) => {
      const random = Math.random()
      let size: 'small' | 'medium' | 'large'
      
      // More large cubes for visibility
      if (random < 0.2) {
        size = 'small'
      } else if (random < 0.5) {
        size = 'medium'
      } else {
        size = 'large'
      }

      return {
        id: i,
        x: Math.random() * 90 + 5, // 5-95% to avoid edges
        y: Math.random() * 90 + 5,
        size,
        delay: Math.random() * 60, // Long stagger for underwater effect
        duration: Math.random() * 40 + 80, // Very slow: 80-120 seconds
        glinting: Math.random() > 0.5
      }
    })

    setCubes(newCubes)

    // Create connection lines between nearby cubes
    const newConnections: ConnectionLine[] = []
    for (let i = 0; i < newCubes.length; i++) {
      for (let j = i + 1; j < newCubes.length; j++) {
        const cube1 = newCubes[i]
        const cube2 = newCubes[j]
        
        const distance = Math.sqrt(
          Math.pow(cube2.x - cube1.x, 2) + Math.pow(cube2.y - cube1.y, 2)
        )
        
        // Only connect cubes that are relatively close
        if (distance < 40) {
          const angle = Math.atan2(cube2.y - cube1.y, cube2.x - cube1.x) * 180 / Math.PI
          
          newConnections.push({
            id: `${i}-${j}`,
            x1: cube1.x,
            y1: cube1.y,
            x2: cube2.x,
            y2: cube2.y,
            length: distance,
            angle
          })
        }
      }
    }

    setConnections(newConnections)
  }, [isDarkMode])

  // Don't render anything in light mode
  if (!isDarkMode) {
    return null
  }

  return (
    <div className="dark-mode-cubes-container">
      {/* Connection lines */}
      {connections.map((line) => (
        <div
          key={line.id}
          className="connection-line"
          style={{
            left: `${line.x1}%`,
            top: `${line.y1}%`,
            width: `${line.length}%`,
            transform: `rotate(${line.angle}deg)`,
            animationDelay: `${Math.random() * 4}s`
          }}
        />
      ))}

      {/* Floating cubes */}
      {cubes.map((cube) => (
        <div
          key={cube.id}
          className={`floating-cube ${cube.size} ${cube.glinting ? 'glinting' : ''}`}
          style={{
            left: `${cube.x}%`,
            top: `${cube.y}%`,
            animationDelay: `${cube.delay}s, ${cube.delay + 10}s, ${cube.delay + 20}s`,
            animationDuration: `${cube.duration}s, 40s, 8s`
          }}
        />
      ))}
    </div>
  )
}