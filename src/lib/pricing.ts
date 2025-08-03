import { Service } from '@/types/services'

export interface PricingResult {
  originalPrice: number
  finalPrice: number
  discountAmount: number
  discountPercentage: number
  hasDiscount: boolean
  discountType: 'sale' | 'percentage' | 'amount' | 'coupon' | null
  isOnSale: boolean
  saleEndDate?: string
}

export function calculateServicePrice(
  service: Service, 
  couponCode?: string
): PricingResult {
  const originalPrice = service.price
  let finalPrice = originalPrice
  let discountAmount = 0
  let discountType: PricingResult['discountType'] = null
  let isOnSale = false

  // Check for active sale period
  const now = new Date()
  let saleActive = false
  
  if (service.sale_start_date && service.sale_end_date) {
    const saleStart = new Date(service.sale_start_date)
    const saleEnd = new Date(service.sale_end_date)
    saleActive = now >= saleStart && now <= saleEnd
    isOnSale = saleActive
  }

  // Apply sale price if active
  if (service.sale_price && saleActive) {
    finalPrice = service.sale_price
    discountAmount = originalPrice - finalPrice
    discountType = 'sale'
  }
  // Apply percentage discount if no sale price
  else if (service.discount_percentage && saleActive) {
    discountAmount = originalPrice * (service.discount_percentage / 100)
    finalPrice = originalPrice - discountAmount
    discountType = 'percentage'
  }
  // Apply fixed amount discount if no sale price or percentage
  else if (service.discount_amount && saleActive) {
    discountAmount = service.discount_amount
    finalPrice = Math.max(0, originalPrice - discountAmount)
    discountType = 'amount'
  }

  // Apply coupon code if provided and valid
  if (couponCode && service.coupon_code && service.coupon_code === couponCode) {
    // If there's already a discount, the coupon could stack or replace
    // For now, let's have coupons replace other discounts
    if (service.discount_percentage) {
      discountAmount = originalPrice * (service.discount_percentage / 100)
      finalPrice = originalPrice - discountAmount
      discountType = 'coupon'
    } else if (service.discount_amount) {
      discountAmount = service.discount_amount
      finalPrice = Math.max(0, originalPrice - discountAmount)
      discountType = 'coupon'
    }
  }

  // Ensure final price has proper decimal precision
  finalPrice = Math.round(finalPrice * 100) / 100
  discountAmount = Math.round(discountAmount * 100) / 100

  const discountPercentage = originalPrice > 0 ? Math.round((discountAmount / originalPrice) * 100) : 0

  return {
    originalPrice,
    finalPrice,
    discountAmount,
    discountPercentage,
    hasDiscount: discountAmount > 0,
    discountType,
    isOnSale,
    saleEndDate: service.sale_end_date
  }
}

export function formatPrice(price: number): string {
  return `$${price.toFixed(2)}`
}

export function formatDiscount(pricing: PricingResult): string {
  if (!pricing.hasDiscount) return ''

  switch (pricing.discountType) {
    case 'sale':
      return `Sale: Save ${formatPrice(pricing.discountAmount)}`
    case 'percentage':
      return `${pricing.discountPercentage}% off`
    case 'amount':
      return `Save ${formatPrice(pricing.discountAmount)}`
    case 'coupon':
      return `Coupon: ${pricing.discountPercentage}% off`
    default:
      return `${pricing.discountPercentage}% off`
  }
}

export function getDiscountBadgeColor(discountType: PricingResult['discountType']): string {
  switch (discountType) {
    case 'sale':
      return 'bg-red-100 text-red-800 border-red-200'
    case 'percentage':
      return 'bg-orange-100 text-orange-800 border-orange-200'
    case 'amount':
      return 'bg-green-100 text-green-800 border-green-200'
    case 'coupon':
      return 'bg-purple-100 text-purple-800 border-purple-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

export function isDiscountActive(service: Service): boolean {
  if (!service.sale_start_date || !service.sale_end_date) {
    return false
  }

  const now = new Date()
  const saleStart = new Date(service.sale_start_date)
  const saleEnd = new Date(service.sale_end_date)
  
  return now >= saleStart && now <= saleEnd
}

export function getTimeUntilSaleEnds(saleEndDate: string): string | null {
  const now = new Date()
  const endDate = new Date(saleEndDate)
  const timeDiff = endDate.getTime() - now.getTime()

  if (timeDiff <= 0) return null

  const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24))
  
  // Only show timer if less than 7 days remaining
  if (days >= 7) return null
  
  const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60))

  if (days > 0) {
    return `${days}d ${hours}h remaining`
  } else if (hours > 0) {
    return `${hours}h ${minutes}m remaining`
  } else {
    return `${minutes}m remaining`
  }
}