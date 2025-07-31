"use client"

import { ServicePayment } from "@/components/services/ServicePayment"
import { useRouter } from "next/navigation"

interface ServicePurchasePageProps {
  params: {
    id: string
  }
}

export default function ServicePurchasePage({ params }: ServicePurchasePageProps) {
  const router = useRouter()

  const handleSuccess = (paymentIntentId: string) => {
    // Success handling is done in the component
    console.log('Payment successful:', paymentIntentId)
  }

  const handleError = (error: string) => {
    console.error('Payment error:', error)
    // Could show a toast or error message
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-20 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Complete Your Purchase</h1>
          <p className="text-muted-foreground">
            You're one step away from getting started!
          </p>
        </div>

        <ServicePayment
          serviceId={params.id}
          onSuccess={handleSuccess}
          onError={handleError}
        />
      </div>
    </div>
  )
}