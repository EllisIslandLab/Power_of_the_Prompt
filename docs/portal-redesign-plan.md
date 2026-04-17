# Portal Redesign Plan

## Overview
Transform the client portal from a cohort-based learning platform to a streamlined individual website building service dashboard. Focus on website preview, performance tracking, and clean navigation.

## Brand Color Palette
Based on the Web Launch logo colors:
- **Primary Navy**: `#0a1840` - Main backgrounds, headers, text
- **Accent Yellow**: `#ffdb57` - CTAs, highlights, active states
- **White**: `#ffffff` - Cards, text on dark backgrounds
- **Gray Scale**: 
  - Light gray: `#f5f5f5` - Backgrounds
  - Medium gray: `#6b7280` - Secondary text
  - Dark gray: `#374151` - Tertiary elements

## Page Structure Redesign

### Main Portal Page (`/portal/page.tsx`)
**Current**: Shows revision rounds, website preview, and Lighthouse scores all on one page
**New**: Clean dashboard focused on website performance and preview

**Layout**:
1. **Sidebar** (left, collapsible)
   - User info with online indicator
   - Navigation links
   - Sign out button

2. **Main Content Area**
   - Welcome header
   - Website Preview Component (expanded)
   - Lighthouse Scores with Progress Chart (expanded)

**Remove from main page**:
- Revision rounds section (move to separate page)

### New Revisions Page (`/portal/revisions/page.tsx`)
Dedicated page for managing website revision requests.

**Layout**:
- Page title: "Revision Requests"
- Two-column grid:
  - Start New Revision form
  - Modify Existing Revision form
- History of past revisions (future enhancement)

### Navigation Structure
```
/portal (Main Dashboard)
├── /portal/revisions (Revision Management)
├── /portal/textbook (Website Development Guide)
├── /portal/resources (Development Resources)
└── /portal/settings (Account Settings)
```

## Component Style Guide

### 1. Sidebar (`/portal/page.tsx` - sidebar section)

**Colors**:
- Background: Navy `#0a1840`
- Text: White `#ffffff`
- Active link background: Yellow `#ffdb57` with 20% opacity
- Active link text: Yellow `#ffdb57`
- Hover state: White with 10% opacity

**Structure**:
- Fixed width: 280px (expanded), 80px (collapsed)
- Full height with sticky positioning
- Smooth transition on collapse (300ms)

**Header Section**:
- Logo/Title with online indicator
- User name (truncated if too long)
- Role badge (Admin/Client) with yellow for admin, white for client

**Navigation Items**:
- Icon + text layout
- 12px spacing between icon and text
- 8px vertical padding
- Rounded corners (6px)
- Active state: yellow background + bold text

**Footer**:
- Sign out button with outline style
- Yellow border on hover

### 2. Website Preview Component (`/components/portal/WebsitePreview.tsx`)

**Enhancements**:
- Add responsive preview controls (Desktop/Tablet/Mobile toggle)
- Larger default preview: 800px width (desktop), 768px (tablet), 375px (mobile)
- Add "Open in New Tab" button with yellow styling
- Add page selector dropdown if multiple pages exist

**Layout**:
- Card container with white background
- Navy header with website URL
- Responsive toggle buttons (yellow active state)
- Iframe preview with smooth transitions
- Yellow "Add Page" button

**Responsive Preview Widths**:
- Desktop: 1440px
- Tablet: 768px
- Mobile: 375px

### 3. Lighthouse Progress Chart (`/components/portal/LighthouseChart.tsx` - NEW)

**Technology**: Recharts library
```bash
npm install recharts
```

**Chart Type**: Line chart with multiple lines (one per metric)

**Metrics & Colors**:
- Performance: `#3b82f6` (blue)
- Accessibility: `#10b981` (green)
- Best Practices: `#8b5cf6` (purple)
- SEO: `#f59e0b` (amber)
- PWA: `#ec4899` (pink)
- Average: `#ffdb57` (yellow, bold line)

**Features**:
- X-axis: Test dates (formatted as "MM/DD")
- Y-axis: Score (0-100)
- Grid lines (subtle gray)
- Tooltip on hover showing all scores for that date
- Legend at bottom
- Responsive height: 400px
- Card background: white
- Header: Navy text "Performance History"

**Data Structure**:
```typescript
interface ChartDataPoint {
  date: string // ISO date
  performance: number
  accessibility: number
  bestPractices: number
  seo: number
  pwa: number
  average: number
}
```

### 4. Lighthouse Score Cards (`/components/portal/LighthouseScores.tsx`)

**Current**: Single row of scores
**Enhanced**: Compact card layout above the chart

