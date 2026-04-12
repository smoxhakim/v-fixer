"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { Loader2, Pencil, Plus } from "lucide-react";
import { toast } from "sonner";

import { AdminAuthBanner } from "@/components/admin/admin-auth-banner";
import { AdminEmptyState } from "@/components/admin/admin-empty-state";
import { AdminErrorState } from "@/components/admin/admin-error-state";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Badge } from "@/components/ui/badge";
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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
import { parseMoney } from "@/lib/admin-stats";
import type { AdminCategory, AdminProduct } from "@/lib/admin-types";
import { createProduct, updateProductBySlug } from "@/lib/api";
import { formatCurrency } from "@/lib/format";

export default function AdminProductsPage() {
  const { token, hydrated } = useAdminToken();
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

  const [editProduct, setEditProduct] = useState<AdminProduct | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    slug: "",
    categoryId: "",
    price: "",
    discountPrice: "",
    stock: "",
    shortDescription: "",
    description: "",
    imageUrl: "",
  });
  const [editSaving, setEditSaving] = useState(false);

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

  const openEdit = (p: AdminProduct) => {
    setEditProduct(p);
    const cat = categories.find((c) => c.slug === p.categorySlug);
    setEditForm({
      name: p.name,
      slug: p.slug,
      categoryId: cat ? String(cat.id) : "",
      price: String(p.price),
      discountPrice:
        p.discountPrice !== undefined && p.discountPrice !== null
          ? String(p.discountPrice)
          : "",
      stock: String(p.stock),
      shortDescription: p.shortDescription ?? "",
      description: p.description ?? "",
      imageUrl: p.images?.[0] ?? "",
    });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error("Add an admin token via /admin/login before mutating.");
      return;
    }
    const catId = Number(newProduct.categoryId);
    if (!Number.isFinite(catId)) {
      toast.error("Pick a category.");
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

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editProduct || !token) return;
    const catId = Number(editForm.categoryId);
    if (!Number.isFinite(catId)) {
      toast.error("Pick a category.");
      return;
    }
    setEditSaving(true);
    try {
      await updateProductBySlug(
        editProduct.slug,
        {
          name: editForm.name.trim(),
          slug: editForm.slug.trim(),
          category: catId,
          price: Number(editForm.price),
          discountPrice: editForm.discountPrice
            ? Number(editForm.discountPrice)
            : null,
          stock: Number(editForm.stock),
          shortDescription: editForm.shortDescription.trim() || null,
          description: editForm.description.trim() || null,
          images: editForm.imageUrl.trim() ? [editForm.imageUrl.trim()] : [],
        },
        token,
      );
      toast.success("Product updated");
      setEditProduct(null);
      await load();
    } catch {
      toast.error("Could not update product.");
    } finally {
      setEditSaving(false);
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
        description="Manage catalog items. Product status is not stored by the API yet — the UI reserves it for when the backend adds it."
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
                  required
                >
                  <SelectTrigger className="w-full max-w-md">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
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
          <CardTitle>Inventory</CardTitle>
          <CardDescription>All products returned by the public list endpoint.</CardDescription>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <AdminEmptyState
              title="No products"
              description="Create a product above or seed data via Django admin."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-14"> </TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-24 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((p) => {
                  const thumb = p.images?.[0];
                  return (
                    <TableRow key={p.id}>
                      <TableCell>
                        <div className="relative size-10 overflow-hidden rounded-md border bg-muted">
                          {thumb ? (
                            <Image
                              src={thumb}
                              alt=""
                              fill
                              className="object-cover"
                              sizes="40px"
                              unoptimized
                            />
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell className="text-muted-foreground">{p.slug}</TableCell>
                      <TableCell>{p.categorySlug ?? "—"}</TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatCurrency(parseMoney(p.price))}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{p.stock}</TableCell>
                      <TableCell>
                        <Badge variant="outline" title="No status field on API model yet">
                          Active
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          disabled={!token}
                          onClick={() => openEdit(p)}
                          aria-label={`Edit ${p.name}`}
                        >
                          <Pencil className="size-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Sheet open={!!editProduct} onOpenChange={(o) => !o && setEditProduct(null)}>
        <SheetContent className="flex flex-col gap-0 overflow-y-auto sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Edit product</SheetTitle>
            <SheetDescription>
              Updates are sent as <code className="text-xs">PATCH /api/products/:slug/</code>.
            </SheetDescription>
          </SheetHeader>
          {editProduct ? (
            <form className="flex flex-1 flex-col gap-4 py-4" onSubmit={handleEditSave}>
              <div className="space-y-2">
                <Label htmlFor="ep-name">Name</Label>
                <Input
                  id="ep-name"
                  required
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, name: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ep-slug">Slug</Label>
                <Input
                  id="ep-slug"
                  required
                  value={editForm.slug}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, slug: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={editForm.categoryId || undefined}
                  onValueChange={(v) =>
                    setEditForm((f) => ({ ...f, categoryId: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="ep-price">Price</Label>
                  <Input
                    id="ep-price"
                    type="number"
                    step="0.01"
                    required
                    value={editForm.price}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, price: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ep-dp">Discount</Label>
                  <Input
                    id="ep-dp"
                    type="number"
                    step="0.01"
                    value={editForm.discountPrice}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, discountPrice: e.target.value }))
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ep-stock">Stock</Label>
                <Input
                  id="ep-stock"
                  type="number"
                  required
                  value={editForm.stock}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, stock: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ep-img">Primary image URL</Label>
                <Input
                  id="ep-img"
                  value={editForm.imageUrl}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, imageUrl: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ep-short">Short description</Label>
                <Input
                  id="ep-short"
                  value={editForm.shortDescription}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, shortDescription: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ep-desc">Description</Label>
                <Textarea
                  id="ep-desc"
                  rows={3}
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, description: e.target.value }))
                  }
                />
              </div>
              <SheetFooter className="mt-auto flex-row gap-2 border-t pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditProduct(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={editSaving || !token}>
                  {editSaving ? (
                    <>
                      <Loader2 className="size-4 animate-spin" aria-hidden />
                      Saving…
                    </>
                  ) : (
                    "Save changes"
                  )}
                </Button>
              </SheetFooter>
            </form>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  );
}
