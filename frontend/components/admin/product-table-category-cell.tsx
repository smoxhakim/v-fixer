"use client";

import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

import { CategoryDropdownField } from "@/components/admin/mobile/category-dropdown-field";
import { useAdminToken } from "@/hooks/use-admin-token";
import type { AdminCategory, AdminProduct } from "@/lib/admin-types";
import { isAdminSessionExpiredErrorMessage, updateProductBySlug } from "@/lib/api";

function categoryIdFromProduct(
  product: AdminProduct,
  categories: AdminCategory[],
): number | null {
  if (product.categorySlug == null || product.categorySlug === "") return null;
  return categories.find((c) => c.slug === product.categorySlug)?.id ?? null;
}

export type ProductTableCategoryCellProps = {
  product: AdminProduct;
  categories: AdminCategory[];
  token: string | null;
  onSaved: () => void | Promise<void>;
};

/** Inline category change for desktop inventory table (saves on select). */
export function ProductTableCategoryCell({
  product,
  categories,
  token,
  onSaved,
}: ProductTableCategoryCellProps) {
  const { clearToken } = useAdminToken();
  const [saving, setSaving] = useState(false);

  const selectedId = useMemo(
    () => categoryIdFromProduct(product, categories),
    [product, categories],
  );

  const applyCategory = useCallback(
    async (nextId: number | null) => {
      if (!token) {
        toast.error("Add an admin token via /admin/login before mutating.");
        return;
      }
      if (nextId === selectedId) return;
      setSaving(true);
      try {
        await updateProductBySlug(product.slug, { category: nextId }, token);
        toast.success("Category updated");
        await onSaved();
      } catch (e) {
        const message =
          e instanceof Error && e.message.trim() ? e.message : "Could not update category.";
        toast.error(message);
        if (isAdminSessionExpiredErrorMessage(message)) clearToken();
      } finally {
        setSaving(false);
      }
    },
    [token, product.slug, selectedId, onSaved, clearToken],
  );

  return (
    <div className="flex min-w-[11rem] max-w-[16rem]">
      <CategoryDropdownField
        categories={categories}
        selectedId={selectedId}
        onSelect={(id) => void applyCategory(id)}
        disabled={!token || saving}
        triggerClassName="h-9 w-full min-w-0 text-sm shadow-sm"
      />
    </div>
  );
}
