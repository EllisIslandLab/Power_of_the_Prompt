-- Demo Site Generator Migration
-- This migration creates the database structure for the demo site generator feature
-- allowing users to create website previews without authentication

-- =======================
-- TEMPLATE CATEGORIES TABLE
-- =======================
-- Three-level hierarchy: Top Level > Mid Level > Niche
-- Example: Professional Services > Financial > Ramsey Preferred Coaches
CREATE TABLE IF NOT EXISTS template_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  level INTEGER NOT NULL CHECK (level IN (1, 2, 3)),
  parent_id UUID REFERENCES template_categories(id) ON DELETE CASCADE,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Ensure level 1 has no parent, levels 2 and 3 must have parent
  CONSTRAINT valid_parent CHECK (
    (level = 1 AND parent_id IS NULL) OR
    (level > 1 AND parent_id IS NOT NULL)
  )
);

-- =======================
-- NICHE TEMPLATES TABLE
-- =======================
-- Templates for specific niches (bottom-level categories)
CREATE TABLE IF NOT EXISTS niche_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES template_categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,

  -- Template configuration
  is_active BOOLEAN NOT NULL DEFAULT false, -- Only one active for MVP (Ramsey Coach)
  form_steps JSONB NOT NULL, -- Configuration for multi-step form
  html_generator_config JSONB, -- Settings for HTML generation
  preview_thumbnail_url TEXT,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =======================
-- DEMO PROJECTS TABLE
-- =======================
-- User-submitted demo projects (no authentication required)
CREATE TABLE IF NOT EXISTS demo_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES niche_templates(id) ON DELETE CASCADE,

  -- User contact information (no foreign key - open to public)
  user_email TEXT NOT NULL,
  business_contact_email TEXT,

  -- Business information
  business_name TEXT NOT NULL,
  tagline TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,

  -- Services (1-5 services with title and description)
  services JSONB NOT NULL, -- Array of {title, description}

  -- Additional customizations
  colors JSONB, -- {primary, secondary, accent}
  custom_fields JSONB DEFAULT '{}', -- Template-specific fields

  -- Generated content
  generated_html TEXT, -- Full HTML preview
  preview_url TEXT, -- Optional: S3/CDN URL if we store generated HTML

  -- Status tracking
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'generated', 'viewed', 'converted')),
  viewed_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Email validation
  CONSTRAINT user_email_format CHECK (user_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  CONSTRAINT business_email_format CHECK (
    business_contact_email IS NULL OR
    business_contact_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
  ),

  -- Services array must have 1-5 items
  CONSTRAINT services_count CHECK (jsonb_array_length(services) >= 1 AND jsonb_array_length(services) <= 5)
);

-- =======================
-- DEMO INTERACTIONS TABLE
-- =======================
-- Track user interactions with demo projects for conversion tracking
CREATE TABLE IF NOT EXISTS demo_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  demo_project_id UUID NOT NULL REFERENCES demo_projects(id) ON DELETE CASCADE,

  -- Interaction type
  interaction_type TEXT NOT NULL CHECK (interaction_type IN (
    'viewed_preview',
    'clicked_textbook',
    'purchased_textbook',
    'clicked_book_call',
    'booked_call',
    'opened_email',
    'clicked_email_link'
  )),

  -- Metadata
  metadata JSONB DEFAULT '{}', -- Additional data about the interaction

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =======================
-- INDEXES
-- =======================
CREATE INDEX IF NOT EXISTS idx_template_categories_level ON template_categories(level);
CREATE INDEX IF NOT EXISTS idx_template_categories_parent_id ON template_categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_template_categories_slug ON template_categories(slug);
CREATE INDEX IF NOT EXISTS idx_template_categories_active ON template_categories(is_active);

CREATE INDEX IF NOT EXISTS idx_niche_templates_category_id ON niche_templates(category_id);
CREATE INDEX IF NOT EXISTS idx_niche_templates_slug ON niche_templates(slug);
CREATE INDEX IF NOT EXISTS idx_niche_templates_active ON niche_templates(is_active);

