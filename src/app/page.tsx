'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { ComingSoonBanner } from "@/components/sections/coming-soon-banner"
import { Footer } from "@/components/sections/footer"
import { ExpiredLinkModal } from "@/components/modals/ExpiredLinkModal"

// Lazy load components below the fold for better performance
const SiteSamples = dynamic(() => import("@/components/sections/site-samples").then(mod => ({ default: mod.SiteSamples })), {
  loading: () => <div className="min-h-screen flex items-center justify-center text-muted-foreground" aria-label="Loading content">Loading...</div>,
  ssr: false
})
const Testimonials = dynamic(() => import("@/components/sections/testimonials").then(mod => ({ default: mod.Testimonials })), {
  loading: () => <div className="min-h-64 flex items-center justify-center text-muted-foreground" aria-label="Loading testimonials">Loading testimonials...</div>,
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
