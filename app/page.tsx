import { HeroSection } from "@/components/home/hero-section";
import { CategoryCarousel } from "@/components/home/category-carousel";
import { TrustBadges } from "@/components/home/trust-badges";
import { FeaturedPromos } from "@/components/home/featured-promos";
import { ProductGrid } from "@/components/product/product-grid";
import { getProducts } from "@/lib/api";

export default async function Home() {
  const trending = await getProducts({ trending: true });
  const featured = await getProducts({ featured: true });

  return (
    <>
      <HeroSection />
      <CategoryCarousel />
      <TrustBadges />
      <FeaturedPromos />
      <ProductGrid title="Top Smartphone Trends" products={trending} />
      <div className="bg-secondary">
        <ProductGrid title="Featured Products" products={featured} />
      </div>
    </>
  );
}