CREATE INDEX IF NOT EXISTS idx_demo_projects_template_id ON demo_projects(template_id);
CREATE INDEX IF NOT EXISTS idx_demo_projects_user_email ON demo_projects(user_email);
CREATE INDEX IF NOT EXISTS idx_demo_projects_status ON demo_projects(status);
CREATE INDEX IF NOT EXISTS idx_demo_projects_created_at ON demo_projects(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_demo_interactions_demo_project_id ON demo_interactions(demo_project_id);
CREATE INDEX IF NOT EXISTS idx_demo_interactions_type ON demo_interactions(interaction_type);
CREATE INDEX IF NOT EXISTS idx_demo_interactions_created_at ON demo_interactions(created_at DESC);

-- =======================
-- ROW LEVEL SECURITY
-- =======================
ALTER TABLE template_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE niche_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE demo_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE demo_interactions ENABLE ROW LEVEL SECURITY;

-- Public can view active categories and templates (for form display)
CREATE POLICY "Anyone can view active template categories"
  ON template_categories
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Anyone can view active niche templates"
  ON niche_templates
  FOR SELECT
  USING (is_active = true);

-- Public can create demo projects (no authentication required)
CREATE POLICY "Anyone can create demo projects"
  ON demo_projects
  FOR INSERT
  WITH CHECK (true);

-- Public can view their own demo projects by email
CREATE POLICY "Users can view own demo projects"
  ON demo_projects
  FOR SELECT
  USING (true); -- We'll filter by email in application code

-- Public can update their own demo projects (for status changes)
CREATE POLICY "Anyone can update demo projects"
  ON demo_projects
  FOR UPDATE
  USING (true);

-- Public can create interactions
CREATE POLICY "Anyone can create interactions"
  ON demo_interactions
  FOR INSERT
  WITH CHECK (true);

-- Admins can manage everything
CREATE POLICY "Admins can manage template categories"
  ON template_categories
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Admins can manage niche templates"
  ON niche_templates
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Admins can view all demo projects"
  ON demo_projects
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Admins can view all interactions"
  ON demo_interactions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- =======================
-- TRIGGERS
-- =======================
-- Function to validate template belongs to level 3 category
CREATE OR REPLACE FUNCTION validate_template_category_level()
RETURNS TRIGGER AS $$
DECLARE
  cat_level INTEGER;
BEGIN
  SELECT level INTO cat_level
  FROM template_categories
  WHERE id = NEW.category_id;

  IF cat_level != 3 THEN
    RAISE EXCEPTION 'Template must belong to a level 3 (niche) category';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to validate category level on insert/update
DROP TRIGGER IF EXISTS validate_template_category_trigger ON niche_templates;
CREATE TRIGGER validate_template_category_trigger
  BEFORE INSERT OR UPDATE ON niche_templates
  FOR EACH ROW
  EXECUTE FUNCTION validate_template_category_level();

-- Trigger for updated_at on template_categories
DROP TRIGGER IF EXISTS update_template_categories_updated_at ON template_categories;
CREATE TRIGGER update_template_categories_updated_at
  BEFORE UPDATE ON template_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for updated_at on niche_templates
DROP TRIGGER IF EXISTS update_niche_templates_updated_at ON niche_templates;
CREATE TRIGGER update_niche_templates_updated_at
  BEFORE UPDATE ON niche_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for updated_at on demo_projects
DROP TRIGGER IF EXISTS update_demo_projects_updated_at ON demo_projects;
CREATE TRIGGER update_demo_projects_updated_at
  BEFORE UPDATE ON demo_projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =======================
-- SEED DATA
-- =======================
-- Insert three-level category hierarchy
-- Level 1: Professional Services
INSERT INTO template_categories (name, slug, description, level, parent_id, display_order, is_active)
VALUES (
  'Professional Services',
  'professional-services',
  'Templates for professional service providers',
  1,
  NULL,
  1,
  true
) ON CONFLICT (slug) DO NOTHING;

-- Level 2: Financial (under Professional Services)
INSERT INTO template_categories (name, slug, description, level, parent_id, display_order, is_active)
VALUES (
  'Financial',
  'financial',
  'Templates for financial professionals',
  2,
  (SELECT id FROM template_categories WHERE slug = 'professional-services'),
  1,
  true
) ON CONFLICT (slug) DO NOTHING;

-- Level 3: Ramsey Preferred Coaches (under Financial)
INSERT INTO template_categories (name, slug, description, level, parent_id, display_order, is_active)
VALUES (
  'Ramsey Preferred Coaches',
  'ramsey-preferred-coaches',
  'Templates specifically designed for Ramsey Preferred financial coaches',
  3,
  (SELECT id FROM template_categories WHERE slug = 'financial'),
  1,
  true
) ON CONFLICT (slug) DO NOTHING;

-- Insert Ramsey Preferred Coach template
INSERT INTO niche_templates (
  category_id,
  name,
  slug,
  description,
  is_active,
  form_steps,
  html_generator_config
)
VALUES (
  (SELECT id FROM template_categories WHERE slug = 'ramsey-preferred-coaches'),
  'Ramsey Preferred Coach Website',
  'ramsey-coach-website',
  'Professional website template for Ramsey Preferred financial coaches',
  true, -- This is the active template for MVP
  '{
    "steps": [
      {
        "id": 1,
        "title": "Business Information",
        "fields": ["businessName", "tagline", "phone", "address", "city", "state", "zip", "businessContactEmail"]
      },
      {
        "id": 2,
        "title": "Your Services",
        "description": "Add 1-5 services you offer",
        "fields": ["services"]
      },
      {
        "id": 3,
        "title": "Customize Colors",
        "fields": ["primaryColor", "secondaryColor", "accentColor"]
      },
      {
        "id": 4,
        "title": "Your Contact",
        "description": "Where should we send your preview?",
        "fields": ["userEmail"]
      }
    ]
  }'::jsonb,
  '{
    "defaultColors": {
      "primary": "#003f72",
      "secondary": "#ffd700",
      "accent": "#e85d04"
    },
    "sections": ["hero", "services", "about", "calendar", "contact"],
    "calendarType": "static"
  }'::jsonb
) ON CONFLICT (slug) DO NOTHING;

