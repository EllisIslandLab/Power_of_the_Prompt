"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, ExternalLink, Eye, Clock, ArrowLeft } from "lucide-react"

// Portfolio items from the original portfolio.tsx
const portfolioItems = [
  {
    id: 1,
    title: "Simple Portfolio Site",
    siteName: "Portfolio",
    price: "$399",
    description: "Clean, professional portfolio for service providers",
    technologies: ["Next.js", "Tailwind CSS", "Contact Forms"],
    features: [
      "Responsive design",
      "Contact form integration", 
      "SEO optimized",
      "Fast loading times"
    ],
    category: "Portfolio",
    examples: "Service providers, consultants, freelancers"
  },
  {
    id: 2,
    title: "E-commerce Site",
    siteName: "mechescreations.com", 
    price: "$1,499",
    description: "Full shopping cart with Stripe payments and inventory management",
    technologies: ["Next.js", "Airtable", "Stripe Integration"],
    features: [
      "Shopping cart functionality",
      "Stripe payment processing",
      "Inventory management", 
      "Order tracking"
    ],
    category: "E-commerce",
    examples: "Product sellers, online retailers"
  },
  {
    id: 3,
    title: "Behavioral Therapy Site",
    siteName: "Healthcare",
    price: "$899", 
    description: "HIPAA-compliant booking system with client portal",
    technologies: ["Appointment Scheduling", "Secure Forms", "Client Management"],
    features: [
      "HIPAA-compliant forms",
      "Appointment booking",
      "Client portal access",
      "Secure data handling"
    ],
    category: "Healthcare", 
    examples: "Therapists, medical practices, wellness providers"
  },
  {
    id: 4,
    title: "Financial Coaching Site",
    siteName: "Business",
    price: "$899",
    description: "Lead generation with automated email sequences", 
    technologies: ["CRM Integration", "Email Automation", "Analytics"],
    features: [
      "Lead capture forms",
      "Email automation",
      "Analytics dashboard",
      "CRM integration"
    ],
    category: "Business",
    examples: "Coaches, consultants, professional services"
  },
  {
    id: 5,
    title: "Church/Non-Profit Site", 
    siteName: "Non-profit",
    price: "$899",
    description: "Donation processing with event management",
    technologies: ["Payment Processing", "Event Calendar", "Member Portal"],
    features: [
      "Donation processing",
      "Event calendar", 
      "Member portal",
      "Volunteer management"
    ],
    category: "Non-profit",
    examples: "Churches, nonprofits, community organizations"
  }
]

// Add-on services
const addOnServices = [
  { name: "Blog setup", price: 199 },
  { name: "Advanced SEO", price: 299 },
  { name: "Social media integration", price: 149 },
  { name: "Analytics setup", price: 99 },
  { name: "Extended support (6 months)", price: 199 },
  { name: "CRM integration", price: 299 },
  { name: "Payment processing", price: 399 },
  { name: "Client portal", price: 499 },
  { name: "Email marketing setup", price: 249 },
  { name: "Custom integrations", price: 399 }
]

