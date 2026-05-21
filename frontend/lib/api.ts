import {
  normalizeHomeBestSellingResponse,
  type BestSellingDisplayRow,
  type BestSellingInputRow,
} from "@/lib/home-best-selling";
import {
  normalizeHomeHeroResponse,
  type HomeHeroSlidePayload,
} from "@/lib/home-hero";
import { resolveMediaSrc } from "@/lib/media-url";
import { getApiUrl } from "./api-url";

export { getApiUrl };

export type { BestSellingDisplayRow, BestSellingInputRow, HomeHeroSlidePayload };

/* ============================================================================
   Canonical Product / Category types — single source of truth.
   ============================================================================
   Backend (Django + DRF + djangorestframework-camel-case) emits:
     - id as number, decimals as strings, optional fields as null
   We normalize at the wire boundary so consumers see:
     - id: number, decimals: number, optional fields: undefined
   Call normalizeProduct() / normalizeCategory() on every response.
   ========================================================================== */

export interface ProductSpec {
  label: string;
  value: string;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  categorySlug?: string;
  price: number;
  discountPrice?: number;
  costPrice?: number;
  rating: number;
  images: string[];
  shortDescription?: string;
  description?: string;
  specs: ProductSpec[];
  stock: number;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  icon?: string;
  imageUrl?: string;
  parent?: number;
}

/* ----------------------------- coercion helpers --------------------------- */

function coerceString(v: unknown): string | undefined {
  if (v == null) return undefined;
  const s = String(v).trim();
  return s.length > 0 ? s : undefined;
}

function coerceNumber(v: unknown): number | undefined {
  if (v == null || v === "") return undefined;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : undefined;
}

/* --------------------------- normalizers (wire → runtime) ----------------- */

/**
 * Coerce a raw backend response into a canonical Product.
 * Throws if id, name, slug, or price are missing/invalid.
 * Accepts camelCase or snake_case keys at the wire boundary.
 */
export function normalizeProduct(raw: unknown): Product {
  if (raw == null || typeof raw !== "object") {
    throw new Error(
      `normalizeProduct: expected object, got ${raw === null ? "null" : typeof raw}`,
    );
  }
  const r = raw as Record<string, unknown>;

  const id = coerceNumber(r.id);
  if (id === undefined) {
    throw new Error(
      `normalizeProduct: missing or invalid id (got ${JSON.stringify(r.id)})`,
    );
  }
  const name = coerceString(r.name);
  if (name === undefined) {
    throw new Error(`normalizeProduct: missing or empty name (id=${id})`);
  }
  const slug = coerceString(r.slug);
  if (slug === undefined) {
    throw new Error(`normalizeProduct: missing or empty slug (id=${id})`);
  }
  const price = coerceNumber(r.price);
  if (price === undefined) {
    throw new Error(
      `normalizeProduct: missing or invalid price (slug=${slug}, got ${JSON.stringify(r.price)})`,
    );
  }

  const discountPrice = coerceNumber(r.discountPrice ?? r.discount_price);
  const costPrice = coerceNumber(r.costPrice ?? r.cost_price);
  const rating = coerceNumber(r.rating) ?? 0;

  const categorySlug = coerceString(r.categorySlug ?? r.category_slug);
  const shortDescription = coerceString(
    r.shortDescription ?? r.short_description,
  );
  const description = coerceString(r.description);

  const images: string[] = Array.isArray(r.images)
    ? (r.images as unknown[])
        .map((u) => (typeof u === "string" ? u.trim() : ""))
        .filter((u) => u.length > 0)
        .map((u) => resolveMediaSrc(u))
    : [];

  const specs: ProductSpec[] = Array.isArray(r.specs)
    ? (r.specs as unknown[])
        .map((s): ProductSpec | null => {
          if (s == null || typeof s !== "object") return null;
          const sr = s as Record<string, unknown>;
          const label = coerceString(sr.label);
          const value = coerceString(sr.value);
          if (!label || !value) return null;
          return { label, value };
        })
        .filter((s): s is ProductSpec => s !== null)
    : [];

  const stock = coerceNumber(r.stock) ?? 0;

  return {
    id,
    name,
    slug,
    categorySlug,
    price,
    discountPrice,
    costPrice,
    rating,
    images,
    shortDescription,
    description,
    specs,
    stock,
  };
}

