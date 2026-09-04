---
name: Warm Desert Editorial Minimalist
colors:
  surface: '#faf9f5'
  surface-dim: '#dbdad6'
  surface-bright: '#faf9f5'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f4f0'
  surface-container: '#efeeea'
  surface-container-high: '#e9e8e4'
  surface-container-highest: '#e3e2df'
  on-surface: '#1b1c1a'
  on-surface-variant: '#5a4138'
  inverse-surface: '#30312e'
  inverse-on-surface: '#f2f1ed'
  outline: '#8f7066'
  outline-variant: '#e3bfb2'
  surface-tint: '#a83900'
  primary: '#a43700'
  on-primary: '#ffffff'
  primary-container: '#cd4700'
  on-primary-container: '#fffbff'
  inverse-primary: '#ffb59a'
  secondary: '#5f5e5e'
  on-secondary: '#ffffff'
  secondary-container: '#e2dfde'
  on-secondary-container: '#636262'
  tertiary: '#914802'
  on-tertiary: '#ffffff'
  tertiary-container: '#b05f1e'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdbcf'
  primary-fixed-dim: '#ffb59a'
  on-primary-fixed: '#380d00'
  on-primary-fixed-variant: '#802a00'
  secondary-fixed: '#e5e2e1'
  secondary-fixed-dim: '#c8c6c5'
  on-secondary-fixed: '#1c1b1b'
  on-secondary-fixed-variant: '#474746'
  tertiary-fixed: '#ffdcc6'
  tertiary-fixed-dim: '#ffb786'
  on-tertiary-fixed: '#311400'
  on-tertiary-fixed-variant: '#723600'
  background: '#faf9f5'
  on-background: '#1b1c1a'
  surface-variant: '#e3e2df'
typography:
  display-hero:
    fontFamily: Space Grotesk
    fontSize: 64px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.03em
  display-hero-mobile:
    fontFamily: Space Grotesk
    fontSize: 38px
    fontWeight: '700'
    lineHeight: '1.15'
    letterSpacing: -0.02em
  display-accent:
    fontFamily: Playfair Display
    fontSize: 64px
    fontWeight: '400'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  display-accent-mobile:
    fontFamily: Playfair Display
    fontSize: 38px
    fontWeight: '400'
    lineHeight: '1.15'
    letterSpacing: -0.01em
  headline-section:
    fontFamily: Space Grotesk
    fontSize: 44px
    fontWeight: '700'
    lineHeight: '1.15'
    letterSpacing: -0.025em
  headline-section-mobile:
    fontFamily: Space Grotesk
    fontSize: 30px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-card:
    fontFamily: Space Grotesk
    fontSize: 22px
    fontWeight: '600'
    lineHeight: '1.3'
    letterSpacing: -0.01em
  body-lead:
    fontFamily: DM Sans
    fontSize: 17px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: -0.005em
  body-default:
    fontFamily: DM Sans
    fontSize: 15px
    fontWeight: '400'
    lineHeight: '1.55'
    letterSpacing: 0em
  body-subtle:
    fontFamily: DM Sans
    fontSize: 13px
    fontWeight: '400'
    lineHeight: '1.5'
    letterSpacing: 0.01em
  eyebrow-badge:
    fontFamily: Space Grotesk
    fontSize: 11px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: 0.12em
  code-snippet:
    fontFamily: JetBrains Mono
    fontSize: 12.5px
    fontWeight: '400'
    lineHeight: '1.7'
    letterSpacing: 0em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit-2xs: 0.25rem
  unit-xs: 0.5rem
  unit-sm: 0.75rem
  unit-md: 1rem
  unit-lg: 1.5rem
  unit-xl: 2rem
  unit-2xl: 3rem
  unit-3xl: 4.5rem
  unit-4xl: 6rem
  container-max: 1180px
  gutter-desktop: 1.5rem
  gutter-mobile: 1rem
---

## Brand & Style

This design system channels an evocative, sun-drenched desert atmosphere paired with high-precision SaaS utility. It counters the cold, overly clinical aesthetics of conventional enterprise outreach tools with organic warmth, editorial contrast, and deliberate craft.

### Emotional Profile
- **Organic & Human:** Sun-baked earth, terracotta clay, ochre rock faces, and ambient warmth counteract robotic cold-email anxiety.
- **Reliable & Uncluttered:** Open whitespace, generous card radii, and structured pixel-grid accents evoke meticulous precision and calm competence.
- **Dynamic & Authoritative:** High-contrast pairing between heavy grotesque display type and expressive serif italics communicates forward-leaning energy alongside trustworthy human touch.