export default function WebsiteBuildingPage() {
  const [selectedItem, setSelectedItem] = useState<number | null>(null)
  const [selectedAddOns, setSelectedAddOns] = useState<number[]>([])

  const toggleAddOn = (index: number) => {
    setSelectedAddOns(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    )
  }

  const calculateTotal = (basePrice: string) => {
    const base = parseInt(basePrice.replace('$', '').replace(',', ''))
    const addOnTotal = selectedAddOns.reduce((sum, index) => sum + addOnServices[index].price, 0)
    return base + addOnTotal
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-12 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-7xl">
        
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Link>
            </Button>
          </div>
          
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
              Professional Website <span className="text-primary">Building Services</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Let us build your professional website while you focus on your business. 
              Complete ownership, modern technology, delivered in 2-3 weeks.
            </p>
          </div>
        </div>

        {/* Portfolio Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {portfolioItems.map((item) => (
            <Card 
              key={item.id}
              className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer"
              onClick={() => setSelectedItem(item.id)}
            >
              <div className="px-6 py-4 border-b bg-primary rounded-t-xl">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-primary-foreground">
                    {item.category}
                  </span>
                  <span className="text-sm font-semibold px-3 py-1 rounded-full bg-accent text-accent-foreground">
                    {item.price}
                  </span>
                </div>
              </div>
              
              <CardContent className="p-6">
                <div className="aspect-video bg-muted rounded-lg mb-4 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Clock className="h-8 w-8 text-primary" />
                    </div>
                    <p className="text-sm font-medium text-foreground">{item.title}</p>
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{item.description}</p>
                
                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Perfect for:</h4>
                    <p className="text-xs text-muted-foreground">{item.examples}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Key Features:</h4>
                    <ul className="space-y-1">
                      {item.features.slice(0, 3).map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-xs text-muted-foreground">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <Button 
                  className="w-full mt-4" 
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedItem(item.id)
                  }}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Add-on Services */}
        <div className="bg-card rounded-2xl border border-border p-8 mb-16">
          <h2 className="text-3xl font-bold text-foreground text-center mb-8">
            Customize Your Website
          </h2>
          <p className="text-muted-foreground text-center mb-8">
            Enhance any website package with these professional add-ons
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {addOnServices.map((service, index) => (
              <label key={index} className="flex items-center gap-3 cursor-pointer p-4 rounded-lg border hover:bg-muted transition-colors">
                <input
                  type="checkbox"
                  checked={selectedAddOns.includes(index)}
                  onChange={() => toggleAddOn(index)}
                  className="rounded"
                />
                <span className="flex-1 text-sm font-medium">{service.name}</span>
                <span className="font-bold text-primary">+${service.price}</span>
              </label>
            ))}
          </div>
          
          {selectedAddOns.length > 0 && (
            <div className="bg-primary/5 rounded-lg p-6 text-center">
              <h3 className="text-lg font-semibold mb-2">Selected Add-ons Total</h3>
              <p className="text-2xl font-bold text-primary">
                +${selectedAddOns.reduce((sum, index) => sum + addOnServices[index].price, 0)}
              </p>
            </div>
          )}
        </div>

        {/* Why Choose Us */}
        <div className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-2xl border border-border p-8 mb-16">
          <h2 className="text-3xl font-bold text-foreground text-center mb-8">
            Why Choose Our Website Building Service?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Complete Ownership</h3>
              <p className="text-muted-foreground">You own your code, design, and data. No monthly fees, no platform lock-in.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Fast Delivery</h3>
              <p className="text-muted-foreground">Professional websites delivered in 2-3 weeks, not months.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <ExternalLink className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Modern Technology</h3>
              <p className="text-muted-foreground">Built with the same tech stack used by Fortune 500 companies.</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <div className="bg-card rounded-lg shadow-lg p-8 border max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold mb-4">Ready to Get Your Website Built?</h3>
            <p className="text-muted-foreground mb-6">
              Every website comes with complete ownership and our satisfaction guarantee. 
              Let's discuss your specific needs and create the perfect solution for your business.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/consultation">
                  Get Free Consultation
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/#site-samples">
                  View Live Examples
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Detail Modal */}
        {selectedItem && (
          <div 
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedItem(null)}
          >
            <div 
              className="bg-background rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    {(() => {
                      const item = portfolioItems.find(item => item.id === selectedItem)
                      return item ? (
                        <>
                          <h3 className="text-2xl font-bold">{item.title}</h3>
                          <Badge variant="secondary" className="mt-2">{item.category}</Badge>
                          <div className="text-3xl font-bold text-primary mt-2">{item.price}</div>
                          {selectedAddOns.length > 0 && (
                            <div className="text-lg text-muted-foreground">
                              Total with add-ons: ${calculateTotal(item.price).toLocaleString()}
                            </div>
                          )}
                        </>
                      ) : null
                    })()}
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setSelectedItem(null)}
                  >
                    ✕
                  </Button>
                </div>
                
                {(() => {
                  const item = portfolioItems.find(item => item.id === selectedItem)
                  return item ? (
                    <>
                      <p className="text-muted-foreground mb-6">{item.description}</p>
                      
                      <div className="grid md:grid-cols-2 gap-6 mb-6">
                        <div>
                          <h4 className="font-semibold mb-3">Technologies Used:</h4>
                          <div className="flex flex-wrap gap-2">
                            {item.technologies.map((tech, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {tech}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold mb-3">Key Features:</h4>
                          <ul className="space-y-2">
                            {item.features.map((feature, idx) => (
                              <li key={idx} className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                <span className="text-sm">{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      
                      <div className="mb-6">
                        <h4 className="font-semibold mb-3">Perfect for:</h4>
                        <p className="text-muted-foreground">{item.examples}</p>
                      </div>
                      
                      <div className="flex gap-4">
                        <Button className="flex-1" asChild>
                          <Link href="/consultation">
                            Get This Website
                          </Link>
                        </Button>
                        <Button variant="outline" className="flex-1" asChild>
                          <Link href="/#site-samples">
                            View Live Examples
                          </Link>
                        </Button>
                      </div>
                    </>
                  ) : null
                })()}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}