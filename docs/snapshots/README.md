# Stuffaroo redesign snapshots

Presentation screenshots of the redesigned web app (branch `cyanghxst/frontend-overhaul`), captured 2026-11-08 from the local dev server with demo data and Unsplash mockup photos.

- `desktop/`: 1440px wide, saved at 1920px wide (JPEG)
- `mobile/`: 390px wide, saved at 780px wide (JPEG)

Full-page captures are `NN-name.jpg`; `-fold.jpg` files are the first screen only (1440×900 or 390×844), the best fit for slides.

| File | Shows |
|---|---|
| 01-home | Home: hero with Buy/Rent/Request toggle, frosted search, collage and stickers, manifesto, categories, carousels, campus map, move-out, requests |
| 02-home-rent-mode | Home with the Rent mode selected |
| 03-browse | Browse: filter rail, sort, 4-column grid |
| 04-browse-filtered | Browse with Rent + Electronics, sorted by price, active filter pills |
| 05-browse-empty | Empty state with Roo ("Roo couldn't find that.") |
| 06-listing-detail | Listing detail: gallery, sticky panel, pickup slots, seller card, related rails |
| 07-listing-buy-or-rent | An item offered both ways, with the Buy/Rent toggle on Rent |
| 08-profile | Profile: header tile, stats, tabs |
| 09-profile-reviews | Profile, Reviews tab |
| 10-post-photos | Post flow, step 1 with two photos cropped to 4:5 |
| 11-post-review | Post flow, the review step |
| 12-browse-filters-sheet | Mobile only: the Filters bottom sheet |

To regenerate (needs the dev server on :3000 and Google Chrome): install `playwright-core` in any folder, then `node capture.mjs <outDir>`.
