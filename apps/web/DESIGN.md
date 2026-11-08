# Stuffaroo design system

The single source of truth for how Stuffaroo looks. Tokens live in `src/app/tokens.css` (Tailwind v4 `@theme`, so every token is also a utility), base rules and type tiers in `src/app/base.css`, frosted surfaces in `src/app/globals.css`. Shared components are in `src/components/ds/`.

**In one sentence:** Depop's marketplace structure, Altitude Sports' calm editorial surfaces, Emblematica's Inter Tight type system at light weights, a few DOVV die-cut stickers for personality, and Krea frosted pills for floating controls. Calm layout and loud type by default; stickers are the accent.

The previous system (cream paper, grid background, peach gradients, Fredoka wordmark, bento cards, white-rimmed cards) is retired. Do not bring any of it back.

## Tokens

### Colour

| Token | Value | Use |
|---|---|---|
| `bg` | `#FAFAF8` | Page |
| `surface` | `#F1F1EF` | Tiles, image placeholders, search fields |
| `surface-2` | `#E7E7E4` | Hover, pressed, input fill, hero collage tile |
| `ink` | `#0E0C0D` | Primary text, primary buttons, the manifesto band |
| `ink-2` | `#5C5C5C` | Secondary text (7.0:1 on `bg`) |
| `ink-3` | `#767676` | Tertiary text (4.5:1 on `bg`) |
| `ink-4` | `#9A9A9A` | Placeholder icons, faint scroll-fill words. Never body text. |
| `line` | `rgb(0 0 0 / 0.08)` | Hairlines |
| `roo` | `#F26B1D` | Brand orange. Only: brand CTAs (Post an item, Rent this), the active mode, the search submit, Roo, one sticker per screen, the saved heart |
| `roo-deep` | `#C2500F` | Hover on orange fills |
| `deal` | `#D92D20` | Discount badge text only |
| `ok` | `#1F9D55` | Status dot, verified |

Sticker gradients: `--grad-peach` (`#FFB38A→#FF7EB3`), `--grad-lime` (`#D4F55B→#FFE14D`), `--grad-holo` (`#A0E9FF→#CDB4FF→#FFC6E5`).

Frosted (`.frost` on light, `.frost-dark` on dark or photos): `rgb(255 255 255 / 0.55)` or `rgb(20 20 20 / 0.45)`, `backdrop-filter: blur(18px) saturate(160%)`, 1px `rgb(255 255 255 / 0.5)` border, `inset 0 1px 0 rgb(255 255 255 / 0.6)` highlight. Both classes start from a solid fallback (`--frost-light-solid`, `--frost-dark-solid`) and only go translucent inside `@supports (backdrop-filter)`; they go solid again under `prefers-reduced-transparency` and `prefers-contrast: more`.

### Type

One family: **Inter Tight**, weights **300, 400, 500 only**, loaded with `next/font/google` in `src/app/layout.tsx`. No second typeface anywhere, stickers included.

**No bold anywhere.** The heaviest weight is 500. `h1`–`h6` reset to 400, `b`/`strong`/`th`/`dt` to 500 in `base.css`. Emphasis comes from size, case, tracking and `ink` vs `ink-2`.

Use the `.t-*` classes; sizes are fluid between 375px and 1280px.

| Class | Mobile → desktop | Weight | Case | Leading | Tracking | Use |
|---|---|---|---|---|---|---|
| `t-display` | 52 → 96px | 500 | UPPER | 0.9 | -0.02em | Hero and section openers, 3–4 short words, once per viewport |
| `t-statement` | 34 → 64px | 400 | Sentence | 1.02 | -0.03em | Manifesto, move-out tile, big empty states. Max 22ch |
| `t-h2` | 26 → 36px | 400 | Sentence | 1.05 | -0.025em | Section titles |
| `t-h3` | 20 / 22px | 500 | Sentence | 1.15 | -0.015em | Panel titles |
| `t-body` | 16px | 400 | Sentence | 1.5 | 0 | Paragraphs. Max 60ch |
| `t-card-title` | 14px | 300 | Sentence | 1.35 | 0 | Listing titles |
| `t-price` | 15 / 16px | 400 | — | 1.2 | -0.01em | Prices, tabular numbers. Unit in `t-unit` (13px, 300, `ink-2`) |
| `t-meta` | 11px | 400 | UPPER | 1.2 | 0.04em | Pickup spot · time, the demo banner |
| `t-label` | 11 / 12px | 500 | UPPER | 1.1 | 0.04em | Nav, buttons, badges, filters, eyebrows, footer heads |
| `t-label-lg` | 13 / 14px | 500 | UPPER | 1.1 | 0.03em | Primary CTAs, sticker text |

