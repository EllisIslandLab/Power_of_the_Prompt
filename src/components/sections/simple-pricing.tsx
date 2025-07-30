"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Zap, Code, Globe, ShoppingCart, Building, MessageCircle, Rocket, Star } from "lucide-react"
import { useStripeCheckout } from "@/hooks/useStripeCheckout"
import { Footer } from "@/components/sections/footer"

// Dynamic date calculation for next cohort
function getNextCohortDate() {
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth()
  
  // Start with October 2025 or later
  let targetYear = currentYear >= 2025 && currentMonth >= 9 ? currentYear : 2025
  let targetMonth = currentYear >= 2025 && currentMonth >= 9 ? currentMonth + 1 : 9 // October = 9
  
  // If we're past October in current year, go to next month
  if (targetYear === currentYear && currentMonth >= targetMonth) {
    targetMonth = currentMonth + 1
    if (targetMonth > 11) {
      targetMonth = 0
      targetYear++
    }
  }
  
  // Find first Monday of target month
  const firstDay = new Date(targetYear, targetMonth, 1)
  const firstMonday = new Date(firstDay)
  const dayOfWeek = firstDay.getDay()
  const daysToAdd = dayOfWeek === 0 ? 1 : 8 - dayOfWeek
  firstMonday.setDate(1 + daysToAdd)
  
  return firstMonday.toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  })
}

// Premium spots counter (starts at 8, decreases with purchases)
function getPremiumSpotsRemaining() {
  // This would connect to your database/payment system
  // For now, return static number that you can manually update
  return 8 // Update this as people enroll
}

const exploreFirstPath = {
  id: "consultation",
  name: "Free Consultation",
  price: "Free",
  description: "30-minute strategy session",
  features: [
    "Website needs assessment",
    "Technology recommendations",
    "Custom roadmap",
    "Course curriculum overview",
    "No obligation"
  ],
  cta: "Book Free Call",
  href: "/consultation",
  icon: <MessageCircle className="h-8 w-8" />,
  note: "After consultation: $999 Foundation / $2,199 Premium"
}

const commitSavePath = [
  {
    id: "foundation",
    name: "Foundation Course",
    price: "$799",
    originalPrice: "$999",
    savings: "$200",
    label: "Your Own Pace",
    description: "Complete 4-week program",
    features: [
      "4-week group coaching",
      "Complete textbook",
      "50% discount 1-on-1 support sessions",
      "Community access",
      "Templates included",
      "BONUS: Free consultation included",
      "Working website guarantee - I want to see you win!"
    ],
    cta: "Build My Website",
    href: "/courses/foundation",
    icon: <Globe className="h-8 w-8" />,
    stripeProductId: "FOUNDATION_COURSE",
    note: "Course starts first Monday of each month."
  },
  {
    id: "premium",
    name: "Premium Course",
    price: "$1,999",
    originalPrice: "$2,199",
    savings: "$200",
    label: "100% Guarantee Enabled",
    description: "Everything + premium support",
    availability: "spots remaining this month",
    features: [
      "Everything in Foundation Course",
      "8 FREE 1-on-1 sessions (2 hours each)",
      "60-day post-course support",
      "Priority scheduling",
      "Custom website review",
      "We'll cover the cost of essential tools you need including premium AI subscription and color palette tool",
      "Working website guarantee OR money back",
      "BONUS: Free consultation included",
      "I want to see you win!"
    ],
    cta: "Own My Website",
    href: "/courses/premium",
    icon: <Star className="h-8 w-8" />,
    stripeProductId: "PREMIUM_COURSE",
    note: "Course starts first Monday of each month."
  }
]

