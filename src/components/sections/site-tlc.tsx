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
      name: "Essential Care",
      price: "$150",
      period: "/month",
      icon: <Shield className="h-6 w-6" />,
      description: "Perfect for small business websites that need regular maintenance",
      features: [
        "Weekly security updates",
        "Daily automated backups",
        "Monthly performance reports",
        "Content updates (2 hours/month)",
        "Plugin/dependency updates",
        "Basic SEO monitoring",
        "Email support (24h response)"
      ],
      popular: true
    },
    {
      id: "growth",
      name: "Growth Accelerator",
      price: "$250",
      period: "/month",
      icon: <TrendingUp className="h-6 w-6" />,
      description: "For growing businesses that need active optimization and improvements",
      features: [
        "Everything in Essential Care",
        "Bi-weekly performance optimization",
        "Advanced SEO improvements",
        "Content updates (5 hours/month)",
        "Conversion rate optimization",
        "Monthly strategy consultation",
        "Priority support (4h response)"
      ]
    },
    {
      id: "enterprise",
      name: "Enterprise Support",
      price: "$500",
      period: "/month",
      icon: <Zap className="h-6 w-6" />,
      description: "Comprehensive support for high-traffic websites and complex needs",
      features: [
        "Everything in Growth Accelerator",
        "Weekly performance audits",
        "Custom feature development",
        "Unlimited content updates",
        "24/7 monitoring & alerts",
        "Dedicated account manager",
        "Same-day support response"
      ]
    }
  ]
  
  const oneTimeServices = [
    { service: "Website Audit", price: "$350", description: "Comprehensive site analysis" },
    { service: "SEO Optimization", price: "$600", description: "Full SEO setup and optimization" },
    { service: "Performance Boost", price: "$400", description: "Speed and performance improvements" },
    { service: "Security Hardening", price: "$300", description: "Advanced security implementation" },
    { service: "Content Migration", price: "$250", description: "Move content from old site" },
    { service: "Custom Feature", price: "Quote", description: "New functionality development" }
  ]
  
  const performanceMetrics = [
    {
      metric: "Page Load Speed",
      before: "4.2s",
      after: "0.9s",
      improvement: "78% faster"
    },
    {
      metric: "SEO Score",
      before: "72/100",
      after: "94/100",
      improvement: "+22 points"
    },
    {
      metric: "Uptime",
      before: "97.2%",
      after: "99.9%",
      improvement: "+2.7%"
    }
  ]
  
  const selectedMaintenance = maintenancePackages.find(pkg => pkg.id === selectedPackage)

  return (
    <section id="site-tlc" className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Website Maintenance & <span className="text-primary">Optimization Services</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Keep your website running perfectly with our comprehensive maintenance packages. Choose monthly care or one-time services as needed.
          </p>
        </div>
        
        {/* Monthly Maintenance Packages */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-foreground text-center mb-8">
            Monthly Maintenance Packages
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
              Why Choose Our Maintenance?
            </h4>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium text-foreground">No Platform Lock-in</div>
                  <div className="text-sm text-muted-foreground">You own your website completely</div>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium text-foreground">Transparent Pricing</div>
                  <div className="text-sm text-muted-foreground">No hidden fees or surprise charges</div>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium text-foreground">Expert Team</div>
                  <div className="text-sm text-muted-foreground">Same developers who built your site</div>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium text-foreground">Modern Technology</div>
                  <div className="text-sm text-muted-foreground">Always up-to-date with latest standards</div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-background rounded-lg border border-border">
              <div className="text-center">
                <div className="text-sm text-muted-foreground mb-1">Starting at just</div>
                <div className="text-2xl font-bold text-primary">$150/month</div>
                <div className="text-xs text-muted-foreground">vs $200-500/month on other platforms</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}