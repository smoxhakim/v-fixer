"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

import { getCategories } from "@/lib/api";
import { resolveMediaSrc } from "@/lib/media-url";
import { RevealHeading } from "@/components/ui/reveal-heading";

type ApiCategory = {
  id: number;
  name: string;
  slug: string;
  parent?: number | null;
  imageUrl?: string | null;
  image_url?: string | null;
};

/* === CategoryTile === unchanged from previous version === */
function CategoryTile({ cat }: { cat: ApiCategory }) {
  const rawImg = cat.imageUrl ?? cat.image_url;
  const imgSrc =
    typeof rawImg === "string" && rawImg.trim()
      ? resolveMediaSrc(rawImg.trim())
      : "";

  return (
    <div className="relative h-full w-full bg-card border border-border rounded-xl overflow-hidden group hover:border-warning/60 transition-colors">
      <Link
        href={`/category/${cat.slug}`}
        aria-label={cat.name}
        className="absolute inset-0 z-10"
      />
      <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
        {imgSrc ? (
          <Image
            src={imgSrc}
            alt={cat.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 65vw, (max-width: 1024px) 33vw, 25vw"
            unoptimized
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
            {cat.name}
          </div>
        )}
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90"
        />
        <div className="absolute inset-x-0 bottom-0 p-3 flex items-center justify-between gap-2 text-white">
          <span className="text-sm font-bold uppercase tracking-wide">
            {cat.name}
          </span>
          <ArrowRight className="h-4 w-4 text-warning shrink-0 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </div>
  );
}

/* === Carousel === */

const AUTO_SCROLL_MS = 3000;
const SWIPE_THRESHOLD_PX = 40;
const RESUME_AFTER_TOUCH_MS = 2500;

export function CategoryShowcaseSlider() {
  const locale = useLocale();
  const isRtl = locale === "ar";
  const heading = isRtl ? "الفئات" : "Catégories";

  const [categories, setCategories] = useState<ApiCategory[] | null>(null);
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  /* visible-cards count is responsive: 1.5 on mobile so the user sees a peek,
     3 on desktop. Tracked with matchMedia so we don't hydrate against a
     mismatched assumption. */
  const [visible, setVisible] = useState(1.5);

  useEffect(() => {
    getCategories()
      .then((list) => setCategories(Array.isArray(list) ? list : []))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setVisible(mq.matches ? 3 : 1.5);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const roots = useMemo(() => {
    if (!categories) return [];
    return categories.filter((c) => c.parent == null);
  }, [categories]);

  /* Auto-advance every 3s; pauses while user is hovering or actively touching.
     No-op if there's nothing to scroll past (fewer items than the visible slot
     count). Cleared on every dep change so we don't double-fire. */
  useEffect(() => {
    if (paused || roots.length <= visible) return;
    const id = window.setInterval(() => {
      setCurrent((c) => (c + 1) % roots.length);
    }, AUTO_SCROLL_MS);
    return () => window.clearInterval(id);
  }, [paused, roots.length, visible]);

  const next = () =>
    setCurrent((c) => (roots.length ? (c + 1) % roots.length : 0));
  const prev = () =>
    setCurrent((c) =>
      roots.length ? (c - 1 + roots.length) % roots.length : 0,
    );

  /* Touch swipe — direction depends on locale so the gesture feels natural
     in both LTR and RTL. */
  const touchStartX = useRef<number | null>(null);
  const resumeTimer = useRef<number | null>(null);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    setPaused(true);
    if (resumeTimer.current) window.clearTimeout(resumeTimer.current);
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current !== null) {
      const dx = e.changedTouches[0].clientX - touchStartX.current;
      if (Math.abs(dx) > SWIPE_THRESHOLD_PX) {
        /* swipe-right in LTR = previous; in RTL = next. */
        const wantsPrev = isRtl ? dx < 0 : dx > 0;
        wantsPrev ? prev() : next();
      }
      touchStartX.current = null;
    }
    resumeTimer.current = window.setTimeout(
      () => setPaused(false),
      RESUME_AFTER_TOUCH_MS,
    );
  };

  useEffect(
    () => () => {
      if (resumeTimer.current) window.clearTimeout(resumeTimer.current);
    },
    [],
  );

  if (categories !== null && roots.length === 0) return null;

  const step = 100 / visible;
  /* In RTL, positive translateX moves children visually to the right but the
     CSS axis is the same — flip the sign so "next" advances in reading order. */
  const offset = (isRtl ? 1 : -1) * current * step;
  const canScroll = roots.length > visible;

  return (
    <section className="w-full overflow-hidden py-12">
      <div className="mx-auto w-full max-w-7xl px-4">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span
              aria-hidden
              className="block h-8 w-2 shrink-0 rounded bg-warning"
            />
            <RevealHeading className="text-2xl font-black uppercase tracking-tight text-foreground md:text-3xl">
              {heading}
            </RevealHeading>
          </div>

          {canScroll ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={prev}
                aria-label="Previous"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:border-warning hover:text-warning"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={next}
                aria-label="Next"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:border-warning hover:text-warning"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          ) : null}
        </div>

        {categories === null ? (
          <div className="grid w-full grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="overflow-hidden rounded-xl border border-border bg-card animate-pulse"
              >
                <div className="aspect-[4/3] bg-muted" />
              </div>
            ))}
          </div>
        ) : (
          <>
            <div
              className="w-full overflow-hidden"
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
              onTouchStart={onTouchStart}
              onTouchEnd={onTouchEnd}
            >
              <div
                className="flex transition-transform duration-500 ease-in-out will-change-transform"
                style={{ transform: `translateX(${offset}%)` }}
              >
                {roots.map((cat) => (
                  <div
                    key={cat.id}
                    className="flex-shrink-0 w-[70vw] md:w-[33.333%] px-2"
                  >
                    <CategoryTile cat={cat} />
                  </div>
                ))}
              </div>
            </div>

            {roots.length > 1 ? (
              <div className="mt-5 flex justify-center gap-1.5">
                {roots.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    aria-label={`Go to slide ${i + 1}`}
                    onClick={() => setCurrent(i)}
                    className={`h-2 rounded-full transition-all ${
                      i === current
                        ? "w-6 bg-warning"
                        : "w-2 bg-border hover:bg-muted-foreground"
                    }`}
                  />
                ))}
              </div>
            ) : null}
          </>
        )}
      </div>
    </section>
  );
}
