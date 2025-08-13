"use client"

import { useEffect, useState } from 'react'

export function AnimatedBackground({ 
  particleCount = 20, 
  enabled = true 
}: { 
  particleCount?: number
  enabled?: boolean 
}) {
  const [particles, setParticles] = useState<number[]>([])

  useEffect(() => {
    if (!enabled) return
    setParticles(Array.from({ length: particleCount }, (_, i) => i))
  }, [enabled, particleCount])

  if (!enabled || particles.length === 0) return null

  return (
    <>
      {/* Add CSS animations to global styles */}
      <style jsx global>{`
        .animated-bg-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          pointer-events: none;
          z-index: -1;
          overflow: hidden;
          background: linear-gradient(135deg, 
            rgba(59, 130, 246, 0.03) 0%, 
            rgba(16, 185, 129, 0.03) 100%);
        }
        
        .floating-particle {
          position: absolute;
          background: radial-gradient(circle, 
            rgba(59, 130, 246, 0.3), 
            rgba(34, 197, 94, 0.2), 
            transparent);
          border-radius: 50%;
          animation: float 25s infinite linear;
          opacity: 0;
        }
        
        @keyframes float {
          0% {
            transform: translateY(100vh) translateX(0px);
            opacity: 0;
          }
          10% {
            opacity: 0.8;
          }
          90% {
            opacity: 0.8;
          }
          100% {
            transform: translateY(-10vh) translateX(50px);
            opacity: 0;
          }
        }
        
        @media (prefers-reduced-motion: reduce) {
          .floating-particle {
            animation: none;
            opacity: 0;
          }
        }
      `}</style>
      
      <div className="animated-bg-container">
        {particles.map((i) => (
          <div
            key={i}
            className="floating-particle"
            style={{
              width: `${Math.random() * 4 + 2}px`,
              height: `${Math.random() * 4 + 2}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 25}s`,
              animationDuration: `${Math.random() * 20 + 20}s`
            }}
          />
        ))}
      </div>
    </>
  )
}