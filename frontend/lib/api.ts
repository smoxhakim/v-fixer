import {
  normalizeHomeBestSellingResponse,
  type BestSellingDisplayRow,
  type BestSellingInputRow,
} from "@/lib/home-best-selling";
import {
  normalizeHomeHeroResponse,
  type HomeHeroSlidePayload,
} from "@/lib/home-hero";
import { normalizeProductImages } from "@/lib/media-url";

export type { BestSellingDisplayRow, BestSellingInputRow, HomeHeroSlidePayload };

export type Category = any;
export type Product = any;
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

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8001/api";

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
    res.status === 401 &&
    (payload?.code === "token_not_valid" ||
      String(payload?.detail ?? "")
        .toLowerCase()
        .includes("token"))
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

/** Avoids throwing when the Django server is not running (ECONNREFUSED). */
export async function apiFetch(
  url: string,
  init?: RequestInit,
): Promise<Response | null> {
  try {
    return await fetch(url, init);
  } catch {
    return null;
  }
}

export async function getCategories(): Promise<Category[]> {
  const res = await apiFetch(`${API_URL}/categories/`, { next: { revalidate: 60 } });
  if (!res?.ok) return [];
  return res.json();
}

export async function getCategory(slug: string): Promise<Category | null> {
  const res = await apiFetch(`${API_URL}/categories/${encodeURIComponent(slug)}/`, {
    next: { revalidate: 60 },
  });
  if (!res?.ok) return null;
  return res.json();
}

export async function getProducts(params?: { category?: string; featured?: boolean; trending?: boolean }): Promise<Product[]> {
  const searchParams = new URLSearchParams();
  if (params?.category) searchParams.append("categorySlug", params.category);
  if (params?.featured) searchParams.append("featured", "true");
  if (params?.trending) searchParams.append("trending", "true");
  
  const queryString = searchParams.toString() ? `?${searchParams.toString()}` : "";
  const res = await apiFetch(`${API_URL}/products/${queryString}`, { next: { revalidate: 60 } });
  if (!res?.ok) return [];
  const data: Product[] = await res.json();
  return Array.isArray(data) ? data.map((p) => normalizeProductImages(p)) : data;
}

export async function getProduct(slug: string): Promise<Product | null> {
  const res = await apiFetch(`${API_URL}/products/${slug}/`, { next: { revalidate: 60 } });
  if (!res?.ok) return null;
  const data: Product = await res.json();
  return normalizeProductImages(data);
}

export async function getHomeHero() {
  const res = await apiFetch(`${API_URL}/home-hero/`, { next: { revalidate: 60 } });
  if (!res?.ok) return null;
  const raw: unknown = await res.json();
  return normalizeHomeHeroResponse(raw);
}

export async function updateHomeHero(
  payload: { mainSlides: HomeHeroSlidePayload[]; sidePromos: HomeHeroSlidePayload[] },
  token: string,
) {
  const res = await apiFetch(`${API_URL}/home-hero/`, {
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
  const res = await apiFetch(`${API_URL}/home-best-selling/`, {
    next: { revalidate: 60 },
  });
  if (!res?.ok) return [];
  const raw: unknown = await res.json();
  return normalizeHomeBestSellingResponse(raw);
}

export async function updateHomeBestSelling(
  items: BestSellingInputRow[],
  token: string,
): Promise<BestSellingDisplayRow[]> {
  const res = await apiFetch(`${API_URL}/home-best-selling/`, {
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

export async function getOrders(token?: string | null): Promise<Order[]> {
  const headers: HeadersInit = {};
  if (token) (headers as Record<string, string>).Authorization = `Bearer ${token}`;
  const res = await apiFetch(`${API_URL}/orders/`, { headers });
  if (!res?.ok) return [];
  return res.json();
}

export async function login(credentials: any): Promise<{ access: string }> {
  const res = await apiFetch(`${API_URL}/auth/token/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });
  if (!res?.ok) throw new Error("Login failed");
  return res.json();
}

export async function createOrder(orderData: any): Promise<Order> {
  const res = await apiFetch(`${API_URL}/orders/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(orderData),
  });
  if (!res?.ok) throw new Error("Order creation failed");
  return res.json();
}

export async function createProduct(data: any, token: string): Promise<Product> {
  const res = await apiFetch(`${API_URL}/products/`, {
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
  return res.json();
}

export async function createCategory(data: any, token: string): Promise<Category> {
  const res = await apiFetch(`${API_URL}/categories/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res?.ok) throw new Error(await extractApiErrorMessage(res, "Failed to create category"));
  return res.json();
}

export async function patchOrder(
  id: string,
  body: Record<string, unknown>,
  token: string,
): Promise<Order> {
  const res = await apiFetch(`${API_URL}/orders/${id}/`, {
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
    `${API_URL}/products/${encodeURIComponent(slug)}/`,
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
  return res.json();
}

export async function deleteProductBySlug(slug: string, token: string): Promise<void> {
  const res = await apiFetch(`${API_URL}/products/${encodeURIComponent(slug)}/`, {
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
    `${API_URL}/categories/${encodeURIComponent(slug)}/`,
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
  return res.json();
}

export async function deleteCategoryBySlug(
  slug: string,
  token: string,
): Promise<void> {
  const res = await apiFetch(`${API_URL}/categories/${encodeURIComponent(slug)}/`, {
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
  const res = await apiFetch(`${API_URL}/categories/import/`, {
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
  const res = await apiFetch(`${API_URL}/products/import-preview/`, {
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
  const res = await apiFetch(`${API_URL}/products/import/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body,
  });
  return parseImportResponse<ImportResult>(res, "Products import failed");
}
