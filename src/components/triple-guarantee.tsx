"use client"

import { Shield, Clock, DollarSign, Gauge } from "lucide-react"
import Link from "next/link"

export function TripleGuarantee() {
  return (
    <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 rounded-2xl p-8">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-foreground mb-2">
          Our Triple Guarantee
        </h3>
        <p className="text-muted-foreground">
          We stand behind our training with these concrete commitments
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <Clock className="h-8 w-8 text-green-600" />
          </div>
          <h4 className="font-semibold text-foreground">
            Fully-Functional Site
          </h4>
          <p className="text-sm text-muted-foreground">
            You will have a hosted website that is live and interactive on the internet with at least one contact form for client data capture and responsive design within 2 weeks after completing the 8-week course program.
          </p>
        </div>

        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
            <Gauge className="h-8 w-8 text-blue-600" />
          </div>
          <h4 className="font-semibold text-foreground">
            90+ Lighthouse Scores
          </h4>
          <p className="text-sm text-muted-foreground">
            Your website will achieve a minimum score of 90 or higher on Google Lighthouse metrics for Performance, Accessibility, Best Practices, and SEO, ensuring your site meets industry-leading standards.
          </p>
        </div>

        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
            <Shield className="h-8 w-8 text-purple-600" />
          </div>
          <h4 className="font-semibold text-foreground">
            1 Full Year of Basic Support
          </h4>
          <p className="text-sm text-muted-foreground">
            Web Launch Academy provides 1 full year of basic support including SEO, Best Practices, Performance, and Accessibility testing and consultation via email after your site goes live.
          </p>
        </div>
      </div>
      
      <div className="mt-8 p-4 bg-white rounded-lg border border-gray-200">
        <h5 className="font-semibold text-foreground mb-2">What "Fully-Functional" Means:</h5>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Hosted and accessible on the internet with your custom domain</li>
          <li>• Responsive design that works on all devices and screen sizes</li>
          <li>• Working contact forms with email delivery</li>
          <li>• Professional design with your branding and content</li>
          <li>• Fast loading speeds and SEO optimization</li>
          <li>• SSL certificate and security measures in place</li>
          <li>• Content management capabilities for updates</li>
          <li>• Compatible with modern web browsers</li>
        </ul>
      </div>

      <div className="mt-6 bg-gradient-to-br from-accent/10 to-primary/10 border-2 border-accent rounded-xl p-6">
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center">
            <DollarSign className="h-7 w-7 text-accent" />
          </div>
          <h4 className="text-2xl font-bold text-foreground">
            Money Back Guarantee
          </h4>
        </div>
        <p className="text-center text-foreground/80 leading-relaxed">
          If Web Launch Academy cannot deliver on all three guarantees above, you will receive a <strong>full refund</strong> of your course fee. We are committed to your success, and we stand behind our ability to help you build a professional, high-performing website.
        </p>
      </div>

      <div className="mt-4 text-center">
        <p className="text-sm text-muted-foreground mb-2">
          *Guarantees apply to course participants who follow all recommended guidance.{' '}
          <Link href="/guarantee" className="text-primary hover:text-primary/80 underline font-medium">
            View full guarantee details and terms
          </Link>
        </p>
      </div>
    </div>
  )
}