const doneForYouServices = [
  {
    id: "portfolio",
    name: "Simple Portfolio",
    price: "Starting at $399",
    description: "Perfect for service providers",
    includes: [
      "5-page responsive website",
      "Contact forms",
      "Mobile optimized", 
      "SEO ready",
      "30-day support"
    ],
    example: "Service providers, consultants",
    cta: "Get Free Quote",
    icon: <Code className="h-8 w-8 text-blue-500" />
  },
  {
    id: "business",
    name: "Business Website", 
    price: "Starting at $899",
    description: "Professional business presence",
    includes: [
      "Everything in Simple Portfolio",
      "Advanced forms",
      "Booking system",
      "Email integration",
      "60-day support"
    ],
    example: "Coaches, therapists, professionals",
    cta: "Get Free Quote",
    icon: <Globe className="h-8 w-8 text-green-500" />
  },
  {
    id: "ecommerce",
    name: "E-commerce Store",
    price: "Starting at $1,499", 
    description: "Complete online store",
    includes: [
      "Product catalog",
      "Shopping cart",
      "Payment processing",
      "Order management",
      "90-day support"
    ],
    example: "Product sellers, retailers",
    cta: "Get Free Quote",
    icon: <ShoppingCart className="h-8 w-8 text-purple-500" />
  },
  {
    id: "enterprise",
    name: "Enterprise Solution",
    price: "Starting at $2,999",
    description: "Custom business applications", 
    includes: [
      "Complex functionality",
      "Custom integrations", 
      "Advanced features",
      "Performance optimization",
      "6-month support"
    ],
    example: "Healthcare, finance, membership",
    cta: "Get Free Consultation",
    icon: <Building className="h-8 w-8 text-orange-500" />
  }
]

