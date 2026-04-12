"use client";

import { useState } from "react";
import Image from "next/image";
import { Star, Minus, Plus, ShoppingCart, ChevronRight, Truck, ShieldCheck, RefreshCw } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { useCart } from "@/context/cart-context";
import type { Product } from "@/data/products";
import Link from "next/link";

export function ProductDetails({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [qty, setQty] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addItem(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-primary transition-colors">
            Home
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link
            href={`/category/${product.categorySlug}`}
            className="hover:text-primary transition-colors capitalize"
          >
            {product.categorySlug.replace("-", " ")}
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-foreground font-medium line-clamp-1">
            {product.name}
          </span>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Gallery */}
          <div>
            <div className="relative aspect-square overflow-hidden rounded-xl bg-secondary">
              <Image
                src={product.images[selectedImage]}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
              {product.discountPrice && (
                <span className="absolute top-3 left-3 rounded bg-destructive px-3 py-1 text-xs font-bold text-primary-foreground">
                  -{Math.round(((product.price - product.discountPrice) / product.price) * 100)}% OFF
                </span>
              )}
            </div>
            {product.images.length > 1 && (
              <div className="mt-3 flex gap-3">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`relative h-20 w-20 overflow-hidden rounded-lg border-2 transition-colors ${
                      i === selectedImage
                        ? "border-primary"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`${product.name} ${i + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <span className="text-xs uppercase tracking-wider text-muted-foreground">
              {product.categorySlug.replace("-", " ")}
            </span>
            <h1 className="mt-2 text-2xl font-bold text-foreground lg:text-3xl text-balance">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="mt-3 flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.floor(product.rating)
                      ? "fill-amber-400 text-amber-400"
                      : "fill-muted text-muted"
                  }`}
                />
              ))}
              <span className="ml-2 text-sm text-muted-foreground">
                ({product.rating} / 5)
              </span>
            </div>

            {/* Price */}
            <div className="mt-4 flex items-center gap-3">
              <span className="text-3xl font-bold text-primary">
                {formatCurrency(product.discountPrice ?? product.price)}
              </span>
              {product.discountPrice && (
                <span className="text-lg text-muted-foreground line-through">
                  {formatCurrency(product.price)}
                </span>
              )}
            </div>

            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              {product.description}
            </p>

            {/* Stock */}
            <div className="mt-4">
              <span
                className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                  product.stock > 0
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {product.stock > 0 ? `In Stock (${product.stock})` : "Out of Stock"}
              </span>
            </div>

            {/* Qty + Add to Cart */}
            <div className="mt-6 flex items-center gap-4">
              <div className="flex items-center rounded-lg border border-border">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="flex h-10 w-10 items-center justify-center text-foreground hover:bg-secondary transition-colors rounded-l-lg"
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="flex h-10 w-12 items-center justify-center text-sm font-medium text-foreground border-x border-border">
                  {qty}
                </span>
                <button
                  onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                  className="flex h-10 w-10 items-center justify-center text-foreground hover:bg-secondary transition-colors rounded-r-lg"
                  aria-label="Increase quantity"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <button
                onClick={handleAdd}
                disabled={product.stock === 0}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="h-4 w-4" />
                {added ? "Added to Cart!" : "Add to Cart"}
              </button>
            </div>

            {/* Specs */}
            {product.specs.length > 0 && (
              <div className="mt-8">
                <h3 className="text-sm font-bold uppercase tracking-wider text-foreground mb-3">
                  Specifications
                </h3>
                <div className="rounded-lg border border-border overflow-hidden">
                  {product.specs.map((spec, i) => (
                    <div
                      key={spec.label}
                      className={`flex items-center gap-4 px-4 py-2.5 text-sm ${
                        i % 2 === 0 ? "bg-card" : "bg-secondary"
                      }`}
                    >
                      <span className="w-32 shrink-0 font-medium text-foreground">
                        {spec.label}
                      </span>
                      <span className="text-muted-foreground">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Trust */}
            <div className="mt-8 grid grid-cols-3 gap-4">
              <div className="flex flex-col items-center text-center gap-1">
                <Truck className="h-5 w-5 text-primary" />
                <span className="text-[10px] text-muted-foreground">Free Delivery</span>
              </div>
              <div className="flex flex-col items-center text-center gap-1">
                <ShieldCheck className="h-5 w-5 text-primary" />
                <span className="text-[10px] text-muted-foreground">Secure Payment</span>
              </div>
              <div className="flex flex-col items-center text-center gap-1">
                <RefreshCw className="h-5 w-5 text-primary" />
                <span className="text-[10px] text-muted-foreground">1 Year Warranty</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
