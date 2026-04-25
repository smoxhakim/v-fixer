"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
      "https://images.unsplash.com/photo-1592840496694-26d035b52b48?w=800&h=500&fit=crop",
    linkHref: "/category/game-console",
    gradientClass: "from-[#0a1628] to-[#1a3a5c]",
  },
  {
    tag: "NEW ARRIVALS",
    title: "MACBOOK PRO M3",
    description: "The most powerful laptop ever made",
    imageUrl:
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&h=500&fit=crop",
    linkHref: "/category/computer",
    gradientClass: "from-[#1a1a2e] to-[#16213e]",
  },
  {
    tag: "HOT DEALS",
    title: "AIRPODS PRO 2",
    description: "Adaptive Audio. Personalized Spatial Audio.",
    imageUrl:
      "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800&h=500&fit=crop",
    linkHref: "/category/audio",
    gradientClass: "from-[#0f2027] to-[#203a43]",
  },
];

const DEFAULT_SIDE: HomeHeroSlidePayload[] = [
  {
    tag: "NEW ARRIVALS",
    title: "BAMBOOBUDS",
    description: "",
    imageUrl:
      "https://images.unsplash.com/photo-1590658268037-6bf12f032f55?w=500&h=300&fit=crop",
    linkHref: "/category/audio",
    gradientClass: "from-[#e83e8c] to-[#6f42c1]",
  },
  {
    tag: "NEW ARRIVALS",
    title: "HOMEPOD PRO",
    description: "",
    imageUrl:
      "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&h=300&fit=crop",
    linkHref: "/category/audio",
    gradientClass: "from-[#1a1a2e] to-[#4a148c]",
  },
];

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
    const interval = setInterval(next, 5000);
    return () => clearInterval(interval);
  }, [next, slides.length]);

  if (!slides.length) {
    return null;
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="relative overflow-hidden rounded-xl lg:col-span-2">
          <div className="relative aspect-[16/9] lg:aspect-[16/8]">
            {slides.map((slide, i) => (
              <Link
                key={`${slide.href}-${i}`}
                href={slide.href}
                className={`absolute inset-0 transition-opacity duration-700 ${
                  i === current ? "opacity-100" : "pointer-events-none opacity-0"
                }`}
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${slide.bg}`} />
                {slide.image ? (
                  <Image
                    src={slide.image}
                    alt={slide.title}
                    fill
                    className="object-cover opacity-40 mix-blend-luminosity"
                    priority={i === 0}
                    sizes="(max-width: 1024px) 100vw, 66vw"
                  />
                ) : null}
                <div className="relative z-10 flex h-full flex-col justify-center p-6 md:p-10">
                  <span className="text-xs font-medium uppercase tracking-wider text-primary-foreground/70">
                    {slide.tag}
                  </span>
                  <h2 className="mt-2 text-balance text-2xl font-bold text-primary-foreground md:text-4xl">
                    {slide.title}
                  </h2>
                  {slide.description ? (
                    <p className="mt-2 text-sm text-primary-foreground/70">{slide.description}</p>
                  ) : null}
                  <span className="mt-4 inline-flex w-fit rounded-lg bg-card px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-primary hover:text-primary-foreground">
                    SHOP NOW
                  </span>
                </div>
              </Link>
            ))}
          </div>

          <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                prev();
              }}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-primary-foreground/30 text-primary-foreground/70 transition-colors hover:bg-primary-foreground/10"
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setCurrent(i);
                }}
                className={`h-2.5 w-2.5 rounded-full transition-colors ${
                  i === current ? "bg-primary" : "bg-primary-foreground/30"
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                next();
              }}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-primary-foreground/30 text-primary-foreground/70 transition-colors hover:bg-primary-foreground/10"
              aria-label="Next slide"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {promos.map((promo, i) => (
            <Link
              key={`${promo.href}-${i}`}
              href={promo.href}
              className="relative flex-1 overflow-hidden rounded-xl"
            >
              <div className={`absolute inset-0 bg-gradient-to-r ${promo.bg}`} />
              {promo.image ? (
                <Image
                  src={promo.image}
                  alt={promo.title}
                  fill
                  className="object-cover opacity-30 mix-blend-luminosity"
                  sizes="(max-width: 1024px) 100vw, 33vw"
                />
              ) : null}
              <div className="relative z-10 flex h-full min-h-[140px] flex-col justify-center p-5">
                <span className="inline-flex w-fit rounded bg-accent px-2 py-0.5 text-[10px] font-bold uppercase text-accent-foreground">
                  {promo.tag}
                </span>
                <h3 className="mt-2 text-lg font-bold text-primary-foreground">{promo.title}</h3>
                <span className="mt-2 flex items-center gap-1 text-xs font-medium text-primary-foreground/80 hover:text-primary-foreground">
                  Shop Now →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
