"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronDown, ChevronUp, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { AdminAuthBanner } from "@/components/admin/admin-auth-banner";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAdminToken } from "@/hooks/use-admin-token";
import {
  getCategories,
  getHomeBestSelling,
  getProducts,
  updateHomeBestSelling,
} from "@/lib/api";
import type { BestSellingDisplayRow, BestSellingInputRow } from "@/lib/home-best-selling";

function displayToInput(rows: BestSellingDisplayRow[]): BestSellingInputRow[] {
  return rows.map((r) =>
    r.kind === "product"
      ? { kind: "product", productSlug: r.product.slug, categorySlug: "" }
      : { kind: "category", productSlug: "", categorySlug: r.category.slug },
  );
}

const emptyRow = (): BestSellingInputRow => ({
  kind: "product",
  productSlug: "",
  categorySlug: "",
});

export default function AdminBestSellingPage() {
  const { token, hydrated } = useAdminToken();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [rows, setRows] = useState<BestSellingInputRow[]>([]);
  const [productSlugs, setProductSlugs] = useState<string[]>([]);
  const [categorySlugs, setCategorySlugs] = useState<{ slug: string; name: string }[]>(
    [],
  );

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [display, products, categories] = await Promise.all([
        getHomeBestSelling(),
        getProducts(),
        getCategories(),
      ]);
      setRows(
        display.length ? displayToInput(display) : [],
      );
      setProductSlugs(
        Array.isArray(products)
          ? products.map((p: { slug: string }) => p.slug).filter(Boolean)
          : [],
      );
      const catList = Array.isArray(categories) ? categories : [];
      setCategorySlugs(
        catList.map((c: { slug: string; name: string }) => ({
          slug: c.slug,
          name: c.name,
        })),
      );
    } catch {
      toast.error("Could not load best-selling data.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const setRow = (index: number, patch: Partial<BestSellingInputRow>) => {
    setRows((prev) =>
      prev.map((r, i) => (i === index ? { ...r, ...patch } : r)),
    );
  };

  const addRow = () => {
    setRows((prev) => {
      if (prev.length >= 30) return prev;
      const next = [...prev, emptyRow()];
      if (next.length === 1 && productSlugs[0]) {
        next[0] = { kind: "product", productSlug: productSlugs[0], categorySlug: "" };
      }
      return next;
    });
  };

  const removeRow = (i: number) => {
    setRows((prev) => prev.filter((_, j) => j !== i));
  };

  const moveRow = (i: number, dir: -1 | 1) => {
    setRows((prev) => {
      const j = i + dir;
      if (j < 0 || j >= prev.length) return prev;
      const copy = [...prev];
      [copy[i], copy[j]] = [copy[j], copy[i]];
      return copy;
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error("Sign in as admin to save.");
      return;
    }
    for (const r of rows) {
      if (r.kind === "product" && !(r.productSlug ?? "").trim()) {
        toast.error("Each product row must have a product selected.");
        return;
      }
      if (r.kind === "category" && !(r.categorySlug ?? "").trim()) {
        toast.error("Each category row must have a category selected.");
        return;
      }
    }
    setSaving(true);
    try {
      await updateHomeBestSelling(rows, token);
      toast.success("Best selling section saved.");
      await load();
    } catch (err) {
      const msg =
        err instanceof Error && err.message.trim()
          ? err.message
          : "Could not save (check network and admin permissions).";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  if (!hydrated || loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="size-6 animate-spin" aria-hidden />
        <span className="text-sm">Loading…</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-24">
      <AdminPageHeader
        title="Best selling"
        description="Choose products and/or categories for the homepage “Best selling” grid. Order matches storefront left-to-right."
        actions={
          <Button variant="outline" size="sm" asChild>
            <Link href="/" target="_blank" rel="noopener noreferrer">
              View homepage
            </Link>
          </Button>
        }
      />

      {!token ? <AdminAuthBanner variant="write" /> : null}

      <Button variant="ghost" size="sm" className="-mt-2 gap-2" asChild>
        <Link href="/admin/dashboard">
          <ArrowLeft className="size-4" />
          Back to overview
        </Link>
      </Button>

      <form onSubmit={(e) => void handleSave(e)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Homepage grid items</CardTitle>
            <CardDescription>
              Up to 30 entries. Products show as product cards; categories show as browse tiles linking to the category page.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {rows.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No rows yet. Add a row and pick a product or category.
              </p>
            ) : (
              rows.map((row, i) => (
                <div
                  key={i}
                  className="flex flex-col gap-3 rounded-lg border bg-card p-4 sm:flex-row sm:items-end"
                >
                  <div className="grid flex-1 gap-3 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Type</Label>
                      <Select
                        value={row.kind}
                        onValueChange={(v) =>
                          setRow(i, {
                            kind: v as "product" | "category",
                            productSlug: v === "product" ? row.productSlug : "",
                            categorySlug: v === "category" ? row.categorySlug : "",
                          })
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="product">Product</SelectItem>
                          <SelectItem value="category">Category</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {row.kind === "product" ? (
                      <div className="space-y-2">
                        <Label>Product</Label>
                        <Select
                          value={row.productSlug || "__none__"}
                          onValueChange={(v) =>
                            setRow(i, {
                              productSlug: v === "__none__" ? "" : v,
                            })
                          }
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select product" />
                          </SelectTrigger>
                          <SelectContent className="max-h-72">
                            <SelectItem value="__none__">— Select —</SelectItem>
                            {productSlugs.map((slug) => (
                              <SelectItem key={slug} value={slug}>
                                {slug}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Label>Category</Label>
                        <Select
                          value={row.categorySlug || "__none__"}
                          onValueChange={(v) =>
                            setRow(i, {
                              categorySlug: v === "__none__" ? "" : v,
                            })
                          }
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent className="max-h-72">
                            <SelectItem value="__none__">— Select —</SelectItem>
                            {categorySlugs.map((c) => (
                              <SelectItem key={c.slug} value={c.slug}>
                                {c.name} ({c.slug})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-1 sm:flex-col">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      disabled={i === 0}
                      onClick={() => moveRow(i, -1)}
                      aria-label="Move up"
                    >
                      <ChevronUp className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      disabled={i === rows.length - 1}
                      onClick={() => moveRow(i, 1)}
                      aria-label="Move down"
                    >
                      <ChevronDown className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeRow(i)}
                      aria-label="Remove row"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-2"
              disabled={rows.length >= 30}
              onClick={addRow}
            >
              <Plus className="size-4" />
              Add row (max 30)
            </Button>
          </CardContent>
        </Card>

        <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-card/95 px-4 py-4 backdrop-blur-sm md:static md:z-0 md:border-0 md:bg-transparent md:p-0 md:backdrop-blur-none">
          <div className="mx-auto flex max-w-screen-2xl flex-wrap justify-end gap-3">
            <Button type="button" variant="outline" asChild>
              <Link href="/admin/dashboard">Cancel</Link>
            </Button>
            <Button type="submit" disabled={saving || !token}>
              {saving ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  Saving…
                </>
              ) : (
                "Save best selling"
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
