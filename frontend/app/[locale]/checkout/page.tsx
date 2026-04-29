"use client";

import { useState } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { ChevronRight, Banknote, ShieldCheck } from "lucide-react";
import { useCart } from "@/context/cart-context";
import { formatCurrency } from "@/lib/format";
import { createOrder } from "@/lib/api";
import { toast } from "sonner";
import { resolveMediaSrc } from "@/lib/media-url";
import { writeLastOrderJson } from "@/lib/storage-keys";

interface FormData {
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  postalCode: string;
  notes: string;
}

interface FormErrors {
  [key: string]: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const t = useTranslations("Checkout");
  const tCat = useTranslations("CategoryPage");
  const tErr = useTranslations("Errors");
  const { items, subtotal, total, clearCart } = useCart();
  const [form, setForm] = useState<FormData>({
    name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    postalCode: "",
    notes: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!form.name.trim()) newErrors.name = t("errName");
    if (!form.phone.trim()) newErrors.phone = t("errPhone");
    if (!form.address.trim()) newErrors.address = t("errAddress");
    if (!form.city.trim()) newErrors.city = t("errCity");
    if (!form.postalCode.trim()) newErrors.postalCode = t("errPostal");
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim() || null,
      address: form.address.trim(),
      city: form.city.trim(),
      postalCode: form.postalCode.trim(),
      notes: form.notes.trim() || null,
      subtotal,
      total,
      items: items.map((i) => ({
        productId: i.product.id,
        quantity: i.quantity,
      })),
    };

