-- ============================================
-- WEB LAUNCH ACADEMY - SMART PREVIEW GENERATOR
-- New Flow: Categories, Objection Handling, Pricing
-- ============================================

-- ============================================
-- STEP 1: WEBSITE CATEGORIES
-- ============================================

CREATE TABLE IF NOT EXISTS website_categories (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  icon text,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp DEFAULT now()
);

-- ============================================
-- STEP 2: WEBSITE SUBCATEGORIES
-- ============================================

CREATE TABLE IF NOT EXISTS website_subcategories (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id uuid NOT NULL REFERENCES website_categories(id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text NOT NULL,
  description text,
  icon text,
  suggested_components jsonb DEFAULT '[]',
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp DEFAULT now(),
  UNIQUE(category_id, slug)
);

-- ============================================
-- STEP 3: USER CATEGORY SUBMISSIONS (Admin Approval)
-- ============================================

CREATE TABLE IF NOT EXISTS user_category_submissions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_email text NOT NULL,
  suggested_category text NOT NULL,
  suggested_subcategory text,
  parent_category_id uuid REFERENCES website_categories(id),
  description text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes text,
  reviewed_by text,
  reviewed_at timestamp,
  created_at timestamp DEFAULT now()
);

-- ============================================
-- STEP 4: SEED CATEGORIES
-- ============================================

-- Display Website
INSERT INTO website_categories (name, slug, description, icon, display_order)
VALUES ('Display Website', 'display', 'Showcase visual content, portfolios, and galleries', '🖼️', 1)
ON CONFLICT (slug) DO NOTHING;

-- Input Website
INSERT INTO website_categories (name, slug, description, icon, display_order)
VALUES ('Input Website', 'input', 'Collect information through forms and surveys', '📝', 2)
ON CONFLICT (slug) DO NOTHING;

-- E-commerce Website
INSERT INTO website_categories (name, slug, description, icon, display_order)
VALUES ('E-commerce Website', 'ecommerce', 'Sell products and services online', '🛒', 3)
ON CONFLICT (slug) DO NOTHING;

-- Social Networking Website
INSERT INTO website_categories (name, slug, description, icon, display_order)
VALUES ('Social Networking Website', 'social', 'Connect people and build communities', '👥', 4)
ON CONFLICT (slug) DO NOTHING;

-- Educational Website
INSERT INTO website_categories (name, slug, description, icon, display_order)
VALUES ('Educational Website', 'education', 'Teach, train, and share knowledge', '📚', 5)
ON CONFLICT (slug) DO NOTHING;

-- Informational Website
INSERT INTO website_categories (name, slug, description, icon, display_order)
VALUES ('Informational Website', 'informational', 'Share news, articles, and resources', '📰', 6)
ON CONFLICT (slug) DO NOTHING;

-- Utility Website
INSERT INTO website_categories (name, slug, description, icon, display_order)
VALUES ('Utility Website', 'utility', 'Tools, calculators, and developer resources', '🔧', 7)
ON CONFLICT (slug) DO NOTHING;

-- Entertainment Website
INSERT INTO website_categories (name, slug, description, icon, display_order)
VALUES ('Entertainment Website', 'entertainment', 'Media streaming, games, and fan content', '🎬', 8)
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- STEP 5: SEED SUBCATEGORIES
-- ============================================

-- Display Website Subcategories
DO $$
DECLARE
  cat_id uuid;
BEGIN
  SELECT id INTO cat_id FROM website_categories WHERE slug = 'display';

  INSERT INTO website_subcategories (category_id, name, slug, description, display_order) VALUES
    (cat_id, 'Picture Gallery', 'picture-gallery', 'Showcase photos and images', 1),
    (cat_id, 'Text Blog', 'text-blog', 'Written content and articles', 2),
    (cat_id, 'Video Gallery', 'video-gallery', 'Video content showcase', 3),
    (cat_id, 'Audio Gallery', 'audio-gallery', 'Podcasts and audio content', 4),
    (cat_id, 'Art Portfolio', 'art-portfolio', 'Showcase artwork and illustrations', 5),
    (cat_id, 'Photography Portfolio', 'photography-portfolio', 'Professional photography showcase', 6),
    (cat_id, 'Design Portfolio', 'design-portfolio', 'Graphic and web design work', 7)
  ON CONFLICT (category_id, slug) DO NOTHING;
