"use client"

import { useState, useEffect } from "react"
import { loadStripe } from "@stripe/stripe-js"
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js"
import { Service, ServiceResponse, PaymentResponse } from "@/types/services"
import { calculateServicePrice, formatPrice, formatDiscount, getDiscountBadgeColor } from "@/lib/pricing"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, Clock, Zap, Timer } from "lucide-react"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface ServicePaymentProps {
  serviceId: string
  onSuccess?: (paymentIntentId: string) => void
  onError?: (error: string) => void
}

export function ServicePayment({ serviceId, onSuccess, onError }: ServicePaymentProps) {
  const [service, setService] = useState<Service | null>(null)
  const [clientSecret, setClientSecret] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    email: ""
  })

  useEffect(() => {
    fetchService()
  }, [serviceId])

  const fetchService = async () => {
    try {
      const response = await fetch(`/api/services/${serviceId}`)
      const data: ServiceResponse = await response.json()

      if (data.success) {
        setService(data.data)
      } else {
        setError(data.error || 'Service not found')
      }
    } catch (error) {
      setError('Failed to load service')
    } finally {
      setLoading(false)
    }
  }

  const createPaymentIntent = async () => {
    if (!service || !customerInfo.name || !customerInfo.email) {
      setError('Please fill in all required fields')
      return
    }

    try {
      setLoading(true)
      
      // Calculate final price including discounts
      const pricing = calculateServicePrice(service)
      
      const response = await fetch('/api/services/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_id: service.id,
          service_name: service.service_name,
          amount: Math.round(pricing.finalPrice * 100), // Convert to cents
          currency: 'usd',
          customer_email: customerInfo.email,
          customer_name: customerInfo.name
        })
      })

      const data: PaymentResponse = await response.json()

      if (data.success) {
        setClientSecret(data.data.client_secret)
      } else {
        setError(data.error || 'Failed to create payment')
        onError?.(data.error || 'Payment creation failed')
      }
    } catch (error) {
      const errorMessage = 'Network error creating payment'
      setError(errorMessage)
      onError?.(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const getServiceIcon = (type: string) => {
    switch (type) {
      case 'course':
        return <CheckCircle className="h-5 w-5 text-blue-500" />
      case 'build':
        return <Zap className="h-5 w-5 text-green-500" />
      case 'audit':
        return <CheckCircle className="h-5 w-5 text-orange-500" />
      case 'consultation':
        return <Clock className="h-5 w-5 text-purple-500" />
      default:
        return <Zap className="h-5 w-5" />
    }
  }

  if (loading && !service) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              <div className="h-10 bg-gray-200 rounded w-full mt-6"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error && !service) {
    return (
      <div className="max-w-2xl mx-auto text-center py-8">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={fetchService} variant="outline">
          Try Again
        </Button>
      </div>
    )
  }

  if (!service) {
    return <div>Service not found</div>
  }

  if (!clientSecret) {
    const pricing = calculateServicePrice(service)
    
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Service Summary */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getServiceIcon(service.service_type)}
                <div>
                  <CardTitle className="text-2xl">{service.service_name}</CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary">{service.service_type}</Badge>
                    <Clock className="h-4 w-4" />
                    {service.duration_estimate}
                  </CardDescription>
                </div>
              </div>
              <div className="text-right">
                {pricing.hasDiscount ? (
                  <div>
                    <div className="text-lg text-muted-foreground line-through">
                      {formatPrice(pricing.originalPrice)}
                    </div>
                    <div className="text-3xl font-bold text-primary">
                      {formatPrice(pricing.finalPrice)}
                    </div>
                    <Badge className={getDiscountBadgeColor(pricing.discountType)}>
                      {formatDiscount(pricing)}
                    </Badge>
                  </div>
                ) : (
                  <div className="text-3xl font-bold text-primary">
                    {formatPrice(service.price)}
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">{service.description}</p>
            
            {service.features.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3">What's included:</h4>
                <ul className="space-y-2">
                  {service.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Customer Info Form */}
        <Card>
          <CardHeader>
            <CardTitle>Your Information</CardTitle>
            <CardDescription>
              Please provide your details to complete the purchase
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Full Name *
              </label>
              <input
                type="text"
                value={customerInfo.name}
                onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Your full name"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Email Address *
              </label>
              <input
                type="email"
                value={customerInfo.email}
                onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="your@email.com"
                required
              />
            </div>

            <Separator />

            <div className="flex justify-between items-center text-lg font-semibold">
              <span>Total:</span>
              <span>{formatPrice(pricing.finalPrice)}</span>
            </div>

            <Button 
              onClick={createPaymentIntent}
              disabled={loading || !customerInfo.name || !customerInfo.email}
              className="w-full"
              size="lg"
            >
              {loading ? 'Processing...' : `Continue to Payment - ${formatPrice(pricing.finalPrice)}`}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Elements 
        stripe={stripePromise} 
        options={{ 
          clientSecret,
          appearance: {
            theme: 'stripe'
          }
        }}
      >
        <PaymentForm 
          service={service}
          customerInfo={customerInfo}
          onSuccess={onSuccess}
          onError={onError}
        />
      </Elements>
    </div>
  )
}

function PaymentForm({ 
  service, 
  customerInfo, 
  onSuccess, 
  onError 
}: {
  service: Service
  customerInfo: { name: string; email: string }
  onSuccess?: (paymentIntentId: string) => void
  onError?: (error: string) => void
}) {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setLoading(true)
    setError("")

    const { error: submitError, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
      confirmParams: {
        return_url: `${window.location.origin}/services/success`,
        receipt_email: customerInfo.email
      }
    })

    if (submitError) {
      setError(submitError.message || 'Payment failed')
      onError?.(submitError.message || 'Payment failed')
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      onSuccess?.(paymentIntent.id)
      // Redirect to success page
      window.location.href = `/services/success?payment_intent=${paymentIntent.id}`
    }

    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Complete Your Purchase</CardTitle>
          <CardDescription>
            {service.service_name} - {formatPrice(calculateServicePrice(service).finalPrice)}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {error}
            </div>
          )}
          
          <PaymentElement />
          
          <div className="text-xs text-muted-foreground">
            Your payment is secured by Stripe. We never see or store your payment information.
          </div>
        </CardContent>
      </Card>

      <Button 
        type="submit" 
        disabled={!stripe || loading}
        className="w-full"
        size="lg"
      >
        {loading ? 'Processing Payment...' : `Pay ${formatPrice(calculateServicePrice(service).finalPrice)}`}
      </Button>
    </form>
  )
}