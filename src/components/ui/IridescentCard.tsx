'use client'

import { useRef, useState, useEffect } from 'react'
import Image from 'next/image'

interface IridescentCardProps {
  children: React.ReactNode
  className?: string
}

export function IridescentCard({ children, className = '' }: IridescentCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [transform, setTransform] = useState({ rx: 0, ry: 0 })
  const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 })
  const [isHovered, setIsHovered] = useState(false)
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [tiltEnabled, setTiltEnabled] = useState(false)

  useEffect(() => {
    const card = cardRef.current
    if (!card) return

    const handleMouseMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width
      const y = (e.clientY - rect.top) / rect.height

      setMouse({ x, y })

      // Only apply tilt if enabled (after delay)
      if (tiltEnabled) {
        // 3D tilt effect - very subtle
        const tiltAmount = 1
        const ry = (x - 0.5) * 2 * tiltAmount
        const rx = -(y - 0.5) * 2 * tiltAmount

        setTransform({ rx, ry })
      }
    }

    const handleMouseEnter = () => {
      setIsHovered(true)
      // Delay tilt activation to prevent abrupt flick
      hoverTimeoutRef.current = setTimeout(() => {
        setTiltEnabled(true)
      }, 200)
    }

    const handleMouseLeave = () => {
      setIsHovered(false)
      setTiltEnabled(false)
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current)
      }
      setTransform({ rx: 0, ry: 0 })
      setMouse({ x: 0.5, y: 0.5 })
    }

    card.addEventListener('mousemove', handleMouseMove)
    card.addEventListener('mouseenter', handleMouseEnter)
    card.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      card.removeEventListener('mousemove', handleMouseMove)
      card.removeEventListener('mouseenter', handleMouseEnter)
      card.removeEventListener('mouseleave', handleMouseLeave)
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current)
      }
    }
  }, [tiltEnabled])

  return (
    <div
      ref={cardRef}
      className={`iridescent-card-wrapper ${className}`}
      style={{
        perspective: '1100px',
      }}
    >
      <div
        className="iridescent-card"
        style={{
          transform: `rotateX(${transform.rx}deg) rotateY(${transform.ry}deg) scale(${isHovered ? 1.02 : 1})`,
          transition: tiltEnabled ? 'transform 0.15s ease-out' : 'transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)',
          transformStyle: 'preserve-3d',
        }}
      >
        <div className="iridescent-card-inner">
          {children}

          {/* Iridescence overlay */}
          <div
            className="iridescence-overlay"
            style={{
              '--mx': mouse.x,
              '--my': mouse.y,
              opacity: 0,
            } as React.CSSProperties}
          />

          {/* Specular highlight */}
          <div
            className="specular-overlay"
            style={{
              '--mx': mouse.x,
              '--my': mouse.y,
              opacity: isHovered ? 0.55 : 0.22,
            } as React.CSSProperties}
          />

          {/* Rim light */}
          <div
            className="rim-overlay"
            style={{
              '--mx': mouse.x,
              '--my': mouse.y,
              opacity: isHovered ? 0.18 : 0,
            } as React.CSSProperties}
          />
        </div>
      </div>

      <style jsx>{`
        .iridescent-card-wrapper {
          position: relative;
          width: 100%;
          height: 100%;
        }

        .iridescent-card {
          position: relative;
          width: 100%;
          height: 100%;
          will-change: transform;
        }

        .iridescent-card-inner {
          position: relative;
          width: 100%;
          height: 100%;
          border-radius: 5px;
          overflow: hidden;
          border-top: 2px solid rgba(255, 255, 255, 0.9);
          background: linear-gradient(
            145deg,
            oklch(0.22 0.006 250) 0%,
            oklch(0.14 0.006 250) 55%,
            oklch(0.10 0.006 250) 100%
          );
          box-shadow:
            0 30px 60px -20px oklch(0 0 0 / 0.65),
            0 8px 20px -8px oklch(0 0 0 / 0.5),
            0 0 44px oklch(0.72 0.22 228 / 0.5),
            0 0 110px oklch(0.7 0.22 228 / 0.55),
            0 0 220px oklch(0.65 0.15 228 / 0.28);
        }

        .iridescence-overlay {
          position: absolute;
          inset: -20%;
          pointer-events: none;
          border-radius: 50%;
          background: conic-gradient(
            from calc(var(--mx) * 360deg + var(--my) * 180deg),
            hsl(0 100% 50%) 0deg,
            hsl(45 100% 55%) 22deg,
            hsl(90 100% 50%) 48deg,
            hsl(160 100% 50%) 79deg,
            hsl(210 100% 55%) 110deg,
            hsl(265 100% 55%) 143deg,
            hsl(310 100% 55%) 176deg,
            hsl(355 100% 55%) 203deg,
            hsl(0 100% 50%) 220deg
          );
          filter: blur(14px) saturate(1);
          mix-blend-mode: color-dodge;
          transform: translate3d(
            calc((var(--mx) - 0.5) * 8%),
            calc((var(--my) - 0.5) * 8%),
            0
          );
          transition: opacity 0.3s ease;
        }

        .specular-overlay {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: radial-gradient(
            circle 55% at calc(var(--mx) * 100%) calc(var(--my) * 100%),
            oklch(1 0 0 / 1) 0%,
            oklch(0.95 0.22 228 / 0.5) 30%,
            transparent 70%
          );
          mix-blend-mode: soft-light;
          transition: opacity 0.3s ease;
        }

        .rim-overlay {
          position: absolute;
          inset: 0;
          pointer-events: none;
          border-radius: inherit;
          background: radial-gradient(
            ellipse 120% 80% at calc(var(--mx) * 100%) calc(var(--my) * 100%),
            oklch(1 0 0 / 1) 0%,
            transparent 45%
          );
          mix-blend-mode: screen;
          transition: opacity 0.3s ease;
        }
      `}</style>
    </div>
  )
}
