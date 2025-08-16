"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ChevronLeft, ChevronRight, X } from "lucide-react"

export function SiteSamples() {
  // Force deployment refresh
  const [activeCategory, setActiveCategory] = useState("All")
  const [selectedSample, setSelectedSample] = useState<any>(null)
  const [currentIndex, setCurrentIndex] = useState(0)

  const samples = [
    {
      title: "Professional Portfolio",
      description: "Clean, modern portfolio showcasing creative work with smooth animations",
      tech: "Next.js, Framer Motion, Tailwind",
      features: ["Responsive Design", "Contact Forms", "Project Galleries", "SEO Optimized"],
      image: "/api/placeholder/400/300",
      liveUrl: "#",
      category: "Portfolio"
    },
    {
      title: "Creative Agency",
      description: "Bold, interactive portfolio for design agencies and creative professionals",
      tech: "React, GSAP, Styled Components",
      features: ["Interactive Animations", "Team Showcase", "Case Studies", "Client Testimonials"],
      image: "/api/placeholder/400/300",
      liveUrl: "#",
      category: "Portfolio"
    },
    {
      title: "E-commerce Store",
      description: "Full-featured online store with modern checkout and inventory management",
      tech: "Next.js, Stripe, Prisma, PostgreSQL",
      features: ["Shopping Cart", "Payment Processing", "Inventory Management", "Order Tracking"],
      image: "/api/placeholder/400/300",
      liveUrl: "#",
      category: "E-commerce"
    },
    {
      title: "Fashion Boutique",
      description: "Elegant online boutique with advanced filtering and wishlist features",
      tech: "Next.js, Shopify API, Tailwind",
      features: ["Product Filtering", "Wishlist", "Size Guide", "Reviews System"],
      image: "/api/placeholder/400/300",
      liveUrl: "#",
      category: "E-commerce"
    },
    {
      title: "Consulting Firm",
      description: "Professional business website with appointment booking and case studies",
      tech: "Next.js, Calendly API, CMS",
      features: ["Appointment Booking", "Service Pages", "Case Studies", "Contact Forms"],
      image: "/api/placeholder/400/300",
      liveUrl: "#",
      category: "Business Services"
    },
    {
      title: "Law Practice",
      description: "Professional legal website with practice area details and consultation booking",
      tech: "Next.js, TypeScript, Tailwind",
      features: ["Practice Areas", "Attorney Profiles", "Case Results", "Consultation Booking"],
      image: "/api/placeholder/400/300",
      liveUrl: "#",
      category: "Business Services"
    },
    {
      title: "Environmental Charity",
      description: "Impactful non-profit website with donation system and volunteer management",
      tech: "Next.js, PayPal API, Airtable",
      features: ["Donation System", "Volunteer Portal", "Event Calendar", "Impact Tracking"],
      image: "/api/placeholder/400/300",
      liveUrl: "#",
      category: "Non-Profit"
    },
    {
      title: "Animal Rescue",
      description: "Heartwarming rescue website with pet adoption system and success stories",
      tech: "React, Firebase, Tailwind",
      features: ["Pet Adoption", "Success Stories", "Volunteer System", "Donation Tracking"],
      image: "/api/placeholder/400/300",
      liveUrl: "#",
      category: "Non-Profit"
    }
  ]

  const categories = ["All", "Portfolio", "E-commerce", "Business Services", "Non-Profit"]
  
  const filteredSamples = activeCategory === "All" 
    ? samples 
    : samples.filter(sample => sample.category === activeCategory)

  const nextSlide = () => {
    setCurrentIndex((prev) => 
      prev === filteredSamples.length - 1 ? 0 : prev + 1
    )
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => 
      prev === 0 ? filteredSamples.length - 1 : prev - 1
    )
  }

  const getVisibleSamples = () => {
    const samples = []
    for (let i = 0; i < 3; i++) {
      const index = (currentIndex + i) % filteredSamples.length
      samples.push(filteredSamples[index])
    }
    return samples
  }

  return (
    <section id="site-samples" className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Websites We've Helped Our <span className="text-primary">Clients Build</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            See what's possible when you build with modern web technologies and professional development practices.
          </p>
          
          {/* Category Tabs */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex bg-muted rounded-xl p-1">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => {
                    setActiveCategory(category)
                    setCurrentIndex(0)
                  }}
                  className={`px-6 py-3 rounded-lg text-sm font-medium transition-all ${
                    activeCategory === category
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Carousel */}
        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={prevSlide}
              className="p-2 rounded-full bg-background border border-border hover:bg-muted transition-colors"
              disabled={filteredSamples.length <= 3}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="text-sm text-muted-foreground">
              {Math.min(currentIndex + 1, filteredSamples.length)} - {Math.min(currentIndex + 3, filteredSamples.length)} of {filteredSamples.length}
            </div>
            <button
              onClick={nextSlide}
              className="p-2 rounded-full bg-background border border-border hover:bg-muted transition-colors"
              disabled={filteredSamples.length <= 3}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getVisibleSamples().map((sample, index) => (
              <div key={`${sample.title}-${index}`} className="bg-background rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="aspect-video bg-muted/50 relative cursor-pointer" onClick={() => setSelectedSample(sample)}>
                  <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <div className="text-4xl mb-2">🖥️</div>
                      <div className="text-sm">{sample.category} Demo</div>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors flex items-center justify-center">
                    <div className="opacity-0 hover:opacity-100 transition-opacity text-white font-medium">Click to view details</div>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-semibold text-foreground">{sample.title}</h3>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                      {sample.category}
                    </span>
                  </div>
                  
                  <p className="text-muted-foreground mb-4 text-sm leading-relaxed">{sample.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedSample(sample)}
                    >
                      View Details
                    </Button>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={sample.liveUrl}>Live Demo →</Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Modal */}
        {selectedSample && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedSample(null)}>
            <div className="bg-background rounded-2xl border border-border max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-foreground mb-2">{selectedSample.title}</h3>
                    <span className="text-sm bg-primary/10 text-primary px-3 py-1 rounded-full">
                      {selectedSample.category}
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedSample(null)}
                    className="p-2 hover:bg-muted rounded-lg transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                
                <div className="aspect-video bg-muted/50 rounded-xl mb-6 relative">
                  <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <div className="text-6xl mb-4">🖥️</div>
                      <div className="text-lg">{selectedSample.category} Demo</div>
                    </div>
                  </div>
                </div>
                
                <p className="text-muted-foreground mb-6 leading-relaxed">{selectedSample.description}</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h4 className="font-semibold text-foreground mb-3">Key Features</h4>
                    <ul className="space-y-2">
                      {selectedSample.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span className="text-green-500">✓</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-3">Technology Stack</h4>
                    <p className="text-sm text-muted-foreground">{selectedSample.tech}</p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <Button asChild className="flex-1">
                    <Link href={selectedSample.liveUrl}>View Live Site</Link>
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={() => {
                    setSelectedSample(null)
                    document.getElementById('build-with-you')?.scrollIntoView({ behavior: 'smooth' })
                  }}>
                    Build Your Own
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="text-center mt-16">
          <p className="text-muted-foreground mb-6">
            Every site is built with modern, professional web technologies
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm mb-8">
            <span className="bg-background border border-border px-3 py-2 rounded-full">React</span>
            <span className="bg-background border border-border px-3 py-2 rounded-full">Next.js</span>
            <span className="bg-background border border-border px-3 py-2 rounded-full">TypeScript</span>
            <span className="bg-background border border-border px-3 py-2 rounded-full">Tailwind CSS</span>
            <span className="bg-background border border-border px-3 py-2 rounded-full">Vercel</span>
            <span className="bg-background border border-border px-3 py-2 rounded-full">Prisma</span>
          </div>
          
          <Button 
            size="lg" 
            onClick={() => document.getElementById('build-with-you')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            Build Your Own Website
          </Button>
        </div>
      </div>
    </section>
  )
}