export function SimplePricing() {
  const { createCheckout, loading, error } = useStripeCheckout()
  const [nextCohortDate, setNextCohortDate] = useState('')
  const [spotsRemaining, setSpotsRemaining] = useState(8)

  useEffect(() => {
    setNextCohortDate(getNextCohortDate())
    setSpotsRemaining(getPremiumSpotsRemaining())
  }, [])

  const handlePurchase = async (productId: string) => {
    if (productId) {
      await createCheckout(productId as any)
    }
  }
  return (
    <>
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-7xl">
        
        {/* Error Display */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg text-center">
            <p className="text-red-700">{error}</p>
          </div>
        )}
        
        {/* Pricing Strategy Introduction */}
        <div className="mb-16">
          <div className="text-center mb-12">
            {/* Exclusive Badge */}
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-accent/20 to-primary/20 px-6 py-2 rounded-full border border-accent/30 mb-6">
              <span className="text-lg">🌟</span>
              <span className="font-bold text-sm uppercase tracking-wider text-primary">Exclusive to Power of the Prompt</span>
              <span className="text-lg">🌟</span>
            </div>
            <p className="text-sm text-muted-foreground mb-8 font-medium">
              The only course that teaches AI-powered web development for business owners
            </p>
            
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
              Choose Your Path:
            </h2>
            <div className="max-w-2xl mx-auto space-y-4">
              <div className="flex items-center justify-center gap-3 text-lg">
                <span>✨</span>
                <span className="font-semibold text-primary">Explore First</span>
                <span className="text-muted-foreground">- Free consultation, then regular pricing</span>
              </div>
              <div className="flex items-center justify-center gap-3 text-lg">
                <span>💰</span>
                <span className="font-semibold text-primary">Commit & Save</span>
                <span className="text-muted-foreground">- Start building immediately and save $200</span>
              </div>
            </div>
          </div>
          
          {/* Path 1: Explore First */}
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-center mb-8 flex items-center justify-center gap-2">
              <span>🤔</span>
              <span>Not Sure? Let's Talk First</span>
            </h3>
            
            <div className="max-w-md mx-auto">
              <Card className="text-center">
                <CardHeader>
                  <div className="flex flex-col items-center">
                    <div className="mb-4 p-3 rounded-full bg-primary/10">
                      {exploreFirstPath.icon}
                    </div>
                    <CardTitle className="text-xl mb-2">{exploreFirstPath.name}</CardTitle>
                    <div className="text-3xl font-bold text-primary mb-2">
                      {exploreFirstPath.price}
                    </div>
                    <CardDescription>{exploreFirstPath.description}</CardDescription>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {exploreFirstPath.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-3">
                        <Zap className="h-4 w-4 text-accent flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button asChild className="w-full" variant="outline">
                    <Link href={exploreFirstPath.href}>{exploreFirstPath.cta}</Link>
                  </Button>
                  
                  <p className="text-xs text-muted-foreground mt-3">
                    {exploreFirstPath.note}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
          
          {/* Path 2: Commit & Save */}
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-center mb-8 flex items-center justify-center gap-2">
              <span>🚀</span>
              <span>Ready to Build? Start Saving Now</span>
            </h3>
            
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {commitSavePath.map((course) => (
                <Card 
                  key={course.id} 
                  className="relative overflow-hidden ring-2 ring-accent shadow-lg"
                >
                  <div className="absolute top-0 left-0 right-0 bg-primary text-primary-foreground text-center py-2 text-sm font-medium">
                    {course.label}
                  </div>
                  
                  {/* Savings Badge */}
                  <div className="absolute top-16 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold z-10">
                    💰 Save {course.savings}
                  </div>
                  
                  <CardHeader className="pt-12">
                    <div className="flex flex-col items-center text-center">
                      <div className="mb-4 p-3 rounded-full bg-primary/10">
                        {course.icon}
                      </div>
                      <CardTitle className="text-xl mb-2">{course.name}</CardTitle>
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <span className="text-3xl font-bold text-primary">{course.price}</span>
                        <span className="text-lg text-muted-foreground line-through">{course.originalPrice}</span>
                      </div>
                      <CardDescription>{course.description}</CardDescription>
                      {course.availability && (
                        <div className="mt-2 text-sm text-red-600 font-semibold">
                          {spotsRemaining} {course.availability}
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <ul className="space-y-3 mb-6">
                      {course.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <Zap className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
                          <span className="text-sm">
                            {feature.includes('I want to see you win') ? (
                              <span className="italic text-primary font-bold">{feature}</span>
                            ) : (
                              feature
                            )}
                          </span>
                        </li>
                      ))}
                    </ul>
                    
                    <Button 
                      className="w-full mb-3" 
                      onClick={() => handlePurchase(course.stripeProductId)}
                      disabled={loading}
                    >
                      {loading ? "Processing..." : course.cta}
                    </Button>
                    
                    <p className="text-xs text-muted-foreground text-center">
                      {course.note} Next cohort: <span className="font-semibold">{nextCohortDate}</span>
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          
          {/* Guarantee Clarification Section */}
          <div className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-lg p-8 mb-12 border border-primary/10">
            <h3 className="text-2xl font-bold text-center mb-6">Our Working Website Guarantee</h3>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="text-center">
                <h4 className="font-semibold text-primary mb-3">For Foundation Course:</h4>
                <p className="text-sm text-muted-foreground">
                  I'm committed to your success. If you attend sessions and complete assignments but don't achieve a working website, I'll work with you personally until you do. <span className="italic text-primary font-bold">I want to see you win!</span>
                </p>
              </div>
              
              <div className="text-center">
                <h4 className="font-semibold text-primary mb-3">For Premium Course:</h4>
                <p className="text-sm text-muted-foreground">
                  With 8 included 1-on-1 sessions, I guarantee you'll have a working website you own completely. If not, you get your money back. But here's the thing - I've never had to give a refund because <span className="italic text-primary font-bold">I want to see you win, and I'll make sure you do!</span>
                </p>
              </div>
            </div>
          </div>
          
        </div>

        {/* Transition Statement */}
        <div className="text-center py-8 mb-12">
          <div className="inline-flex items-center gap-4 text-lg font-medium text-muted-foreground">
            <span><strong className="text-primary">Prefer to learn by doing?</strong> ↑</span>
            <span className="text-primary font-bold">•</span>
            <span><strong className="text-primary">Want it done for you?</strong> ↓</span>
          </div>
        </div>

        {/* Done-For-You Services */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Done-For-You Services
            </h2>
            <p className="text-xl text-muted-foreground max-w-4xl mx-auto mb-4">
              Save maximum time with a professional website built for you - while maintaining <strong className="text-primary">complete ownership and control</strong> plus unlimited access to knowledge resources
            </p>
            <p className="text-sm text-muted-foreground font-medium">
              Revolutionary AI-assisted development meets professional expertise
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {doneForYouServices.map((service) => (
              <Card key={service.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex flex-col items-center text-center">
                    <div className="mb-4 p-3 rounded-full bg-muted">
                      {service.icon}
                    </div>
                    <CardTitle className="text-lg mb-2">{service.name}</CardTitle>
                    <div className="text-2xl font-bold text-primary mb-2">
                      {service.price}
                    </div>
                    <CardDescription>{service.description}</CardDescription>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="mb-4">
                    <h5 className="font-semibold mb-3 text-sm">Includes:</h5>
                    <ul className="space-y-2">
                      {service.includes.map((item, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <Zap className="h-3 w-3 text-accent flex-shrink-0" style={{ stroke: 'currentColor', strokeWidth: 2.5, filter: 'drop-shadow(1px 1px 0px rgba(0, 0, 0, 0.8))' }} />
                          <span className="text-xs">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="mb-4 p-3 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground">
                      <strong>Perfect for:</strong> {service.example}
                    </p>
                  </div>
                  
                  <Button asChild className="w-full" variant="outline">
                    <Link href="/consultation">Start Building</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Optional Support Section */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Ongoing Website Support
            </h2>
            <p className="text-lg text-muted-foreground">
              Keep your website running smoothly
            </p>
          </div>
          
          <div className="max-w-md mx-auto">
            <Card>
              <CardHeader>
                <div className="text-center">
                  <CardTitle className="text-xl mb-2">Monthly Support</CardTitle>
                  <div className="text-3xl font-bold text-primary mb-2">
                    Starting at $99<span className="text-lg font-normal">/month</span>
                  </div>
                  <CardDescription>Peace of mind maintenance</CardDescription>
                </div>
              </CardHeader>
              
              <CardContent>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-3">
                    <Zap className="h-4 w-4 text-accent flex-shrink-0" style={{ stroke: 'currentColor', strokeWidth: 2.5, filter: 'drop-shadow(1px 1px 0px rgba(0, 0, 0, 0.8))' }} />
                    <span className="text-sm">Monthly updates</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Zap className="h-4 w-4 text-accent flex-shrink-0" style={{ stroke: 'currentColor', strokeWidth: 2.5, filter: 'drop-shadow(1px 1px 0px rgba(0, 0, 0, 0.8))' }} />
                    <span className="text-sm">Security monitoring</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Zap className="h-4 w-4 text-accent flex-shrink-0" style={{ stroke: 'currentColor', strokeWidth: 2.5, filter: 'drop-shadow(1px 1px 0px rgba(0, 0, 0, 0.8))' }} />
                    <span className="text-sm">Content changes (2 hours)</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Zap className="h-4 w-4 text-accent flex-shrink-0" style={{ stroke: 'currentColor', strokeWidth: 2.5, filter: 'drop-shadow(1px 1px 0px rgba(0, 0, 0, 0.8))' }} />
                    <span className="text-sm">Email support</span>
                  </li>
                </ul>
                
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => handlePurchase("MONTHLY_SUPPORT")}
                  disabled={loading}
                >
                  {loading ? "Processing..." : "Subscribe Now"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Trust Building Section */}
        <div className="bg-muted/30 rounded-lg p-8 mb-12">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">Why Choose Power of the Prompt?</h3>
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-7 w-7 text-primary" />
                </div>
                <h4 className="font-semibold mb-2">Working Website Guarantee</h4>
                <p className="text-sm text-muted-foreground">
                  <span className="italic text-primary font-bold">I want to see you win!</span> Get a working website or your money back.
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Globe className="h-8 w-8 text-primary" />
                </div>
                <h4 className="font-semibold mb-2">You Actually <strong>OWN</strong> Your Sites</h4>
                <p className="text-sm text-muted-foreground">
                  No monthly fees, no hidden upsells, no platform lock-in. Complete ownership forever.
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Rocket className="h-8 w-8 text-primary" />
                </div>
                <h4 className="font-semibold mb-2">Start Building Immediately</h4>
                <p className="text-sm text-muted-foreground">
                  Commit & Save pricing lets you begin right away with instant $200 savings.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
      </section>
      
      <Footer />
    </>
  )
}