"use client"

import { useState, useEffect } from "react"
import { Service, ServicesResponse } from "@/types/services"
import { calculateServicePrice, formatPrice, formatDiscount, getDiscountBadgeColor, getTimeUntilSaleEnds } from "@/lib/pricing"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Zap, Clock, CheckCircle, Star, Timer } from "lucide-react"

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
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
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

      if (data.success) {
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
        setError(data.error || 'Failed to load services')
      }
    } catch (error) {
      setError('Network error loading services')
    } finally {
      setLoading(false)
    }
  }

  const handlePurchase = (service: Service) => {
    // Redirect to payment page or open payment modal
    window.location.href = `/services/${service.id}/purchase`
  }

  const getServiceIcon = (type: string) => {
    switch (type) {
      case 'course':
        return <Star className="h-5 w-5" />
      case 'build':
        return <Zap className="h-5 w-5" />
      case 'audit':
        return <CheckCircle className="h-5 w-5" />
      case 'consultation':
        return <Clock className="h-5 w-5" />
      default:
        return <Zap className="h-5 w-5" />
    }
  }

  const getServiceTypeColor = (type: string) => {
    switch (type) {
      case 'course':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'build':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'audit':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'consultation':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
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

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={fetchServices} variant="outline">
          Try Again
        </Button>
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
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => {
          const pricing = calculateServicePrice(service)
          const timeRemaining = pricing.saleEndDate ? getTimeUntilSaleEnds(pricing.saleEndDate) : null
          
          return (
            <Card key={service.id} className="flex flex-col hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getServiceIcon(service.service_type)}
                    <Badge className={getServiceTypeColor(service.service_type)}>
                      {service.service_type}
                    </Badge>
                  </div>
                  <div className="text-right">
                    {pricing.hasDiscount ? (
                      <div>
                        <div className="text-sm text-muted-foreground line-through">
                          {formatPrice(pricing.originalPrice)}
                        </div>
                        <div className="text-2xl font-bold text-primary">
                          {formatPrice(pricing.finalPrice)}
                        </div>
                        <Badge className={getDiscountBadgeColor(pricing.discountType)}>
                          {formatDiscount(pricing)}
                        </Badge>
                      </div>
                    ) : (
                      <div className="text-2xl font-bold text-primary">
                        {formatPrice(service.price)}
                      </div>
                    )}
                  </div>
                </div>
              <CardTitle className="text-xl">{service.service_name}</CardTitle>
              <CardDescription className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {service.duration_estimate}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="flex-grow">
              {timeRemaining && pricing.isOnSale && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 text-red-700">
                    <Timer className="h-4 w-4" />
                    <span className="text-sm font-semibold">Sale ends in {timeRemaining}</span>
                  </div>
                </div>
              )}
              
              <p className="text-sm text-muted-foreground mb-4">
                {service.description}
              </p>
              
              {service.features.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-2">What's included:</h4>
                  <ul className="space-y-1">
                    {service.features.slice(0, 4).map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                    {service.features.length > 4 && (
                      <li className="text-sm text-muted-foreground">
                        +{service.features.length - 4} more features
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </CardContent>
            
            <CardFooter>
              <Button 
                onClick={() => handlePurchase(service)} 
                className="w-full"
                size="lg"
              >
                Get Started - {formatPrice(pricing.finalPrice)}
              </Button>
            </CardFooter>
          </Card>
          )
        })}
      </div>

      {maxItems && services.length >= maxItems && (
        <div className="text-center">
          <Button variant="outline" onClick={() => window.location.href = '/services'}>
            View All Services
          </Button>
        </div>
      )}
    </div>
  )
}