"use client"

import { Service } from "@/types/services"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { calculateServicePrice, formatPrice, formatDiscount, getDiscountBadgeColor, getTimeUntilSaleEnds } from "@/lib/pricing"
import { 
  Star, 
  Code, 
  Globe, 
  MessageCircle, 
  CheckCircle, 
  Clock,
  Zap,
  Timer,
  DollarSign,
  Users,
  ShoppingCart,
  Building
} from "lucide-react"

interface ServiceCardProps {
  service: Service
  onPurchase: (service: Service) => void
}

export function ServiceCard({ service, onPurchase }: ServiceCardProps) {
  const pricing = calculateServicePrice(service)
  const timeRemaining = pricing.saleEndDate ? getTimeUntilSaleEnds(pricing.saleEndDate) : null

  const getServiceIcon = (type: string, subcategory?: string) => {
    // First check if there's a subcategory-specific icon
    if (subcategory) {
      switch (subcategory.toLowerCase()) {
        case 'simple portfolio':
          return <Code className="h-8 w-8 text-blue-500" />
        case 'business website':
        case 'business':
          return <Globe className="h-8 w-8 text-green-500" />
        case 'e-commerce store':
        case 'ecommerce':
          return <ShoppingCart className="h-8 w-8 text-purple-500" />
        case 'enterprise solution':
        case 'enterprise':
          return <Building className="h-8 w-8 text-orange-500" />
      }
    }
    
    // Fall back to service type icons
    switch (type) {
      case 'course':
        return <Star className="h-8 w-8" />
      case 'build':
        return <Code className="h-8 w-8" />
      case 'audit':
        return <CheckCircle className="h-8 w-8" />
      case 'consultation':
        return <MessageCircle className="h-8 w-8" />
      default:
        return <Globe className="h-8 w-8" />
    }
  }

  const getServiceTypeColor = (type: string) => {
    switch (type) {
      case 'course':
        return 'bg-blue-100 text-blue-800'
      case 'build':
        return 'bg-purple-100 text-purple-800'
      case 'audit':
        return 'bg-green-100 text-green-800'
      case 'consultation':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getServiceTypeLabel = (type: string) => {
    switch (type) {
      case 'course':
        return 'Course'
      case 'build':
        return 'Website Build'
      case 'audit':
        return 'Website Audit'
      case 'consultation':
        return 'Consultation'
      default:
        return 'Service'
    }
  }

  const isPremium = service.service_name.toLowerCase().includes('team walkthrough') || 
                   service.service_name.toLowerCase().includes('premium')
  const isFree = service.price === 0
  const isFreeConsultation = service.category.toLowerCase() === 'free consultation'

  return (
    <Card className={`
      text-center transition-all duration-300 hover:shadow-xl hover:scale-105 h-full flex flex-col relative overflow-visible
      ${isPremium ? 'ring-2 ring-accent' : ''}
      ${isFreeConsultation ? 'ring-2 ring-accent' : 
        isFree ? 'bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200' : ''}
    `}>
      {isPremium && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-gradient-to-r from-accent to-primary text-white px-4 py-1">
            Guarantee Enabled
          </Badge>
        </div>
      )}
      
      {isFreeConsultation && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-gradient-to-r from-accent to-primary text-white px-4 py-1">
            FREE
          </Badge>
        </div>
      )}

      {/* Savings Badge */}
      {pricing.hasDiscount && pricing.discountAmount && pricing.isOnSale && (
        <div className="absolute top-16 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold z-50 shadow-lg">
          💰 Save ${pricing.discountAmount}
        </div>
      )}
      
      <CardHeader className="pb-4">
        <div className="flex flex-col items-center">
          {/* Service Icon */}
          <div className={`
            mb-4 p-3 rounded-full 
            ${isFreeConsultation ? 'bg-primary/10' : 
              isFree ? 'bg-yellow-100' : 'bg-primary/10'}
          `}>
            {getServiceIcon(service.service_type, service.subcategory)}
          </div>
          
          {/* Service Type Badge */}
          {!isFreeConsultation && (
            <Badge className={`mb-3 ${getServiceTypeColor(service.service_type)}`}>
              {getServiceTypeLabel(service.service_type)}
            </Badge>
          )}

          {/* Service Name */}
          <CardTitle className="text-xl mb-2 min-h-[3rem] flex items-center">
            {service.service_name}
          </CardTitle>
          
          {/* Price */}
          <div className="mb-2">
            {pricing.hasDiscount ? (
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground line-through">
                  {formatPrice(pricing.originalPrice)}
                </div>
                <div className={`text-3xl font-bold ${isFreeConsultation ? 'text-primary' : isFree ? 'text-yellow-600' : 'text-primary'}`}>
                  {formatPrice(pricing.finalPrice)}
                </div>
              </div>
            ) : (
              <div className={`text-3xl font-bold ${isFreeConsultation ? 'text-primary' : isFree ? 'text-yellow-600' : 'text-primary'}`}>
                {isFree ? 'FREE' : formatPrice(service.price)}
              </div>
            )}
          </div>

          {/* Duration */}
          {service.duration_estimate && !isFreeConsultation && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{service.duration_estimate}</span>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="flex-grow flex flex-col">
        {/* Sale Timer */}
        {timeRemaining && pricing.isOnSale && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center justify-center gap-2 text-red-700">
              <Timer className="h-4 w-4" />
              <span className="text-sm font-semibold">Sale ends in {timeRemaining}</span>
            </div>
          </div>
        )}
        
        
        {/* Features */}
        {service.features.length > 0 && (
          <div className="mb-6">
            <ul className={`${isFreeConsultation ? 'grid grid-cols-2 gap-x-4 gap-y-3' : 'space-y-3'}`}>
              {service.features.slice(0, isFreeConsultation ? 4 : 3).map((feature, index) => (
                <li key={index} className="flex items-center gap-3 text-sm">
                  <Zap className="h-4 w-4 text-accent flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
              {service.features.length > (isFreeConsultation ? 4 : 3) && (
                <li className={`flex items-center gap-3 text-sm text-muted-foreground ${isFreeConsultation ? 'col-span-2' : ''}`}>
                  <Zap className="h-4 w-4 text-accent flex-shrink-0" />
                  <span>+{service.features.length - (isFreeConsultation ? 4 : 3)} more features...</span>
                </li>
              )}
            </ul>
          </div>
        )}
        
        {/* CTA Button */}
        <div className="mt-auto">
          <Button 
            onClick={() => onPurchase(service)}
            className="w-full"
            variant={isFree ? "outline" : "default"}
            size="lg"
          >
            {isFree ? "Book Free Consultation" : 
             service.service_type === 'course' ? "Enroll Now" : 
             service.service_type === 'build' ? "Get Started" : 
             "Learn More"}
          </Button>
          
          {/* Additional Info */}
          {service.service_type === 'course' && (
            <p className="text-xs text-muted-foreground mt-2">
              Lifetime access included
            </p>
          )}
          {service.service_type === 'build' && (
            <p className="text-xs text-muted-foreground mt-2">
              You own the code completely
            </p>
          )}
          {isFree && !isFreeConsultation && (
            <p className="text-xs text-muted-foreground mt-2">
              No obligation • 30 minutes
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}