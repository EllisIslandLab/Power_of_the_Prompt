"use client"

import { ServicesDisplay } from "@/components/services/ServicesDisplay"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function ServicesHomepage() {
  return (
    <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="text-center mb-16">
          {/* Exclusive Badge */}
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-accent/20 to-primary/20 px-6 py-2 rounded-full border border-accent/30 mb-6">
            <span className="text-lg">🌟</span>
            <span className="font-bold text-sm uppercase tracking-wider text-primary">Professional Web Development Services</span>
            <span className="text-lg">🌟</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
            Choose Your Path:
          </h2>
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="flex items-center justify-center gap-3 text-lg">
              <span>✨</span>
              <span className="font-semibold text-primary">Start Free</span>
              <span className="text-muted-foreground">- Free consultation to explore your options</span>
            </div>
            <div className="flex items-center justify-center gap-3 text-lg">
              <span>🚀</span>
              <span className="font-semibold text-primary">Learn or Build</span>
              <span className="text-muted-foreground">- Master it yourself or have it built for you</span>
            </div>
          </div>
        </div>

        {/* Featured Services - show top 3 from each major category */}
        <div className="space-y-16">
          
          {/* Free Consultation */}
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-center mb-8 flex items-center justify-center gap-2">
              <span>🤔</span>
              <span>Not Sure? Let's Talk First</span>
            </h3>
            <ServicesDisplay category="Free Consultation" maxItems={1} />
          </div>

          {/* Courses */}
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-center mb-8 flex items-center justify-center gap-2">
              <span>🎓</span>
              <span>Learn to Build It Yourself</span>
            </h3>
            <ServicesDisplay category="Courses" maxItems={3} />
          </div>

          {/* Build Services */}
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-center mb-8 flex items-center justify-center gap-2">
              <span>🚀</span>
              <span>Built For You Professionally</span>
            </h3>
            <ServicesDisplay category="Build For Me" maxItems={3} />
          </div>

        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-accent/10 to-primary/10 rounded-2xl p-8 border border-accent/20">
            <h3 className="text-2xl font-bold mb-4">Ready to Launch Your Web Presence?</h3>
            <p className="text-lg text-muted-foreground mb-6">
              Choose your path: learn to build it yourself or have it built for you professionally.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/consultation">
                  Start with Free Consultation
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/services">
                  View All Services
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h4 className="font-semibold mb-2">Proven Results</h4>
            <p className="text-sm text-muted-foreground">
              Hundreds of successful websites delivered with cutting-edge technology
            </p>
          </div>
          
          <div className="text-center">
            <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h4 className="font-semibold mb-2">Fast Delivery</h4>
            <p className="text-sm text-muted-foreground">
              Professional websites completed in 1-2 weeks, courses in 4 weeks
            </p>
          </div>
          
          <div className="text-center">
            <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h4 className="font-semibold mb-2">Own Your Code</h4>
            <p className="text-sm text-muted-foreground">
              No monthly fees or platform lock-in. You own your website completely.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}