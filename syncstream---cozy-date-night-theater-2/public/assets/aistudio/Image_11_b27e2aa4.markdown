---
name: Velvet Midnight
colors:
  surface: '#12131c'
  surface-dim: '#12131c'
  surface-bright: '#383843'
  surface-container-lowest: '#0d0e16'
  surface-container-low: '#1a1b24'
  surface-container: '#1e1f28'
  surface-container-high: '#282933'
  surface-container-highest: '#33343e'
  on-surface: '#e3e1ee'
  on-surface-variant: '#dbc0c7'
  inverse-surface: '#e3e1ee'
  inverse-on-surface: '#2f303a'
  outline: '#a38a91'
  outline-variant: '#554148'
  surface-tint: '#ffb0cb'
  primary: '#ffb0cb'
  on-primary: '#640037'
  primary-container: '#ff79b0'
  on-primary-container: '#770543'
  inverse-primary: '#a53167'
  secondary: '#44ddbd'
  on-secondary: '#00382d'
  secondary-container: '#00bea0'
  on-secondary-container: '#00463a'
  tertiary: '#d4bbff'
  on-tertiary: '#3e127f'
  tertiary-container: '#b892ff'
  on-tertiary-container: '#4a228b'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffd9e4'
  primary-fixed-dim: '#ffb0cb'
  on-primary-fixed: '#3e0020'
  on-primary-fixed-variant: '#86164f'
  secondary-fixed: '#67fad9'
  secondary-fixed-dim: '#44ddbd'
  on-secondary-fixed: '#00201a'
  on-secondary-fixed-variant: '#005143'
  tertiary-fixed: '#ebdcff'
  tertiary-fixed-dim: '#d4bbff'
  on-tertiary-fixed: '#260059'
  on-tertiary-fixed-variant: '#552f97'
  background: '#12131c'
  on-background: '#e3e1ee'
  surface-variant: '#33343e'
typography:
  display-lg:
    fontFamily: Comfortaa
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 52px
  display-lg-mobile:
    fontFamily: Comfortaa
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 40px
  headline-lg:
    fontFamily: Comfortaa
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 38px
  headline-lg-mobile:
    fontFamily: Comfortaa
    fontSize: 22px
    fontWeight: '700'
    lineHeight: 30px
  headline-md:
    fontFamily: Comfortaa
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Comfortaa
    fontSize: 16px
    fontWeight: '500'
    lineHeight: 24px
  body-md:
    fontFamily: Comfortaa
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
  body-sm:
    fontFamily: Comfortaa
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
  label-lg:
    fontFamily: Comfortaa
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 18px
  label-md:
    fontFamily: Comfortaa
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
  label-sm:
    fontFamily: Comfortaa
    fontSize: 10px
    fontWeight: '700'
    lineHeight: 14px
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-tablet: 1.5rem
  margin-desktop: 2.5rem
  space-xs: 0.375rem
  space-sm: 0.625rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.25rem
  space-2xl: 3.5rem
---

## Brand & Style

This design system crafts an intimate, heartwarming digital living room for two. Built for late-night synchronized streaming, shared reactions, and private memory-making, the aesthetic balances the comforting darkness of a candlelit bedroom with playful, candy-coated intimacy. 

The visual style is **Cozy Neo-Softness**—a tactile, pillowy hybrid of deep midnight backdrops and glowing, pastel-tinted micro-surfaces. Rather than clinical dark mode or high-tech cyberpunk glare, this interface breathes warmth, gentle luminosity, and playful affection. Key visual motifs include squishy pill shapes, delicate candy-toned outer glows, heart-shaped reaction markers, and paired avatar status halos. Interactions evoke softness: elements bounce gently rather than snapping mechanically, fostering a safe, deeply connected sanctuary for couples spending time together across any distance.

## Colors

The palette relies on deep midnight tones that reduce retinal fatigue during dark-room streaming sessions, contrasted against sweet, luminescent confectionery pastels.

- **Foundations (Midnight & Charcoal)**:
  - Canvas Base: `#12131C` (Abyssal ink base for full-screen cinema mode)
  - Surface Mid: `#181A26` (Card backing and structural panels)
  - Surface Raised: `#202334` (Interactive elements, modals, and raised navigation)
  - Surface Overlay: `#282C42` (Floating tooltips, chat capsules, and active popovers)

- **Pastel Accents & Signals**:
  - **Bubblegum Blush** (`#FF79B0`, highlight `#FFA3C8`): Primary action triggers, paired heart reactions, active sync indicators, and Partner 1 identity state.
  - **Pastel Mint Teal** (`#4EE5C5`, deep `#2DD4BF`): Video playback status, sync stability markers, timestamps, and Partner 2 identity state.
  - **Cozy Lavender** (`#B892FF`): Shared timeline pins, countdown markers, audio levels, and joint achievements.

- **Color Application Rules**:
  - Never use pure stark white (`#FFFFFF`) for body text; use tinted cloud white (`#E6E8F6`) and muted periwinkle (`#9499B7`) for secondary info to preserve the gentle atmosphere.
  - Borders use 12% to 20% alpha channels of the primary or secondary pastel tones rather than abrasive gray lines.

## Typography

The design system exclusively adopts **Comfortaa** across all viewports and functional tiers to create an unmistakable warmth and friendly, rounded cadence. 

- **Display & Headlines**: Generous line heights maintain legibility against deep backdrops. Use bold weights (`700`) for media titles and joint milestones.
- **Body & Longform**: Comfortaa's rounded apertures are naturally airy; set body copy at weights `400` or `500` with comfortable letter spacing (`-0.01em`) to maintain a clean reading experience during rapid live chats.
- **Labels & Badges**: Set in weights `600` and `700` with slight positive tracking (`+0.02em`) on small tags (`label-sm`), ensuring high legibility for playback timestamps and presence badges.

