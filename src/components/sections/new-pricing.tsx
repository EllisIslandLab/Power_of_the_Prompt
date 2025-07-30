"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Star, Zap, Shield, Calculator, Users, Clock, Award, ArrowRight } from "lucide-react"

const coursePackages = [
  {
    id: "consultation",
    name: "Free Consultation",
    price: 0,
    originalPrice: null,
    label: null,
    description: "Get started with a strategy session",
    features: [
      "30-minute discovery call",
      "Website strategy session",
      "Custom recommendations",
      "Technology roadmap",
      "No obligation assessment"
    ],
    cta: "Book Free Call",
    href: "/consultation",
    popular: false
  },
  {
    id: "foundation",
    name: "Foundation Course",
    price: 799,
    originalPrice: 800,
    label: "Most Popular for Beginners",
    description: "Perfect for simple business websites",
    features: [
      "4-week group coaching program",
      "Complete textbook access",
      "Community forum access",
      "Basic email support",
      "Website templates included",
      "SEO optimization guide",
      "Portfolio/service site focus"
    ],
    cta: "Start Learning",
    href: "/courses/foundation",
    popular: true
  },
  {
    id: "professional",
    name: "Professional Course",
    price: 1999,
    originalPrice: 2200,
    label: "Best Value",
    description: "For serious business growth",
    features: [
      "Everything in Foundation",
      "1-on-1 private sessions (8 hours total)",
      "Direct instructor access",
      "60-day post-course support",
      "Priority scheduling",
      "Custom website review",
      "E-commerce training included",
      "Advanced integrations (payments, CRM)"
    ],
    cta: "Go Professional",
    href: "/courses/professional",
    popular: false
  },
  {
    id: "master",
    name: "Master Class",
    price: 3499,
    originalPrice: null,
    label: "Complete Business Solution",
    description: "Turn web development into a revenue stream",
    features: [
      "Everything in Professional",
      "Advanced business training",
      "Client acquisition strategies",
      "Pricing and proposal templates",
      "Ongoing mastermind access",
      "Reseller licensing rights",
      "90-day support included"
    ],
    cta: "Master the Business",
    href: "/courses/master",
    popular: false
  }
]

const doneForYouServices = [
  {
    id: "portfolio",
    name: "Simple Portfolio Site",
    startingPrice: 399,
    description: "Perfect for service providers and consultants",
    baseIncludes: [
      "Fully responsive website",
      "Unique customized design",
      "Search engine optimization",
      "Mobile-first design",
      "30-day support"
    ],
    addOns: [
      { name: "Blog setup", price: 199 },
      { name: "Advanced SEO", price: 299 },
      { name: "Social media integration", price: 149 },
      { name: "Analytics setup", price: 99 },
      { name: "Extended support (6 months)", price: 199 }
    ],
    examples: "Service providers, consultants, freelancers",
    cta: "Get Quote"
  },
  {
    id: "business",
    name: "Business Website",
    startingPrice: 899,
    description: "Professional presence with lead generation",
    baseIncludes: [
      "Everything in Simple Portfolio",
      "Advanced contact forms",
      "Email automation setup",
      "Customer testimonials section",
      "Service booking system",
      "60-day support"
    ],
    addOns: [
      { name: "CRM integration", price: 299 },
      { name: "Payment processing", price: 399 },
      { name: "Client portal", price: 499 },
      { name: "Email marketing setup", price: 249 },
      { name: "Custom integrations", price: 399 }
    ],
    examples: "Coaches, therapists, professional services",
    cta: "Start Project"
  },
  {
    id: "ecommerce",
    name: "E-commerce Website",
    startingPrice: 1499,
    description: "Complete online store with payment processing",
    baseIncludes: [
      "Product catalog (up to 50 products)",
      "Shopping cart functionality",
      "Stripe payment integration",
      "Inventory management",
      "Order processing system",
      "Customer accounts",
      "90-day support"
    ],
    addOns: [
      { name: "Additional products (per 25)", price: 199 },
      { name: "Advanced inventory", price: 399 },
      { name: "Multi-payment options", price: 299 },
      { name: "Subscription products", price: 499 },
      { name: "Advanced analytics", price: 349 },
      { name: "Marketing automation", price: 599 }
    ],
    examples: "Product sellers, online retailers",
    cta: "Launch Store"
  },
  {
    id: "enterprise",
    name: "Enterprise Website",
    startingPrice: 2999,
    description: "Complex functionality for growing businesses",
    baseIncludes: [
      "Everything in E-commerce",
      "Custom integrations",
      "Advanced user roles",
      "API development",
      "Performance optimization",
      "Security hardening",
      "6-month support"
    ],
    addOns: [
      { name: "Mobile app", price: 4999 },
      { name: "Advanced automation", price: 999 },
      { name: "Custom reporting", price: 699 },
      { name: "Third-party integrations", price: 599 },
      { name: "Training for team", price: 799 }
    ],
    examples: "Healthcare, finance, membership sites",
    cta: "Get Consultation"
  }
]