### Design Movement & Influence
- **Warm Editorial SaaS:** Editorial typography layered over naturalistic painterly backdrops, framed by soft sand-tinted cards.
- **Tactile Soft-Utility:** Floating pill containers, distinct terracotta accent pills, low-elevation neutral surfaces, and scattered square "pixel dust" constellations that hint at data orchestration without visual noise.

## Colors

The palette balances warm earth tones and sun-drenched minerals against deep charcoal neutrals and soft alabaster sand surfaces.

### Primary Palette
- **Terracotta Primary (`#E65100`):** Used for focal interactive states, primary action anchors, eyebrow badges, step progression badges, and active accordion markers.
- **Desert Amber / Accent Glow (`#E28743` / `#F59E0B`):** Warm transitional highlights, pixel dust points, and subtle hover glows.
- **Pitch Charcoal (`#121212` / `#1A1A1A`):** Dominant for high-impact CTA containers, primary headlines, and footer panels.

### Surface & Background Tokens
- **Canvas Base (`#FAFAF7`):** The foundational page color—a calm, warm off-white that eliminates screen glare.
- **Surface Card Beige (`#EFECE6`):** Soft, low-contrast neutral surface used for step cards, FAQ rows, and mockup preview panels.
- **Surface Card Subdued (`#E7E4DC`):** Subtle hover and active tier for interactive card layers.
- **Code Mockup Shell (`#F4F2EC`):** Monospaced code and text previews.

### Functional & Semantic Tokens
- **Success Mint (`#10B981` / `#D1FAE5`):** Reserved exclusively for integration verification badges ("Native Verified").
- **Border Subtle (`#E2DFD7`):** Low-contrast boundary lines for floating navigation bars, mockup dividers, and accordion borders.
- **Text Primary (`#111111`):** Deep carbon black for maximum readability across light surfaces.
- **Text Muted (`#6B6760`):** Weathered stone tone for supporting body copy and metadata.

## Typography

The typography strategy builds tension between calculated geometric structure and organic human expressiveness.

### Font Roles
- **Display & Headings (Space Grotesk):** Provides mechanical, authoritative structure with condensed horizontal rhythm and geometric forms.
- **Expressive Accent (Playfair Display / Serif Italic):** Injected mid-headline (e.g., *"not just for you"*, *"No credit card required"*) to soften technical friction and emphasize user-centric partnership.
- **Body & Controls (DM Sans):** Neutral, highly legible humanist sans with low stroke contrast, optimal for descriptive paragraphs and microcopy.
- **Code & Metadata (JetBrains Mono):** Dedicated to syntax parsing displays, payload logs, and technical connection stats.

### Expressive Hierarchy Rules
Headlines frequently leverage split phrasing: line one in bold geometric grotesque, followed by an emphatic punchline in sweeping italic serif. Eyebrows are tracked wide (`+0.12em`), uppercase, and rendered in bright terracotta to establish clear vertical sectional entry points.

## Layout & Spacing

The layout is built upon a standard 12-column desktop grid with a maximum content boundary of `1180px` and adaptive outer gutters.

### Layout Geometry
- **Hero & Banner Cards:** Framed within sweeping rounded capsules (`rounded-3xl` / `28px - 36px` border radius) with full internal bleed for panoramic desert landscape illustrations.
- **2x2 Feature Matrix:** A clean symmetrical 2-column, 2-row grid on desktop (`grid-cols-2`, gap: `1.5rem`), stacking to a single column on mobile (`grid-cols-1`).
- **Workflow Split Panel:** 5-column step selection list on the left, paired with a 7-column dynamic mockup preview stage on the right.
- **FAQ Asymmetry:** 4-column sticky title & contextual CTA block on the left, 8-column accordion stack on the right.

### Responsive Breakpoints
- **Mobile (< 768px):** Single-column stack, outer container padding `1rem`, card padding reduced to `1.25rem`, navigation condensed into a floating brand pill with single CTA.
- **Tablet (768px - 1024px):** 2-column matrices preserved, workflow panel transitions into a sequential top-list / bottom-preview structure.
- **Desktop (> 1024px):** Strict 12-column grid, persistent horizontal navigation pill, full split workflow viewer.

## Elevation & Depth

Visual hierarchy relies on warm tonal stacking rather than heavy dropshadows, ensuring an open and tactile surface balance.

