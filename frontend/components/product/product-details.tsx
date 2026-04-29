"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Star,
  Minus,
  Plus,
  ShoppingCart,
  ChevronRight,
  Truck,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { formatCurrency } from "@/lib/format";
import { useCart } from "@/context/cart-context";
import type { Product } from "@/data/products";
import { resolveMediaSrc } from "@/lib/media-url";

export function ProductDetails({ product }: { product: Product }) {
  const t = useTranslations("ProductDetails");
  const tCat = useTranslations("CategoryPage");
  const { addItem } = useCart();
  const [qty, setQty] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [added, setAdded] = useState(false);
  const images = product.images ?? [];
  const mainSrc = images[selectedImage] ? resolveMediaSrc(images[selectedImage]) : "";
  const discountPct = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  const handleAdd = () => {
    addItem(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-primary transition-colors">
            {tCat("home")}
          </Link>
          <ChevronRight className="h-3.5 w-3.5 shrink-0" />
          {product.categorySlug ? (
            <Link
              href={`/category/${product.categorySlug}`}
              className="hover:text-primary transition-colors capitalize"
            >
              {product.categorySlug.replace("-", " ")}
            </Link>
          ) : (
            <span className="capitalize text-muted-foreground">{t("uncategorized")}</span>
          )}
          <ChevronRight className="h-3.5 w-3.5 shrink-0" />
          <span className="text-foreground font-medium line-clamp-1">{product.name}</span>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div>
            <div className="relative aspect-square overflow-hidden rounded-xl bg-secondary">
              {mainSrc ? (
                <Image
                  src={mainSrc}
                  alt={product.name}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              ) : (
                <div className="flex h-full min-h-[240px] items-center justify-center text-sm text-muted-foreground">
                  {t("noImage")}
                </div>
              )}
              {product.discountPrice ? (
                <span className="absolute top-3 start-3 rounded bg-destructive px-3 py-1 text-xs font-bold text-primary-foreground">
                  {t("discountOff", { percent: discountPct })}
                </span>
              ) : null}
            </div>
            {images.length > 1 ? (
              <div className="mt-3 flex gap-3">
                {images.map((img, i) => (
                  <button
                    key={`${img}-${i}`}
                    type="button"
                    onClick={() => setSelectedImage(i)}
                    className={`relative h-20 w-20 overflow-hidden rounded-lg border-2 transition-colors ${
                      i === selectedImage
                        ? "border-primary"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <Image
                      src={resolveMediaSrc(img)}
                      alt={`${product.name} ${i + 1}`}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div>
            <span className="text-xs uppercase tracking-wider text-muted-foreground">
              {product.categorySlug ? product.categorySlug.replace("-", " ") : t("uncategorized")}
            </span>
            <h1 className="mt-2 text-2xl font-bold text-foreground lg:text-3xl text-balance">
              {product.name}
            </h1>

            <div className="mt-3 flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.floor(Number(product.rating) || 0)
                      ? "fill-amber-400 text-amber-400"
                      : "fill-muted text-muted"
                  }`}
                />
              ))}
              <span className="ms-2 text-sm text-muted-foreground">
                {t("ratingOutOf", { rating: product.rating })}
              </span>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <span className="text-3xl font-bold text-primary">
                {formatCurrency(product.discountPrice ?? product.price)}
              </span>
              {product.discountPrice ? (
                <span className="text-lg text-muted-foreground line-through">
                  {formatCurrency(product.price)}
                </span>
              ) : null}
            </div>

            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{product.description}</p>

            <div className="mt-4">
              <span
                className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                  product.stock > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                }`}
              >
                {product.stock > 0 ? t("inStock", { count: product.stock }) : t("outOfStock")}
              </span>
            </div>

            <div className="mt-6 flex items-center gap-4">
              <div className="flex items-center rounded-lg border border-border">
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="flex h-10 w-10 items-center justify-center text-foreground hover:bg-secondary transition-colors rounded-s-lg"
                  aria-label={t("decreaseQty")}
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="flex h-10 w-12 items-center justify-center text-sm font-medium text-foreground border-x border-border">
                  {qty}
                </span>
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                  className="flex h-10 w-10 items-center justify-center text-foreground hover:bg-secondary transition-colors rounded-e-lg"
                  aria-label={t("increaseQty")}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <button
                type="button"
                onClick={handleAdd}
                disabled={product.stock === 0}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="h-4 w-4" />
                {added ? t("addedToCart") : t("addToCart")}
              </button>
            </div>

            {Array.isArray(product.specs) && product.specs.length > 0 ? (
              <div className="mt-8">
                <h3 className="text-sm font-bold uppercase tracking-wider text-foreground mb-3">
                  {t("specs")}
                </h3>
                <div className="rounded-lg border border-border overflow-hidden">
                  {product.specs.map((spec, i) => (
                    <div
                      key={spec.label}
                      className={`flex items-center gap-4 px-4 py-2.5 text-sm ${
                        i % 2 === 0 ? "bg-card" : "bg-secondary"
                      }`}
                    >
                      <span className="w-32 shrink-0 font-medium text-foreground">{spec.label}</span>
                      <span className="text-muted-foreground">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="mt-8 grid grid-cols-3 gap-4">
              <div className="flex flex-col items-center text-center gap-1">
                <Truck className="h-5 w-5 text-primary" />
                <span className="text-[10px] text-muted-foreground">{t("trustDelivery")}</span>
              </div>
              <div className="flex flex-col items-center text-center gap-1">
                <ShieldCheck className="h-5 w-5 text-primary" />
                <span className="text-[10px] text-muted-foreground">{t("trustSecure")}</span>
              </div>
              <div className="flex flex-col items-center text-center gap-1">
                <RefreshCw className="h-5 w-5 text-primary" />
                <span className="text-[10px] text-muted-foreground">{t("trustWarranty")}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