/**
 * Coerce a raw backend response into a canonical Category.
 * Throws if id, name, or slug are missing/invalid.
 */
export function normalizeCategory(raw: unknown): Category {
  if (raw == null || typeof raw !== "object") {
    throw new Error(
      `normalizeCategory: expected object, got ${raw === null ? "null" : typeof raw}`,
    );
  }
  const r = raw as Record<string, unknown>;

  const id = coerceNumber(r.id);
  if (id === undefined) {
    throw new Error(
      `normalizeCategory: missing or invalid id (got ${JSON.stringify(r.id)})`,
    );
  }
  const name = coerceString(r.name);
  if (name === undefined) {
    throw new Error(`normalizeCategory: missing or empty name (id=${id})`);
  }
  const slug = coerceString(r.slug);
  if (slug === undefined) {
    throw new Error(`normalizeCategory: missing or empty slug (id=${id})`);
  }

  const icon = coerceString(r.icon);
  const imageUrlRaw = coerceString(r.imageUrl ?? r.image_url);
  const imageUrl = imageUrlRaw ? resolveMediaSrc(imageUrlRaw) : undefined;
  const parent = coerceNumber(r.parent);

  return { id, name, slug, icon, imageUrl, parent };
}

/* --------------------------- runtime assertions -------------------------- */

/**
 * Type-narrow `value` to Product. Use after a fetch boundary to catch
 * schema drift early. Throws a descriptive Error on shape mismatch.
 */
export function assertProduct(value: unknown): asserts value is Product {
  if (value == null || typeof value !== "object") {
    throw new Error(
      `assertProduct: expected object, got ${value === null ? "null" : typeof value}`,
    );
  }
  const v = value as Record<string, unknown>;
  if (typeof v.id !== "number" || !Number.isFinite(v.id)) {
    throw new Error(`assertProduct: invalid id (${JSON.stringify(v.id)})`);
  }
  if (typeof v.name !== "string" || v.name.length === 0) {
    throw new Error(`assertProduct: invalid name (id=${v.id})`);
  }
  if (typeof v.slug !== "string" || v.slug.length === 0) {
    throw new Error(`assertProduct: invalid slug (id=${v.id})`);
  }
  if (typeof v.price !== "number" || !Number.isFinite(v.price)) {
    throw new Error(`assertProduct: invalid price (slug=${String(v.slug)})`);
  }
  if (!Array.isArray(v.images)) {
    throw new Error(`assertProduct: images must be array (slug=${String(v.slug)})`);
  }
  if (!Array.isArray(v.specs)) {
    throw new Error(`assertProduct: specs must be array (slug=${String(v.slug)})`);
  }
}

/**
 * Type-narrow `value` to Category. Throws on shape mismatch.
 */
export function assertCategory(value: unknown): asserts value is Category {
  if (value == null || typeof value !== "object") {
    throw new Error(
      `assertCategory: expected object, got ${value === null ? "null" : typeof value}`,
    );
  }
  const v = value as Record<string, unknown>;
  if (typeof v.id !== "number" || !Number.isFinite(v.id)) {
    throw new Error(`assertCategory: invalid id (${JSON.stringify(v.id)})`);
  }
  if (typeof v.name !== "string" || v.name.length === 0) {
    throw new Error(`assertCategory: invalid name (id=${v.id})`);
  }
  if (typeof v.slug !== "string" || v.slug.length === 0) {
    throw new Error(`assertCategory: invalid slug (id=${v.id})`);
  }
}
export interface ImportErrorRow {
  row: number;
  message: string;
}
export interface ImportResult {
  created: number;
  updated?: number;
  errors: ImportErrorRow[];
}
export interface ProductImportPreviewRow {
  row: number;
  ref: string;
  price: string;
  costPrice: string | null;
  stock: number;
  categorySlug: string | null;
  categoryResolved: boolean;
  imagesDetected: number;
}
export interface ProductImportPreviewResult extends ImportResult {
  rows: ProductImportPreviewRow[];
}