END $$;

-- Input Website Subcategories
DO $$
DECLARE
  cat_id uuid;
BEGIN
  SELECT id INTO cat_id FROM website_categories WHERE slug = 'input';

  INSERT INTO website_subcategories (category_id, name, slug, description, display_order) VALUES
    (cat_id, 'Email Input', 'email-input', 'Simple email collection', 1),
    (cat_id, 'Contact Form', 'contact-form', 'General contact and inquiry forms', 2),
    (cat_id, 'Feedback Form', 'feedback-form', 'Collect user feedback', 3),
    (cat_id, 'Polls', 'polls', 'Quick voting and opinion polls', 4),
    (cat_id, 'User Registration', 'user-registration', 'Account creation forms', 5),
    (cat_id, 'Event Registration', 'event-registration', 'Event signup and RSVP', 6)
  ON CONFLICT (category_id, slug) DO NOTHING;
END $$;

-- E-commerce Website Subcategories
DO $$
DECLARE
  cat_id uuid;
BEGIN
  SELECT id INTO cat_id FROM website_categories WHERE slug = 'ecommerce';

  INSERT INTO website_subcategories (category_id, name, slug, description, display_order) VALUES
    (cat_id, 'Product Listings', 'product-listings', 'Display products for sale', 1),
    (cat_id, 'Shopping Cart', 'shopping-cart', 'Cart and checkout system', 2),
    (cat_id, 'Vendor Listings', 'vendor-listings', 'Multi-vendor marketplace', 3),
    (cat_id, 'Auction Site', 'auction-site', 'Bidding and auctions', 4),
    (cat_id, 'Membership Site', 'membership-site', 'Paid membership access', 5),
    (cat_id, 'Digital Content Subscription', 'digital-subscription', 'Digital product subscriptions', 6)
  ON CONFLICT (category_id, slug) DO NOTHING;
END $$;

-- Social Networking Website Subcategories
DO $$
DECLARE
  cat_id uuid;
BEGIN
  SELECT id INTO cat_id FROM website_categories WHERE slug = 'social';

  INSERT INTO website_subcategories (category_id, name, slug, description, display_order) VALUES
    (cat_id, 'Profile Pages', 'profile-pages', 'User profile systems', 1),
    (cat_id, 'Friend Connections', 'friend-connections', 'Social connections and follows', 2),
    (cat_id, 'Professional Networking', 'professional-networking', 'Business and career networking', 3),
    (cat_id, 'Hobbyist Communities', 'hobbyist-communities', 'Interest-based communities', 4)
  ON CONFLICT (category_id, slug) DO NOTHING;
END $$;

-- Educational Website Subcategories
DO $$
DECLARE
  cat_id uuid;
BEGIN
  SELECT id INTO cat_id FROM website_categories WHERE slug = 'education';

  INSERT INTO website_subcategories (category_id, name, slug, description, display_order) VALUES
    (cat_id, 'Video Lectures', 'video-lectures', 'Online video courses', 1),
    (cat_id, 'Quizzes and Assessments', 'quizzes', 'Testing and assessment tools', 2),
    (cat_id, 'Study Materials', 'study-materials', 'Educational resources and downloads', 3),
    (cat_id, 'Research Articles', 'research-articles', 'Academic and research content', 4),
    (cat_id, 'Course Management', 'course-management', 'LMS course organization', 5),
    (cat_id, 'Student Tracking', 'student-tracking', 'Progress and performance tracking', 6)
  ON CONFLICT (category_id, slug) DO NOTHING;
END $$;

-- Informational Website Subcategories
DO $$
DECLARE
  cat_id uuid;
