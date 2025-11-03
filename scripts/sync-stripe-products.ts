/**
 * Sync Stripe Products to Database
 *
 * Fetches product details from Stripe and creates/updates records in public.products table.
 * Run this script to add your course products to the database.
 *
 * Usage:
 *   npx tsx scripts/sync-stripe-products.ts
 */

import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
})

// Initialize Supabase admin client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Product IDs to sync
const PRODUCTS_TO_SYNC = [
  { stripeProductId: 'prod_T7hC1OpapHdkKe', slug: 'a-plus-guarantee', status: 'active' },
  { stripeProductId: 'prod_T7ZhOkdaZuD7O9', slug: 'web-launch-course', status: 'active' },
  { stripeProductId: 'prod_TIuoc7syNmKmv1', slug: 'flex-package', status: 'active' },
  { stripeProductId: 'prod_TJrlYGjxpUdr6y', slug: 'lvl-up-30-day', status: 'active' },
  { stripeProductId: 'prod_TJvBlPbha9ldwL', slug: 'lvl-up-active-repo', status: 'active' },
  { stripeProductId: 'prod_TJwrJVYTKEeaWK', slug: 'lvl-up-triple', status: 'active' },
]

async function syncProducts() {
  console.log('🔄 Starting Stripe product sync...\n')

  for (const { stripeProductId, slug, status } of PRODUCTS_TO_SYNC) {
    try {
      console.log(`📦 Fetching ${stripeProductId} from Stripe...`)

      // Fetch product from Stripe
      const product = await stripe.products.retrieve(stripeProductId, {
        expand: ['default_price']
      })

      // Get the default price
      const defaultPrice = product.default_price as Stripe.Price | null
      const price = defaultPrice?.unit_amount ? defaultPrice.unit_amount / 100 : 0

      // Determine lookup key (use existing or generate from slug)
      let lookupKey = defaultPrice?.lookup_key
      if (!lookupKey) {
        lookupKey = `${slug}_v1`
        console.log(`⚠️  No lookup key found, will use: ${lookupKey}`)
        console.log(`   You should add this to Stripe: Dashboard → Products → ${product.name} → Price → Add lookup key`)
      }

      console.log(`   Name: ${product.name}`)
      console.log(`   Price: $${price}`)
      console.log(`   Lookup Key: ${lookupKey}`)
      console.log(`   Metadata: ${JSON.stringify(product.metadata)}`)

      // Insert or update in database
      const { data, error } = await supabase
        .from('products')
        .upsert({
          name: product.name,
          slug: slug,
          description: product.description || `${product.name} - Imported from Stripe`,
          price: price,
          stripe_lookup_key: lookupKey,
          stripe_product_id: stripeProductId,
          status: status,
          metadata: product.metadata || {},
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'slug',
          ignoreDuplicates: false
        })
        .select()
        .single()

      if (error) {
        console.error(`❌ Error syncing ${product.name}:`, error.message)

        // If it's a missing column error, suggest adding it
        if (error.message.includes('stripe_product_id')) {
          console.log('\n⚠️  Column "stripe_product_id" not found in products table.')
          console.log('   Run this SQL in Supabase to add it:')
          console.log('   ALTER TABLE products ADD COLUMN IF NOT EXISTS stripe_product_id TEXT UNIQUE;')
          console.log('   ALTER TABLE products ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT \'{}\';')
        }

        if (error.message.includes('metadata')) {
          console.log('\n⚠️  Column "metadata" not found in products table.')
          console.log('   Run this SQL in Supabase to add it:')
          console.log('   ALTER TABLE products ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT \'{}\';')
        }
      } else {
        console.log(`✅ Synced: ${product.name}\n`)
      }

    } catch (error) {
      console.error(`❌ Failed to sync ${stripeProductId}:`, error)
    }
  }

  console.log('\n✅ Sync complete!')
  console.log('\n📋 Next Steps:')
  console.log('1. Check Stripe Dashboard and add lookup keys to products (if any were missing)')
  console.log('2. Add metadata to Stripe products for tier assignment:')
  console.log('   - For courses: metadata.course_type = "basic_course"')
  console.log('   - For A+ Program: metadata.tier = "premium_vip", metadata.total_lvl_ups = "12"')
  console.log('   - For LVL UP packages: metadata.includes_lvl_ups = "true"')
  console.log('3. Verify products in Supabase: SELECT * FROM products;')
}

// Run the sync
syncProducts()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
