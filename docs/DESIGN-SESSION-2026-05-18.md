# Design session summary — 2026-05-16 → 2026-05-18

Outcome of the two-day design pass on branch `feat/heroui-storefront-migration`. Run via gstack `/design-consultation` followed by four `/design-html` invocations. DESIGN.md at the repo root is the source of truth; this summary is the index.

## 1 · Artifacts on disk

All artifacts live in `~/.gstack/projects/smoxhakim-v-fixer/designs/`. They are user-data, persist across branches, and are not committed to this repo.

| Artifact | Path | Purpose |
|---|---|---|
| **DESIGN.md** | `/Users/smoxWork/Desktop/driss/Vfxer/DESIGN.md` | Repo-level source of truth for tokens, type, layout, motion, refusals, decisions log |
| **Design-system preview** | `~/.gstack/projects/smoxhakim-v-fixer/designs/design-system-20260516-144320/preview.html` | Single-file specimen: typography, palette, components, motion section, bilingual block |
| **Storefront homepage** | `~/.gstack/projects/smoxhakim-v-fixer/designs/storefront-homepage-20260516/finalized.html` | No-hero+hero-spread homepage with Récemment ajoutés card grid, category index, ruled-row Back-in-stock, trust strip |
| **Product detail page** | `~/.gstack/projects/smoxhakim-v-fixer/designs/pdp-aifen-a902-20260516/finalized.html` | Image gallery with cross-fade, bilingual price block (R3 risk), specs ruled-rows, compatibility pills, FR/AR bilingual description, related-products grid |
| **Cart + order summary** | `~/.gstack/projects/smoxhakim-v-fixer/designs/cart-20260518/finalized.html` | Pure ruled-rows ledger view, per-line qty steppers + live recalc, sticky summary panel with R3 bilingual total, three payment modes (paiement-à-la-livraison default), confirm button |
| **Category browse · Pannes & accessoires** | `~/.gstack/projects/smoxhakim-v-fixer/designs/category-pannes-20260518/finalized.html` | Filter sidebar (disponibilité, marque, série, géométrie, prix), sort dropdown, view toggle, 20-card grid with Pretext-grouped uniform title heights, pagination |

All five HTML files inline Tailwind-free CSS, load fonts from Google Fonts, and use Pretext (`pretext.js` vendored in each directory) for resize-aware text layout. They are self-contained references for the HeroUI migration, not production code.

## 2 · Key decisions

### Anchor
> **v-fixer treats the customer like an adult — real stock, real prices, no theatrics.**

Every design choice serves this. The customer is the Moroccan/MENA repair technician who buys soldering stations, microscopes, pannes Magma — a professional shopper sick of being lied to by Jumia-style banner theater and generic SaaS template e-commerce. The competitive opening is *not lying.*

### Palette
Linen paper background `#F5F1E8`, warm near-black ink `#1C1A17`, hairlines `#D9D2C1` instead of shadows, single **blueprint-blue accent `#1E5A8A`** used only for prices, primary CTAs, and in-stock dots. The accent appears max ~3 times per viewport. Image wells stay pure white so catalog cutouts don't seam against the linen body. Dark-mode variants use warmer ink + slightly brighter accent.

### Typography
- **Fraunces** (display only) — wordmark, page titles, section headers. Free, variable, opsz axis.
- **Geist** (body + UI, Latin) — modern neo-grotesque, tabular nums by default. Lower convergence than Inter.
- **IBM Plex Sans Arabic** (body + UI, Arabic) — pairs visually with Geist via shared sans-grotesque DNA. RTL first-class.
- **JetBrains Mono** (prices, SKUs, stock counts) — tabular by default. Prices feel like ledger entries.

All four families are free / OFL or Apache 2.0.

### Hero pattern
**User-controlled product spread** between info strip and Récemment ajoutés. Max 3 slides. **No auto-rotation.** Side cards fixed (not in rotation). Square white photo wells, Fraunces headline off-photo, mono price, text-link "Acheter →" CTA. Cross-fade via `--dur-gallery` (320ms) / `--ease-out`. After iteration: 65/35 photo/info ratio, 36px headline, no description paragraph on the large slide.

### Layout — hybrid card/ruled-row
**Cards** on storefront browse (home, category, search results, related products). **Ruled rows** on cart, order summary, admin tables. Discipline is identical across both forms (hairlines instead of shadows, mono prices, no theatrics); only the layout differs based on user task (browsing vs summing).

