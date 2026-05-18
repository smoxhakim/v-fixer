# Design System — v-fixer

The visual source of truth for the v-fixer storefront and admin. Read this before making any UI, styling, or motion change. Flag deviations in QA.

## Anchor

> **v-fixer treats the customer like an adult — real stock, real prices, no theatrics.**

Every decision below serves this anchor. Where they conflict with category convention (carousels, scarcity timers, gradient buttons), the anchor wins.

## Product context

- **What this is:** Moroccan e-commerce app selling electronics repair tools — soldering stations, microscopes, tips, alimentations, consommables, outillage de précision, ESD protection. Brands carried: Kaisi, Magma, Aifen, Sugon, Goot.
- **Who it's for:** Technicians and repair shops in Morocco/MENA. B2B-leaning audience that needs specs, refs, and stock counts more than lifestyle photography.
- **Project type:** Dual surface — customer storefront (Next.js, mid-migration to HeroUI) + admin/inventory tool (current shadcn stack). Both surfaces follow this system.
- **Locales:** French (primary), Arabic (RTL, first-class), English (later).

## Aesthetic direction

- **Direction:** Trade Catalog Modern — restrained, information-first, confidently regional without being themed-Moroccan-cliché.
- **Decoration level:** **minimal** — typography and hairlines do all the work. No gradients, no shadows, no decorative blobs, no skeleton shimmer.
- **Mood:** A Moroccan trade ledger. Linen paper, ink, one stamp of blueprint blue. Reads as: serious shop, real numbers, not a sales pitch.
- **Reference posture:** McMaster-Carr's information discipline + Aesop's typographic poise + the warmth of a paper bookkeeping ledger.

## Color

All values are sRGB hex. The accent appears **~3 times per viewport maximum** — price digits, primary CTA, in-stock signal. Nowhere else.

### Light mode

| Token | Hex | Role |
|---|---|---|
| `--bg` | `#F5F1E8` | Page background — linen paper |
| `--surface` | `#FBF8F1` | Cards, tiles, ruled-row backgrounds |
| `--surface-2` | `#EFEADF` | Hover state for surfaces |
| `--photo-bg` | `#FFFFFF` | Image wells inside cards (keeps catalog cutouts seamless) |
| `--ink` | `#1C1A17` | Primary text, warm near-black (never pure black) |
| `--muted` | `#6B655A` | Secondary text, meta, mono labels |
| `--rule` | `#D9D2C1` | Hairlines, dividers, card borders (replaces shadows) |
| `--accent` | `#1E5A8A` | Blueprint blue — prices, primary CTA, in-stock dot |
| `--in-stock` | `#4F6B3A` | Sage — "in stock" semantic |
| `--low-stock` | `#8B6F47` | Sand — "low stock" semantic (never red, never alarmist) |
| `--out-stock` | `#8A2A2A` | Deep red — "out of stock" semantic only |

### Dark mode

| Token | Hex | Role |
|---|---|---|
| `--bg` | `#14110D` | Warm near-black |
| `--surface` | `#1B1814` | Cards, tiles |
| `--surface-2` | `#221E18` | Hover state |
| `--photo-bg` | `#F5F1E8` | Image wells stay light so catalog photos read true |
| `--ink` | `#EDE7D8` | Primary text, warm cream |
| `--muted` | `#9A9281` | Secondary text |
| `--rule` | `#2C2820` | Hairlines |
| `--accent` | `#4A8FBE` | Blueprint blue, slightly brighter for eye comfort |
| `--in-stock` | `#7FA56F` | Sage, brightened |
| `--low-stock` | `#B89971` | Sand, brightened |
| `--out-stock` | `#C25B5B` | Red, brightened |

### Usage rules

- The accent (`--accent`) is sacred. Use it **only** for price values, primary CTA backgrounds/borders, in-stock dots, focused input borders. Never as a heading color, never as a decorative background, never as a gradient stop.
- Photo wells (`--photo-bg`) stay pure white in light mode and warm cream in dark mode. This keeps catalog cutouts (most v-fixer photography) from seaming against the linen body.
- Stock states (`--in-stock`, `--low-stock`, `--out-stock`) are semantic-only. Don't repurpose them for decoration.

