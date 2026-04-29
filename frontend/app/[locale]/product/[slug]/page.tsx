import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getProduct, getProducts } from "@/lib/api";
import { ProductDetails } from "@/components/product/product-details";
import { ProductGrid } from "@/components/product/product-grid";
import { routing } from "@/i18n/routing";

export async function generateStaticParams() {
  const products = await getProducts();
  return routing.locales.flatMap((locale) =>
    products.map((p) => ({ locale, slug: p.slug })),
  );
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("ProductDetails");
  const product = await getProduct(slug);
  if (!product) notFound();

  let related = product.categorySlug
    ? await getProducts({ category: product.categorySlug })
    : await getProducts();
  related = related
    .filter((p) => p.id !== product.id)
    .slice(0, 5);

  return (
    <>
      <ProductDetails product={product} />
      {related.length > 0 && (
        <div className="bg-secondary">
          <ProductGrid title={t("relatedTitle")} products={related} />
        </div>
      )}
    </>
  );
}
