import Script from 'next/script'
import React from 'react'

export default function PricingPage() {
  const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  const pricingTableId = "prctbl_1SBSBQIbb5TcHX6OJGPPLWRb"

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600">
            Get started with Web Launch Coach today
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <Script
            async
            src="https://js.stripe.com/v3/pricing-table.js"
            strategy="lazyOnload"
          />
          {React.createElement('stripe-pricing-table', {
            'pricing-table-id': pricingTableId,
            'publishable-key': stripePublishableKey || ""
          })}
        </div>
      </div>
    </div>
  )
}