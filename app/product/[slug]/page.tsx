import { notFound } from "next/navigation";
import { products, getProductBySlug, getProductsByCategory } from "@/data/products";
import { ProductDetails } from "@/components/product/product-details";
import { ProductGrid } from "@/components/product/product-grid";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const related = getProductsByCategory(product.categorySlug)
    .filter((p) => p.id !== product.id)
    .slice(0, 5);

  return (
    <>
      <ProductDetails product={product} />
      {related.length > 0 && (
        <div className="bg-secondary">
          <ProductGrid title="Related Products" products={related} />
        </div>
      )}
    </>
  );
}
