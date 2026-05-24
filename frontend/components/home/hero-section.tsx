"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button, Chip } from "@heroui/react";

import type { HomeHeroSlidePayload } from "@/lib/home-hero";
import { resolveMediaSrc } from "@/lib/media-url";

type VisualSlide = {
  tag: string;
  title: string;
  description: string;
  image: string;
  href: string;
};

const DEFAULT_MAIN: HomeHeroSlidePayload[] = [
  {
    tag: "PRO TOOLS",
    title: "MICROSCOPES STÉRÉO",
    description: "Précision optique pour réparations micro-soudure",
    imageUrl:
      "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=1400&h=800&fit=crop",
    linkHref: "/category/microscopes",
    gradientClass: "from-black via-neutral-900 to-neutral-950",
  },
  {
    tag: "NOUVEAUTÉ",
    title: "CAMÉRAS THERMIQUES",
    description: "Détectez chaque court-circuit en quelques secondes",
    imageUrl:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1400&h=800&fit=crop",
    linkHref: "/category/thermal-camera",
    gradientClass: "from-black via-neutral-900 to-neutral-950",
  },
  {
    tag: "HOT DEALS",
    title: "STATIONS À SOUDER",
    description: "L'atelier des pros, en promotion ce mois-ci",
    imageUrl:
      "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=1400&h=800&fit=crop",
    linkHref: "/products",
    gradientClass: "from-black via-neutral-900 to-neutral-950",
  },
];

const DEFAULT_SIDE: HomeHeroSlidePayload[] = [
  {
    tag: "NOUVEAUTÉ",
    title: "OUTILS DE PRÉCISION",
    description: "",
    imageUrl:
      "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=900&h=720&fit=crop",
    linkHref: "/products",
    gradientClass: "from-black to-neutral-900",
  },
  {
    tag: "ATELIER",
    title: "ALIMENTATIONS LAB",
    description: "",
    imageUrl:
      "https://images.unsplash.com/photo-1581090700227-1e37b190418e?w=900&h=720&fit=crop",
    linkHref: "/products",
    gradientClass: "from-black to-neutral-900",
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
  const router = useRouter();

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
    setCurrent((c) =>
      slides.length ? (c - 1 + slides.length) % slides.length : 0,
    );
  }, [slides.length]);

  useEffect(() => {
    if (!slides.length) return;
    const id = window.setInterval(next, 6500);
    return () => window.clearInterval(id);
  }, [next, slides.length]);

  if (!slides.length) return null;

  const active = slides[current];

  return (
    <section className="mx-auto w-full max-w-7xl overflow-hidden px-4 py-4 md:py-6">
      <div className="grid w-full grid-cols-1 items-stretch gap-4 md:gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        {/* Main hero */}
        <div className="relative isolate w-full min-h-[300px] md:min-h-[360px] lg:min-h-[440px] bg-neutral-950 border border-border rounded-2xl overflow-hidden shadow-xl">
          <div className="relative h-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={active.href + current}
                initial={{ opacity: 0, scale: 1.03 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="absolute inset-0"
              >
                {active.image ? (
                  <Image
                    src={active.image}
                    alt={active.title}
                    fill
                    priority
                    className="object-cover object-center"
                    sizes="(max-width: 1024px) 100vw, 67vw"
                  />
                ) : null}
                <div
                  aria-hidden
                  className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/30"
                />
                <div
                  aria-hidden
                  className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/70 to-transparent"
                />
              </motion.div>
            </AnimatePresence>

            <div className="relative z-10 flex h-full min-h-[inherit] flex-col justify-center px-6 pb-24 pt-8 md:px-12 md:pb-28 lg:max-w-[36rem]">
              <Chip
                color="warning"
                variant="flat"
                size="sm"
                className="w-fit font-bold uppercase tracking-[0.2em] text-primary bg-primary/15 rounded-md"
              >
                {active.tag}
              </Chip>
              <h2
                title={active.title}
                className="mt-4 font-black uppercase tracking-tight text-white drop-shadow-md leading-[1.05] text-3xl sm:text-4xl md:text-5xl lg:text-6xl line-clamp-3"
              >
                {active.title}
              </h2>
              {active.description ? (
                <p className="mt-3 max-w-md text-sm md:text-base text-white/85 leading-relaxed">
                  {active.description}
                </p>
              ) : null}
              <Button
                size="lg"
                onPress={() => router.push(active.href)}
                className="mt-7 w-fit rounded-full bg-primary text-primary-foreground font-bold uppercase tracking-wider px-6 py-3 hover:opacity-90 inline-flex items-center gap-2"
              >
                {t("shopNow")}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Slide controls */}
            <div className="pointer-events-none absolute inset-x-0 bottom-5 z-20 flex justify-center px-4">
              <div className="pointer-events-auto inline-flex items-center gap-1 rounded-full border border-white/15 bg-black/65 px-1.5 py-1.5 shadow-lg backdrop-blur-md">
                <button
                  type="button"
                  onClick={prev}
                  className="flex size-8 items-center justify-center rounded-full text-white/85 transition-colors hover:bg-white/10"
                  aria-label={t("prevSlide")}
                >
                  <ChevronLeft className="size-5" strokeWidth={2} />
                </button>
                <div className="flex items-center gap-1.5 px-1">
                  {slides.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setCurrent(i)}
                      className={`rounded-full transition-all ${
                        i === current
                          ? "h-2 w-6 bg-primary"
                          : "h-2 w-2 bg-white/40 hover:bg-white/60"
                      }`}
                      aria-label={t("goToSlide", { n: i + 1 })}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={next}
                  className="flex size-8 items-center justify-center rounded-full text-white/85 transition-colors hover:bg-white/10"
                  aria-label={t("nextSlide")}
                >
                  <ChevronRight className="size-5" strokeWidth={2} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Side promos */}
        <div className="flex min-h-[300px] flex-col gap-4 md:min-h-[360px] lg:min-h-0 lg:gap-5">
          {promos.map((promo, i) => (
            <div
              key={`${promo.href}-${i}`}
              className="relative w-full flex-1 basis-0 min-h-[160px] overflow-hidden bg-neutral-950 border border-border rounded-2xl shadow-md group"
            >
              <Link
                href={promo.href}
                aria-label={promo.title}
                className="absolute inset-0 z-20"
              />
              {promo.image ? (
                <Image
                  src={promo.image}
                  alt={promo.title}
                  fill
                  className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 1024px) 100vw, 34vw"
                />
              ) : null}
              <div
                aria-hidden
                className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/20"
              />
              <div className="relative z-10 flex h-full min-h-[160px] flex-col justify-between gap-3 p-5 md:p-6">
                <div>
                  <Chip
                    color="warning"
                    variant="flat"
                    size="sm"
                    className="font-bold uppercase tracking-[0.18em] text-primary bg-primary/15 rounded-md"
                  >
                    {promo.tag}
                  </Chip>
                  <h3
                    title={promo.title}
                    className="mt-3 break-words font-black uppercase leading-tight tracking-tight text-white drop-shadow-md line-clamp-3 text-lg md:text-xl"
                  >
                    {promo.title}
                  </h3>
                </div>
                <span className="inline-flex items-center gap-1.5 text-sm font-bold uppercase tracking-wider text-primary transition group-hover:gap-2">
                  {t("shopNowSide")}
                  <ArrowRight className="size-4 shrink-0" aria-hidden />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
