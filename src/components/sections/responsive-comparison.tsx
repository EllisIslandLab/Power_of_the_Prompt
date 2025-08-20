"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Check, X } from "lucide-react"

export function ResponsiveComparison() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768) // Match md: breakpoint for better mobile experience
    }

    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  const comparisonData = [
    {
      feature: "Annual Fees",
      platforms: "$192-1,908/year*",
      agencies: "$18,000-120,000+/year*", 
      webLaunch: "$0 after training (upfront cost)*",
      platformsIcon: "💰",
      agenciesIcon: "💰💰💰",
      webLaunchIcon: "✅",
      highlight: true
    },
    {
      feature: "Code Ownership",
      platforms: "Platform-hosted solution",
      agencies: "Agency-managed solution",
      webLaunch: "Complete source code access",
      platformsIcon: "❌",
      agenciesIcon: "❌", 
      webLaunchIcon: "✅",
      highlight: true
    },
    {
      feature: "Technology Stack",
      platforms: "Proprietary platforms (limited flexibility)",
      agencies: "Often WordPress or legacy systems",
      webLaunch: "Uncompromising tech stack (used by Fortune 500 companies)",
      platformsIcon: "⚠️",
      agenciesIcon: "⚠️",
      webLaunchIcon: "✅",
      highlight: true
    },
    {
      feature: "Performance",
      platforms: "3-7 sec load times**",
      agencies: "3-6 sec load times**",
      webLaunch: "< 3 sec Guaranteed**",
      platformsIcon: "⚠️",
      agenciesIcon: "⚠️",
      webLaunchIcon: "✅",
      highlight: false
    },
    {
      feature: "Customization",
      platforms: "Limited templates",
      agencies: "Custom but locked-in",
      webLaunch: "Unlimited flexibility",
      platformsIcon: "⚠️",
      agenciesIcon: "⚠️",
      webLaunchIcon: "✅",
      highlight: false
    },
    {
      feature: "Learning",
      platforms: "No education provided",
      agencies: "No knowledge transfer",
      webLaunch: "Full training included",
      platformsIcon: "❌",
      agenciesIcon: "❌",
      webLaunchIcon: "✅",
      highlight: false
    },
    {
      feature: "Support",
      platforms: "Basic ticket system",
      agencies: "Ongoing dependency",
      webLaunch: "Learn to be independent",
      platformsIcon: "🎫",
      agenciesIcon: "🔄",
      webLaunchIcon: "🎓",
      highlight: false
    },
    {
      feature: "Portability",
      platforms: "Platform-dependent",
      agencies: "May require recreation",
      webLaunch: "Fully portable codebase",
      platformsIcon: "❌",
      agenciesIcon: "⚠️",
      webLaunchIcon: "✅",
      highlight: false
    }
  ]

  // Desktop Version - matching your current styling
  const DesktopTable = () => (
    <div className="hidden md:block bg-background border border-border rounded-2xl overflow-hidden mb-16">
      <div className="grid grid-cols-4 bg-muted/50">
        <div className="p-4 text-sm font-medium text-muted-foreground"></div>
        <div className="p-4 text-center">
          <div className="text-lg font-semibold text-foreground">DIY Platform Builders</div>
          <div className="text-sm text-muted-foreground">Squarespace, Wix, and similar</div>
        </div>
        <div className="p-4 text-center">
          <div className="text-lg font-semibold text-foreground">Traditional Agencies</div>
          <div className="text-sm text-muted-foreground">WordPress developers and similar</div>
        </div>
        <div className="p-4 text-center relative">
          <div className="absolute top-2 right-2">
            <span className="bg-primary text-primary-foreground rounded-full w-4 h-4 flex items-center justify-center text-xs font-bold">★</span>
          </div>
          <div className="text-lg font-semibold text-primary">Our Method</div>
          <div className="text-sm text-primary/80">Web Launch Academy</div>
        </div>
      </div>
      
      {comparisonData.map((comparison, index) => (
        <div key={index} className={`grid grid-cols-4 border-t border-border ${comparison.highlight ? 'bg-primary/5' : ''}`}>
          <div className="p-4 font-medium text-foreground border-r border-border">
            {comparison.feature}
          </div>
          <div className="p-4 text-center text-muted-foreground">
            {comparison.highlight ? (
              <div className="flex items-center justify-center gap-2 text-orange-600">
                <span className="text-sm">{comparison.platforms}</span>
              </div>
            ) : (
              <span className="text-sm">{comparison.platforms}</span>
            )}
          </div>
          <div className="p-4 text-center text-muted-foreground">
            {comparison.highlight ? (
              <div className="flex items-center justify-center gap-2 text-orange-600">
                <span className="text-sm">{comparison.agencies}</span>
              </div>
            ) : (
              <span className="text-sm">{comparison.agencies}</span>
            )}
          </div>
          <div className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 text-green-600">
              <Check className="h-4 w-4 flex-shrink-0" />
              <span className="font-semibold text-sm">{comparison.webLaunch}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )

  // Mobile Version - Condensed with Icons matching your design
  const MobileTable = () => (
    <div className="md:hidden mb-16 space-y-6">
      {comparisonData.map((comparison, index) => (
        <div key={index} className={`bg-background border border-border rounded-xl overflow-hidden shadow-sm ${comparison.highlight ? 'ring-2 ring-primary/30 shadow-lg' : ''}`}>
          <div className={`p-4 ${comparison.highlight ? 'bg-gradient-to-r from-primary/10 to-primary/5' : 'bg-muted/50'}`}>
            <h3 className={`font-semibold text-lg ${comparison.highlight ? 'text-primary' : 'text-foreground'}`}>
              {comparison.highlight && (
                <span className="inline-flex items-center gap-2 mr-2">
                  <span className="bg-primary text-primary-foreground rounded-full w-4 h-4 flex items-center justify-center text-xs font-bold">★</span>
                </span>
              )}
              {comparison.feature}
            </h3>
          </div>
          
          <div className="space-y-4 p-4">
            <div className="border-l-4 border-orange-200 pl-4">
              <div className="font-medium text-sm text-muted-foreground mb-1">DIY Platform Builders</div>
              <div className="flex items-center gap-2">
                <span className="text-lg">{comparison.platformsIcon}</span>
                <div className="text-sm text-orange-600">{comparison.platforms}</div>
              </div>
            </div>
            
            <div className="border-l-4 border-orange-200 pl-4">
              <div className="font-medium text-sm text-muted-foreground mb-1">Traditional Agencies</div>
              <div className="flex items-center gap-2">
                <span className="text-lg">{comparison.agenciesIcon}</span>
                <div className="text-sm text-orange-600">{comparison.agencies}</div>
              </div>
            </div>
            
            <div className="border-l-4 border-primary pl-4 bg-gradient-to-r from-primary/10 to-primary/5 -m-4 p-4 rounded-r-lg">
              <div className="font-semibold text-sm text-primary mb-1 flex items-center gap-2">
                <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">★</span>
                Our Method
              </div>
              <div className="flex items-center gap-2 text-green-600">
                <span className="text-lg">{comparison.webLaunchIcon}</span>
                <Check className="h-4 w-4" />
                <span className="font-medium text-sm">{comparison.webLaunch}</span>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Mobile Legend */}
      <div className="mt-8 p-4 bg-muted/30 border border-border rounded-xl">
        <h4 className="text-sm font-semibold text-foreground mb-3">Legend:</h4>
        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <span>✅</span>
            <span>Included/Excellent</span>
          </div>
          <div className="flex items-center gap-1">
            <span>❌</span>
            <span>Not Available</span>
          </div>
          <div className="flex items-center gap-1">
            <span>⚠️</span>
            <span>Limited/Variable</span>
          </div>
          <div className="flex items-center gap-1">
            <span>💰</span>
            <span>Cost Level</span>
          </div>
        </div>
      </div>
    </div>
  )


  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="max-w-6xl mx-auto w-full">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Why Our Method Is <span className="text-primary">Different</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Compare our approach with traditional website building methods. See the difference in ownership, technology, and long-term value.
          </p>
        </div>
        
        {/* Render appropriate version based on screen size */}
        <DesktopTable />
        <MobileTable />
        
        
        
        <div className="text-center">
          <Button 
            size="lg" 
            onClick={() => document.getElementById('test-audit')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            See The Difference in Your Site
          </Button>
          
          <div className="mt-8 text-xs text-muted-foreground max-w-2xl mx-auto">
            <p>*Pricing sources: Website Builder Expert, Tech.co, Whatagraph Agency Research (2025). **Performance data: Digital Polygon testing (WordPress mobile 51% vs Next.js 86%), real Squarespace site analysis (756 sites), Wix user performance studies, WordPress optimization research (2025). Platform load times: Wix 4-8 sec typical, Squarespace 3-7 sec typical. Agency load times: WordPress 3-6 sec typical. Individual results may vary based on plan selection, add-ons, and usage. Performance metrics depend on site content, configuration, and hosting environment.</p>
          </div>
        </div>
      </div>
    </section>
  )
}