const supportPlans = [
  {
    id: "basic",
    name: "Basic Support Plan",
    price: 99,
    description: "Essential maintenance and updates",
    features: [
      "Monthly security updates",
      "Content updates (2 hours)",
      "Performance monitoring",
      "Email support",
      "Monthly health report"
    ],
    cta: "Get Support"
  },
  {
    id: "professional",
    name: "Professional Support Plan",
    price: 199,
    description: "Comprehensive management and growth",
    features: [
      "Everything in Basic",
      "Monthly 1-on-1 call (30 minutes)",
      "Content updates (5 hours)",
      "SEO monitoring",
      "Analytics reporting",
      "Priority support",
      "Feature requests"
    ],
    cta: "Go Professional"
  },
  {
    id: "enterprise",
    name: "Enterprise Support Plan",
    price: 399,
    description: "White-glove service for serious businesses",
    features: [
      "Everything in Professional",
      "Weekly check-ins",
      "Unlimited content updates",
      "Advanced analytics",
      "Growth optimization",
      "Custom development hours (3/month)",
      "Emergency support (24/48 hours)"
    ],
    cta: "Get Enterprise"
  }
]

const oneTimeServices = [
  { name: "Website Audit", price: 299 },
  { name: "Performance Optimization", price: 399 },
  { name: "Security Hardening", price: 499 },
  { name: "SEO Audit & Setup", price: 599 },
  { name: "Emergency Fixes", price: 149, unit: "hour" },
  { name: "Custom Feature Development", price: 99, unit: "hour" },
  { name: "Migration Services", price: 699 }
]

