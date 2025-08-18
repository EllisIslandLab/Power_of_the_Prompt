"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Check, X } from "lucide-react"

export function ResponsiveComparison() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  const comparisonData = [
    {
      feature: "Monthly Fees",
      platforms: "$16-159/month*",
      agencies: "$1,500-10,000+/month*", 
      webLaunch: "$0 after training",
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
      feature: "Performance Focus",
      platforms: "Variable performance**",
      agencies: "Depends on implementation",
      webLaunch: "Optimized for speed",
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
    <div className="hidden lg:block bg-background border border-border rounded-2xl overflow-hidden mb-16">
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
        <div className="p-4 text-center border-l-2 border-primary/20 bg-primary/5">
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
          <div className="p-4 text-center border-l-2 border-primary/20 bg-primary/5">
            <div className="flex items-center justify-center gap-2 text-green-600">
              <Check className="h-4 w-4" />
              <span className="font-medium text-sm">{comparison.webLaunch}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )

  // Mobile Version - Condensed with Icons matching your design
  const MobileTable = () => (
    <div className="lg:hidden mb-16 space-y-6">
      {comparisonData.map((comparison, index) => (
        <div key={index} className={`bg-background border border-border rounded-xl overflow-hidden ${comparison.highlight ? 'ring-2 ring-primary/20' : ''}`}>
          <div className="bg-muted/50 p-4">
            <h3 className="font-semibold text-foreground text-lg">{comparison.feature}</h3>
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
            
            <div className="border-l-4 border-primary pl-4 bg-primary/5 -m-4 p-4">
              <div className="font-medium text-sm text-primary mb-1">Our Method</div>
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

  const performanceMetrics = [
    { label: "Page Load Speed", platform: "Variable*", agency: "Variable*", us: "Optimized", color: "bg-green-500" },
    { label: "SEO Foundation", platform: "Basic*", agency: "Variable*", us: "Built-in", color: "bg-blue-500" },
    { label: "Mobile Performance", platform: "Template-based*", agency: "Custom*", us: "Responsive design", color: "bg-purple-500" }
  ]

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
        
        {/* Performance Comparison */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-foreground text-center mb-8">
            Performance Comparison
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            {performanceMetrics.map((metric, index) => (
              <div key={index} className="bg-background border border-border rounded-xl p-6">
                <h4 className="font-semibold text-foreground mb-4">{metric.label}</h4>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Platform Builders</span>
                    <span className="text-sm font-medium text-red-600">{metric.platform}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-red-500 h-2 rounded-full" style={{width: '30%'}}></div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Agencies</span>
                    <span className="text-sm font-medium text-orange-600">{metric.agency}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-orange-500 h-2 rounded-full" style={{width: '60%'}}></div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground font-medium">Our Method</span>
                    <span className="text-sm font-bold text-green-600">{metric.us}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className={`${metric.color} h-2 rounded-full`} style={{width: '95%'}}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Cost Over Time Comparison */}
        <div className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-2xl border border-border p-8 mb-8">
          <h3 className="text-2xl font-bold text-foreground text-center mb-8">
            5-Year Cost Comparison
          </h3>
          
          <div className="grid sm:grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center bg-background border border-border rounded-xl p-6">
              <div className="text-lg font-semibold text-foreground mb-2">Squarespace/Wix</div>
              <div className="text-2xl sm:text-3xl font-bold text-orange-600 mb-2">$1,080-$3,540</div>
              <div className="text-sm text-muted-foreground">Per year in subscription fees alone</div>
              <div className="text-xs text-muted-foreground mt-2">*Plus transaction fees and limitations</div>
            </div>
            
            <div className="text-center bg-background border border-border rounded-xl p-6">
              <div className="text-lg font-semibold text-foreground mb-2">WordPress Agencies</div>
              <div className="text-2xl sm:text-3xl font-bold text-orange-600 mb-2">$5,000-$15,000+</div>
              <div className="text-sm text-muted-foreground">Initial build + ongoing maintenance</div>
              <div className="text-xs text-muted-foreground mt-2">*Plus hosting and update dependencies</div>
            </div>
            
            <div className="text-center border-2 border-primary rounded-xl p-6 bg-primary/5">
              <div className="text-lg font-semibold text-primary mb-2">Our Method</div>
              <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-2">$497</div>
              <div className="text-sm text-muted-foreground">One-time training cost</div>
              <div className="text-xs text-green-600 mt-2">+ Complete ownership</div>
            </div>
          </div>
        </div>
        
        <div className="text-center">
          <Button 
            size="lg" 
            onClick={() => document.getElementById('test-audit')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            See The Difference in Your Site
          </Button>
          
          <div className="mt-8 text-xs text-muted-foreground max-w-2xl mx-auto">
            <p>*Pricing sources: Website Builder Expert, Tech.co, Whatagraph Agency Research (2025). **Performance data: Cybernews testing, Next.js vs WordPress studies (2025). Individual results may vary based on plan selection, add-ons, and usage. Performance metrics depend on site content, configuration, and hosting environment.</p>
          </div>
        </div>
      </div>
    </section>
  )
}