Rules: display is the only large uppercase text; never put sentence-length text in it. Every control reads as a tag (`t-label`). Text is never orange.

### Radius

Only these: `rounded-tile` 28px (hero, category, map, move-out tiles), `rounded-card` 20px (panels, collage frames), `rounded-thumb` 18px (listing tile image), `rounded-img` 14px (image inside a card, menu items), `rounded-badge` 8px (discount badge), `rounded-pill` / `rounded-full` (inputs, buttons, pills, avatars, icon buttons).

### Spacing and layout

4px base. `.container` = max 1360px with `--gutter` side padding (32px desktop, 16px under 768px). Sections are separated by `--section-gap` (96px desktop, 64px mobile). Breakpoints: Tailwind defaults; listing grids go 2 → 3 (md) → 4 (xl, 1280px).

### Motion

200ms ease-out for hovers (`--dur-hover`), 400ms for entrances and the photo zoom (`--dur-enter`). Stickers wobble +3° on hover. Under `prefers-reduced-motion` every transition and animation is cut to ~0, stickers stop wobbling and `ScrollFillText` renders fully filled.

## Components (`src/components/ds/`)

- **Listing tile** (`listing-tile.tsx`, Altitude pattern). The tile is the photo: 4:5 image, `rounded-thumb`, `surface` behind it, no card, border, padding or shadow. On the image only: top-left one frosted mode pill (BUY / RENT / REQUEST), or a white `deal` pill (`-75%`) when discounted; top-right a 34px frosted heart; bottom-left photo dots when there are 2+ photos. Below, 10px gap, no container: `t-meta` spot · availability in `ink-2`, `t-card-title` one line, one price with its unit (struck-through original after it), seller row (16px avatar, first name, rating). The whole tile is one link; the heart is a sibling button over it. Hover scales the photo to 1.04 over 400ms; the tile never moves. Keyboard focus draws a 2px ink ring around the image. `RequestTile` is the same shape with "Up to $X/day".
- **Placeholder**: when an item has no photo, the 4:5 `surface` tile with one category icon, 24px mobile / 28px desktop, 1.5px stroke, `ink-4`. No illustrations or text.
- **Rail** (`rail.tsx`): title left; round arrow buttons (desktop) and a "Shop all" outline pill right; a horizontal snap row showing 1.6 / 2.6 / 4.3 tiles.
- **Mode toggle** (`mode-toggle.tsx`): Buy · Rent · Request with counts, one frosted segmented pill. Segments are links that set `?mode=`. Active segment is solid `roo` with ink text.
- **Search box** (`search-box.tsx`, Krea): frosted, `rounded-tile`, a text field, inline frosted pills for course code and pickup spot, round orange submit. Submits to `/marketplace/browse` with `q`, `course`, `spot`, `mode`.
- **Buttons** (`ui/button.tsx`): all pills with label type. `default` solid ink + white; `brand` roo + ink text; `outline` ink/20 border; `secondary` surface; `icon` 40px surface circle.
- **Frosted pills**: only on things that float over content or imagery: hero status/search/toggle, image badges and hearts, map location pills, the mobile bottom nav. On a plain background with nothing to blur, use a solid `white` or `surface` pill instead.
- **Sticker** (`sticker.tsx`): `variant="pill" | "burst" | "circle"`, `fill="peach" | "lime" | "holo" | "roo"`, `rotate` (-8° to +12°). 5px white die-cut outline, layered drop shadow, `t-label-lg` text. Max 3 per screen; only on the Home hero, empty states, the move-out tile and success screens. Never on listing tiles, filters or listing detail. Never stacked on the display headline. Copy is short and campus-flavoured.
- **Roo**: on the Home hero only, Roo is the 3D toy (`roo-sticker.tsx` → `roo.tsx` → `roo-3d.tsx`). Everywhere else (empty states, success screens, the 404) use the static die-cut sticker, `RooStickerStatic` (`roo-sticker-static.tsx`): head and pouch with a lamp and book peeking, in a holo circle. No 3D in Browse, the grid or listing detail. The old standalone Roo with a speech bubble is retired.
- **Filter panel** (`components/browse/filter-panel.tsx`): Mode, Category, Price (Free only, min/max), Condition, Pickup spot, Available by. Options are `0.875rem` light links, single select, with a check on the active one; a second click clears it. Price range and date are small GET forms that keep every other filter. Desktop: a sticky 220px rail. Mobile: inside `FiltersSheet`, a frosted "Filters" pill (with a count) that opens a bottom sheet with "Show N results".
- **Sort** (`components/browse/sort-menu.tsx`): a solid `surface` pill opening Newest / Price, low to high / Nearest to <spot>. Nearest measures from the chosen pickup spot, or Koerner when none is chosen.
- **Active filters**: solid `surface` pills with an ×, then "Clear all". Solid, not frosted: they sit on the plain page.
- **ScrollFillText** (`scroll-fill-text.tsx`): a statement whose words fill from faint to full as it scrolls through the viewport. Once on Home, in the manifesto band.
- **Bottom nav** (`bottom-nav.tsx`, DOVV): fixed, centred, `frost-dark` pill: Home, Browse, Post (orange circle), Saved, Profile. Mobile only.
- **Header** (`site-header.tsx`, Depop): logo left, pill search centre (its own row on mobile), Sign in / Saved / Post an item right, then a quiet `t-label` category row: Electronics, Textbooks, Dorm & Kitchen, Outdoor, Music, Sports, Tools, Free.
- **Footer** (`site-footer.tsx`): no repeated nav. About, How it works, Safety, Campus spots, and the demo note.

