import type { Category, Product } from "@/lib/api";
import { normalizeCategory, normalizeProduct } from "@/lib/api";

export type BestSellingCategory = Category;

export type BestSellingDisplayRow =
  | { kind: "product"; product: Product }
  | {
      kind: "category";
      category: BestSellingCategory;
      products: Product[];
      productCount: number;
    };

export type BestSellingInputRow = {
  kind: "product" | "category";
  productSlug?: string;
  categorySlug?: string;
};

/** Normalizes GET /api/home-best-selling/ for the storefront (camel or snake). */
export function normalizeHomeBestSellingResponse(
  raw: unknown,
): BestSellingDisplayRow[] {
  if (!raw || typeof raw !== "object") return [];
  const o = raw as Record<string, unknown>;
  const items = o.items as unknown;
  if (!Array.isArray(items)) return [];
  const out: BestSellingDisplayRow[] = [];
  for (const row of items) {
    if (!row || typeof row !== "object") continue;
    const r = row as Record<string, unknown>;
    const kind = r.kind === "category" ? "category" : "product";
    if (kind === "product" && r.product && typeof r.product === "object") {
      try {
        out.push({ kind: "product", product: normalizeProduct(r.product) });
      } catch (e) {
        console.warn("home-best-selling: dropping malformed product row", e);
      }
    } else if (
      kind === "category" &&
      r.category &&
      typeof r.category === "object"
    ) {
      const rawProducts = r.products as unknown;
      const products: Product[] = [];
      if (Array.isArray(rawProducts)) {
        for (const p of rawProducts) {
          try {
            products.push(normalizeProduct(p));
          } catch (e) {
            console.warn(
              "home-best-selling: dropping malformed nested product",
              e,
            );
          }
        }
      }
      const countRaw = r.productCount ?? r.product_count;
      const productCount =
        typeof countRaw === "number" && !Number.isNaN(countRaw)
          ? countRaw
          : products.length;
      try {
        out.push({
          kind: "category",
          category: normalizeCategory(r.category),
          products,
          productCount,
        });
      } catch (e) {
        console.warn("home-best-selling: dropping malformed category row", e);
      }
    }
  }
  return out;
}
