# Managing Architecture Mastery Toolkit Resources

## Overview

The Architecture Mastery Toolkit is a secret bundle stored in Supabase. Only students who purchase the toolkit ($497) can access the contents.

**Security:** Content is protected by Row Level Security (RLS) - students can only query content for products they've purchased.

---

## Setup Instructions

### 1. Run Database Scripts

In Supabase SQL Editor, run these scripts in order:

```sql
-- 1. Create tables
scripts/create-products-schema.sql

-- 2. Set up RLS policies
scripts/create-products-rls.sql
```

### 2. Configure Stripe

1. **Create product in Stripe Dashboard:**
   - Go to Products → Add Product
   - Name: "Architecture Mastery Toolkit"
   - Price: $497 (one-time payment)

2. **Set the Lookup Key (Important!):**
   - In the price details, click "Add lookup key"
   - Enter: `architecture_toolkit_full_v1`
   - Save

**Why lookup keys?** You can change the price in Stripe (e.g., from $497 to $697) without changing any code. Your app will always fetch the current price using the lookup key.

**No code changes needed!** The database already has the lookup key `architecture_toolkit_full_v1` stored.

### 3. Using Lookup Keys in Your Checkout Code

When creating a Stripe checkout session, fetch the price using the lookup key:

```javascript
// /app/api/create-checkout/route.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  const { productSlug } = await request.json();

  // Get product from database
  const product = await supabase
    .from('products')
    .select('stripe_lookup_key')
    .eq('slug', productSlug)
    .single();

  // Retrieve price from Stripe using lookup key
  const prices = await stripe.prices.list({
    lookup_keys: [product.data.stripe_lookup_key],
    expand: ['data.product']
  });

  const price = prices.data[0];

  // Create checkout session
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [{
      price: price.id,  // Use the dynamic price ID
      quantity: 1,
    }],
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/portal/products/${productSlug}?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/portal/resources?canceled=true`,
  });

  return Response.json({ url: session.url });
}
```

**Benefits:**
- Change price in Stripe dashboard → automatically reflected in checkout
- No code deployment needed for price updates
- Single source of truth for pricing

---

## Adding New Content to the Toolkit

### Method 1: Using Supabase Dashboard (Easiest)

1. Go to Supabase → Table Editor → `product_contents`
2. Click "Insert row"
3. Fill in fields:
   - **product_id**: Select "Architecture Mastery Toolkit"
   - **content_type_id**: Choose type (Template, Prompt, Guide, etc.)
   - **category**: Group name (e.g., "Data Architecture")
   - **name**: Display name (e.g., "Repository Pattern Starter")
   - **slug**: URL-friendly version (e.g., "repository-pattern-starter")
   - **description**: Full explanation for students
   - **claude_command**: The actual Claude CLI command
   - **file_urls**: JSON array of download links (optional)
   - **video_url**: Loom/YouTube link (optional)
   - **time_saved_min**: Minimum hours saved (e.g., 6)
   - **time_saved_max**: Maximum hours saved (e.g., 10)
   - **difficulty**: beginner, intermediate, or advanced
   - **sort_order**: Number for ordering within category

**Tip for slug:** Use lowercase with dashes, like: `repository-pattern-starter`, `debugging-prompt-collection`

### Method 2: Using SQL

```sql
INSERT INTO product_contents (
  product_id,
  content_type_id,
  category,
  name,
  slug,
  description,
  claude_command,
  time_saved_min,
  time_saved_max,
  difficulty,
  sort_order
) VALUES (
  (SELECT id FROM products WHERE slug = 'architecture-toolkit'),
  (SELECT id FROM content_types WHERE slug = 'template'),
  'Data Architecture',
  'Repository Pattern Starter',
  'repository-pattern-starter',
  'A complete implementation of the Repository pattern that abstracts data access and allows you to switch between Airtable, Supabase, or any other database without changing your business logic. Includes TypeScript interfaces and example implementations.',
  'claude create repository pattern with TypeScript interfaces for Airtable and Supabase, include example CRUD operations',
  8,
  12,
  'intermediate',
  1
);
```

---

## Content Type Examples

### Template Resource

```sql
INSERT INTO product_contents (
  product_id,
  content_type_id,
  category,
  name,
  slug,
  description,
  claude_command,
  file_urls,
  time_saved_min,
  time_saved_max,
  difficulty,
  sort_order
) VALUES (
  (SELECT id FROM products WHERE slug = 'architecture-toolkit'),
  (SELECT id FROM content_types WHERE slug = 'template'),
  'Code Organization',
  'Dependency Injection Setup',
  'dependency-injection-setup',
  'Professional dependency injection container that manages service instantiation, configuration, and lifecycle. Makes your code testable and maintainable.',
  'claude create dependency injection container with TypeScript, include service registration and resolution with examples',
  '["https://your-storage.com/di-template.zip"]'::jsonb,
  10,
  14,
  'intermediate',
  1
);
```

### Prompt Library Resource

```sql
INSERT INTO product_contents (
  product_id,
  content_type_id,
  category,
  name,
  slug,
  description,
  claude_command,
  time_saved_min,
  time_saved_max,
  difficulty,
  sort_order
) VALUES (
  (SELECT id FROM products WHERE slug = 'architecture-toolkit'),
  (SELECT id FROM content_types WHERE slug = 'prompt'),
  'AI Prompts',
  'Debugging Prompt Collection',
  'debugging-prompt-collection',
  'Pre-written prompts for Claude to debug common Next.js, React, and TypeScript issues. Copy-paste ready for instant solutions.',
  'Use these prompts when debugging:\n\n1. "Analyze this Next.js error and suggest fixes: [paste error]"\n2. "Debug this React component rendering issue: [paste code]"\n3. "Fix this TypeScript type error with proper types: [paste error]"',
  6,
  10,
  'beginner',
  1
);
```

### Video Tutorial Resource

```sql
INSERT INTO product_contents (
  product_id,
  content_type_id,
  category,
  name,
  slug,
  description,
  video_url,
  time_saved_min,
  time_saved_max,
  difficulty,
  sort_order
) VALUES (
  (SELECT id FROM products WHERE slug = 'architecture-toolkit'),
  (SELECT id FROM content_types WHERE slug = 'video'),
  'Performance Optimization',
  'React Query Setup Walkthrough',
  'react-query-setup-walkthrough',
  'Complete video guide to setting up React Query (TanStack Query) for data fetching, caching, and synchronization.',
  'https://www.loom.com/share/your-video-id',
  8,
  12,
  'intermediate',
  1
);
```

---

## Categories for Organization

Suggested categories (matching Claude.ai conversation):

- Data Architecture
- Service Integration
- Code Organization
- Request Handling
- Object Creation
- State & Events
- Performance Optimization
- Type Safety
- Testing & Quality
- Developer Experience
- AI Prompts

---

## Viewing Your Content (Admin)

As an admin, you can see all content even without purchasing:

```sql
SELECT
  category,
  name,
  difficulty,
  time_saved_min || '-' || time_saved_max || ' hours' as time_saved
