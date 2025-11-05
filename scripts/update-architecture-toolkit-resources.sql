-- Update Architecture Toolkit Resources
-- This script:
-- 1. Updates React Query resource to remove video and add Claude command
-- 2. Adds new Implementation Guides as resources
-- 3. Adds Claude CLI Commands Guide as a resource
-- 4. Adds Implementation Roadmap as a resource

-- Run this in Supabase SQL Editor after deployment

-- ========================================
-- 1. Update React Query resource
-- ========================================

UPDATE product_contents
SET
  video_url = NULL,
  claude_command = 'claude "set up React Query (TanStack Query) with TypeScript, include custom hooks for data fetching, mutations, and optimistic updates"',
  description = 'Complete implementation guide for React Query (TanStack Query) including automatic caching, background refetching, optimistic updates, and TypeScript integration. Transform your data fetching from complex useState/useEffect logic into simple, declarative hooks.'
WHERE slug = 'react-query-setup-walkthrough'
  AND product_id = (SELECT id FROM products WHERE slug = 'architecture-toolkit');

-- ========================================
-- 2. Add Claude CLI Commands Guide
-- ========================================

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
  (SELECT id FROM content_types WHERE slug = 'guide'),
  'Getting Started',
  'Claude CLI Commands Guide',
  'claude-cli-commands-guide',
  'Complete guide to using Claude CLI with your Architecture Toolkit. Learn how to run commands, customize prompts for your project, iterate on generated code, and maximize the value of your toolkit. Essential reading before implementing any patterns.',
  'Start here! This guide teaches you how to use all the Claude CLI commands in your toolkit.',
  '["https://your-storage-url/toolkit/CLAUDE_CLI_COMMANDS_GUIDE.md"]'::jsonb,
  0,
  1,
  'beginner',
  1
) ON CONFLICT (product_id, slug) DO UPDATE SET
  description = EXCLUDED.description,
  claude_command = EXCLUDED.claude_command,
  file_urls = EXCLUDED.file_urls;

-- ========================================
-- 3. Add Implementation Roadmap
-- ========================================

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
  (SELECT id FROM content_types WHERE slug = 'guide'),
  'Getting Started',
  'Implementation Roadmap',
  'implementation-roadmap',
  'Strategic guide for implementing all toolkit patterns in the optimal order. Includes weekly schedules, success metrics, troubleshooting, and completion checklists. Follow this roadmap to build your architecture systematically and avoid common pitfalls.',
  'Follow this roadmap to implement patterns in the right order for maximum benefit.',
  '["https://your-storage-url/toolkit/IMPLEMENTATION_ROADMAP.md"]'::jsonb,
  0,
  1,
  'beginner',
  2
) ON CONFLICT (product_id, slug) DO UPDATE SET
  description = EXCLUDED.description,
  claude_command = EXCLUDED.claude_command,
  file_urls = EXCLUDED.file_urls;

-- ========================================
-- 4. Add Repository Pattern Guide
-- ========================================

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
  (SELECT id FROM content_types WHERE slug = 'guide'),
  'Data Architecture',
  'Repository Pattern Implementation Guide',
  'repository-pattern-implementation-guide',
  'Comprehensive guide to implementing the Repository Pattern. Covers when to use it, step-by-step implementation, code examples, testing strategies, common pitfalls, and advanced features like caching and query builders. Complete with before/after examples.',
  NULL, -- Guide is the resource itself
  '["https://your-storage-url/toolkit/REPOSITORY_PATTERN_GUIDE.md"]'::jsonb,
  2,
  3,
  'intermediate',
  2
) ON CONFLICT (product_id, slug) DO UPDATE SET
  description = EXCLUDED.description,
  file_urls = EXCLUDED.file_urls;

-- ========================================
-- 5. Add Dependency Injection Guide
-- ========================================

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
  (SELECT id FROM content_types WHERE slug = 'guide'),
  'Code Organization',
  'Dependency Injection Implementation Guide',
  'dependency-injection-implementation-guide',
  'Complete guide to Dependency Injection in TypeScript. Learn how to make your code testable, swap implementations, manage service lifecycles, and configure environment-based dependencies. Includes testing strategies, mock creation, and advanced DI features.',
  NULL, -- Guide is the resource itself
  '["https://your-storage-url/toolkit/DEPENDENCY_INJECTION_GUIDE.md"]'::jsonb,
  2,
  3,
  'intermediate',
  2
) ON CONFLICT (product_id, slug) DO UPDATE SET
  description = EXCLUDED.description,
  file_urls = EXCLUDED.file_urls;

-- ========================================
-- 6. Verify updates
-- ========================================

-- Check what we have now
SELECT
  category,
  name,
  slug,
  CASE WHEN claude_command IS NOT NULL THEN '✓ Has command' ELSE '✗ No command' END as has_command,
  CASE WHEN video_url IS NOT NULL THEN '✓ Has video' ELSE '✗ No video' END as has_video,
  CASE WHEN file_urls IS NOT NULL THEN '✓ Has files' ELSE '✗ No files' END as has_files,
  difficulty,
  sort_order
FROM product_contents
WHERE product_id = (SELECT id FROM products WHERE slug = 'architecture-toolkit')
ORDER BY
  CASE category
    WHEN 'Getting Started' THEN 1
    WHEN 'Data Architecture' THEN 2
    WHEN 'Code Organization' THEN 3
    WHEN 'AI Prompts' THEN 4
    WHEN 'Performance Optimization' THEN 5
    ELSE 6
  END,
  sort_order;

-- Count resources by category
SELECT
  category,
  COUNT(*) as resource_count
FROM product_contents
WHERE product_id = (SELECT id FROM products WHERE slug = 'architecture-toolkit')
GROUP BY category
ORDER BY category;

-- ========================================
-- NOTES FOR DEPLOYMENT:
-- ========================================

-- Before running this script:
-- 1. Upload the guide files to your storage (Supabase Storage, S3, etc.)
-- 2. Replace 'https://your-storage-url/toolkit/' with your actual URLs
-- 3. Or set file_urls to NULL and deliver guides through the portal UI

-- After running this script:
-- 1. Verify the output shows all 8 resources (4 existing + 4 new)
-- 2. Check that video_url is NULL for React Query resource
-- 3. Confirm all new guides are properly categorized
-- 4. Test access from the Architecture Toolkit product page

-- Optional: If you want to remove file_urls and just show guides in the portal:
-- UPDATE product_contents
-- SET file_urls = NULL
-- WHERE slug IN (
--   'claude-cli-commands-guide',
--   'implementation-roadmap',
--   'repository-pattern-implementation-guide',
--   'dependency-injection-implementation-guide'
-- );

-- Then add guide content directly to your portal pages.
