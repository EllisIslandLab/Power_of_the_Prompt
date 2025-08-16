import { Shield, Clock, DollarSign } from "lucide-react"

export default function GuaranteeDetails() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-16">
      <h1 className="text-3xl font-bold text-foreground mb-8 text-center">
        Our Triple Guarantee
      </h1>
      
      <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 rounded-2xl p-8 mb-8">
        <p className="text-center text-muted-foreground mb-8">
          We stand behind our training with these concrete commitments
        </p>
        
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <Clock className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="font-semibold text-foreground">
              Fully-Functional Site in 4 Weeks
            </h3>
            <p className="text-sm text-muted-foreground">
              You will own a complete, hosted website that is live on the internet with working contact forms, responsive design, and professional functionality within 4 weeks of starting our Build With You course.
            </p>
          </div>
          
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="font-semibold text-foreground">
              Free Audits & Support for 1 Year
            </h3>
            <p className="text-sm text-muted-foreground">
              We will provide free website audits and technical support for one full year after your site goes live to help you achieve optimal performance and functionality.
            </p>
          </div>
          
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
              <DollarSign className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="font-semibold text-foreground">
              We'll Buy Your Site After 1 Year
            </h3>
            <p className="text-sm text-muted-foreground">
              If you're not completely satisfied with your website after one year of ownership, we will purchase it from you at fair market value.
            </p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h4 className="font-semibold text-foreground mb-4">What "Fully-Functional" Means:</h4>
          <ul className="text-sm text-muted-foreground space-y-2">
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
      </div>

      <div className="space-y-6">
        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">Terms and Conditions</h2>
          <div className="space-y-4 text-muted-foreground">
            <p>
              <strong>Eligibility:</strong> Guarantees apply only to Build With You course participants who complete the full program requirements.
            </p>
            <p>
              <strong>Timeline:</strong> The 4-week guarantee begins from your official course start date, not registration date.
            </p>
            <p>
              <strong>Site Purchase Guarantee:</strong> Fair market value determined by independent third-party website valuation service.
            </p>
            <p>
              <strong>Support Scope:</strong> One-year support covers technical issues, performance optimization, and functionality questions. Does not include content creation or design changes.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">How to Claim</h2>
          <p className="text-muted-foreground">
            To invoke any guarantee, contact us at hello@poweroftheprompt.com with your course enrollment details and specific concern. We will respond within 24 hours to begin the resolution process.
          </p>
        </section>
      </div>
    </div>
  )
}