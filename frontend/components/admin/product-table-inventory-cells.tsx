"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAdminToken } from "@/hooks/use-admin-token";
import type { AdminProduct } from "@/lib/admin-types";
import { parsePriceInput, parseStockInput } from "@/lib/admin-product-input";
import { isAdminSessionExpiredErrorMessage, updateProductBySlug } from "@/lib/api";

type OnSaved = () => void | Promise<void>;

export function ProductTablePriceCell({
  product,
  token,
  onSaved,
}: {
  product: AdminProduct;
  token: string | null;
  onSaved: OnSaved;
}) {
  const t = useTranslations("AdminProducts");
  const { clearToken } = useAdminToken();
  const [priceStr, setPriceStr] = useState(() => String(product.price ?? ""));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setPriceStr(String(product.price ?? ""));
  }, [product.id, product.slug, product.price]);

  const commit = useCallback(async () => {
    if (!token) {
      toast.error(t("toastNeedToken"));
      return;
    }
    const trimmed = priceStr.trim();
    if (trimmed === String(product.price ?? "").trim()) return;
    const parsed = parsePriceInput(priceStr);
    if (parsed === null || parsed < 0) {
      toast.error(t("toastPriceInvalid"));
      setPriceStr(String(product.price ?? ""));
      return;
    }
    setSaving(true);
    try {
      await updateProductBySlug(product.slug, { price: parsed }, token);
      toast.success(t("toastPriceUpdated"));
      await onSaved();
    } catch (e) {
      const message =
        e instanceof Error && e.message.trim() ? e.message : t("toastPriceUpdateFailed");
      toast.error(message);
      if (isAdminSessionExpiredErrorMessage(message)) clearToken();
      setPriceStr(String(product.price ?? ""));
    } finally {
      setSaving(false);
    }
  }, [token, priceStr, product.price, product.slug, onSaved, t, clearToken]);

  return (
    <Input
      type="text"
      inputMode="decimal"
      autoComplete="off"
      disabled={!token || saving}
      className="h-9 w-full min-w-0 tabular-nums text-end text-sm"
      value={priceStr}
      onChange={(e) => setPriceStr(e.target.value)}
      onBlur={() => void commit()}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          (e.target as HTMLInputElement).blur();
        }
      }}
      aria-label={`${t("colPrice")} — ${product.name}`}
    />
  );
}

export function ProductTableStockCell({
  product,
  token,
  onSaved,
}: {
  product: AdminProduct;
  token: string | null;
  onSaved: OnSaved;
}) {
  const t = useTranslations("AdminProducts");
  const { clearToken } = useAdminToken();
  const [stockStr, setStockStr] = useState(() => String(product.stock ?? "0"));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setStockStr(String(product.stock ?? "0"));
  }, [product.id, product.slug, product.stock]);

  const commit = useCallback(async () => {
    if (!token) {
      toast.error(t("toastNeedToken"));
      return;
    }
    if (stockStr.trim() === String(product.stock ?? "0").trim()) return;
    const parsed = parseStockInput(stockStr);
    if (!parsed.ok) {
      toast.error(t("toastStockInvalid"));
      setStockStr(String(product.stock ?? "0"));
      return;
    }
    setSaving(true);
    try {
      await updateProductBySlug(product.slug, { stock: parsed.value }, token);
      toast.success(t("toastStockUpdated"));
      await onSaved();
    } catch (e) {
      const message =
        e instanceof Error && e.message.trim() ? e.message : t("toastStockUpdateFailed");
      toast.error(message);
      if (isAdminSessionExpiredErrorMessage(message)) clearToken();
      setStockStr(String(product.stock ?? "0"));
    } finally {
      setSaving(false);
    }
  }, [token, stockStr, product.stock, product.slug, onSaved, t, clearToken]);

  return (
    <Input
      type="text"
      inputMode="numeric"
      autoComplete="off"
      disabled={!token || saving}
      className="h-9 w-full min-w-0 tabular-nums text-end text-sm"
      value={stockStr}
      onChange={(e) => setStockStr(e.target.value)}
      onBlur={() => void commit()}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          (e.target as HTMLInputElement).blur();
        }
      }}
      aria-label={`${t("colStock")} — ${product.name}`}
    />
  );
}

/** Availability from stock: in stock vs out of stock (no separate API field). */
export function ProductTableAvailabilityCell({
  product,
  token,
  onSaved,
}: {
  product: AdminProduct;
  token: string | null;
  onSaved: OnSaved;
}) {
  const t = useTranslations("AdminProducts");
  const { clearToken } = useAdminToken();
  const [saving, setSaving] = useState(false);
  const stockNum = Number(product.stock ?? 0);
  const value = stockNum === 0 ? "out" : "in";

  const apply = useCallback(
    async (next: "in" | "out") => {
      if (!token) {
        toast.error(t("toastNeedToken"));
        return;
      }
      if (next === "out" && stockNum === 0) return;
      if (next === "in" && stockNum > 0) return;

      const body = next === "out" ? { stock: 0 } : { stock: 1 };
      setSaving(true);
      try {
        await updateProductBySlug(product.slug, body, token);
        toast.success(
          next === "in" && stockNum === 0 ? t("toastRestockedToOne") : t("toastAvailabilityUpdated"),
        );
        await onSaved();
      } catch (e) {
        const message =
          e instanceof Error && e.message.trim()
            ? e.message
            : t("toastAvailabilityUpdateFailed");
        toast.error(message);
        if (isAdminSessionExpiredErrorMessage(message)) clearToken();
      } finally {
        setSaving(false);
      }
    },
    [token, product.slug, stockNum, onSaved, t, clearToken],
  );

  return (
    <Select
      value={value}
      disabled={!token || saving}
      onValueChange={(v) => void apply(v as "in" | "out")}
    >
      <SelectTrigger
        className="h-9 w-full min-w-0 text-sm shadow-sm"
        aria-label={`${t("colStatus")} — ${product.name}`}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="in">{t("statusInStock")}</SelectItem>
        <SelectItem value="out">{t("statusOutOfStock")}</SelectItem>
      </SelectContent>
    </Select>
  );
}
