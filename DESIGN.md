# DESIGN.md

<!-- impeccable:design-schema 1 -->

## Visual World

**Name:** Clean Directory
**Essence:** TripAdvisor meets Zocdoc — browse-first directory with immediate trust signals

**References:**
- TripAdvisor search results: card-based browsing, clear hierarchy, review snippets
- Zocdoc desktop search: unified 3-field search bar (who/what/where pattern)
- Yelp business cards: contact actions front-and-center

## Color

**Primary Palette:**
- Brand: Warm orange `#FF6B35` (friendly, pet-related warmth)
- Trust: Deep blue `#004E89` (reliability, professionalism)
- Success: Green `#06A77D` (verified status)
- Background: Warm off-white `#FAF7F2` (was `#F7F9FB`; warmer, friendlier)
- Ink: Deep navy `#0B2545` - contrast bands (footer, quiz, CTA cards, primary dark buttons)
- Surfaces: `--surface` white cards, `--surface-sunken` `#F3EEE6` for inset fields/chips

**Category accents** (`--cat-*` in `design-tokens.css`, mapped in
`CATEGORY_THEME` in `lib/categories.ts`): Grooming rose `#D6457F`, Vet
teal `#0E8A8C`, Hotels violet `#6A56D6`, Training orange `#E8731E`,
Shops blue `#2B74D1`, Sitting green `#1E9A62`. A category reads the same
everywhere - home tiles, listing header, card label, business avatar.
Apply via `style={{"--accent": ...}}` + `.accent-soft` / `.accent-solid`.

**Semantic:**
- Links: `#004E89` (blue, standard web convention)
- Verified badge: `#06A77D` with checkmark
- Partner label: Amber `#F59E0B` outline

**Muted tones (hover/active surfaces):** `color-mix()` of each brand
color into white — `--brand-orange-muted`/`--brand-blue-muted` (~15%
tint, backgrounds) and their `-border` counterparts (~40-45% tint,
borders) in `website/app/design-tokens.css`. Used for the header
nav's pill-hover and dropdown item hover, never the raw saturated
brand color as a background.

## Typography

**Fonts:**
- Headings: **Plus Jakarta Sans** (700/800), loaded via `next/font/google`
  in `app/layout.tsx` as `--font-plus-jakarta-sans`, mapped to the
  `--font-heading` token in `design-tokens.css`. Geometric grotesk
  with more character than Inter for large display type; swap it by
  editing that one file if it doesn't land.
- Body: Inter Regular (loaded via `next/font/google`, `latin-ext` for Slovak diacritics)
- UI elements: Inter Medium
- Monospace (data): JetBrains Mono (phone numbers, addresses)

**Scale:**
- Mobile h1: 28px / 32px (1.75rem / 2rem)
- Mobile body: 16px / 24px (1rem / 1.5rem)
- Desktop h1: 40px / 48px (2.5rem / 3rem)
- Desktop body: 16px / 24px (same, optimized for reading)

## Spacing & Layout

**System:** 4px base unit (Tailwind default)
- Tight: 8px (within cards)
- Normal: 16px (between elements)
- Relaxed: 24px (between sections)
- Loose: 48px (page sections)

**Container:**
- Mobile: 100% - 16px padding
- Desktop: max 1280px centered

**Grid:**
- Mobile: single column stack
- Tablet: 2 columns for cards
- Desktop: 3 columns for cards, sidebar + main for detail

**Radii & Shadows** (`design-tokens.css`): `--radius-card` 20px (cards),
`--radius-control` 14px (inputs/dropdown containers), `--radius-pill`
999px (nav/hover pills, badges). `--shadow-card`/`--shadow-card-hover`
for listing cards, `--shadow-panel` for dropdowns/overlays - always an
offset + soft blur, never a flat colored halo.

## Components

### Search Flow (Homepage)
**Mobile:** Vertical stepped cards
1. "Choose your pet" - large animal icons (dog/cat)
2. "What do you need?" - service type buttons
3. "Where?" - district dropdown or geolocation

**Desktop:** Single search bar with 3 dropdowns inline (Zocdoc pattern)

### Result Cards
**Structure:**
- Business name (h3, bold)
- District + distance badge
- Services offered (pills)
- Contact row: phone icon + call button, website icon + link
- "Verified" badge with date when applicable
- "Partner" label when paid placement

**Interaction:**
- Hover: subtle lift shadow
- Click: expand to show full details (address, hours, notes)

### Trust Signals
- Verified checkmark: always visible
- Source link: "Info verified [date]" as subtle footer link
- Partner label: outlined badge, never hidden

### Ambient Background
`components/AmbientBackground.tsx` - 2-3 large, blurred, organic blob
shapes (irregular `border-radius`, `filter: blur`) in brand colors at
10-14% opacity, `pointer-events: none`, behind content
(`z-index: -10`), `aria-hidden`. One shared component, not redrawn
per page - used on the homepage hero and the business detail page.
Decoration only, never a stand-in for a photographic subject.

### Business avatar (no photos)
`components/BusinessAvatar.tsx` - initials on a category-tinted tile with
the category icon as a corner badge. Used instead of an empty photo
placeholder; never a stock photo pretending to be the place.

### Engagement blocks (homepage)
- **District explorer** (`DistrictExplorer.tsx`): district chips sized by
  real listing count; the selected district shows its categories as
  links into district listing pages.
- **Myth or fact?** (`MythOrFact.tsx`): 7-question quiz on general,
  well-established pet-care knowledge (never claims about businesses).

### Header
Sticky, translucent (`backdrop-blur`) with a hairline bottom border.
Below `lg` the category nav collapses into a full-screen menu
(`MobileMenu.tsx`, rendered through a portal because the header's
backdrop-filter would clip a fixed overlay). Nav
links carry no border at rest; on hover/focus a muted-brand pill
(`.pill-hover` in `design-tokens.css`) fades in around the link,
200ms ease-out. Logo SVG unchanged.

## Motion & Interaction

**Principles:**
- Instant feedback: button states <100ms
- Smooth transitions: 200ms ease-out
- Decoration motion is minimal and CSS-only (`.rise-in` entrance,
  `.float-y` on hero category chips); all of it is disabled under
  prefers-reduced-motion
- Reduced motion: instant state changes for prefers-reduced-motion

**Key Interactions:**
- Card expand: 200ms height transition
- Search filter: instant (no animation, data priority)
- Skeleton loaders: pulse for <2s loads

## Performance Budget

- LCP: ≤ 2.5s (mobile 3G)
- FID: ≤ 100ms
- CLS: ≤ 0.1
- TTI: ≤ 3.5s

**Strategies:**
- Static generation (Next.js SSG)
- Image optimization: next/image with WebP
- Font loading: font-display: swap
- Critical CSS inline
- No heavy JavaScript frameworks beyond Next.js core

## Mode

**Operate** — users complete a task (find service → get contact).
Scanability, consistency, and real usage context outrank visual expression.
Brand lives in precise details (verified badges, source transparency, helpful microcopy).
