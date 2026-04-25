# V-fixer — backend today & what the frontend expects

This document describes the **Django REST API** as it exists now and how the **Next.js frontend** (`frontend/`) uses it. JSON request/response bodies use **camelCase** (`djangorestframework-camel-case`).

**Base URL (dev default):** `http://localhost:8001/api` — override with `NEXT_PUBLIC_API_URL` in `frontend/.env.local`.

---

## 1. What the backend has today

### Stack & configuration

| Piece | Notes |
|--------|--------|
| Framework | Django + Django REST Framework |
| Database | SQLite (`backend/db.sqlite3`) in default settings |
| CORS | `CORS_ALLOW_ALL_ORIGINS = True` (dev-friendly) |
| Auth | JWT via `rest_framework_simplejwt` (`/api/auth/token/`, `/api/auth/token/refresh/`) |
| JSON | CamelCase renderers & parsers |
| Admin site | Django built-in at `/admin/` (separate from Next `/admin`) |

### Apps & models

**`catalog`**

- **Category:** `name`, `slug` (unique), `icon` (optional, e.g. Lucide name), `parent` (self-FK, optional).
- **Product:** `name`, `slug` (unique), `category` (FK, optional — set after import if omitted), `price`, `cost_price` (optional), `discount_price`, `rating`, `images` (JSON array), `short_description`, `description`, `specs` (JSON), `stock`.

**`orders`**

- **Order:** UUID `id`, `order_number` (unique), customer `name`, `phone`, `email`, `address`, `city`, `postal_code`, `notes`, `subtotal`, `total`, `date` (auto), `status` (`Pending` \| `Contacted` \| `Fulfilled` \| `Cancelled`).
- **OrderItem:** `order`, `product` (FK, nullable on delete), `quantity`, `price` (snapshot at order time).

### HTTP API (router under `/api/`)

| Resource | List | Create | Retrieve | Update | Delete |
|----------|------|--------|----------|--------|--------|
| **Categories** | `GET /api/categories/` | `POST` | `GET /api/categories/:slug/` | `PUT/PATCH` | `DELETE` |
| **Products** | `GET /api/products/` | `POST` | `GET /api/products/:slug/` | `PUT/PATCH` | `DELETE` |
| **Orders** | `GET /api/orders/` | `POST` | `GET /api/orders/:id/` | `PUT/PATCH` | `DELETE` |

### Admin import endpoints (new)

| Endpoint | Method | Auth | Notes |
|----------|--------|------|-------|
| `/api/categories/import/` | `POST` | JWT + admin | Multipart CSV import (`file`). Upsert by slug; duplicate slug in same CSV is rejected. |
| `/api/products/import-preview/` | `POST` | JWT + admin | Multipart `.xlsx` parse only (`file`). Returns parsed rows + row errors; no DB writes. |
| `/api/products/import/` | `POST` | JWT + admin | Multipart `.xlsx` import (`file`) or optional ZIP import (`archive` or `.zip` in `file`). Create-only products with slug auto-uniquify. |

**Product `.xlsx` fixed headers:** `IMAGE`, `REF`, `PRICE`, `PRICE ACHA`, `QT`, `CATEGORY` (leave `CATEGORY` empty to import without a category; assign later via product edit).

**Optional ZIP fallback:** archive contains `products.csv` and image files. `products.csv` supports `REF`, `PRICE`, `PRICE ACHA`, `QT`, `CATEGORY`, and optional `image_paths` (`|`-separated paths inside archive).

**Price parsing rule (deterministic):**

1. Remove spaces from raw string.
2. If there is no dot (`.`), replace commas with dots.
3. If there is already a dot, remove commas as thousands separators.
4. Parse the **first valid numeric token**.

Examples:

- `1 200,50` -> `1200.50`
- `1,200.50` -> `1200.50`
- `3300 OR 3200` -> `3300`

**Category resolution:** if `CATEGORY` is non-empty, importer uses `slugify(cellValue)` and resolves in a preloaded in-memory map (no per-row category query). Empty cell → product created with `category = null`.

**Image mapping (phase 2):** exact anchor row match only (no `+-1` tolerance). Any image not matching the data row is ignored.

**Preview architecture:** stateless confirm flow. Frontend sends the file to preview, then re-uploads the same file for commit.

**Lookup:** categories and products use **`slug`**; orders use **UUID** `id`.

### Permissions (who can call what)

| Action | Categories | Products | Orders |
|--------|------------|----------|--------|
| List / retrieve | Public (`AllowAny`) | Public | **Admin only** (`IsAdminUser`) |
| Create / update / delete | **Admin only** | **Admin only** | **Admin only** |
| **Create order** (`POST /api/orders/`) | — | — | **Public** (`AllowAny`) — used by checkout |