## Layout & Spacing

The layout is built around a flexible, cinematic responsive grid designed to seamlessly transition between theater mode, side-by-side synchronized chat, and content exploration.

- **Grid Structure**:
  - **Mobile (< 768px)**: 4 columns, `1rem` margins, stacked single-column theater view with an overlay/slide-up cozy drawer for chat, voice controls, and shared reaction trays.
  - **Tablet (768px - 1024px)**: 8 columns, `1.5rem` margins and gutters. Adaptable 2/3 video stage with 1/3 interactive side-panel for active queues and message streams.
  - **Desktop (> 1024px)**: 12-column system, max content container `1440px`, flanked by `2.5rem` margins. The primary watch party player commands an 8-column canvas, while the dual-presence companion dock claims a persistent 4-column panel.

- **Rhythm & Safe Areas**:
  - Media panels maintain strict 16:9 aspect ratios with integrated padding pools (`space-md`) on all controls so touch targets never intrude upon video subtitles.
  - Chat logs, emoji rain bursts, and paired stats scale padding dynamically using `space-sm` for inline grouping and `space-lg` between distinct conversation bursts.

## Elevation & Depth

Visual depth eschews harsh drop shadows in favor of **Luminescent Tonal Stratification** paired with pillowy, colored ambient halos.

- **Surface Tiers**:
  - **Level 0 (Stage/Base)**: `#12131C` flat canvas.
  - **Level 1 (Panels & Shelves)**: `#181A26` with a soft top edge-highlight: `1px solid rgba(255, 255, 255, 0.04)`.
  - **Level 2 (Cards & Active Windows)**: `#202334` elevated by a dual-layer soft ambient glow: `0 8px 24px -4px rgba(8, 9, 14, 0.6), 0 0 16px 1px rgba(255, 121, 176, 0.05)`.
  - **Level 3 (Modals, Reaction Floats, & Flyouts)**: `#282C42` backed by a diffuse colored cloud: `0 16px 36px -6px rgba(0, 0, 0, 0.7), 0 0 24px 2px rgba(78, 229, 197, 0.08)`.

- **Cozy Translucency**:
  - Overlay surfaces utilize `backdrop-filter: blur(16px)` with an 85% alpha-blended surface tint (`rgba(32, 35, 52, 0.85)`).
  - Floating video HUDs and reaction pill pickers use subtle candy borders: `1px solid rgba(255, 163, 200, 0.18)`.

## Shapes

The shape vocabulary is deeply committed to high pillowy curvaceousness (`roundedness: 3`). Soft, continuous circular curves eliminate visual tension and create an inviting, huggable feel.

- **Pills**: All primary buttons, status badges, chat input fields, and category tags leverage continuous pill styling (`border-radius: 9999px`).
- **Cards & Modals**: Media preview cards and floating panels use generous curvature (`rounded-xl` / `3rem` on larger elements, `rounded-lg` / `2rem` on standard containers).
- **Couple Avatars**: Nested rounded elements, where the two partners' presence indicators link via soft overlapping circular capsules with a pastel joining bridge.

## Components

### Buttons
- **Primary ("Watch Together / Send Love")**: Fully pill-shaped (`9999px`), clad in Bubblegum Blush (`#FF79B0`) with `#12131C` high-contrast bold typography. Hover states yield an inner candy glow (`box-shadow: 0 0 16px rgba(255, 121, 176, 0.45)`). Pressed state slightly scales to `0.97` for a squishy tactile feel.
- **Secondary ("Sync Player / Queue")**: Pill-shaped with a Mint Teal outline (`1.5px solid rgba(78, 229, 197, 0.4)`), `#181A26` dark background, and `#4EE5C5` typography.
- **Tertiary / Ghost**: Borderless `#202334` fill that turns to `#282C42` on hover, with periwinkle `#E6E8F6` text.

### Chips & Badges
- **Couple Sync Badge**: An interconnected dual pill containing tiny circular avatar heads, a pulsing mint sync dot (`#4EE5C5`), and text reading "0.00s delay".
- **Category Chips**: Soft `#202334` background with rounded full corners, active states glowing with a gentle lavender border (`#B892FF`) and white text.

### Lists & Watch Queues
- **Queue Item**: Rounded-lg container (`2rem`), `#181A26` surface, padding `space-md`. Displays 16:9 thumbnail with rounded corners (`1rem`). On active playback, the left edge features a solid vertical pill accent in Blush Pink.

### Input Fields & Reaction Bar
- **Chat Field**: Capsule-shaped (`9999px`), background `#181A26`, border `1.5px solid rgba(255, 255, 255, 0.08)`. Focus states smoothly shift the border to `rgba(255, 121, 176, 0.6)` with an ambient blush shadow.
- **Quick-Heart Reaction Dock**: An anchored bottom-right horizontal pill docking quick emoji stamps (custom heart sparkles, cute popcorn, sleepy face, cuddles) that float upward on tap with subtle pastel physics.

### Cards & Media Panels
- **Stream Card**: `#181A26` surface topped with a rounded cover image, soft tags inside the media overlay for stream provider, and a paired watch-time bar (`2px` height, gradient of `#FF79B0` to `#4EE5C5`).

### Checkboxes & Toggle Switches
- **Toggles ("In-Sync Playback", "Mic On")**: Chubby pill track (`#202334` inactive, `#4EE5C5` active) containing an oversized circular thumb that expands slightly into an oval when sliding.