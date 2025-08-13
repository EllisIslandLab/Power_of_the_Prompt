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
          
          <div className="space-y-4 mb-8 max-w-3xl mx-auto">
            <p className="text-xl text-muted-foreground leading-relaxed">
              Create your professional website with <span className="text-primary font-semibold">AI assistance</span> and me as your personal coach.
            </p>
            
            <div className="bg-gradient-to-r from-accent/10 to-primary/10 rounded-lg p-4 border border-accent/20">
              <p className="text-lg font-medium text-foreground">
                <span className="text-red-600 font-bold">ZERO</span> monthly fees • 
                <span className="text-red-600 font-bold"> ZERO</span> hidden costs • 
                <span className="text-primary font-bold"> 100%</span> ownership
              </p>
            </div>
            
            <p className="text-lg text-muted-foreground">
              Join hundreds of business owners who've escaped subscription traps. 
              <span className="text-foreground font-semibold"> Own your code, own your future.</span>
            </p>
          </div>

          <div className="flex justify-center items-center mb-12">
            <Button size="lg" asChild className="w-full sm:w-auto">
              <Link href="/#consultation">
                Get Started <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
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
              Why Choose Web Launch Academy?
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