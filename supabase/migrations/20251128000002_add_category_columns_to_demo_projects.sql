-- Add category-related columns to demo_projects for three-round flow
-- Migration: 20251128000002

-- Add category_id column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'demo_projects' AND column_name = 'category_id'
  ) THEN
    ALTER TABLE demo_projects ADD COLUMN category_id uuid REFERENCES website_categories(id);
  END IF;
END $$;

-- Add subcategory_id column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'demo_projects' AND column_name = 'subcategory_id'
  ) THEN
    ALTER TABLE demo_projects ADD COLUMN subcategory_id uuid REFERENCES website_subcategories(id);
  END IF;
END $$;

-- Add custom_category column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'demo_projects' AND column_name = 'custom_category'
  ) THEN
    ALTER TABLE demo_projects ADD COLUMN custom_category text;
  END IF;
END $$;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_demo_projects_category_id ON demo_projects(category_id);
CREATE INDEX IF NOT EXISTS idx_demo_projects_subcategory_id ON demo_projects(subcategory_id);

-- Add comment
COMMENT ON COLUMN demo_projects.category_id IS 'Reference to website_categories - determines the type of website';
COMMENT ON COLUMN demo_projects.subcategory_id IS 'Reference to website_subcategories - more specific website purpose';
COMMENT ON COLUMN demo_projects.custom_category IS 'Custom category text when user selects "Other" or needs custom option';
