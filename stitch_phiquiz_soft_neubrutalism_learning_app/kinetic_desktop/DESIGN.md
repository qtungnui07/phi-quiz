---
name: Kinetic Desktop
colors:
  surface: '#fbf9f4'
  surface-dim: '#dbdad5'
  surface-bright: '#fbf9f4'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f4ee'
  surface-container: '#efeee8'
  surface-container-high: '#e9e8e3'
  surface-container-highest: '#e4e2dd'
  on-surface: '#1b1c19'
  on-surface-variant: '#40484f'
  inverse-surface: '#30312d'
  inverse-on-surface: '#f2f1eb'
  outline: '#707880'
  outline-variant: '#c0c7d0'
  surface-tint: '#006493'
  primary: '#004b70'
  on-primary: '#ffffff'
  primary-container: '#006493'
  on-primary-container: '#b5ddff'
  inverse-primary: '#8dcdff'
  secondary: '#7c5800'
  on-secondary: '#ffffff'
  secondary-container: '#feb700'
  on-secondary-container: '#6b4b00'
  tertiary: '#8b1900'
  on-tertiary: '#ffffff'
  tertiary-container: '#ae3115'
  on-tertiary-container: '#ffcdc2'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#cae6ff'
  primary-fixed-dim: '#8dcdff'
  on-primary-fixed: '#001e30'
  on-primary-fixed-variant: '#004b70'
  secondary-fixed: '#ffdea8'
  secondary-fixed-dim: '#ffba22'
  on-secondary-fixed: '#271900'
  on-secondary-fixed-variant: '#5e4200'
  tertiary-fixed: '#ffdad2'
  tertiary-fixed-dim: '#ffb4a3'
  on-tertiary-fixed: '#3d0600'
  on-tertiary-fixed-variant: '#8b1900'
  background: '#fbf9f4'
  on-background: '#1b1c19'
  surface-variant: '#e4e2dd'
  canvas: '#fbf9f4'
  surface-white: '#ffffff'
  cyan-bright: '#38b6ff'
  coral-warm: '#ff8d73'
  stroke-dark: '#1e1e1e'
typography:
  display:
    fontFamily: Plus Jakarta Sans
    fontSize: 56px
    fontWeight: '800'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '800'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: '1.3'
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '700'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '500'
    lineHeight: '1.6'
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '500'
    lineHeight: '1.6'
  label-bold:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: 0.02em
  caption:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1.4'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  stroke: 2.5px
  shadow: 4px
  base-unit: 4px
  gutter: 24px
  margin-desktop: 40px
  container-max: 1280px
---

## Brand & Style

This design system utilizes a **Soft-Neubrutalist** aesthetic tailored for a high-performance desktop web environment. It strikes a balance between the raw, structured energy of classic brutalism and the polished usability of modern SaaS. The brand personality is "Sophisticatedly Playful"—it treats the web browser as a physical workspace where elements have weight, thickness, and tactile response.

The visual narrative is driven by:
- **High-Contrast Definition:** Using 2.5px strokes to create "object-oriented" UI where every container is a distinct physical entity.
- **Optimistic Vibrancy:** A high-saturation palette that leverages the energy of Cyan and Yellow to maintain user focus and momentum.
- **Desktop Precision:** While maintaining chunky, tactile elements, the layout is refined for wide-screen productivity, utilizing white space to prevent the heavy strokes from feeling overwhelming.

## Colors

The color system is built on a "Ink and Paper" philosophy. The **Canvas (#fbf9f4)** acts as the base paper, while **Stroke-Dark (#1e1e1e)** acts as the definitive ink.

- **Primary (Cyan):** Used for primary calls to action, active navigation states, and progress indicators.
- **Secondary (Yellow):** Used for highlighting, secondary actions, and "reward" states.
- **Tertiary (Coral):** Reserved for destructive actions, critical errors, and high-priority notifications.
- **Neutral:** The dark neutral is reserved exclusively for strokes and high-contrast typography, ensuring maximum legibility.

In the desktop environment, use the **Canvas** color for the global background and **Surface-White** for main content cards to create a subtle hierarchy of depth.

## Typography

**Plus Jakarta Sans** is the sole typeface, chosen for its geometric clarity and friendly character. 

For desktop, typography must scale to match the visual weight of the 2.5px strokes. Headlines use an **Extra Bold (800)** weight to anchor the page, while body text is set to **Medium (500)** to prevent it from appearing too thin against the aggressive borders. Use Sentence Case for most UI elements to maintain an approachable tone, reserving Bold Labels for navigation and small metadata.

## Layout & Spacing

The layout employs a **Fixed Grid** container for content-heavy pages and a **Sidebar Navigation** pattern for application-style views.

- **Grid System:** A 12-column fluid grid within a 1280px max-width container. 
- **The 4px Rhythm:** All padding, margins, and gaps must be multiples of 4px.
- **Desktop Sidebar:** In app-centric layouts, use a fixed left sidebar (width: 280px) with its own 2.5px right-side stroke.
- **Negative Space:** Ensure generous padding (at least 32px) inside cards to balance the heavy strokes and prevent "visual crowding."

## Elevation & Depth

This system utilizes **Hard-Offset Dimensionality** instead of blurs or soft shadows. Depth is communicated through physical displacement.

- **Base Level:** The background canvas.
- **Surface Level:** Elements feature a 2.5px stroke and a 4px hard shadow offset to the bottom-right (Color: Stroke-Dark).
- **Hover State:** Elements translate -2px on both X and Y axes, while the shadow offset increases to 6px, simulating a lift.
- **Active/Pressed State:** Elements translate +4px to align perfectly with the shadow origin, removing the offset and simulating a physical button press.

## Shapes

The shape language combines high-radius enclosures with pill-shaped interactions.

- **Containers:** Large cards and sections use a **24px (rounded-xl)** radius. This high value "softens" the Neubrutalist strokes, making the desktop interface feel modern and inviting.
- **Interactive Elements:** Buttons, tags, and inputs should use **Pill (9999px)** rounding to clearly differentiate "actions" from "content."
- **Strokes:** Every shape must have a 2.5px centered stroke. Ensure corner joins are rounded to maintain the "Soft" characteristic of the system.

## Components

### Buttons
Pill-shaped with a 2.5px stroke and a 4px hard shadow. Primary buttons use the Cyan background with White text; Secondary buttons use a White background with Dark text. On hover, the shadow grows; on click, the button "sinks" to 0px shadow.

### Cards
White surfaces with 24px rounded corners and 2.5px strokes. For complex desktop dashboards, use "Header Strips"—a secondary color (Yellow or Cyan) fill at the top of the card, separated by a 2.5px horizontal stroke.

### Input Fields
Pill-shaped with a 2.5px stroke. Focus states should transition the stroke color to Primary Cyan and slightly increase the shadow's thickness to indicate active engagement.

### Sidebar Navigation
The desktop sidebar uses a flat background (Canvas) with 2.5px vertical borders. Navigation items are pill-shaped; active states use a Cyan background with a physical press effect (0px shadow).

### Progress Bars
Thick pill-shaped tracks (16px height) with a 2.5px stroke. The progress fill is solid Cyan, separated from the empty track by a vertical 2.5px stroke line.