BEGIN
  SELECT id INTO cat_id FROM website_categories WHERE slug = 'informational';

  INSERT INTO website_subcategories (category_id, name, slug, description, display_order) VALUES
    (cat_id, 'Local News', 'local-news', 'Regional and local news coverage', 1),
    (cat_id, 'International News', 'international-news', 'Global news coverage', 2),
    (cat_id, 'Personal Blog', 'personal-blog', 'Individual blogging platform', 3),
    (cat_id, 'Guest Blogging', 'guest-blogging', 'Multi-author blog platform', 4),
    (cat_id, 'Collaborative Knowledge Base', 'knowledge-base', 'Wiki-style collaboration', 5),
    (cat_id, 'Encyclopedia', 'encyclopedia', 'Reference and encyclopedic content', 6)
  ON CONFLICT (category_id, slug) DO NOTHING;
END $$;

-- Utility Website Subcategories
DO $$
DECLARE
  cat_id uuid;
BEGIN
  SELECT id INTO cat_id FROM website_categories WHERE slug = 'utility';

  INSERT INTO website_subcategories (category_id, name, slug, description, display_order) VALUES
    (cat_id, 'Financial Calculators', 'financial-calculators', 'Money and investment tools', 1),
    (cat_id, 'Health Calculators', 'health-calculators', 'Health and fitness tools', 2),
    (cat_id, 'Developer Resources', 'developer-resources', 'API docs and dev tools', 3),
    (cat_id, 'Integration Guides', 'integration-guides', 'Technical integration documentation', 4)
  ON CONFLICT (category_id, slug) DO NOTHING;
END $$;

-- Entertainment Website Subcategories
DO $$
DECLARE
  cat_id uuid;
BEGIN
  SELECT id INTO cat_id FROM website_categories WHERE slug = 'entertainment';

  INSERT INTO website_subcategories (category_id, name, slug, description, display_order) VALUES
    (cat_id, 'Video Streaming', 'video-streaming', 'Video on demand platform', 1),
    (cat_id, 'Music Streaming', 'music-streaming', 'Audio streaming service', 2),
    (cat_id, 'Online Games', 'online-games', 'Browser-based gaming', 3),
    (cat_id, 'Game Reviews', 'game-reviews', 'Gaming news and reviews', 4),
    (cat_id, 'Celebrity Fan Pages', 'celebrity-fans', 'Fan sites for celebrities', 5),
    (cat_id, 'TV Show Fan Pages', 'tv-fans', 'Fan sites for TV shows', 6)
  ON CONFLICT (category_id, slug) DO NOTHING;
END $$;

-- ============================================
-- STEP 6: UPDATE DEMO_PROJECTS FOR NEW FLOW
-- ============================================

DO $$
BEGIN
  -- Category selection
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='demo_projects' AND column_name='category_id'
  ) THEN
    ALTER TABLE demo_projects ADD COLUMN category_id uuid REFERENCES website_categories(id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='demo_projects' AND column_name='subcategory_id'
  ) THEN
    ALTER TABLE demo_projects ADD COLUMN subcategory_id uuid REFERENCES website_subcategories(id);
  END IF;

  -- Custom category (user-submitted, uses AI)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='demo_projects' AND column_name='custom_category'
  ) THEN
    ALTER TABLE demo_projects ADD COLUMN custom_category text;
  END IF;

  -- Structured inputs (no AI needed)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='demo_projects' AND column_name='tagline'
  ) THEN
    ALTER TABLE demo_projects ADD COLUMN tagline text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='demo_projects' AND column_name='mission_statement'
  ) THEN
    ALTER TABLE demo_projects ADD COLUMN mission_statement text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='demo_projects' AND column_name='target_audience'
  ) THEN
    ALTER TABLE demo_projects ADD COLUMN target_audience text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='demo_projects' AND column_name='primary_service'
  ) THEN
    ALTER TABLE demo_projects ADD COLUMN primary_service text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='demo_projects' AND column_name='num_sections'
  ) THEN
    ALTER TABLE demo_projects ADD COLUMN num_sections integer DEFAULT 5;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='demo_projects' AND column_name='color_palette'
  ) THEN
    ALTER TABLE demo_projects ADD COLUMN color_palette text;
  END IF;

  -- Objection handling
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='demo_projects' AND column_name='objection_response'
  ) THEN
    ALTER TABLE demo_projects ADD COLUMN objection_response text;
    -- Values: 'too_expensive', 'not_ready', 'all_options', null (bought $190)
  END IF;

  -- Promo code tracking
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='demo_projects' AND column_name='promo_code_used'
  ) THEN
    ALTER TABLE demo_projects ADD COLUMN promo_code_used text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='demo_projects' AND column_name='entry_fee_paid'
  ) THEN
    ALTER TABLE demo_projects ADD COLUMN entry_fee_paid boolean DEFAULT false;
    -- true if they paid $5 or used valid promo code
  END IF;

  -- Preview expiration (for rate limiting)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='demo_projects' AND column_name='preview_generated_at'
  ) THEN
    ALTER TABLE demo_projects ADD COLUMN preview_generated_at timestamp;
  END IF;

  RAISE NOTICE '✅ demo_projects table updated for new flow';