### Primary CTA pattern — text link on browse surfaces, filled button on conversion surfaces

The system has two CTA styles. Pick by surface, not by component.

| Surface | CTA style | Example | Why |
|---|---|---|---|
| Hero spread, featured rails, marketing rows | **Text link** with 1px underline in `--accent` | "Acheter →" | Browse mode. The CTA is one of many things on screen; an underlined link doesn't shout. |
| PDP, cart, checkout, account actions (save, confirm order, change password) | **Filled `--accent` button**, 2px radius, no gradient, no shadow | "Ajouter au panier", "Valider la commande" | Conversion mode. The CTA is the most important thing on screen and should look unambiguously clickable, especially on mobile where hover doesn't exist. |
| Secondary actions on any surface | **Text link** with 1px hairline underline in `--rule` (shifts to accent on hover) | "Favoris", "Comparer" | Always second-tier; never compete with the primary. |
| Section "see all" / navigation links | **Text link** in `--accent`, no underline by default; arrow glyph included | "Tout voir →" | Wayfinding, not a CTA. |

Refused: gradient buttons, button shine, drop shadow on buttons, bubble radius (>2px) on buttons, ghost buttons with thick borders, secondary buttons with the same visual weight as primary.

## Typography

All families are free / open-source. Load from Google Fonts:

```html
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Geist:wght@300;400;500;600;700&family=IBM+Plex+Sans+Arabic:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
```

| Role | Family | License | Notes |
|---|---|---|---|
| Display (wordmark, page titles, section headers) | **Fraunces** | OFL | Variable, opsz axis. Use 22px+ minimum, weights 400–600. |
| Body + UI (Latin) | **Geist** | OFL (Vercel) | Tabular-nums by default. 14px holds on mobile. |
| Body + UI (Arabic) | **IBM Plex Sans Arabic** | OFL (IBM) | Pairs with Geist via shared neo-grotesque DNA. |
| Numbers + identifiers (prices, SKU/REF, QT, stock) | **JetBrains Mono** | Apache 2.0 | Tabular by default, humanist digits. |

### Scale (modular, base 16px)

| Level | px | rem | Use |
|---|---|---|---|
| `xs` | 12 | 0.75 | meta, refs (mono), badge text |
| `sm` | 14 | 0.875 | body, table cells, card titles |
| `base` | 16 | 1.0 | default body |
| `md` | 18 | 1.125 | section subheads, large body |
| `lg` | 22 | 1.375 | minor headlines |
| `xl` | 28 | 1.75 | section titles |
| `2xl` | 36 | 2.25 | page titles |
| `3xl` | 48 | 3.0 | hero/intro display (rare) |
| `4xl` | 56 | 3.5 | landing-page display only (very rare) |

Mono prices use `1.05×` the surrounding body size for emphasis without a size jump.

### Font feature defaults

Body and UI:
```css
font-feature-settings: "tnum" on, "ss01" on;
```

Display (Fraunces):
```css
font-variation-settings: "opsz" <size>, "SOFT" 30;
```

## Spacing

- **Base unit:** 4px
- **Density:** comfortable but tight — leans denser than typical SaaS to match catalog density.
- **Scale:** `2xs 2 · xs 4 · sm 8 · md 12 · lg 16 · xl 24 · 2xl 32 · 3xl 48 · 4xl 64`

## Layout

- **Approach:** grid-disciplined with a hybrid card/ruled-row split (see Risks below).
- **Grid:** 12-col desktop, 6-col tablet, 1-col mobile.
- **Max content width:** 1200px (tighter than SaaS default — catalog-flavored).
- **Border radius:**
  - **2px** on buttons, inputs, cards (functional, quiet — never bubble-radius)
  - **0px** on ruled rows, table cells, image-well dividers
  - **9999px** only on chips, pills, status badges
