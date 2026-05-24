"use client";

import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { ShoppingCart } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  motion,
  useMotionValue,
  useMotionTemplate,
  useSpring,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Chip } from "@heroui/react";

import { formatCurrency } from "@/lib/format";
import { useCart } from "@/context/cart-context";
import type { Product } from "@/lib/api";
import { resolveMediaSrc } from "@/lib/media-url";

/* Tuning */
const MAX_TILT = 12;                                                // degrees
const SPRING = { stiffness: 220, damping: 22, mass: 0.6 };
const SPRING_LEAVE = { stiffness: 140, damping: 18, mass: 0.8 };    // softer snap-back

/* Inline SVG noise: feTurbulence → grayscale alpha. URL-encoded so it can sit in CSS. */
const NOISE_DATA_URI =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'>` +
      `<filter id='n'>` +
        `<feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/>` +
        `<feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.55 0'/>` +
      `</filter>` +
      `<rect width='100%' height='100%' filter='url(%23n)'/>` +
    `</svg>`,
  );

/** Capability flag — only enable tilt + iridescence on fine pointers. */
function useFinePointer() {
  const [isFine, setIsFine] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setIsFine(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return isFine;
}

export function ProductCard({
  product,
  index = 0,
}: {
  product: Product;
  /** Position in the parent map — drives the staggered scroll-in delay. */
  index?: number;
}) {
  const t = useTranslations("ProductCard");
  const { addItem } = useCart();
  const thumb = product.images?.[0] ? resolveMediaSrc(product.images[0]) : "";
  const hasDiscount =
    typeof product.discountPrice === "number" && product.discountPrice > 0;
  const discountPct = hasDiscount
    ? Math.round(
        ((product.price - (product.discountPrice as number)) / product.price) *
          100,
      )
    : 0;

  const reduceMotion = useReducedMotion();
  const finePointer = useFinePointer();
  const effectsEnabled = finePointer && !reduceMotion;

  /* Normalized cursor offset from card center, range [-0.5, 0.5] on both axes.
     Stored as raw motion values; springs smooth the output. */
  const nx = useMotionValue(0);
  const ny = useMotionValue(0);

  const snx = useSpring(nx, SPRING);
  const sny = useSpring(ny, SPRING);

  /* 3D tilt — invert Y so pulling up tilts the top toward you (intuitive). */
  const rotateY = useTransform(snx, [-0.5, 0.5], [-MAX_TILT, MAX_TILT]);
  const rotateX = useTransform(sny, [-0.5, 0.5], [MAX_TILT, -MAX_TILT]);

  /* Cursor position expressed as CSS % for radial-gradient centers. */
  const mxPct = useTransform(snx, (v) => `${(v + 0.5) * 100}%`);
  const myPct = useTransform(sny, (v) => `${(v + 0.5) * 100}%`);

  /* Cool iridescent palette to harmonize with the new sky-blue brand —
     sweeps cyan → blue → magenta on the primary stop with a counter-sweep
     from rose → teal on the secondary. Reads as oil-on-chrome under cool
     light, not a rainbow. */
  const hue = useTransform(snx, [-0.5, 0.5], [180, 320]);
  const hue2 = useTransform(snx, [-0.5, 0.5], [340, 180]);

  /* Intensity rises with distance from center but caps lower — keeps it subtle. */
  const intensityRaw = useTransform([snx, sny], (latest) => {
    const arr = latest as unknown as number[];
    const x = arr[0];
    const y = arr[1];
    const d = Math.sqrt(x * x + y * y);
    return Math.min(0.7, 0.18 + d * 0.9);
  });
  const intensity = useSpring(intensityRaw, SPRING);

  /* Templates built from motion values — auto-update without React re-renders.
     Saturation pulled to 70% and lightness to 56% so colors read as refined
     metallics, not neon. */
  const irisBg = useMotionTemplate`
    radial-gradient(
      circle 300px at ${mxPct} ${myPct},
      hsl(${hue}, 70%, 56%) 0%,
      hsla(${hue2}, 60%, 50%, 0.4) 32%,
      transparent 64%
    )
  `;
  const specularBg = useMotionTemplate`
    radial-gradient(
      circle 130px at ${mxPct} ${myPct},
      rgba(255,240,220,0.32) 0%,
      rgba(255,240,220,0.08) 36%,
      transparent 66%
    )
  `;
  const borderGlow = useMotionTemplate`
    0 0 0 1px hsla(${hue}, 65%, 55%, ${intensity}),
    0 16px 36px -20px hsla(${hue2}, 55%, 45%, ${intensity})
  `;

  const wrapRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!effectsEnabled || !wrapRef.current) return;
    const rect = wrapRef.current.getBoundingClientRect();
    nx.set((e.clientX - rect.left) / rect.width - 0.5);
    ny.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const onLeave = () => {
    setHovered(false);
    /* Snap back via softer spring for a graceful exit. */
    nx.set(0);
    ny.set(0);
  };

  /* Reset internal stiffness on leave by swapping spring config; framer doesn't
     allow live config swap, so we just rely on the soft default + zero target. */
  void SPRING_LEAVE; // tuning preserved for future refinement

  /* Scroll-in: fade-up + scale. Staggered by the parent-supplied `index`.
     Skipped entirely when the user prefers reduced motion. */
  const scrollIn = reduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 40, scale: 0.95 },
        whileInView: { opacity: 1, y: 0, scale: 1 },
        viewport: { once: true, margin: "-50px" as const },
        transition: {
          duration: 0.4,
          delay: Math.min(index, 11) * 0.08, // cap at ~0.88s so off-screen rows don't queue forever
          ease: "easeOut" as const,
        },
      };

  return (
    <motion.div {...scrollIn} className="h-full">
    <motion.div
      ref={wrapRef}
      onMouseMove={onMove}
      onMouseEnter={() => effectsEnabled && setHovered(true)}
      onMouseLeave={onLeave}
      whileHover={effectsEnabled ? { y: -6 } : undefined}
      transition={{ type: "spring", stiffness: 280, damping: 22 }}
      className="h-full"
      style={{
        perspective: 1100,
        WebkitTapHighlightColor: "transparent",
      }}
    >
      <motion.div
        style={
          effectsEnabled
            ? {
                rotateX,
                rotateY,
                transformStyle: "preserve-3d",
                boxShadow: hovered ? borderGlow : undefined,
                willChange: "transform",
              }
            : undefined
        }
        className="h-full rounded-xl"
      >
        <div className="group relative flex h-full w-full flex-col bg-card border border-border rounded-xl overflow-hidden transition-colors hover:border-primary/60">
          {/* Link overlay covers card except interactive children (button is z-40). */}
          <Link
            href={`/product/${product.slug}`}
            aria-label={product.name}
            className="absolute inset-0 z-10"
          />

          <div>
            <div className="relative aspect-square overflow-hidden bg-secondary">
              {thumb ? (
                <Image
                  src={thumb}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              ) : (
                <div className="flex h-full min-h-[160px] items-center justify-center bg-muted text-xs text-muted-foreground">
                  {t("noImage")}
                </div>
              )}

              {hasDiscount ? (
                <Chip
                  color="danger"
                  size="sm"
                  className="absolute top-2 start-2 z-20 font-bold pointer-events-none rounded-md"
                >
                  -{discountPct}%
                </Chip>
              ) : null}

              {/* === Iridescence stack — all pointer-events-none, image-area only === */}
              {effectsEnabled ? (
                <>
                  {/* Iridescent shine — chromatic, dodges through the image */}
                  <motion.div
                    aria-hidden
                    className="absolute inset-0 z-30 pointer-events-none mix-blend-color-dodge"
                    style={{
                      background: irisBg,
                      opacity: hovered ? intensity : 0,
                    }}
                  />
                  {/* Specular highlight — bright spot near cursor */}
                  <motion.div
                    aria-hidden
                    className="absolute inset-0 z-30 pointer-events-none mix-blend-screen"
                    style={{
                      background: specularBg,
                      opacity: hovered ? intensity : 0,
                    }}
                  />
                  {/* Noise texture — adds grit, low opacity, soft-light blend */}
                  <div
                    aria-hidden
                    className="absolute inset-0 z-30 pointer-events-none mix-blend-soft-light opacity-[0.10]"
                    style={{
                      backgroundImage: `url("${NOISE_DATA_URI}")`,
                      backgroundSize: "180px 180px",
                    }}
                  />
                </>
              ) : null}
            </div>
          </div>

          <div className="flex flex-1 flex-col items-stretch gap-1 p-3 text-start">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
              {product.categorySlug
                ? product.categorySlug.replace("-", " ")
                : t("uncategorized")}
            </span>

            <span className="text-sm font-semibold text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors">
              {product.name}
            </span>

            <div className="mt-1 flex items-center justify-between gap-2">
              <div className="flex items-baseline gap-2">
                <span className="text-base font-bold text-primary">
                  {formatCurrency(product.discountPrice ?? product.price)}
                </span>
                {hasDiscount ? (
                  <span className="text-xs text-muted-foreground line-through">
                    {formatCurrency(product.price)}
                  </span>
                ) : null}
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  addItem(product);
                }}
                aria-label={t("addToCart", { name: product.name })}
                className="relative z-40 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground transition-opacity hover:opacity-90"
              >
                <ShoppingCart className="h-4 w-4" strokeWidth={2.2} />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
    </motion.div>
  );
}
