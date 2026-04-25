import Link from "next/link";
import { ProductCard } from "@/components/product/product-card";
import type { BestSellingDisplayRow } from "@/lib/home-best-selling";

const productGridClass =
  "grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5";

export function BestSellingSection({ items }: { items: BestSellingDisplayRow[] }) {
  return (
    <section className="py-10">
      <div className="mx-auto max-w-7xl px-4">
        <h2 className="mb-6 text-center text-xl font-bold uppercase tracking-wider text-foreground">
          Best selling
        </h2>
        {items.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground">
            No products or categories in this section yet.{" "}
            <Link
              href="/admin/dashboard/best-selling"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Configure in admin
            </Link>
            .
          </p>
        ) : (
          <div className="flex flex-col gap-10">
            {items.map((row, i) =>
              row.kind === "product" ? (
                <div key={`p-${row.product.slug}-${i}`} className={productGridClass}>
                  <ProductCard product={row.product} />
                </div>
              ) : (
                <div key={`c-${row.category.slug}-${i}`} className="space-y-4">
                  <h3 className="text-center text-lg font-bold uppercase tracking-wider text-foreground md:text-left">
                    {row.category.name}
                  </h3>
                  {row.products.length === 0 ? (
                    <p className="text-center text-sm text-muted-foreground md:text-left">
                      No products in this category yet.{" "}
                      <Link
                        href={`/category/${row.category.slug}`}
                        className="font-medium text-primary underline-offset-4 hover:underline"
                      >
                        View category
                      </Link>
                    </p>
                  ) : (
                    <>
                      <div className={productGridClass}>
                        {row.products.map((product) => (
                          <ProductCard
                            key={product.slug}
                            product={product}
                          />
                        ))}
                      </div>
                      {row.productCount > row.products.length ? (
                        <p className="text-center text-sm md:text-left">
                          <Link
                            href={`/category/${row.category.slug}`}
                            className="font-medium text-primary underline-offset-4 hover:underline"
                          >
                            View all in {row.category.name}
                          </Link>
                          <span className="text-muted-foreground">
                            {" "}
                            ({row.productCount} products)
                          </span>
                        </p>
                      ) : null}
                    </>
                  )}
                </div>
              ),
            )}
          </div>
        )}
      </div>
    </section>
  );
}
