"use client"

import { useEffect, useState } from 'react'
import './animated-background.css'

export function AnimatedBackground({ 
  particleCount = 25, 
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
  }>>([])

  useEffect(() => {
    if (!enabled) {
      setParticles([])
      return
    }

    const newParticles = Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      size: Math.random() * 6 + 3, // 3-9px for better visibility
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 25,
      duration: Math.random() * 20 + 20
    }))
    
    setParticles(newParticles)
  }, [enabled, particleCount])

  if (!enabled || particles.length === 0) return null

  return (
    <div className="animated-bg-container">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="floating-particle"
          style={{
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            left: `${particle.left}%`,
            top: `${particle.top}%`,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`
          }}
        />
      ))}
    </div>
  )
}