-- Add Architecture Toolkit Resources with Supabase Storage URLs
-- Run this in Supabase SQL Editor
--
-- Prerequisites:
-- 1. Files uploaded to Supabase Storage bucket 'toolkit-files'
-- 2. Bucket should be PRIVATE (not public)
-- 3. Your app will generate signed URLs for authenticated purchasers

-- ========================================
-- 1. Update React Query resource (remove video)
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
  '["CLAUDE_CLI_COMMANDS_GUIDE.md"]'::jsonb,
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
  '["IMPLEMENTATION_ROADMAP.md"]'::jsonb,
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
  '["REPOSITORY_PATTERN_GUIDE.md"]'::jsonb,
  2,
  3,
  'intermediate',
  10
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
  '["DEPENDENCY_INJECTION_GUIDE.md"]'::jsonb,
  2,
  3,
  'intermediate',
  10
) ON CONFLICT (product_id, slug) DO UPDATE SET
  description = EXCLUDED.description,
  file_urls = EXCLUDED.file_urls;

-- ========================================
-- 6. Add Toolkit README
-- ========================================

INSERT INTO product_contents (
  product_id,
  content_type_id,
  category,
  name,
  slug,
  description,
  file_urls,
  time_saved_min,
  time_saved_max,
  difficulty,
  sort_order
) VALUES (
  (SELECT id FROM products WHERE slug = 'architecture-toolkit'),
  (SELECT id FROM content_types WHERE slug = 'guide'),
  'Getting Started',
  'Toolkit Documentation Overview',
  'toolkit-documentation-overview',
  'Complete overview of all documentation and guides included in your Architecture Toolkit. Navigate through guides, understand the recommended reading order, and see time savings estimates.',
  '["README.md"]'::jsonb,
  0,
  0,
  'beginner',
  0
) ON CONFLICT (product_id, slug) DO UPDATE SET
  description = EXCLUDED.description,
  file_urls = EXCLUDED.file_urls;

-- ========================================
-- 7. Verify all resources were added
-- ========================================

SELECT
  category,
  name,
  slug,
  CASE WHEN claude_command IS NOT NULL THEN '✓ Has command' ELSE '✗ No command' END as has_command,
  CASE WHEN video_url IS NOT NULL THEN '✓ Has video' ELSE '✗ No video' END as has_video,
  CASE WHEN file_urls IS NOT NULL THEN '✓ Has files' ELSE '✗ No files' END as has_files,
  file_urls,
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

-- Should show 9 resources total:
-- Getting Started: 3 (CLI Guide, Roadmap, README)
-- Data Architecture: 2 (Repository Starter + Guide)
-- Code Organization: 2 (DI Setup + Guide)
-- AI Prompts: 1 (Debugging Prompts)
-- Performance Optimization: 1 (React Query)

-- ========================================
-- IMPORTANT: Update your product page code
-- ========================================

-- The file_urls now reference files in Supabase Storage: 'toolkit-files' bucket
-- Since the bucket is PRIVATE, you need to generate signed URLs

-- Example code to add to your Architecture Toolkit page:
/*

// In src/app/portal/products/architecture-toolkit/page.tsx

const downloadFile = async (fileName: string) => {
  try {
    const { data, error } = await supabase.storage
      .from('toolkit-files')
      .createSignedUrl(fileName, 3600) // 1 hour expiry

    if (error) {
      console.error('Error creating signed URL:', error)
      alert('Failed to download file. Please try again.')
      return
    }

    // Open download in new tab
    window.open(data.signedUrl, '_blank')
  } catch (error) {
    console.error('Download error:', error)
    alert('Failed to download file.')
  }
}

// Update the download button in your content display:
{content.file_urls && content.file_urls.length > 0 && (
  <Button
    size="sm"
    variant="outline"
    onClick={() => downloadFile(content.file_urls[0])}
  >
    <Download className="h-4 w-4 mr-2" />
    Download Guide
  </Button>
)}

*/

-- ========================================
-- Testing the setup
-- ========================================

-- After running this script, test by:
-- 1. Login as a user who purchased the toolkit
-- 2. Go to Architecture Toolkit product page
-- 3. Expand a guide resource
-- 4. Click the download button
-- 5. Verify the file downloads correctly

-- If you get errors, check:
-- - Bucket name is exactly 'toolkit-files'
-- - Bucket is set to PRIVATE
-- - Files were uploaded with the exact names shown in file_urls
-- - Your app has permission to create signed URLs (uses service role key server-side)