export function NewPricing() {
  const [activeTab, setActiveTab] = useState("courses")
  const [selectedAddOns, setSelectedAddOns] = useState<Record<string, number[]>>({})

  const toggleAddOn = (serviceId: string, addOnIndex: number) => {
    setSelectedAddOns(prev => {
      const current = prev[serviceId] || []
      const newAddOns = current.includes(addOnIndex)
        ? current.filter(i => i !== addOnIndex)
        : [...current, addOnIndex]
      return { ...prev, [serviceId]: newAddOns }
    })
  }

  const calculateTotal = (service: typeof doneForYouServices[0], serviceId: string) => {
    const addOns = selectedAddOns[serviceId] || []
    const addOnTotal = addOns.reduce((sum, index) => sum + service.addOns[index].price, 0)
    return service.startingPrice + addOnTotal
  }

  return (
    <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
            Choose Your Path to Website Success
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Whether you want to learn or have us build it for you, we have the perfect solution for your business needs.
          </p>
          
          {/* Tab Navigation */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            <Button
              variant={activeTab === "courses" ? "default" : "outline"}
              onClick={() => setActiveTab("courses")}
              className="px-8"
            >
              Learn to Build
            </Button>
            <Button
              variant={activeTab === "services" ? "default" : "outline"}
              onClick={() => setActiveTab("services")}
              className="px-8"
            >
              Done-For-You
            </Button>
            <Button
              variant={activeTab === "support" ? "default" : "outline"}
              onClick={() => setActiveTab("support")}
              className="px-8"
            >
              Ongoing Support
            </Button>
            <Button
              variant={activeTab === "calculator" ? "default" : "outline"}
              onClick={() => setActiveTab("calculator")}
              className="px-8"
            >
              <Calculator className="h-4 w-4 mr-2" />
              Calculator
            </Button>
          </div>
        </div>

        {/* Course Packages Section */}
        {activeTab === "courses" && (
          <div>
            <div className="text-center mb-12">
              <h3 className="text-2xl font-bold mb-4">Learn to Build Your Own Website</h3>
              <p className="text-lg text-muted-foreground">Master professional web development with AI assistance</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {coursePackages.map((course) => (
                <Card 
                  key={course.id} 
                  className={`relative overflow-hidden ${
                    course.popular ? 'ring-2 ring-primary shadow-lg scale-105' : ''
                  }`}
                >
                  {course.label && (
                    <div className="absolute top-0 left-0 right-0 bg-primary text-primary-foreground text-center py-2 text-sm font-medium">
                      {course.label}
                    </div>
                  )}
                  
                  <CardHeader className={course.label ? 'pt-12' : ''}>
                    <CardTitle className="text-center">
                      <div className="mb-4">
                        <h4 className="text-xl font-semibold mb-2">{course.name}</h4>
                        <div className="text-3xl font-bold">
                          ${course.price.toLocaleString()}
                          {course.originalPrice && (
                            <span className="text-lg font-normal text-muted-foreground line-through ml-2">
                              ${course.originalPrice.toLocaleString()}
                            </span>
                          )}
                        </div>
                        {course.originalPrice && (
                          <Badge variant="secondary" className="mt-2">
                            Save ${course.originalPrice - course.price}
                          </Badge>
                        )}
                      </div>
                    </CardTitle>
                    <CardDescription className="text-center">
                      {course.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <ul className="space-y-3">
                      {course.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-3">
                          <CheckCircle className="h-4 w-4 text-accent flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <Button 
                      asChild 
                      className="w-full" 
                      variant={course.popular ? "default" : "outline"}
                    >
                      <Link href={course.href}>{course.cta}</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Done-For-You Services Section */}
        {activeTab === "services" && (
          <div>
            <div className="text-center mb-12">
              <h3 className="text-2xl font-bold mb-4">Or Let Us Build It For You</h3>
              <p className="text-lg text-muted-foreground">Professional websites delivered in 2-3 weeks</p>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-8">
              {doneForYouServices.map((service) => (
                <Card key={service.id} className="overflow-hidden">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{service.name}</span>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">
                          Starting at ${service.startingPrice.toLocaleString()}
                        </div>
                        {selectedAddOns[service.id]?.length > 0 && (
                          <div className="text-lg text-muted-foreground">
                            Total: ${calculateTotal(service, service.id).toLocaleString()}
                          </div>
                        )}
                      </div>
                    </CardTitle>
                    <CardDescription>{service.description}</CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-6">
                    <div>
                      <h5 className="font-semibold mb-3">Base Package Includes:</h5>
                      <ul className="space-y-2">
                        {service.baseIncludes.map((feature, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-accent flex-shrink-0" />
                            <span className="text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h5 className="font-semibold mb-3">Add-Ons:</h5>
                      <div className="space-y-2">
                        {service.addOns.map((addOn, index) => (
                          <label key={index} className="flex items-center gap-3 cursor-pointer p-2 rounded hover:bg-muted">
                            <input
                              type="checkbox"
                              checked={(selectedAddOns[service.id] || []).includes(index)}
                              onChange={() => toggleAddOn(service.id, index)}
                              className="rounded"
                            />
                            <span className="flex-1 text-sm">{addOn.name}</span>
                            <span className="font-semibold">+${addOn.price}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t">
                      <p className="text-sm text-muted-foreground mb-4">
                        <strong>Perfect for:</strong> {service.examples}
                      </p>
                      <Button className="w-full">{service.cta}</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Support Plans Section */}
        {activeTab === "support" && (
          <div>
            <div className="text-center mb-12">
              <h3 className="text-2xl font-bold mb-4">Ongoing Support & Maintenance</h3>
              <p className="text-lg text-muted-foreground">Keep your website running smoothly</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              {supportPlans.map((plan) => (
                <Card key={plan.id}>
                  <CardHeader>
                    <CardTitle className="text-center">
                      <div className="mb-4">
                        <h4 className="text-xl font-semibold mb-2">{plan.name}</h4>
                        <div className="text-3xl font-bold">
                          ${plan.price}<span className="text-lg font-normal">/month</span>
                        </div>
                      </div>
                    </CardTitle>
                    <CardDescription className="text-center">
                      {plan.description}
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
                    
                    <Button className="w-full">{plan.cta}</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="bg-card rounded-lg p-8 border">
              <h4 className="text-xl font-bold mb-6 text-center">One-Time Services</h4>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {oneTimeServices.map((service, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-muted rounded">
                    <span className="text-sm font-medium">{service.name}</span>
                    <span className="font-bold">
                      ${service.price}{service.unit && `/${service.unit}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Calculator Section */}
        {activeTab === "calculator" && (
          <div>
            <div className="text-center mb-12">
              <h3 className="text-2xl font-bold mb-4">Build Your Custom Package</h3>
              <p className="text-lg text-muted-foreground">Select services and see real-time pricing</p>
            </div>
            
            <div className="bg-card rounded-lg p-8 border">
              <p className="text-center text-muted-foreground">
                Interactive pricing calculator coming soon! 
                <br />
                For now, <Link href="/consultation" className="text-primary hover:underline">book a free consultation</Link> to discuss your custom package.
              </p>
            </div>
          </div>
        )}

        {/* Package Deals */}
        <div className="mt-20 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold mb-4">Package Deals & Bundles</h3>
            <p className="text-muted-foreground">Combine services and save even more</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-background/80 rounded-lg p-6 text-center">
              <h4 className="font-semibold mb-2">Complete Business Package</h4>
              <p className="text-sm text-muted-foreground mb-4">Any Done-For-You Website + Foundation Course</p>
              <Badge variant="secondary">Save $200</Badge>
            </div>
            
            <div className="bg-background/80 rounded-lg p-6 text-center">
              <h4 className="font-semibold mb-2">Website + Support Bundle</h4>
              <p className="text-sm text-muted-foreground mb-4">Any Website + 6 months Basic Support</p>
              <Badge variant="secondary">Save $150</Badge>
            </div>
            
            <div className="bg-background/80 rounded-lg p-6 text-center">
              <h4 className="font-semibold mb-2">Learn & Build Combo</h4>
              <p className="text-sm text-muted-foreground mb-4">Professional Course + Simple Portfolio Build</p>
              <div className="space-y-1">
                <div className="font-bold">$999</div>
                <Badge variant="secondary">Save $199</Badge>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <div className="bg-card rounded-lg shadow-lg p-8 border">
            <h3 className="text-2xl font-bold mb-4">Ready to Get Started?</h3>
            <p className="text-muted-foreground mb-6">
              Every package comes with our 100% money-back guarantee. 
              <br />
              Not sure which option is right for you?
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/consultation">
                  Get Free Consultation <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#courses">
                  Compare All Options
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}