- **Elevation:** hairline rules (`--rule`) + ink-weight changes. **Zero drop shadows. Zero glow.**
- **Hairlines:** 1px solid in `--rule`. On retina, 0.5px is acceptable but never decorative.

### Hero — user-controlled product spread (homepage only)

The homepage may include exactly one hero spread between the info strip and the first card row. It is not a carousel in the marketing sense — there is no auto-advance, no theatrical motion, and no overlay text. Treat it as a featured-products display the user advances at their own pace.

Constraints:

- **Position:** between the info strip and "Récemment ajoutés." Homepage only — never on category, PDP, cart, or admin pages.
- **Layout:** two columns on desktop (~2/3 large slide, ~1/3 two stacked cards). Single column on mobile (large slide on top, side cards below).
- **Slides:** maximum 3. The large slide rotates between them; the two side cards are fixed (not part of the rotation).
- **Slide anatomy:** square white photo well on one side, info column on the other — eyebrow label in mono, headline in Fraunces, price in tabular mono with blueprint-blue color, single text link CTA ("Acheter →") with a 1px underline. **No description paragraph on the large slide** — the photo carries the visual weight, the headline anchors it, the price and CTA are operational signals. **Text never overlays the photo.**
- **Navigation:** dot indicators centered below the large slide, with prev/next arrows on either side. Active dot widens to a 22px pill in `--accent`. Keyboard left/right arrows when focus is inside the hero.
- **Motion:** cross-fade between slides using `--dur-gallery` (320ms) and `--ease-out`. No slide-in, no zoom, no Ken Burns. Slide change is user-initiated only.
- **Side cards:** one product card + one category card, or two products. Same hairline + white-well discipline as the main slide, scaled down.
- **Visuals refused inside the hero:** no overlay text, no gradient buttons, no rounded-bubble radius, no shadow, no filled CTA, no "sale" badges (the `price-was` line carries the discount inline as it does everywhere else), no dark photo backgrounds, no lifestyle staging that fights the catalog look.

### Cards vs ruled rows — the hybrid

Cards on **storefront browse, home, search results, related products**:
- Image well at 1:1 aspect (square — works for varied product shapes: tips, microscopes, stations, consumables)
- Image well background: `--photo-bg` (pure white in light, warm cream in dark)
- Card body background: `--surface` (linen)
- Hairline border (1px solid `--rule`) around the entire card
- 2px radius, no shadow, no lift on hover

Ruled rows on **cart, order summary, checkout review, admin tables (products, orders, inventory)**:
- Image left at 56–64px square, with `--photo-bg` background and a 1px `--rule` border
- Title + ref/category in the middle
- Price right-aligned in tabular mono
- Full-width hairline dividers between rows, 0px radius

The discipline is identical across both forms — hairlines instead of shadows, mono prices, no theatrics. Only the layout differs based on user task (browsing vs. summing).

## Motion

All motion serves an action the user already asked for. It confirms; it never decorates. Tokens live in CSS custom properties and are referenced by every transition and animation in the system.

### Tokens

```css
:root {
  /* Easings */
  --ease-out:    cubic-bezier(0.2, 0, 0, 1);     /* enter, primary motion */
  --ease-in:     cubic-bezier(0.4, 0, 1, 1);     /* exit */
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);   /* state-to-state */

  /* Durations */
  --dur-micro:   100ms;   /* state acks, ticks */
  --dur-short:   150ms;   /* card hover, input focus */
  --dur-card:    180ms;   /* add-to-cart label swap, cart-count pulse */
  --dur-page:    240ms;   /* page transitions (View Transitions API) */
  --dur-gallery: 320ms;   /* PDP image gallery cross-fade */
}

@media (prefers-reduced-motion: reduce) {
  :root {
    --dur-micro: 0ms; --dur-short: 0ms; --dur-card: 0ms;
    --dur-page: 0ms; --dur-gallery: 0ms;
  }
}
```

