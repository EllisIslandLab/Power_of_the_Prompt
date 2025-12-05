# Web Launch Academy Badge Usage

This badge can be used by students and clients of Web Launch Academy to showcase that their website was built using Web Launch Academy's methods or services.

## Badge Files

- **SVG Badge**: `/public/wla-badge.svg` (220x40px)
- **React Component**: `/src/components/ui/WLABadge.tsx`

## Usage Options

### Option 1: React Component (Recommended for Next.js/React projects)

```tsx
import { WLABadge } from '@/components/ui/WLABadge'

// Basic usage
<WLABadge />

// Custom link
<WLABadge href="https://weblaunchacademy.com" />

// Different sizes
<WLABadge size="sm" />  // 176x32
<WLABadge size="md" />  // 220x40 (default)
<WLABadge size="lg" />  // 264x48
```

### Option 2: Direct SVG Link (For any HTML website)

```html
<!-- With link to Web Launch Academy -->
<a href="https://weblaunchacademy.com" target="_blank" rel="noopener noreferrer">
  <img
    src="https://weblaunchacademy.com/wla-badge.svg"
    alt="Built with Web Launch Academy"
    width="220"
    height="40"
  />
</a>

<!-- Without link -->
<img
  src="https://weblaunchacademy.com/wla-badge.svg"
  alt="Built with Web Launch Academy"
  width="220"
  height="40"
/>
```

### Option 3: Download and Self-Host

1. Download `/public/wla-badge.svg` from this project
2. Add it to your website's assets folder
3. Reference it in your HTML:

```html
<a href="https://weblaunchacademy.com" target="_blank" rel="noopener noreferrer">
  <img
    src="/path/to/wla-badge.svg"
    alt="Built with Web Launch Academy"
    width="220"
    height="40"
  />
</a>
```

## Badge Design

The badge features:
- **Colors**: Navy blue (#0a1840) background with mustard yellow (#ffdb57) accent
- **Logo**: Official Web Launch Academy orbital logo (32×32px, same as navigation)
- **Text**: "Built with Web Launch Academy"
- **Dimensions**: 220×40 pixels (default), scalable as SVG
- **Style**: Professional, modern, matches Web Launch Academy branding

## When to Use

✅ **Appropriate Usage:**
- Websites built by Web Launch Academy students
- Sites developed by Web Launch Academy
- Projects created using Web Launch Academy's methods and training
- Client websites built with Web Launch Academy's assistance

❌ **Inappropriate Usage:**
- Websites not affiliated with Web Launch Academy
- Sites not built using Web Launch Academy's methods

## Placement Recommendations

Common placements:
- Footer (most common)
- About page
- Contact page
- Site credits section

## Questions?

Contact Web Launch Academy at:
- Email: hello@weblaunchacademy.com
- Phone: (440) 354-9904
- Website: https://weblaunchacademy.com
