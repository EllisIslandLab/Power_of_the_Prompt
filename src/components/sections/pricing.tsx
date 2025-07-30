import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Star, Zap, Shield } from "lucide-react"

const pricingPlans = [
  {
    id: "consultation",
    name: "Free Consultation",
    price: 0,
    duration: "One-time",
    popular: false,
    features: [
      "30-minute discovery call",
      "Website strategy session", 
      "Custom recommendations",
      "No obligation assessment"
    ],
    cta: "Book Free Call",
    href: "/consultation"
  },
  {
    id: "standard",
    name: "Standard Course",
    price: 800,
    duration: "One-time",
    popular: true,
    features: [
      "4-week group coaching program",
      "Complete textbook access",
      "Community forum access",
      "Basic email support",
      "Website templates included",
      "SEO optimization guide"
    ],
    cta: "Enroll Now",
    href: "/courses/standard"
  },
  {
    id: "premium",
    name: "Premium Course", 
    price: 2200,
    duration: "One-time",
    popular: false,
    features: [
      "Everything in Standard",
      "1-on-1 private sessions",
      "Direct instructor access",
      "30-day post-course support", 
      "Priority scheduling",
      "Custom website review"
    ],
    cta: "Go Premium",
    href: "/courses/premium"
  },
  {
    id: "support",
    name: "Monthly Support",
    price: 100,
    duration: "per month",
    popular: false,
    features: [
      "Ongoing website maintenance",
      "Monthly 1-on-1 calls",
      "Priority email support",
      "Access to new materials",
      "Bug fixes and updates",
      "Performance optimization"
    ],
    cta: "Subscribe",
    href: "/support/monthly"
  }
]

export function Pricing() {
  return (
    <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Pricing & Payment Options
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Choose the plan that fits your learning style and budget. All courses come with our 
            100% money-back guarantee.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {pricingPlans.map((plan) => (
            <Card 
              key={plan.id} 
              className={`relative overflow-hidden ${
                plan.popular ? 'ring-2 ring-primary shadow-lg scale-105' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-0 right-0 bg-primary text-primary-foreground text-center py-2 text-sm font-medium">
                  Most Popular
                </div>
              )}
              
              <CardHeader className={plan.popular ? 'pt-12' : ''}>
                <CardTitle className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    {plan.id === 'consultation' && <Shield className="h-5 w-5 text-primary" />}
                    {plan.id === 'standard' && <Star className="h-5 w-5 text-primary" />}
                    {plan.id === 'premium' && <Zap className="h-5 w-5 text-primary" />}
                    {plan.id === 'support' && <CheckCircle className="h-5 w-5 text-primary" />}
                    {plan.name}
                  </div>
                  <div className="text-3xl font-bold">
                    ${plan.price}
                    <span className="text-lg font-normal text-muted-foreground">
                      {plan.duration === 'One-time' ? '' : ` ${plan.duration}`}
                    </span>
                  </div>
                </CardTitle>
                <CardDescription className="text-center">
                  {plan.duration === 'One-time' ? 'One-time payment' : 'Recurring subscription'}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <CheckCircle className="h-4 w-4 text-accent flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  asChild 
                  className="w-full" 
                  variant={plan.popular ? "default" : "outline"}
                >
                  <Link href={plan.href}>{plan.cta}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="bg-card rounded-lg shadow-lg p-8 border">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-center mb-8">Payment Plans Available</h3>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-primary" />
                </div>
                <h4 className="font-semibold mb-2">One-Time Payment</h4>
                <p className="text-sm text-muted-foreground">
                  Pay in full and save. No recurring charges ever.
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Star className="h-8 w-8 text-primary" />
                </div>
                <h4 className="font-semibold mb-2">Payment Plans</h4>
                <p className="text-sm text-muted-foreground">
                  Split premium course into 3 monthly payments.
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <h4 className="font-semibold mb-2">Money-Back Guarantee</h4>
                <p className="text-sm text-muted-foreground">
                  100% refund within first week if not satisfied.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-12">
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-8">
            <h3 className="text-2xl font-bold mb-4">Questions About Pricing?</h3>
            <p className="text-muted-foreground mb-6">
              Schedule a free consultation to discuss which option is best for your business needs.
            </p>
            <Button size="lg" asChild>
              <Link href="/consultation">
                Book Free Consultation
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}