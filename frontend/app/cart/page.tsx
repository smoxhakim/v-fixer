"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, ChevronRight, ShoppingCart } from "lucide-react";
import { useCart } from "@/context/cart-context";
import { formatCurrency } from "@/lib/format";
import { resolveMediaSrc } from "@/lib/media-url";

export default function CartPage() {
  const { items, removeItem, updateQty, subtotal, total } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-secondary mb-4">
          <ShoppingCart className="h-10 w-10 text-muted-foreground" />
        </div>
        <h1 className="text-xl font-bold text-foreground">Your cart is empty</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Looks like you have not added anything to your cart yet.
        </p>
        <Link
          href="/"
          className="mt-6 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-primary transition-colors">
            Home
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-foreground font-medium">Shopping Cart</span>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="text-2xl font-bold text-foreground mb-6">Shopping Cart</h1>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Cart items */}
          <div className="lg:col-span-2">
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              {/* Table header */}
              <div className="hidden md:grid grid-cols-12 gap-4 border-b border-border px-6 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <div className="col-span-6">Product</div>
                <div className="col-span-2 text-center">Price</div>
                <div className="col-span-2 text-center">Quantity</div>
                <div className="col-span-2 text-right">Total</div>
              </div>

              {items.map((item) => {
                const price =
                  item.product.discountPrice ?? item.product.price;
                return (
                  <div
                    key={item.product.id}
                    className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center border-b border-border px-4 md:px-6 py-4 last:border-0"
                  >
                    {/* Product */}
                    <div className="md:col-span-6 flex items-center gap-4">
                      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-secondary">
                        {item.product.images?.[0] ? (
                        <Image
                          src={resolveMediaSrc(item.product.images[0])}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                        ) : null}
                      </div>
                      <div>
                        <Link
                          href={`/product/${item.product.slug}`}
                          className="text-sm font-semibold text-foreground hover:text-primary transition-colors line-clamp-2"
                        >
                          {item.product.name}
                        </Link>
                        <p className="mt-0.5 text-xs text-muted-foreground capitalize">
                          {item.product.categorySlug
                            ? item.product.categorySlug.replace("-", " ")
                            : "Uncategorized"}
                        </p>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="md:col-span-2 text-center">
                      <span className="text-sm font-medium text-foreground md:text-center">
                        {formatCurrency(price)}
                      </span>
                    </div>

                    {/* Quantity */}
                    <div className="md:col-span-2 flex justify-center">
                      <div className="flex items-center rounded-lg border border-border">
                        <button
                          onClick={() =>
                            updateQty(item.product.id, item.quantity - 1)
                          }
                          className="flex h-8 w-8 items-center justify-center text-foreground hover:bg-secondary transition-colors rounded-l-lg"
                          aria-label="Decrease"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="flex h-8 w-10 items-center justify-center text-xs font-medium text-foreground border-x border-border">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQty(item.product.id, item.quantity + 1)
                          }
                          className="flex h-8 w-8 items-center justify-center text-foreground hover:bg-secondary transition-colors rounded-r-lg"
                          aria-label="Increase"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>

                    {/* Total + remove */}
                    <div className="md:col-span-2 flex items-center justify-end gap-3">
                      <span className="text-sm font-bold text-foreground">
                        {formatCurrency(price * item.quantity)}
                      </span>
                      <button
                        onClick={() => removeItem(item.product.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        aria-label={`Remove ${item.product.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4">
              <Link
                href="/"
                className="text-sm text-primary hover:underline"
              >
                {"← Continue Shopping"}
              </Link>
            </div>
          </div>

          {/* Summary */}
          <div>
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="text-lg font-bold text-foreground mb-4">
                Order Summary
              </h2>
              <div className="flex flex-col gap-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium text-foreground">
                    {formatCurrency(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-medium text-green-600">Free</span>
                </div>
                <div className="border-t border-border pt-3 flex justify-between">
                  <span className="font-bold text-foreground">Total</span>
                  <span className="text-lg font-bold text-primary">
                    {formatCurrency(total)}
                  </span>
                </div>
              </div>
              <Link
                href="/checkout"
                className="mt-6 flex w-full items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
              >
                Proceed to Checkout
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
