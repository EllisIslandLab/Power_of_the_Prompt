"use client"

import { useEffect, useState } from 'react'

/**
 * LIGHTWEIGHT ANIMATED BACKGROUND COMPONENT
 * =========================================
 * 
 * This component creates a subtle underwater/floating particle effect using pure CSS.
 * It's designed to be:
 * - Lightweight (no external libraries)
 * - Performant (CSS animations with hardware acceleration)
 * - Easy to remove (contained in this single component)
 * - Accessible (respects prefers-reduced-motion)
 * 
 * TO REMOVE THIS EFFECT:
 * 1. Remove <AnimatedBackground /> from your layout/page
 * 2. Delete this file
 * 3. Remove any imports of this component
 * 
 * Performance: Uses CSS transforms and opacity only for 60fps animations
 */

interface AnimatedBackgroundProps {
  /** Number of floating particles (default: 50) */
  particleCount?: number
  /** Enable/disable the animation (default: true) */
  enabled?: boolean
  /** Opacity of particles (default: 0.15) */
  opacity?: number
  /** Animation speed multiplier (default: 1) */
  speed?: number
}

export function AnimatedBackground({ 
  particleCount = 50, 
  enabled = true,
  opacity = 0.15,
  speed = 1
}: AnimatedBackgroundProps) {
  const [particles, setParticles] = useState<Array<{
    id: number
    size: number
    x: number
    y: number
    delay: number
    duration: number
  }>>([])

  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    // Respect user's motion preferences for accessibility
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mediaQuery.matches)
    
    const handleChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches)
    mediaQuery.addEventListener('change', handleChange)
    
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  useEffect(() => {
    if (!enabled || reducedMotion) return

    // Generate random particles with physics-based properties
    const newParticles = Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      size: Math.random() * 4 + 1, // 1-5px diameter
      x: Math.random() * 100, // 0-100% across screen
      y: Math.random() * 100, // 0-100% down screen
      delay: Math.random() * 20, // 0-20s staggered start
      duration: (Math.random() * 30 + 20) / speed // 20-50s duration, adjusted by speed
    }))
    
    setParticles(newParticles)
  }, [enabled, particleCount, speed, reducedMotion])

  // Don't render if disabled or user prefers reduced motion
  if (!enabled || reducedMotion) return null

  return (
    <>
      {/* ANIMATED BACKGROUND STYLES - Easy to remove by deleting this style tag */}
      <style jsx>{`
        @keyframes floatUp {
          0% {
            transform: translateY(100vh) translateX(0px) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: ${opacity};
          }
          90% {
            opacity: ${opacity};
          }
          100% {
            transform: translateY(-10vh) translateX(var(--drift, 50px)) rotate(360deg);
            opacity: 0;
          }
        }

        @keyframes gentleFloat {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
          }
          25% {
            transform: translateY(-20px) translateX(10px);
          }
          50% {
            transform: translateY(0px) translateX(20px);
          }
          75% {
            transform: translateY(20px) translateX(10px);
          }
        }

        .particle {
          position: absolute;
          background: radial-gradient(circle, rgba(59, 130, 246, 0.8), rgba(34, 197, 94, 0.6), transparent);
          border-radius: 50%;
          pointer-events: none;
          will-change: transform, opacity;
          animation: floatUp var(--duration, 30s) var(--delay, 0s) infinite linear,
                     gentleFloat 8s infinite ease-in-out;
          --drift: var(--drift-amount, 50px);
        }

        .background-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          z-index: -1;
          background: linear-gradient(
            135deg,
            rgba(30, 64, 175, 0.02) 0%,
            rgba(16, 185, 129, 0.02) 50%,
            rgba(59, 130, 246, 0.02) 100%
          );
        }
      `}</style>

      {/* ANIMATED BACKGROUND CONTAINER - Easy to remove */}
      <div className="background-container">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="particle"
            style={{
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              '--duration': `${particle.duration}s`,
              '--delay': `${particle.delay}s`,
              '--drift-amount': `${Math.random() * 100 - 50}px`, // -50 to +50px drift
            } as React.CSSProperties}
          />
        ))}
      </div>
    </>
  )
}

/**
 * USAGE EXAMPLES:
 * 
 * Basic usage:
 * <AnimatedBackground />
 * 
 * Customized:
 * <AnimatedBackground 
 *   particleCount={30} 
 *   opacity={0.1} 
 *   speed={0.5} 
 * />
 * 
 * Disabled:
 * <AnimatedBackground enabled={false} />
 */