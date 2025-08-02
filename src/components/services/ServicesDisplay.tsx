"use client"

import { useState, useEffect } from "react"
import { Service, ServicesResponse } from "@/types/services"
import { ServiceCard } from "@/components/services/ServiceCard"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

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
        {services.map((service) => (
          <ServiceCard 
            key={service.id} 
            service={service} 
            onPurchase={handlePurchase}
          />
        ))}
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