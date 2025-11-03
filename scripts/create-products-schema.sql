-- ============================================================================
-- PRODUCTS & CONTENT SCHEMA FOR SUPABASE
-- ============================================================================
-- Creates tables for secret Architecture Mastery Toolkit with content management
-- Price: $497
-- ============================================================================

-- Table 1: Products
-- ============================================================================
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  stripe_lookup_key TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'draft', 'retired')),
  total_purchases INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table 2: Content Types (for categorizing different resource types)
-- ============================================================================
CREATE TABLE IF NOT EXISTS content_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table 3: Product Contents (SECRET - only visible to purchasers)
-- ============================================================================
CREATE TABLE IF NOT EXISTS product_contents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  content_type_id UUID REFERENCES content_types(id),
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  price_individual DECIMAL(10,2),
  time_saved_min INTEGER,
  time_saved_max INTEGER,
  difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  implementation_time TEXT,
  claude_command TEXT,
  video_url TEXT,
  file_urls JSONB,
  prerequisites JSONB,
  sort_order INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table 4: Purchases
-- ============================================================================
CREATE TABLE IF NOT EXISTS purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  stripe_payment_intent TEXT,
  amount_paid DECIMAL(10,2),
  status TEXT DEFAULT 'completed' CHECK (status IN ('completed', 'refunded', 'failed')),
  access_granted BOOLEAN DEFAULT true,
  purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_product_contents_product ON product_contents(product_id);
CREATE INDEX IF NOT EXISTS idx_product_contents_category ON product_contents(category);
CREATE INDEX IF NOT EXISTS idx_purchases_user ON purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_purchases_product ON purchases(product_id);

-- Function to increment total purchases
-- ============================================================================
CREATE OR REPLACE FUNCTION increment_product_purchases(product_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE products
  SET total_purchases = total_purchases + 1
  WHERE id = product_id;
END;
$$ LANGUAGE plpgsql;

-- Insert default content types
-- ============================================================================
INSERT INTO content_types (name, slug, icon) VALUES
('Template', 'template', '📄'),
('Prompt Library', 'prompt', '💬'),
('Video Tutorial', 'video', '🎥'),
('Guide', 'guide', '📚'),
('CLI Command', 'cli', '⌨️'),
('Checklist', 'checklist', '✅')
ON CONFLICT (slug) DO NOTHING;

-- Insert the Architecture Mastery Toolkit product
-- ============================================================================
INSERT INTO products (
  name,
  slug,
  description,
  price,
  stripe_lookup_key,
  status
) VALUES (
  'Architecture Mastery Toolkit',
  'architecture-toolkit',
  '$1,150+ worth of implementation templates and professional patterns. Save 300+ hours of research with battle-tested architectural solutions, pre-configured for your stack.',
  497.00,
  'architecture_toolkit_full_v1',
  'active'
) ON CONFLICT (slug) DO NOTHING;

-- Verify tables were created
-- ============================================================================
SELECT
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND table_name IN ('products', 'content_types', 'product_contents', 'purchases')
ORDER BY table_name;
