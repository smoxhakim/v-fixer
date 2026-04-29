"use client";

import { useEffect, useState } from "react";
import { Copy, ExternalLink, Loader2, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { AdminBottomSheet } from "@/components/admin/mobile/admin-bottom-sheet";
import { CategoryDropdownField } from "@/components/admin/mobile/category-dropdown-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useAdminToken } from "@/hooks/use-admin-token";
import type { AdminCategory, AdminProduct } from "@/lib/admin-types";
import { isAdminSessionExpiredErrorMessage, updateProductBySlug } from "@/lib/api";
import { Link } from "@/i18n/navigation";

export type ProductBottomSheetProps = {
  product: AdminProduct;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: AdminCategory[];
  token: string | null;
  onPreview: (slug: string) => void;
  onDuplicate: (p: AdminProduct) => void | Promise<void>;
  duplicatingSlug: string | null;
  /** Opens delete confirmation; parent should close this sheet when showing the dialog. */
  onRequestDelete: (p: AdminProduct) => void;
  onCategorySaved: () => void | Promise<void>;
};

function categoryIdFromProduct(
  product: AdminProduct,
  categories: AdminCategory[],
): number | null {
  if (product.categorySlug == null || product.categorySlug === "") return null;
  return categories.find((c) => c.slug === product.categorySlug)?.id ?? null;
}

function parsePriceInput(raw: string): number | null {
  const n = Number(String(raw).trim().replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

export function ProductBottomSheet({
  product,
  open,
  onOpenChange,
  categories,
  token,
  onPreview,
  onDuplicate,
  duplicatingSlug,
  onRequestDelete,
  onCategorySaved,
}: ProductBottomSheetProps) {
  const { clearToken } = useAdminToken();
  const [pendingCategoryId, setPendingCategoryId] = useState<number | null>(null);
  const [baselineCategoryId, setBaselineCategoryId] = useState<number | null>(null);
  const [priceInput, setPriceInput] = useState("");
  const [baselinePriceStr, setBaselinePriceStr] = useState("");
  const [stockInput, setStockInput] = useState("");
  const [baselineStock, setBaselineStock] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    const catId = categoryIdFromProduct(product, categories);
    setPendingCategoryId(catId);
    setBaselineCategoryId(catId);
    setPriceInput(String(product.price ?? ""));
    setBaselinePriceStr(String(product.price ?? ""));
    setStockInput(String(product.stock ?? "0"));
    setBaselineStock(Number(product.stock ?? 0));
  }, [open, product.id, product.categorySlug, product.price, product.stock, categories]);

  const categoryDirty =
    (pendingCategoryId ?? null) !== (baselineCategoryId ?? null);

  const priceDirty =
    String(priceInput).trim() !== String(baselinePriceStr).trim();

  const stockDirty = stockInput.trim() !== String(baselineStock);

  const stockNum = Number(stockInput.trim());
  const stockParsable =
    stockInput.trim() !== "" &&
    Number.isFinite(stockNum) &&
    Number.isInteger(stockNum) &&
    stockNum >= 0;
  const stockInvalid = stockDirty && !stockParsable;

  const priceParsed = parsePriceInput(priceInput);
  const priceInvalid = priceDirty && (priceParsed === null || priceParsed < 0);

  const formDirty = categoryDirty || priceDirty || stockDirty;
  const formInvalid = priceInvalid || stockInvalid;

  const handleSave = async () => {
    if (!token) {
      toast.error("Add an admin token via /admin/login before mutating.");
      return;
    }
    if (!formDirty) return;

    if (priceInvalid) {
      toast.error("Enter a valid price (0 or greater).");
      return;
    }
    if (stockInvalid) {
      toast.error("Enter a valid whole number for stock (0 or greater).");
      return;
    }

    const body: Record<string, unknown> = {};
    if (categoryDirty) body.category = pendingCategoryId;
    if (priceDirty && priceParsed !== null) body.price = priceParsed;
    if (stockDirty && stockParsable) body.stock = stockNum;

    if (Object.keys(body).length === 0) return;

    setSaving(true);
    try {
      await updateProductBySlug(product.slug, body, token);
      toast.success("Product updated");
      await onCategorySaved();
      onOpenChange(false);
    } catch (e) {
      const message =
        e instanceof Error && e.message.trim()
          ? e.message
          : "Could not update product.";
      toast.error(message);
      if (isAdminSessionExpiredErrorMessage(message)) clearToken();
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminBottomSheet open={open} onOpenChange={onOpenChange}>
      <div className="shrink-0 border-b border-border px-4 pb-3 pt-1">
        <SheetTitle className="sr-only">{product.name}</SheetTitle>
        <p className="text-sm font-medium text-foreground">{product.name}</p>
        <p className="truncate text-xs text-muted-foreground">{product.slug}</p>
      </div>

      <div className="shrink-0 border-b border-border">
        <Link
          href={`/admin/dashboard/products/${encodeURIComponent(product.slug)}/edit`}
          className={cn(
            "flex min-h-11 w-full items-center gap-3 px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted",
            !token && "pointer-events-none opacity-50",
          )}
          onClick={() => onOpenChange(false)}
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-200">
            <Pencil className="size-4" aria-hidden />
          </span>
          Edit product
        </Link>
        <button
          type="button"
          className="flex min-h-11 w-full items-center gap-3 px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          onClick={() => onPreview(product.slug)}
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">
            <ExternalLink className="size-4" aria-hidden />
          </span>
          Preview on site
        </button>
        <button
          type="button"
          disabled={!token || duplicatingSlug === product.slug}
          className="flex min-h-11 w-full items-center gap-3 px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50"
          onClick={() => void onDuplicate(product)}
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200">
            {duplicatingSlug === product.slug ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <Copy className="size-4" aria-hidden />
            )}
          </span>
          Duplicate
        </button>
        <button
          type="button"
          disabled={!token}
          className="flex min-h-11 w-full items-center gap-3 px-4 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50"
          onClick={() => {
            onRequestDelete(product);
            onOpenChange(false);
          }}
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200">
            <Trash2 className="size-4" aria-hidden />
          </span>
          Delete
        </button>
      </div>

      <div className="shrink-0 space-y-4 border-t border-border px-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="sheet-product-category">Category</Label>
          <CategoryDropdownField
            id="sheet-product-category"
            categories={categories}
            selectedId={pendingCategoryId}
            onSelect={setPendingCategoryId}
            disabled={!token}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sheet-product-price">Price</Label>
          <Input
            id="sheet-product-price"
            type="text"
            inputMode="decimal"
            className="h-11"
            value={priceInput}
            onChange={(e) => setPriceInput(e.target.value)}
            disabled={!token}
            autoComplete="off"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sheet-product-stock">Stock</Label>
          <Input
            id="sheet-product-stock"
            type="text"
            inputMode="numeric"
            className="h-11"
            value={stockInput}
            onChange={(e) => setStockInput(e.target.value)}
            disabled={!token}
            autoComplete="off"
          />
        </div>
      </div>

      {formDirty ? (
        <div className="shrink-0 border-t border-border px-4 pt-3">
          <Button
            type="button"
            className="w-full"
            disabled={saving || !token || formInvalid}
            onClick={() => void handleSave()}
          >
            {saving ? (
              <span className="inline-flex items-center justify-center gap-2">
                <Loader2 className="size-4 animate-spin" aria-hidden />
                Saving…
              </span>
            ) : (
              "Save changes"
            )}
          </Button>
        </div>
      ) : null}
    </AdminBottomSheet>
  );
}
