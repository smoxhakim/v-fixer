"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
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
import { HOT_DEALS_PAGE_PATH } from "@/lib/hot-deals-constants";
import { getHotDeals, getProducts, updateHotDeals } from "@/lib/api";

const NONE = "__none__";

export default function AdminHotDealsPage() {
  const t = useTranslations("AdminHotDeals");
  const { token, hydrated } = useAdminToken();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [rows, setRows] = useState<string[]>([]);
  const [productSlugs, setProductSlugs] = useState<string[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [curated, products] = await Promise.all([getHotDeals(), getProducts()]);
      setRows(curated.length ? curated.map((p) => p.slug) : []);
      setProductSlugs(
        Array.isArray(products)
          ? products.map((p: { slug: string }) => p.slug).filter(Boolean)
          : [],
      );
    } catch {
      toast.error(t("toastLoadFailed"));
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  const setRow = (index: number, slug: string) => {
    setRows((prev) => prev.map((r, i) => (i === index ? slug : r)));
  };

  const addRow = () => {
    setRows((prev) => {
      if (prev.length >= 30) return prev;
      const next = [...prev, ""];
      if (next.length === 1 && productSlugs[0]) next[0] = productSlugs[0];
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
      toast.error(t("toastNeedSignIn"));
      return;
    }
    const slugs = rows.map((s) => s.trim()).filter(Boolean);
    if (slugs.length !== rows.length) {
      toast.error(t("toastEachRowProduct"));
      return;
    }
    setSaving(true);
    try {
      await updateHotDeals(slugs, token);
      toast.success(t("toastSaveOk"));
      await load();
    } catch (err) {
      const msg =
        err instanceof Error && err.message.trim() ? err.message : t("toastSaveFail");
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  if (!hydrated || loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="size-6 animate-spin" aria-hidden />
        <span className="text-sm">{t("loading")}</span>
      </div>
    );
  }

  const previewHref = HOT_DEALS_PAGE_PATH;

  return (
    <div className="space-y-8 pb-24">
      <AdminPageHeader
        title={t("title")}
        description={t("description")}
        actions={
          <Button variant="outline" size="sm" asChild>
            <Link href={previewHref} target="_blank" rel="noopener noreferrer">
              {t("previewLink")}
            </Link>
          </Button>
        }
      />

      {!token ? <AdminAuthBanner variant="write" /> : null}

      <Button variant="ghost" size="sm" className="-mt-2 gap-2" asChild>
        <Link href="/admin/dashboard">
          <ArrowLeft className="size-4" />
          {t("backDashboard")}
        </Link>
      </Button>

      <form onSubmit={(e) => void handleSave(e)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>{t("cardTitle")}</CardTitle>
            <CardDescription>{t("cardDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {rows.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("emptyRowsHint")}</p>
            ) : (
              rows.map((slug, i) => (
                <div
                  key={i}
                  className="flex flex-col gap-3 rounded-lg border bg-card p-4 sm:flex-row sm:items-end"
                >
                  <div className="grid flex-1 gap-3 sm:grid-cols-1">
                    <div className="space-y-2">
                      <Label>{t("labelProduct")}</Label>
                      <Select
                        value={slug || NONE}
                        onValueChange={(v) => setRow(i, v === NONE ? "" : v)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder={t("selectPlaceholder")} />
                        </SelectTrigger>
                        <SelectContent className="max-h-72">
                          <SelectItem value={NONE}>{t("selectDash")}</SelectItem>
                          {productSlugs.map((s) => (
                            <SelectItem key={s} value={s}>
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2 sm:flex-col">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="size-9"
                      disabled={i === 0}
                      onClick={() => moveRow(i, -1)}
                      aria-label={t("moveUpAria")}
                    >
                      <ChevronUp className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="size-9"
                      disabled={i === rows.length - 1}
                      onClick={() => moveRow(i, 1)}
                      aria-label={t("moveDownAria")}
                    >
                      <ChevronDown className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="size-9 text-destructive hover:text-destructive"
                      onClick={() => removeRow(i)}
                      aria-label={t("removeRowAria")}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="secondary" onClick={addRow} disabled={rows.length >= 30}>
                <Plus className="size-4" />
                {t("addRow")}
              </Button>
              <Button type="submit" disabled={saving || !token}>
                {saving ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="size-4 animate-spin" aria-hidden />
                    {t("saving")}
                  </span>
                ) : (
                  t("save")
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
