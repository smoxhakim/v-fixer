<!-- /autoplan restore point: /Users/smoxWork/.gstack/projects/smoxhakim-v-fixer/feat-heroui-storefront-migration-autoplan-restore-20260519-163314.md -->
# HeroUI storefront migration — plan

Source of truth: [`DESIGN.md`](../DESIGN.md). Session history: [`docs/DESIGN-SESSION-2026-05-18.md`](DESIGN-SESSION-2026-05-18.md). Reference HTML on disk: `~/.gstack/projects/smoxhakim-v-fixer/designs/` (5 directories, one per surface + the design-system specimen).

**Scope:** port the four storefront surfaces (homepage, category browse, PDP, cart) from vanilla HTML references to Next.js 16 + React 19 + HeroUI 3 + Tailwind v4. Admin pages stay on their current shadcn-based stack; this plan does not touch `frontend/app/admin/**` or `frontend/components/admin/**`.

**Out of scope (see Launch blockers section):** product photo cleanup, review system, real category filter facets.

**Total effort (solo dev pace): ~12–15 days end-to-end, ~3 weeks calendar.**

---

## Milestone 1 — Foundations

Wire the design system to the codebase. Nothing user-visible ships here; this is the substrate every primitive in M2 depends on.

**Effort: 2–2.5 days** (revised up after /autoplan: added token-probe exit gate + HeroUI radius enumeration).

### Files to change

| File | Action |
|---|---|
| `frontend/app/globals.css` | Replace the OKLch shadcn token block (lines ~10–80) with DESIGN.md hex values as **canonical tokens** (`--bg`, `--surface`, `--ink`, `--muted`, `--rule`, `--accent`, `--in-stock`, `--low-stock`, `--out-stock`). In a separate `@theme inline` block, **alias** the shadcn-named tokens (`--color-primary: var(--accent)`, `--color-card: var(--surface)`, `--color-ring: var(--accent)`, …) and HeroUI plugin tokens to those canonical sources. Single source, multiple consumer namespaces — prevents drift. Add motion tokens (`--ease-*`, `--dur-*`). Add `prefers-reduced-motion` collapse rule. Permanent: do not delete shadcn aliases when migration completes — admin consumes them. |
| `frontend/app/layout.tsx` | Swap `Inter` + `Noto_Sans_Arabic` from `next/font/google` for `Fraunces` (variable, opsz axis), `Geist`, `IBM_Plex_Sans_Arabic`, `JetBrains_Mono`. Wire each to a CSS variable (`--font-display`, `--font-body`, `--font-arabic`, `--font-mono`). Update the body `className` to apply `--font-body` by default, `--font-arabic` when `locale === 'ar'`. Verify `NextIntlClientProvider` wraps `HeroUIProviderWithIntlRouter` (not the reverse) — required for `BilingualPrice` in M2. |
| `frontend/app/globals.css` (top of file) | **HeroUI v3 has neither `HeroUIProvider` nor a JS/Tailwind plugin** — confirmed by M1 spike 2026-05-20. The actual mechanism is CSS-cascade-only. Add `@import '@heroui/styles'` (package root, not `/themes/default`) at the top of `globals.css`; it loads HeroUI's full stack in the correct layer order: `@layer theme, base, components, utilities;` → tailwindcss → tw-animate-css → base styles → component CSS → default theme variables → utilities → variants. Then redefine the color variables (`--background`, `--surface`, `--accent`, `--default`, `--success`, `--warning`, `--danger`, `--border`, etc.) under `:root` / `.dark` / `[data-theme="..."]` CSS blocks with DESIGN.md hex values — cascade order means our values win. **No `tailwind.config.ts` needed. No `heroui()` plugin call.** Working reference shipped from the spike: see `frontend/app/globals.css` (single canonical `--vfx-*` source + HeroUI and shadcn aliases). |
| `frontend/package.json` (M1 step 2 deliverable) | Add `"@heroui/styles": "^3.0.4"` as an explicit dependency. Currently transitive via `@heroui/react` and hoisted to the root `node_modules`. Explicit pin makes the dep version-controllable and survives lockfile churn. |
| M2 component examples + DESIGN.md (M1 step 2 deliverable) | `grep -rE "\bCardBody\b" frontend/ docs/` and rename to `CardContent`. v3 renamed the slot (the v2 `CardBody` no longer exists in `@heroui/react`). At least the M2 primitives table referenced `CardBody`; sweep ahead of M2 build so primitives compile on first try. |
| `frontend/lib/pretext.ts` (new) | Custom hook `usePretextHeights(refs, group?)` that imports `prepare` + `layout` from `@chenglou/pretext`, runs after `document.fonts.ready`, and observes window resize. Returns the computed `style.height` per ref. See the Risks section for the lifecycle decision. |
| `frontend/package.json` | Add `@chenglou/pretext` to dependencies. |
| `frontend/app/globals.css` | Single global rule for icon mirroring: `[dir="rtl"] [data-rtl-flip] { transform: scaleX(-1); }`. Drop the className utility approach — declarative attribute on the icon is cleaner. |
| `frontend/app/[locale]/dev/theme-probe/page.tsx` (new — **M1 EXIT GATE**) | Specimen page that renders (a) every CSS variable as a labeled swatch in light + dark side-by-side; (b) every HeroUI primitive the migration will use — `Button`, `Card`, `Chip`, `Input`, `Switch`, `Modal`, `Pagination`, `Drawer`, `Select`, `Navbar` — in both themes; (c) Fraunces + Geist + IBM Plex Sans Arabic + JetBrains Mono specimens at three sizes each. **M1 does not merge until the probe shows zero default-token leakage and consistent radii across all primitives.** |
| HeroUI radius audit (deliverable, not a file) | Enumerate every HeroUI primitive the migration uses, `grep "rounded-" node_modules/@heroui/theme/dist/` for each, identify which slots hardcode radii (Chip, Avatar, Switch thumb, Skeleton, possibly others), and pre-write `classNames={{...}}` overrides per slot. Discover this in M1, not piecemeal in M2. |

### Dependencies

- Confirm `@chenglou/pretext` is published on npm. If not, vendor `pretext.js` into `frontend/lib/vendor/pretext.js` and import locally.
- **HeroUI v3 themes are CSS-cascade-based, not provider-based and not plugin-based.** Confirmed by M1 spike 2026-05-20: `@heroui/styles` ships a package-root `index.css` that chains all theme/base/component/utility/variant CSS via `@import` in layered order. There is no `heroui()` JS export, no Tailwind plugin function, and no `HeroUIProvider`. Override mechanism is straight CSS cascade: import the package, redefine the variables in `:root` / `.dark`. (The autoplan correction that pointed at a `heroui({ themes })` plugin was wrong — the spike found the actual mechanism.) Existing reference: the spike's `frontend/app/globals.css`.
- Tailwind v4 reads tokens from `@theme` blocks; confirm the existing `@source` directive for `node_modules/@heroui/theme/dist/**/*` still emits the utilities we need after the token swap. After any token swap, `rm -rf frontend/.next` to force a clean Tailwind rebuild — HMR sometimes misses changes in node_modules.

### Sequence

