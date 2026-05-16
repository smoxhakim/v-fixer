import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { ArrowRight } from "lucide-react";

import { ProductCard } from "@/components/product/product-card";
import { RevealHeading } from "@/components/ui/reveal-heading";
import type { BestSellingDisplayRow } from "@/lib/home-best-selling";

/* Single responsive grid — no horizontal rails, no hidden duplicates.
   2 cols on mobile (card ≈ 45vw), 3 on tablet, 4 on desktop. */
const productGridClass =
  "grid w-full grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-4 lg:gap-5";

function SectionHeader({
  title,
  action,
}: {
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3">
        <span aria-hidden className="block h-7 w-1.5 shrink-0 rounded-sm bg-warning" />
        <RevealHeading
          level={3}
          className="truncate text-xl font-black uppercase tracking-tight text-foreground md:text-2xl"
        >
          {title}
        </RevealHeading>
      </div>
      {action}
    </div>
  );
}

export async function BestSellingSection({
  items,
}: {
  items: BestSellingDisplayRow[];
}) {
  const t = await getTranslations("BestSelling");

  return (
    <section className="w-full overflow-hidden py-12">
      <div className="mx-auto w-full max-w-7xl px-4">
        <div className="mb-8 flex items-center gap-3">
          <span aria-hidden className="block h-8 w-2 shrink-0 rounded bg-warning" />
          <RevealHeading className="text-2xl font-black uppercase tracking-tight text-foreground md:text-3xl">
            {t("title")}
          </RevealHeading>
        </div>

        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {t("empty")}{" "}
            <Link
              href="/admin/dashboard/best-selling"
              className="font-medium text-warning underline-offset-4 hover:underline"
            >
              {t("configureAdmin")}
            </Link>
            .
          </p>
        ) : (
          <div className="flex flex-col gap-12">
            {items.map((row, i) =>
              row.kind === "product" ? (
                <div key={`p-${row.product.slug}-${i}`} className={productGridClass}>
                  <ProductCard product={row.product} />
                </div>
              ) : (
                <div key={`c-${row.category.slug}-${i}`} className="w-full">
                  <SectionHeader
                    title={row.category.name}
                    action={
                      row.products.length > 0 ? (
                        <Link
                          href={`/category/${row.category.slug}`}
                          className="hidden md:inline-flex shrink-0 items-center gap-1 text-xs font-bold uppercase tracking-wider text-warning hover:gap-1.5 transition-all"
                        >
                          {t("viewAllIn", { name: row.category.name })}
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      ) : null
                    }
                  />
                  {row.products.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      {t("noProductsCategory")}{" "}
                      <Link
                        href={`/category/${row.category.slug}`}
                        className="font-medium text-warning underline-offset-4 hover:underline"
                      >
                        {t("viewCategory")}
                      </Link>
                    </p>
                  ) : (
                    <>
                      {/* Render ALL products from the backend — no artificial slice. */}
                      <div className={productGridClass}>
                        {row.products.map((product, i) => (
                          <ProductCard
                            key={product.slug}
                            product={product}
                            index={i}
                          />
                        ))}
                      </div>
                      {row.productCount > row.products.length ? (
                        <p className="mt-4 text-xs">
                          <Link
                            href={`/category/${row.category.slug}`}
                            className="font-bold uppercase tracking-wider text-warning hover:underline"
                          >
                            {t("viewAllIn", { name: row.category.name })}
                          </Link>
                          <span className="ms-2 text-muted-foreground">
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