    try {
      const order = await createOrder(payload);
      const displayPayload = {
        orderNumber: String(
          (order as { orderNumber?: string }).orderNumber ??
            (order as { order_number?: string }).order_number ??
            "",
        ),
        subtotal: Number((order as { subtotal?: number }).subtotal ?? subtotal),
        total: Number((order as { total?: number }).total ?? total),
        date: String((order as { date?: string }).date ?? ""),
        items: items.map((i) => ({
          product: {
            id: String(i.product.id),
            name: i.product.name,
            images: i.product.images ?? [],
            price: Number(i.product.price),
            discountPrice:
              i.product.discountPrice != null ? Number(i.product.discountPrice) : undefined,
          },
          quantity: i.quantity,
        })),
        shipping: {
          name: form.name.trim(),
          phone: form.phone.trim(),
          email: form.email.trim(),
          address: form.address.trim(),
          city: form.city.trim(),
          postalCode: form.postalCode.trim(),
          notes: form.notes.trim(),
        },
      };
      writeLastOrderJson(JSON.stringify(displayPayload));
      clearCart();
      router.push("/order/success");
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : tErr("orderFailed");
      toast.error(message);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <h1 className="text-xl font-bold text-foreground">{t("emptyCart")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t("emptyHint")}</p>
        <Link
          href="/"
          className="mt-6 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
        >
          {t("continueShopping")}
        </Link>
      </div>
    );
  }

  const req = t("requiredMarker");

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-primary transition-colors">
            {tCat("home")}
          </Link>
          <ChevronRight className="h-3.5 w-3.5 shrink-0" />
          <Link href="/cart" className="hover:text-primary transition-colors">
            {t("breadcrumbCart")}
          </Link>
          <ChevronRight className="h-3.5 w-3.5 shrink-0" />
          <span className="text-foreground font-medium">{t("title")}</span>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="text-2xl font-bold text-foreground mb-6">{t("title")}</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="rounded-xl border border-border bg-card p-6">
                <h2 className="text-lg font-bold text-foreground mb-4">{t("shippingHeading")}</h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1">
                      {t("fullName")} <span className="text-destructive">{req}</span>
                    </label>
                    <input
                      id="name"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      className={`w-full rounded-lg border px-4 py-2.5 text-sm text-foreground bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
                        errors.name ? "border-destructive" : "border-border"
                      }`}
                    />
                    {errors.name ? (
                      <p className="mt-1 text-xs text-destructive">{errors.name}</p>
                    ) : null}
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-1">
                      {t("phone")} <span className="text-destructive">{req}</span>
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={form.phone}
                      onChange={handleChange}
                      className={`w-full rounded-lg border px-4 py-2.5 text-sm text-foreground bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
                        errors.phone ? "border-destructive" : "border-border"
                      }`}
                    />
                    {errors.phone ? (
                      <p className="mt-1 text-xs text-destructive">{errors.phone}</p>
                    ) : null}
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
                      {t("emailOptional")}
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-border px-4 py-2.5 text-sm text-foreground bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor="address" className="block text-sm font-medium text-foreground mb-1">
                      {t("address")} <span className="text-destructive">{req}</span>
                    </label>
                    <input
                      id="address"
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      className={`w-full rounded-lg border px-4 py-2.5 text-sm text-foreground bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
                        errors.address ? "border-destructive" : "border-border"
                      }`}
                    />
                    {errors.address ? (
                      <p className="mt-1 text-xs text-destructive">{errors.address}</p>
                    ) : null}
                  </div>

                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-foreground mb-1">
                      {t("city")} <span className="text-destructive">{req}</span>
                    </label>
                    <input
                      id="city"
                      name="city"
                      value={form.city}
                      onChange={handleChange}
                      className={`w-full rounded-lg border px-4 py-2.5 text-sm text-foreground bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
                        errors.city ? "border-destructive" : "border-border"
                      }`}
                    />
                    {errors.city ? (
                      <p className="mt-1 text-xs text-destructive">{errors.city}</p>
                    ) : null}
                  </div>

                  <div>
                    <label htmlFor="postalCode" className="block text-sm font-medium text-foreground mb-1">
                      {t("postalCode")} <span className="text-destructive">{req}</span>
                    </label>
                    <input
                      id="postalCode"
                      name="postalCode"
                      value={form.postalCode}
                      onChange={handleChange}
                      className={`w-full rounded-lg border px-4 py-2.5 text-sm text-foreground bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
                        errors.postalCode ? "border-destructive" : "border-border"
                      }`}
                    />
                    {errors.postalCode ? (
                      <p className="mt-1 text-xs text-destructive">{errors.postalCode}</p>
                    ) : null}
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor="notes" className="block text-sm font-medium text-foreground mb-1">
                      {t("notesLabel")}
                    </label>
                    <textarea
                      id="notes"
                      name="notes"
                      value={form.notes}
                      onChange={handleChange}
                      rows={3}
                      placeholder={t("notesPlaceholder")}
                      className="w-full rounded-lg border border-border px-4 py-2.5 text-sm text-foreground bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded-xl border border-border bg-card p-6">
                <h2 className="text-lg font-bold text-foreground mb-4">{t("paymentMethodHeading")}</h2>
                <div className="rounded-lg border-2 border-primary bg-primary/5 p-4 flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Banknote className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">{t("cod")}</h3>
                    <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{t("codDetail")}</p>
                  </div>
                  <ShieldCheck className="h-5 w-5 text-primary shrink-0 ms-auto" />
                </div>
              </div>
            </div>

            <div>
              <div className="rounded-xl border border-border bg-card p-6 sticky top-28">
                <h2 className="text-lg font-bold text-foreground mb-4">{t("orderSummary")}</h2>

                <div className="flex flex-col gap-3 max-h-60 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.product.id} className="flex items-center gap-3">
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-secondary">
                        {item.product.images?.[0] ? (
                          <Image
                            src={resolveMediaSrc(item.product.images[0])}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        ) : null}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground line-clamp-1">
                          {item.product.name}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {t("qtyLine", { quantity: item.quantity })}
                        </p>
                      </div>
                      <span className="text-xs font-bold text-foreground shrink-0">
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
                    <span className="font-medium text-foreground">{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("shipping")}</span>
                    <span className="font-medium text-green-600">{t("free")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("paymentTitle")}</span>
                    <span className="font-medium text-foreground">{t("paymentCodLabel")}</span>
                  </div>
                  <div className="border-t border-border pt-3 flex justify-between">
                    <span className="font-bold text-foreground">{t("total")}</span>
                    <span className="text-lg font-bold text-primary">{formatCurrency(total)}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="mt-6 flex w-full items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
                >
                  {t("placeOrder")}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
