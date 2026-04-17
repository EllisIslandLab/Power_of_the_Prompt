'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { ComingSoonBanner } from "@/components/sections/coming-soon-banner"
import { Footer } from "@/components/sections/footer"
import { ExpiredLinkModal } from "@/components/modals/ExpiredLinkModal"

// Lazy load components below the fold for better performance
const SiteSamples = dynamic(() => import("@/components/sections/site-samples").then(mod => ({ default: mod.SiteSamples })), {
  loading: () => (
    <div className="py-24 bg-muted/30" style={{ minHeight: '700px' }} aria-label="Loading content">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-pulse">
          <div className="h-12 bg-muted rounded w-2/3 mx-auto mb-6"></div>
          <div className="h-6 bg-muted rounded w-1/2 mx-auto"></div>
        </div>
        <div className="h-96 bg-muted/50 rounded-lg flex items-center justify-center">
          <p className="text-muted-foreground">Loading gallery...</p>
        </div>
      </div>
    </div>
  ),
  ssr: false
})
const Testimonials = dynamic(() => import("@/components/sections/testimonials").then(mod => ({ default: mod.Testimonials })), {
  loading: () => (
    <div className="py-16" style={{ minHeight: '400px' }}>
      <div className="max-w-6xl mx-auto px-4 animate-pulse">
        <div className="h-8 bg-muted rounded w-1/3 mx-auto mb-8"></div>
        <div className="grid md:grid-cols-3 gap-6">
          {[1,2,3].map(i => (
            <div key={i} className="h-48 bg-muted rounded-lg"></div>
          ))}
        </div>
      </div>
    </div>
  ),
  ssr: false
})
const ScrollProgress = dynamic(() => import("@/components/scroll-progress").then(mod => ({ default: mod.ScrollProgress })), {
  ssr: false
})

// Commented out sections for coming soon page
// import { NewHero } from "@/components/sections/new-hero"
// import { ResponsiveComparison } from "@/components/sections/responsive-comparison"
// import { BuildWithYou } from "@/components/sections/build-with-you"
// import { Build4You } from "@/components/sections/build-4-you"
// import { SiteTLC } from "@/components/sections/site-tlc"
// import { TestAudit } from "@/components/sections/test-audit"

export default function Home() {
  const [showExpiredModal, setShowExpiredModal] = useState(false)

  useEffect(() => {
    // Check for expired verification link in URL hash
    const checkForExpiredLink = () => {
      const hash = window.location.hash

      if (hash.includes('error=access_denied') && hash.includes('error_code=otp_expired')) {
        // console.log('🔍 Detected expired verification link') // Commented out for auth transition
        setShowExpiredModal(true)

        // Clean the URL hash
        window.history.replaceState({}, document.title, window.location.pathname)
      }
    }

    // Check immediately
    checkForExpiredLink()

    // Also check when hash changes (in case user navigates)
    window.addEventListener('hashchange', checkForExpiredLink)

    return () => {
      window.removeEventListener('hashchange', checkForExpiredLink)
    }
  }, [])

  return (
    <>
      <ScrollProgress />
      <ExpiredLinkModal
        isOpen={showExpiredModal}
        onClose={() => setShowExpiredModal(false)}
      />
      <main className="scroll-smooth">
        {/* Coming Soon Page - Simplified Version */}
        <div id="coming-soon">
          <ComingSoonBanner />
        </div>
        <div id="site-samples">
          <SiteSamples />
        </div>
        <div id="testimonials">
          <Testimonials />
        </div>
        <Footer />

        {/* Commented out sections for coming soon page */}
        {/*
        <div id="new-hero">
          <NewHero />
        </div>
        <div id="unique-approach">
          <ResponsiveComparison />
        </div>
        <div id="build-with-you">
          <BuildWithYou />
        </div>
        <div id="build-4-you">
          <Build4You />
        </div>
        <div id="site-tlc">
          <SiteTLC />
        </div>
        <div id="test-audit">
          <TestAudit />
        </div>
        */}
      </main>
    </>
  )
}
