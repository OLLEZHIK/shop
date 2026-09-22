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
- Background: Off-white `#F7F9FB` (reduced eye strain)

**Semantic:**
- Links: `#004E89` (blue, standard web convention)
- Verified badge: `#06A77D` with checkmark
- Partner label: Amber `#F59E0B` outline

## Typography

**Fonts:**
- Headings: Inter Bold (clean, modern, excellent legibility)
- Body: Inter Regular
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

## Motion & Interaction

**Principles:**
- Instant feedback: button states <100ms
- Smooth transitions: 200ms ease-out
- No decoration animations: all motion is functional
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