## Pages

- **Home** (`/marketplace`, built): demo banner; hero split (left `surface` tile with status pill, display headline, one line, mode toggle, frosted search; right collage tile with up to 3 stickers); trust row; dark manifesto band with `ScrollFillText`; Shop by category tiles; the mode's rail (Fresh on campus / Rent it this week / Wanted by classmates); Pick up near you map; Move-out sale tile (countdown only in March–April); Wanted by classmates rail.
- **Browse** (`/marketplace/browse`, built): eyebrow and `t-h2` title, the mode toggle with counts (click the active mode again to clear it), Filters pill (mobile) and Sort pill, active filter pills, then the filter rail and a 2 / 3 / 4-column grid (gap 14–16px, row gap 32px). Every filter is a URL param (`mode`, `q`, `course`, `category`, `condition`, `spot`, `min`, `max`, `price=free`, `date`, `sort`); the logic is in `src/lib/browse.ts`. Results merge the demo catalog with API listings; a demo item whose first two title words match an API listing is dropped in favour of the real one. No mode = buy and rent; Request mode shows request tiles and hides Condition, Pickup spot and Sort. Empty state: the static Roo sticker, "Roo couldn't find that." in `t-statement`, then "Ask for it" (brand) and "Clear filters".
- **Listing detail** (`/marketplace/listings/[id]`, built): serves demo catalog ids (`b-1`, `r-2`…) and real API listings (UUIDs) through `src/lib/listing-detail.ts`. Left: the gallery (`components/detail/gallery.tsx`): desktop mosaic of one large photo and up to four small (fewer photos, fewer cells); mobile/tablet a swipeable 4:5 row; no photos, the placeholder. Under it, "About this item": a hairline-ruled row of Condition / Category / Pickup / Listed, then the description in `t-body`. Right, sticky at 136px: `t-meta` spot · availability, `t-h2` title, the price at 36px with its unit (struck original and `-%` in `deal` when discounted), deposit line, a solid Buy / Rent segmented pill when the item has both offers (`?as=rent`), Pickup, then the action, the seller card (`surface`, 48px initials avatar, name, Verified UBC in `ok`, faculty and year, rating or handoffs, response time) and a safety line. Action: for API listings the real request form (sign-in prompt when signed out, "Ask for it" when unavailable, dashboard link on your own); for demo items pickup slot pills (solid, selected = ink) and a brand CTA (Buy this / Rent this / Borrow this) that opens a local success card with the static Roo and one sticker, marked "Demo · nothing was sent". Below: "More from <seller>" and "Similar nearby" rails (same category, nearest pickup spot first). No stickers or 3D on the page itself.
- **Mockup photos**: demo and seeded API listings use free Unsplash photos hot-linked from `images.unsplash.com` and cropped to 4:5 by its CDN (`src/lib/photos.ts`). Replace them when listings carry real uploads.
- **Post flow** (`/marketplace/listings/new`, built; `components/post/post-flow.tsx`): a `t-display` "Pass it on" opener, then one centred 680px white card (`rounded-tile`, hairline border) with four steps shown as pills above it (frosted; the current step solid ink; done steps get a check and stay clickable): **Photos** (1–8, each centre-cropped to 4:5 in the browser by `crop.ts`, first is the cover, "Make cover" and remove on each, drag-and-drop) → **Details** (title, category, condition pills, description, plus the mock "Draft it for me" assistant) → **Price** (Rent it out / Sell it segmented pill in `roo`; rent = daily rate or "Lend it for free" + optional deposit; sell = one price, 0 for free) → **Pickup** (one of the four campus spots, available-from date, pickup time pills) → **Check and publish** review. Each Next validates its step and shows one `deal`-coloured line; focus moves to the step heading. Rentals publish through the existing `createListingAction` (spot as location, pickup date and time appended to the description) and need sign-in; signed-out visitors see a note up top and "Sign in to publish" at the end. Sale listings aren't in the API, so they end on a local success screen ("Your item is up.", static Roo + one burst sticker, marked demo). Photos are not uploaded anywhere: the API has no photo field.
- **Profile** (`/marketplace/profile/[id]`, built; data in `src/lib/profile.ts`): a `surface` header tile with a 96px initials avatar, the name in `t-statement`, Verified UBC (`ok`), program · campus · joined date, and four stats (Rating, Handoffs, Listed, Replies) in `t-h3` at 400; the stats sit right of the name from `lg`, below it under `lg`. Then a solid segmented pill of tabs with counts (Listings = for sale, Rentals = for rent, Requests, Reviews), set by `?tab=` and defaulting to the first tab with anything in it. Tabs render the 2/3/4-column tile grid, request tiles, or review cards (`surface`, `rounded-card`, initials, item and age in `t-meta`, five stars). Empty tabs show one `t-h3` line and a "Browse campus" outline pill. The six demo sellers are the seeded API users: the profile merges their API listings with their demo catalog items (matched by full name, `src/lib/people.ts`) and shows sample reviews; the rating is the average of those reviews. Seller cards on listing detail link here. Until rebuilt they render with the legacy token names in `tokens.css`, which now point at the new palette.

## Do / don't

- Do let photos carry the colour. Don't tint backgrounds, headings or decoration orange.
- Do use one price per tile. Don't show two prices of equal weight, or any bold.
- Do write pickup as "SPOT · TIME" ("TOTEM PARK · FROM NOV 12"). Don't write a bare "Pickup today".
- Do keep dates relative to today in demo data (`src/lib/catalog.ts` stores offsets).
- Don't use a colour, radius or font size outside this file.

## Changes from the brief's starting values

- `ink-3` is `#767676`, not `#9A9A9A`: `#9A9A9A` is 2.7:1 on `bg` and fails AA for text. `#9A9A9A` is kept as `ink-4` for icons and the unfilled scroll-fill words, which are decorative.
- Orange fills carry **ink** text, not white: white on `#F26B1D` is 3.0:1 and fails AA at label sizes; ink on orange is 6.3:1. The active mode is therefore an orange segment with ink text, rather than orange text (orange text on the frosted pill is under 3:1).
- Listing tile images use 18px (`rounded-thumb`), as the tile spec asks; 14px (`rounded-img`) stays for images inside cards.
- The 16px seller avatar shows its initial at 8px. It's the one size below the scale, and it's decorative (`aria-hidden`); the name is next to it.
