"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowRight, Mail, Phone, MapPin } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-muted/30 border-t">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Final CTA Section */}
        <div className="text-center mb-16 py-12 bg-gradient-to-r from-primary/5 to-accent/5 rounded-2xl border border-border">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Ready to Own <span className="text-primary">Your Website?</span>
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
        <h2 className="sr-only">Footer Information</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 mb-8">
          {/* Contact Information */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Get In Touch</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="text-lg">📧</span>
                <a href="mailto:hello@weblaunchacademy.com" className="text-muted-foreground hover:text-primary transition-colors underline decoration-1 underline-offset-2">
                  hello@weblaunchacademy.com
                </a>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-lg">📞</span>
                <a href="tel:+14403549904" className="text-muted-foreground hover:text-primary transition-colors underline decoration-1 underline-offset-2">
                  (440) 354-9904
                </a>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-lg">📍</span>
                <span className="text-muted-foreground">
                  Painesville, Ohio | Available nationwide via video call
                </span>
              </div>
              <div className="flex items-start gap-3 mt-3">
                <span className="text-lg">🕒</span>
                <div className="text-muted-foreground">
                  <strong>Business Hours:</strong><br />
                  Monday - Friday: 9am - 6pm EST
                </div>
              </div>
              {/* Join Mailing List Button */}
              <div className="mt-4">
                <Button asChild variant="outline" size="sm">
                  <a href="/#email-signup">
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Join Mailing List
                  </a>
                </Button>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
            <div className="space-y-2">
              {/* Commented out - no longer available
              <Link href="/#unique-approach" className="block text-muted-foreground hover:text-primary transition-colors underline decoration-1 underline-offset-2">
                Unique Approach
              </Link>
              <Link href="/#site-samples" className="block text-muted-foreground hover:text-primary transition-colors underline decoration-1 underline-offset-2">
                Site Samples
              </Link>
              <Link href="/#build-with-you" className="block text-muted-foreground hover:text-primary transition-colors underline decoration-1 underline-offset-2">
                Learn to Build
              </Link>
              <Link href="/#build-4-you" className="block text-muted-foreground hover:text-primary transition-colors underline decoration-1 underline-offset-2">
                We Build for You
              </Link>
              <Link href="/#site-tlc" className="block text-muted-foreground hover:text-primary transition-colors underline decoration-1 underline-offset-2">
                Site Maintenance
              </Link>
              */}
              <Link href="/#email-signup" className="block text-muted-foreground hover:text-primary transition-colors underline decoration-1 underline-offset-2">
                Consultation Booking
              </Link>
              <Link href="/#website-samples-gallery" className="block text-muted-foreground hover:text-primary transition-colors underline decoration-1 underline-offset-2">
                Website Samples Gallery
              </Link>
              <Link href="/#testimonials" className="block text-muted-foreground hover:text-primary transition-colors underline decoration-1 underline-offset-2">
                Testimonials
              </Link>
            </div>
          </div>

          {/* Business Info */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Web Launch Academy</h3>
            <p className="text-muted-foreground mb-4">
              Learn to build professional websites with Fortune 500 technology. Complete ownership, no monthly fees, modern tech stack.
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-green-500">✓</span>
                <Link href="/guarantee" className="text-muted-foreground hover:text-primary transition-colors underline decoration-1 underline-offset-2">
                  Triple Guarantee Protection
                </Link>
              </div>

              {/* WLA Referral Badge */}
              <div className="pt-2">
                <Link
                  href="/badge-demo"
                  className="inline-block transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,219,87,0.6)]"
                  title="Get up to $250 per referral - Click to learn more"
                >
                  <div className="inline-flex items-center gap-2 rounded-md h-[40px] pl-[44px] pr-3 py-1 relative border-l-[3px]" style={{ backgroundColor: '#0a1840', borderLeftColor: '#ffdb57' }}>
                    {/* Logo */}
                    <div className="absolute left-[6px] top-1/2 -translate-y-1/2 w-8 h-8">
                      <Image
                        src="/favicon-logo.png"
                        alt="WLA Logo"
                        width={32}
                        height={32}
                        className="rounded-full"
                      />
                    </div>
                    {/* Text */}
                    <div className="flex flex-col leading-tight">
                      <span className="text-white text-xs font-semibold font-sans">
                        Built with
                      </span>
                      <span className="text-xs font-bold font-sans" style={{ color: '#ffdb57' }}>
                        Web Launch Academy
                      </span>
                    </div>
                  </div>
                </Link>
              </div>

              {/* YourWebsiteScore Badge */}
              <div className="pt-2">
                <a
                  href="https://yourwebsitescore.com/certified-websites/weblaunchacademy.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-opacity hover:opacity-80 inline-block"
                  title="View our website certification"
                >
                  <Image
                    src="https://yourwebsitescore.com/api/badge/weblaunchacademy.com"
                    alt="YourWebsiteScore Certification Badge"
                    height={40}
                    width={150}
                    className="h-[40px] w-auto"
                  />
                </a>
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
            </div>
            <div className="flex items-center gap-6 text-sm">
              <Link href="/privacy" className="text-muted-foreground hover:text-primary transition-colors underline decoration-1 underline-offset-2">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-muted-foreground hover:text-primary transition-colors underline decoration-1 underline-offset-2">
                Terms of Service
              </Link>
              <Link href="/guarantee" className="text-muted-foreground hover:text-primary transition-colors underline decoration-1 underline-offset-2">
                Guarantee Details
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}