-- =======================
-- HELPER FUNCTIONS
-- =======================

-- Function to get active template with full category path
CREATE OR REPLACE FUNCTION get_active_template_with_categories()
RETURNS TABLE (
  template_id UUID,
  template_name TEXT,
  template_slug TEXT,
  level1_name TEXT,
  level2_name TEXT,
  level3_name TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    nt.id AS template_id,
    nt.name AS template_name,
    nt.slug AS template_slug,
    tc1.name AS level1_name,
    tc2.name AS level2_name,
    tc3.name AS level3_name
  FROM niche_templates nt
  JOIN template_categories tc3 ON nt.category_id = tc3.id AND tc3.level = 3
  JOIN template_categories tc2 ON tc3.parent_id = tc2.id AND tc2.level = 2
  JOIN template_categories tc1 ON tc2.parent_id = tc1.id AND tc1.level = 1
  WHERE nt.is_active = true
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Function to track demo interaction
CREATE OR REPLACE FUNCTION track_demo_interaction(
  p_demo_project_id UUID,
  p_interaction_type TEXT,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID AS $$
DECLARE
  interaction_id UUID;
BEGIN
  INSERT INTO demo_interactions (demo_project_id, interaction_type, metadata)
  VALUES (p_demo_project_id, p_interaction_type, p_metadata)
  RETURNING id INTO interaction_id;

  -- Update demo project status based on interaction
  IF p_interaction_type = 'viewed_preview' THEN
    UPDATE demo_projects
    SET status = 'viewed', viewed_at = now()
    WHERE id = p_demo_project_id AND status = 'generated';
  ELSIF p_interaction_type IN ('purchased_textbook', 'booked_call') THEN
    UPDATE demo_projects
    SET status = 'converted'
    WHERE id = p_demo_project_id;
  END IF;

  RETURN interaction_id;
END;
$$ LANGUAGE plpgsql;

-- =======================
-- COMMENTS
-- =======================
COMMENT ON TABLE template_categories IS 'Three-level category hierarchy for organizing niche templates';
COMMENT ON TABLE niche_templates IS 'Website templates for specific niches. Only one active for MVP.';
COMMENT ON TABLE demo_projects IS 'User-submitted demo projects. No authentication required.';
COMMENT ON TABLE demo_interactions IS 'Track user interactions for conversion analytics';

COMMENT ON COLUMN demo_projects.user_email IS 'Personal email of form submitter (for admin follow-up)';
COMMENT ON COLUMN demo_projects.business_contact_email IS 'Business email displayed on their website (for clients to contact)';
COMMENT ON COLUMN demo_projects.services IS 'Array of 1-5 services, each with title and description';
COMMENT ON COLUMN niche_templates.is_active IS 'Only one template active for MVP (Ramsey Coach). Others ready for Phase 2.';
