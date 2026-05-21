# CLAUDE.md

Project-level instructions for Claude Code when working in this repository.

## Project

**v-fixer** — electronics repair tools catalog for technicians and repair shops in Morocco and the wider MENA region. Bilingual French + Arabic, mobile-first. Customers are professional buyers looking up specific parts (soldering stations, microscopes, pannes, consommables) — not impulse shoppers; the UI treats them as adults.

**Brands carried:** Magma, JBC, Aifen, Sugon, Hakko, Goot, Kaisi.

- `frontend/` — Next.js (App Router), TypeScript, Tailwind v4, **HeroUI** primitives via `@heroui/react`, Lucide icons. Currently mid-migration from shadcn → HeroUI on branch `feat/heroui-storefront-migration`; a handful of shadcn primitives in `frontend/components/ui/` remain until the migration ships.
- `backend/` — Django + DRF, JWT auth (`simplejwt`), SQLite in dev, camelCase JSON via `djangorestframework-camel-case`.
- `docs/` — all Markdown lives here. Start with `docs/README.md`, then `docs/DOCUMENTATION.md` and `docs/BACKEND_FRONTEND_OVERVIEW.md`.

## Commands

Run from the repo root unless noted.

### Frontend
- `npm install` (inside `frontend/`, once)
- `npm run dev` — Next.js on `http://localhost:3000`
- `npm run lint`
- `npm run build`

### Backend
- `cd backend`
- `python3 -m venv venv && source venv/bin/activate` (first time)
- `pip install -r requirements.txt`
- `python manage.py migrate`
- `python manage.py runserver 8001` — Django on `http://localhost:8001` (port 8001 intentionally, leave 8000 free)
- Alternatively from repo root: `npm run backend`

### API base URL
- Default: `http://localhost:8001/api`
- Override in `frontend/.env.local` with `NEXT_PUBLIC_API_URL`.

## Conventions

### Frontend
- **App Router** only — no `pages/`. Server components by default; mark client components with `"use client"`.
- **HeroUI** is the primary primitive library, imported from `@heroui/react`. Use it for buttons, inputs, badges, dropdowns, scroll shadows, chips, etc. Legacy shadcn primitives still live in `frontend/components/ui/` during the migration — consume them where they already work (admin dashboard mostly), but don't add new ones; extend or wrap HeroUI instead.
- **Path aliases** (`frontend/components.json`): `@/components`, `@/components/ui`, `@/lib`, `@/lib/utils`, `@/hooks`.
- **Styling**: Tailwind v4 (CSS-config in `app/globals.css`). Design tokens flow via CSS variables aliased to both shadcn (`--primary`, `--card`, `--ring`, …) and HeroUI (`--color-heroui-*`) names in the same `@theme inline` block. Use `cn()` from `@/lib/utils` for class merging. Avoid inline styles.
- **Typography**: loaded via `next/font` — **Fraunces** (display), **Geist** (Latin body), **IBM Plex Sans Arabic** (Arabic body), **JetBrains Mono** (numerals, prices, REFs). Never introduce Inter or system-sans fallbacks beyond the `next/font` `fallback` array.
- **Icons**: `lucide-react` only.
- **API client**: use `frontend/lib/api.ts` — do not call `fetch` directly from components.
- **State**: cart state lives in `frontend/context/cart-context.tsx`. Keep cross-cutting state there, not in components.
- **Component folders**: `ui/` (legacy shadcn primitives + small shared wrappers like `RevealHeading`), `layout/` (headers/footers/shells), `product/` (cards, grids, details), `home/` (landing sections).
- **Mock data** in `frontend/data/` is for prototyping only — prefer real API calls when the endpoint exists.

### Backend
- **Apps**: `catalog` (Category, Product) and `orders` (Order, OrderItem). New domains get their own app.
- **JSON casing**: requests and responses are **camelCase** end-to-end. Don't add snake_case to API payloads.
- **Auth**: JWT via `/api/auth/token/` and `/api/auth/token/refresh/`. Admin-only endpoints require both JWT and admin permission.
- **Slugs** are the lookup field for `Category` and `Product` (`/api/products/:slug/`). Order detail uses UUID `id`.
- **Migrations**: always create and commit migration files; never edit historical migrations.
- **Import endpoints** (admin only):
  - `POST /api/categories/import/` — CSV, upsert by slug.
  - `POST /api/products/import-preview/` — `.xlsx` dry-run.
  - `POST /api/products/import/` — `.xlsx` or ZIP (with `products.csv` + images). Product XLSX headers: `IMAGE`, `REF`, `PRICE`, `PRICE ACHA`, `QT`, `CATEGORY`.

## Common workflows

- **New product field**: add to model → makemigrations & migrate → update serializer → update `frontend/lib/api.ts` types → update relevant card/detail components.
- **New page**: create under `frontend/app/<route>/page.tsx`. Use server components unless interactivity is needed.
- **New UI primitive**: prefer composing HeroUI's primitives directly in the consuming component. When a wrapper is genuinely shared (animation, layout, locale-aware behavior), drop it in `frontend/components/ui/` as a thin client component — see `reveal-heading.tsx` for the pattern. Don't introduce new shadcn-style primitives.

