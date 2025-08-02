import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Zap, ArrowRight } from "lucide-react"

export function Hero() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
            Build Once, <span className="text-primary">Own Forever</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            Learn to create professional websites with AI assistance - no hidden monthly/annual fees, complete ownership. 
            Join the growing number of small business owners who are tired of subscription-based models.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button size="lg" asChild className="w-full sm:w-auto">
              <Link href="/consultation">
                Get A Free Consultation <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="w-full sm:w-auto">
              <Link href="/services">View All Services</Link>
            </Button>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-accent" style={{ stroke: 'currentColor', strokeWidth: 2, filter: 'drop-shadow(1px 1px 0px rgba(0, 0, 0, 0.8))' }} />
              <span>100% money-back guarantee</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-accent" style={{ stroke: 'currentColor', strokeWidth: 2, filter: 'drop-shadow(1px 1px 0px rgba(0, 0, 0, 0.8))' }} />
              <span>No monthly hosting fees</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-accent" style={{ stroke: 'currentColor', strokeWidth: 2, filter: 'drop-shadow(1px 1px 0px rgba(0, 0, 0, 0.8))' }} />
              <span>Complete website ownership</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-accent" style={{ stroke: 'currentColor', strokeWidth: 2, filter: 'drop-shadow(1px 1px 0px rgba(0, 0, 0, 0.8))' }} />
              <span>AI-powered = rapid and precise development</span>
            </div>
          </div>
        </div>

        <div className="mt-16 text-center">
          <div className="bg-card rounded-lg shadow-lg p-8 max-w-2xl mx-auto border">
            <h3 className="text-2xl font-semibold mb-4 text-card-foreground">
              Why Choose Power of the Prompt?
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              <strong className="text-card-foreground">Stop renting your website. Start owning it.</strong>
            </p>
            <p className="text-muted-foreground leading-relaxed">
              We teach business owners to build professional websites using AI and modern web development. No monthly fees, no platform restrictions, no compromise.
            </p>
            <p className="text-card-foreground font-semibold mt-4">
              <strong>Build Once, Own Forever</strong> - complete ownership, complete control.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}