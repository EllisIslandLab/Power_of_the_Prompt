"use client"

import { useEffect, useState } from 'react'
import './animated-background.css'

export function AnimatedBackground({ 
  particleCount = 35, 
  enabled = true 
}: { 
  particleCount?: number
  enabled?: boolean 
}) {
  const [particles, setParticles] = useState<Array<{
    id: number
    size: number
    left: number
    top: number
    delay: number
    duration: number
    type: 'small' | 'medium' | 'large'
    glintDelay: number
  }>>([])

  useEffect(() => {
    if (!enabled) {
      setParticles([])
      return
    }

    const newParticles = Array.from({ length: particleCount }, (_, i) => {
      const random = Math.random()
      let size: number
      let type: 'small' | 'medium' | 'large'
      
      // Create varied particle sizes for more dramatic effect
      if (random < 0.3) {
        size = Math.random() * 4 + 2 // Small: 2-6px
        type = 'small'
      } else if (random < 0.7) {
        size = Math.random() * 6 + 6 // Medium: 6-12px  
        type = 'medium'
      } else {
        size = Math.random() * 8 + 12 // Large: 12-20px
        type = 'large'
      }

      return {
        id: i,
        size,
        left: Math.random() * 100,
        top: Math.random() * 100,
        delay: Math.random() * 30, // Longer stagger
        duration: Math.random() * 25 + 15, // 15-40s duration
        type,
        glintDelay: Math.random() * 3 // 0-3s glint delay
      }
    })
    
    setParticles(newParticles)
  }, [enabled, particleCount])

  if (!enabled || particles.length === 0) return null

  return (
    <div className="animated-bg-container">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className={`floating-particle ${particle.type}`}
          style={{
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            left: `${particle.left}%`,
            top: `${particle.top}%`,
            animationDelay: `${particle.delay}s, ${particle.glintDelay}s`,
            animationDuration: `${particle.duration}s, 3s`
          }}
        />
      ))}
    </div>
  )
}