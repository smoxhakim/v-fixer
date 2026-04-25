import { apiFetch, API_URL } from "@/lib/api";
import type {
  AdminCategory,
  AdminFetchResult,
  AdminOrder,
  AdminProduct,
} from "@/lib/admin-types";

export async function adminListProducts(params?: {
  categorySlug?: string;
}): Promise<AdminFetchResult<AdminProduct[]>> {
  const qs =
    params?.categorySlug != null && params.categorySlug !== ""
      ? `?categorySlug=${encodeURIComponent(params.categorySlug)}`
      : "";
  const res = await apiFetch(`${API_URL}/products/${qs}`);
  if (!res) return { ok: false, error: "Network error — is the API running?" };
  if (!res.ok)
    return { ok: false, error: `Products request failed (${res.status}).` };
  return { ok: true, data: await res.json() };
}

export async function adminListCategories(): Promise<
  AdminFetchResult<AdminCategory[]>
> {
  const res = await apiFetch(`${API_URL}/categories/`);
  if (!res) return { ok: false, error: "Network error — is the API running?" };
  if (!res.ok)
    return { ok: false, error: `Categories request failed (${res.status}).` };
  return { ok: true, data: await res.json() };
}

export async function adminListOrders(
  token: string | null,
): Promise<AdminFetchResult<AdminOrder[]>> {
  const headers: HeadersInit = {};
  if (token) (headers as Record<string, string>).Authorization = `Bearer ${token}`;
  const res = await apiFetch(`${API_URL}/orders/`, { headers });
  if (!res) return { ok: false, error: "Network error — is the API running?" };
  if (res.status === 401 || res.status === 403) {
    return { ok: true, data: [], needsAuth: true };
  }
  if (!res.ok)
    return { ok: false, error: `Orders request failed (${res.status}).` };
  return { ok: true, data: await res.json(), needsAuth: false };
}