END $$;

-- ============================================
-- STEP 7: CREATE INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_website_categories_slug ON website_categories(slug);
CREATE INDEX IF NOT EXISTS idx_website_categories_active ON website_categories(is_active, display_order);
CREATE INDEX IF NOT EXISTS idx_website_subcategories_category ON website_subcategories(category_id);
CREATE INDEX IF NOT EXISTS idx_website_subcategories_slug ON website_subcategories(category_id, slug);
CREATE INDEX IF NOT EXISTS idx_user_category_submissions_status ON user_category_submissions(status);
CREATE INDEX IF NOT EXISTS idx_user_category_submissions_email ON user_category_submissions(user_email);
CREATE INDEX IF NOT EXISTS idx_demo_projects_category ON demo_projects(category_id);
CREATE INDEX IF NOT EXISTS idx_demo_projects_email_preview ON demo_projects(user_email, preview_generated_at);

-- ============================================
-- STEP 8: ENABLE RLS
-- ============================================

ALTER TABLE website_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE website_subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_category_submissions ENABLE ROW LEVEL SECURITY;

-- Categories are public read
CREATE POLICY "Public can view active categories"
  ON website_categories FOR SELECT
  USING (is_active = true);

CREATE POLICY "Public can view active subcategories"
  ON website_subcategories FOR SELECT
  USING (is_active = true);

-- Admin can manage categories
CREATE POLICY "Admin can manage categories"
  ON website_categories FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Admin can manage subcategories"
  ON website_subcategories FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Users can submit categories
CREATE POLICY "Anyone can submit categories"
  ON user_category_submissions FOR INSERT
  WITH CHECK (true);

-- Users can view own submissions
CREATE POLICY "Users can view own submissions"
  ON user_category_submissions FOR SELECT
  USING (user_email = auth.email());

-- Admin can manage submissions
CREATE POLICY "Admin can manage submissions"
  ON user_category_submissions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- ============================================
-- STEP 9: RATE LIMITING FUNCTION
-- ============================================

-- Check if email has already generated a preview
CREATE OR REPLACE FUNCTION check_preview_limit(check_email text)
RETURNS boolean AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM demo_projects
    WHERE user_email = check_email
    AND preview_generated_at IS NOT NULL
  );
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- VERIFICATION
-- ============================================

DO $$
DECLARE
  cat_count integer;
  subcat_count integer;
BEGIN
  SELECT COUNT(*) INTO cat_count FROM website_categories;
  SELECT COUNT(*) INTO subcat_count FROM website_subcategories;

  RAISE NOTICE '';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '✅ SMART PREVIEW GENERATOR SCHEMA COMPLETE!';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '';
  RAISE NOTICE 'Tables created:';
  RAISE NOTICE '  • website_categories (% rows)', cat_count;
  RAISE NOTICE '  • website_subcategories (% rows)', subcat_count;
  RAISE NOTICE '  • user_category_submissions';
  RAISE NOTICE '';
  RAISE NOTICE 'demo_projects columns added:';
  RAISE NOTICE '  • category_id, subcategory_id';
  RAISE NOTICE '  • custom_category (AI-processed)';
  RAISE NOTICE '  • tagline, mission_statement, target_audience';
  RAISE NOTICE '  • primary_service, num_sections, color_palette';
  RAISE NOTICE '  • objection_response, promo_code_used';
  RAISE NOTICE '  • entry_fee_paid, preview_generated_at';
  RAISE NOTICE '';
  RAISE NOTICE 'Ready for Smart Preview Generator! 🚀';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
END $$;