FROM product_contents
WHERE product_id = (SELECT id FROM products WHERE slug = 'architecture-toolkit')
ORDER BY category, sort_order;
```

---

## Adding New Content Types

If you want to add new types beyond Templates, Prompts, Videos, etc.:

```sql
INSERT INTO content_types (name, slug, icon) VALUES
('Workshop Series', 'workshop', '🎯'),
('Automation Script', 'script', '⚡'),
('Configuration File', 'config', '⚙️');
```

---

## File Storage Options

### Option 1: Supabase Storage (Recommended)

1. Upload files to Supabase Storage bucket: `toolkit-files`
2. Get public URL
3. Add to `file_urls`:

```sql
file_urls = '["https://your-project.supabase.co/storage/v1/object/public/toolkit-files/template.zip"]'::jsonb
```

### Option 2: GitHub Private Repository

1. Create private GitHub repo for files
2. Generate download links
3. Add authentication in your app to access files

### Option 3: External Cloud Storage

Use S3, Google Cloud Storage, etc. with signed URLs.

---

## Bulk Import Template

If you have 30 resources to add, use this pattern:

```sql
-- Save as bulk-import.sql
INSERT INTO product_contents (product_id, content_type_id, category, name, slug, description, claude_command, time_saved_min, time_saved_max, difficulty, sort_order) VALUES
  ((SELECT id FROM products WHERE slug = 'architecture-toolkit'), (SELECT id FROM content_types WHERE slug = 'template'), 'Data Architecture', 'Repository Pattern', 'repository-pattern', '...', '...', 8, 12, 'intermediate', 1),
  ((SELECT id FROM products WHERE slug = 'architecture-toolkit'), (SELECT id FROM content_types WHERE slug = 'template'), 'Data Architecture', 'Adapter Pattern', 'adapter-pattern', '...', '...', 10, 14, 'intermediate', 2),
  -- ... add all 30 here
;
```

---

## Testing Access Control

### Test 1: Non-purchaser cannot see content

```sql
-- Run as a student who hasn't purchased
SELECT * FROM product_contents
WHERE product_id = (SELECT id FROM products WHERE slug = 'architecture-toolkit');

-- Should return 0 rows
```

### Test 2: Purchaser can see content

```sql
-- First, simulate a purchase (or use Stripe webhook)
INSERT INTO purchases (user_id, product_id, amount_paid, status, access_granted)
VALUES (
  auth.uid(),
  (SELECT id FROM products WHERE slug = 'architecture-toolkit'),
  497.00,
  'completed',
  true
);

-- Now query should work
SELECT * FROM product_contents
WHERE product_id = (SELECT id FROM products WHERE slug = 'architecture-toolkit');

-- Should return all content
```

---

## Updating Prices

### Change Price (Using Lookup Keys)

**In Stripe Dashboard (Recommended):**
1. Go to Products → Architecture Mastery Toolkit
2. Create a new price (e.g., $697)
3. Add the SAME lookup key: `architecture_toolkit_full_v1`
4. Archive the old price

**Your app automatically uses the new price!** No code changes, no database updates needed.

### Update Display Price in Database (Optional)

If you want the database `price` field to match for display purposes:

```sql
UPDATE products
SET
  price = 697.00,  -- New display price
  description = 'Updated description mentioning new price...'
WHERE slug = 'architecture-toolkit';
```

**Note:**
- Existing purchasers keep access regardless of price changes
- The database `price` is just for display - Stripe lookup key determines actual charge

---

## Revoking Access

If needed (refunds, etc.):

```sql
UPDATE purchases
SET access_granted = false
WHERE user_id = 'user-id-here'
  AND product_id = (SELECT id FROM products WHERE slug = 'architecture-toolkit');
```

---

## Questions?

- Check RLS policies: `scripts/create-products-rls.sql`
- Verify tables: `scripts/create-products-schema.sql`
- Test with Supabase SQL Editor as different users
