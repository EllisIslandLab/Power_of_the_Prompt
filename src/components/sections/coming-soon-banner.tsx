'use client'

import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Sparkles, ArrowRight, CheckCircle2 } from "lucide-react"

export function ComingSoonBanner() {

  return (
    <section id="email-signup" className="py-24 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10">
      <div className="container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            Build Once,
            <span className="block text-primary">Own Forever</span>
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Build a startup website where you own the code - no hosting fees, no hidden costs, just pure creativity.
          </p>

          {/* Demo CTA Section */}
          <Card className="max-w-2xl mx-auto mb-8 border-2 border-primary/20 shadow-lg">
            <CardContent className="p-8">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Sparkles className="h-6 w-6 text-primary animate-pulse" />
                <h2 className="font-bold text-2xl">Create Your Free Website Preview</h2>
                <Sparkles className="h-6 w-6 text-primary animate-pulse" />
              </div>

              <p className="text-lg text-muted-foreground mb-6 max-w-xl mx-auto">
                See your website come to life in minutes. No credit card required, no commitment - just a beautiful preview of what your business website could look like.
              </p>

              {/* Feature highlights */}
              <div className="grid md:grid-cols-3 gap-4 mb-8 text-left">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-sm">100% Free Demo</p>
                    <p className="text-xs text-muted-foreground">No payment needed</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-sm">Ready in Minutes</p>
                    <p className="text-xs text-muted-foreground">Fast & easy setup</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-sm">Professional Design</p>
                    <p className="text-xs text-muted-foreground">Customized for you</p>
                  </div>
                </div>
              </div>

              {/* CTA Button */}
              <Link href="/get-started">
                <Button
                  size="lg"
                  className="w-full md:w-auto text-lg px-8 py-6 font-semibold group relative overflow-hidden"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Get Your Free Website Preview
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                </Button>
              </Link>

              <p className="text-xs text-muted-foreground mt-4">
                ✨ Takes less than 5 minutes • No technical skills required
              </p>
            </CardContent>
          </Card>

          <h2 className="text-2xl font-semibold text-center mb-8">Why Web Launch Academy?</h2>

          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-3xl mb-2">🚀</div>
              <h3 className="font-semibold text-lg mb-1">Built for Speed</h3>
              <p className="text-sm text-muted-foreground">Lightning fast websites that convert</p>
            </div>
            <div>
              <div className="text-3xl mb-2">⚡</div>
              <h3 className="font-semibold text-lg mb-1">AI-Powered</h3>
              <p className="text-sm text-muted-foreground">Smart development with Claude Code</p>
            </div>
            <div>
              <div className="text-3xl mb-2">💎</div>
              <h3 className="font-semibold text-lg mb-1">Own Forever</h3>
              <p className="text-sm text-muted-foreground">No startup subscription fees, complete ownership</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}