export interface Order {
  id: string;
  items: any[];
  total: number;
  status: string;
  createdAt: string;
}

/** Flattens DRF-style validation payloads (nested dicts / string arrays) for toasts. */
function collectDrfMessages(value: unknown, maxLen = 800): string | null {
  if (value == null) return null;
  if (typeof value === "string") {
    const t = value.trim();
    return t ? t.slice(0, maxLen) : null;
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value).slice(0, maxLen);
  }
  if (Array.isArray(value)) {
    const parts = value
      .map((v) => collectDrfMessages(v, maxLen))
      .filter((s): s is string => Boolean(s));
    return parts.length ? parts.join("; ").slice(0, maxLen) : null;
  }
  if (typeof value === "object") {
    const parts: string[] = [];
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      const inner = collectDrfMessages(v, maxLen);
      if (inner) parts.push(`${k}: ${inner}`);
    }
    return parts.length ? parts.join(" · ").slice(0, maxLen) : null;
  }
  return null;
}

async function extractApiErrorMessage(
  res: Response | null,
  fallback: string,
): Promise<string> {
  if (!res) return "Network error — is the API running?";
  let payload: any = null;
  let text = "";
  try {
    payload = await res.clone().json();
  } catch {
    text = await res.text().catch(() => "");
  }

  if (
    payload?.code === "token_not_valid" &&
    (res.status === 401 || res.status === 403)
  ) {
    return "Admin session expired. Please sign in again at /admin/login.";
  }
  if (
    res.status === 401 &&
    String(payload?.detail ?? "")
      .toLowerCase()
      .includes("token")
  ) {
    return "Admin session expired. Please sign in again at /admin/login.";
  }
  if (res.status === 403) {
    return "You do not have admin permission for this action.";
  }
  if (payload?.errors?.[0]?.message) return String(payload.errors[0].message);
  if (payload?.detail != null) {
    const fromDetail = collectDrfMessages(payload.detail);
    if (fromDetail) return fromDetail;
    if (typeof payload.detail === "string" && payload.detail.trim()) {
      return String(payload.detail).slice(0, 800);
    }
  }
  if (payload?.message && typeof payload.message === "string") {
    return String(payload.message).slice(0, 800);
  }
  if (res.status >= 400 && res.status < 500 && payload && typeof payload === "object") {
    const flat = collectDrfMessages(payload);
    if (flat) return flat;
  }
  if (typeof text === "string" && text.trim()) return text.slice(0, 240);
  return `${fallback} (${res.status})`;
}

/** True when `updateProductBySlug` (etc.) failed because the JWT access token expired or was revoked. */
export function isAdminSessionExpiredErrorMessage(message: string): boolean {
  return /session expired|sign in again at \/admin\/login/i.test(message);
}

/**
 * During `next build`, workers set `NEXT_PHASE=phase-production-build`. Hitting a
 * local API then logs `TypeError: fetch failed` / `ECONNREFUSED` even when the
 * caller catches — so we skip the network call unless explicitly allowed (e.g. CI
 * with `ALLOW_API_DURING_BUILD=1` and a reachable API).
 */
function shouldDeferApiFetchDuringBuild(): boolean {
  return (
    process.env.NEXT_PHASE === "phase-production-build" &&
    process.env.ALLOW_API_DURING_BUILD !== "1"
  );
}

/** Avoids throwing when the Django server is not running (ECONNREFUSED). */
export async function apiFetch(
  url: string,
  init?: RequestInit,
): Promise<Response | null> {
  if (shouldDeferApiFetchDuringBuild()) {
    return null;
  }
  try {
    return await fetch(url, init);
  } catch {
    return null;
  }
}

