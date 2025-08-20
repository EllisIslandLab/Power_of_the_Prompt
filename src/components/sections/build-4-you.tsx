"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"

export function Build4You() {
  return (
    <section id="build-4-you" className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Or We Can Build It <span className="text-primary">For You</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Need a professional website fast? Let our team build your complete website using modern, professional web technologies.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-2xl font-semibold text-foreground">
                Professional Development Service
              </h3>
              <p className="text-muted-foreground">
                Our expert team will create a custom website tailored to your business needs, built with modern, professional web technologies.
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <span className="text-green-500 text-xl">✓</span>
                <div>
                  <h4 className="font-medium text-foreground">Fast Delivery</h4>
                  <p className="text-sm text-muted-foreground">2-4 week turnaround</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-green-500 text-xl">✓</span>
                <div>
                  <h4 className="font-medium text-foreground">Full Ownership</h4>
                  <p className="text-sm text-muted-foreground">Complete source code</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-green-500 text-xl">✓</span>
                <div>
                  <h4 className="font-medium text-foreground">Modern Tech</h4>
                  <p className="text-sm text-muted-foreground">React, Next.js, TypeScript</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-green-500 text-xl">✓</span>
                <div>
                  <h4 className="font-medium text-foreground">No Monthly Fees</h4>
                  <p className="text-sm text-muted-foreground">One-time payment</p>
                </div>
              </div>
            </div>
            
            <div className="pt-6">
              <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                <Link href="/website-building">Get Your Website Built</Link>
              </Button>
            </div>
          </div>
          
          <div className="relative">
            <div className="bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl p-8 border border-border">
              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary mb-2">Starting at $2,997</div>
                  <p className="text-muted-foreground">Complete website development</p>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-foreground">Custom Design</span>
                    <span className="text-green-500">✓</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-foreground">Responsive Mobile</span>
                    <span className="text-green-500">✓</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-foreground">SEO Optimized</span>
                    <span className="text-green-500">✓</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-foreground">Performance Optimized</span>
                    <span className="text-green-500">✓</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-foreground">Full Source Code</span>
                    <span className="text-green-500">✓</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-foreground">90 Days Support</span>
                    <span className="text-green-500">✓</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}