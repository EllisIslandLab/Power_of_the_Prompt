import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
})

export async function GET() {
  try {
    // Fetch all active products with prices
    const products = await stripe.products.list({
      active: true,
      expand: ['data.default_price'],
      limit: 100,
    })

    // Fetch all prices for these products
    const productsWithPrices = await Promise.all(
      products.data.map(async (product) => {
        const prices = await stripe.prices.list({
          product: product.id,
          active: true,
        })

        // Separate recurring (monthly) and one-time prices
        const monthlyPrices = prices.data.filter(p => p.recurring?.interval === 'month')
        const oneTimePrices = prices.data.filter(p => !p.recurring)

        // Get monthly price (first recurring) and one-time price
        const monthlyPrice = monthlyPrices[0]
        const oneTimePrice = oneTimePrices[0]

        // Format prices
        const formatPrice = (price: any) => {
          if (!price || !price.unit_amount) return null
          return {
            id: price.id,
            amount: price.unit_amount,
            currency: price.currency,
            formatted: new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: price.currency,
            }).format(price.unit_amount / 100),
            interval: price.recurring?.interval || 'one_time',
          }
        }

        // Construct course URL - prefer metadata, then product.url, then default
        const courseUrl = product.metadata?.course_url
          || product.metadata?.url
          || product.url
          || `${process.env.NEXT_PUBLIC_SITE_URL}/pricing`

        // Get all relevant metadata
        const fullMetadata = {
          ...product.metadata,
          features: product.features?.map(f => f.name) || [],
        }

        return {
          id: product.id,
          name: product.name,
          description: product.description || '',
          images: product.images || [],
          url: courseUrl,
          prices: {
            monthly: formatPrice(monthlyPrice),
            oneTime: formatPrice(oneTimePrice),
            all: prices.data.map(formatPrice).filter(Boolean),
          },
          // For backward compatibility, use monthly price as primary
          price: formatPrice(monthlyPrice) || formatPrice(oneTimePrice),
          metadata: fullMetadata,
          features: product.features?.map(f => f.name) || [],
        }
      })
    )

    return NextResponse.json({
      success: true,
      products: productsWithPrices,
    })
  } catch (error) {
    console.error('Error fetching Stripe products:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch products',
      },
      { status: 500 }
    )
  }
}