/** Never throws: bad/empty/HTML bodies become `fallback` (avoids SSR 500 when API is down). */
async function readJsonBody<T>(res: Response, fallback: T): Promise<T> {
  try {
    const text = await res.text();
    if (!text.trim()) return fallback;
    return JSON.parse(text) as T;
  } catch {
    return fallback;
  }
}

export async function getCategories(): Promise<Category[]> {
  const res = await apiFetch(`${getApiUrl()}/categories/`, { next: { revalidate: 60 } });
  if (!res?.ok) return [];
  const data = await readJsonBody<unknown>(res, []);
  if (!Array.isArray(data)) return [];
  // Normalize per-row; drop entries that fail (don't take the whole list down)
  const out: Category[] = [];
  for (const raw of data) {
    try { out.push(normalizeCategory(raw)); }
    catch (e) { console.warn("getCategories: dropping malformed entry", e); }
  }
  return out;
}

export async function getCategory(slug: string): Promise<Category | null> {
  const res = await apiFetch(`${getApiUrl()}/categories/${encodeURIComponent(slug)}/`, {
    next: { revalidate: 60 },
  });
  if (!res?.ok) return null;
  const data = await readJsonBody<unknown>(res, null);
  if (data == null) return null;
  try { return normalizeCategory(data); }
  catch (e) { console.warn(`getCategory(${slug}): malformed response`, e); return null; }
}

export async function getProducts(params?: {
  category?: string;
  featured?: boolean;
  trending?: boolean;
  search?: string;
}): Promise<Product[]> {
  const searchParams = new URLSearchParams();
  if (params?.category) searchParams.append("categorySlug", params.category);
  if (params?.featured) searchParams.append("featured", "true");
  if (params?.trending) searchParams.append("trending", "true");
  const q = params?.search?.trim();
  if (q) searchParams.append("search", q);

  const queryString = searchParams.toString() ? `?${searchParams.toString()}` : "";
  const fetchInit: RequestInit = q
    ? { cache: "no-store" }
    : { next: { revalidate: 60 } };
  const res = await apiFetch(`${getApiUrl()}/products/${queryString}`, fetchInit);
  if (!res?.ok) return [];
  const data = await readJsonBody<unknown>(res, []);
  if (!Array.isArray(data)) return [];
  const out: Product[] = [];
  for (const raw of data) {
    try { out.push(normalizeProduct(raw)); }
    catch (e) { console.warn("getProducts: dropping malformed entry", e); }
  }
  return out;
}

export async function getProduct(slug: string): Promise<Product | null> {
  const safe = encodeURIComponent(slug);
  const res = await apiFetch(`${getApiUrl()}/products/${safe}/`, { next: { revalidate: 60 } });
  if (!res?.ok) return null;
  const data = await readJsonBody<unknown>(res, null);
  if (data == null) return null;
  try { return normalizeProduct(data); }
  catch (e) { console.warn(`getProduct(${slug}): malformed response`, e); return null; }
}

export async function getHomeHero() {
  const res = await apiFetch(`${getApiUrl()}/home-hero/`, { next: { revalidate: 60 } });
  if (!res?.ok) return null;
  const raw = await readJsonBody<unknown>(res, null);
  return normalizeHomeHeroResponse(raw);
}

export async function updateHomeHero(
  payload: { mainSlides: HomeHeroSlidePayload[]; sidePromos: HomeHeroSlidePayload[] },
  token: string,
) {
  const res = await apiFetch(`${getApiUrl()}/home-hero/`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res?.ok) {
    throw new Error(await extractApiErrorMessage(res, "Failed to save home hero"));
  }
  const raw: unknown = await res.json();
  return normalizeHomeHeroResponse(raw);
}

export async function getHomeBestSelling(): Promise<BestSellingDisplayRow[]> {
  const res = await apiFetch(`${getApiUrl()}/home-best-selling/`, {
    next: { revalidate: 60 },
  });
  if (!res?.ok) return [];
  const raw = await readJsonBody<unknown>(res, null);
  return normalizeHomeBestSellingResponse(raw);
}