### Allowed motion

| Where | What | Duration | Easing |
|---|---|---|---|
| Page transitions | View Transitions API, fade between routes. No slide, no zoom. | `--dur-page` (240ms) | `--ease-out` |
| Add to cart | Primary button label swaps `"Ajouter au panier"` → `"Ajouté ✓"`. Cart-count badge pulses `scale 1 → 1.18 → 1` with accent flash. | `--dur-card` (180ms) | `--ease-out` |
| PDP image gallery | Cross-fade on dot/arrow click. Touch swipe uses horizontal translate. | `--dur-gallery` (320ms) | `--ease-out` |
| Product card hover | Background shifts `--surface` → `--surface-2`. **No transform, no scale, no lift, no shadow.** | `--dur-short` (150ms) | `--ease-out` |
| Input focus | Border shifts to `--accent`, background `--surface` → `--bg`. | `--dur-short` (150ms) | `--ease-out` |
| Theme toggle | Body background/text color transition. | `--dur-page` (240ms) | `--ease-out` |

### Refused

- **Scroll-jacking** — hijacks user scroll speed; breaks input device expectations.
- **Parallax** — looks "designed"; adds nothing to comprehension.
- **Scroll-reveal / entrance choreography** — elements fading in on scroll says "look at me." A serious catalog appears at once.
- **Skeleton shimmer** — moving gradients pretending to be content. Use the ruled layout itself as the loading state (static placeholder rows in `--rule` opacity).
- **Animated counters** — tweening numbers to look impressive is theater.
- **Marquee / auto-rotating carousels** — content that moves without user input. Users distrust anything they can't control. *The homepage hero slider is user-controlled (no auto-advance) and is explicitly allowed under "Hero — user-controlled product spread" above; do not conflate the two.*
- **Hover-shadow lift** — cards stay where they are.
- **Gradient sweeps, button shine, ripple effects** — all decoration.

All motion respects `prefers-reduced-motion: reduce` — durations collapse to 0ms.

## Visual refusals

In addition to the motion refusals above, the system refuses:

- Gradients of any kind (backgrounds, buttons, accents).
- Drop shadows, box-shadow elevation, glow effects.
- Border-radius above 2px on cards/buttons/inputs (badges/pills excepted).
- Sale ribbons, "NEW" badges, countdown timers, urgency banners.
- Emoji in production UI.
- Lifestyle stock photography, "trusted by" logo walls, testimonials carousels. (Hero *spreads* — user-controlled, max 3 slides, no overlay text — are allowed on the homepage only; see "Hero — user-controlled product spread" above.)
- Purple/violet accents, gradient CTAs, animated borders.
- Inter, Roboto, Arial, Helvetica, Open Sans, Lato, Montserrat, Poppins, Space Grotesk as primary type.

## The three risks

Safe choices keep v-fixer literate in the e-commerce category (top-bar search, product detail anatomy, cart/checkout flow, card-based browse). These three risks are where v-fixer becomes memorable. Each is a literal expression of the anchor.

**R1 — Disciplined cards on browse, ruled rows where prices sum.**
Cards on storefront browse (image well, mono prices, hairline border, no shadow, no sale ribbon, 2px radius). Ruled rows on cart, order summary, and admin tables (image-left, title center, price-right in mono). The discipline is identical; the form follows shopper behavior.

**R2 — Blueprint blue + linen palette.**
A single restrained `#1E5A8A` accent on linen `#F5F1E8`. Departs from both MENA convention (Jumia orange, Avito sky-blue) and generic SaaS templates. The drafting-blue lineage supports the trade-ledger anchor without being themed.

**R3 — Bilingual numerals on price detail.**
On product detail pages and cart totals, Latin and Arabic digits appear side-by-side in tabular mono (e.g., `4,370.00 MAD · ٤٬٣٧٠.٠٠`). Cultural fluency no MENA competitor offers. Costs ~12% horizontal space on price detail components. Can be disabled if mobile space gets tight.

