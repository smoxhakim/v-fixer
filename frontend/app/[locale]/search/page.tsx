import { Suspense } from "react";
import { Link } from "@/i18n/navigation";
import { ChevronRight } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { RecentSearchRecorder } from "@/components/layout/recent-search-recorder";
import { ProductGrid } from "@/components/product/product-grid";
import { getProducts } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function SearchPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Search");
  const { q } = await searchParams;
  const query = (q ?? "").trim();
  const products = query ? await getProducts({ search: query }) : [];

  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={null}>
        <RecentSearchRecorder />
      </Suspense>
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-3 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-primary transition-colors">
            {t("home")}
          </Link>
          <ChevronRight className="h-3.5 w-3.5 shrink-0" />
          <span className="text-foreground font-medium">{t("search")}</span>
          {query ? (
            <>
              <ChevronRight className="h-3.5 w-3.5 shrink-0" />
              <span className="max-w-[min(100%,48ch)] truncate text-foreground font-medium">
                {query}
              </span>
            </>
          ) : null}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8">
        {!query ? (
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-bold text-foreground">{t("title")}</h1>
            <p className="text-sm text-muted-foreground">{t("emptyHint")}</p>
            <Link href="/" className="inline-block text-sm font-medium text-primary hover:underline">
              {t("backHome")}
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-foreground">{t("resultsFor", { q: query })}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {products.length === 0
                ? t("none")
                : products.length === 1
                  ? t("countOne")
                  : t("count", { count: products.length })}
            </p>
            {products.length > 0 ? (
              <div className="mt-8">
                <ProductGrid products={products} />
              </div>
            ) : (
              <p className="mt-6 text-sm text-muted-foreground">
                {t("noneHint")}{" "}
                <Link href="/" className="font-medium text-primary hover:underline">
                  {t("browse")}
                </Link>
                .
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
