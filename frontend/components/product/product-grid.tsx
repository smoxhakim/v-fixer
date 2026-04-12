import { ProductCard } from "@/components/product/product-card";
import type { Product } from "@/data/products";

export function ProductGrid({
  title,
  products,
}: {
  title?: string;
  products: Product[];
}) {
  return (
    <section className="py-10">
      <div className="mx-auto max-w-7xl px-4">
        {title && (
          <h2 className="mb-6 text-center text-xl font-bold uppercase tracking-wider text-foreground">
            {title}
          </h2>
        )}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
