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
  Users
} from "lucide-react"

interface ServiceCardProps {
  service: Service
  onPurchase: (service: Service) => void
}

export function ServiceCard({ service, onPurchase }: ServiceCardProps) {
  const pricing = calculateServicePrice(service)
  const timeRemaining = pricing.saleEndDate ? getTimeUntilSaleEnds(pricing.saleEndDate) : null

  const getServiceIcon = (type: string) => {
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

  return (
    <Card className={`
      text-center transition-all duration-300 hover:shadow-xl hover:scale-105 h-full flex flex-col
      ${isPremium ? 'ring-2 ring-accent relative' : ''}
      ${isFree ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200' : ''}
    `}>
      {isPremium && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-gradient-to-r from-accent to-primary text-white px-4 py-1">
            Most Popular
          </Badge>
        </div>
      )}
      
      <CardHeader className="pb-4">
        <div className="flex flex-col items-center">
          {/* Service Icon */}
          <div className={`
            mb-4 p-3 rounded-full 
            ${isFree ? 'bg-green-100' : 'bg-primary/10'}
          `}>
            {getServiceIcon(service.service_type)}
          </div>
          
          {/* Service Type Badge */}
          <Badge className={`mb-3 ${getServiceTypeColor(service.service_type)}`}>
            {getServiceTypeLabel(service.service_type)}
          </Badge>

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
                <div className={`text-3xl font-bold ${isFree ? 'text-green-600' : 'text-primary'}`}>
                  {formatPrice(pricing.finalPrice)}
                </div>
                <Badge className={getDiscountBadgeColor(pricing.discountType)}>
                  {formatDiscount(pricing)}
                </Badge>
              </div>
            ) : (
              <div className={`text-3xl font-bold ${isFree ? 'text-green-600' : 'text-primary'}`}>
                {isFree ? 'FREE' : formatPrice(service.price)}
              </div>
            )}
          </div>

          {/* Duration */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{service.duration_estimate}</span>
          </div>
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
        
        {/* Description */}
        <p className="text-sm text-muted-foreground mb-6 flex-grow">
          {service.description}
        </p>
        
        {/* Features */}
        {service.features.length > 0 && (
          <div className="mb-6">
            <ul className="space-y-3">
              {service.features.slice(0, 6).map((feature, index) => (
                <li key={index} className="flex items-center gap-3 text-sm">
                  <Zap className="h-4 w-4 text-accent flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
              {service.features.length > 6 && (
                <li className="text-xs text-muted-foreground">
                  +{service.features.length - 6} more features...
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
          {isFree && (
            <p className="text-xs text-muted-foreground mt-2">
              No obligation • 30 minutes
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}