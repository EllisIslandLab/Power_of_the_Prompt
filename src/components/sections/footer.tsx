"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Mail, Phone, MapPin } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-muted/30 border-t">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Final CTA Section */}
        <div className="text-center mb-16 py-12 bg-gradient-to-r from-primary/5 to-accent/5 rounded-2xl border border-border">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Ready to Own Your <span className="text-primary">Website?</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Stop paying monthly fees for limited control. Build a professional website with modern web technologies that you actually own.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground text-lg px-8 py-6 h-auto">
              <Link href="/#build-with-you">Start Learning & Building</Link>
            </Button>
          </div>
        </div>

        {/* Footer Content */}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 mb-8">
          {/* Contact Information */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Get In Touch</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-primary flex-shrink-0" />
                <a href="/#email-signup" className="text-muted-foreground hover:text-primary transition-colors">
                  Join our email list for contact info
                </a>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-primary flex-shrink-0 mt-1" />
                <span className="text-muted-foreground">
                  Painesville Ohio, 44077<br />
                  Available nationwide via video call
                </span>
              </div>
              <div className="mt-4">
                <Button asChild variant="outline" size="sm" className="w-full">
                  <a href="/#email-signup">
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Get Contact Details
                  </a>
                </Button>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Quick Links</h4>
            <div className="space-y-2">
              <Link href="/#unique-approach" className="block text-muted-foreground hover:text-primary transition-colors">
                Unique Approach
              </Link>
              <Link href="/#site-samples" className="block text-muted-foreground hover:text-primary transition-colors">
                Site Samples
              </Link>
              <Link href="/#build-with-you" className="block text-muted-foreground hover:text-primary transition-colors">
                Learn to Build
              </Link>
              <Link href="/#build-4-you" className="block text-muted-foreground hover:text-primary transition-colors">
                We Build for You
              </Link>
              <Link href="/#site-tlc" className="block text-muted-foreground hover:text-primary transition-colors">
                Site Maintenance
              </Link>
            </div>
          </div>

          {/* Business Info */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Web Launch Academy</h4>
            <p className="text-muted-foreground mb-4">
              Learn to build professional websites with Fortune 500 technology. Complete ownership, no monthly fees, modern tech stack.
            </p>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                <strong>Business Hours:</strong><br />
                Monday - Friday: 9am - 6pm EST
              </p>
              <p className="text-sm text-muted-foreground">
                <a href="/#email-signup" className="text-primary hover:text-primary/80 underline">Join our list</a> for consultation booking
              </p>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-green-500">✓</span>
                <span className="text-muted-foreground">Triple Guarantee Protection</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t pt-8 text-center">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <p className="text-sm text-muted-foreground">
                © 2024 Web Launch Academy. All rights reserved.
              </p>
              <p className="text-xs text-muted-foreground">
                Color schemes by{" "}
                <a 
                  href="https://coolors.co/?ref=688948e359bf39000b530ddc" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Coolors.co
                </a>
              </p>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <Link href="/privacy" className="text-muted-foreground hover:text-primary transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-muted-foreground hover:text-primary transition-colors">
                Terms of Service
              </Link>
              <Link href="/guarantee" className="text-muted-foreground hover:text-primary transition-colors">
                Guarantee Details
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}