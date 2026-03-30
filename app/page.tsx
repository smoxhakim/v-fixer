import { HeroSection } from "@/components/home/hero-section";
import { CategoryCarousel } from "@/components/home/category-carousel";
import { TrustBadges } from "@/components/home/trust-badges";
import { FeaturedPromos } from "@/components/home/featured-promos";
import { ProductGrid } from "@/components/product/product-grid";
import { getTrendingProducts, getFeaturedProducts } from "@/data/products";

export default function Home() {
  const trending = getTrendingProducts();
  const featured = getFeaturedProducts();

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