### Motion
Five duration tokens (`--dur-micro` 100ms → `--dur-gallery` 320ms), three easings. Allowed: page transitions, add-to-cart label swap + cart-count pulse, PDP gallery cross-fade, card hover (background tint, no transform), input focus. Refused: scroll-jacking, parallax, scroll-reveal, skeleton shimmer, animated counters, marquee. All motion respects `prefers-reduced-motion: reduce`.

### Bilingual numerals (R3)
On PDP and cart, totals display Latin and Arabic-Indic digits side-by-side: `3 800,00 MAD` with `٣٬٨٠٠٫٠٠ درهم` directly below. Cultural fluency move no MENA competitor offers. Costs ~12% horizontal space; can be disabled if mobile gets cramped.

## 3 · Deliberate exceptions documented in DESIGN.md

These departures from earlier constraints are recorded in the DESIGN.md decisions log and the relevant spec sections. They are not drift — they are codified.

| Exception | What changed | Why |
|---|---|---|
| **Filled blueprint-blue button on conversion CTAs** | Hero/featured-rail CTAs are text links with 1px underline; PDP, cart, checkout CTAs are filled accent buttons (2px radius, no gradient, no shadow). | Browse mode vs conversion mode. On mobile especially, the primary conversion CTA needs to be unambiguously clickable; an underlined link doesn't read as a button without hover. |
| **Hero slide description removed** | Hero spec was `eyebrow + headline + description + price + CTA`. After iteration: description refused on the large slide. The slide is now `eyebrow + headline + price + CTA` only. | Photo dominates the visual weight at the new 65/35 ratio. The headline anchors it; the description was competing for attention without earning it. Side cards keep their compact info layout (no description there either). |
| **"Prix réduits" surfaces via footer nav, not a homepage rail** | We did not add an "En promo" homepage section despite the user's initial instinct. Promotions surface inline via `price-was` lines on existing cards. A dedicated "Prix réduits" link in the footer Boutique list gives shoppers an entry point. | A promo rail would re-introduce marketing energy the anchor refuses. Discounts are already visible per-card; routing aggregation through nav is the disciplined path. |
| **Product rating stripped from PDP** | Initial PDP had "4,8 ★ / 12 avis" in the meta row. Removed because no review system exists and inventing the numbers violates the anchor. | "Treats the customer like an adult" means displaying nothing rather than displaying fake numbers. Rating returns when reviews are real (see open task #2). |

## 4 · Open content tasks (not design issues)

These belong to the operations / data / content side of the project, not the design system. The DESIGN.md spec is stable; these tasks unblock production deployment of the migration.

1. **Re-shoot product photos to remove supplier watermarks.** Several photos in `backend/media/imports/.../` (notably the Aifen A902 Pro lifestyle shot) carry visible WeChat/WhatsApp contact watermarks from Chinese suppliers (e.g., `WA/Wechat: +86 1536…`). The design system handles them gracefully (white photo wells with hairline border), but the watermarks are immediately recognizable and undercut "treats the customer like an adult." Action: commission clean product photography or strip watermarks before launching the storefront publicly.

2. **Decide on real review system vs. permanent removal of the rating line.** PDP currently has no rating display. The Product model in `backend/catalog/` has a `rating` field that is not exposed in the storefront UI. Two paths: (a) build a review-collection system tied to verified orders, then re-add the rating line to PDP with real data; or (b) commit to permanent removal and clean up the unused model field. Reasonable defaults: stay without ratings for the first six months, then revisit based on customer-support feedback. The fake-review problem is real; better no ratings than fake ones.

3. **Populate real product data for the category-browse filter facets.** The `category-pannes-20260518` page hard-codes filter facets (Magma 68, JBC 24, Aifen 18, …) and faceted counts based on plausible-looking numbers, not the actual catalog. Before this page ships in TSX, wire the facets to live data from the catalog API (filter by series, brand, geometry — schema fields likely need to be added to the Product model since current model has only `name`, `slug`, `category`, `price`, `cost_price`, `stock`, `images`, `description`, `specs`). The 20 sample cards likewise use repeated product images and synthesized titles; replace with real inventory before launch.

## What's next (suggested)

- Commit DESIGN.md and `docs/DESIGN-SESSION-2026-05-18.md` to the branch.
- Start porting the five HTML files to Next.js + HeroUI + Tailwind v4 components. Wire HeroUI's theme tokens to the CSS custom properties in DESIGN.md. Use `next/font` for Fraunces and Geist; install `@chenglou/pretext` via npm for the resize-aware text layout patterns.
- Resolve the three open content tasks above before deploying the storefront publicly.

Run `/design-html` again to prototype account, order-tracking, checkout, or admin pages when needed.