**Layout**:
- Grid of 6 cards (5 metrics + average)
- Each card: 
  - Metric name (small, gray text)
  - Large score number (colored by range)
  - Small trend indicator (↑ improved, ↓ declined, → same)

**Color Coding** (keep existing):
- Green `#10b981`: 90-100
- Orange `#f59e0b`: 50-89
- Red `#ef4444`: 0-49

**Average Score Card**:
- Yellow background `#ffdb57`
- Navy text `#0a1840`
- Slightly larger than other cards
- Bold score number

### 5. Empty States

**No Website URL**:
- Centered icon (globe/link icon in gray)
- Navy heading: "Add Your Website URL"
- Gray description text
- Yellow CTA button: "Go to Settings"

**No Lighthouse Scores**:
- Centered chart icon in gray
- Navy heading: "No Performance Data Yet"
- Gray description: "Your first Lighthouse test will appear here"
- Info text: "Tests are run by the admin team"

## UX Improvements

### Navigation Flow
1. Landing on `/portal` shows immediate value (website + performance)
2. Clear path to manage revisions (sidebar link)
3. Settings easily accessible for website URL setup
4. Development resources available but not intrusive

### Website Preview Enhancements
- Add loading state with skeleton
- Error state if website URL is invalid
- Smooth transitions between responsive sizes
- Remember user's last selected size (localStorage)

### Progress Tracking Features
- Show latest score prominently
- Trend indicators (up/down arrows) comparing to previous test
- Date of last test clearly visible
- Celebration animation when average score > 90

### Accessibility
- Keyboard navigation for all interactive elements
- ARIA labels for icon-only buttons
- Focus indicators using yellow accent color
- Screen reader announcements for score updates

## Responsive Breakpoints

- **Mobile**: < 768px
  - Sidebar collapses by default
  - Website preview shows mobile size by default
  - Chart height reduced to 300px
  - Score cards stack in 2 columns

- **Tablet**: 768px - 1024px
  - Sidebar always visible but can collapse
  - Website preview shows tablet size by default
  - Full chart height
  - Score cards in 3 columns

- **Desktop**: > 1024px
  - Full sidebar expanded
  - Website preview shows desktop size by default
  - All features fully visible
  - Score cards in single row

## Implementation Order

### Phase 1: Structure (Priority)
1. Create `/portal/revisions/page.tsx` with revision forms
2. Update sidebar navigation to include new route
3. Remove revision section from main portal page

### Phase 2: Chart Integration
1. Install Recharts library
2. Create `LighthouseChart.tsx` component
3. Fetch score history from database
4. Implement responsive chart with all 6 lines
5. Add tooltip and legend

### Phase 3: Styling
1. Update sidebar with navy background and yellow accents
2. Apply new color scheme to all portal pages
3. Add smooth transitions and hover states
4. Implement responsive preview toggle

### Phase 4: Polish
1. Add loading skeletons
2. Implement empty states
3. Add trend indicators
4. Add celebration animations for high scores
5. Test accessibility compliance

### Phase 5: Testing
1. Test on mobile, tablet, desktop
2. Verify all Lighthouse metrics display correctly
3. Test chart interactions and tooltips
4. Verify navigation flow
5. Cross-browser testing

## Database Considerations

**Current schema is good**, but consider adding:
- `lighthouse_scores.trend` (computed column comparing to previous score)
- Index on `lighthouse_scores.tested_at` for faster chart queries

**Chart data query**:
```sql
SELECT 
  tested_at,
  performance,
  accessibility,
  best_practices,
  seo,
  pwa,
  (performance + accessibility + best_practices + seo + pwa) / 5.0 as average
FROM lighthouse_scores
WHERE page_id IN (
  SELECT id FROM website_pages WHERE user_id = $1
)
ORDER BY tested_at ASC;
```

## Design Principles

1. **Clarity**: Every element has a clear purpose
2. **Performance**: Fast load times, minimal re-renders
3. **Brand Consistency**: Navy, white, yellow throughout
4. **Progressive Disclosure**: Show what's needed, hide what's not
5. **Feedback**: Clear loading, success, and error states
6. **Accessibility**: WCAG 2.1 AA compliance minimum

## Success Metrics

- Client can see their website within 2 seconds of login
- Latest Lighthouse scores visible without scrolling
- No confusion about where to request revisions
- Mobile experience is equally good as desktop
- Average session time increases (indicates engagement)

---

**Created**: 2026-04-16
**Status**: Planning Phase - Not Yet Implemented
**Next Step**: Create revision page structure (Phase 1)
