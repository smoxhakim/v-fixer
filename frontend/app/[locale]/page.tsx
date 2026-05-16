import { HeroSection } from "@/components/home/hero-section";
import { BestSellingSection } from "@/components/home/best-selling-section";
import { CategoryShowcaseSlider } from "@/components/home/category-showcase-slider";
import { TrustBadges } from "@/components/home/trust-badges";
import { ProductGrid } from "@/components/product/product-grid";
import { getHomeBestSelling, getHomeHero, getProducts } from "@/lib/api";
import { getTranslations, setRequestLocale } from "next-intl/server";

/** Homepage featured grid uses up to 5 columns at `lg` (`ProductGrid`); cap = 5 rows × 5 products. */
const FEATURED_HOME_PRODUCT_LIMIT = 5 * 5;

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Home");
  const [bestSelling, featured, hero] = await Promise.all([
    getHomeBestSelling(),
    getProducts({ featured: true }),
    getHomeHero(),
  ]);

  return (
    <>
      <HeroSection mainSlides={hero?.mainSlides} sidePromos={hero?.sidePromos} />
      <TrustBadges />
      <CategoryShowcaseSlider />
      <BestSellingSection items={bestSelling} />
      <div className="bg-secondary">
        <ProductGrid
          title={t("featuredTitle")}
          products={featured.slice(0, FEATURED_HOME_PRODUCT_LIMIT)}
        />
      </div>
    </>
  );
}
