# Message for backend team — admin dashboard

The Next.js admin UI targets `NEXT_PUBLIC_API_URL` (default `http://localhost:8001/api`). JSON uses **camelCase** (djangorestframework-camel-case). Below are gaps and suggested contracts so the dashboard can move from “computed from lists” to first-class admin APIs.

---

## 1. Dashboard aggregate stats

**Missing today:** There is no `GET /api/admin/summary/` (or similar). The UI derives:

- total products / categories / orders from list endpoints  
- revenue and “pending” counts from the orders list  
- low stock from the products list  

**Suggested endpoint:** `GET /api/admin/dashboard/summary/`

**Example response (camelCase):**

```json
{
  "totalProducts": 120,
  "totalCategories": 14,
  "totalOrders": 540,
  "totalRevenue": "125430.50",
  "pendingOrders": 23,
  "lowStockCount": 5,
  "recentOrders": []
}
```

`recentOrders` can mirror a slim order DTO (see §4).

---

## 2. Products — list / create / update

**Existing (public + admin JWT for writes):**

- `GET /api/products/` — list (AllowAny)  
- `POST /api/products/` — create (IsAdminUser)  
- `GET /api/products/:slug/` — detail (AllowAny)  
- `PATCH/PUT /api/products/:slug/` — update (IsAdminUser)  

**Gaps / notes:**

- List/detail responses **do not expose `category` id** (category is write-only on serializer). The admin UI matches category by `categorySlug` for edit forms. Prefer adding **`categoryId`** (read-only) on list + detail.  
- No **`status`** (draft/archived), **`publishedAt`**, or merchandising flags — UI shows a static “Active” badge until modeled.  
- **Pagination / search / admin filters** are missing on list; the storefront loads the full list.

**Suggested list query params (optional):** `search`, `categorySlug`, `lowStock=true`, `page`, `pageSize`.

**Create / update body (camelCase)** — align with current `Product` model + serializer:

| Field               | Type              | Notes                          |
|---------------------|-------------------|--------------------------------|
| `name`              | string            |                                |
| `slug`              | string            | unique                         |
| `category`          | integer (PK)      | write                          |
| `price`             | decimal           |                                |
| `discountPrice`     | decimal \| null   |                                |
| `stock`             | integer           |                                |
| `images`            | string[]          | JSON array                     |
| `shortDescription`  | string \| null    |                                |
| `description`       | string \| null    |                                |
| `specs`             | array \| object   | optional                       |
| `rating`            | decimal           | optional default               |

**Response:** full product object including `categoryId` + `categorySlug` when possible.

---

## 3. Categories — list / create / update

**Existing:**

- `GET /api/categories/`  
- `POST /api/categories/` (IsAdminUser)  
- `GET/PATCH/PUT /api/categories/:slug/`  

**Gaps:**

- No **`description`** or **`isActive` / `status`** on the model — UI documents placeholders.

**Suggested extensions:** optional `description`, `sortOrder`, `isActive`.

**Create / update body (camelCase):**

| Field     | Type           | Notes        |
|-----------|----------------|--------------|
| `name`    | string         |              |
| `slug`    | string         | unique       |
| `icon`    | string \| null | Lucide name  |
| `parent`  | integer \| null| FK Category  |

---

## 4. Orders — list / detail / update

**Existing:**

- `POST /api/orders/` — create (AllowAny) — storefront checkout  
- `GET /api/orders/` — list (**IsAdminUser**)  
- `GET/PATCH/PUT /api/orders/:id/` — detail / update (**IsAdminUser**)  

**Critical gap — status updates:**

`OrderSerializer` sets `read_only_fields = ['id', 'order_number', 'date', 'status']`, so **`status` is ignored on PATCH** from the client’s perspective. The admin UI sends `status` + `notes` on save. **Please remove `status` from `read_only_fields`** (or expose a dedicated transition endpoint) so fulfillment workflow works.

**Other gaps:**

- No **payment** or **fulfillment** fields separate from `status`.  
- Line items return **`productId`** only — admin UI cross-references the products list for names; **nested product** (`{ id, name, slug, image }`) on each line item would remove extra round-trips.  
- No **server-side filters** (search, status, date range, payment). The UI filters in the browser.

**Suggested list query params:** `search`, `status`, `dateFrom`, `dateTo`, `paymentStatus` (when added), `page`, `pageSize`.

**Order JSON shape (camelCase, current + wishes):**

```json
{
  "id": "uuid",
  "orderNumber": "ORD-…",
  "name": "",
  "phone": "",
  "email": "",
  "address": "",
  "city": "",
  "postalCode": "",
  "notes": "",
  "subtotal": "0.00",
  "total": "0.00",
  "date": "2026-04-09T12:00:00Z",
  "status": "Pending",
  "items": [
    { "productId": 1, "quantity": 2, "price": "19.99", "product": { "name": "…" } }
  ],
  "paymentStatus": "paid"
}
```

**PATCH body (minimal):** `{ "status": "Fulfilled", "notes": "…" }` — plus any new fields you add.

---

## 5. Auth (for later)

Admin mutations already expect **`Authorization: Bearer <JWT>`** from `/api/auth/token/`. No change requested in this frontend pass beyond stable error codes (**401/403**) for missing/invalid tokens.

---

## Summary checklist

| Area              | Priority | Action |
|-------------------|----------|--------|
| Order `status`    | High     | Writable on PATCH or dedicated action |
| Product `categoryId` read | Medium | On list + detail |
| Dashboard summary | Medium   | New aggregate endpoint |
| Order list filters| Medium   | Query params + pagination |
| Payment / fulfillment | Low | New fields when productized |
| Category description / status | Low | Model + serializer |
