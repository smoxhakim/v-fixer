"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "@/i18n/navigation";
import { ArrowLeft, Loader2, Plus, Trash2 } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAdminToken } from "@/hooks/use-admin-token";
import { adminListProducts } from "@/lib/admin-queries";
import type { AdminProduct } from "@/lib/admin-types";
import { getHomeHero, updateHomeHero } from "@/lib/api";
import type { HomeHeroSlidePayload } from "@/lib/home-hero";

const SELECT_NONE = "__none__";

const emptySlide = (): HomeHeroSlidePayload => ({
  tag: "",
  title: "",
  description: "",
  imageUrl: "",
  linkHref: "",
  gradientClass: "from-muted to-muted",
});

/** Slug from storefront path `/product/{slug}`. */
function productSlugFromHeroHref(href: string): string | null {
  const t = href.trim();
  const m = t.match(/^\/product\/([^/?#]+)/i);
  if (!m) return null;
  try {
    return decodeURIComponent(m[1]);
  } catch {
    return m[1];
  }
}

function slideFromProduct(p: AdminProduct, prev: HomeHeroSlidePayload): HomeHeroSlidePayload {
  const desc = String(p.shortDescription ?? "").trim().slice(0, 500);
  const img = Array.isArray(p.images) && p.images[0] ? String(p.images[0]) : "";
  return {
    ...prev,
    title: p.name,
    description: desc,
    imageUrl: img,
    linkHref: `/product/${p.slug}`,
  };
}

function hydrateSlideFromCatalog(
  row: HomeHeroSlidePayload,
  products: AdminProduct[],
): HomeHeroSlidePayload | null {
  const slug = productSlugFromHeroHref(row.linkHref);
  if (!slug) return null;
  const p = products.find((x) => x.slug === slug);
  if (!p) return null;
  return slideFromProduct(p, row);
}

function SlideFields({
  label,
  row,
  onChange,
  showDescription,
  products,
}: {
  label: string;
  row: HomeHeroSlidePayload;
  onChange: (next: HomeHeroSlidePayload) => void;
  showDescription: boolean;
  products: AdminProduct[];
}) {
  const patch = (p: Partial<HomeHeroSlidePayload>) => onChange({ ...row, ...p });
  const slug = productSlugFromHeroHref(row.linkHref);
  const selected = slug ? products.find((p) => p.slug === slug) : undefined;
  const selectValue: string = selected && slug != null ? slug : SELECT_NONE;

  const sortedProducts = useMemo(
    () => [...products].sort((a, b) => a.name.localeCompare(b.name)),
    [products],
  );

  return (
    <div className="space-y-3 rounded-lg border bg-card p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className="space-y-2">
        <Label>Product</Label>
        <Select
          value={selectValue}
          onValueChange={(value) => {
            if (value === SELECT_NONE) return;
            const p = products.find((x) => x.slug === value);
            if (!p) return;
            onChange(slideFromProduct(p, row));
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Choose a catalog product" />
          </SelectTrigger>
          <SelectContent className="max-h-[min(60vh,320px)]">
            <SelectItem value={SELECT_NONE} disabled>
              Choose a catalog product
            </SelectItem>
            {sortedProducts.map((p) => (
              <SelectItem key={p.id} value={p.slug}>
                {`${p.name} (${p.slug})`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {!selected && row.linkHref.trim() ? (
          <p className="text-xs text-amber-600 dark:text-amber-500">
            {slug
              ? "That product is no longer in the catalog. Pick another product."
              : "This slide’s link is not a catalog product URL. Choose a product above to fix it."}
          </p>
        ) : null}
        {selected ? (
          <div className="rounded-md border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
            <p>
              <span className="font-medium text-foreground">Headline and image</span> come from this
              product. Subtitle uses the product short description when present.
            </p>
            {showDescription && row.description ? (
              <p className="mt-1 line-clamp-3 border-t border-border/60 pt-1">{row.description}</p>
            ) : null}
          </div>
        ) : null}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Badge / tag</Label>
          <Input
            value={row.tag}
            onChange={(e) => patch({ tag: e.target.value })}
            placeholder="NEW ARRIVALS"
          />
        </div>
        <div className="space-y-2">
          <Label>Gradient (Tailwind classes)</Label>
          <Input
            value={row.gradientClass}
            onChange={(e) => patch({ gradientClass: e.target.value })}
            placeholder="from-[#0a1628] to-[#1a3a5c]"
            className="font-mono text-xs sm:text-sm"
          />
        </div>
      </div>
    </div>
  );
}

export default function AdminHomeHeroPage() {
  const { token, hydrated } = useAdminToken();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [mainSlides, setMainSlides] = useState<HomeHeroSlidePayload[]>([emptySlide()]);
  const [sidePromos, setSidePromos] = useState<HomeHeroSlidePayload[]>([
    emptySlide(),
    emptySlide(),
  ]);

  const load = useCallback(async () => {
    setLoading(true);
    const [heroData, pr] = await Promise.all([getHomeHero(), adminListProducts()]);
    if (!pr.ok) {
      toast.error(pr.error);
      setProducts([]);
    } else {
      setProducts(pr.data);
    }
    if (heroData?.mainSlides?.length) setMainSlides(heroData.mainSlides);
    if (heroData?.sidePromos?.length) setSidePromos(heroData.sidePromos);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const setMainAt = (i: number, row: HomeHeroSlidePayload) => {
    setMainSlides((rows) => {
      const next = [...rows];
      next[i] = row;
      return next;
    });
  };

  const setSideAt = (i: number, row: HomeHeroSlidePayload) => {
    setSidePromos((rows) => {
      const next = [...rows];
      next[i] = row;
      return next;
    });
  };

  const addMain = () => {
    setMainSlides((r) => (r.length >= 5 ? r : [...r, emptySlide()]));
  };

  const removeMain = (i: number) => {
    setMainSlides((r) => (r.length <= 1 ? r : r.filter((_, j) => j !== i)));
  };

  const addSide = () => {
    setSidePromos((r) => (r.length >= 2 ? r : [...r, emptySlide()]));
  };

  const removeSide = (i: number) => {
    setSidePromos((r) => (r.length <= 1 ? r : r.filter((_, j) => j !== i)));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error("Add an admin token via /admin/login first.");
      return;
    }
    if (!products.length) {
      toast.error("Add at least one product in the catalog before saving the hero.");
      return;
    }
    const main = mainSlides
      .map((s) => hydrateSlideFromCatalog(s, products))
      .filter((s): s is HomeHeroSlidePayload => s !== null);
    const side = sidePromos
      .map((s) => hydrateSlideFromCatalog(s, products))
      .filter((s): s is HomeHeroSlidePayload => s !== null);
    if (!main.length) {
      toast.error("Each main slide must have a product selected from the catalog.");
      return;
    }
    if (!side.length) {
      toast.error("Each side promo must have a product selected from the catalog.");
      return;
    }
    setSaving(true);
    try {
      await updateHomeHero({ mainSlides: main, sidePromos: side }, token);
      toast.success("Home hero saved.");
      await load();
    } catch {
      toast.error("Could not save (check network and admin permissions).");
    } finally {
      setSaving(false);
    }
  };

  if (!hydrated || loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="size-6 animate-spin" aria-hidden />
        <span className="text-sm">Loading hero config…</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-24">
      <AdminPageHeader
        title="Home hero"
        description="Large carousel and right-column tiles each showcase a catalog product (headline, image, and link come from the product)."
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
        <Link href="/admin/dashboard/products">
          <ArrowLeft className="size-4" />
          Back to products
        </Link>
      </Button>

      {!products.length ? (
        <Card>
          <CardHeader>
            <CardTitle>No products yet</CardTitle>
            <CardDescription>
              Add products in the catalog first; hero slides can only link to existing products.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <Link href="/admin/dashboard/products">Go to products</Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <form onSubmit={(e) => void handleSave(e)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Main carousel (left)</CardTitle>
            <CardDescription>
              Up to 5 slides. Pick a product per slide; optional badge and gradient override. First slide
              shows initially.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {mainSlides.map((row, i) => (
              <div key={i} className="flex flex-col gap-2 sm:flex-row sm:items-start">
                <div className="min-w-0 flex-1">
                  <SlideFields
                    label={`Slide ${i + 1}`}
                    row={row}
                    onChange={(next) => setMainAt(i, next)}
                    showDescription
                    products={products}
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="shrink-0"
                  disabled={mainSlides.length <= 1}
                  onClick={() => removeMain(i)}
                  aria-label={`Remove slide ${i + 1}`}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" className="gap-2" onClick={addMain}>
              <Plus className="size-4" />
              Add slide (max 5)
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Side promos (right column)</CardTitle>
            <CardDescription>One or two stacked tiles — each must be a catalog product.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {sidePromos.map((row, i) => (
              <div key={i} className="flex flex-col gap-2 sm:flex-row sm:items-start">
                <div className="min-w-0 flex-1">
                  <SlideFields
                    label={`Promo ${i + 1}`}
                    row={row}
                    onChange={(next) => setSideAt(i, next)}
                    showDescription={false}
                    products={products}
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="shrink-0"
                  disabled={sidePromos.length <= 1}
                  onClick={() => removeSide(i)}
                  aria-label={`Remove promo ${i + 1}`}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
            {sidePromos.length < 2 ? (
              <Button type="button" variant="outline" size="sm" className="gap-2" onClick={addSide}>
                <Plus className="size-4" />
                Add second tile
              </Button>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <ul className="list-inside list-disc space-y-1">
              <li>
                <strong>Gradient</strong> uses Tailwind arbitrary values, e.g.{" "}
                <code className="rounded bg-muted px-1">from-[#e83e8c] to-[#6f42c1]</code> — combined with{" "}
                <code className="rounded bg-muted px-1">bg-gradient-to-r</code> on the storefront.
              </li>
              <li>
                Slides always link to <code className="rounded bg-muted px-1">/product/…</code> for the
                chosen catalog item. Saving refreshes copy from the product (name, short description,
                primary image).
              </li>
              <li>After saving, refresh the storefront (or wait up to ~60s for ISR) to see changes.</li>
            </ul>
          </CardContent>
        </Card>

        <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-card/95 px-4 py-4 backdrop-blur-sm md:static md:z-0 md:border-0 md:bg-transparent md:p-0 md:backdrop-blur-none">
          <div className="mx-auto flex max-w-screen-2xl flex-wrap justify-end gap-3">
            <Button type="button" variant="outline" asChild>
              <Link href="/admin/dashboard/products">Cancel</Link>
            </Button>
            <Button type="submit" disabled={saving || !token || !products.length}>
              {saving ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  Saving…
                </>
              ) : (
                "Save home hero"
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