## Dev pages

Internal dev/probe/sandbox pages MUST live under `frontend/app/[locale]/`. Why: Next.js 16's `proxy.ts` (the v16 replacement for `middleware.ts`) wraps `next-intl` with `localePrefix: "always"`. Every non-locale path (e.g. `/dev/foo`, `/sandbox/bar`) is redirected to `/fr/...` and 404s unless the file exists under `[locale]/`.

Example: the theme-probe lives at `frontend/app/[locale]/dev/theme-probe/page.tsx` and is served at `/fr/dev/theme-probe` (or `/ar/dev/theme-probe`).

For the duration of the migration, all new dev/internal tooling pages follow this pattern.

## Gotchas

- Django runs on **8001**, not 8000. Update `NEXT_PUBLIC_API_URL` if you change it.
- SimpleJWT access lifetime is extended in settings — the admin UI stores the access token in localStorage and has no refresh flow yet.
- CORS is wide open (`CORS_ALLOW_ALL_ORIGINS = True`) for dev only — do not ship as-is.
- `SECRET_KEY` and `DEBUG = True` in `backend/backend/settings.py` are dev values. Don't deploy without overriding.
- The Next.js admin area (`/admin/*`) is **not** the Django admin (`/admin/`). Different things.
- `next/font` config changes can cause Turbopack to emit silent `JSON.parse` 500s on all routes. Recovery: `rm -rf .next node_modules/.cache && restart dev server`.
- Bash-driven `cp` on a watched file doesn't trigger Turbopack's watcher. Either touch the file via the editor or restart the dev server.
- HeroUI v3 has **no** `HeroUIProvider`. Theme tokens flow through CSS cascade only (`@import '@heroui/styles'` + `:root` / `.dark` variable overrides). There is no Tailwind plugin config.
- HeroUI v3's `DropdownTrigger` **is** a Button. Don't wrap a `<Button>` inside it — pass `variant` / `className` directly to `DropdownTrigger`.
- HeroUI v3 renames: `CardBody` → `CardContent`.

## gstack

Use the `/browse` skill from gstack for all web browsing. Never use `mcp__claude-in-chrome__*` tools.

Available gstack skills:

- `/office-hours`
- `/plan-ceo-review`
- `/plan-eng-review`
- `/plan-design-review`
- `/design-consultation`
- `/design-shotgun`
- `/design-html`
- `/review`
- `/ship`
- `/land-and-deploy`
- `/canary`
- `/benchmark`
- `/browse`
- `/connect-chrome`
- `/qa`
- `/qa-only`
- `/design-review`
- `/setup-browser-cookies`
- `/setup-deploy`
- `/setup-gbrain`
- `/retro`
- `/investigate`
- `/document-release`
- `/codex`
- `/cso`
- `/autoplan`
- `/plan-devex-review`
- `/devex-review`
- `/careful`
- `/freeze`
- `/guard`
- `/unfreeze`
- `/gstack-upgrade`
- `/learn`

## Design System

**ALWAYS read [DESIGN.md](DESIGN.md) at the repo root before touching anything visual.** The design system was built specifically to refuse marketing theater: **no auto-rotating heroes, no countdown timers, no fake scarcity, no gradient buttons, no shadows.** Do not reintroduce these patterns. When in doubt, paraphrase the anchor:

> *v-fixer treats the customer like an adult — real stock, real prices, no theatrics.*

For historical context on why each decision was made (and the tradeoffs considered and rejected), see [docs/DESIGN-SESSION-2026-05-18.md](docs/DESIGN-SESSION-2026-05-18.md).

Always read **[DESIGN.md](DESIGN.md)** before making any visual, UI, or motion change. It is the source of truth for:

- Color palette (light + dark, all hex values, usage rules for the blueprint-blue accent)
- Typography (Fraunces display only, Geist body Latin, IBM Plex Sans Arabic body RTL, JetBrains Mono for numbers)
- Spacing scale (base 4px) and the modular type scale
- Layout (cards on browse, ruled rows on cart and admin tables)
- Motion tokens (`--ease-*`, `--dur-*`) and the allowed/refused animation list
- Visual refusals (no gradients, no shadows, no bubble radius, no sale ribbons, no Inter)
- The three risks (R1 hybrid cards/rows, R2 blueprint blue + linen, R3 bilingual numerals)

When implementing or reviewing UI:

- Wire HeroUI tokens (`--color-heroui-*`) to the CSS custom properties in DESIGN.md (`--bg`, `--ink`, `--accent`, `--rule`, etc.). Do not introduce new colors. Shadcn tokens linger during the migration — keep their aliases pointing at the same source-of-truth variables.
- In `/qa`, `/design-review`, and `/review`, flag any code that deviates from DESIGN.md — wrong hex, wrong font, drop shadow, gradient, bubble radius, scroll-jacked animation.
- If a request would require deviating from DESIGN.md, surface the conflict and ask before proceeding.

## Out of scope (do not touch unless asked)

- Production deployment configs.
- Switching the database away from SQLite.
- Reintroducing shadcn primitives in places HeroUI now owns (the migration is the direction of travel, not a reversible decision).