Admin actions expect **`Authorization: Bearer <access_token>`** from `POST /api/auth/token/` (Django superuser credentials).

### Product list query params (implemented)

- **`categorySlug`** — filters products where `category.slug` matches.  
- **`featured`** and **`trending`** — sent by the storefront; **not implemented** in `ProductViewSet.get_queryset()` today (ignored; list is still full or category-filtered only).

### Order creation (server behaviour)

- `order_number` is **not** taken from the client on create; the serializer’s `create()` generates `ORD-<8 hex chars>` (note: this differs from any client-side order number helper in the frontend).
- Line items: server sets **line `price`** from the product’s current `price` / `discount_price`.
- Client-supplied **`status`** on create is **read-only** in the serializer — new orders use model default `Pending`.

### Order updates (serializer caveat)

`OrderSerializer` includes `status` in **`read_only_fields`**. So **`PATCH` may not persist `status` changes** until the backend removes `status` from read-only (or exposes a dedicated transition endpoint). **`notes`** and other non–read-only fields may still be writable depending on validation.

### Category / product serializers (read vs write)

- **Product:** `category` is **write-only**; responses expose **`categorySlug`** (read) but **not** `category` id on read. The admin UI works around this by matching slug to category.
- **Order items (read):** nested `items` with **`productId`**, `quantity`, `price` (camelCase). No nested product name/image unless you extend the API.

---

## 2. What the frontend uses from the backend

### Storefront (public + checkout)

| Need | Endpoint / behaviour |
|------|----------------------|
| Category nav & filters | `GET /api/categories/` |
| Product grids, PDP, related | `GET /api/products/`, `GET /api/products/:slug/` |
| Filter by category slug | `GET /api/products/?categorySlug=<slug>` |
| Place order | `POST /api/orders/` with JSON body (camelCase) |

**Checkout payload shape (today)** — order header + line items:

```json
{
  "name": "",
  "phone": "",
  "email": "",
  "address": "",
  "city": "",
  "postalCode": "",
  "notes": "",
  "subtotal": 0,
  "total": 0,
  "items": [
    { "product": "<product-id>", "quantity": 1 }
  ]
}
```

The serializer field for the line FK is defined as `product_id` / camelCase **`productId`** in strict DRF naming. If checkout ever returns **400** on items, align the key with **`productId`** + **`quantity`** and retest.

### Admin UI (JWT when present)

| Need | Endpoint |
|------|-----------|
| List orders | `GET /api/orders/` with `Authorization: Bearer …` |
| Create / update product | `POST /api/products/`, `PATCH /api/products/:slug/` |
| Create / update category | `POST /api/categories/`, `PATCH /api/categories/:slug/` |
| Update order (notes / status attempt) | `PATCH /api/orders/:id/` |
| Login (optional, for token) | `POST /api/auth/token/` |

**Frontend files:** `frontend/lib/api.ts`, `frontend/lib/admin-queries.ts`, admin pages under `frontend/app/admin/dashboard/**`.

### Resilience

- If the API is down, `apiFetch` avoids throwing; list calls often return **empty arrays** so pages degrade instead of crashing.

---

## 3. Gap list — what the frontend would like next from the backend

These are **not** all implemented today; they unblock richer UX and admin accuracy.

1. **Dashboard aggregates** — e.g. `GET /api/admin/summary` (counts, revenue, pending orders) instead of deriving everything from full lists.
2. **Product list** — pagination, `search`, real **`featured` / `trending`** filters (or remove unused query params from the client).
3. **Product read** — expose **`categoryId`** (read-only) on list/detail next to `categorySlug`.
4. **Catalog merchandising** — optional `status` / `published` / `isActive` on products and categories if the UI should show real draft vs live.
5. **Orders** — server-side **search / status / date** filters; **payment** fields if you add payments; **nested product** on each line item for receipts/admin tables.
6. **Order `status` updates** — make `status` writable on `PATCH` (or add a state machine endpoint).
7. **Line item create key** — document canonical key (`productId` vs `product`) and match storefront + docs + serializer.

---

## 4. Quick reference — camelCase JSON fields

**Category (typical):** `id`, `name`, `slug`, `icon`, `parent`

**Product (typical read):** `id`, `name`, `slug`, `categorySlug`, `price`, `costPrice`, `discountPrice`, `rating`, `images`, `shortDescription`, `description`, `specs`, `stock`  
**Product write:** include `category` (integer PK) for create/update.

**Order (typical):** `id`, `orderNumber`, `name`, `phone`, `email`, `address`, `city`, `postalCode`, `notes`, `subtotal`, `total`, `date`, `status`, `items`

**Order line item:** `productId`, `quantity`, `price` (read; `price` set on server for create)

---

*Last aligned with repo layout: Next app in `frontend/`, API default port `8001`.*
