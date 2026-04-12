"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle, Truck, Banknote } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { readLastOrderJson } from "@/lib/storage-keys";

interface OrderData {
  orderNumber: string;
  items: {
    product: {
      id: string;
      name: string;
      images: string[];
      price: number;
      discountPrice?: number;
    };
    quantity: number;
  }[];
  subtotal: number;
  total: number;
  shipping: {
    name: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    postalCode: string;
    notes: string;
  };
  date: string;
}

export default function OrderSuccessPage() {
  const [order, setOrder] = useState<OrderData | null>(null);

  useEffect(() => {
    try {
      const stored = readLastOrderJson();
      if (stored) {
        setOrder(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
  }, []);

  if (!order) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <h1 className="text-xl font-bold text-foreground">No order found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          It seems you have not placed an order yet.
        </p>
        <Link
          href="/"
          className="mt-6 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
        >
          Go Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-4 py-12">
        {/* Success header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            Order Placed Successfully!
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Thank you for your order. Your order number is:
          </p>
          <p className="mt-1 text-lg font-bold text-primary">
            {order.orderNumber}
          </p>
        </div>

        {/* COD notice */}
        <div className="rounded-xl border-2 border-primary/30 bg-primary/5 p-4 flex items-start gap-3 mb-6">
          <Banknote className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-bold text-foreground">
              Pay upon Delivery
            </h3>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              Please have{" "}
              <strong className="text-foreground">{formatCurrency(order.total)}</strong>{" "}
              ready when our delivery agent arrives. No advance payment is
              needed.
            </p>
          </div>
        </div>

        {/* Order items */}
        <div className="rounded-xl border border-border bg-card p-6 mb-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-foreground mb-4">
            Order Items
          </h2>
          <div className="flex flex-col gap-3">
            {order.items.map((item) => (
              <div key={item.product.id} className="flex items-center gap-3">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-secondary">
                  <Image
                    src={item.product.images[0]}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground line-clamp-1">
                    {item.product.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Qty: {item.quantity}
                  </p>
                </div>
                <span className="text-sm font-bold text-foreground shrink-0">
                  {formatCurrency(
                    (item.product.discountPrice ?? item.product.price) *
                      item.quantity
                  )}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 border-t border-border pt-4 flex flex-col gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium text-foreground">
                {formatCurrency(order.subtotal)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span className="font-medium text-green-600">Free</span>
            </div>
            <div className="border-t border-border pt-3 flex justify-between">
              <span className="font-bold text-foreground">Total</span>
              <span className="text-lg font-bold text-primary">
                {formatCurrency(order.total)}
              </span>
            </div>
          </div>
        </div>

        {/* Shipping address */}
        <div className="rounded-xl border border-border bg-card p-6 mb-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-foreground mb-4 flex items-center gap-2">
            <Truck className="h-4 w-4 text-primary" />
            Delivery Address
          </h2>
          <div className="text-sm text-muted-foreground leading-relaxed">
            <p className="font-medium text-foreground">{order.shipping.name}</p>
            <p>{order.shipping.address}</p>
            <p>
              {order.shipping.city}, {order.shipping.postalCode}
            </p>
            <p>Phone: {order.shipping.phone}</p>
            {order.shipping.email && <p>Email: {order.shipping.email}</p>}
            {order.shipping.notes && (
              <p className="mt-2 italic">Notes: {order.shipping.notes}</p>
            )}
          </div>
        </div>

        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="rounded-lg bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
