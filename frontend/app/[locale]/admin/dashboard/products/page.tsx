"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  Copy,
  ExternalLink,
  Loader2,
  MoreHorizontal,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { AdminAuthBanner } from "@/components/admin/admin-auth-banner";
import { AdminEmptyState } from "@/components/admin/admin-empty-state";
import { AdminErrorState } from "@/components/admin/admin-error-state";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useAdminToken } from "@/hooks/use-admin-token";
import {
  adminListCategories,
  adminListProducts,
} from "@/lib/admin-queries";
import type { AdminCategory, AdminProduct } from "@/lib/admin-types";
import { createProduct, deleteProductBySlug } from "@/lib/api";
import { resolveMediaSrc } from "@/lib/media-url";
import { MobileProductCard } from "@/components/admin/mobile/mobile-product-card";
import { ProductBottomSheet } from "@/components/admin/mobile/product-bottom-sheet";
import { ProductTableCategoryCell } from "@/components/admin/product-table-category-cell";
import {
  ProductTableAvailabilityCell,
  ProductTablePriceCell,
  ProductTableStockCell,
} from "@/components/admin/product-table-inventory-cells";

const NO_CATEGORY_VALUE = "__none__";

function categoryIdFromForm(raw: string): number | null {
  if (!raw || raw === NO_CATEGORY_VALUE) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

export default function AdminProductsPage() {
  const { token, hydrated } = useAdminToken();
  const tInv = useTranslations("AdminProducts");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);

  const [createOpen, setCreateOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [newProduct, setNewProduct] = useState({
    name: "",
    slug: "",
    categoryId: "",
    price: "",
    discountPrice: "",
    stock: "0",
    shortDescription: "",
    description: "",
    imageUrl: "",
  });

  const [deleteTarget, setDeleteTarget] = useState<AdminProduct | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);
  const [duplicatingSlug, setDuplicatingSlug] = useState<string | null>(null);
  const [sheetProduct, setSheetProduct] = useState<AdminProduct | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const [pr, cr] = await Promise.all([
      adminListProducts(),
      adminListCategories(),
    ]);
    if (!pr.ok) setError(pr.error);
    setProducts(pr.ok ? pr.data : []);
    setCategories(cr.ok ? cr.data : []);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error("Add an admin token via /admin/login before mutating.");
      return;
    }
    const catId = categoryIdFromForm(newProduct.categoryId);
    if (newProduct.categoryId && newProduct.categoryId !== NO_CATEGORY_VALUE && catId === null) {
      toast.error("Invalid category.");
      return;
    }
    setSaving(true);
    try {
      await createProduct(
        {
          name: newProduct.name.trim(),
          slug: newProduct.slug.trim(),
          category: catId,
          price: Number(newProduct.price),
          discountPrice: newProduct.discountPrice
            ? Number(newProduct.discountPrice)
            : null,
          stock: Number(newProduct.stock),
          shortDescription: newProduct.shortDescription.trim() || null,
          description: newProduct.description.trim() || null,
          images: newProduct.imageUrl.trim()
            ? [newProduct.imageUrl.trim()]
            : [],
          rating: 0,
        },
        token,
      );
      toast.success("Product created");
      setNewProduct({
        name: "",
        slug: "",
        categoryId: "",
        price: "",
        discountPrice: "",
        stock: "0",
        shortDescription: "",
        description: "",
        imageUrl: "",
      });
      await load();
    } catch {
      toast.error("Could not create product (check API + permissions).");
    } finally {
      setSaving(false);
    }
  };

  const openStorefrontPreview = (slug: string) => {
    const path = `/product/${encodeURIComponent(slug)}`;
    if (typeof window !== "undefined") {
      window.open(path, "_blank", "noopener,noreferrer");
    }
  };

  const handleDuplicate = async (p: AdminProduct) => {
    if (!token) {
      toast.error("Add an admin token via /admin/login before mutating.");
      return;
    }
    const cat = p.categorySlug
      ? categories.find((c) => c.slug === p.categorySlug)
      : undefined;
    const newSlug = `${p.slug}-copy-${Date.now().toString(36)}`;
    setDuplicatingSlug(p.slug);
    try {
      await createProduct(
        {
          name: `${p.name} (copy)`,
          slug: newSlug,
          category: cat?.id ?? null,
          price: Number(p.price),
          discountPrice:
            p.discountPrice !== undefined && p.discountPrice !== null
              ? Number(p.discountPrice)
              : null,
          stock: Number(p.stock),
          shortDescription: p.shortDescription ?? null,
          description: p.description ?? null,
          images: Array.isArray(p.images) ? [...p.images] : [],
          rating: Number(p.rating ?? 0),
        },
        token,
      );
      toast.success("Duplicate created");
      setSheetProduct(null);
      await load();
    } catch {
      toast.error("Could not duplicate product.");
    } finally {
      setDuplicatingSlug(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget || !token) return;
    setDeleteSubmitting(true);
    try {
      await deleteProductBySlug(deleteTarget.slug, token);
      toast.success("Product deleted");
      setDeleteTarget(null);
      setSheetProduct(null);
      await load();
    } catch {
      toast.error("Could not delete product.");
    } finally {
      setDeleteSubmitting(false);
    }
  };

  if (!hydrated || loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="size-6 animate-spin" aria-hidden />
        <span className="text-sm">Loading products…</span>
      </div>
    );
  }

  if (error && products.length === 0) {
    return <AdminErrorState message={error} onRetry={() => void load()} />;
  }

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Products"
        description="Manage catalog items. On desktop, price and stock save when you leave the field or press Enter; availability (in stock / out) updates stock via the API."
        actions={
          <Button type="button" variant="outline" size="sm" onClick={() => void load()}>
            Refresh
          </Button>
        }
      />

      {!token ? <AdminAuthBanner variant="write" /> : null}

      {error ? (
        <AdminErrorState
          title="Partial load"
          message={error}
          onRetry={() => void load()}
        />
      ) : null}

      <Card>
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Add product</CardTitle>
            <CardDescription>
              Slug must stay URL-safe. Primary image is stored as the first entry in{" "}
              <code className="text-xs">images</code>.
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="self-start sm:self-auto"
            onClick={() => setCreateOpen((v) => !v)}
          >
            {createOpen ? "Hide form" : "Show form"}
          </Button>
        </CardHeader>
        {createOpen ? (
          <CardContent>
            <form className="grid gap-4 md:grid-cols-2" onSubmit={handleCreate}>
              <div className="space-y-2">
                <Label htmlFor="np-name">Name</Label>
                <Input
                  id="np-name"
                  required
                  value={newProduct.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    setNewProduct((p) => ({
                      ...p,
                      name,
                      slug: name
                        .toLowerCase()
                        .trim()
                        .replace(/\s+/g, "-")
                        .replace(/[^a-z0-9-]/g, ""),
                    }));
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="np-slug">Slug</Label>
                <Input
                  id="np-slug"
                  required
                  value={newProduct.slug}
                  onChange={(e) =>
                    setNewProduct((p) => ({ ...p, slug: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Category</Label>
                <Select
                  value={newProduct.categoryId || undefined}
                  onValueChange={(v) =>
                    setNewProduct((p) => ({ ...p, categoryId: v }))
                  }
                >
                  <SelectTrigger className="w-full max-w-md">
                    <SelectValue placeholder="Category (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NO_CATEGORY_VALUE}>No category</SelectItem>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="np-price">Price</Label>
                <Input
                  id="np-price"
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  min="0"
                  required
                  value={newProduct.price}
                  onChange={(e) =>
                    setNewProduct((p) => ({ ...p, price: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="np-dp">Discount price (optional)</Label>
                <Input
                  id="np-dp"
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  min="0"
                  value={newProduct.discountPrice}
                  onChange={(e) =>
                    setNewProduct((p) => ({ ...p, discountPrice: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="np-stock">Stock</Label>
                <Input
                  id="np-stock"
                  type="number"
                  min="0"
                  required
                  value={newProduct.stock}
                  onChange={(e) =>
                    setNewProduct((p) => ({ ...p, stock: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="np-img">Primary image URL</Label>
                <Input
                  id="np-img"
                  type="url"
                  placeholder="https://…"
                  value={newProduct.imageUrl}
                  onChange={(e) =>
                    setNewProduct((p) => ({ ...p, imageUrl: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="np-short">Short description</Label>
                <Input
                  id="np-short"
                  value={newProduct.shortDescription}
                  onChange={(e) =>
                    setNewProduct((p) => ({
                      ...p,
                      shortDescription: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="np-desc">Description</Label>
                <Textarea
                  id="np-desc"
                  rows={3}
                  value={newProduct.description}
                  onChange={(e) =>
                    setNewProduct((p) => ({ ...p, description: e.target.value }))
                  }
                />
              </div>
              <div className="md:col-span-2 flex flex-wrap gap-2">
                <Button type="submit" disabled={saving || !token}>
                  {saving ? (
                    <>
                      <Loader2 className="size-4 animate-spin" aria-hidden />
                      Saving…
                    </>
                  ) : (
                    <>
                      <Plus className="size-4" aria-hidden />
                      Create product
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        ) : null}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{tInv("inventoryTitle")}</CardTitle>
          <CardDescription>{tInv("inventoryDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <AdminEmptyState
              title="No products"
              description="Create a product above or seed data via Django admin."
            />
          ) : (
            <>
              <div className="flex flex-col gap-2 md:hidden">
                {products.map((p) => (
                  <MobileProductCard
                    key={p.id}
                    product={p}
                    onOpen={() => setSheetProduct(p)}
                  />
                ))}
              </div>
              <div className="hidden md:block md:overflow-x-auto">
                <Table className="w-full min-w-[720px] table-fixed">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[38%] min-w-0 ps-0">{tInv("colProduct")}</TableHead>
                  <TableHead className="w-[22%] min-w-[11rem]">{tInv("colCategory")}</TableHead>
                  <TableHead className="w-[12%] text-end whitespace-nowrap">{tInv("colPrice")}</TableHead>
                  <TableHead className="w-[8%] text-end whitespace-nowrap">{tInv("colStock")}</TableHead>
                  <TableHead className="w-[12%]">{tInv("colStatus")}</TableHead>
                  <TableHead className="w-[8%] text-end pe-0">{tInv("colActions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((p) => {
                  const thumb = p.images?.[0] ? resolveMediaSrc(p.images[0]) : "";
                  return (
                    <TableRow key={p.id}>
                      <TableCell className="min-w-0 align-middle ps-0">
                        <div className="flex min-w-0 gap-3">
                          <div className="relative size-11 shrink-0 overflow-hidden rounded-lg border bg-muted">
                            {thumb ? (
                              <Image
                                src={thumb}
                                alt=""
                                fill
                                className="object-cover"
                                sizes="44px"
                                unoptimized
                              />
                            ) : null}
                          </div>
                          <div className="min-w-0 flex-1 py-0.5">
                            <p
                              className="line-clamp-2 text-sm font-semibold leading-snug text-foreground"
                              title={p.name}
                            >
                              {p.name}
                            </p>
                            <p
                              className="mt-0.5 truncate font-mono text-[11px] text-muted-foreground"
                              title={p.slug}
                            >
                              {p.slug}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="align-middle">
                        <ProductTableCategoryCell
                          product={p}
                          categories={categories}
                          token={token}
                          onSaved={load}
                        />
                      </TableCell>
                      <TableCell className="align-middle text-end">
                        <ProductTablePriceCell product={p} token={token} onSaved={load} />
                      </TableCell>
                      <TableCell className="align-middle text-end">
                        <ProductTableStockCell product={p} token={token} onSaved={load} />
                      </TableCell>
                      <TableCell className="align-middle">
                        <ProductTableAvailabilityCell product={p} token={token} onSaved={load} />
                      </TableCell>
                      <TableCell className="align-middle text-end pe-0">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              disabled={!token}
                              aria-label={`Actions for ${p.name}`}
                            >
                              <MoreHorizontal className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem asChild>
                              <Link
                                href={`/admin/dashboard/products/${encodeURIComponent(p.slug)}/edit`}
                              >
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => openStorefrontPreview(p.slug)}
                            >
                              <ExternalLink className="size-4" />
                              Preview on site
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              disabled={duplicatingSlug === p.slug}
                              onClick={() => void handleDuplicate(p)}
                            >
                              <Copy className="size-4" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() => setDeleteTarget(p)}
                            >
                              <Trash2 className="size-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {sheetProduct ? (
        <ProductBottomSheet
          product={sheetProduct}
          open
          onOpenChange={(open) => {
            if (!open) setSheetProduct(null);
          }}
          categories={categories}
          token={token}
          onPreview={openStorefrontPreview}
          onDuplicate={handleDuplicate}
          duplicatingSlug={duplicatingSlug}
          onRequestDelete={setDeleteTarget}
          onCategorySaved={load}
        />
      ) : null}

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete product?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget
                ? `This will permanently remove “${deleteTarget.name}” (${deleteTarget.slug}). This cannot be undone.`
                : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteSubmitting}>Cancel</AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              disabled={deleteSubmitting || !token}
              onClick={() => void handleDeleteConfirm()}
            >
              {deleteSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  Deleting…
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
