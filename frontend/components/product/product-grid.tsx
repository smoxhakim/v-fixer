import { ProductCard } from "@/components/product/product-card";
import { RevealHeading } from "@/components/ui/reveal-heading";
import type { Product } from "@/data/products";

export function ProductGrid({
  title,
  products,
}: {
  title?: string;
  products: Product[];
}) {
  return (
    <section className="w-full overflow-hidden py-10">
      <div className="mx-auto w-full max-w-7xl px-4">
        {title && (
          <RevealHeading className="mb-6 text-center text-xl font-bold uppercase tracking-wider text-foreground">
            {title}
          </RevealHeading>
        )}
        <div className="grid w-full grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {products.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
