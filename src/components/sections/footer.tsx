"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Mail, Phone, MapPin } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-muted/30 border-t">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        {/* Main CTA Section */}
        <div className="text-center mb-12">
          <div className="bg-card rounded-lg shadow-lg p-8 border max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold mb-4">Ready to Get Started?</h3>
            <p className="text-muted-foreground mb-6">
              Whether you want to learn or have us build it, let's discuss the best option for your business.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/consultation">
                  Get Free Consultation <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/#portfolio">
                  View Website Examples
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Footer Content */}
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Contact Information */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Contact Us</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-primary flex-shrink-0" />
                <a href="mailto:hello@poweroftheprompt.com" className="text-muted-foreground hover:text-primary transition-colors">
                  hello@poweroftheprompt.com
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-primary flex-shrink-0" />
                <a href="tel:+15551234567" className="text-muted-foreground hover:text-primary transition-colors">
                  (555) 123-4567
                </a>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-primary flex-shrink-0 mt-1" />
                <span className="text-muted-foreground">
                  Available nationwide via video call
                </span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Quick Links</h4>
            <div className="space-y-2">
              <Link href="/" className="block text-muted-foreground hover:text-primary transition-colors">
                Home
              </Link>
              <Link href="/pricing" className="block text-muted-foreground hover:text-primary transition-colors">
                Pricing
              </Link>
              <Link href="/#portfolio" className="block text-muted-foreground hover:text-primary transition-colors">
                Portfolio
              </Link>
              <Link href="/consultation" className="block text-muted-foreground hover:text-primary transition-colors">
                Free Consultation
              </Link>
            </div>
          </div>

          {/* Business Info */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Power of the Prompt</h4>
            <p className="text-muted-foreground mb-4">
              Innovative AI-assisted web development training and professional website services.
            </p>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                <strong>Business Hours:</strong><br />
                Monday - Friday: 9am - 6pm EST
              </p>
              <p className="text-sm text-muted-foreground">
                Response time: Within 4 hours
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t pt-8 text-center">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <p className="text-sm text-muted-foreground">
                © 2024 Power of the Prompt. All rights reserved.
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
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}