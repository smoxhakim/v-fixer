import type { Product } from "@/data/products";
import { normalizeProductImages } from "@/lib/media-url";

export type BestSellingCategory = {
  id: number;
  name: string;
  slug: string;
  imageUrl?: string;
};

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

function pickProduct(raw: Record<string, unknown>): Product {
  const images = Array.isArray(raw.images)
    ? (raw.images as unknown[]).map((u) => String(u))
    : [];
  const discountRaw = raw.discountPrice ?? raw.discount_price;
  return {
    id: String(raw.id ?? ""),
    name: String(raw.name ?? ""),
    slug: String(raw.slug ?? ""),
    categorySlug: String(
      raw.categorySlug ?? raw.category_slug ?? "",
    ),
    price: Number(raw.price ?? 0),
    discountPrice:
      discountRaw != null && discountRaw !== ""
        ? Number(discountRaw)
        : undefined,
    rating: Number(raw.rating ?? 0),
    images,
    shortDescription: String(
      raw.shortDescription ?? raw.short_description ?? "",
    ),
    description: String(raw.description ?? ""),
    specs: Array.isArray(raw.specs)
      ? (raw.specs as Product["specs"])
      : [],
    stock: Number(raw.stock ?? 0),
  };
}

function pickCategory(raw: Record<string, unknown>): BestSellingCategory {
  const img = raw.imageUrl ?? raw.image_url;
  return {
    id: Number(raw.id ?? 0),
    name: String(raw.name ?? ""),
    slug: String(raw.slug ?? ""),
    ...(typeof img === "string" && img.trim()
      ? { imageUrl: img.trim() }
      : {}),
  };
}

/** Normalizes GET /api/home-best-selling/ for the storefront (camel or snake). */
export function normalizeHomeBestSellingResponse(raw: unknown): BestSellingDisplayRow[] {
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
      const p = normalizeProductImages(
        pickProduct(r.product as Record<string, unknown>),
      );
      out.push({ kind: "product", product: p });
    } else if (
      kind === "category" &&
      r.category &&
      typeof r.category === "object"
    ) {
      const rawProducts = r.products as unknown;
      const products: Product[] = Array.isArray(rawProducts)
        ? (rawProducts as Record<string, unknown>[]).map((p) =>
            normalizeProductImages(pickProduct(p)),
          )
        : [];
      const countRaw = r.productCount ?? r.product_count;
      const productCount =
        typeof countRaw === "number" && !Number.isNaN(countRaw)
          ? countRaw
          : products.length;
      out.push({
        kind: "category",
        category: pickCategory(r.category as Record<string, unknown>),
        products,
        productCount,
      });
    }
  }
  return out;
}
