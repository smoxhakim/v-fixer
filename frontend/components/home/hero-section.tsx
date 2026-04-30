"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

import type { HomeHeroSlidePayload } from "@/lib/home-hero";
import { resolveMediaSrc } from "@/lib/media-url";

type VisualSlide = {
  tag: string;
  title: string;
  description: string;
  image: string;
  href: string;
  bg: string;
};

const DEFAULT_MAIN: HomeHeroSlidePayload[] = [
  {
    tag: "GAMING GEAR",
    title: "GAME CONTROLLER",
    description: "Controller type: Wireless controller",
    imageUrl:
      "https://images.unsplash.com/photo-1592840496694-26d035b52b48?w=1200&h=720&fit=crop",
    linkHref: "/category/game-console",
    gradientClass: "from-[#050a14] via-[#0c1a32] to-[#142e52]",
  },
  {
    tag: "NEW ARRIVALS",
    title: "MACBOOK PRO M3",
    description: "The most powerful laptop ever made",
    imageUrl:
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1200&h=720&fit=crop",
    linkHref: "/category/computer",
    gradientClass: "from-[#0d0d12] via-[#151528] to-[#1e1e3a]",
  },
  {
    tag: "HOT DEALS",
    title: "AIRPODS PRO 2",
    description: "Adaptive Audio. Personalized Spatial Audio.",
    imageUrl:
      "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=1200&h=720&fit=crop",
    linkHref: "/category/audio",
    gradientClass: "from-[#061018] via-[#0f2430] to-[#1a3545]",
  },
];

const DEFAULT_SIDE: HomeHeroSlidePayload[] = [
  {
    tag: "NEW ARRIVALS",
    title: "BAMBOOBUDS",
    description: "",
    imageUrl:
      "https://images.unsplash.com/photo-1590658268037-6bf12f032f55?w=800&h=640&fit=crop",
    linkHref: "/category/audio",
    gradientClass: "from-violet-600 to-purple-900",
  },
  {
    tag: "NEW ARRIVALS",
    title: "HOMEPOD PRO",
    description: "",
    imageUrl:
      "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&h=640&fit=crop",
    linkHref: "/category/audio",
    gradientClass: "from-zinc-900 to-black",
  },
];

/** Side promo shell: vivid purple slot vs dark slot (reference layout). */
const SIDE_SHELL = [
  "bg-gradient-to-br from-violet-600 via-purple-700 to-indigo-950",
  "bg-gradient-to-br from-zinc-950 via-neutral-950 to-black",
] as const;

function toVisual(s: HomeHeroSlidePayload): VisualSlide {
  const img = s.imageUrl.trim();
  return {
    tag: s.tag,
    title: s.title,
    description: s.description,
    image: img ? resolveMediaSrc(img) : "",
    href: s.linkHref || "/",
    bg: s.gradientClass.trim() || "from-muted to-muted",
  };
}

