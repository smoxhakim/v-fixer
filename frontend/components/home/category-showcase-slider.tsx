"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { getCategories } from "@/lib/api";
import { resolveMediaSrc } from "@/lib/media-url";
import {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

type ApiCategory = {
  id: number;
  name: string;
  slug: string;
  parent?: number | null;
  imageUrl?: string | null;
  image_url?: string | null;
};

const FOOTER_BGS = [
  "from-sky-100 to-blue-100",
  "from-green-50 to-emerald-100",
  "from-gray-100 to-slate-100",
] as const;

const PLACEHOLDER_GRADIENTS = [
  "from-sky-200/50 via-blue-100/40 to-indigo-200/60",
  "from-emerald-100/70 via-green-50/50 to-teal-100/60",
  "from-slate-200/60 via-gray-100/50 to-zinc-200/60",
] as const;

/** Time between auto-advance steps. */
const AUTO_SCROLL_MS = 2000;

export function CategoryShowcaseSlider() {
  const t = useTranslations("CategoryShowcase");
  const [categories, setCategories] = useState<ApiCategory[] | null>(null);
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [autoScrollPaused, setAutoScrollPaused] = useState(false);

  const setApi = useCallback((api: CarouselApi | undefined) => {
    setCarouselApi(api);
  }, []);

  useEffect(() => {
    getCategories()
      .then((list) => setCategories(Array.isArray(list) ? list : []))
      .catch(() => setCategories([]));
  }, []);

  const roots = useMemo(() => {
    if (!categories) return [];
    return categories.filter(
      (c) => c.parent == null || c.parent === undefined,
    );
  }, [categories]);

  useEffect(() => {
    if (!carouselApi || roots.length <= 1 || autoScrollPaused) return;
    const id = window.setInterval(() => {
      carouselApi.scrollNext();
    }, AUTO_SCROLL_MS);
    return () => window.clearInterval(id);
  }, [carouselApi, roots.length, autoScrollPaused]);

  if (categories !== null && roots.length === 0) {
    return null;
  }

  return (
    <section className="py-10">
      <div className="mx-auto max-w-7xl px-4">
        {categories === null ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="overflow-hidden rounded-xl border border-border/60 bg-muted/30 animate-pulse"
              >
                <div className="aspect-[4/3] bg-muted" />
                <div className="p-4">
                  <div className="mx-auto h-3 w-2/3 rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Carousel
            opts={{ align: "start", loop: true }}
            setApi={setApi}
            className="w-full"
            onMouseEnter={() => setAutoScrollPaused(true)}
            onMouseLeave={() => setAutoScrollPaused(false)}
          >
            <div className="flex items-center gap-2 sm:gap-3">
              <CarouselPrevious
                className="static top-auto left-auto right-auto shrink-0 translate-x-0 translate-y-0 border-border bg-card shadow-sm"
                aria-label={t("prevAria")}
              />
              <div className="min-w-0 flex-1">
                <CarouselContent>
                  {roots.map((cat, index) => {
                    const bg = FOOTER_BGS[index % FOOTER_BGS.length];
                    const ph =
                      PLACEHOLDER_GRADIENTS[
                        index % PLACEHOLDER_GRADIENTS.length
                      ];
                    const rawImg = cat.imageUrl ?? cat.image_url;
                    const imgSrc =
                      typeof rawImg === "string" && rawImg.trim()
                        ? resolveMediaSrc(rawImg.trim())
                        : "";
                    return (
                      <CarouselItem
                        key={cat.id}
                        className="basis-full sm:basis-1/2 lg:basis-1/3"
                      >
                        <Link
                          href={`/category/${cat.slug}`}
                          className={cn(
                            "group relative block overflow-hidden rounded-xl bg-gradient-to-br",
                            bg,
                          )}
                        >
                          <div
                            className={cn(
                              "relative aspect-[4/3] bg-gradient-to-br transition-transform duration-500 group-hover:scale-105",
                              !imgSrc && ph,
                            )}
                            aria-hidden
                          >
                            {imgSrc ? (
                              <Image
                                src={imgSrc}
                                alt=""
                                fill
                                className="object-cover"
                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                unoptimized
                              />
                            ) : null}
                          </div>
                          <div className="p-4 text-center">
                            <h3 className="text-sm font-bold uppercase tracking-wide text-foreground">
                              {cat.name}
                            </h3>
                          </div>
                        </Link>
                      </CarouselItem>
                    );
                  })}
                </CarouselContent>
              </div>
              <CarouselNext
                className="static top-auto left-auto right-auto shrink-0 translate-x-0 translate-y-0 border-border bg-card shadow-sm"
                aria-label={t("nextAria")}
              />
            </div>
          </Carousel>
        )}
      </div>
    </section>
  );
}
