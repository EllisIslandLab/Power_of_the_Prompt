---
name: Celestial Command
colors:
  surface: '#111415'
  surface-dim: '#111415'
  surface-bright: '#373a3b'
  surface-container-lowest: '#0c0f10'
  surface-container-low: '#191c1d'
  surface-container: '#1d2021'
  surface-container-high: '#282a2b'
  surface-container-highest: '#323536'
  on-surface: '#e1e3e4'
  on-surface-variant: '#d5c4ab'
  inverse-surface: '#e1e3e4'
  inverse-on-surface: '#2e3132'
  outline: '#9e8f78'
  outline-variant: '#514532'
  surface-tint: '#ffba20'
  primary: '#ffdca1'
  on-primary: '#412d00'
  primary-container: '#ffb800'
  on-primary-container: '#6b4c00'
  inverse-primary: '#7c5800'
  secondary: '#98cbff'
  on-secondary: '#003354'
  secondary-container: '#00a2fd'
  on-secondary-container: '#003558'
  tertiary: '#e2dfeb'
  on-tertiary: '#303038'
  tertiary-container: '#c6c3cf'
  on-tertiary-container: '#51505a'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffdea8'
  primary-fixed-dim: '#ffba20'
  on-primary-fixed: '#271900'
  on-primary-fixed-variant: '#5e4200'
  secondary-fixed: '#cfe5ff'
  secondary-fixed-dim: '#98cbff'
  on-secondary-fixed: '#001d33'
  on-secondary-fixed-variant: '#004a77'
  tertiary-fixed: '#e4e1ed'
  tertiary-fixed-dim: '#c7c5d0'
  on-tertiary-fixed: '#1b1b23'
  on-tertiary-fixed-variant: '#46464f'
  background: '#111415'
  on-background: '#e1e3e4'
  surface-variant: '#323536'
typography:
  headline-display:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '900'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '900'
    lineHeight: '1.2'
    letterSpacing: 0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '900'
    lineHeight: '1.2'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: 0.01em
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '700'
    lineHeight: '1.0'
    letterSpacing: 0.2em
  technical-data:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.4'
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 16px
  margin-mobile: 20px
  margin-desktop: 40px
  container-padding: 24px
---

## Brand & Style
The design system is a high-fidelity, technical aesthetic tailored for aerospace education and mission-driven learning. It evokes the feeling of a futuristic command center or a starship navigation terminal.

**Design Style: Galactic Glassmorphism & Technical Brutalism**
The interface prioritizes depth through layered translucency (Glassmorphism) combined with rigid, technical metadata structures. The emotional response is one of authority, exploration, and precision.

**Key Visual Motifs:**
- **Starfield Depth:** Backgrounds are not solid; they utilize deep space gradients and subtle, non-distracting starfield patterns.
- **Instrumentation Labels:** Every container includes a technical header formatted as `[NAME].v[NUMBER]` to reinforce a version-controlled, engineering-first environment.
- **Orbital Geometry:** Circular elements utilize concentric "orbital" rings and blue glow lines to simulate radar or planetary tracking.

## Colors
The palette is rooted in the high contrast of deep space.

- **Primary (Solar Gold):** Used exclusively for critical calls to action, active progress states, and high-priority highlights. It represents the sun/energy.
- **Secondary (Ion Blue):** Used for "Orbital" glow lines, interactive hover states, and technical instrumentation accents.
- **Tertiary (Void):** The base background color, a near-black navy that provides more depth than pure hex #000.
- **Neutral (Starlight):** High-legibility whites and greys for content and metadata.

## Typography
The typographic system relies on **Inter** for its technical clarity and wide range of weights. 

- **Headlines:** Must be "Inter Black" (900) and uppercase to command attention. On mobile, display sizes scale down significantly to maintain the "locked-in" grid feel.
- **Labels:** Use "tracking-widest" (0.2em) to mimic hardware labeling and technical readouts.
- **Body:** Kept clean and legible against dark backgrounds with slightly increased line-height for comfort.

## Layout & Spacing
This design system utilizes a **Fluid Technical Grid**.

- **Structure:** Content is housed in glassmorphic "Modules." On mobile, these modules stack vertically and span full-width to maximize touch targets.
- **Rhythm:** A strict 4px baseline grid ensures all technical elements (lines, boxes, inputs) feel mathematically aligned.
- **Breakpoints:** 
  - **Mobile (<768px):** Single column, 20px margins. 
  - **Desktop (>1024px):** 12-column grid, 40px margins, modules can span variable column widths (typically 4, 6, or 8).

## Elevation & Depth
Depth is created through "Atmospheric Layering" rather than traditional shadows.

- **Base Layer:** Deep Navy (#12121A) with a faint starfield texture (fixed position).
- **Surface Layer:** Glassmorphic containers with 12% white opacity and a 16px backdrop-blur.
- **Outer Edge:** Containers feature a 1px solid border at 20% white opacity to define the silhouette against the dark background.
- **Active Glow:** Interactive elements emit a "Secondary Blue" outer glow (0px 0px 12px) to simulate active light-emitting hardware.

## Shapes
The shape language is "Soft-Industrial."

- **Containers:** Use `rounded-lg` (8px) for a modern, refined feel.
- **Orbital Elements:** Perfect circles for profile images, status indicators, and planetary data visualizations. These are often framed by 1px "Ion Blue" orbital rings.
- **Buttons:** Sharp corners are avoided; use 4px (Soft) to keep the technical look from feeling too aggressive.

## Components

### Technical Glass Containers
Every primary card or section must have a top-left metadata tag.
- **Header:** Small label text `[SECTION_NAME].v01` placed in the top-left corner, often separated from the content by a 1px horizontal line.
- **Style:** 16px backdrop-blur, 1px border.

### Command Buttons
- **Mobile-First:** On mobile, all primary buttons are full-width (`w-full`) for easy thumb access.
- **Primary:** Solid "Solar Gold" (#FFB800) with Black text.
- **Secondary:** Transparent with "Ion Blue" border and glow on hover.

### Instrumentation Inputs
- **Field Style:** Dark, semi-transparent backgrounds with "Ion Blue" bottom-only borders.
- **Focus State:** The bottom border glows and a small technical "Coordinate" (e.g., `L-24`) appears in the corner.

### Orbital Data Tables
- **Layout:** High-density rows with 1px divider lines.
- **Headers:** `label-caps` typography with "Solar Gold" accents.
- **Visuals:** Status columns should use small circular "Ion Blue" or "Solar Gold" dots with a pulse animation for "Live" data.

### Orbital Rings (Custom Component)
- Decorative or functional rings surrounding circular avatars or status charts. These should be 1px thick, "Ion Blue," and can optionally rotate slowly to imply "scanning."