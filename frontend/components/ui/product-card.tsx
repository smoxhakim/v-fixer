/**
 * ProductCard — M2 step 3 (2026-05-24).
 *
 * Server component. The single most-reused primitive in the migration —
 * targets 40+ instances across category browse, homepage rows, PDP
 * related-products, and search results. API surface kept minimal on
 * purpose; if a future use case needs more, build a different component
 * rather than adding props here.
 *
 * Visual reference:
 *   ~/.gstack/projects/smoxhakim-v-fixer/designs/category-pannes-20260518/finalized.html
 *
 * Routing note: the spec said /p/{slug}, but the actual wired route in
 * app/[locale]/product/[slug]/ is /product/{slug}. We default to the
 * working route; consumers can still override via `href`.
 *
 * Pretext-group API decision (option c, with explicit override):
 *   - Default `pretextGroup` = "product-card-title" works for the common
 *     case of "one card grid per page."
 *   - When a page has multiple grids that must NOT equalize heights with
 *     each other (e.g., homepage "Récemment ajoutés" vs "Best-selling"),
 *     the parent passes a distinct id per row.
 *   - No React Context, no client wrapper — keeps the card a server
 *     component, keeps the group ID greppable at the call site.
 */

import Image from "next/image";

import { Link } from "@/i18n/navigation";
import { resolveMediaSrc } from "@/lib/media-url";
import type { Product } from "@/lib/api";
import { formatCurrency } from "@/lib/format";

import styles from "./product-card.module.css";

const LOW_STOCK_THRESHOLD = 5;

export interface ProductCardProps {
  product: Product;
  /** Override the default `/product/{slug}` link. */
  href?: string;
  /** Show the stock dot + label row. Default true. */
  showStockDot?: boolean;
  /** Show the strikethrough former price. Default true (no-ops if no discountPrice). */
  showStrikethrough?: boolean;
  /** Photo well aspect. Default "4/5". Pass "1/1" for square wells. */
  aspectRatio?: string;
  /** Pretext group key — cards in the same group equalize title heights. */
  pretextGroup?: string;
  className?: string;
}

type StockState = "in" | "low" | "out";

function stockStateOf(stock: number): StockState {
  if (stock <= 0) return "out";
  if (stock < LOW_STOCK_THRESHOLD) return "low";
  return "in";
}

function stockLabelOf(state: StockState, stock: number): string {
  switch (state) {
    case "out": return "Rupture";
    case "low": return "Faible stock";
    case "in":  return `${stock} en stock`;
  }
}

export function ProductCard({
  product,
  href,
  showStockDot = true,
  showStrikethrough = true,
  aspectRatio = "4/5",
  pretextGroup = "product-card-title",
  className,
}: ProductCardProps) {
  const linkHref = href ?? `/product/${product.slug}`;
  const photo = product.images[0];
  const photoSrc = photo ? resolveMediaSrc(photo) : null;

  const stockState = stockStateOf(product.stock);
  const stockLabel = stockLabelOf(stockState, product.stock);

  const hasDiscount =
    showStrikethrough &&
    product.discountPrice != null &&
    product.discountPrice < product.price;
  const displayPrice = hasDiscount ? product.discountPrice! : product.price;
  const formerPrice = hasDiscount ? product.price : null;

  return (
    <Link
      href={linkHref}
      className={[styles.card, className].filter(Boolean).join(" ")}
    >
      <article>
        <div className={styles.imgWell} style={{ aspectRatio }}>
          {photoSrc ? (
            <Image
              src={photoSrc}
              alt={product.name}
              fill
              sizes="(max-width: 720px) 50vw, (max-width: 1200px) 25vw, 300px"
              style={{ objectFit: "contain" }}
            />
          ) : (
            <div className={styles.placeholder} aria-hidden>
              {product.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        <div className={styles.body}>
          <div className={styles.ref}>REF · {product.slug.toUpperCase()}</div>
          <h3
            className={styles.title}
            data-pretext
            data-pretext-group={pretextGroup}
          >
            {product.name}
          </h3>

          <div className={styles.priceRow}>
            <span className={styles.price}>{formatCurrency(displayPrice)}</span>
            {formerPrice != null ? (
              <span className={styles.priceWas}>
                {formatCurrency(formerPrice)}
              </span>
            ) : null}
          </div>

          {showStockDot ? (
            <div className={styles.stockRow}>
              <span className={styles.dot} data-state={stockState} aria-hidden />
              <span>{stockLabel}</span>
            </div>
          ) : null}
        </div>
      </article>
    </Link>
  );
}

export default ProductCard;
