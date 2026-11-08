# Design: Stuffaroo

The locked system. Every Hallmark run reads this first and pages share it. Change it on purpose; the file is the rule.
Source: nomu.store, fetched 2026-11-07, for every element; the team's Stuffaroo index.html lends only the hopping wordmark (see `.hallmark/brand-spec.md`).

## System
- Genre: playful
- Shape of the first page: centred hero on grid paper, blue band with one bento card, quiet pill index with listing cards, bento steps, centred close; inner routes are app screens
- Theme: brand, Nomu (spec 2026-11-07) with playful touches
- Axes: light/grotesk-sans/chromatic-pink · posture: committed

## Tokens
`src/app/tokens.css` is the source of truth. The roles:
```css
:root {
  /* Palette: Cotton candy, chosen by the user 2026-11-07: every pastel at one lightness and softness, pink to lilac */
  --color-paper: #fef8fd (with an 80px grid at 5% ink);  --color-paper-2: #ffffff (cards);  --color-paper-3: #f6edf5;  --color-interior: #f9f2f8;
  --color-ink: #281d2b;  --color-ink-3: #6b5e6e;  --color-steel: #7e6f7e;  --color-rule-field: #9c8c9d (field edges, 3:1);
  --color-signal: #f1accc (fills, ink text 8.9:1);  --color-signal-deep: #a14174 (large pink type);  --color-accent: #a14174 (pink text);  --color-accent-deep: #87305f (pink text on pastels);
  --color-tint-peach: #ffdcec (pink);  --color-tint-mint: #f1e0ff (lilac);  --color-tint-butter: #ffdddb (rose);  --color-tint-blue: #e1e5ff (periwinkle);
  --font-display: Inter 400, -0.045em;  --font-body: Inter;  --font-outlier: Baloo 2 800 (the wordmark only);
  --radius-small: 12px;  --radius-field: 14px;  --radius-card: 28px;  --radius-feature: 40px;  --radius-pill: 9999px;
  --shadow-card: 0 16px 40px -24px rgb(40 29 43 / 0.26);  --shadow-float: 0 16px 44px -12px rgb(40 29 43 / 0.2);  --interior-edge: inset 0 0 0 1px rgb(40 29 43 / 0.06);
  --cta-gradient: linear-gradient(92.45deg, #ed9ac1, #f1accc);  --blue-band: linear-gradient(180deg, #e7e3ff, #f6f0ff) (now a lilac band);
}
```

## Controls
- Primary: the pink CTA gradient pill, ink Inter 16/500, 52px tall, 38px side padding · the only filled action
- Secondary: white pill, #e5e5e5 border, same height
- Search: white pill, 64px, field-edge border, float shadow, pink gradient round submit
- Chips and category links: white pills with the faint inner edge, ink-3 text
- Fields: 14px radius, field-edge border

## Surfaces and play
- Nav: white floating pill, 80px, float shadow; the wordmark "Stuff" ink + "aroo" orange in Baloo 2, "aroo" hops on hover
- Bento (`.bento`): a 16px white border, 56px radius, interior fill and inner edge, one element (never a card in a card); used for feature panels and steps
- Listing cards: white, 40px radius, 12px padding around a 28px picture well on the interior grid, Inter 20/400 title, lift 4px on hover
- Section heads: Inter 52/400 tight, left aligned, an Inter 19 line under
- Status chips: pastel pills with ink text (inner screens)

## Pages
- `/` home: Roo and "What can Roo find for you today?", the search, the Buy / Rent / Request switcher, category pills, three teasers, the close
- `/marketplace/deals`: price drops, on sale now, dorm bundles (discounts computed from original prices); `/marketplace/move-out`: countdown to April 30 and listings to reserve; `/marketplace/wanted`: "Classmates are looking for" with "I have this!"
- Nav: Browse, Deals, Wanted, Move-out, a Post menu (sell, rent out, request); Dashboard and Deposits live in the avatar menu

## Motion
- Apple-style: feedback on press (scale 0.97, 80ms), springs as CSS `linear()` easings (`--spring` damping 1.0 / 590ms, `--spring-bounce` damping 0.8 / 540ms)
- The switcher's indicator slides on `--spring` and re-aims mid-flight; Roo's bubble materializes from its corner on `--spring-bounce`; teaser cards lift on hover
- The nav pill is a translucent material (white 62%, 20px blur), solid under reduced transparency or higher contrast; reduced motion turns every slide and bounce into a fade

## Exports
`src/app/tokens.css` in this project (Tailwind v4 `@theme static`).
