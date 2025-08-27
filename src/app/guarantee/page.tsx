import { Shield, Clock, DollarSign } from "lucide-react"

export default function GuaranteeDetails() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-16">
      <h1 className="text-3xl font-bold text-foreground mb-8 text-center">
        Our Triple Guarantee
      </h1>
      
      <div className="bg-background border border-border rounded-2xl p-8 mb-8 shadow-lg">
        <p className="text-center text-foreground/80 mb-8 text-lg">
          We stand behind our training with these concrete commitments
        </p>
        
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div className="bg-card border border-border rounded-xl p-6 text-center space-y-4 hover:shadow-md transition-shadow">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Clock className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-bold text-foreground text-lg">
              Fully-Functional Site in 4 Weeks
            </h3>
            <p className="text-foreground/70 leading-relaxed">
              You will own a complete, hosted website that is live on the internet with working contact forms, responsive design, and professional functionality within 4 weeks of starting our Build With You course.
            </p>
          </div>
          
          <div className="bg-card border border-border rounded-xl p-6 text-center space-y-4 hover:shadow-md transition-shadow">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-bold text-foreground text-lg">
              Free Audits & Support for 1 Year
            </h3>
            <p className="text-foreground/70 leading-relaxed">
              We will provide free website audits and technical support for one full year after your site goes live to help you achieve optimal performance and functionality.
            </p>
          </div>
          
          <div className="bg-card border border-border rounded-xl p-6 text-center space-y-4 hover:shadow-md transition-shadow">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <DollarSign className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-bold text-foreground text-lg">
              We'll Buy Your Site After 1 Year
            </h3>
            <p className="text-foreground/70 leading-relaxed">
              If you're not completely satisfied with your website after one year of ownership, we will purchase it from you at fair market value.
            </p>
          </div>
        </div>
        
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-6">
          <h4 className="font-bold text-foreground mb-6 text-lg flex items-center gap-3">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-primary font-bold text-sm">✓</span>
            </div>
            What "Fully-Functional" Means:
          </h4>
          <div className="grid md:grid-cols-2 gap-4">
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-foreground/80">
                <span className="text-primary mt-1 font-bold">•</span>
                <span>Hosted and accessible on the internet with your custom domain</span>
              </li>
              <li className="flex items-start gap-3 text-foreground/80">
                <span className="text-primary mt-1 font-bold">•</span>
                <span>Responsive design that works on all devices and screen sizes</span>
              </li>
              <li className="flex items-start gap-3 text-foreground/80">
                <span className="text-primary mt-1 font-bold">•</span>
                <span>Working contact forms with email delivery</span>
              </li>
              <li className="flex items-start gap-3 text-foreground/80">
                <span className="text-primary mt-1 font-bold">•</span>
                <span>Professional design with your branding and content</span>
              </li>
            </ul>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-foreground/80">
                <span className="text-primary mt-1 font-bold">•</span>
                <span>Fast loading speeds and SEO optimization</span>
              </li>
              <li className="flex items-start gap-3 text-foreground/80">
                <span className="text-primary mt-1 font-bold">•</span>
                <span>SSL certificate and security measures in place</span>
              </li>
              <li className="flex items-start gap-3 text-foreground/80">
                <span className="text-primary mt-1 font-bold">•</span>
                <span>Content management capabilities for updates</span>
              </li>
              <li className="flex items-start gap-3 text-foreground/80">
                <span className="text-primary mt-1 font-bold">•</span>
                <span>Compatible with modern web browsers</span>
              </li>
            </ul>
          </div>
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
          <p className="text-foreground/80">
            To invoke any guarantee, <a href="/#email-signup" className="text-primary hover:text-primary/80 underline font-medium">join our email list</a> and we'll provide you with direct contact information for course enrollment and guarantee claims. We will respond within 24 hours to begin the resolution process.
          </p>
        </section>
      </div>
    </div>
  )
}