"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"

export function NewHero() {
  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-4xl mx-auto space-y-8">
        {/* Main Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
          Own Your Code,{" "}
          <span className="text-primary">Take Back Control</span>
        </h1>
        
        {/* Subheading */}
        <p className="text-xl sm:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          Learn modern web development in 4 weeks. No monthly fees, no platform dependency, complete ownership forever.
        </p>
        
        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
          <Button 
            asChild 
            size="lg" 
            className="bg-accent hover:bg-accent/90 text-accent-foreground text-lg px-8 py-6 h-auto"
          >
            <Link href="/#build-with-you">Start Learning</Link>
          </Button>
          
          <Button 
            variant="outline" 
            size="lg"
            onClick={() => scrollToSection('site-samples')}
            className="text-lg px-8 py-6 h-auto"
          >
            View Sample Sites
          </Button>
        </div>
        
        {/* Trust Indicators */}
        <div className="pt-12 border-t border-border/50 mt-16">
          <p className="text-sm text-muted-foreground mb-4">Trusted by professionals who demand ownership</p>
          <div className="flex justify-center items-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              No Monthly Fees
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              Complete Ownership
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              Modern Tech Stack
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}