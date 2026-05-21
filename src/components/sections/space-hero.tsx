'use client'

import { useState, useRef } from 'react'
import dynamic from 'next/dynamic'
import type { HCaptchaRef } from "@/components/common/HCaptcha"

// Lazy load HCaptcha only when needed
const HCaptcha = dynamic(() => import("@/components/common/HCaptcha").then(mod => ({ default: mod.HCaptcha })), {
  ssr: false,
  loading: () => <div className="text-sm text-muted-foreground">Loading verification...</div>
})

export function SpaceHero() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [wantsOwnership, setWantsOwnership] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const [shouldLoadCaptcha, setShouldLoadCaptcha] = useState(false)
  const captchaRef = useRef<HCaptchaRef>(null)
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)
  const [clickedCard, setClickedCard] = useState<number | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    if (!captchaToken) {
      setError('Please complete the captcha verification')
      setIsSubmitting(false)
      return
    }

    try {
      const response = await fetch('/api/waitlist/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          name: name || undefined,
          wantsOwnership,
          source: 'space-hero',
          captchaToken,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to sign up')
      }

      setSuccess(true)
      setEmail('')
      setName('')
      setWantsOwnership(false)
      setCaptchaToken(null)
      captchaRef.current?.resetCaptcha()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setCaptchaToken(null)
      captchaRef.current?.resetCaptcha()
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleCaptchaVerify(token: string) {
    setCaptchaToken(token)
    setError(null)
  }

  function handleCaptchaExpire() {
    setCaptchaToken(null)
    setError('Captcha expired. Please verify again.')
  }

  return (
    <section id="hero" className="relative min-h-[921px] flex items-center justify-center px-5 md:px-16 py-24 overflow-hidden">
      {/* Decorative Nebula Background */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20 bg-[radial-gradient(circle_at_50%_50%,_#274788_0%,_transparent_50%)]"></div>

      <div className="glass-panel relative z-10 max-w-4xl w-full p-8 md:p-12 rounded-xl text-center flex flex-col items-center border-t-2 border-white">
        <div className="flex items-center gap-3 mb-6">
          <span className="flex h-3 w-3 rounded-full bg-[#b0c6ff] pulse-blue"></span>
          <span className="text-[13px] font-medium tracking-[0.05em] text-[#b0c6ff] uppercase">SYSTEMS READY</span>
        </div>

        <span className="text-xs font-bold tracking-[0.3em] text-[#b0c6ff] mb-4 uppercase">PRIMARY MODULE</span>

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-none tracking-tight">
          Build Once, <br/> <span className="text-[#e8ea23]">Own Forever.</span>
        </h1>

        <p className="text-base text-[#c4c7c8] max-w-2xl mb-8 leading-relaxed">
          Experience starship-grade infrastructure. Build a startup website where you own the code - no hosting fees, no hidden costs. Pure architectural freedom.
        </p>

        {/* Feature Cards */}
        <div className="w-full max-w-2xl mb-8">
          <div className="grid grid-cols-3 gap-3 md:gap-4">
            {/* Speed Card */}
            <div
              className="glass-panel rounded-lg p-4 md:p-6 cursor-pointer transition-all duration-300 hover:border-white/50 hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]"
              onMouseEnter={() => setHoveredCard(0)}
              onMouseLeave={() => setHoveredCard(null)}
              onClick={() => setClickedCard(clickedCard === 0 ? null : 0)}
            >
              <div className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-[#e8ea23] mb-2">Speed</div>
              <div className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-white leading-tight">Tech-stack</div>
            </div>

            {/* Security Card */}
            <div
              className="glass-panel rounded-lg p-4 md:p-6 cursor-pointer transition-all duration-300 hover:border-white/50 hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]"
              onMouseEnter={() => setHoveredCard(1)}
              onMouseLeave={() => setHoveredCard(null)}
              onClick={() => setClickedCard(clickedCard === 1 ? null : 1)}
            >
              <div className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-[#e8ea23] mb-2">Security</div>
              <div className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-white leading-tight">Patient Testing</div>
            </div>

            {/* Control Card */}
            <div
              className="glass-panel rounded-lg p-4 md:p-6 cursor-pointer transition-all duration-300 hover:border-white/50 hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]"
              onMouseEnter={() => setHoveredCard(2)}
              onMouseLeave={() => setHoveredCard(null)}
              onClick={() => setClickedCard(clickedCard === 2 ? null : 2)}
            >
              <div className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-[#e8ea23] mb-2">Control</div>
              <div className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-white leading-tight">Code-ownership</div>
            </div>
          </div>

          {/* Feature description text */}
          <div className="mt-4 min-h-[40px] w-full">
            {(hoveredCard !== null || clickedCard !== null) && (
              <div className="text-[10px] md:text-[11px] text-[#c4c7c8] leading-relaxed animate-fade-in">
                {hoveredCard === 0 || clickedCard === 0 ? '— Next.js hosted on Vercel' : ''}
                {hoveredCard === 1 || clickedCard === 1 ? '— AI generated checklist that is manually tested' : ''}
                {hoveredCard === 2 || clickedCard === 2 ? '— Full code extraction and ecosystem for maintaining/updating website as-needed with full transparency and zero lock-ins' : ''}
              </div>
            )}
          </div>
        </div>

        {/* Email Signup Form */}
        {success ? (
          <div className="text-center py-6 w-full max-w-md">
            <div className="flex justify-center mb-4">
              <span className="material-symbols-outlined text-[#e8ea23] text-[48px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                check_circle
              </span>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-white">You're on the list!</h3>
            <p className="text-[#c4c7c8]">
              We'll notify you when we launch.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
            <div className="flex flex-col md:flex-row w-full gap-2">
              <div className="relative flex-grow">
                <input
                  className="w-full bg-[#080c25] border border-white/10 rounded-lg px-4 py-4 text-[13px] font-medium tracking-[0.05em] text-white placeholder:text-white/30 focus:border-white focus:ring-0 transition-all"
                  placeholder="your.email@example.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setShouldLoadCaptcha(true)}
                  disabled={isSubmitting}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting || !email || !captchaToken}
                className="bg-[#e8ea23] text-[#1c1d00] px-8 py-4 rounded-lg text-xs font-bold uppercase tracking-wider gold-glow hover:brightness-110 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                JOIN WAITLIST
              </button>
            </div>

            {/* hCaptcha Widget */}
            {shouldLoadCaptcha && (
              <div className="flex justify-center py-2">
                <HCaptcha
                  ref={captchaRef}
                  onVerify={handleCaptchaVerify}
                  onExpire={handleCaptchaExpire}
                />
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}
          </form>
        )}

        <div className="mt-8 text-[10px] font-medium tracking-[0.05em] text-[#c4c7c8] opacity-50">
          OFFICIAL ENROLLMENT: STARTING AT $50/MONTH
        </div>
      </div>

      <style jsx>{`
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
      `}</style>
    </section>
  )
}
