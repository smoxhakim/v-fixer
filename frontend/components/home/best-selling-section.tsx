import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { ProductCard } from "@/components/product/product-card";
import type { BestSellingDisplayRow } from "@/lib/home-best-selling";

const productGridClass =
  "grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5";

export async function BestSellingSection({ items }: { items: BestSellingDisplayRow[] }) {
  const t = await getTranslations("BestSelling");

  return (
    <section className="py-10">
      <div className="mx-auto max-w-7xl px-4">
        <h2 className="mb-6 text-center text-xl font-bold uppercase tracking-wider text-foreground">
          {t("title")}
        </h2>
        {items.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground">
            {t("empty")}{" "}
            <Link
              href="/admin/dashboard/best-selling"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              {t("configureAdmin")}
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
                  <h3 className="text-center text-lg font-bold uppercase tracking-wider text-foreground md:text-start">
                    {row.category.name}
                  </h3>
                  {row.products.length === 0 ? (
                    <p className="text-center text-sm text-muted-foreground md:text-start">
                      {t("noProductsCategory")}{" "}
                      <Link
                        href={`/category/${row.category.slug}`}
                        className="font-medium text-primary underline-offset-4 hover:underline"
                      >
                        {t("viewCategory")}
                      </Link>
                    </p>
                  ) : (
                    <>
                      <div className={productGridClass}>
                        {row.products.map((product) => (
                          <ProductCard key={product.slug} product={product} />
                        ))}
                      </div>
                      {row.productCount > row.products.length ? (
                        <p className="text-center text-sm md:text-start">
                          <Link
                            href={`/category/${row.category.slug}`}
                            className="font-medium text-primary underline-offset-4 hover:underline"
                          >
                            {t("viewAllIn", { name: row.category.name })}
                          </Link>
                          <span className="text-muted-foreground">
                            {" "}
                            {t("productCount", { count: row.productCount })}
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
