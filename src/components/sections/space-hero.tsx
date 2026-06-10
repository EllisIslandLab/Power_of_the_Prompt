'use client'

import { useState, useRef, useEffect } from 'react'
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
  const [typedText, setTypedText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [userInteracted, setUserInteracted] = useState(false)
  const [autoPlayCard, setAutoPlayCard] = useState<number>(0)
  const [showLaser, setShowLaser] = useState(false)
  const [lastHoveredCard, setLastHoveredCard] = useState<number | null>(null)
  const resumeTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const cardDescriptions = [
    '— Built with Next.js on Vercel, integrated with best-in-class services offering generous free tiers.',
    '— Secure by design, thoroughly tested with AI-generated checklists, and test-driven for a full day before launch.',
    '— Complete source code and deployment setup delivered to you for maintaining and updating your website as needed, with full transparency and zero lock-ins.'
  ]

  // Auto-play cards sequentially until user interacts
  useEffect(() => {
    if (userInteracted) return

    const autoPlayInterval = setInterval(() => {
      setAutoPlayCard((prev) => (prev + 1) % 3)
    }, 4000) // Change card every 4 seconds

    return () => clearInterval(autoPlayInterval)
  }, [userInteracted])

  // Handle hover end with delay before resuming autoplay
  useEffect(() => {
    if (hoveredCard === null && userInteracted && lastHoveredCard !== null) {
      // User stopped hovering, wait 1 second before resuming autoplay
      resumeTimeoutRef.current = setTimeout(() => {
        setUserInteracted(false)
        setLastHoveredCard(null)
      }, 1000)

      return () => {
        if (resumeTimeoutRef.current) {
          clearTimeout(resumeTimeoutRef.current)
        }
      }
    }
  }, [hoveredCard, userInteracted, lastHoveredCard])

  // Main effect for card descriptions
  useEffect(() => {
    // Determine which card to show and speed
    let activeCard: number | null = null
    let isFastAnimation = false

    if (hoveredCard !== null) {
      // Hovering: fast animation with laser
      activeCard = hoveredCard
      isFastAnimation = true
    } else if (lastHoveredCard !== null && userInteracted) {
      // Just stopped hovering, show last hovered card text (no animation)
      activeCard = lastHoveredCard
      isFastAnimation = false
      // Keep the text as-is, don't re-animate
      return
    } else if (!userInteracted) {
      // Autoplay: slow animation
      activeCard = autoPlayCard
      isFastAnimation = false
    }

    if (activeCard === null) {
      setTypedText('')
      setIsTyping(false)
      setShowLaser(false)
      return
    }

    const fullText = cardDescriptions[activeCard]

    // Show laser for fast (hover) animation
    if (isFastAnimation) {
      setShowLaser(true)
      setTimeout(() => setShowLaser(false), 600)
    } else {
      setShowLaser(false)
    }

    // Typewriter effect (fast on hover, slow on autoplay)
    setIsTyping(true)
    setTypedText('')

    let currentIndex = 0
    const speed = isFastAnimation ? 3 : 20 // 3ms for hover, 20ms for autoplay
    const typingInterval = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setTypedText(fullText.slice(0, currentIndex))
        currentIndex++
      } else {
        setIsTyping(false)
        clearInterval(typingInterval)
      }
    }, speed)

    return () => clearInterval(typingInterval)
  }, [hoveredCard, autoPlayCard, userInteracted, lastHoveredCard])

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

      <div className="glass-panel relative z-10 max-w-4xl w-full p-8 md:p-12 rounded-xl text-center flex flex-col items-center border-t-8 border-white">
        <div className="flex items-center gap-3 mb-6">
          <span className="flex h-3 w-3 rounded-full bg-[#b1c6f9] pulse-blue"></span>
          <span className="text-[13px] font-medium tracking-[0.05em] text-[#b1c6f9] uppercase">SYSTEMS READY</span>
        </div>

        <span className="text-xs font-bold tracking-[0.3em] text-[#b1c6f9] mb-4 uppercase">PRIMARY MODULE</span>

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-none tracking-tight">
          Build Once, <br/> <span className="text-[#FFB800]">Own Forever.</span>
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
              onMouseEnter={() => {
                setHoveredCard(0);
                setLastHoveredCard(0);
                setUserInteracted(true);
                if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
              }}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-[#FFB800] mb-2">Speed</div>
              <div className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-white leading-tight">Tech-stack</div>
            </div>

            {/* Quality Card */}
            <div
              className="glass-panel rounded-lg p-4 md:p-6 cursor-pointer transition-all duration-300 hover:border-white/50 hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]"
              onMouseEnter={() => {
                setHoveredCard(1);
                setLastHoveredCard(1);
                setUserInteracted(true);
                if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
              }}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-[#FFB800] mb-2">Quality</div>
              <div className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-white leading-tight">Patient Implementation</div>
            </div>

            {/* Control Card */}
            <div
              className="glass-panel rounded-lg p-4 md:p-6 cursor-pointer transition-all duration-300 hover:border-white/50 hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]"
              onMouseEnter={() => {
                setHoveredCard(2);
                setLastHoveredCard(2);
                setUserInteracted(true);
                if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
              }}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-[#FFB800] mb-2">Control</div>
              <div className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-white leading-tight">Code-ownership</div>
            </div>
          </div>

          {/* Feature description text */}
          <div className="mt-4 min-h-[40px] w-full flex justify-start">
            {typedText && (
              <div className="relative text-[10px] md:text-[11px] text-[#c4c7c8] leading-relaxed">
                {typedText}
                {isTyping && <span className="inline-block w-[2px] h-3 bg-[#c4c7c8] ml-0.5 animate-pulse"></span>}
                {showLaser && (
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="laser-beam"></div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Goal Text */}
        <p className="text-sm md:text-base text-[#c4c7c8] max-w-2xl mb-6 leading-relaxed text-center">
          If you'd like a website you actually own, or would simply like to learn more about what that means, just input your email in the field below.
        </p>

        {/* Email Signup Form */}
        {success ? (
          <div className="glass-panel rounded-xl p-8 w-full max-w-lg border border-[#FFB800]/30">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-[#FFB800]/20 flex items-center justify-center">
                <span className="text-[#FFB800] text-4xl">✓</span>
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-4 text-white text-center">Check Your Inbox!</h3>
            <div className="space-y-3 text-[#c4c7c8] text-sm leading-relaxed">
              <p className="text-center">
                <strong className="text-white">Please check your inbox and spam folder</strong> for an email from:
              </p>
              <div className="bg-[#080c25] border border-white/10 rounded-lg px-4 py-3 text-center">
                <code className="text-[#FFB800] font-mono">hello@weblaunchacademy.com</code>
              </div>
              <p className="text-center">
                <strong className="text-white">Reply to that email</strong> and I'll get back to you ASAP. I read and respond to all emails personally.
              </p>
            </div>
            <button
              onClick={() => setSuccess(false)}
              className="mt-6 w-full bg-white/5 hover:bg-white/10 border border-white/20 text-white px-6 py-3 rounded-lg text-sm font-medium transition-all"
            >
              Close
            </button>
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
                className="bg-[#FFB800] text-[#271900] px-8 py-4 rounded-lg text-xs font-bold uppercase tracking-wider gold-glow hover:brightness-110 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                LEARN MORE
              </button>
            </div>

            {/* Ownership Checkbox */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="wantsOwnership"
                checked={wantsOwnership}
                onChange={(e) => setWantsOwnership(e.target.checked)}
                className="w-5 h-5 rounded border-white/20 bg-[#080c25] text-[#FFB800] focus:ring-[#FFB800] focus:ring-offset-0 cursor-pointer"
              />
              <label htmlFor="wantsOwnership" className="text-sm text-[#c4c7c8] cursor-pointer">
                Yes, I want to own the code for my website!
              </label>
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
        @keyframes laserSweep {
          0% {
            left: -100%;
          }
          100% {
            left: 100%;
          }
        }

        .laser-beam {
          position: absolute;
          top: 0;
          left: -100%;
          width: 20%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(176, 198, 255, 0.3) 30%,
            rgba(176, 198, 255, 0.8) 50%,
            rgba(176, 198, 255, 0.3) 70%,
            transparent 100%
          );
          box-shadow: 0 0 20px rgba(176, 198, 255, 0.8);
          animation: laserSweep 0.6s ease-out;
        }

        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
      `}</style>
    </section>
  )
}
