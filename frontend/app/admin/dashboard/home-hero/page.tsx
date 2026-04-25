"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
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
import { useAdminToken } from "@/hooks/use-admin-token";
import { getHomeHero, updateHomeHero } from "@/lib/api";
import type { HomeHeroSlidePayload } from "@/lib/home-hero";

const emptySlide = (): HomeHeroSlidePayload => ({
  tag: "",
  title: "",
  description: "",
  imageUrl: "",
  linkHref: "/",
  gradientClass: "from-muted to-muted",
});

function SlideFields({
  label,
  row,
  onChange,
  showDescription,
}: {
  label: string;
  row: HomeHeroSlidePayload;
  onChange: (next: HomeHeroSlidePayload) => void;
  showDescription: boolean;
}) {
  const set = (patch: Partial<HomeHeroSlidePayload>) => onChange({ ...row, ...patch });
  return (
    <div className="space-y-3 rounded-lg border bg-card p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Badge / tag</Label>
          <Input value={row.tag} onChange={(e) => set({ tag: e.target.value })} placeholder="NEW ARRIVALS" />
        </div>
        <div className="space-y-2">
          <Label>Title</Label>
          <Input value={row.title} onChange={(e) => set({ title: e.target.value })} required />
        </div>
      </div>
      {showDescription ? (
        <div className="space-y-2">
          <Label>Subtitle / description</Label>
          <Input
            value={row.description}
            onChange={(e) => set({ description: e.target.value })}
            placeholder="Shown under the headline on large tiles"
          />
        </div>
      ) : null}
      <div className="space-y-2">
        <Label>Image URL</Label>
        <Input
          value={row.imageUrl}
          onChange={(e) => set({ imageUrl: e.target.value })}
          placeholder="https://… or /media/…"
          className="font-mono text-xs sm:text-sm"
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Link (path or URL)</Label>
          <Input value={row.linkHref} onChange={(e) => set({ linkHref: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Gradient (Tailwind classes)</Label>
          <Input
            value={row.gradientClass}
            onChange={(e) => set({ gradientClass: e.target.value })}
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
  const [mainSlides, setMainSlides] = useState<HomeHeroSlidePayload[]>([emptySlide()]);
  const [sidePromos, setSidePromos] = useState<HomeHeroSlidePayload[]>([
    emptySlide(),
    emptySlide(),
  ]);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await getHomeHero();
    if (data?.mainSlides?.length) setMainSlides(data.mainSlides);
    if (data?.sidePromos?.length) setSidePromos(data.sidePromos);
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
    const main = mainSlides.filter((s) => s.title.trim());
    const side = sidePromos.filter((s) => s.title.trim());
    if (!main.length) {
      toast.error("Add at least one main slide with a title.");
      return;
    }
    if (!side.length) {
      toast.error("Add at least one side promo with a title.");
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
        description="Controls the large carousel and the two tiles on the right of the homepage."
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

      <form onSubmit={(e) => void handleSave(e)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Main carousel (left)</CardTitle>
            <CardDescription>Up to 5 slides. First slide is shown initially; visitors can use arrows or dots.</CardDescription>
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
            <CardDescription>One or two stacked tiles. Subtitle field is optional.</CardDescription>
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
                <code className="rounded bg-muted px-1">from-[#e83e8c] to-[#6f42c1]</code> — combined
                with <code className="rounded bg-muted px-1">bg-gradient-to-r</code> in the template.
              </li>
              <li>
                <strong>Links</strong> can be internal paths (<code className="rounded bg-muted px-1">/product/…</code>
                ) or full URLs.
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
            <Button type="submit" disabled={saving || !token}>
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