### Tonal Hierarchy
- **Level 0 (Canvas Base):** Base background tint `#FAFAF7`.
- **Level 1 (Surface Containers):** Beige card blocks (`#EFECE6`) resting flat on the canvas with zero shadow, separated purely by soft color value transitions.
- **Level 2 (Active & Interactive Badges):** Pure white floating sub-pills (`#FFFFFF`) nested within beige cards, equipped with micro-diffused ambient shadow:
  `box-shadow: 0 4px 12px -2px rgba(26, 26, 26, 0.05)`.
- **Level 3 (Floating Nav & Action Pills):** The global navigation bar and floating CTA containers use a crisp ambient elevation:
  `box-shadow: 0 8px 24px -4px rgba(26, 26, 26, 0.08), 0 0 0 1px rgba(226, 223, 215, 0.8)`.

### Pixel Dot Clusters ("Constellations")
Scattered throughout cards and section margins are 3×3 and 4×4 clusters of terracotta and desert amber micro-squares (`8px × 8px` to `12px × 12px`). These provide organic data-like texture, simulating scattered nodes or email tokens traversing a warm desert plane.

## Shapes

The geometric signature combines generous card outer perimeters with tight, functional inner elements and pill-shaped interactive anchors.

### Corner Radii
- **Hero & CTA Panorama Banners:** `28px` to `36px` (`rounded-3xl`) creating an organic picture-frame aesthetic.
- **Content Cards & FAQ Rows:** `16px` to `20px` (`rounded-2xl`) for soft containment.
- **Navigation Capsule & CTA Buttons:** Full pill (`9999px`) rounded edges.
- **Step Counters & Icon Blocks:** `8px` to `10px` soft square geometry with balanced squircle curvature.

## Components

### 1. Primary Action Button (Double-Pill Hybrid)
- **Container:** Pitch Charcoal `#121212` pill with white sans typography (`14px`, weight: `600`).
- **Inner Accent Icon:** A bright terracotta (`#E65100`) square or squircle (`24px × 24px`, radius `6px`) nested on the left edge containing a bold white directional prompt (`>`).
- **Padding:** `6px` left, `20px` right, `6px` top/bottom.

### 2. Navigation Pill
- **Structure:** Floating horizontal container anchored at the top of workflows. White (`#FFFFFF`) or pale sand background with a subtle border (`#E2DFD7`).
- **Contents:** Brand mark left, bullet-separated plain text links (`Features · Workflows · Pricing · Contact`) center, and mini primary action pill right.

### 3. Step Feature Card (2x2 Matrix)
- **Background:** `#EFECE6` with minimum height `260px` and interior padding `2rem`.
- **Header:** Ghost step numeral (`01.`, `02.`, etc.) rendered in low-contrast beige-tinted stone (`#D8D3C8`), `32px` font size, bold geometric weight.
- **Interior Graphic:** Either an interactive token pill (e.g., orange tag `?` + `"Personalized for {{Company Name}}"`) or an asymmetric cluster of amber/terracotta square dots.
- **Footer:** Crisp bold title (`headline-card`) aligned at bottom.

### 4. Interactive Workflow List & Live Mockup Split
- **List Items (Left):**
  - Inactive: Clean row with grey index badge (`02`, `03`), dark header, and supporting caption.
  - Active: Highlighted with a terracotta step indicator badge containing `»`, accompanied by step metadata ("Step 01") in terracotta mono uppercase.
- **Mockup Container (Right):**
  - Shell: Bordered sand card (`#FFFFFF` or `#F9F8F5`) with distinct header metadata ("STEP 01 PREVIEW" pill badge left, "Live Mockup" right).
  - Code Viewer: Inset beige box (`#F4F2EC`, radius `10px`) populated with monospaced sample contact data.
  - Footer Bar: Green validation checkmark (`✓ 3 contacts detected with valid formats`) paired with an inline link ("Try this step →").

### 5. Accordion FAQs
- **Row Styling:** Sand-beige bar (`#EFECE6`), `rounded-xl`, padding `1.25rem 1.75rem`.
- **Toggle State:** Bold title with a terracotta (`#E65100`) toggle symbol (`+` for collapsed, `×` or `−` for expanded).
- **Expanded Content:** Clean `DM Sans` body copy separated by `1rem` vertical margin.

### 6. Integration Trust Badge
- **Container:** Pure white card with soft ambient elevation.
- **Elements:** Official provider glyph (Gmail / Google Workspace logo), service metadata string ("Direct Connection · App Passwords · TLS 1.3"), and a mint green pill (`#D1FAE5` background, `#065F46` text) labeled `"✓ Native Verified"`.