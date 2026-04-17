-- ============================================
-- Create Website Pages and Lighthouse Tracking
-- ============================================
--
-- This migration creates:
-- - website_pages table for tracking multiple pages per client
-- - lighthouse_scores table for tracking performance metrics
--
-- Date: 2026-04-17
-- ============================================

-- Website Pages
CREATE TABLE IF NOT EXISTS website_pages (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,

  -- Page details
  page_name text NOT NULL, -- e.g., "Home", "About", "Contact"
  page_path text NOT NULL, -- e.g., "/", "/about", "/contact"
  full_url text, -- Full URL if different from website_url + page_path
  is_primary boolean DEFAULT false, -- Is this the main page?

  -- Display
  order_index integer NOT NULL DEFAULT 0,

  -- Timestamps
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now(),

  -- Ensure unique page paths per user
  UNIQUE(user_id, page_path)
);

-- Lighthouse Scores
CREATE TABLE IF NOT EXISTS lighthouse_scores (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  page_id uuid REFERENCES website_pages(id) ON DELETE CASCADE,

  -- Lighthouse metrics (0-100 scale)
  performance integer CHECK (performance >= 0 AND performance <= 100),
  accessibility integer CHECK (accessibility >= 0 AND accessibility <= 100),
  best_practices integer CHECK (best_practices >= 0 AND best_practices <= 100),
  seo integer CHECK (seo >= 0 AND seo <= 100),
  pwa integer CHECK (pwa >= 0 AND pwa <= 100),

  -- Overall score (average)
  overall_score integer GENERATED ALWAYS AS (
    (COALESCE(performance, 0) + COALESCE(accessibility, 0) +
     COALESCE(best_practices, 0) + COALESCE(seo, 0) + COALESCE(pwa, 0)) / 5
  ) STORED,

  -- Test details
  tested_url text,
  tested_by uuid REFERENCES users(id), -- Admin who ran the test
  test_notes text,

  -- Raw Lighthouse JSON data (optional, for detailed analysis)
  raw_data jsonb,

  -- Timestamps
  tested_at timestamp DEFAULT now(),
  created_at timestamp DEFAULT now()
);

-- Drop old project_milestones table (replaced by lighthouse_scores)
DROP TABLE IF EXISTS project_milestones CASCADE;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_website_pages_user_id ON website_pages(user_id);
CREATE INDEX IF NOT EXISTS idx_website_pages_is_primary ON website_pages(is_primary) WHERE is_primary = true;
CREATE INDEX IF NOT EXISTS idx_lighthouse_scores_user_id ON lighthouse_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_lighthouse_scores_page_id ON lighthouse_scores(page_id);
CREATE INDEX IF NOT EXISTS idx_lighthouse_scores_tested_at ON lighthouse_scores(tested_at DESC);

-- RLS Policies
ALTER TABLE website_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE lighthouse_scores ENABLE ROW LEVEL SECURITY;

-- Users can view their own pages
CREATE POLICY "Users can view own pages"
  ON website_pages FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own pages"
  ON website_pages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pages"
  ON website_pages FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own pages"
  ON website_pages FOR DELETE
  USING (auth.uid() = user_id);

-- Admins can manage all pages
CREATE POLICY "Admins can manage all pages"
  ON website_pages FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Users can view their own lighthouse scores
CREATE POLICY "Users can view own scores"
  ON lighthouse_scores FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can view and insert all lighthouse scores
CREATE POLICY "Admins can manage all scores"
  ON lighthouse_scores FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_website_pages_updated_at ON website_pages;
CREATE TRIGGER update_website_pages_updated_at
  BEFORE UPDATE ON website_pages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to get latest lighthouse scores for a user
CREATE OR REPLACE FUNCTION get_latest_lighthouse_scores(p_user_id uuid)
RETURNS TABLE (
  page_id uuid,
  page_name text,
  page_path text,
  performance integer,
  accessibility integer,
  best_practices integer,
  seo integer,
  pwa integer,
  overall_score integer,
  tested_at timestamp
) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT ON (wp.id)
    wp.id,
    wp.page_name,
    wp.page_path,
    ls.performance,
    ls.accessibility,
    ls.best_practices,
    ls.seo,
    ls.pwa,
    ls.overall_score,
    ls.tested_at
  FROM website_pages wp
  LEFT JOIN lighthouse_scores ls ON ls.page_id = wp.id
  WHERE wp.user_id = p_user_id
  ORDER BY wp.id, ls.tested_at DESC NULLS LAST;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comments
COMMENT ON TABLE website_pages IS 'Tracks individual pages of client websites';
COMMENT ON TABLE lighthouse_scores IS 'Lighthouse performance scores for website pages';
COMMENT ON FUNCTION get_latest_lighthouse_scores IS 'Gets the most recent lighthouse scores for each page of a user';

-- Verify
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '✅ Created website pages and Lighthouse tracking system';
  RAISE NOTICE '   - website_pages: Track multiple pages per client';
  RAISE NOTICE '   - lighthouse_scores: Performance, accessibility, SEO, PWA metrics';
  RAISE NOTICE '   - Dropped old project_milestones table';
  RAISE NOTICE '';
END $$;
