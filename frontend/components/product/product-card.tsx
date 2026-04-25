"use client";

import Link from "next/link";
import Image from "next/image";
import { Star, ShoppingCart } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { useCart } from "@/context/cart-context";
import type { Product } from "@/data/products";
import { resolveMediaSrc } from "@/lib/media-url";

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const thumb = product.images?.[0] ? resolveMediaSrc(product.images[0]) : "";

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow">
      <Link
        href={`/product/${product.slug}`}
        className="relative aspect-square overflow-hidden bg-secondary"
      >
        {thumb ? (
        <Image
          src={thumb}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 50vw, 25vw"
        />
        ) : (
          <div className="flex h-full min-h-[160px] items-center justify-center bg-muted text-xs text-muted-foreground">
            No image
          </div>
        )}
        {product.discountPrice && (
          <span className="absolute top-2 left-2 rounded bg-destructive px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
            -{Math.round(((product.price - product.discountPrice) / product.price) * 100)}%
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col p-3">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
          {product.categorySlug
            ? product.categorySlug.replace("-", " ")
            : "Uncategorized"}
        </span>
        <Link
          href={`/product/${product.slug}`}
          className="mt-1 text-sm font-semibold text-foreground line-clamp-2 hover:text-primary transition-colors"
        >
          {product.name}
        </Link>
        <div className="mt-1.5 flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`h-3 w-3 ${
                i < Math.floor(product.rating)
                  ? "fill-amber-400 text-amber-400"
                  : "fill-muted text-muted"
              }`}
            />
          ))}
          <span className="ml-1 text-[10px] text-muted-foreground">
            ({product.rating})
          </span>
        </div>
        <div className="mt-auto pt-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-primary">
              {formatCurrency(product.discountPrice ?? product.price)}
            </span>
            {product.discountPrice && (
              <span className="text-xs text-muted-foreground line-through">
                {formatCurrency(product.price)}
              </span>
            )}
          </div>
          <button
            onClick={() => addItem(product)}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
            aria-label={`Add ${product.name} to cart`}
          >
            <ShoppingCart className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
