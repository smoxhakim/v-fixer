/** Types for admin UI aligned with DRF + djangorestframework-camel-case JSON. */

export interface AdminCategory {
  id: number;
  name: string;
  slug: string;
  icon?: string | null;
  parent?: number | null;
}

export interface AdminProduct {
  id: number;
  name: string;
  slug: string;
  categorySlug?: string;
  price: string | number;
  discountPrice?: string | number | null;
  rating?: string | number;
  images?: string[];
  shortDescription?: string | null;
  description?: string | null;
  specs?: unknown;
  stock: number;
}

export interface AdminOrderItem {
  productId: number;
  quantity: number;
  price: string | number;
}

export interface AdminOrder {
  id: string;
  orderNumber: string;
  name: string;
  phone: string;
  email?: string | null;
  address: string;
  city: string;
  postalCode?: string | null;
  notes?: string | null;
  subtotal: string | number;
  total: string | number;
  date: string;
  status: string;
  items: AdminOrderItem[];
}

export type AdminFetchResult<T> =
  | { ok: true; data: T; needsAuth?: boolean }
  | { ok: false; error: string; needsAuth?: boolean };
