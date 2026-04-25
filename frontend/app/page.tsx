import { HeroSection } from "@/components/home/hero-section";
import { BestSellingSection } from "@/components/home/best-selling-section";
import { CategoryShowcaseSlider } from "@/components/home/category-showcase-slider";
import { TrustBadges } from "@/components/home/trust-badges";
import { ProductGrid } from "@/components/product/product-grid";
import { getHomeBestSelling, getHomeHero, getProducts } from "@/lib/api";

export default async function Home() {
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
        <ProductGrid title="Featured Products" products={featured} />
      </div>
    </>
  );
}
