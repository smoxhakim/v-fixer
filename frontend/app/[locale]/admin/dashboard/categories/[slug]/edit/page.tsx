"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { Link, useRouter } from "@/i18n/navigation";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  ChevronDown,
  ImageIcon,
  Loader2,
  MoreHorizontal,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { AdminAuthBanner } from "@/components/admin/admin-auth-banner";
import { AdminEmptyState } from "@/components/admin/admin-empty-state";
import { AdminErrorState } from "@/components/admin/admin-error-state";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
import { useAdminToken } from "@/hooks/use-admin-token";
import { adminListCategories, adminListProducts } from "@/lib/admin-queries";
import type { AdminCategory, AdminProduct } from "@/lib/admin-types";
import { parseMoney } from "@/lib/admin-stats";
import {
  createProduct,
  deleteProductBySlug,
  getCategory,
  updateCategoryBySlug,
  updateProductBySlug,
} from "@/lib/api";
import { formatCurrency } from "@/lib/format";
import { resolveMediaSrc } from "@/lib/media-url";
import { cn } from "@/lib/utils";

const NO_PARENT = "__none__";

function normalizeSlug(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

function storeOrigin(): string {
  if (typeof window === "undefined") return "";
  return window.location.origin;
}

export default function AdminEditCategoryPage() {
  const params = useParams();
  const router = useRouter();
  const slugParam = typeof params.slug === "string" ? params.slug : "";
  const { token, hydrated } = useAdminToken();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [apiSlug, setApiSlug] = useState(slugParam);
  const [categoryPk, setCategoryPk] = useState<number | null>(null);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [icon, setIcon] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [parentId, setParentId] = useState("");
  const [saving, setSaving] = useState(false);

  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [removeTarget, setRemoveTarget] = useState<AdminProduct | null>(null);
  const [removeSubmitting, setRemoveSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminProduct | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  const [qaName, setQaName] = useState("");
  const [qaSlug, setQaSlug] = useState("");
  const [qaPrice, setQaPrice] = useState("");
  const [qaStock, setQaStock] = useState("0");
  const [qaSaving, setQaSaving] = useState(false);
  const [lastCreatedSlug, setLastCreatedSlug] = useState<string | null>(null);

  const loadProducts = useCallback(async (categorySlug: string) => {
    const pr = await adminListProducts({ categorySlug });
    if (!pr.ok) {
      toast.error(pr.error);
      setProducts([]);
      return;
    }
    setProducts(pr.data);
  }, []);

  const load = useCallback(async () => {
    if (!slugParam) return;
    setLoading(true);
    setError(null);
    const cat = await getCategory(slugParam);
    if (!cat) {
      setError(
        "Category not found, or the API is unreachable. Check the slug and that the Django server is running.",
      );
      setLoading(false);
      return;
    }
    const resolvedSlug = String((cat as { slug?: string }).slug ?? slugParam);
    const [cr, pr] = await Promise.all([
      adminListCategories(),
      adminListProducts({ categorySlug: resolvedSlug }),
    ]);
    const idNum = Number((cat as { id?: number }).id);
    setCategoryPk(Number.isFinite(idNum) ? idNum : null);
    setCategories(cr.ok ? cr.data : []);
    setApiSlug(resolvedSlug);
    setName(String((cat as { name?: string }).name ?? ""));
    setSlug(normalizeSlug(String((cat as { slug?: string }).slug ?? "")));
    setIcon(String((cat as { icon?: string | null }).icon ?? ""));
    const img =
      (cat as { imageUrl?: string | null }).imageUrl ??
      (cat as { image_url?: string | null }).image_url ??
      "";
    setImageUrl(typeof img === "string" ? img : "");
    const parent =
      (cat as { parent?: number | null }).parent ??
      (cat as { parentId?: number | null }).parentId;
    setParentId(parent != null ? String(parent) : NO_PARENT);
    if (!pr.ok) {
      toast.error(pr.error);
      setProducts([]);
    } else {
      setProducts(pr.data);
    }
    setLoading(false);
  }, [slugParam]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error("Sign in at /admin/login with an admin token first.");
      return;
    }
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        name: name.trim(),
        slug: normalizeSlug(slug.trim()),
        icon: icon.trim() || null,
        imageUrl: imageUrl.trim() || "",
        parent: parentId && parentId !== NO_PARENT ? Number(parentId) : null,
      };
      const updated = await updateCategoryBySlug(apiSlug, payload, token);
      toast.success("Category saved");
      const nextSlug = String(
        (updated as { slug?: string }).slug ?? normalizeSlug(slug.trim()),
      );
      if (nextSlug && nextSlug !== apiSlug) {
        router.replace(
          `/admin/dashboard/categories/${encodeURIComponent(nextSlug)}/edit`,
        );
      } else {
        await load();
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Save failed — check slug and API.";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error("Add an admin token via /admin/login before mutating.");
      return;
    }
    if (categoryPk == null) {
      toast.error("Category id missing — reload the page.");
      return;
    }
    const slugNorm = normalizeSlug(qaSlug.trim());
    if (!qaName.trim() || !slugNorm) {
      toast.error("Name and slug are required.");
      return;
    }
    setQaSaving(true);
    setLastCreatedSlug(null);
    try {
      const created = await createProduct(
        {
          name: qaName.trim(),
          slug: slugNorm,
          category: categoryPk,
          price: Number(qaPrice),
          discountPrice: null,
          stock: Number(qaStock),
          shortDescription: null,
          description: null,
          images: [],
          rating: 0,
        },
        token,
      );
      const newSlug = String(
        (created as { slug?: string }).slug ?? slugNorm,
      );
      toast.success("Product created");
      setQaName("");
      setQaSlug("");
      setQaPrice("");
      setQaStock("0");
      setLastCreatedSlug(newSlug);
      await loadProducts(apiSlug);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Could not create product.";
      toast.error(message);
    } finally {
      setQaSaving(false);
    }
  };

  const handleRemoveConfirm = async () => {
    if (!removeTarget || !token) return;
    setRemoveSubmitting(true);
    try {
      await updateProductBySlug(removeTarget.slug, { category: null }, token);
      toast.success("Removed from category");
      setRemoveTarget(null);
      await loadProducts(apiSlug);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Could not update product.";
      toast.error(message);
    } finally {
      setRemoveSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget || !token) return;
    setDeleteSubmitting(true);
    try {
      await deleteProductBySlug(deleteTarget.slug, token);
      toast.success("Product deleted");
      setDeleteTarget(null);
      await loadProducts(apiSlug);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Could not delete product.";
      toast.error(message);
    } finally {
      setDeleteSubmitting(false);
    }
  };

  if (!hydrated || loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="size-6 animate-spin" aria-hidden />
        <span className="text-sm">Loading category…</span>
      </div>
    );
  }

  if (error || !slugParam) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/dashboard/categories" className="gap-2">
            <ArrowLeft className="size-4" />
            Back to categories
          </Link>
        </Button>
        <AdminErrorState
          message={error ?? "Missing category slug."}
          onRetry={() => void load()}
        />
      </div>
    );
  }

  const storefrontUrl = `${storeOrigin()}/category/${encodeURIComponent(slug || slugParam)}`;
  const previewSrc = imageUrl.trim() ? resolveMediaSrc(imageUrl.trim()) : "";

  return (
    <div className="pb-28">
      {!token ? (
        <div className="mb-6">
          <AdminAuthBanner variant="write" />
        </div>
      ) : null}

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <Button variant="ghost" size="sm" className="-ml-2 mb-2 w-fit gap-2" asChild>
            <Link href="/admin/dashboard/categories">
              <ArrowLeft className="size-4" />
              Categories
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Edit category
          </h1>
          <p className="text-sm text-muted-foreground">
            Update listing name, URL slug, optional hero image, Lucide icon, and parent.
            Slug changes update the public category URL.
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button type="button" variant="outline" asChild>
            <a href={storefrontUrl} target="_blank" rel="noopener noreferrer">
              Preview storefront
            </a>
          </Button>
        </div>
      </div>

      <form onSubmit={(e) => void handleSubmit(e)}>
        <div className="grid gap-6 lg:grid-cols-3 lg:items-start">
          <div className="space-y-4 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Basic information</CardTitle>
                <CardDescription>
                  Name and slug used across the storefront and admin.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cat-name">Category name</Label>
                  <Input
                    id="cat-name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Microscopes"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cat-slug">Slug</Label>
                  <Input
                    id="cat-slug"
                    required
                    value={slug}
                    onChange={(e) => setSlug(normalizeSlug(e.target.value))}
                    placeholder="url-safe-identifier"
                  />
                  <p className="text-xs text-muted-foreground">
                    Storefront URL:{" "}
                    <span className="break-all font-mono text-foreground/80">
                      {storefrontUrl}
                    </span>
                  </p>
                </div>
              </CardContent>
            </Card>

            <Collapsible defaultOpen className="group">
              <Card className="overflow-hidden">
                <CollapsibleTrigger asChild>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-2 border-b bg-muted/30 px-6 py-4 text-left hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-2">
                      <ImageIcon className="size-5 text-muted-foreground" />
                      <div>
                        <span className="text-base font-semibold">Media</span>
                        <p className="text-xs font-normal text-muted-foreground">
                          Hero image for category tiles (homepage slider, promos). Use
                          absolute URLs or <code className="text-[10px]">/media/…</code>{" "}
                          paths.
                        </p>
                      </div>
                    </div>
                    <ChevronDown className="size-5 shrink-0 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="space-y-4 pt-4">
                    <div className="flex gap-4">
                      <div className="relative size-28 shrink-0 overflow-hidden rounded-lg border bg-muted">
                        {previewSrc ? (
                          <Image
                            src={previewSrc}
                            alt=""
                            fill
                            className="object-cover"
                            sizes="112px"
                            unoptimized
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center p-2 text-center text-xs text-muted-foreground">
                            No image
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1 space-y-2">
                        <Label htmlFor="cat-image">Image URL</Label>
                        <Input
                          id="cat-image"
                          value={imageUrl}
                          onChange={(e) => setImageUrl(e.target.value)}
                          placeholder="https://… or /media/categories/…"
                          className="font-mono text-xs sm:text-sm"
                        />
                        <p className="text-xs text-muted-foreground">
                          Wide images (~4:3) work well in category cards.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          </div>

          <div className="space-y-4 lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Storefront</CardTitle>
                <CardDescription>
                  Categories appear in navigation, the homepage slider, and best-selling
                  blocks when configured.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Saving updates the live catalog for all visitors (subject to cache /
                revalidate).
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Organization</CardTitle>
                <CardDescription>Icon and parent hierarchy</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cat-icon">Icon (Lucide name, optional)</Label>
                  <Input
                    id="cat-icon"
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                    placeholder="e.g. microscope, headphones"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Parent category</Label>
                  <Select
                    value={parentId || NO_PARENT}
                    onValueChange={setParentId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="None (top-level)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NO_PARENT}>None (top-level)</SelectItem>
                      {categories
                        .filter(
                          (c) => categoryPk == null || c.id !== categoryPk,
                        )
                        .map((c) => (
                          <SelectItem key={c.id} value={String(c.id)}>
                            {c.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div
          className={cn(
            "fixed inset-x-0 bottom-0 z-40 border-t bg-card/95 px-4 py-4 shadow-[0_-4px_24px_rgba(0,0,0,0.06)] backdrop-blur-sm md:static md:z-0 md:mt-8 md:border-0 md:bg-transparent md:p-0 md:shadow-none md:backdrop-blur-none",
          )}
        >
          <div className="mx-auto flex max-w-screen-2xl flex-wrap items-center justify-end gap-3">
            <Button type="button" variant="outline" asChild>
              <Link href="/admin/dashboard/categories">Cancel</Link>
            </Button>
            <Button type="submit" disabled={saving || !token} className="min-w-[140px]">
              {saving ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  Saving…
                </>
              ) : (
                "Save category"
              )}
            </Button>
          </div>
        </div>
      </form>

      <div className="mt-10 space-y-6">
        <Card>
          <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle>Products in this category</CardTitle>
              <CardDescription>
                Catalog items assigned to this category. Edit on the full product page,
                remove from this category, or delete entirely.
              </CardDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="shrink-0"
              onClick={() => void loadProducts(apiSlug)}
            >
              Refresh list
            </Button>
          </CardHeader>
          <CardContent className="space-y-8">
            <div>
              <h3 className="mb-3 text-sm font-medium text-foreground">Quick add</h3>
              <form
                className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
                onSubmit={(e) => void handleQuickAdd(e)}
              >
                <div className="space-y-2">
                  <Label htmlFor="qa-name">Name</Label>
                  <Input
                    id="qa-name"
                    required
                    value={qaName}
                    onChange={(e) => {
                      const v = e.target.value;
                      setQaName(v);
                      setLastCreatedSlug(null);
                    }}
                    placeholder="Product name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="qa-slug">Slug</Label>
                  <Input
                    id="qa-slug"
                    required
                    value={qaSlug}
                    onChange={(e) => {
                      setQaSlug(e.target.value);
                      setLastCreatedSlug(null);
                    }}
                    placeholder="url-safe-slug"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="qa-price">Price</Label>
                  <Input
                    id="qa-price"
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    min="0"
                    required
                    value={qaPrice}
                    onChange={(e) => setQaPrice(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="qa-stock">Stock</Label>
                  <Input
                    id="qa-stock"
                    type="number"
                    min="0"
                    required
                    value={qaStock}
                    onChange={(e) => setQaStock(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2 sm:col-span-2 lg:col-span-4 lg:flex-row lg:items-end">
                  <Button
                    type="submit"
                    disabled={qaSaving || !token || categoryPk == null}
                    className="w-fit"
                  >
                    {qaSaving ? (
                      <>
                        <Loader2 className="size-4 animate-spin" aria-hidden />
                        Creating…
                      </>
                    ) : (
                      <>
                        <Plus className="size-4" aria-hidden />
                        Add to category
                      </>
                    )}
                  </Button>
                  {lastCreatedSlug ? (
                    <Button variant="link" asChild className="h-auto justify-start px-0">
                      <Link
                        href={`/admin/dashboard/products/${encodeURIComponent(lastCreatedSlug)}/edit`}
                      >
                        Open full product editor
                      </Link>
                    </Button>
                  ) : null}
                </div>
              </form>
            </div>

            <div>
              {products.length === 0 ? (
                <AdminEmptyState
                  title="No products in this category"
                  description="Use quick add above or assign products from the main products admin."
                />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-14"> </TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">Stock</TableHead>
                      <TableHead className="min-w-[148px] text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((p) => {
                      const thumb = p.images?.[0]
                        ? resolveMediaSrc(p.images[0])
                        : "";
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
                          <TableCell>
                            <div className="font-medium">{p.name}</div>
                            <div className="text-xs text-muted-foreground">{p.slug}</div>
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {formatCurrency(parseMoney(p.price))}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">{p.stock}</TableCell>
                          <TableCell className="text-right">
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
                              <DropdownMenuContent align="end" className="w-52">
                                <DropdownMenuItem asChild>
                                  <Link
                                    href={`/admin/dashboard/products/${encodeURIComponent(p.slug)}/edit`}
                                  >
                                    Edit
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => setRemoveTarget(p)}
                                >
                                  Remove from category
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  variant="destructive"
                                  onClick={() => setDeleteTarget(p)}
                                >
                                  <Trash2 className="size-4" />
                                  Delete product
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <AlertDialog
        open={!!removeTarget}
        onOpenChange={(o) => !o && setRemoveTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove from this category?</AlertDialogTitle>
            <AlertDialogDescription>
              {removeTarget
                ? `“${removeTarget.name}” will stay in the catalog with no category until you assign one elsewhere.`
                : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={removeSubmitting}>Cancel</AlertDialogCancel>
            <Button
              type="button"
              disabled={removeSubmitting || !token}
              onClick={() => void handleRemoveConfirm()}
            >
              {removeSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  Updating…
                </>
              ) : (
                "Remove"
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
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
