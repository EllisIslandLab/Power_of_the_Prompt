import { Shield, Clock, DollarSign, Gauge } from "lucide-react"

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
              Fully-Functional Site
            </h3>
            <p className="text-foreground/70 leading-relaxed">
              You will have a hosted website that is live and interactive on the internet with at least one contact form for client data capture and responsive design within 1 week after course completion.
            </p>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 text-center space-y-4 hover:shadow-md transition-shadow">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Gauge className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-bold text-foreground text-lg">
              90+ Lighthouse Score
            </h3>
            <p className="text-foreground/70 leading-relaxed">
              Your website will achieve a minimum score of 90 or higher on Google Lighthouse metrics for Performance, Accessibility, Best Practices, and SEO, ensuring your site meets industry-leading standards.
            </p>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 text-center space-y-4 hover:shadow-md transition-shadow">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-bold text-foreground text-lg">
              Basic Testing & Support 1 Year
            </h3>
            <p className="text-foreground/70 leading-relaxed">
              We provide 1 year of basic support including SEO, Best Practice, Performance, and Accessibility testing and consultation via email/chat. This covers routine site health checks and guidance. For more intensive development needs, we may recommend purchasing additional LVL UP 1-on-1 sessions.
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
                <span>Hosted and accessible on the internet</span>
              </li>
              <li className="flex items-start gap-3 text-foreground/80">
                <span className="text-primary mt-1 font-bold">•</span>
                <span>Responsive design that works on all devices</span>
              </li>
              <li className="flex items-start gap-3 text-foreground/80">
                <span className="text-primary mt-1 font-bold">•</span>
                <span>At least one working contact form for client data capture</span>
              </li>
              <li className="flex items-start gap-3 text-foreground/80">
                <span className="text-primary mt-1 font-bold">•</span>
                <span>Professional design with your branding</span>
              </li>
            </ul>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-foreground/80">
                <span className="text-primary mt-1 font-bold">•</span>
                <span>SSL certificate and security measures</span>
              </li>
              <li className="flex items-start gap-3 text-foreground/80">
                <span className="text-primary mt-1 font-bold">•</span>
                <span>Fast loading and optimized performance</span>
              </li>
              <li className="flex items-start gap-3 text-foreground/80">
                <span className="text-primary mt-1 font-bold">•</span>
                <span>SEO-ready structure and meta tags</span>
              </li>
              <li className="flex items-start gap-3 text-foreground/80">
                <span className="text-primary mt-1 font-bold">•</span>
                <span>Compatible with modern web browsers</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-accent/10 to-primary/10 border-2 border-accent rounded-2xl p-8 mb-8">
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center">
            <DollarSign className="h-10 w-10 text-accent" />
          </div>
          <h2 className="text-3xl font-bold text-foreground">
            Money Back Guarantee
          </h2>
        </div>
        <p className="text-center text-foreground/80 text-lg leading-relaxed max-w-3xl mx-auto">
          If we cannot deliver on all three guarantees above, you will receive a <strong>full refund</strong> of your course fee. We are committed to your success, and we stand behind our ability to help you build a professional, high-performing website. Your investment is protected.
        </p>
      </div>

      <div className="space-y-6">
        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">Terms and Conditions</h2>
          <div className="space-y-4 text-muted-foreground">
            <p>
              <strong>Eligibility:</strong> Guarantees apply to course participants who complete the full program requirements and actively participate in scheduled sessions.
            </p>
            <p>
              <strong>Timeline:</strong> The 1-week delivery timeline begins after your official course completion date. Course duration varies by enrollment package.
            </p>
            <p>
              <strong>Lighthouse Score:</strong> We will work with you to achieve a 90+ score across all four metrics (Performance, Accessibility, Best Practices, SEO) using Google's official Lighthouse tool. Scores may vary based on network conditions and device testing.
            </p>
            <p>
              <strong>Support Scope:</strong> One-year basic support covers email/chat consultation for SEO, Best Practices, Performance, and Accessibility testing and guidance. Does not include content creation, major design changes, or feature additions. For intensive development needs, we may recommend purchasing additional LVL UP 1-on-1 sessions for elevated support.
            </p>
            <p>
              <strong>Money Back Guarantee:</strong> Full refund available if we fail to deliver any of the three guarantees. Claims must be made within 30 days of the 1-week delivery deadline with documented evidence that requirements were not met.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">How to Claim</h2>
          <p className="text-foreground/80 mb-4">
            To invoke any guarantee or request support, contact us at{' '}
            <a href="mailto:hello@weblaunchacademy.com?subject=Guarantee Claim" className="text-primary hover:text-primary/80 underline font-medium">
              hello@weblaunchacademy.com
            </a>{' '}
            or call{' '}
            <a href="tel:+14403549904" className="text-primary hover:text-primary/80 underline font-medium">
              (440) 354-9904
            </a>.
            We will respond within 24 hours to begin the resolution process.
          </p>
        </section>
      </div>
    </div>
  )
}