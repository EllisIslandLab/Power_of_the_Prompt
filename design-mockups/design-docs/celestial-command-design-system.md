---
name: Celestial Command
colors:
  surface: '#0d112a'
  surface-dim: '#0d112a'
  surface-bright: '#343752'
  surface-container-lowest: '#080c25'
  surface-container-low: '#161a33'
  surface-container: '#1a1e37'
  surface-container-high: '#242842'
  surface-container-highest: '#2f334e'
  on-surface: '#dee0ff'
  on-surface-variant: '#c4c7c8'
  inverse-surface: '#dee0ff'
  inverse-on-surface: '#2b2f49'
  outline: '#8e9192'
  outline-variant: '#444748'
  surface-tint: '#c6c6c7'
  primary: '#ffffff'
  on-primary: '#2f3131'
  primary-container: '#e2e2e2'
  on-primary-container: '#636565'
  inverse-primary: '#5d5f5f'
  secondary: '#b0c6ff'
  on-secondary: '#032d6e'
  secondary-container: '#274788'
  on-secondary-container: '#9bb7ff'
  tertiary: '#ffffff'
  on-tertiary: '#323200'
  tertiary-container: '#e8ea23'
  on-tertiary-container: '#676800'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e2e2e2'
  primary-fixed-dim: '#c6c6c7'
  on-primary-fixed: '#1a1c1c'
  on-primary-fixed-variant: '#454747'
  secondary-fixed: '#d9e2ff'
  secondary-fixed-dim: '#b0c6ff'
  on-secondary-fixed: '#001945'
  on-secondary-fixed-variant: '#244485'
  tertiary-fixed: '#e8ea23'
  tertiary-fixed-dim: '#cccd00'
  on-tertiary-fixed: '#1c1d00'
  on-tertiary-fixed-variant: '#494900'
  background: '#0d112a'
  on-background: '#dee0ff'
  surface-variant: '#2f334e'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.2'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '700'
    lineHeight: '1'
    letterSpacing: 0.1em
  mono-label:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '500'
    lineHeight: '1'
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: '8'
  gutter: '24'
  margin-desktop: '64'
  margin-mobile: '20'
  container-max: '1440'
---

## Brand & Style

This design system is built for a premium, high-stakes learning environment. The brand personality is authoritative yet visionary, positioning the user as a commander at the helm of their own technical journey. 

The aesthetic leverages **Glassmorphism** and **High-Contrast Accents** to create a "Head-Up Display" (HUD) feel. By combining deep space voids with luminescent white elements, the UI evokes a sense of prestige and futuristic precision. Visual interest is maintained through high-tech "laser" motifs—thin, glowing lines that act as separators or decorative flourishes—reinforcing the theme of a mission control dashboard.

## Colors

The palette is anchored in the vastness of space. The background uses a near-black navy to provide infinite depth, while the secondary navy creates structural layers.

- **Primary (White):** Used for critical actions, active states, and "laser" accents. It should always carry a subtle `0 0 8px rgba(255, 255, 255, 0.4)` outer glow to simulate light emission.
- **Secondary (Deep Navy):** Used for solid container backgrounds and structural elements where glass transparency might hinder legibility.
- **Tertiary (Electric Lime):** A high-visibility, technical yellow-green used for critical readouts, prioritized alerts, and auxiliary system data that requires immediate attention.
- **Surface (Glass):** A semi-transparent layer that relies on backdrop-filtering to create separation from the background.
- **Functional Colors:** Success states utilize a vibrant teal, while alerts use a high-visibility orange-red, maintaining the "instrument panel" color logic.

## Typography

The typography system is purely functional and modern, utilizing **Inter** for its exceptional legibility in dark-mode interfaces. 

To emphasize the "Command Center" aesthetic, use the `label-caps` style for section headers and metadata. This high-tracking, uppercase treatment mimics technical readouts found on aerospace equipment. Headlines should remain tight and bold, serving as the primary anchor points for the eye amidst the dark, translucent layers.

## Layout & Spacing

This design system employs a **Fluid Grid** with fixed outer margins. The layout is structured on an 8px base unit to ensure alignment across complex dashboard components.

- **Desktop:** 12-column grid. Elements should feel expansive, with generous internal padding (min 32px) within glass cards to allow the background nebula effects to breathe.
- **Mobile:** 4-column grid. Glass containers lose their side margins to maximize screen real estate, appearing as full-width "strips" separated by white laser-line dividers.
- **Density:** High density is preferred for data-heavy views (the "Command Center"), while learning content should utilize lower density with centered maximum-width containers (800px) for optimal reading.

## Elevation & Depth

Depth is established through **optical layering** rather than traditional shadows. 

1.  **Level 0 (Deep Space):** The base `#0A0E27` background, often featuring a subtle, fixed-position star-field texture or low-opacity nebula gradient.
2.  **Level 1 (Orbital):** Glass containers (`rgba(255, 255, 255, 0.05)`) with a 10px backdrop blur. These containers feature a 1px border at `rgba(255, 255, 255, 0.1)` to define their edges.
3.  **Level 2 (Active/Critical):** Elements highlighted with the Primary White or Tertiary Electric Lime. These use "laser" borders—1px solid strokes with a soft outer glow.
4.  **Level 3 (Overlay):** Modals and tooltips use a darker navy base (`#002B6C`) at 90% opacity to ensure total focus, appearing to float "closest" to the viewer.

## Shapes

The shape language is **Soft** but disciplined. 

The standard radius is 4px (`rounded-sm`), providing a hint of approachability without sacrificing the professional, "engineered" feel of the interface. Interactive elements like buttons and chips should feel like tactile glass panels. Extreme roundedness (pills) is reserved exclusively for status indicators (e.g., "Active Mission" tags) to distinguish them from structural UI components.

## Components

### Buttons
Primary buttons are solid White (`#FFFFFF`) with black text for maximum contrast. Secondary buttons use a glass background with a 1px white border. Tertiary buttons utilize the Electric Lime (`#D8DA00`) for high-priority system actions or alerts. All buttons utilize a `transition: all 0.2s ease` with a slight brightness increase on hover.

### Input Fields
Inputs are dark Navy boxes with a 1px glass border. Upon focus, the border transitions to Primary White with a subtle glow effect, and the label (using `label-caps`) shifts its color to white.

### Cards & Containers
Containers must use `backdrop-filter: blur(10px)`. To enhance the premium feel, add a "Laser Strip"—a 2px horizontal white line—to the top or bottom edge of a card to signify its priority or category.

### Chips & Tags
Small, low-profile elements with `mono-label` typography. Used for categorizing course modules or technical stack tags. They should have a subtle background tint based on their functional meaning (e.g., teal for "React", electric lime for "High Priority").

### Progress Indicators
Progress bars should be rendered as "Power Cells"—segmented bars where the filled portion glows in Primary White, evoking a charging battery or system energy level.