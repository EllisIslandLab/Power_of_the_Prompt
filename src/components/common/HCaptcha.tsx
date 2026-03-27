'use client'

import { useRef, useCallback, forwardRef, useImperativeHandle } from 'react'
import HCaptchaComponent from '@hcaptcha/react-hcaptcha'
import { getHCaptchaConfig } from '@/lib/env-config'

/**
 * HCaptcha Component
 *
 * A reusable wrapper around @hcaptcha/react-hcaptcha with built-in error handling
 * and TypeScript support.
 *
 * Usage:
 * ```tsx
 * const captchaRef = useRef<HCaptchaRef>(null)
 *
 * const handleVerify = (token: string) => {
 *   console.log('Captcha verified:', token)
 * }
 *
 * const handleExpire = () => {
 *   console.log('Captcha expired')
 * }
 *
 * <HCaptcha
 *   ref={captchaRef}
 *   onVerify={handleVerify}
 *   onExpire={handleExpire}
 * />
 *
 * // Reset the captcha
 * captchaRef.current?.resetCaptcha()
 *
 * // Execute the captcha programmatically
 * captchaRef.current?.execute()
 * ```
 */

export interface HCaptchaRef {
  resetCaptcha: () => void
  execute: () => void
  executeAsync: () => Promise<{ response: string; key: string }>
  getResponse: () => string
  getRespKey: () => string
}

interface HCaptchaProps {
  onVerify: (token: string) => void
  onExpire?: () => void
  onError?: (error: string) => void
  onOpen?: () => void
  onClose?: () => void
  onChalExpired?: () => void
  size?: 'normal' | 'compact' | 'invisible'
  theme?: 'light' | 'dark'
  tabIndex?: number
  languageOverride?: string
}

export const HCaptcha = forwardRef<HCaptchaRef, HCaptchaProps>(
  (
    {
      onVerify,
      onExpire,
      onError,
      onOpen,
      onClose,
      onChalExpired,
      size = 'normal',
      theme = 'light',
      tabIndex,
      languageOverride,
    },
    ref
  ) => {
    const captchaRef = useRef<HCaptchaComponent>(null)
    const config = getHCaptchaConfig()
    const siteKey = config.siteKey

    // Expose methods to parent via ref
    useImperativeHandle(ref, () => ({
      resetCaptcha: () => {
        captchaRef.current?.resetCaptcha()
      },
      execute: () => {
        captchaRef.current?.execute()
      },
      executeAsync: async () => {
        if (!captchaRef.current) {
          throw new Error('HCaptcha not initialized')
        }
        return captchaRef.current.execute({ async: true })
      },
      getResponse: () => {
        return captchaRef.current?.getResponse() || ''
      },
      getRespKey: () => {
        return captchaRef.current?.getRespKey() || ''
      },
    }))

    const handleVerify = useCallback(
      (token: string) => {
        onVerify(token)
      },
      [onVerify]
    )

    const handleExpire = useCallback(() => {
      onExpire?.()
    }, [onExpire])

    const handleError = useCallback(
      (error: string) => {
        console.error('HCaptcha error:', error)
        onError?.(error)
      },
      [onError]
    )

    // Don't render if siteKey is missing
    if (!siteKey) {
      console.error('HCaptcha site key not configured')
      return (
        <div className="rounded border border-red-500 bg-red-50 p-3 text-sm text-red-700">
          Captcha not configured. Please contact support.
        </div>
      )
    }

    return (
      <div className="flex justify-center">
        <HCaptchaComponent
          ref={captchaRef}
          sitekey={siteKey}
          onVerify={handleVerify}
          onExpire={handleExpire}
          onError={handleError}
          onOpen={onOpen}
          onClose={onClose}
          onChalExpired={onChalExpired}
          size={size}
          theme={theme}
          tabIndex={tabIndex}
          languageOverride={languageOverride}
        />
      </div>
    )
  }
)

HCaptcha.displayName = 'HCaptcha'