## Implementation notes

- **HeroUI migration:** wire HeroUI component tokens to the CSS custom properties above. The accent slot in HeroUI's theme should resolve to `--accent`. The default radius should resolve to 2px (HeroUI defaults to larger; override).
- **shadcn-style components (admin):** the existing oklch-based palette in `frontend/app/globals.css` should be replaced with the hex values above. Migrate gradually — start with `--background`, `--foreground`, `--primary`, `--border`, then the rest.
- **Tailwind v4:** define the design tokens in `@theme` in globals.css so utilities like `bg-bg`, `text-ink`, `border-rule`, `text-accent` are available.
- **Fonts:** load from Google Fonts in the root layout. Set `next/font` for Geist and Fraunces if available; otherwise use the `<link>` above.
- **Tabular numerals:** `font-feature-settings: "tnum" on` is body default. JetBrains Mono is tabular by default.

## Decisions log

| Date | Decision | Rationale |
|---|---|---|
| 2026-05-16 | Initial design system created via `/design-consultation` | Anchor: "treats the customer like an adult — real stock, real prices, no theatrics." Refer to `~/.gstack/projects/smoxhakim-v-fixer/designs/design-system-20260516-144320/preview.html` for the rendered preview. |
| 2026-05-16 | Linen `#F5F1E8` background kept; image wells set to `#FFFFFF` | Verified against the actual v-fixer catalog photos (mostly pure-white cutouts: Kaisi, Magma, Sugon, Goot). Placing white photos directly on linen would seam; the photo-well solution preserves both the linen body and clean catalog photography. |
| 2026-05-16 | Saffron-rust accent (proposed by Claude subagent) replaced with `#1E5A8A` blueprint blue | Brand preference: keep light blue, used the way saffron would have been (restrained, ~3 appearances per viewport). The deep desaturated cerulean has drafting-blue lineage that supports the anchor without being the sky-blue cliché. |
| 2026-05-16 | Hybrid layout (cards on browse, ruled rows on cart/admin) chosen over ruled-rows-everywhere | v-fixer is discovery shopping, not part-number lookup. Mobile shoppers browse by image and category, not REF. Ruled rows optimize for the wrong behavior on storefront browse. |
| 2026-05-16 | Geist + IBM Plex Sans Arabic as body primary; Fraunces reserved for display only | Fraunces does not include Arabic glyphs. Asymmetry between Latin (serif) and Arabic (sans) body would force the issue regardless of mobile-readability. Display-only Fraunces keeps the anti-generic signal at the typographic level that matters most. |
| 2026-05-16 | Hero spread allowed on homepage with strict constraints (no auto-advance, max 3 slides, no overlay text, text-link CTA only) | Constrained variant of the carousel pattern that doesn't violate the anchor — no theatrical motion, no urgency, no marketing energy. Treats hero as a featured-products display the user advances themselves. Auto-rotating marketing sliders remain refused. |
| 2026-05-16 | "Prix réduits" surfaces via footer Boutique nav, not a homepage rail | Promotions are already visible inline via `price-was` lines on cards. A dedicated homepage rail would re-introduce marketing energy the anchor refuses. Footer link gives shoppers a clear path to all-currently-discounted without a sales surface above the catalog. |
| 2026-05-16 | Primary CTA splits by surface: text link on browse, filled button on conversion | Browse surfaces (hero, featured rails) treat the CTA as one option among many — an underlined text link doesn't shout. Conversion surfaces (PDP, cart, checkout) need the CTA to be unambiguously clickable, especially on mobile where hover doesn't exist. Filled accent button at 2px radius, no gradient, no shadow. |
| 2026-05-16 | Product ratings stripped from PDP until real review system exists | Showing "4,8 ★ / 12 avis" without a real review-collection mechanism violates the anchor ("treats the customer like an adult — no theatrics"). Display nothing rather than display invented numbers. Add the rating back when reviews are real and writable by real customers. |
