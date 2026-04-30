import type { Metadata } from "next";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getCategories } from "@/lib/api";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { resolveMediaSrc } from "@/lib/media-url";

type StoreCategory = {
  id: string | number;
  name: string;
  slug: string;
  image_url?: string | null;
  imageUrl?: string | null;
};

const PLACEHOLDER_GRADIENTS = [
  "from-sky-200/50 via-blue-100/40 to-indigo-200/60",
  "from-emerald-100/70 via-green-50/50 to-teal-100/60",
  "from-slate-200/60 via-gray-100/50 to-zinc-200/60",
] as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "CategoriesIndex" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default async function CategoriesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("CategoriesIndex");
  const tCat = await getTranslations("CategoryPage");
  const categories = (await getCategories()) as StoreCategory[];

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-3 text-sm text-muted-foreground">
          <Link href="/" className="transition-colors hover:text-primary">
            {tCat("home")}
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="font-medium text-foreground">{t("title")}</span>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="text-2xl font-bold text-foreground">{t("title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>

        {categories.length === 0 ? (
          <p className="mt-12 text-center text-muted-foreground">{t("empty")}</p>
        ) : (
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat, index) => {
              const raw = cat.imageUrl ?? cat.image_url;
              const imgSrc =
                typeof raw === "string" && raw.trim() ? resolveMediaSrc(raw.trim()) : "";
              const ph = PLACEHOLDER_GRADIENTS[index % PLACEHOLDER_GRADIENTS.length];
              return (
                <li key={String(cat.id)}>
                  <Link
                    href={`/category/${cat.slug}`}
                    className="group block overflow-hidden rounded-xl border border-border bg-card text-foreground shadow-sm transition-colors hover:border-primary"
                  >
                    <div
                      className={cn(
                        "relative aspect-[4/3] bg-muted",
                        !imgSrc && `bg-gradient-to-br ${ph}`,
                      )}
                    >
                      {imgSrc ? (
                        <Image
                          src={imgSrc}
                          alt=""
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          unoptimized
                        />
                      ) : null}
                    </div>
                    <div className="flex items-center justify-between gap-2 p-4">
                      <span className="text-sm font-semibold uppercase tracking-wide text-foreground">
                        {cat.name}
                      </span>
                      <ChevronRight
                        className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                        aria-hidden
                      />
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
