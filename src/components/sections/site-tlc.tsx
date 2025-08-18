"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Check, TrendingUp, Shield, Zap } from "lucide-react"

export function SiteTLC() {
  const [selectedPackage, setSelectedPackage] = useState("essential")
  
  const maintenancePackages = [
    {
      id: "essential",
      name: "Basic Care",
      price: "$75",
      period: "/month",
      icon: <Shield className="h-6 w-6" />,
      description: "Simple maintenance for small business websites - honest, basic care",
      features: [
        "Monthly performance reports",
        "Content updates (1 hour/month)", 
        "Basic website monitoring",
        "Email support (48h response)",
        "Simple bug fixes and updates"
      ],
      popular: false // I'm new, nothing is "popular" yet
    },
    // TODO: Offer this when I have more experience and systems in place
    // {
    //   id: "growth",
    //   name: "Growth Accelerator", 
    //   price: "$150",
    //   period: "/month",
    //   icon: <TrendingUp className="h-6 w-6" />,
    //   description: "For when I'm more experienced - coming soon!",
    //   features: [
    //     "Everything in Basic Care",
    //     "Bi-weekly performance optimization", // Need to learn this first
    //     "Advanced SEO improvements", // Need to learn SEO properly
    //     "Content updates (3 hours/month)", // More realistic time
    //     "Monthly strategy consultation", // When I have more experience
    //     "Priority support (24h response)"
    //   ]
    // },
    {
      id: "growth", 
      name: "Coming Soon",
      price: "TBD",
      period: "",
      icon: <TrendingUp className="h-6 w-6" />,
      description: "More advanced packages coming as I gain experience and build systems",
      features: [
        "Will include automated backups",
        "Security update management", 
        "Advanced SEO monitoring",
        "Performance optimization",
        "Priority support",
        "More content update hours"
      ]
    },
    // TODO: Way too advanced for me right now - maybe in a year or two
    // {
    //   id: "enterprise", 
    //   name: "Enterprise Support",
    //   price: "$500",
    //   period: "/month",
    //   icon: <Zap className="h-6 w-6" />,
    //   description: "Maybe someday when I'm a real company!",
    //   features: [
    //     "Everything in Growth Accelerator",
    //     "Weekly performance audits", // Need team for this
    //     "Custom feature development", // Need senior dev skills
    //     "Unlimited content updates", // Can't promise unlimited
    //     "24/7 monitoring & alerts", // Don't have 24/7 capabilities
    //     "Dedicated account manager", // I'm the only person!
    //     "Same-day support response" // Unrealistic for one person
    //   ]
    // }
    {
      id: "enterprise",
      name: "Future Plans",
      price: "N/A",
      period: "",
      icon: <Zap className="h-6 w-6" />,
      description: "Enterprise-level services planned for when the business grows",
      features: [
        "24/7 monitoring (when I have a team)",
        "Custom development (when I'm more skilled)",
        "Dedicated account management",
        "Same-day response times",
        "Weekly audits and reports",
        "This will take time to build!"
      ]
    }
  ]
  
  const oneTimeServices = [
    { service: "Basic Website Review", price: "$150", description: "Simple site check and recommendations" },
    { service: "Performance Report", price: "$100", description: "Site speed analysis and basic recommendations" },
    { service: "Content Updates", price: "$50/hour", description: "Text and image updates (what I can do!)" },
    { service: "Simple Feature Add", price: "Quote", description: "Basic functionality - depending on complexity" },
    { service: "Coming Soon", price: "TBD", description: "More advanced services as I learn new skills" }
  ]
  
  // TODO: Add more services as I learn:
  // - Automated backups setup  
  // - Security implementations
  // - Advanced SEO optimization
  // - Performance optimization
  
  const performanceMetrics = [
    {
      metric: "Page Load Speed",
      before: "3.2s",
      after: "2.1s", // More realistic improvement I can achieve
      improvement: "34% faster"
    },
    {
      metric: "Basic SEO Check",
      before: "Basic setup",
      after: "Improved", // Can't promise specific scores yet
      improvement: "Better structure"
    },
    {
      metric: "Site Monitoring",
      before: "No monitoring",
      after: "Monthly checks", // What I can actually do
      improvement: "Peace of mind"
    }
  ]
  
  const selectedMaintenance = maintenancePackages.find(pkg => pkg.id === selectedPackage)

  return (
    <section id="site-tlc" className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Basic Website <span className="text-primary">Care & Monitoring</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Simple, honest website maintenance for small businesses. I'm new to this, so I'm starting with basic services I can actually deliver while I learn more advanced techniques.
          </p>
        </div>
        
        {/* Monthly Maintenance Packages */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-foreground text-center mb-8">
            Simple Care Options (Growing as I Learn!)
          </h3>
          
          <div className="flex justify-center mb-8">
            <div className="inline-flex bg-muted rounded-xl p-1">
              {maintenancePackages.map((pkg) => (
                <button
                  key={pkg.id}
                  onClick={() => setSelectedPackage(pkg.id)}
                  className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedPackage === pkg.id
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {pkg.name}
                  {pkg.popular && (
                    <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                      Popular
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
          
          {selectedMaintenance && (
            <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  {selectedMaintenance.icon}
                  <h4 className="text-xl font-semibold text-foreground">
                    {selectedMaintenance.name}
                  </h4>
                </div>
                
                <p className="text-muted-foreground">
                  {selectedMaintenance.description}
                </p>
                
                <div className="space-y-3">
                  {selectedMaintenance.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className={`bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-6 border-2 ${
                selectedMaintenance.popular ? 'border-primary' : 'border-border'
              } relative`}>
                {selectedMaintenance.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground text-sm font-medium px-3 py-1 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-6">
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-bold text-primary">{selectedMaintenance.price}</span>
                    <span className="text-muted-foreground ml-1">{selectedMaintenance.period}</span>
                  </div>
                  <p className="text-muted-foreground text-sm mt-2">
                    Cancel anytime • No setup fees
                  </p>
                </div>
                
                <Button asChild size="lg" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                  <Link href="/contact">Protect Your Investment</Link>
                </Button>
              </div>
            </div>
          )}
        </div>
        
        {/* Before/After Performance Improvements */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-foreground text-center mb-8">
            Before/After Performance Improvements
          </h3>
          
          <div className="grid md:grid-cols-3 gap-6">
            {performanceMetrics.map((metric, index) => (
              <div key={index} className="bg-background border border-border rounded-xl p-6 text-center">
                <h4 className="font-semibold text-foreground mb-4">{metric.metric}</h4>
                
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Before</div>
                    <div className="text-2xl font-bold text-red-600">{metric.before}</div>
                  </div>
                  
                  <div className="text-2xl text-muted-foreground">→</div>
                  
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">After</div>
                    <div className="text-2xl font-bold text-green-600">{metric.after}</div>
                  </div>
                  
                  <div className="bg-green-50 border border-green-200 rounded-lg p-2">
                    <div className="text-sm font-medium text-green-700">{metric.improvement}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* One-Time Services */}
        <div className="grid lg:grid-cols-2 gap-12">
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-foreground">
              One-Time Services
            </h3>
            <p className="text-muted-foreground">
              Need specific improvements without ongoing commitment? Choose from our one-time services to address immediate needs.
            </p>
            
            <div className="space-y-4">
              {oneTimeServices.map((service, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <div className="font-medium text-foreground">{service.service}</div>
                    <div className="text-sm text-muted-foreground">{service.description}</div>
                  </div>
                  <div className="text-lg font-bold text-primary">{service.price}</div>
                </div>
              ))}
            </div>
            
            <Button asChild size="lg" variant="outline">
              <Link href="/contact">Get Custom Quote</Link>
            </Button>
          </div>
          
          <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl p-8 border border-border">
            <h4 className="text-xl font-semibold text-foreground text-center mb-6">
              Why Choose My Basic Care?
            </h4>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium text-foreground">You Own Everything</div>
                  <div className="text-sm text-muted-foreground">Complete code ownership, no platform lock-in</div>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium text-foreground">Honest Pricing</div>
                  <div className="text-sm text-muted-foreground">No hidden fees - I tell you exactly what I can do</div>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium text-foreground">Personal Service</div>
                  <div className="text-sm text-muted-foreground">You work directly with me - no big agency overhead</div>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium text-foreground">Growing With You</div>
                  <div className="text-sm text-muted-foreground">As I learn more, you'll get better services</div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-background rounded-lg border border-border">
              <div className="text-center">
                <div className="text-sm text-muted-foreground mb-1">Honest pricing - starting at</div>
                <div className="text-2xl font-bold text-primary">$75/month</div>
                <div className="text-xs text-muted-foreground">Simple care while I learn more advanced services</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}