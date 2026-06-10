'use client'

import { useEffect, useState } from 'react'
import { SpaceHero } from "@/components/sections/space-hero"
import { FleetShowcase } from "@/components/sections/fleet-showcase"
import { SpaceTestimonials } from "@/components/sections/space-testimonials"
import { SpaceDocking } from "@/components/sections/space-docking"
import { SpaceFooter } from "@/components/sections/space-footer"
import { ExpiredLinkModal } from "@/components/modals/ExpiredLinkModal"
import { ScrollProgressBar } from "@/components/scroll-progress-bar"

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
      <ScrollProgressBar />
      <ExpiredLinkModal
        isOpen={showExpiredModal}
        onClose={() => setShowExpiredModal(false)}
      />
      <div className="starfield"></div>
      <div className="nebula-glow" style={{ top: '10%', left: '10%' }}></div>
      <div className="nebula-glow" style={{ bottom: '10%', right: '10%' }}></div>
      <main className="scroll-smooth bg-[#050714] min-h-screen relative">
        {/* Space-themed homepage */}
        <SpaceHero />
        <FleetShowcase />
        <SpaceTestimonials />
        <SpaceDocking />
        <SpaceFooter />
      </main>
    </>
  )
}
