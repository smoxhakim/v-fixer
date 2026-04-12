import type { AdminOrder, AdminProduct } from "@/lib/admin-types";

export const LOW_STOCK_THRESHOLD = 5;

export function parseMoney(v: string | number | undefined | null): number {
  if (v === undefined || v === null) return 0;
  const n = typeof v === "number" ? v : Number.parseFloat(String(v));
  return Number.isFinite(n) ? n : 0;
}

export function totalRevenue(orders: AdminOrder[]): number {
  return orders.reduce((sum, o) => sum + parseMoney(o.total), 0);
}

export function pendingOrdersCount(orders: AdminOrder[]): number {
  return orders.filter((o) => o.status === "Pending").length;
}

export function lowStockProducts(products: AdminProduct[]): AdminProduct[] {
  return products.filter((p) => Number(p.stock) <= LOW_STOCK_THRESHOLD);
}