1. `@import '@heroui/styles'` at the top of `globals.css` (loads HeroUI's full layered stack — must come BEFORE our token overrides so cascade wins).
2. Token block in `globals.css` under `:root` / `.dark` (canonical `--vfx-*` source + shadcn + HeroUI variable aliases). Also: add explicit `"@heroui/styles": "^3.0.4"` to `frontend/package.json`, and run the `grep -rE "\bCardBody\b" frontend/ docs/` rename sweep.
3. `next/font` setup in `layout.tsx` next (depends on globals being set so the CSS variables exist). Verify provider wrap order.
4. Pretext hook + npm dependency.
5. RTL global rule + `data-rtl-flip` attribute pattern.
6. **Dev page location constraint** (documentation step, no code). Next.js 16's `frontend/proxy.ts` is the v16-era replacement for `middleware.ts`. It wraps `createMiddleware(routing)` from `next-intl` with `localePrefix: "always"`. Effect: every non-locale path (e.g. `/dev/theme-probe`, `/sandbox/*`) redirects to `/fr/...` and 404s unless the file exists under `[locale]/`. **All dev / probe / sandbox / internal-tooling pages MUST live under `frontend/app/[locale]/...`** for the duration of the migration. Document this in CLAUDE.md once M1 ships.
7. Theme-probe specimen page at `frontend/app/[locale]/dev/theme-probe/page.tsx` (exit gate — M1 doesn't merge until the probe shows DESIGN.md colors flowing into Button/Chip/Card in both themes with no default-token leakage).
8. HeroUI radius audit deliverable produced; per-slot `classNames` overrides documented. **The spike confirmed radii do NOT flow through CSS variable override** — Button.css uses literal `@apply rounded-3xl` (30px) and Chip.css uses `rounded-[20px]`. DESIGN.md's 2px on buttons requires an explicit CSS override (`.button { border-radius: 2px; }`) OR per-instance `classNames`. **Decision committed 2026-05-20 (three-tier hybrid spec):** Tier 1 → 2px override on `.button`, `.input`, `.textarea`, `.select`, `.card` (shipped in `globals.css @layer components`); Tier 2 → HeroUI defaults survive for `.chip` / `.avatar` / `.switch` / `.skeleton`; Tier 3 → explicit `9999px` on cart-count badge, stock dots, mobile language toggle pill. See DESIGN.md "Border radius — three-tier hybrid spec" for canonical wording.

### Risks (M1)

- **Existing OKLch tokens in `globals.css` are consumed by every shadcn primitive in `frontend/components/ui/**`.** Swapping in hex will visually shift the admin dashboard. The aliasing approach (canonical `--accent` + `--color-primary: var(--accent)` alias) keeps both surfaces in sync but means admin gets the new blueprint blue. If admin needs to stay on its current sky-blue, scope aliases to `[data-surface="storefront"]` / default. **Recommended:** unified palette — admin shifts to the v-fixer palette in this migration. Document it.
- **HeroUI radius hardcoding.** Setting `layout.radius` won't reach primitives that hardcode `rounded-full` or `rounded-large` in their slot recipes (Chip, Avatar, Switch thumb, Skeleton). Without the M1 audit + per-slot override deliverable, M2 will discover this piecemeal across 13 primitives.
- **Fraunces variable font is ~120 KB**. Use `next/font` subsets + `display: 'swap'`. Track first-load bundle in Lighthouse during M4.

---

## Milestone 2 — Primitives

Build the small, reusable components every page composes from. Each primitive maps to a section in DESIGN.md and exists in the reference HTML on disk.

**Effort: 5–6 days** (revised up after /autoplan: +1.5–2 days for Product type consolidation moved from M3d, +0.5 day for `CrossFadeStack` primitive extraction, +0.5 day for RTL smoke test at M2 exit).

### Step 0 — Type foundations (M2 prerequisite, NEW from /autoplan)

Before any primitive is built, consolidate the `Product` type. Every M2 primitive that follows (`ProductCard`, `PriceBlock`, `RuledRow`) takes a `Product` prop — building those against `any` then retyping later means rewriting prop signatures twice.

| File | Action |
|---|---|
| `frontend/lib/api.ts` | Make this the **canonical `Product` type**. Match the backend serializer shape (camelCase, slug-keyed, includes `id`, `slug`, `name`, `ref`, `categorySlug`, `category` (object), `price` (string from DRF), `costPrice` (nullable), `discountPrice` (nullable), `stock` (number), `images` (string array of media URLs), `shortDescription`, `description`, `specs` (JSON), `createdAt`). Drop `rating` per DESIGN.md decision (or make optional). |
| `frontend/data/products.ts` | Delete the duplicate `Product` interface. Re-export from `lib/api.ts` if anything still imports from `data/products`. Mock products array stays (used in dev fallback paths). |
| `frontend/lib/product-guard.ts` (new) | `assertProduct(data: unknown): Product` runtime guard at the API client boundary. Throws on schema drift (helpful in dev, swallowed-and-logged in prod). Zod is optional — a hand-written guard is fine for this shape. |
| `frontend/context/cart-context.tsx` | Re-import `Product` from the canonical source. Update reducer cases to type-check against the new shape. |
| All consumers (`product-card.tsx`, `product-details.tsx`, `product-grid.tsx`, `header.tsx`, `checkout/page.tsx`, `cart-context.tsx`) | TypeScript strictness sweep. Replace any `as Product` casts with the runtime guard at the fetch boundary. Six files; ~30–45 min each. |

**Effort:** 1.5–2 days. Do this BEFORE step 1 below.

### Components (in build order)

| Component | File | Build from | Notes |
|---|---|---|---|
| `TopBar` | `frontend/components/layout/top-bar.tsx` | Wrap HeroUI `Navbar` | Desktop: wordmark, search, FR·AR pill, cart pill, theme pill. Mobile (≤720px): 2-row layout (wordmark + icons on row 1, full-width search on row 2), 44px touch targets, cart pill becomes shopping-bag icon + accent badge, theme pill hidden. Reference: `storefront-homepage-20260516/finalized.html` top bar. |
| `PromiseStrip` | `frontend/components/layout/promise-strip.tsx` | Custom (no HeroUI base) | Casablanca / Livraison 48h / Paiement à la livraison / Garantie 12 mois. Mono, hairline-bordered. Bullet separator with accent dot. |
| `WordmarkLink` | `frontend/components/ui/wordmark.tsx` | Custom | Fraunces with a final `.` accent. Used in TopBar and Footer. |
| `StockDot` | `frontend/components/ui/stock-dot.tsx` | Custom (4 lines) | Variants: `in`, `low`, `out`. `in` uses `--accent`, not `--in-stock` (DESIGN.md §Color usage rules). |
| `MicroBadge` | `frontend/components/ui/micro-badge.tsx` | Custom | Outline-style mono pill (NOUVEAU / RUPTURE / SET). 9999px radius — the one place pills are allowed. Refused: sale ribbons, NEW! flames, scarcity timers. |
| `PriceBlock` | `frontend/components/ui/price-block.tsx` | Custom | Mono in accent + optional `priceWas` strikethrough. Tabular figures by default. Reusable across PDP, cart, ProductCard, RuledRow. |
| `BilingualPrice` | `frontend/components/ui/bilingual-price.tsx` | Custom | Reads `useLocale()` from `next-intl`. Renders Latin numeral + Arabic-Indic numeral stack. Uses Intl.NumberFormat with `ar-MA-u-nu-arab` numbering system. Used on PDP price block and cart total. R3 risk lives here. |
| `RuledRow` | `frontend/components/ui/ruled-row.tsx` | Custom | Grid template `64px 1fr auto` desktop, collapses on mobile. Image well + info + qty+price. Used in cart line items, admin product/order tables (post-migration), checkout review. |
| `CrossFadeStack` | `frontend/components/ui/cross-fade-stack.tsx` (new, **added from /autoplan**) | Custom | Stacked absolute-positioned children with opacity transitions. Active child gets `pointer-events: auto`, others get `pointer-events: none`. Container has explicit `aspect-ratio` to prevent FOUC; `--photo-bg` as placeholder color. Used by both `HeroSpread` and the PDP `ImageGallery` — single implementation of FOUC handling and `--dur-gallery` cross-fade. Build before either consumer. |
| `ProductCard` | `frontend/components/product/product-card.tsx` (rewrite existing) | Wrap HeroUI `Card` with custom slots | 1:1 photo well in white, hairline border, mono price right-aligned, stock dot, optional MicroBadge. The existing file at this path is the shadcn version — rewrite, don't add alongside. Apply pre-written `classNames` overrides from M1's radius audit if `Card` slot hardcodes a radius. |
| `CategoryTile` | `frontend/components/home/category-tile.tsx` | Custom | Fraunces name + mono count meta. Hairline-grid container (no shadows, no rounded). |
| `HeroSpread` | `frontend/components/home/hero-spread.tsx` | Custom (no HeroUI carousel; consumes `CrossFadeStack`) | Large slide + 2 stacked side cards. Dot nav + arrows, no auto-rotate, max 3 slides. Cross-fade delegated to `CrossFadeStack` (built earlier in this step). DESIGN.md hero spec is the contract. Refused: `embla-carousel-react`, `vaul`, or any auto-rotating library. |
| `CartPulse` | `frontend/components/ui/cart-pulse.ts` (new, **added from /autoplan**) | Custom (Web Animations API, not CSS class-toggle) | Imperative helper: `pulse(badgeEl, { scale: [1, 1.18, 1], color: ['inherit', 'var(--accent)', 'inherit'], duration: 180, easing: 'cubic-bezier(.2,0,0,1)' })` using `el.animate()`. Returns the `Animation` handle for `.cancel()`/`.play()`. Solves React 19 strict-mode double-invocation issues with class-toggle keyframe restart. Tokens read from CSS via `getComputedStyle().getPropertyValue(...)` once at module load. |
| `Pagination` | `frontend/components/ui/pagination.tsx` (rewrite existing) | Wrap HeroUI `Pagination` | Override token mapping so active page uses `--accent` background. Reference: `category-pannes-20260518/finalized.html` pagination. |
| `FilterSidebar` | `frontend/components/product/filter-sidebar.tsx` | Compose HeroUI `Checkbox` + `Switch` + `Input` | Sticky on desktop, collapsible Drawer on mobile (use HeroUI `Drawer`). Active-filter pills sit above the grid, removable on click. |

### Dependencies

- Each primitive consumes the M1 token system. None of M2 should run until M1 has shipped or is at least on a branch that M2 rebases onto.
- `BilingualPrice` depends on `next-intl`'s `useLocale` being configured in `frontend/app/[locale]/layout.tsx` (already wired).
- `HeroSpread` Pretext usage requires the M1 `usePretextHeights` hook.

### Sequence

Sequenced so each primitive is buildable when its turn comes (no unbuilt dependency):

0. **Type foundations (Step 0)** — Product type consolidation + runtime guard. M2 prerequisite.
1. Leaf primitives, no internal dependencies: `StockDot`, `MicroBadge`, `WordmarkLink`, `PromiseStrip`.
2. Composed primitives that use the leaves: `PriceBlock`, `BilingualPrice`, `RuledRow`, `CategoryTile`, `CrossFadeStack`, `CartPulse`.
3. The two card-shaped surfaces: `ProductCard` (uses PriceBlock, StockDot, MicroBadge), `HeroSpread` (uses PriceBlock, CrossFadeStack), `FilterSidebar` (promoted from step 4 because M3a is now PDP and the next page that needs it is M3b Category — built early enough).
4. Page-level chrome: `TopBar`, `Pagination`.

### M2 exit gate — RTL smoke test (added from /autoplan)

Before any M3 page work starts, run a `/browse` smoke test in RTL mode (`viewport 375x812`, `Accept-Language: ar-MA`) against the theme-probe page from M1 plus the primitives built in M2. Audit `node_modules/@heroui/theme/dist/` for physical-property leaks in the primitives we use (`Input`, `Drawer`, `Navbar`, `Select`) and write `[dir="rtl"]` overrides in `globals.css` for any selectors that leak. Catching this here is 3× cheaper than discovering it after three M3 pages already shipped.

### Risks (M2)

- **Existing `frontend/components/product/product-card.tsx` is consumed by `product-grid.tsx`, `home/best-selling-section.tsx`, `home/category-showcase-slider.tsx`, and several admin views.** Rewriting it in place breaks the homepage during the migration. Mitigation: keep the existing file as `product-card-legacy.tsx`, ship the new file at the original path, swap consumers page-by-page in M3.
- **`hero-section.tsx`, `category-showcase-slider.tsx`, `best-selling-section.tsx` exist on `main`** and would be replaced by `HeroSpread`, the category index in M3, and a "Récemment ajoutés" card row respectively. Don't delete them until M3 lands the replacement for the same page (Homepage is now M3d — these files stay alive until then).
- **`HeroSpread` and PDP gallery were duplicating cross-fade logic in the original plan.** Resolved: `CrossFadeStack` extracted in step 2. Both consume the same primitive.

---

## Milestone 3 — Pages

Ship the four storefront surfaces, in **PDP → Category → Cart → Homepage** order (revised after /autoplan — both subagents independently rejected homepage-first). Each page is a separate PR.

**Effort: 5–7 days.**

### Order: PDP → Category browse → Cart → Homepage

**Rationale for re-ordering** (per /autoplan review):
- **PDP first** validates conversion-critical primitives (`PriceBlock`, `BilingualPrice`, image gallery via `CrossFadeStack`, qty stepper, filled CTA) in isolation on the smallest single-product surface.
- **Category second** stresses `ProductCard` at scale (20+ instances), `FilterSidebar` interactivity, pagination, Pretext-grouped title heights, and RTL grid mirroring — design-system bugs surface here while primitives can still be cheaply revised.
- **Cart third** validates the ruled-rows ledger pattern and the sticky summary panel; depends on `BilingualPrice` maturity proven in PDP.
- **Homepage last** is the integration showcase. `HeroSpread` (single-use, highest novelty, lowest reuse) ships against fully-battle-tested primitives. Loses the "demo first" advantage, but engineering risk wins over demo optics — both subagents agreed.

#### 3a. PDP

**File:** `frontend/app/[locale]/p/[slug]/page.tsx` (new).

**Reference:** `~/.gstack/projects/smoxhakim-v-fixer/designs/pdp-aifen-a902-20260516/finalized.html`.

**Sections:** `TopBar` → `PromiseStrip` → breadcrumb → 2-col main: gallery (4-thumb strip, cross-fade between main images via `CrossFadeStack`) + info column (eyebrow → Fraunces title → REF · category meta → `PriceBlock` with `BilingualPrice` → stock row → qty stepper + filled "Ajouter au panier" HeroUI `Button` → secondary text links → delivery note) → specs table (`RuledRow`-shaped) + compatibility `MicroBadge` row → long description (Geist) + bilingual FR/AR block → "Souvent commandés avec" related-products grid using `ProductCard`.

**Server / client split:**
- Page is a **server component**. `getProductBySlug(slug)`, `getRelatedProducts(productId, limit: 4)`.
- Gallery state is client (`useState` for active thumb index, cross-fade delegated to `CrossFadeStack`).
- Qty stepper + add-to-cart is client (writes to `useCart()` context, fires `CartPulse` on the badge).

**Data wiring:**
- `GET /api/products/<slug>/` (exists). Backend `Product` model has `images` (JSON array), `specs` (JSON), `description`, `short_description`. PDP reads `images` for the gallery, `specs` for the specs table.
- **No reviews displayed** until the review system decision (see Launch blocker #2). Strip the `rating` field from any serializer changes for now.

**Pretext usage:** page title, section titles ("Tout ce qu'il faut savoir.", "Pour les ateliers...", "Souvent commandés avec."), related-card titles (group: `related-title`).

**Why first:** smallest surface where every conversion-critical primitive (`PriceBlock`, `BilingualPrice`, `CrossFadeStack` gallery, qty stepper, filled CTA `Button`) gets validated in isolation. Catches design-system bugs at the lowest scope. PDPs at real URLs unblock deep-links from Category cards (M3b) and Cart rows (M3c).

**Effort:** 2 days. Gallery cross-fade + bilingual price + specs table are the three pattern-density points.

#### 3b. Category browse

**File:** `frontend/app/[locale]/c/[slug]/page.tsx` (new).

**Reference:** `~/.gstack/projects/smoxhakim-v-fixer/designs/category-pannes-20260518/finalized.html`.

**Sections:** `TopBar` → `PromiseStrip` → breadcrumb → page header (Fraunces title + mono meta) → 2-col layout: `FilterSidebar` (left) + grid area (right, with toolbar containing result count + sort `Select` + view toggle + mobile filter trigger) → `ProductCard` grid (20 per page) → `Pagination` → footer.

**Server / client split:**
- Page is a **server component**. Reads URL query params (`?marque=Magma&serie=C115&page=2&sort=price_asc`) and passes them to `getProducts(categorySlug, filters)`.
- `FilterSidebar` is a **client component** — manages local checkbox state, syncs to URL via `useRouter().push(?marque=...)` on apply. Don't filter client-side; the backend is the source of truth.
- `Pagination` is a server-rendered link list (no client needed); `Sort` is a `<form>` with method GET that round-trips through the server.

**Data wiring:**
- `GET /api/products/?category=pannes&brand=Magma&series=C115&page=2&page_size=20&ordering=price` — **most of these query params don't exist on the backend yet.** Coordinate with backend to add: `?brand=`, `?series=` (or a generic `?attrs[]=brand:Magma`), `?in_stock=true`. Without these, the page is hard-coded against mock data and can't ship.
- `GET /api/categories/<slug>/facets/` — new endpoint returning facet counts (`{ brand: { Magma: 68, JBC: 24, ... }, series: {...} }`). Required for the filter sidebar counts to be live; otherwise hard-code (see Launch blocker #3).
- Product cards link to `/p/<slug>` — the PDPs built in M3a are now live.

**Pretext usage:** page title, `ProductCard` titles grouped (`data-pretext-group="card-title"`).

**Why second:** stresses `ProductCard` at scale (20+ instances), `FilterSidebar` interactivity, `Pagination`, Pretext-grouped uniform title heights, sort dropdown, RTL grid mirroring. Design-system bugs that scale-related instability would surface here; cheaper to fix while only PDP has shipped (one page to revise) than after Homepage.

**Effort:** 1.5 days (frontend); backend filter param work is separate.

#### 3c. Cart

**File:** `frontend/app/[locale]/cart/page.tsx` (rewrite if exists, else new).

**Reference:** `~/.gstack/projects/smoxhakim-v-fixer/designs/cart-20260518/finalized.html`.

**Sections:** `TopBar` → `PromiseStrip` → page head ("Vérifiez avant de payer.") → 2-col: cart items left (`RuledRow` per line with qty stepper + remove link + line `PriceBlock`) + sticky summary right (Fraunces "Votre commande.", subtotal/livraison/TVA lines, bold total with `BilingualPrice`, 3 payment-mode radio cards, promo input, filled "Valider la commande" `Button`, confirm note) → trust strip → footer.

**Server / client split:**
- Page is a **client component** root (`"use client"`) because the cart state lives in `useCart()` and every line item edit re-renders the summary.
- Cart state is already in `frontend/context/cart-context.tsx` (reducer-based, localStorage-backed). Reuse it directly. **`Product` typing already resolved in M2 step 0** — cart rows have type safety from day one of this milestone.
- Summary recalculation is pure JS (no server roundtrip until order submission).
- Cart line items link back to `/p/<slug>` (PDPs built in M3a).

**Data wiring:**
- Cart state is client-only until submission. On "Valider la commande" → `POST /api/orders/` with `{ items: [...], customer: {...}, payment: 'cod'|'card'|'bank' }`. Backend has `Order` model already.
- **TVA calculation:** backend prices are TTC by Moroccan B2B convention. Extract VAT for display only (`vat = subtotal - subtotal / 1.20`). Reference HTML does this in JS; port verbatim to React.
- **Shipping logic:** free over 200 MAD, else 40 MAD. **Hard-coded for now** in `frontend/lib/cart-totals.ts`; should move to a `/api/shipping/quote` endpoint pre-launch (out of scope for this plan but flag for backend).

**Pretext usage:** page title, summary title.

**Why third:** validates the ledger-row pattern at full integration (qty steppers, remove flows, summary recalc, bilingual total). Depends on `BilingualPrice` maturity proven in M3a PDP. Smaller scope than Homepage but exercises ruled-rows (the only place they live in the storefront).

**Effort:** 1.5 days.

#### 3d. Homepage

**File:** `frontend/app/[locale]/page.tsx` (rewrite existing).

**Reference:** `~/.gstack/projects/smoxhakim-v-fixer/designs/storefront-homepage-20260516/finalized.html`.

**Sections, top to bottom:** `TopBar` → `PromiseStrip` → `HeroSpread` → "Récemment ajoutés" `ProductCard` grid (8 cards, 4-up desktop) → category index using `CategoryTile` (8 tiles, 4×2) → "De nouveau disponibles" `RuledRow` block (4 rows) → trust strip (3 cells, custom presentational div — reuses `PromiseStrip` styling).

**Server / client split:**
- Page is a **server component**. Data fetches: `getRecentProducts(limit: 8)`, `getCategories({withCount: true})`, `getBackInStock(limit: 4)` — all called server-side via `frontend/lib/api.ts` extended with these helpers.
- `TopBar`, `HeroSpread`, `TopBar`'s cart pill (reads `useCart()`) are **client components** (`"use client"` at the top). Everything else stays server.
- The existing locale routing (`[locale]/page.tsx` + `next-intl`) keeps working; the homepage rewrites in place.
- All product cards link to live PDPs (M3a); all category tiles link to live category pages (M3b).

**Data wiring:**
- `GET /api/products/?ordering=-created_at&limit=8` for Récemment ajoutés. Backend currently does not paginate this route — confirm or add `?limit` param in `backend/catalog/views.py`.
- `GET /api/categories/?with_product_count=true` for the index. Backend currently returns categories without `productCount` — add an annotation to the serializer.
- `GET /api/products/?status=back_in_stock&limit=4` for the Back-in-stock row. **Requires backend work**: add a `back_in_stock_at` timestamp on Product, set when stock transitions 0 → N, sort by it. Out of scope for M1–M2 frontend, flagged here for backend collaboration.

**Pretext usage:** section titles (`data-pretext`), product card titles (`data-pretext-group="card-title-recent"`), category tile names (`data-pretext-group="cat-name"`), slide headlines (`data-pretext-group="slide-headline"`).

**Why last:** integration showcase. `HeroSpread` is the highest-novelty / lowest-reuse primitive in M2; deferring its real exercise to here means it ships against fully-validated `PriceBlock`/`ProductCard`/`CategoryTile`/`RuledRow`. The "biggest visual proof" demo argument is real but loses to engineering-risk sequencing — both /autoplan subagents flagged homepage-first as the wrong call.

**Effort:** 1 day.

### Sequence

1. **PDP first (M3a)** — smallest surface validates conversion primitives in isolation. Real PDP URLs unblock deep-links elsewhere.
2. **Category browse (M3b)** — stresses `ProductCard` at scale, exercises `FilterSidebar`, `Pagination`, sort. Catches design-system bugs while only one prior page is in flight.
3. **Cart (M3c)** — ruled-rows + bilingual total + summary recalc. Depends on M2 + the BilingualPrice maturity from M3a.
4. **Homepage (M3d)** — integration showcase with `HeroSpread`. Ships last against battle-tested primitives.

### Risks (M3)

- **`next-intl` locale routing requires every page to live under `[locale]/`.** The four new pages (`p/[slug]/page.tsx`, `c/[slug]/page.tsx`, `cart/page.tsx`, `page.tsx`) all sit inside `frontend/app/[locale]/`. Confirm that `frontend/middleware.ts.bak` (currently disabled) doesn't need re-enabling to handle locale negotiation. If yes, that's a half-day of middleware work — do it during M1 or as M3a's first task.
- **Backend filter API gaps** for category browse are real and may delay M3b until backend ships them. Frontend can prototype against mock data, but launch blocks on the live endpoints (see Launch blocker LB3).
- **Backend storefront helpers in `frontend/lib/api.ts` don't exist yet.** Plan references `getRecentProducts`, `getCategories({withCount})`, `getBackInStock`, `getProductBySlug`, `getRelatedProducts`, `getProducts(categorySlug, filters)` — the current file is admin-focused. Add half-day of API client extension work to M3a (or extract it as a pre-M3 task).
- ~~Cart context Product typing~~ — resolved in M2 step 0 (Type foundations).

---

## Milestone 4 — QA + Ship

Per-page validation and ship. Done one page at a time, immediately after that page lands in M3.

**Effort: 2.5–3 days.**

### Per-page checklist

For each of the four pages:

1. **Functional QA via `/qa`** — Playwright tests covering the happy path (browse → cart → checkout → confirmation), edge cases (empty cart, out-of-stock product, invalid promo code), and the design-system patterns (Pretext recomputes on resize, cross-fade on gallery click, qty stepper math, bilingual numeral renders correctly in both locales).
2. **Accessibility audit via `/design-review` + manual:** screen reader landmarks, focus-visible rings, `prefers-reduced-motion` collapse to 0ms, RTL flow with FR/AR locale switch, keyboard nav for gallery + filter sidebar + cart steppers, 44px touch targets on mobile.
3. **Lighthouse on mobile:** target ≥90 performance, ≥95 a11y, ≥95 best practices, ≥95 SEO. Track first-load JS bundle (HeroUI + Pretext + framer-motion + next/font).
4. **Visual regression via `/design-review`:** screenshots at 375 / 768 / 1440 in both light and dark mode, both locales, compared against the reference HTML.
5. **`/ship` once green** — one PR per page, sequential merges.

### Tooling

- `/qa` runs `gstack`'s headless browser. Tests live in `frontend/tests/playwright/` (new directory).
- `/design-review` runs visual diffs.
- Lighthouse via `npm run build && npx lighthouse` or the gstack `/benchmark` skill.

### Sequence

Page-by-page, never batched. The goal is to catch design-system drift early — a primitive that survives M2's tests but fails on the homepage gets fixed before it propagates to three more pages.

### Risks (M4)

- **Visual regression baseline doesn't exist yet** (the reference HTML is in `~/.gstack/...`, not in the repo). Capture screenshots from the reference HTML at the start of M4 and commit them to `frontend/tests/visual-baselines/` so diffs are reproducible.
- **HeroUI version drift during the migration.** Pin `@heroui/react` in `package.json` (currently `^3.0.4` — change to `~3.0.4` or exact `3.0.4` for the duration of the migration to avoid surprise breaking changes from minor bumps).

---

## Risk register — three highest-stakes integration points

### Risk 1: HeroUI default theme tokens vs DESIGN.md tokens

**The problem:** HeroUI v3 ships with its own opinionated theme — primary, secondary, success, warning, danger, plus 50/100/200/.../900 shades per color. DESIGN.md has different semantic tokens (`--bg`, `--surface`, `--ink`, `--muted`, `--rule`, `--accent`, `--in-stock`, `--low-stock`, `--out-stock`). Token names don't align. Radii don't align (HeroUI default radius is `large: 12px`, DESIGN.md is `2px`). Spacing scale doesn't align (HeroUI uses Tailwind defaults; DESIGN.md is 4px base).

**Why it's high-stakes:** every HeroUI primitive consumed without an override will visually contradict the design system. A single `<Button>` rendered with HeroUI defaults shows a 12px rounded button, defeating the entire visual refusal list.

**Mitigation — re-corrected after M1 spike 2026-05-20:**

1. **HeroUI v3 has NO `HeroUIProvider`, NO `theme` prop, AND NO Tailwind plugin.** Confirmed by spike: the installed `@heroui/react@^3.0.4` exports only `I18nProvider` + `RouterProvider` (React Aria primitives); the `@heroui/styles` package contains zero JS exports for theming (only CSS files). The autoplan correction that proposed a `heroui({ themes })` Tailwind plugin call was also wrong — that mechanism exists in v2, not v3. **Actual mechanism: pure CSS cascade.** Import the package root, then override CSS variables in `globals.css`:

   ```css
   /* frontend/app/globals.css */

   /* Package root chains: @layer theme,base,components,utilities; →
      tailwindcss → tw-animate-css → base → components → default theme
      → utilities → variants. This must come BEFORE our overrides. */
   @import '@heroui/styles';

   /* DESIGN.md canonical tokens — single source */
   :root, .light, [data-theme="light"] {
     --vfx-bg:      #F5F1E8;
     --vfx-surface: #FBF8F1;
     --vfx-ink:     #1C1A17;
     --vfx-accent:  #1E5A8A;
     /* ... etc */

     /* HeroUI v3 variable names — alias to canonical */
     --background:   var(--vfx-bg);
     --foreground:   var(--vfx-ink);
     --surface:      var(--vfx-surface);
     --accent:       var(--vfx-accent);
     --accent-foreground: #FFFFFF;
     --success:      var(--vfx-in-stock);
     --warning:      var(--vfx-low-stock);
     --danger:       var(--vfx-out-stock);
     --border:       var(--vfx-rule);
     /* ... etc */

     /* Shadcn names also alias to canonical — admin keeps rendering */
     --primary: var(--vfx-accent);
     --card:    var(--vfx-surface);
     /* ... etc */
   }

   .dark, [data-theme="dark"] {
     /* DESIGN.md dark canonical, same alias structure */
     /* ... */
   }
   ```

   Cascade order: HeroUI's package-root sets defaults under `:root`; our `:root` block (declared later in the same file) wins. CSS-only — no build-time plugin to keep in sync.

2. **Radii do NOT flow through token override.** Spike confirmed: HeroUI's `button.css` uses literal `@apply rounded-3xl` (30px), `chip.css` uses `rounded-[20px]`. There is no `var(--radius)` reference in the button/chip CSS. To get DESIGN.md's 2px on buttons, options are: (a) a global override rule `.button { border-radius: 2px; }` in `globals.css` after the HeroUI import, or (b) per-instance `<Button classNames={{ base: 'rounded-[2px]' }}>`. **Per-primitive strategic decision pending user call.** Document in `frontend/components/ui/heroui-overrides.css` once decided.

3. **Block adding new HeroUI primitives without a theme audit** — codify in CLAUDE.md so future Claude doesn't sneak a default-themed `<Card>` in.

4. **M1 exit gate enforces this:** the `/dev/theme-probe` page at `frontend/app/[locale]/dev/theme-probe/page.tsx` (note: must live under `[locale]/` due to `proxy.ts` locale-prefix routing) renders every primitive in both themes. M1 doesn't merge until zero default-token leakage and the radius strategy is committed.

**Decision verified before M1 starts:** plugin config shape confirmed against `node_modules/@heroui/theme/dist/plugin.js` during the 30-minute pre-M1 spike.

### Risk 2: RTL with Tailwind v4

**The problem:** Tailwind v4 supports logical properties (`ms-*`, `me-*`, `ps-*`, `pe-*`) but most of the reference HTML uses physical properties (`ml-*`, `mr-*`, etc.). The cart page in particular has tabular-aligned right-side prices that must mirror to the left in RTL. Icons (search, breadcrumb separators, the "Acheter →" arrow, qty stepper +/−, pagination arrows) all have an implicit direction.

**Why it's high-stakes:** RTL bugs are visually loud. An Arabic shopper sees a broken page; the trust signal collapses immediately.

**Mitigation — expanded after /autoplan:**

1. **Convert our directional utilities to logical** during M2. Linter rule (custom `frontend/.tailwind-rtl.js` or just code review). Port `padding-left`/`padding-right` → `padding-inline-start`/`padding-inline-end` in CSS, and `pl-*`/`pr-*` → `ps-*`/`pe-*` in Tailwind.

2. **HeroUI's compiled CSS leaks physical properties.** `node_modules/@heroui/theme/dist/` emits `padding-left`, `margin-right`, etc. in internal selectors for `Input`, `Navbar`, `Drawer`, `Select`. Tailwind logical-property utilities have the same specificity and **lose by source order**. Expected RTL bugs: `Input` icon insets, `Drawer` close-button placement, `Select` chevron position.
   - **Fix:** during M2 as primitives land, audit `node_modules/@heroui/theme/dist/` for physical-property selectors in the primitives we consume; write `[dir="rtl"]` overrides in `globals.css` using `:where()` for low specificity. Expect 6–10 selectors.

3. **Set `dir` attribute on `<html>` server-side** in `frontend/app/[locale]/layout.tsx`. Already partially wired in `frontend/app/layout.tsx`; consolidate to the locale layout. The body picks up the right font via `dir="rtl"` selector in `globals.css`: `[dir="rtl"] body { font-family: var(--font-arabic); }`.

4. **Mirror directional icons via a single declarative attribute rule**, set up in M1:
   ```css
   [dir="rtl"] [data-rtl-flip] { transform: scaleX(-1); }
   ```
   Mark directional icons with `data-rtl-flip` attribute. No className gymnastics. One CSS rule, declarative HTML. Apply to: arrow CTAs (yes), breadcrumb chevron (yes), pagination prev/next (yes), gallery prev/next (yes), HeroSpread arrows (yes). Do NOT apply to: search/magnifying glass icon (rotationally symmetric), qty stepper +/− (math symbols), cart icon (rotationally neutral).

5. **RTL smoke test at end of M2, not just M4.** `/browse` with `viewport 375x812` and `Accept-Language: ar-MA` against the theme-probe page + each built primitive. Catching a HeroUI primitive's RTL leak after three M3 pages used it is 3× the rework.

**Decision needed:** does the team want to enforce logical-property linting in CI? Recommended yes, lightweight rule.

### Risk 3: framer-motion vs native CSS transitions

**The problem:** `framer-motion@^12.38.0` is already a dependency. DESIGN.md motion section prefers CSS where possible, citing "minimum JS overhead" and "respect `prefers-reduced-motion` natively." The three motion patterns in the migration are:

- **Cart-count pulse** when item added: scale 1 → 1.18 → 1 over 180ms.
- **Gallery cross-fade** between PDP images: opacity 0 → 1 over 320ms.
- **Theme transition** between light and dark: background-color + color over 240ms.
- **Card hover:** background tint shift over 150ms.

**Why it's a real decision (not just style):** framer-motion (tree-shaken `motion/react` import is ~6–8 KB for a simple `motion.div`, not the 30 KB previously claimed) adds runtime cost and a context dependency. For four motion patterns expressible in pure CSS or the Web Animations API, it's overhead the storefront doesn't need.

**Recommendation — refined after /autoplan:** **Use CSS + Web Animations API for all four, no framer-motion in storefront chunks.**

- **Cart pulse → Web Animations API, not CSS class-toggle.** Toggling a class to restart a `@keyframes` does NOT reliably re-trigger the animation under React 19 strict-mode without `animation: none → rAF → re-add`. Use `el.animate(keyframes, opts)` instead — returns an `Animation` handle with `.cancel()` / `.play()`, lifecycle is explicit per trigger, no class-restart gymnastics. Implemented in M2 as `CartPulse` utility.
- **Gallery cross-fade → `opacity` transition with `position: absolute` slide stacking, via `CrossFadeStack` primitive.** The container has explicit `aspect-ratio: 1`, `--photo-bg` as the placeholder background, and `next/image fill + sizes`. Without these, FOUC risk is real — the wrapper collapses on first paint before images load. `CrossFadeStack` (M2) bakes the right defaults in once.
- **Theme transition →** `transition: background-color var(--dur-page) var(--ease-out)` on `body`. Pure CSS.
- **Card hover →** standard `:hover { background: var(--surface-2) }`. Pure CSS.

**Push back if you disagree:** framer-motion makes sense when (a) the animation is hard to express in CSS or WAA (FLIP, complex layout animations, drag), (b) shared between many components, (c) needs JS-driven interpolation across many keyframes. None of the four patterns here qualify. Keep `framer-motion` in the dependency list since admin pages may use it; **storefront chunks must not import it** — verify via `next build` bundle analyzer at the end of M4.

**Note on `prefers-reduced-motion`:** the earlier claim that "CSS makes reduced-motion free" is overstated. One CSS media query vs one `useReducedMotion()` hook is a wash; the real reasons to prefer CSS+WAA here are bundle size on storefront routes and "user-initiated only" semantics.

**Decision needed before M3 starts:** confirm "CSS+WAA in storefront, framer-motion stays in dependency list for admin" as the migration's motion policy.

---

## Launch blockers (out of scope for this migration plan)

These three open content tasks block public launch but are not design-system work. They live with backend + content + ops, not with the HeroUI migration. Flag in the launch checklist; do not include in milestones.

### LB1: Re-shoot watermarked product photos

**Why it blocks:** Several photos in `backend/media/imports/.../` carry visible Chinese supplier watermarks ("WA/Wechat: +86 …"). The design system handles them gracefully (white wells, hairline border), but launch with watermarks visible is immediately recognizable as drop-shipped + undercuts the anchor.

**Owner:** ops / photography commissioning. Either re-shoot or strip watermarks (Photoshop or `imagemagick` automation if patterns are consistent).

**Effort:** depends on catalog size. ~2 days for ~100 SKUs if re-shot in-house; ~half day if scripted watermark removal works on most images.

### LB2: Decide on real review system vs permanent removal

**Why it blocks:** the PDP currently has no rating display because we stripped it (DESIGN.md decision: no fake numbers). The `Product` model in `backend/catalog/models.py` still has a `rating` field that the API exposes. Either build a review-collection system (orders → review prompts → moderated reviews → API → PDP) or remove the field permanently.

**Recommended:** ship without reviews for the first 90 days post-launch, gather customer-support feedback ("do shoppers ask for reviews?"), then decide. The fake-review problem in MENA e-commerce is severe; "no reviews" is honest.

**Effort:** decision is free; building a review system is ~10 days separate work.

### LB3: Populate real product data for category filter facets

**Why it blocks:** the category browse page hard-codes facet labels and counts (Magma 68, JBC 24, …). The backend `Product` model has no `brand` or `series` columns. Filter sidebar needs:

- A new `brand` field on `Product` (charfield, indexed).
- A new `series` field on `Product` (charfield, indexed; values like `C115`, `C210`, `C245`).
- A new `/api/categories/<slug>/facets/` endpoint returning aggregated counts per filter value.
- A bulk-update script that backfills `brand` and `series` from existing product names (regex on `MAGMA-C115-K` → brand=Magma, series=C115).

**Owner:** backend + data ops.

**Effort:** ~3 days backend work + ~half day data backfill.

---

## Effort summary

| Milestone | Effort | Calendar (solo) |
|---|---|---|
| M1 — Foundations (CSS-cascade theming + theme-probe exit gate + radius audit) | 1.5–2 days | 2 days |
| M2 — Primitives (now includes Type foundations step 0, `CrossFadeStack`, `CartPulse`, RTL smoke test) | 5–6 days | 6 days |
| M3 — Pages (PDP → Category → Cart → Homepage) | 5–7 days | 7 days |
| M4 — QA + Ship | 2.5–3 days | 3 days |
| **Total** | **14–18 days** | **~3.5–4 weeks** |

M1 shortened by ~0.5 day after the spike: the actual HeroUI v3 mechanism is two lines of CSS (`@import '@heroui/styles'` + token block) rather than a build-time Tailwind plugin config with light/dark theme objects. No `tailwind.config.ts` to author, no `heroui()` call to keep in sync, no inline hex values to mirror between runtime CSS and build-time config. Theme-probe exit gate, radius audit, and per-slot classNames work all still required — but the wiring step itself is genuinely simpler than the autoplan-corrected plan claimed. **Confirmed.**

(The /autoplan review pushed total effort up by ~2.5 days for risk-reduction work — Type foundations + theme-probe + radius audit + RTL smoke test. The spike then trimmed 0.5 day off M1. Net: +2 days over the pre-autoplan baseline. Those days still buy real risk reduction.)

The migration is dominated by M3 (page composition + data wiring). M1 and M2 are unblocking work — the primitive library is the leverage that makes M3 tractable. M4 is sequential and per-page, so it overlaps with M3 in practice: page A's M4 runs while page B's M3 starts.

**Critical-path dependencies on backend** (not solo-dev controllable):

- Category facets endpoint (LB3 partial) — blocks M3b live data
- Filter query params (`brand`, `series`, `in_stock`) on `/api/products/` — blocks M3b live data
- `back_in_stock_at` timestamp + sort — blocks the homepage "De nouveau disponibles" row

If backend can't deliver these in parallel, M3b ships against mock data and the live wiring lands as a follow-up ticket.

---

## Suggested first action

Run `/autoplan` on this document to get the CEO / eng / design / DX review pass before kicking off M1. The plan above is one builder's read; `/autoplan` will surface the close decisions worth a second opinion (e.g., the framer-motion vs CSS-first call, the HeroUI theme override approach, whether the homepage really should ship first).

---

## /autoplan review — 2026-05-19

**Mode:** focused review of four user-specified areas (HeroUI theming, motion library, M3 page sequence, M2 primitive build order).
**Voices:** Claude main + two independent Claude subagents (eng-architecture perspective + frontend-practitioner perspective).
**Degradation:** Codex CLI unavailable on this machine (`codex not found`). Per `/autoplan`'s documented degradation path, dual voices ran as single-model + independent subagents. Tagged `[single-model]` where applicable. Three voices is still meaningful independent signal — but flag that one of the configured cross-checks didn't fire.

### Cross-voice consensus table

| Dimension | Claude main | Subagent-eng | Subagent-FE | Verdict |
|---|---|---|---|---|
| 1. HeroUI provider `theme` prop is correct API for v3.0.4 | NO | NO | NO | **CONFIRMED WRONG** — verified against installed `@heroui/react@^3.0.4`. The repo's existing provider literally has a code comment: "No HeroUIProvider exists in v3." Plan's M1.3 snippet ships dead code. |
| 2. CSS-first for cart-pulse + gallery cross-fade is the right call | YES | YES (with refinements) | (didn't focus) | **CONFIRMED — with refinements.** Don't lean on "CSS makes reduced-motion free" (it's a wash); cart-pulse via class-toggle has React 19 strict-mode fragility (use Web Animations API `el.animate()` instead); gallery cross-fade with absolute+opacity has real FOUC risk needing explicit aspect-ratio + placeholder; "30KB framer-motion" claim is misleading (actual tree-shaken cost is ~6-8KB). Storefront chunks don't pay even if admin uses it. |
| 3. M3 page sequence: homepage should ship first | YES | **NO — Category first** | **NO — PDP first** | **DISAGREE** — both subagents reject homepage-first. They split on the right alternative. See User Challenge below. |
| 4. M2 build order has no dependency violations | YES | (mostly) | (didn't deep-trace) | **CONFIRMED with caveats** — type/import order is fine; visual/CSS-variable deps and external next-intl dep are unstated and risky. |
| 5. Product type fix is a half-day | YES | (didn't trace) | **NO — 1.5–2 days** | **CONFIRMED WRONG** — `data/products.ts` IS a real interface (id, name, slug, categorySlug, price, discountPrice, rating, images, shortDescription, description, specs, stock), but the cascade across 6 consumers (`product-card.tsx`, `product-details.tsx`, `product-grid.tsx`, `header.tsx`, `cart-context.tsx`, `checkout/page.tsx`) plus the `data/products.ts` ↔ `lib/api.ts` schema reconciliation makes this 1.5–2 days. Move from M3d to start of M2. |

### Critical findings (act before M1 kickoff)

**CRITICAL-1: M1.3 builds on a non-existent v3 API.** ⚠️
The plan's TSX snippet `<HeroUIProvider theme={{ light: {...}, dark: {...} }}>` does not exist in `@heroui/react@^3.0.4`. v3 ships `I18nProvider` + `RouterProvider` (React Aria primitives) and routes theming through the **Tailwind plugin layer** (`heroui({ themes: {...} })` in `tailwind.config` or v4 `@plugin "@heroui/theme"` directive).
- **Fix:** Replace M1.3 with `tailwind.config.ts` plugin config OR Tailwind v4 `@plugin` directive in `globals.css`. Verify against `node_modules/@heroui/theme/` before the PR. 30-min spike before M1 kicks off.
- **Source:** confirmed by `cat frontend/components/heroui-provider-with-intl-router.tsx` showing the existing v3 setup.

**CRITICAL-2: Token dual-naming creates a drift trap.**
Defining both `--primary` (shadcn) and `--color-heroui-primary` (HeroUI) as independent tokens in the same `@theme inline` block invites future drift — tweak one, forget the other, admin and storefront silently diverge.
- **Fix:** Single canonical source (`--accent`, `--bg`, etc.), then alias: `--color-primary: var(--accent); --color-heroui-primary: var(--accent);` in `@theme inline`. One source of truth, two consumer namespaces.

### High-severity findings

**HIGH-1: M3 page sequence is wrong (USER CHALLENGE).**
Both subagents independently rejected homepage-first. They split on the alternative.

**HIGH-2: `Product` typing fix is M2-prerequisite, not M3d work.** Every M2 primitive (`ProductCard`, `PriceBlock`, `RuledRow`) takes a `Product` prop. Building those against `any` then retyping later means rewriting prop signatures twice.
- **Fix:** Promote to start of M2. Make `lib/api.ts` the canonical `Product` type (matching the backend serializer + the DESIGN.md decision to drop `rating`), delete `data/products.ts` duplicate, add a Zod or runtime `assertProduct(data)` guard at the API client layer. Budget 1.5–2 days.

**HIGH-3: HeroUI radius override won't flatten every primitive.** Some primitives (`Chip`, `Avatar`, `Switch` thumb, `Skeleton`) hardcode their own radii in slot recipes. Setting `layout.radius: { small: '2px', medium: '2px', large: '2px' }` won't reach them; you'll get inconsistent radii in M2.
- **Fix:** Add an M1 deliverable: enumerate every HeroUI primitive the migration uses, grep its `dist` for hardcoded `rounded-*` classes, pre-write `classNames={{...}}` overrides per slot. Don't discover this piecemeal in M2.

**HIGH-4: RTL fix in plan only covers our code, not HeroUI's compiled CSS.** HeroUI's compiled CSS in `node_modules/@heroui/theme/dist/` emits physical `padding-left`/`margin-right` in internal selectors (`Input`, `Navbar`, `Drawer`, `Select`). Tailwind logical-property utilities (`ps-*`) have the same specificity and lose by source order. Expect correct LTR + broken RTL in `Input` insets, `Drawer` close-button placement, `Select` chevron.
- **Fix:** Add `[dir="rtl"]` overrides in `globals.css` for the specific HeroUI selectors that leak (audit during M2 as primitives land; expect ~6–10 selectors). Use `:where()` for low specificity.
- **Fix:** Replace the `.rtl-mirror` className pattern with a single declarative attribute rule: `[dir="rtl"] [data-rtl-flip] { transform: scaleX(-1); }`. Mark icons with `data-rtl-flip` attribute, no className gymnastics.
- **Fix:** Add RTL smoke test at the END of M2 (before M3 starts), not just M4. Catching a HeroUI primitive's RTL leak after three pages use it is 3× the rework.

**HIGH-5: M1 needs an exit gate before primitives start.** Without a token-probe specimen page, partial token leakage and missed dark-mode variables surface in M3 as one-off visual bugs across 4 pages.
- **Fix:** Add an M1 exit deliverable: `frontend/app/[locale]/dev/theme-probe/page.tsx` that renders every CSS variable as a labeled swatch in light + dark, plus every HeroUI primitive the migration uses (Button, Card, Chip, Input, Switch, Modal, Pagination) in both themes. M1 doesn't merge until the probe shows zero default-token leakage.

### Medium-severity findings

**MED-1: BilingualPrice's next-intl dependency unstated.** Plan asserts `useLocale()` is "already wired" but never verifies that `NextIntlClientProvider` wraps the HeroUI providers (or vice versa — order matters with React 19 context). If wrap order is wrong, `BilingualPrice` throws at render.
- **Fix:** Add M1 task: verify provider wrap order, smoke-test `useLocale()` inside a HeroUI-themed component before M2 starts.

**MED-2: Cart-pulse class-toggle is fragile under React 19 strict-mode.** Toggling a class on the same element repeatedly does NOT restart the animation unless you force a reflow or use `animation: none → rAF → re-add`. Strict-mode double-invocation can amplify this.
- **Fix:** Use the Web Animations API (`el.animate(keyframes, opts)`) for cart-pulse. Still no framer-motion, still tokenized via CSS vars read into JS, but gives you per-trigger lifecycle (`.cancel()` / `.play()`).

**MED-3: Gallery cross-fade with absolute+opacity has FOUC risk.** Stacked images mean the wrapper needs explicit aspect-ratio + placeholder color or it collapses on first paint.
- **Fix:** M2 gallery primitive: `aspect-ratio: 1` on the well, `--photo-bg` as fallback, `next/image fill + sizes`. Document explicitly so it isn't rediscovered in M3 PDP.

**MED-4: Extract a `CrossFadeStack` primitive in M2.** HeroSpread and PDP gallery both implement cross-fade independently per the current plan — duplicate code, divergent behavior. Extract once.
- **Fix:** Add `frontend/components/ui/cross-fade-stack.tsx` to M2 step 2 (between PriceBlock and HeroSpread). Both HeroSpread and PDP gallery consume it.

**MED-5: Visual/CSS-variable dependencies not tracked.** Plan tracks type/import deps, not CSS variable deps. ProductCard hover assumes `--surface-2` exists; theme transition assumes `--dur-page` exists; focus rings assume `--accent` resolves. If M1 has a typo in one variable name, M2 compiles fine and looks wrong only in specific states/modes.
- **Fix:** Subsumed by the M1 exit-gate probe page (HIGH-5).

**MED-6: Backend API helpers don't exist yet.** Plan's M3a homepage references `getRecentProducts`, `getCategories({withCount})`, `getBackInStock` — none exist in `frontend/lib/api.ts` (the current file is admin-focused). M3a's 1-day estimate doesn't budget for extending the API client.
- **Fix:** Add an M2 / pre-M3 line item: extend `frontend/lib/api.ts` with the storefront read helpers. Budget half-day.

### Low-severity findings

**LOW-1: `prefers-reduced-motion` is not a CSS win.** Plan implies CSS is easier here. One media query vs one `useReducedMotion()` hook — neither is meaningfully simpler. Drop this argument from Risk 3.

**LOW-2: "30KB framer-motion" figure is wrong.** Tree-shaken `motion/react` import is ~6–8KB for a simple `motion.div`. Storefront chunks are already isolated from admin's framer-motion usage. Replace the claim with a more accurate policy: "no framer-motion in any chunk consumed by storefront routes, verified via `next build` analyzer."

**LOW-3: Shadcn token cleanup story unstated.** Admin stays on shadcn forever per scope — that means `--primary`, `--card`, `--ring` etc. are PERMANENT aliases. Plan doesn't say so explicitly.
- **Fix:** Add a line to CLAUDE.md (Design System section): "Admin shadcn tokens are permanent aliases over the v-fixer palette; do not delete during or after the HeroUI migration."

### Unique findings per voice

**Claude main only:** mock `data/products.ts` includes `rating: number` as required field — schema doesn't match the DESIGN.md decision to strip ratings from PDP. When consolidating types in HIGH-2, make `rating` optional or remove. Also the mock data uses unsplash placeholder image URLs; real catalog uses `backend/media/imports/.../*.webp` paths. Schema reconciliation between `data/products.ts.categorySlug: string` and the backend's `category: Category` object shape is its own task inside HIGH-2.

**Subagent-eng only:** explicit `el.animate()` recommendation for cart-pulse (MED-2); extract `CrossFadeStack` primitive (MED-4); HeroUI radius hardcoding nuance (HIGH-3); 30KB figure correction (LOW-2); HMR sometimes misses node_modules → recommend `rm -rf .next` after token swap during M1.

**Subagent-FE only:** confirmed v3 has NO `HeroUIProvider` by reading the actual installed provider; dual-naming token drift trap (CRITICAL-2); HeroUI compiled-CSS physical-property leak (HIGH-4); `[data-rtl-flip]` attribute pattern over `.rtl-mirror` className; Zod / runtime `assertProduct` guard at API client layer; 6-consumer cascade for Product typing (HIGH-2).

### User Challenge — M3 page sequence

> ⚠️ **Both models recommend changing your stated direction.** This is a user challenge per `/autoplan` — your call wins unless you explicitly accept the change.

**You said:** ship homepage first (M3a), then category, PDP, cart.
**Both subagents recommend:** homepage-first is wrong. They split on which page should be first.

| Option | Order | Argued by | Reasoning |
|---|---|---|---|
| A (your original) | homepage → category → PDP → cart | Claude main | Homepage is most visible; exercises every primitive once; biggest visual proof. |
| B | category → PDP → homepage → cart | Subagent-eng | Category instantiates ProductCard ×20, stresses Pretext-grouped uniform heights, filter sidebar, pagination, RTL grid mirroring at scale. Catches design-system bugs earliest while primitives can still be cheaply revised. Homepage becomes a victory-lap composition. |
| C | PDP → category → cart → homepage | Subagent-FE | PDP is the smallest surface where every conversion primitive (PriceBlock, BilingualPrice, gallery, qty stepper, filled CTA) gets validated in isolation. Unblocks deep-links from category cards and cart rows. HeroSpread (zero-reuse, highest risk) ships last. |

**What we might be missing:** stakeholder demo pressure (homepage-first is a demo argument, not engineering), the relative pain of revising primitives after a page has shipped vs catching bugs during page implementation, your read on which surface's bugs would be most costly to discover late.

**If we're wrong, the cost is:** picking the wrong sequence costs maybe 0.5–1 day of rework in M3; not catastrophic either way. The bigger risk is *not* surfacing this decision and letting "homepage first" stick by default.

**Net:** the demo argument is real but not engineering-load-bearing. Either B or C beats A on risk surfacing. Net recommendation: **C (PDP → category → cart → homepage)** because PDP exercises conversion-critical primitives in isolation, then category stresses them at scale, then cart validates ledger-row patterns, then homepage is the integration showcase with HeroSpread (highest novelty, lowest reuse) shipped last.

### Headline call — top 3 to address before kicking off M1

1. **Replace M1.3 with the Tailwind plugin config approach.** The provider override snippet is dead API. 30-minute spike against `node_modules/@heroui/theme/` today, then rewrite M1.3 before starting work.
2. **Promote Product typing to start of M2 (1.5–2 days, not half).** Six consumers cascade; every M2 primitive depends on this. Add Zod / runtime guard at the API boundary.
3. **Re-sequence M3 to PDP → Category → Cart → Homepage.** Both subagents reject homepage-first; surfaces risk earlier, defers HeroSpread (the riskiest single-use primitive) to last.

Secondary but worth flagging before M1 starts: token-probe specimen page as M1 exit gate (HIGH-5), `CrossFadeStack` primitive extraction (MED-4), RTL HeroUI compiled-CSS leak (HIGH-4), single-canonical-token aliasing (CRITICAL-2).

### What this review didn't cover

The skill methodology calls for CEO + Design + Eng + DX phases at full depth. This run was **focused** per your four explicit questions, not full-depth. The plan did not get a CEO strategic-scope review, a design dimensions scorecard, or a DX scorecard. If you want any of those, run `/plan-ceo-review`, `/plan-design-review`, or `/plan-devex-review` individually — they're tractable as separate passes now that the structural findings above are surfaced.


