"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Eye, Clock } from "lucide-react"

// Define the portfolio item type
type PortfolioItem = {
  id: string | number
  title: string
  siteName: string
  price: string
  description: string
  technologies: string[]
  features: string[]
  imageUrl: string
  demoUrl: string
  backupUrls: string[]
  category: string
}

// Fallback data in case Airtable is unavailable
const fallbackPortfolioItems: PortfolioItem[] = [
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
    imageUrl: "/api/placeholder/600/400",
    demoUrl: "#",
    backupUrls: [],
    category: "Portfolio"
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
    imageUrl: "/api/placeholder/600/400",
    demoUrl: "https://www.mechescreations.com",
    backupUrls: [],
    category: "E-commerce"
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
    imageUrl: "/api/placeholder/600/400",
    demoUrl: "#",
    backupUrls: [],
    category: "Healthcare"
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
    imageUrl: "/api/placeholder/600/400",
    demoUrl: "#",
    backupUrls: [],
    category: "Business"
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
    imageUrl: "/api/placeholder/600/400",
    demoUrl: "#",
    backupUrls: [],
    category: "Non-profit"
  }
]

export function Portfolio() {
  const [selectedItem, setSelectedItem] = useState<string | number | null>(null)
  const [urlErrors, setUrlErrors] = useState<Record<string | number, number>>({}) // Track failed URL attempts
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>(fallbackPortfolioItems)
  const [loading, setLoading] = useState(true)
  const [hoveredItem, setHoveredItem] = useState<string | number | null>(null)

  // Fetch portfolio items from Airtable
  useEffect(() => {
    const fetchPortfolioItems = async () => {
      try {
        const response = await fetch('/api/portfolio')
        if (response.ok) {
          const result = await response.json()
          if (result.success && result.data.length > 0) {
            // Combine Airtable data with fallback data, prioritizing Airtable data
            const combinedItems = [...result.data, ...fallbackPortfolioItems]
            // Remove duplicates by checking title and siteName (better than ID since IDs are different types)
            const uniqueItems = combinedItems.filter((item, index, arr) => 
              arr.findIndex(i => i.title === item.title && i.siteName === item.siteName) === index
            )
            setPortfolioItems(uniqueItems)
          }
        }
      } catch (error) {
        console.error('Failed to fetch portfolio items:', error)
        // Keep fallback data
      } finally {
        setLoading(false)
      }
    }

    fetchPortfolioItems()
  }, [])

  const getWorkingUrl = (item: PortfolioItem) => {
    const errorCount = urlErrors[item.id] || 0
    const allUrls = [item.demoUrl, ...item.backupUrls]
    
    // If we've tried all URLs, return the original or '#'
    if (errorCount >= allUrls.length) return item.demoUrl
    
    return allUrls[errorCount] || item.demoUrl
  }

  const handleIframeError = (itemId: string | number) => {
    setUrlErrors(prev => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1
    }))
  }

  return (
    <section id="portfolio" className="py-20 px-4 sm:px-6 lg:px-8" style={{
      background: 'linear-gradient(135deg, #b9ddff 0%, #72bbff 50%, #00509d 100%)'
    }}>
      <div className="container mx-auto max-w-7xl" style={{
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '2rem',
        boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.2)',
        padding: '3rem'
      }}>
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-primary mb-6">
            Website Portfolio
          </h2>
          <p className="text-xl text-gray-900 max-w-3xl mx-auto">
            Here are business owners we've helped create their websites. The best part? They actually <strong>OWN</strong> their sites - no monthly fees, no hidden upsells, no platform lock-in.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
            <p className="text-primary mt-2 font-medium">Loading portfolio items...</p>
          </div>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
          {portfolioItems.map((item) => {
            const workingUrl = getWorkingUrl(item)
            const isHovered = hoveredItem === item.id
            
            return (
              <Card 
                key={item.id}
                className="overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2 shadow-xl rounded-2xl group"
                onClick={() => setSelectedItem(item.id)}
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                  {/* Card Header */}
                  <div className="px-6 py-4 border-b bg-primary rounded-t-xl">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-primary-foreground truncate">
                        {item.category || 'Website'}
                      </span>
                      <span className="text-sm font-semibold px-3 py-1 rounded-full bg-accent text-accent-foreground">
                        {item.price}
                      </span>
                    </div>
                  </div>
                  
                  {/* Card Content with Margin */}
                  <div className="p-6">
                    <div className="aspect-video bg-muted rounded-lg overflow-hidden mb-6 border relative">
                      {workingUrl !== "#" ? (
                        <div className="w-full h-full relative overflow-hidden">
                          <iframe
                            src={workingUrl}
                            className="w-full h-full border-0 pointer-events-none transform scale-100"
                            title={`Preview of ${item.title}`}
                            loading="lazy"
                            onError={() => handleIframeError(item.id)}
                          />
                          {/* Subtle Gradient Overlay with Fade-in Buttons */}
                          <div className="absolute inset-0 transition-all duration-500 ease-in-out" style={{
                            background: isHovered 
                              ? 'linear-gradient(135deg, rgba(30, 64, 175, 0.2) 0%, rgba(30, 64, 175, 0.4) 50%, rgba(30, 64, 175, 0.6) 100%)'
                              : 'transparent',
                            backdropFilter: isHovered ? 'blur(1px)' : 'blur(0px)'
                          }}>
                            <div className={`absolute bottom-4 left-4 right-4 flex justify-center space-x-3 transition-all duration-700 ease-out transform ${
                              isHovered 
                                ? 'opacity-100 translate-y-0 scale-100' 
                                : 'opacity-0 translate-y-4 scale-95'
                            }`}>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="bg-card/90 backdrop-blur-sm font-medium border"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setSelectedItem(item.id)
                                }}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </Button>
                              <Button size="sm" className="bg-primary text-primary-foreground font-medium" asChild>
                                <a 
                                  href={workingUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <ExternalLink className="h-4 w-4 mr-2" />
                                  Live Demo
                                </a>
                              </Button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="w-full h-full relative">
                          <div className="w-full h-full flex items-center justify-center bg-secondary">
                            <div className="text-center">
                              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-2 bg-accent">
                                <Clock className="h-8 w-8 text-accent-foreground" />
                              </div>
                              <p className="text-sm font-bold text-foreground">Coming Soon</p>
                              <p className="text-xs text-muted-foreground">Portfolio Example</p>
                            </div>
                          </div>
                          {/* Overlay for Coming Soon */}
                          <div className={`absolute inset-0 transition-all duration-500 ease-in-out ${
                            isHovered ? 'bg-black/20 backdrop-blur-sm' : 'bg-transparent'
                          }`}>
                            <div className={`absolute bottom-4 left-4 right-4 flex justify-center transition-all duration-700 ease-out transform ${
                              isHovered 
                                ? 'opacity-100 translate-y-0 scale-100' 
                                : 'opacity-0 translate-y-4 scale-95'
                            }`}>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="bg-card/90 backdrop-blur-sm font-medium border"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setSelectedItem(item.id)
                                }}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className={`transition-all duration-500 ease-in-out overflow-hidden ${
                      hoveredItem === item.id ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                    }`}>
                      <CardHeader className="pb-3">
                        <div>
                          <CardTitle className="text-xl font-bold text-card-foreground mb-2">{item.title}</CardTitle>
                          <CardDescription className="text-sm text-muted-foreground font-medium">{item.description}</CardDescription>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="pt-0 pb-6">
                        <div className="space-y-4">
                          <div>
                            <h4 className="text-sm font-bold mb-3 text-card-foreground">Key Features:</h4>
                            <ul className="text-sm text-muted-foreground space-y-2">
                              {item.features.slice(0, 3).map((feature) => (
                                <li key={feature} className="flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full" style={{
                                    background: 'linear-gradient(135deg, #ffdb57 0%, #ffcb05 100%)',
                                    boxShadow: '0 1px 3px rgba(255, 219, 87, 0.4)'
                                  }} />
                                  {feature}
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          <div>
                            <h4 className="text-sm font-bold mb-3 text-card-foreground">Technologies Used:</h4>
                            <div className="flex flex-wrap gap-2">
                              {item.technologies.map((tech) => (
                                <Badge key={tech} className="text-xs font-medium" style={{
                                  background: 'linear-gradient(135deg, #11296b 0%, #0d2055 100%)',
                                  color: 'white',
                                  border: '1px solid #ffdb57',
                                  borderRadius: '0.5rem'
                                }}>
                                  {tech}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </div>
                  </div>
                </Card>
            )
          })}
        </div>
        )}

        {/* Modal for detailed view */}
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
                    <h3 className="text-2xl font-bold">
                      {portfolioItems.find(item => item.id === selectedItem)?.title}
                    </h3>
                    <Badge variant="secondary" className="mt-2">
                      {portfolioItems.find(item => item.id === selectedItem)?.category}
                    </Badge>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setSelectedItem(null)}
                  >
                    ✕
                  </Button>
                </div>
                
                <div className="aspect-video bg-muted rounded-lg mb-6 overflow-hidden">
                  {(() => {
                    const currentItem = portfolioItems.find(item => item.id === selectedItem)
                    const workingUrl = currentItem ? getWorkingUrl(currentItem) : "#"
                    
                    return workingUrl !== "#" ? (
                      <iframe
                        src={workingUrl}
                        className="w-full h-full border-0"
                        title={`Preview of ${currentItem?.title}`}
                        loading="lazy"
                        onError={() => currentItem && handleIframeError(currentItem.id)}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                        <div className="text-center">
                          <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Clock className="h-10 w-10 text-orange-500" />
                          </div>
                          <p className="text-xl font-bold text-foreground mb-2">Coming Soon</p>
                          <p className="text-lg font-medium">
                            {currentItem?.title}
                          </p>
                          <p className="text-muted-foreground">
                            {currentItem?.description}
                          </p>
                        </div>
                      </div>
                    )
                  })()}
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Technologies Used:</h4>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {portfolioItems.find(item => item.id === selectedItem)?.technologies.map((tech) => (
                        <Badge key={tech} variant="outline" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-3">Key Features:</h4>
                    <ul className="space-y-2">
                      {portfolioItems.find(item => item.id === selectedItem)?.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-accent rounded-full" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <div className="flex gap-4 mt-6">
                  {(() => {
                    const currentItem = portfolioItems.find(item => item.id === selectedItem)
                    const workingUrl = currentItem ? getWorkingUrl(currentItem) : "#"
                    
                    return (
                      <Button className="flex-1" asChild>
                        <a 
                          href={workingUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Visit Live Site
                        </a>
                      </Button>
                    )
                  })()}
                  <Button variant="outline" className="flex-1" asChild>
                    <Link href="/consultation">
                      Get Similar Website
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="text-center mt-12">
          <Button asChild size="lg">
            <Link href="/consultation">
              Start Building Your Website Today
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}