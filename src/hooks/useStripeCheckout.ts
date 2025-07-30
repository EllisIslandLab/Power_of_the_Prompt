"use client"

import { useState } from 'react'

type ProductId = 'FOUNDATION_COURSE' | 'PREMIUM_COURSE' | 'MONTHLY_SUPPORT'

interface CustomCheckoutOptions {
  customPrice: number
  customName: string
  customDescription?: string
  customerEmail?: string
  quantity?: number
}

export function useStripeCheckout() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createCheckout = async (productId: ProductId, quantity: number = 1) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId, quantity }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session')
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const createCustomCheckout = async (options: CustomCheckoutOptions) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customPrice: options.customPrice,
          customName: options.customName,
          customDescription: options.customDescription,
          customerEmail: options.customerEmail,
          quantity: options.quantity || 1,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session')
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return {
    createCheckout,
    createCustomCheckout,
    loading,
    error,
  }
}