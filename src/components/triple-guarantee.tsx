"use client"

import { Shield, Clock, DollarSign } from "lucide-react"

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
            Fully-Functional Site in 4 Weeks
          </h4>
          <p className="text-sm text-muted-foreground">
            You will own a complete, hosted website that is live on the internet with working contact forms, responsive design, and professional functionality within 4 weeks of starting our Build With You course.
          </p>
        </div>
        
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
            <Shield className="h-8 w-8 text-blue-600" />
          </div>
          <h4 className="font-semibold text-foreground">
            Free Audits & Support for 1 Year
          </h4>
          <p className="text-sm text-muted-foreground">
            We will provide free website audits and technical support for one full year after your site goes live to help you achieve optimal performance and functionality.
          </p>
        </div>
        
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
            <DollarSign className="h-8 w-8 text-purple-600" />
          </div>
          <h4 className="font-semibold text-foreground">
            We'll Buy Your Site After 1 Year
          </h4>
          <p className="text-sm text-muted-foreground">
            If you're not completely satisfied with your website after one year of ownership, we will purchase it from you for the price you paid to build it using our methods.
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
      
      <div className="mt-4 text-center">
        <p className="text-xs text-muted-foreground">
          *Guarantees apply only to Build With You course participants. Terms and conditions apply.
        </p>
      </div>
    </div>
  )
}