export async function updateHomeBestSelling(
  items: BestSellingInputRow[],
  token: string,
): Promise<BestSellingDisplayRow[]> {
  const res = await apiFetch(`${getApiUrl()}/home-best-selling/`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      items: items.map((row) => ({
        kind: row.kind,
        product_slug:
          row.kind === "product" ? (row.productSlug ?? "").trim() : "",
        category_slug:
          row.kind === "category" ? (row.categorySlug ?? "").trim() : "",
      })),
    }),
  });
  if (!res?.ok) {
    throw new Error(
      await extractApiErrorMessage(res, "Failed to save best selling"),
    );
  }
  const raw: unknown = await res.json();
  return normalizeHomeBestSellingResponse(raw);
}

export async function getHotDeals(): Promise<Product[]> {
  const res = await apiFetch(`${getApiUrl()}/hot-deals/`, {
    next: { revalidate: 60 },
  });
  if (!res?.ok) return [];
  const raw = await readJsonBody<{ items?: unknown }>(res, { items: [] });
  const items = raw && typeof raw === "object" && Array.isArray(raw.items) ? raw.items : [];
  const out: Product[] = [];
  for (const p of items) {
    try { out.push(normalizeProduct(p)); }
    catch (e) { console.warn("getHotDeals: dropping malformed entry", e); }
  }
  return out;
}

export async function updateHotDeals(productSlugs: string[], token: string): Promise<Product[]> {
  const res = await apiFetch(`${getApiUrl()}/hot-deals/`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ product_slugs: productSlugs }),
  });
  if (!res?.ok) {
    throw new Error(await extractApiErrorMessage(res, "Failed to save hot deals"));
  }
  const raw: unknown = await res.json();
  const data = raw && typeof raw === "object" ? (raw as { items?: unknown }).items : [];
  const items = Array.isArray(data) ? data : [];
  const out: Product[] = [];
  for (const p of items) {
    try { out.push(normalizeProduct(p)); }
    catch (e) { console.warn("updateHotDeals: dropping malformed entry", e); }
  }
  return out;
}

export async function getOrders(token?: string | null): Promise<Order[]> {
  const headers: HeadersInit = {};
  if (token) (headers as Record<string, string>).Authorization = `Bearer ${token}`;
  const res = await apiFetch(`${getApiUrl()}/orders/`, { headers });
  if (!res?.ok) return [];
  const data = await readJsonBody<unknown>(res, []);
  return Array.isArray(data) ? data : [];
}

export async function login(credentials: {
  username: string;
  password: string;
}): Promise<{ access: string }> {
  const res = await apiFetch(`${getApiUrl()}/auth/token/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });
  if (!res?.ok) {
    throw new Error(await extractApiErrorMessage(res, "Sign-in failed"));
  }
  return res.json();
}

export async function changeAdminPassword(
  body: { currentPassword: string; newPassword: string },
  token: string,
): Promise<void> {
  const res = await apiFetch(`${getApiUrl()}/auth/change-password/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      currentPassword: body.currentPassword,
      newPassword: body.newPassword,
    }),
  });
  if (!res?.ok) {
    throw new Error(await extractApiErrorMessage(res, "Password change failed"));
  }
}

export type AdminProfile = {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
};

export async function getAdminProfile(token: string): Promise<AdminProfile> {
  const res = await apiFetch(`${getApiUrl()}/auth/me/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res?.ok) {
    throw new Error(await extractApiErrorMessage(res, "Failed to load profile"));
  }
  return res.json();
}

export async function patchAdminProfile(
  body: Partial<Pick<AdminProfile, "firstName" | "lastName" | "email">>,
  token: string,
): Promise<AdminProfile> {
  const res = await apiFetch(`${getApiUrl()}/auth/me/`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  if (!res?.ok) {
    throw new Error(await extractApiErrorMessage(res, "Failed to update profile"));
  }
  return res.json();
}

export async function createOrder(orderData: Record<string, unknown>): Promise<Order> {
  const res = await apiFetch(`${getApiUrl()}/orders/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(orderData),
  });
  if (!res?.ok) {
    throw new Error(await extractApiErrorMessage(res, "Order creation failed"));
  }
  return res.json();
}

