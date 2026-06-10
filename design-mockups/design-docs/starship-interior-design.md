---
name: Starship Interior
colors:
  surface: '#fcf8fb'
  surface-dim: '#dcd9dc'
  surface-bright: '#fcf8fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f2f5'
  surface-container: '#f0edef'
  surface-container-high: '#eae7ea'
  surface-container-highest: '#e5e1e4'
  on-surface: '#1c1b1d'
  on-surface-variant: '#46464d'
  inverse-surface: '#313032'
  inverse-on-surface: '#f3f0f2'
  outline: '#77767e'
  outline-variant: '#c7c5ce'
  surface-tint: '#595c79'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#161a33'
  on-primary-container: '#7e82a1'
  inverse-primary: '#c1c4e6'
  secondary: '#5d5f5f'
  on-secondary: '#ffffff'
  secondary-container: '#dfe0e0'
  on-secondary-container: '#616363'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#2c1604'
  on-tertiary-container: '#a07d63'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dee0ff'
  primary-fixed-dim: '#c1c4e6'
  on-primary-fixed: '#161a33'
  on-primary-fixed-variant: '#414561'
  secondary-fixed: '#e2e2e2'
  secondary-fixed-dim: '#c6c6c7'
  on-secondary-fixed: '#1a1c1c'
  on-secondary-fixed-variant: '#454747'
  tertiary-fixed: '#ffdcc3'
  tertiary-fixed-dim: '#e7bea1'
  on-tertiary-fixed: '#2c1604'
  on-tertiary-fixed-variant: '#5d412a'
  background: '#fcf8fb'
  on-background: '#1c1b1d'
  surface-variant: '#e5e1e4'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
  rank-indicator:
    fontFamily: JetBrains Mono
    fontSize: 10px
    fontWeight: '700'
    lineHeight: 12px
    letterSpacing: 0.1em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 24px
  margin-desktop: 64px
  margin-mobile: 16px
  panel-padding: 32px
---

## Brand & Style
This design system captures the atmosphere of a high-tech vessel, blending the cold expanse of deep space with the pristine, functional environment of a starship’s command deck. The aesthetic shifts from purely cosmic to a "High-Tech Interior" style—mixing **Glassmorphism** for external-facing "viewports" with **Minimalist white surfaces** for internal bulkheads.

The target audience consists of operators and explorers who require high-contrast legibility and a sense of structural reliability. The emotional response is one of clinical precision, advanced technology, and safety within a sophisticated environment.

**Key Stylistic Pillars:**
- **The Viewport:** Translucent layers representing the glass between the cabin and the void.
- **The Bulkhead:** Solid, high-contrast white panels providing structural grounding.
- **The Circuitry:** Precise accent lines and subtle glows that suggest active power and data flow.

## Colors
The palette is built on the contrast between the deep space foundation and the sterile white interior. 

- **Primary (#0A0E27):** Deep Space. Used for dark-mode surfaces, headers, and high-importance backgrounds where "the void" is visible.
- **Secondary (#FFFFFF):** Interior Wall. The dominant surface color for main content areas to ensure maximum readability and a clean, ship-board feel.
- **Accent Blue (#90CDF4):** System Light. Used for decorative indicators, "rank" lines, and subtle light-strip accents.
- **Action Gold (#FFB800):** Command Priority. Reserved strictly for primary call-to-actions, critical borders, and high-energy alerts.

The system utilizes a "Switchable Environment" logic: use solid white for data-heavy tasks and glassmorphic dark layers for immersion and navigation.

## Typography
The typography is strictly functional and architectural. All previous orbital or curved text paths are abolished in favor of a rigid, linear grid.

- **Headlines:** Use Inter with tight tracking and bold weights to mimic structural labeling.
- **Body:** Inter provides a neutral, highly legible experience on both white and dark surfaces.
- **System Labels:** JetBrains Mono is introduced for technical data, "rank" indicators, and ship telemetry to evoke a developer/engineering readout feel.
- **Alignment:** All text must be aligned to the pixel grid. Use uppercase for technical labels and rank indicators to reinforce the military-grade starship aesthetic.

## Layout & Spacing
The layout follows a **Fixed Grid** philosophy, mirroring the modular construction of a starship interior.

- **The Modular Deck:** Content is organized into defined "Panels" or "Modules."
- **Grid:** A 12-column system for desktop with generous 24px gutters.
- **Rhythm:** All spacing must be multiples of 4px. Use larger 32px padding within white "Bulkhead" panels to maintain an airy, futuristic feel.
- **Margins:** Desktop views use wide 64px margins to center the "Command Bridge" view, while mobile scales down to 16px to maximize the limited "Display Screen" area.

## Elevation & Depth
Depth is achieved through a combination of material layering and light emission rather than traditional shadows.

1.  **Level 0 (The Void):** The Primary #0A0E27 background.
2.  **Level 1 (The Bulkhead):** Solid White (#FFFFFF) panels with no transparency. These use a very subtle, light blue 1px border (#90CDF4 at 20% opacity) instead of a shadow.
3.  **Level 2 (The Viewport):** Glassmorphic overlays used for modals and sidebars. 
    - *Backdrop-blur:* 12px.
    - *Fill:* #0A0E27 at 60% opacity.
    - *Border:* 1px solid #FFB800 (Action Gold) for active/primary modals.
4.  **Light Strips:** Instead of drop shadows, use "Outer Glows" (box-shadow: 0 0 8px) in Accent Blue to indicate active states or power flow along the edges of panels.

## Shapes
The shape language is a "Functional Hybrid." 

- **Structural Panels:** Use **Soft (0.25rem)** roundedness for main white panels and input fields. This suggests machined parts that are ergonomic but sturdy.
- **Interface Elements:** Buttons and small badges use the same soft rounding.
- **Sensors & Status:** Use **Perfect Circles** for status indicators, profile pips, and "System Active" lights.
- **Rank Indicators:** These are strictly rectangular, thin 2px lines or blocks, reinforcing the technical and hierarchical nature of the UI.

## Components

- **Primary Buttons:** Solid Gold (#FFB800) with Black text (#0A0E27). No gradients. For "Critical Command" actions, add a 2px outer glow in Gold.
- **Secondary Buttons:** Ghost style with a 1px Blue Accent border and Blue text.
- **Interior Panels (Cards):** Solid White background. Each card features a "Rank Indicator"—a vertical 4px blue line on the left edge or a horizontal thin line at the top—accompanied by a JetBrains Mono label.
- **Input Fields:** White background with a 1px Primary (#0A0E27) border. On focus, the border changes to Gold with a subtle blue "power-on" glow.
- **Viewports (Modals):** Glassmorphic dark background with gold-stroked corners.
- **Chips/Badges:** Small, rectangular shapes with 0px roundedness and technical monospaced text to look like physical equipment tags.
- **Telemetry Lists:** Alternate row backgrounds between pure white and a very faint Blue (#90CDF4 at 5% opacity).