export function HeroSection({
  mainSlides: mainProp,
  sidePromos: sideProp,
}: {
  mainSlides?: HomeHeroSlidePayload[] | null;
  sidePromos?: HomeHeroSlidePayload[] | null;
}) {
  const t = useTranslations("Hero");
  const slides = useMemo(() => {
    const src = mainProp?.length ? mainProp : DEFAULT_MAIN;
    return src.map(toVisual);
  }, [mainProp]);

  const promos = useMemo(() => {
    const src = sideProp?.length ? sideProp : DEFAULT_SIDE;
    return src.map(toVisual);
  }, [sideProp]);

  const [current, setCurrent] = useState(0);

  useEffect(() => {
    setCurrent((c) => (slides.length ? Math.min(c, slides.length - 1) : 0));
  }, [slides.length]);

  const next = useCallback(() => {
    setCurrent((c) => (slides.length ? (c + 1) % slides.length : 0));
  }, [slides.length]);

  const prev = useCallback(() => {
    setCurrent((c) => (slides.length ? (c - 1 + slides.length) % slides.length : 0));
  }, [slides.length]);

  useEffect(() => {
    if (!slides.length) return;
    const interval = setInterval(next, 6000);
    return () => clearInterval(interval);
  }, [next, slides.length]);

  if (!slides.length) {
    return null;
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-4 md:py-6">
      <div className="grid grid-cols-1 items-stretch gap-4 md:gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        {/* Main carousel — ~2/3 width */}
        <div className="relative isolate min-h-[280px] overflow-hidden rounded-2xl shadow-xl ring-1 ring-black/10 md:min-h-[320px] lg:min-h-[400px]">
          <div className="relative h-full min-h-[inherit] overflow-hidden">
            {slides.map((slide, i) => (
              <Link
                key={`${slide.href}-${i}`}
                href={slide.href}
                className={`absolute inset-0 overflow-hidden transition-opacity duration-700 ease-out ${
                  i === current ? "z-[2] opacity-100" : "z-0 opacity-0 pointer-events-none"
                }`}
              >
                {/* Dark base so no CMS gradient shows as a strip if the photo letterboxes */}
                <div className="absolute inset-0 bg-neutral-950" aria-hidden />
                {slide.image ? (
                  <div className="absolute inset-0 overflow-hidden">
                    <Image
                      src={slide.image}
                      alt={slide.title}
                      fill
                      className="object-cover object-center scale-[1.02]"
                      priority={i === 0}
                      sizes="(max-width: 1024px) 100vw, 67vw"
                    />
                  </div>
                ) : (
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${slide.bg}`}
                    aria-hidden
                  />
                )}
                {/* Readability: keep right edge slightly darkened so no bright/blue seam */}
                <div
                  className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-black/35 md:via-black/35 md:to-black/40"
                  aria-hidden
                />
                <div className="relative z-10 flex h-full min-h-0 min-w-0 flex-col justify-center px-6 pb-24 pt-8 md:px-10 md:pb-28 lg:max-w-[min(100%,34rem)]">
                  <div className="min-h-0 min-w-0 shrink">
                    <span className="inline-block text-[11px] font-semibold uppercase tracking-[0.2em] text-white/75">
                      {slide.tag}
                    </span>
                    <h2
                      title={slide.title}
                      className="mt-2 max-w-full text-balance break-words text-xl font-extrabold uppercase leading-[1.12] tracking-tight text-white drop-shadow-md line-clamp-4 sm:text-2xl md:line-clamp-5 md:text-3xl lg:text-3xl xl:text-4xl"
                    >
                      {slide.title}
                    </h2>
                    {slide.description ? (
                      <p className="mt-2 line-clamp-2 text-sm leading-snug text-white/80 md:text-base">
                        {slide.description}
                      </p>
                    ) : null}
                  </div>
                  <span className="mt-5 inline-flex w-fit shrink-0 items-center justify-center rounded-md bg-white px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-neutral-950 shadow-lg transition hover:bg-white/90 md:mt-6 md:px-7 md:py-3">
                    {t("shopNow")}
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {/* Pill carousel control */}
          <div className="pointer-events-none absolute inset-x-0 bottom-5 z-20 flex justify-center px-4">
            <div className="pointer-events-auto inline-flex items-center gap-1 rounded-full border border-neutral-200/80 bg-white/95 px-1.5 py-1.5 shadow-lg backdrop-blur-sm">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  prev();
                }}
                className="flex size-8 items-center justify-center rounded-full text-neutral-700 transition-colors hover:bg-neutral-100"
                aria-label={t("prevSlide")}
              >
                <ChevronLeft className="size-5" strokeWidth={2} />
              </button>
              <div className="flex items-center gap-1.5 px-1">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrent(i);
                    }}
                    className={`rounded-full transition-all ${
                      i === current
                        ? "h-2 w-6 bg-neutral-800"
                        : "h-2 w-2 bg-neutral-300 hover:bg-neutral-400"
                    }`}
                    aria-label={t("goToSlide", { n: i + 1 })}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  next();
                }}
                className="flex size-8 items-center justify-center rounded-full text-neutral-700 transition-colors hover:bg-neutral-100"
                aria-label={t("nextSlide")}
              >
                <ChevronRight className="size-5" strokeWidth={2} />
              </button>
            </div>
          </div>
        </div>

        {/* Side promos — stacked ~1/3 */}
        <div className="flex min-h-[280px] flex-col gap-4 md:min-h-[320px] lg:min-h-0 lg:gap-5">
          {promos.map((promo, i) => (
            <Link
              key={`${promo.href}-${i}`}
              href={promo.href}
              className={`relative flex flex-1 basis-0 flex-col justify-center overflow-hidden rounded-2xl shadow-lg ring-1 ring-black/10 ${SIDE_SHELL[i % SIDE_SHELL.length]}`}
            >
              {promo.image ? (
                <div className="absolute inset-0 overflow-hidden bg-neutral-950">
                  <Image
                    src={promo.image}
                    alt={promo.title}
                    fill
                    className="object-cover object-center transition duration-500 hover:scale-105"
                    sizes="(max-width: 1024px) 100vw, 34vw"
                  />
                </div>
              ) : null}
              <div
                className={`absolute inset-0 ${
                  i % 2 === 0
                    ? "bg-gradient-to-r from-violet-900/85 via-purple-800/40 to-transparent"
                    : "bg-gradient-to-r from-black/85 via-neutral-900/50 to-transparent"
                }`}
                aria-hidden
              />
              <div className="relative z-10 flex h-full min-h-[160px] min-w-0 flex-col justify-between gap-3 p-5 md:p-6 lg:max-w-[min(100%,85%)]">
                <div className="min-h-0 min-w-0 shrink pt-0.5">
                  <span className="inline-block text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-400">
                    {promo.tag}
                  </span>
                  <h3
                    title={promo.title}
                    className="mt-2 max-w-full break-words text-base font-bold uppercase leading-snug tracking-tight text-white drop-shadow-md line-clamp-3 sm:text-lg md:line-clamp-4 md:text-xl"
                  >
                    {promo.title}
                  </h3>
                </div>
                <span className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-white/95 transition hover:gap-2">
                  {t("shopNowSide")}
                  <ArrowRight className="size-4 shrink-0 opacity-90" aria-hidden />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
