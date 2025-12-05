'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

function BadgeDemoContent() {
  const searchParams = useSearchParams()
  const [shouldHighlight, setShouldHighlight] = useState(false)
  const [showBanner, setShowBanner] = useState(false)
  const [stars, setStars] = useState<Array<{ left: number; top: number; opacity: number; animationDelay: string; animationDuration: string }>>([])
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    // Generate stars on client side only to avoid hydration mismatch
    setIsMounted(true)
    const generatedStars = Array.from({ length: 50 }).map(() => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
      opacity: Math.random() * 0.5 + 0.5,
      animationDelay: '',
      animationDuration: ''
    }))
    setStars(generatedStars)
  }, [])

  useEffect(() => {
    const highlight = searchParams?.get('highlight') === 'true'
    setShouldHighlight(highlight)

    if (highlight) {
      setShowBanner(true)
      // Scroll to affiliate section
      setTimeout(() => {
        document.getElementById('affiliate-section')?.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        })
      }, 100)

      // Hide banner after 8 seconds
      setTimeout(() => setShowBanner(false), 8000)
    }
  }, [searchParams])

  const badgeClass = shouldHighlight
    ? "inline-flex items-center gap-2 rounded-md h-[40px] pl-[44px] pr-3 py-1 relative border-l-[3px] animate-pulse-glow"
    : "inline-flex items-center gap-2 rounded-md h-[40px] pl-[44px] pr-3 py-1 relative border-l-[3px] transition-all duration-300 hover:shadow-[0_0_25px_rgba(255,219,87,0.8)]"

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Space Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* Deep space gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-950 to-black" />

        {/* Distant nebula - purple and green */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-[1000px] h-[1000px] rounded-full blur-3xl opacity-30 animate-nebula-drift" style={{
            background: 'radial-gradient(circle, rgba(147, 51, 234, 0.4) 0%, rgba(34, 197, 94, 0.3) 50%, transparent 70%)'
          }} />
          <div className="absolute bottom-1/3 right-1/4 w-[800px] h-[800px] rounded-full blur-3xl opacity-25 animate-nebula-drift-reverse" style={{
            background: 'radial-gradient(circle, rgba(34, 197, 94, 0.4) 0%, rgba(147, 51, 234, 0.3) 50%, transparent 70%)'
          }} />
        </div>

        {/* Stars - stationary */}
        {isMounted && (
          <svg className="absolute inset-0 w-full h-full">
            {stars.map((star, i) => (
              <circle
                key={i}
                cx={`${star.left}%`}
                cy={`${star.top}%`}
                r="1.5"
                fill="white"
                opacity={star.opacity}
              />
            ))}
          </svg>
        )}
      </div>

      {/* Content wrapper with higher z-index */}
      <div className="relative z-10">
      {/* Notification Banner */}
      {showBanner && (
        <div className="fixed top-20 right-4 z-50 max-w-sm animate-slide-in">
          <Card className="bg-accent border-accent-foreground/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🎯</span>
                <div>
                  <div className="text-sm font-semibold text-accent-foreground">
                    This is Your Referral Badge!
                  </div>
                  <div className="text-xs text-accent-foreground/70">
                    The glowing badges below earn you commissions
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="container mx-auto max-w-6xl px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
            <span className="inline-block mr-2">🚀</span>
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-yellow-400 bg-clip-text text-transparent inline-block pb-2">
              Web Launch Academy Badge
            </span>
          </h1>
          <p className="text-xl text-white">
            Give this badge to clients - two methods available!
          </p>
        </div>

        {/* Affiliate Program Section */}
        <Card id="affiliate-section" className="mb-12 border-accent/50 bg-gray-900/80 backdrop-blur-sm">
          <CardContent className="p-8">
            <h2 className="text-3xl font-bold mb-4 text-center text-white">
              💰 Earn Up To $250 Per Referral!
            </h2>
            <p className="text-lg text-white/90 text-center mb-8">
              When you add the Web Launch Academy badge to your website, you're not just showing off your tech stack — you're earning affiliate commissions!
            </p>

            {/* Commission Structure */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <Card className="bg-green-50 dark:bg-green-950/20 border-green-500">
                <CardContent className="p-6 text-center">
                  <div className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2">25%</div>
                  <div className="font-semibold text-gray-900 dark:text-gray-100 mb-1">$0 - $200</div>
                  <div className="text-sm text-gray-700 dark:text-gray-300 mb-3">First $200 in purchases</div>
                  <div className="text-green-600 dark:text-green-400 font-semibold">= $50 commission</div>
                </CardContent>
              </Card>

              <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-500">
                <CardContent className="p-6 text-center">
                  <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">10%</div>
                  <div className="font-semibold text-gray-900 dark:text-gray-100 mb-1">$200 - $1,200</div>
                  <div className="text-sm text-gray-700 dark:text-gray-300 mb-3">Next $1,000 in purchases</div>
                  <div className="text-blue-600 dark:text-blue-400 font-semibold">= $100 commission</div>
                </CardContent>
              </Card>

              <Card className="bg-yellow-50 dark:bg-yellow-950/20 border-yellow-500">
                <CardContent className="p-6 text-center">
                  <div className="text-4xl font-bold text-yellow-600 dark:text-yellow-400 mb-2">5%</div>
                  <div className="font-semibold text-gray-900 dark:text-gray-100 mb-1">$1,200 - $3,200</div>
                  <div className="text-sm text-gray-700 dark:text-gray-300 mb-3">Next $2,000 in purchases</div>
                  <div className="text-yellow-600 dark:text-yellow-400 font-semibold">= $100 commission</div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-gray-800/80 backdrop-blur-sm mb-6">
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-white mb-2">
                  Maximum Per Referral: <span className="text-green-400">$250</span>
                </div>
                <div className="text-white/90">
                  Each client who clicks your badge and makes a purchase earns you commission!
                </div>
              </CardContent>
            </Card>

            {/* How It Works */}
            <Card className="bg-gray-800/80 backdrop-blur-sm border-accent/50">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-white mb-4">🎯 How It Works</h3>
                <ol className="space-y-2 ml-5 list-decimal text-white">
                  <li><strong>Add the badge</strong> to your website using one of the methods below</li>
                  <li><strong>When visitors click</strong> your badge, they're tracked as your referral</li>
                  <li><strong>If they purchase</strong> any Web Launch Academy service, you earn commission</li>
                  <li><strong>Get paid</strong> monthly via your preferred method</li>
                </ol>
              </CardContent>
            </Card>

            <Card className="mt-6 bg-green-50 dark:bg-green-950/20 border-green-500/50">
              <CardContent className="p-6">
                <p className="text-sm text-gray-900 dark:text-gray-100">
                  <strong>🔒 Transparency:</strong> This is an affiliate program. When someone clicks the badge on your site and makes a purchase, you earn a commission. The badge serves as both a certification of how your site was built AND an affiliate link. Win-win!
                </p>
              </CardContent>
            </Card>
          </CardContent>
        </Card>

        {/* Method 1: Hosted Badge */}
        <Card className="mb-8 bg-gray-900/80 backdrop-blur-sm">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold mb-4 text-white">✅ Method 1: Hosted Badge (LIVE DEMO)</h2>
            <p className="text-white/90 mb-6">
              This badge loads the logo from weblaunchacademy.com - clients just paste the code!
            </p>

            {/* Live Demo */}
            <div className="bg-gray-800/60 rounded-lg p-8 text-center mb-6">
              <a
                href="https://weblaunchacademy.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block"
              >
                <div className={badgeClass} style={{ backgroundColor: '#0a1840', borderLeftColor: '#ffdb57' }}>
                  <div className="absolute left-[6px] top-1/2 -translate-y-1/2 w-8 h-8">
                    <Image src="/favicon-logo.png" alt="WLA Logo" width={32} height={32} className="rounded-full" />
                  </div>
                  <div className="flex flex-col leading-tight">
                    <span className="text-white text-xs font-semibold font-sans">Built with</span>
                    <span className="text-xs font-bold font-sans" style={{ color: '#ffdb57' }}>Web Launch Academy</span>
                  </div>
                </div>
              </a>
              <p className="text-sm text-white/80 mt-4">☝️ Hover over it to see the glow effect!</p>
            </div>

            {/* Code Block */}
            <h3 className="text-lg font-semibold mb-3 text-white">Code to Give Clients:</h3>
            <div className="bg-gray-800 rounded-lg p-4 overflow-x-auto">
              <pre className="text-sm text-gray-200">
{`<!-- Web Launch Academy Badge -->
<a href="https://weblaunchacademy.com" target="_blank" rel="noopener noreferrer"
   style="display: inline-block; text-decoration: none;">
  <div style="display: inline-flex; align-items: center; background-color: #0a1840;
    height: 40px; padding: 4px 12px 4px 44px; border-radius: 6px; position: relative;
    border-left: 3px solid #ffdb57; transition: box-shadow 0.3s; cursor: pointer;"
    onmouseover="this.style.boxShadow='0 0 25px rgba(255, 219, 87, 0.8)'"
    onmouseout="this.style.boxShadow='none'">
    <div style="position: absolute; left: 6px; top: 50%; transform: translateY(-50%);
      width: 32px; height: 32px;">
      <img src="https://weblaunchacademy.com/favicon-logo.png" alt="WLA Logo"
        width="32" height="32" style="border-radius: 50%; display: block;" />
    </div>
    <div style="display: flex; flex-direction: column; line-height: 1.2; margin-left: 8px;">
      <span style="color: white; font-size: 0.75rem; font-weight: 600;
        font-family: system-ui, -apple-system, sans-serif;">Built with</span>
      <span style="color: #ffdb57; font-size: 0.75rem; font-weight: 700;
        font-family: system-ui, -apple-system, sans-serif;">Web Launch Academy</span>
    </div>
  </div>
</a>`}
              </pre>
            </div>

            <Card className="mt-6 bg-green-50 dark:bg-green-950/20 border-green-500/50">
              <CardContent className="p-4">
                <p className="text-gray-900 dark:text-gray-100">
                  <strong>✅ Pros:</strong> Simple copy-paste, works everywhere, loads logo from your site (always up-to-date)
                </p>
              </CardContent>
            </Card>
          </CardContent>
        </Card>

        {/* Method 2: Self-Hosted */}
        <Card className="mb-8 bg-gray-900/80 backdrop-blur-sm">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold mb-4 text-white">✅ Method 2: Self-Hosted Badge</h2>
            <p className="text-white/90 mb-6">
              Client downloads the logo file and hosts it themselves - fully independent!
            </p>

            <Card className="bg-gray-800/80 backdrop-blur-sm border-accent/50 mb-6">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-white mb-3">Instructions for Clients:</h3>
                <ol className="space-y-2 ml-5 list-decimal text-white">
                  <li>Download <code className="bg-gray-700 px-2 py-1 rounded text-yellow-300">favicon-logo.png</code> from Web Launch Academy</li>
                  <li>Upload it to their website (e.g., <code className="bg-gray-700 px-2 py-1 rounded text-yellow-300">/images/wla-logo.png</code>)</li>
                  <li>Paste the code below, updating the image path</li>
                </ol>
              </CardContent>
            </Card>

            <div className="bg-gray-800 rounded-lg p-4 overflow-x-auto">
              <pre className="text-sm text-gray-200">
{`<!-- Web Launch Academy Badge - Self Hosted -->
<a href="https://weblaunchacademy.com" target="_blank" rel="noopener noreferrer"
   style="display: inline-block; text-decoration: none;">
  <div style="display: inline-flex; align-items: center; background-color: #0a1840;
    height: 40px; padding: 4px 12px 4px 44px; border-radius: 6px; position: relative;
    border-left: 3px solid #ffdb57; transition: box-shadow 0.3s; cursor: pointer;"
    onmouseover="this.style.boxShadow='0 0 25px rgba(255, 219, 87, 0.8)'"
    onmouseout="this.style.boxShadow='none'">
    <div style="position: absolute; left: 6px; top: 50%; transform: translateY(-50%);
      width: 32px; height: 32px;">
      <!-- UPDATE THIS PATH to where they uploaded the logo -->
      <img src="/images/wla-logo.png" alt="WLA Logo"
        width="32" height="32" style="border-radius: 50%; display: block;" />
    </div>
    <div style="display: flex; flex-direction: column; line-height: 1.2; margin-left: 8px;">
      <span style="color: white; font-size: 0.75rem; font-weight: 600;
        font-family: system-ui, -apple-system, sans-serif;">Built with</span>
      <span style="color: #ffdb57; font-size: 0.75rem; font-weight: 700;
        font-family: system-ui, -apple-system, sans-serif;">Web Launch Academy</span>
    </div>
  </div>
</a>`}
              </pre>
            </div>

            <Card className="mt-6 bg-green-50 dark:bg-green-950/20 border-green-500/50">
              <CardContent className="p-4">
                <p className="text-gray-900 dark:text-gray-100">
                  <strong>✅ Pros:</strong> No external dependencies, works offline, client has full control
                </p>
              </CardContent>
            </Card>
          </CardContent>
        </Card>

        {/* Quick Guide */}
        <Card className="bg-gray-900/80 backdrop-blur-sm">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold mb-6 text-white">📋 Quick Guide</h2>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Which Method to Use?</h3>
                <p className="text-white/90 mb-2">
                  <strong>Method 1 (Hosted):</strong> Best for most clients - they just paste code and it works!
                </p>
                <p className="text-white/90">
                  <strong>Method 2 (Self-hosted):</strong> Use if client has concerns about external dependencies or wants full control
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Files to Share with Clients:</h3>
                <ul className="space-y-1 ml-5 list-disc text-white/90">
                  <li><code className="bg-gray-700 px-2 py-1 rounded text-yellow-300">favicon-logo.png</code> - The logo file (if they choose Method 2)</li>
                  <li>The HTML code from Method 1 or Method 2 above</li>
                  <li>Instructions: "Add this to your website footer"</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Back to Home */}
        <div className="text-center mt-12">
          <Button asChild size="lg">
            <Link href="/">← Back to Home</Link>
          </Button>
        </div>
      </div>
      </div>

      <style jsx global>{`
        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 0 3px #ffdb57, 0 0 20px rgba(255, 219, 87, 0.6);
          }
          50% {
            box-shadow: 0 0 0 3px #ffdb57, 0 0 30px rgba(255, 219, 87, 0.9);
          }
        }

        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }

        @keyframes slide-in {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .animate-slide-in {
          animation: slide-in 0.5s ease-out;
        }

        /* Space background animations */
        @keyframes eclipse-slow {
          0%, 100% {
            transform: translate(0, 0) scale(1);
            opacity: 0.3;
          }
          50% {
            transform: translate(100px, -50px) scale(1.1);
            opacity: 0.5;
          }
        }

        .animate-eclipse-slow {
          animation: eclipse-slow 60s ease-in-out infinite;
        }

        @keyframes eclipse-reverse {
          0%, 100% {
            transform: translate(0, 0) scale(1);
            opacity: 0.3;
          }
          50% {
            transform: translate(-80px, 60px) scale(1.15);
            opacity: 0.5;
          }
        }

        .animate-eclipse-reverse {
          animation: eclipse-reverse 50s ease-in-out infinite;
        }

        @keyframes twinkle {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.2);
          }
        }

        .animate-twinkle {
          animation: twinkle 3s ease-in-out infinite;
        }

        @keyframes glimmer {
          0% {
            transform: translateX(-100%);
            opacity: 0;
          }
          50% {
            opacity: 0.3;
          }
          100% {
            transform: translateX(200%);
            opacity: 0;
          }
        }

        .animate-glimmer {
          animation: glimmer 20s linear infinite;
        }

        @keyframes glimmer-reverse {
          0% {
            transform: translateX(100%);
            opacity: 0;
          }
          50% {
            opacity: 0.3;
          }
          100% {
            transform: translateX(-200%);
            opacity: 0;
          }
        }

        .animate-glimmer-reverse {
          animation: glimmer-reverse 25s linear infinite;
        }

        /* Radial gradient support */
        .bg-gradient-radial {
          background-image: radial-gradient(circle, var(--tw-gradient-stops));
        }

        /* Very slow star rotation */
        @keyframes rotate-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .animate-rotate-slow {
          animation: rotate-slow 1200s linear infinite;
          transform-origin: center center;
        }

        /* Constellation laser effect */
        @keyframes laser-pulse {
          0%, 100% {
            opacity: 0.1;
            stroke-width: 0.5;
          }
          50% {
            opacity: 1;
            stroke-width: 1.5;
          }
        }

        .constellation-line {
          animation: laser-pulse 4s ease-in-out infinite;
        }

        /* Constellation star pulse */
        @keyframes pulse-star {
          0%, 100% {
            opacity: 0.6;
            r: 1.2;
          }
          50% {
            opacity: 1;
            r: 1.8;
          }
        }

        .animate-pulse-star {
          animation: pulse-star 3s ease-in-out infinite;
        }

        /* Nebula drift animations */
        @keyframes nebula-drift {
          0%, 100% {
            transform: translate(0, 0) scale(1);
            opacity: 0.2;
          }
          50% {
            transform: translate(50px, -30px) scale(1.1);
            opacity: 0.25;
          }
        }

        .animate-nebula-drift {
          animation: nebula-drift 40s ease-in-out infinite;
        }

        @keyframes nebula-drift-reverse {
          0%, 100% {
            transform: translate(0, 0) scale(1);
            opacity: 0.15;
          }
          50% {
            transform: translate(-40px, 40px) scale(1.15);
            opacity: 0.2;
          }
        }

        .animate-nebula-drift-reverse {
          animation: nebula-drift-reverse 35s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}

export default function BadgeDemoPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-white text-xl">Loading...</div>
      </div>
    }>
      <BadgeDemoContent />
    </Suspense>
  )
}