export async function createProduct(data: any, token: string): Promise<Product> {
  const res = await apiFetch(`${getApiUrl()}/products/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res?.ok) {
    throw new Error(await extractApiErrorMessage(res, "Failed to create product"));
  }
  return normalizeProduct(await res.json());
}

export async function createCategory(data: any, token: string): Promise<Category> {
  const res = await apiFetch(`${getApiUrl()}/categories/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res?.ok) throw new Error(await extractApiErrorMessage(res, "Failed to create category"));
  return normalizeCategory(await res.json());
}

export async function patchOrder(
  id: string,
  body: Record<string, unknown>,
  token: string,
): Promise<Order> {
  const res = await apiFetch(`${getApiUrl()}/orders/${id}/`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  if (!res?.ok) throw new Error(await extractApiErrorMessage(res, "Order update failed"));
  return res.json();
}

export async function updateOrderStatus(
  id: string,
  status: string,
  token: string,
): Promise<Order> {
  return patchOrder(id, { status }, token);
}

export async function updateProductBySlug(
  slug: string,
  data: Record<string, unknown>,
  token: string,
): Promise<Product> {
  const res = await apiFetch(
    `${getApiUrl()}/products/${encodeURIComponent(slug)}/`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    },
  );
  if (!res?.ok) throw new Error(await extractApiErrorMessage(res, "Failed to update product"));
  return normalizeProduct(await res.json());
}

export async function deleteProductBySlug(slug: string, token: string): Promise<void> {
  const res = await apiFetch(`${getApiUrl()}/products/${encodeURIComponent(slug)}/`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res?.ok) {
    throw new Error(await extractApiErrorMessage(res, "Failed to delete product"));
  }
}

export async function updateCategoryBySlug(
  slug: string,
  data: Record<string, unknown>,
  token: string,
): Promise<Category> {
  const res = await apiFetch(
    `${getApiUrl()}/categories/${encodeURIComponent(slug)}/`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    },
  );
  if (!res?.ok) throw new Error(await extractApiErrorMessage(res, "Failed to update category"));
  return normalizeCategory(await res.json());
}

export async function deleteCategoryBySlug(
  slug: string,
  token: string,
): Promise<void> {
  const res = await apiFetch(`${getApiUrl()}/categories/${encodeURIComponent(slug)}/`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res?.ok) {
    throw new Error(await extractApiErrorMessage(res, "Failed to delete category"));
  }
}

async function parseImportResponse<T>(res: Response | null, fallbackError: string): Promise<T> {
  if (!res) throw new Error("Network error — is the API running?");
  const payload = await res.json().catch(() => null);
  if (!res.ok && res.status !== 207) {
    throw new Error(await extractApiErrorMessage(res, fallbackError));
  }
  return payload as T;
}

export async function importCategoriesCsv(file: File, token: string): Promise<ImportResult> {
  const body = new FormData();
  body.append("file", file);
  const res = await apiFetch(`${getApiUrl()}/categories/import/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body,
  });
  return parseImportResponse<ImportResult>(res, "Categories import failed");
}

export async function previewProductsXlsx(
  file: File,
  token: string,
): Promise<ProductImportPreviewResult> {
  const body = new FormData();
  body.append("file", file);
  const res = await apiFetch(`${getApiUrl()}/products/import-preview/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body,
  });
  return parseImportResponse<ProductImportPreviewResult>(res, "Products preview failed");
}

export async function importProductsXlsx(file: File, token: string): Promise<ImportResult> {
  const body = new FormData();
  body.append("file", file);
  const res = await apiFetch(`${getApiUrl()}/products/import/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body,
  });
  return parseImportResponse<ImportResult>(res, "Products import failed");
}
