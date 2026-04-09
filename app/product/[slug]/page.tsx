import { notFound } from "next/navigation";
import { getProduct, getProducts } from "@/lib/api";
import { ProductDetails } from "@/components/product/product-details";
import { ProductGrid } from "@/components/product/product-grid";

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  let related = await getProducts({ category: product.categorySlug });
  related = related
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
