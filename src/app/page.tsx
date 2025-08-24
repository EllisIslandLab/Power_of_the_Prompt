'use client'

import { useEffect, useState } from 'react'
import { NewHero } from "@/components/sections/new-hero"
import { SiteSamples } from "@/components/sections/site-samples"
import { ResponsiveComparison } from "@/components/sections/responsive-comparison"
import { BuildWithYou } from "@/components/sections/build-with-you"
import { Build4You } from "@/components/sections/build-4-you"
import { SiteTLC } from "@/components/sections/site-tlc"
import { TestAudit } from "@/components/sections/test-audit"
import { Footer } from "@/components/sections/footer"
import { ScrollProgress } from "@/components/scroll-progress"
import { ExpiredLinkModal } from "@/components/modals/ExpiredLinkModal"

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
        <div id="new-hero">
          <NewHero />
        </div>
        <div id="unique-approach">
          <ResponsiveComparison />
        </div>
        <div id="site-samples">
          <SiteSamples />
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
        <Footer />
      </main>
    </>
  )
}
