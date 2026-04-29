"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { CheckCircle, Truck, Banknote } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { resolveMediaSrc } from "@/lib/media-url";
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

function normalizeStoredOrder(raw: unknown): OrderData | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;

  const orderNumber = String(o.orderNumber ?? o.order_number ?? "");
  if (!orderNumber) return null;

  const shippingRaw = o.shipping;
  const shipping: OrderData["shipping"] =
    shippingRaw && typeof shippingRaw === "object"
      ? {
          name: String((shippingRaw as Record<string, unknown>).name ?? ""),
          phone: String((shippingRaw as Record<string, unknown>).phone ?? ""),
          email: String((shippingRaw as Record<string, unknown>).email ?? ""),
          address: String((shippingRaw as Record<string, unknown>).address ?? ""),
          city: String((shippingRaw as Record<string, unknown>).city ?? ""),
          postalCode: String(
            (shippingRaw as Record<string, unknown>).postalCode ??
              (shippingRaw as Record<string, unknown>).postal_code ??
              "",
          ),
          notes: String((shippingRaw as Record<string, unknown>).notes ?? ""),
        }
      : {
          name: String(o.name ?? ""),
          phone: String(o.phone ?? ""),
          email: String(o.email ?? ""),
          address: String(o.address ?? ""),
          city: String(o.city ?? ""),
          postalCode: String(o.postalCode ?? o.postal_code ?? ""),
          notes: String(o.notes ?? ""),
        };

  const itemsRaw = o.items;
  if (!Array.isArray(itemsRaw)) return null;

  const items: OrderData["items"] = itemsRaw.map((row: unknown) => {
    const r = row as Record<string, unknown>;
    const prod = r.product as Record<string, unknown> | undefined;
    if (prod && typeof prod === "object") {
      return {
        product: {
          id: String(prod.id ?? ""),
          name: String(prod.name ?? ""),
          images: Array.isArray(prod.images) ? (prod.images as string[]) : [],
          price: Number(prod.price ?? 0),
          discountPrice:
            prod.discountPrice != null ? Number(prod.discountPrice) : undefined,
        },
        quantity: Number(r.quantity ?? 1),
      };
    }
    const price = Number(r.price ?? 0);
    return {
      product: {
        id: String(r.productId ?? r.product_id ?? ""),
        name: "",
        images: [] as string[],
        price,
        discountPrice: undefined,
      },
      quantity: Number(r.quantity ?? 1),
    };
  });

  return {
    orderNumber,
    subtotal: Number(o.subtotal ?? 0),
    total: Number(o.total ?? 0),
    date: String(o.date ?? ""),
    items,
    shipping,
  };
}

export default function OrderSuccessPage() {
  const t = useTranslations("OrderSuccess");
  const [order, setOrder] = useState<OrderData | null>(null);

  useEffect(() => {
    try {
      const stored = readLastOrderJson();
      if (stored) {
        setOrder(normalizeStoredOrder(JSON.parse(stored)));
      }
    } catch {
      // ignore
    }
  }, []);

  if (!order) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <h1 className="text-xl font-bold text-foreground">{t("noOrder")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t("noOrderHint")}</p>
        <Link
          href="/"
          className="mt-6 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
        >
          {t("goShopping")}
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-4 py-12">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">{t("successTitle")}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{t("thankYou")}</p>
          <p className="mt-1 text-lg font-bold text-primary">{order.orderNumber}</p>
        </div>

        <div className="rounded-xl border-2 border-primary/30 bg-primary/5 p-4 flex items-start gap-3 mb-6">
          <Banknote className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-bold text-foreground">{t("codTitle")}</h3>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              {t("codHint", { amount: formatCurrency(order.total) })}
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 mb-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-foreground mb-4">
            {t("itemsTitle")}
          </h2>
          <div className="flex flex-col gap-3">
            {order.items.map((item) => (
              <div key={item.product.id} className="flex items-center gap-3">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-secondary">
                  {item.product.images?.[0] ? (
                    <Image
                      src={resolveMediaSrc(item.product.images[0])}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                      sizes="56px"
                    />
                  ) : null}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground line-clamp-1">
                    {item.product.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t("qty", { n: item.quantity })}
                  </p>
                </div>
                <span className="text-sm font-bold text-foreground shrink-0">
                  {formatCurrency(
                    (item.product.discountPrice ?? item.product.price) * item.quantity,
                  )}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 border-t border-border pt-4 flex flex-col gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("subtotal")}</span>
              <span className="font-medium text-foreground">
                {formatCurrency(order.subtotal)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("shippingLabel")}</span>
              <span className="font-medium text-green-600">{t("free")}</span>
            </div>
            <div className="border-t border-border pt-3 flex justify-between">
              <span className="font-bold text-foreground">{t("total")}</span>
              <span className="text-lg font-bold text-primary">{formatCurrency(order.total)}</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 mb-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-foreground mb-4 flex items-center gap-2">
            <Truck className="h-4 w-4 text-primary" />
            {t("deliveryTitle")}
          </h2>
          <div className="text-sm text-muted-foreground leading-relaxed">
            <p className="font-medium text-foreground">{order.shipping.name}</p>
            <p>{order.shipping.address}</p>
            <p>
              {order.shipping.city}, {order.shipping.postalCode}
            </p>
            <p>
              {t("phone")} {order.shipping.phone}
            </p>
            {order.shipping.email ? (
              <p>
                {t("email")} {order.shipping.email}
              </p>
            ) : null}
            {order.shipping.notes ? (
              <p className="mt-2 italic">
                {t("notes")} {order.shipping.notes}
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="rounded-lg bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
          >
            {t("continue")}
          </Link>
        </div>
      </div>
    </div>
  );
}
