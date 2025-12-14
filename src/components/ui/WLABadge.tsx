'use client'

import React from 'react'
import Image from 'next/image'
import { trackBadgeClick } from '@/lib/affiliate'

interface WLABadgeProps {
  /** The URL to link to when the badge is clicked */
  href?: string
  /** Additional CSS classes */
  className?: string
  /** Size variant */
  size?: 'sm' | 'md' | 'lg'
  /** Optional referrer ID for affiliate tracking */
  referrerId?: string
  /** Optional referrer email for affiliate tracking */
  referrerEmail?: string
}

const sizeConfig = {
  sm: {
    height: 32,
    logoSize: 24,
    fontSize: '0.7rem',
    padding: '4px 8px 4px 32px',
  },
  md: {
    height: 40,
    logoSize: 32,
    fontSize: '0.75rem',
    padding: '4px 12px 4px 44px',
  },
  lg: {
    height: 48,
    logoSize: 40,
    fontSize: '0.875rem',
    padding: '4px 16px 4px 56px',
  },
}

/**
 * Web Launch Academy Certification Badge
 *
 * Use this badge on websites built with or by Web Launch Academy.
 * Can optionally track affiliate referrals if referrerId and referrerEmail are provided.
 *
 * @example
 * // Basic usage
 * <WLABadge />
 *
 * @example
 * // With custom link
 * <WLABadge href="https://weblaunchacademy.com" />
 *
 * @example
 * // With affiliate tracking
 * <WLABadge referrerId="user-uuid" referrerEmail="user@example.com" />
 *
 * @example
 * // Different sizes
 * <WLABadge size="sm" />
 * <WLABadge size="lg" />
 */
export function WLABadge({
  href = "https://weblaunchacademy.com",
  className = "",
  size = "md",
  referrerId,
  referrerEmail,
}: WLABadgeProps) {
  const config = sizeConfig[size]

  const handleBadgeClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Track the click if affiliate info is provided
    if (referrerId && referrerEmail) {
      try {
        await trackBadgeClick(
          referrerId,
          referrerEmail,
          typeof window !== 'undefined' ? window.location.hostname : undefined
        )
      } catch (error) {
        // Log but don't block navigation
        console.error('Failed to track badge click:', error)
      }
    }
  }

  const badge = (
    <div
      className={`inline-flex items-center gap-2 rounded-md transition-opacity hover:opacity-80 ${className}`}
      style={{
        backgroundColor: '#0a1840',
        height: `${config.height}px`,
        paddingLeft: `${config.logoSize + 12}px`,
        paddingRight: '12px',
        paddingTop: '4px',
        paddingBottom: '4px',
        position: 'relative',
        borderLeft: '3px solid #ffdb57',
      }}
    >
      {/* Logo */}
      <div
        style={{
          position: 'absolute',
          left: '6px',
          top: '50%',
          transform: 'translateY(-50%)',
          width: `${config.logoSize}px`,
          height: `${config.logoSize}px`,
        }}
      >
        <Image
          src="/favicon-logo.png"
          alt="WLA Logo"
          width={config.logoSize}
          height={config.logoSize}
          className="rounded-full"
        />
      </div>

      {/* Text */}
      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
        <span
          style={{
            color: 'white',
            fontSize: config.fontSize,
            fontWeight: 600,
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          Built with
        </span>
        <span
          style={{
            color: '#ffdb57',
            fontSize: config.fontSize,
            fontWeight: 700,
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          Web Launch Academy
        </span>
      </div>
    </div>
  )

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block"
        title="Built with Web Launch Academy"
        style={{ textDecoration: 'none' }}
        onClick={handleBadgeClick}
      >
        {badge}
      </a>
    )
  }

  return badge
}
