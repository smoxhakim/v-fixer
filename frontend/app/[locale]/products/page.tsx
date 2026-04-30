import type { Metadata } from "next";
import { ChevronRight } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getCategories, getProducts } from "@/lib/api";
import { Link } from "@/i18n/navigation";
import { ProductCard } from "@/components/product/product-card";
import type { Product } from "@/data/products";

type StoreCategory = { id: string | number; name: string; slug: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "ProductsPage" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default async function AllProductsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("ProductsPage");
  const tCat = await getTranslations("CategoryPage");

  const [categories, allProducts] = await Promise.all([
    getCategories() as Promise<StoreCategory[]>,
    getProducts(),
  ]);

  const bySlug = new Map<string, Product[]>();
  for (const c of categories) {
    bySlug.set(c.slug, []);
  }

  const uncategorized: Product[] = [];
  for (const p of allProducts) {
    const slug = (p.categorySlug ?? "").trim();
    if (slug && bySlug.has(slug)) {
      bySlug.get(slug)!.push(p);
    } else {
      uncategorized.push(p);
    }
  }

  const totalListed = allProducts.length;

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-3 text-sm text-muted-foreground">
          <Link href="/" className="transition-colors hover:text-primary">
            {tCat("home")}
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="font-medium text-foreground">{t("title")}</span>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="text-2xl font-bold text-foreground">{t("title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      {totalListed === 0 ? (
        <p className="mx-auto max-w-7xl px-4 pb-20 text-center text-muted-foreground">{t("empty")}</p>
      ) : (
        <div className="divide-y divide-border border-t border-border">
          {categories.map((cat) => {
            const products = bySlug.get(cat.slug) ?? [];
            return (
              <section
                key={String(cat.id)}
                id={`category-${cat.slug}`}
                className="scroll-mt-28 bg-card py-10 first:pt-8"
              >
                <div className="mx-auto max-w-7xl px-4">
                  <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <h2 className="text-xl font-bold uppercase tracking-wider text-foreground">
                      {cat.name}
                    </h2>
                    <Link
                      href={`/category/${cat.slug}`}
                      className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                    >
                      {t("viewCategory")}
                      <ChevronRight className="h-4 w-4" aria-hidden />
                    </Link>
                  </div>
                  {products.length === 0 ? (
                    <p className="text-sm text-muted-foreground">{t("sectionEmpty")}</p>
                  ) : (
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                      {products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                      ))}
                    </div>
                  )}
                </div>
              </section>
            );
          })}

          {uncategorized.length > 0 ? (
            <section id="category-other" className="scroll-mt-28 bg-muted/30 py-10">
              <div className="mx-auto max-w-7xl px-4">
                <h2 className="mb-6 text-xl font-bold uppercase tracking-wider text-foreground">
                  {t("other")}
                </h2>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {uncategorized.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </div>
            </section>
          ) : null}
        </div>
      )}
    </div>
  );
}
