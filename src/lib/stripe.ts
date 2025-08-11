import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
})

// Product configuration - replace with your actual Stripe price IDs
export const STRIPE_PRODUCTS = {
  FOUNDATION_COURSE: 'price_1RpxYe01paitCGHxx2JCfImc', // Replace with your $799 course price ID
  PREMIUM_COURSE: 'price_1RpxbT01paitCGHx6wtABRwL',       // Replace with your $1999 course price ID  
  MONTHLY_SUPPORT: 'price_1RpuBa01paitCGHxiPZrwtrv',     // Replace with your $99/month price ID
  // Add more products as needed
} as const

export type StripeProductId = keyof typeof STRIPE_PRODUCTS