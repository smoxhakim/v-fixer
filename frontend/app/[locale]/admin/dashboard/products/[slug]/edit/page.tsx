"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { Link, useRouter } from "@/i18n/navigation";
import { useParams } from "next/navigation";
import { ArrowLeft, ChevronDown, ImageIcon, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { AdminAuthBanner } from "@/components/admin/admin-auth-banner";
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
import { Textarea } from "@/components/ui/textarea";
import { useAdminToken } from "@/hooks/use-admin-token";
import { adminListCategories } from "@/lib/admin-queries";
import type { AdminCategory } from "@/lib/admin-types";
import { getProduct, updateProductBySlug } from "@/lib/api";
import { resolveMediaSrc } from "@/lib/media-url";
import { cn } from "@/lib/utils";

const NO_CATEGORY = "__none__";
const MAX_IMAGES = 5;

function categoryIdFromForm(raw: string): number | null {
  if (!raw || raw === NO_CATEGORY) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

function storeOrigin(): string {
  if (typeof window === "undefined") return "";
  return window.location.origin;
}

export default function AdminEditProductPage() {
  const params = useParams();
  const router = useRouter();
  const slugParam = typeof params.slug === "string" ? params.slug : "";
  const { token, hydrated } = useAdminToken();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [apiSlug, setApiSlug] = useState(slugParam);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [price, setPrice] = useState("");
  const [discountPrice, setDiscountPrice] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [stock, setStock] = useState("");
  const [rating, setRating] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([""]);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!slugParam) return;
    setLoading(true);
    setError(null);
    const [pr, cr] = await Promise.all([getProduct(slugParam), adminListCategories()]);
    if (!pr) {
      setError(
        "Product not found, or the API is unreachable. Check the slug and that the Django server is running.",
      );
      setLoading(false);
      return;
    }
    setCategories(cr.ok ? cr.data : []);
    setApiSlug(pr.slug);
    setName(pr.name ?? "");
    setSlug(pr.slug ?? "");
    const cat = cr.ok
      ? cr.data.find((c) => c.slug === pr.categorySlug)
      : undefined;
    setCategoryId(cat ? String(cat.id) : NO_CATEGORY);
    setPrice(String(pr.price ?? ""));
    setDiscountPrice(
      pr.discountPrice !== undefined && pr.discountPrice !== null
        ? String(pr.discountPrice)
        : "",
    );
    setCostPrice(
      pr.costPrice !== undefined && pr.costPrice !== null ? String(pr.costPrice) : "",
    );
    setStock(String(pr.stock ?? "0"));
    setRating(pr.rating !== undefined && pr.rating !== null ? String(pr.rating) : "0");
    setShortDescription(pr.shortDescription ?? "");
    setDescription(pr.description ?? "");
    const imgs = Array.isArray(pr.images) && pr.images.length ? [...pr.images] : [""];
    setImageUrls(imgs.length > MAX_IMAGES ? imgs.slice(0, MAX_IMAGES) : imgs);
    setLoading(false);
  }, [slugParam]);

  useEffect(() => {
    void load();
  }, [load]);

  const setImageAt = (i: number, v: string) => {
    setImageUrls((rows) => {
      const next = [...rows];
      next[i] = v;
      return next;
    });
  };

  const addImageRow = () => {
    setImageUrls((rows) => (rows.length >= MAX_IMAGES ? rows : [...rows, ""]));
  };

  const removeImageRow = (i: number) => {
    setImageUrls((rows) => (rows.length <= 1 ? [""] : rows.filter((_, j) => j !== i)));
  };

  const normalizedImages = imageUrls.map((s) => s.trim()).filter(Boolean);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error("Sign in at /admin/login with an admin token first.");
      return;
    }
    const cat = categoryIdFromForm(categoryId);
    if (categoryId && categoryId !== NO_CATEGORY && cat === null) {
      toast.error("Invalid category.");
      return;
    }
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        name: name.trim(),
        slug: slug.trim(),
        category: cat,
        price: Number(price),
        discountPrice: discountPrice.trim() ? Number(discountPrice) : null,
        costPrice: costPrice.trim() ? Number(costPrice) : null,
        stock: Number(stock),
        rating: rating.trim() ? Number(rating) : 0,
        shortDescription: shortDescription.trim() || null,
        description: description.trim() || null,
        images: normalizedImages,
      };
      const updated = await updateProductBySlug(apiSlug, payload, token);
      toast.success("Product saved");
      if (updated.slug && updated.slug !== apiSlug) {
        router.replace(`/admin/dashboard/products/${encodeURIComponent(updated.slug)}/edit`);
      } else {
        await load();
      }
    } catch {
      toast.error("Save failed — check slug uniqueness and API errors.");
    } finally {
      setSaving(false);
    }
  };

  if (!hydrated || loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="size-6 animate-spin" aria-hidden />
        <span className="text-sm">Loading product…</span>
      </div>
    );
  }

  if (error || !slugParam) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/dashboard/products" className="gap-2">
            <ArrowLeft className="size-4" />
            Back to products
          </Link>
        </Button>
        <AdminErrorState
          message={error ?? "Missing product slug."}
          onRetry={() => void load()}
        />
      </div>
    );
  }

  const productUrlPreview = `${storeOrigin()}/product/${encodeURIComponent(slug || slugParam)}`;

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
            <Link href="/admin/dashboard/products">
              <ArrowLeft className="size-4" />
              Products
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Edit product</h1>
          <p className="text-sm text-muted-foreground">
            Changes are saved with{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-xs">PATCH /api/products/:slug/</code>
            . Slug updates change the public URL.
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button type="button" variant="outline" asChild>
            <a href={productUrlPreview} target="_blank" rel="noopener noreferrer">
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
                <CardDescription>Name, URL slug, and summary shown in listings.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Product name</Label>
                  <Input
                    id="name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. YCS 6558X microscope"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="url-safe-identifier"
                  />
                  <p className="text-xs text-muted-foreground">
                    Storefront URL:{" "}
                    <span className="break-all font-mono text-foreground/80">{productUrlPreview}</span>
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="short">Short description</Label>
                  <Input
                    id="short"
                    value={shortDescription}
                    onChange={(e) => setShortDescription(e.target.value)}
                    placeholder="One line for cards and search"
                  />
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
                    <div>
                      <span className="text-base font-semibold">Pricing</span>
                      <p className="text-xs font-normal text-muted-foreground">
                        Price, compare-at (discount), and cost
                      </p>
                    </div>
                    <ChevronDown className="size-5 shrink-0 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="grid gap-4 pt-4 sm:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="price">Price</Label>
                      <Input
                        id="price"
                        type="number"
                        inputMode="decimal"
                        step="0.01"
                        min="0"
                        required
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="discount">Compare at (discount)</Label>
                      <Input
                        id="discount"
                        type="number"
                        inputMode="decimal"
                        step="0.01"
                        min="0"
                        value={discountPrice}
                        onChange={(e) => setDiscountPrice(e.target.value)}
                        placeholder="Optional"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cost">Cost price</Label>
                      <Input
                        id="cost"
                        type="number"
                        inputMode="decimal"
                        step="0.01"
                        min="0"
                        value={costPrice}
                        onChange={(e) => setCostPrice(e.target.value)}
                        placeholder="Optional"
                      />
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>

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
                          Up to {MAX_IMAGES} image URLs (first is primary). Use absolute URLs or{" "}
                          <code className="text-[10px]">/media/…</code> paths.
                        </p>
                      </div>
                    </div>
                    <ChevronDown className="size-5 shrink-0 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="space-y-4 pt-4">
                    <p className="text-xs text-muted-foreground">
                      Tip: square images around 800×800 look best in grids.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {normalizedImages.slice(0, 4).map((u, i) => (
                        <div
                          key={`${i}-${u.slice(0, 24)}`}
                          className="relative size-20 overflow-hidden rounded-lg border bg-muted"
                        >
                          {u ? (
                            <Image
                              src={resolveMediaSrc(u)}
                              alt=""
                              fill
                              className="object-cover"
                              sizes="80px"
                              unoptimized
                            />
                          ) : null}
                        </div>
                      ))}
                    </div>
                    <div className="space-y-3">
                      {imageUrls.map((row, i) => (
                        <div key={i} className="flex gap-2">
                          <Input
                            value={row}
                            onChange={(e) => setImageAt(i, e.target.value)}
                            placeholder={
                              i === 0 ? "Primary image URL" : `Image ${i + 1} URL (optional)`
                            }
                            className="font-mono text-xs sm:text-sm"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="shrink-0"
                            onClick={() => removeImageRow(i)}
                            disabled={imageUrls.length <= 1}
                            aria-label={`Remove image ${i + 1}`}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={addImageRow}
                        disabled={imageUrls.length >= MAX_IMAGES}
                      >
                        <Plus className="size-4" />
                        Add image URL
                      </Button>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            <Collapsible defaultOpen className="group">
              <Card className="overflow-hidden">
                <CollapsibleTrigger asChild>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-2 border-b bg-muted/30 px-6 py-4 text-left hover:bg-muted/50"
                  >
                    <div>
                      <span className="text-base font-semibold">Description</span>
                      <p className="text-xs font-normal text-muted-foreground">
                        Long-form copy for the product page
                      </p>
                    </div>
                    <ChevronDown className="size-5 shrink-0 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="pt-4">
                    <Textarea
                      id="description"
                      rows={12}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe the product…"
                      className="min-h-[200px] resize-y"
                    />
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
                  Published products appear on the public catalog and product pages when the API
                  returns them in list/detail.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                There is no separate “draft” flag yet — saving updates the live catalog.
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Organization</CardTitle>
                <CardDescription>Category and inventory</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={categoryId || undefined} onValueChange={setCategoryId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NO_CATEGORY}>No category</SelectItem>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock">Stock quantity</Label>
                  <Input
                    id="stock"
                    type="number"
                    min="0"
                    required
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rating">Rating (0–5)</Label>
                  <Input
                    id="rating"
                    type="number"
                    inputMode="decimal"
                    step="0.1"
                    min="0"
                    max="5"
                    value={rating}
                    onChange={(e) => setRating(e.target.value)}
                  />
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
              <Link href="/admin/dashboard/products">Cancel</Link>
            </Button>
            <Button type="submit" disabled={saving || !token} className="min-w-[140px]">
              {saving ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  Saving…
                </>
              ) : (
                "Save product"
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
