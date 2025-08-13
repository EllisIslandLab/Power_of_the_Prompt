"use client"

import { useState, useEffect } from "react"
import { Service, ServicesResponse } from "@/types/services"
import { ServiceCard } from "@/components/services/ServiceCard"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

// Fallback services data for when Airtable is unavailable
const fallbackServices: Service[] = [
  {
    id: "fallback-consultation",
    service_name: "Free Consultation",
    service_type: "consultation",
    price: 0,
    description: "30-minute strategy session to assess your website needs and provide custom recommendations",
    duration_estimate: "30 minutes",
    is_active: true,
    stripe_price_id: "",
    stripe_product_id: "",
    features: [
      "Website needs assessment",
      "Technology recommendations", 
      "Custom roadmap",
      "Course curriculum overview",
      "No obligation",
      "FREE"
    ],
    category: "Free Consultation",
    order: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "fallback-foundation-course",
    service_name: "Website Builders Manual",
    service_type: "course",
    price: 999,
    sale_price: 799,
    discount_amount: 200,
    description: "Complete roadmap for building your own website with all course materials, recordings, and templates included",
    duration_estimate: "4 weeks",
    is_active: true,
    stripe_price_id: "",
    stripe_product_id: "",
    features: [
      "Course curriculum overview",
      "Complete textbook",
      "50% discount 1-on1 sessions",
      "Community access",
      "Templates included",
      "Two 1-on-1 sessions included (1 hour)",
      "Price conversion to Team Walkthrough",
      "Recordings included",
      "Own your own code"
    ],
    category: "Courses",
    order: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "fallback-team-walkthrough",
    service_name: "Website Team Walkthrough",
    service_type: "course", 
    price: 2299,
    sale_price: 2099,
    discount_amount: 200,
    description: "Guaranteed fully functional website with personal coaching every step of the way",
    duration_estimate: "4 weeks",
    is_active: true,
    stripe_price_id: "",
    stripe_product_id: "",
    features: [
      "Everything in Builders Manual",
      "Nine 1-on1 sessions included (1 hour)",
      "60-day post-course support",
      "Priority 1-on-1 scheduling",
      "Extra monitor, premium AI and color palette tools covered ($50 value)",
      "Difficulty: Moderate",
      "Working website guarantee OR 100% money back"
    ],
    category: "Courses",
    order: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "fallback-portfolio-site",
    service_name: "Portfolio Site",
    service_type: "build",
    price: 499,
    description: "Your foundational site built for you. Custom design with cutting-edge technology",
    duration_estimate: "1 week",
    is_active: true,
    stripe_price_id: "",
    stripe_product_id: "",
    features: [
      "Time saver",
      "Own your own code",
      "Custom design",
      "Coding best practices",
      "Built on reliable services",
      "SEO best practices",
      "Cutting edge technology"
    ],
    category: "Build For Me",
    subcategory: "Simple Portfolio",
    order: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "fallback-hipaa-site",
    service_name: "HIPAA Compliant Site",
    service_type: "build",
    price: 899,
    description: "HIPAA compliant site for healthcare providers with secure forms and welcoming design",
    duration_estimate: "1 week",
    is_active: true,
    stripe_price_id: "",
    stripe_product_id: "",
    features: [
      "Time saver",
      "Own your own code", 
      "Custom design",
      "Coding best practices",
      "Built on reliable services",
      "SEO best practices",
      "Cutting edge technology",
      "HIPAA Compliant",
      "Data collection forms"
    ],
    category: "Build For Me",
    subcategory: "Enterprise Solution", 
    order: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "fallback-ecommerce-store",
    service_name: "E-commerce Store",
    service_type: "build",
    price: 1499,
    description: "Complete online store that you actually OWN - no monthly fees to website hosts!",
    duration_estimate: "2 weeks",
    is_active: true,
    stripe_price_id: "",
    stripe_product_id: "",
    features: [
      "Time saver",
      "Own your own code",
      "Custom design", 
      "Coding best practices",
      "Built on reliable services",
      "SEO best practices",
      "Cutting edge technology",
      "Shopping cart functionality",
      "Payment processing"
    ],
    category: "Build For Me",
    subcategory: "E-commerce Store",
    order: 3,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]

interface ServicesDisplayProps {
  serviceType?: 'course' | 'build' | 'audit' | 'consultation'
  category?: string
  maxItems?: number
  showFilters?: boolean
}

export function ServicesDisplay({ 
  serviceType, 
  category, 
  maxItems, 
  showFilters = false 
}: ServicesDisplayProps) {
  const [services, setServices] = useState<Service[]>(fallbackServices)
  const [loading, setLoading] = useState(true)
  const [selectedType, setSelectedType] = useState<string>(serviceType || 'all')
  const [selectedCategory, setSelectedCategory] = useState<string>(category || 'all')

  useEffect(() => {
    fetchServices()
  }, [selectedType, selectedCategory])

  const fetchServices = async () => {
    try {
      setLoading(true)
      
      const params = new URLSearchParams()
      params.append('active', 'true')
      
      if (selectedType && selectedType !== 'all') {
        params.append('type', selectedType)
      }

      const response = await fetch(`/api/services?${params}`)
      const data: ServicesResponse = await response.json()

      if (data.success && data.data.length > 0) {
        let filteredServices = data.data

        // Filter by category if specified
        if (selectedCategory && selectedCategory !== 'all') {
          filteredServices = filteredServices.filter(
            service => service.category.toLowerCase() === selectedCategory.toLowerCase()
          )
        }

        // Limit results if maxItems is specified
        if (maxItems) {
          filteredServices = filteredServices.slice(0, maxItems)
        }

        setServices(filteredServices)
      } else {
        // Fallback to hardcoded services if Airtable fails or returns no data
        console.log('Using fallback services data')
        setServices(fallbackServices)
      }
    } catch (error) {
      console.log('Airtable fetch failed, using fallback services data')
      setServices(fallbackServices)
    } finally {
      setLoading(false)
    }
  }

  const handlePurchase = (service: Service) => {
    // Redirect to payment page or open payment modal
    window.location.href = `/services/${service.id}/purchase`
  }

  if (loading) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </CardContent>
            <CardFooter>
              <div className="h-10 bg-gray-200 rounded w-full"></div>
            </CardFooter>
          </Card>
        ))}
      </div>
    )
  }


  if (services.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No services available at this time.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      {showFilters && (
        <div className="flex flex-wrap gap-4 p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Type:</label>
            <select 
              value={selectedType} 
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-1 rounded border bg-background"
            >
              <option value="all">All Types</option>
              <option value="course">Courses</option>
              <option value="build">Website Builds</option>
              <option value="audit">Website Audits</option>
              <option value="consultation">Consultations</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Category:</label>
            <select 
              value={selectedCategory} 
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1 rounded border bg-background"
            >
              <option value="all">All Categories</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
              <option value="business">Business</option>
            </select>
          </div>
        </div>
      )}

      {/* Services Grid */}
      <div className={`${
        services.length === 1 ? 'flex justify-center' :
        services.length === 2 ? 'flex justify-center gap-6' :
        'grid md:grid-cols-2 lg:grid-cols-3 gap-6'
      }`}>
        {services.map((service) => (
          <div key={service.id} className={
            services.length === 1 ? 'w-full max-w-2xl' :
            services.length === 2 ? 'w-full max-w-sm' : 
            'w-full'
          }>
            <ServiceCard 
              service={service} 
              onPurchase={handlePurchase}
            />
          </div>
        ))}
      </div>

    </div>
  )
}