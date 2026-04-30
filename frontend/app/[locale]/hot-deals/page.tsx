import { getTranslations, setRequestLocale } from "next-intl/server";
import { ChevronRight } from "lucide-react";
import { getHotDeals } from "@/lib/api";
import { ProductGrid } from "@/components/product/product-grid";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function HotDealsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("HotDealsPage");
  const products = await getHotDeals();

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-3 text-sm text-muted-foreground">
          <Link href="/" className="transition-colors hover:text-primary">
            {t("home")}
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="font-medium text-foreground">{t("title")}</span>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="text-2xl font-bold text-foreground">{t("title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {products.length > 0
            ? t("productsFound", { count: products.length })
            : t("emptyDescription")}
        </p>
      </div>

      {products.length > 0 ? (
        <ProductGrid products={products} />
      ) : (
        <div className="mx-auto max-w-7xl px-4 py-20 text-center">
          <Link
            href="/products"
            className="inline-flex rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            {t("browseCatalog")}
          </Link>
        </div>
      )}
    </div>
  );
}
