"use client";

/**
 * /dev/theme-probe — M1 spike (2026-05-20).
 *
 * Verifies that DESIGN.md color tokens flow into HeroUI v3 components
 * via the CSS-cascade override in globals.css. Colors only — no fonts,
 * spacing, or motion tokens yet.
 *
 * Components rendered: Button (primary), Chip, Card with sample product
 * layout. Light/dark toggle attaches `dark` class to <html>.
 */

import { useEffect, useState, type ComponentProps, type FC, type ReactNode } from "react";
import {
  Avatar,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardFooter,
  Chip,
  I18nProvider,
  Switch,
} from "@heroui/react";
import { usePretextHeights } from "@/lib/pretext";
import { CrossFadeStack } from "@/components/ui/cross-fade-stack";
import { ProductCard } from "@/components/ui/product-card";
import type { Product } from "@/lib/api";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

/* Mock products for the section 10 ProductCard demo. Real Product type
   shape — keeps the probe honest and forces us to handle every required
   field, including the no-image placeholder path. */
const S10_PRODUCTS: Product[] = [
  {
    id: 1,
    name: "Station de soudage Aifen A902 Pro — 2 fers et 9 pannes Magma incluses",
    slug: "aifen-a902pro",
    price: 4200,
    discountPrice: 3800,
    rating: 0,
    images: [],
    specs: [],
    stock: 3,
  },
  {
    id: 2,
    name: "Panne Magma C115-K",
    slug: "magma-c115-k",
    price: 95,
    rating: 0,
    images: [],
    specs: [],
    stock: 42,
  },
  {
    id: 3,
    name: "Microscope trinoculaire Kaisi TX-350E avec bras articulé MRS-1",
    slug: "kaisi-tx350e",
    price: 4500,
    rating: 0,
    images: [],
    specs: [],
    stock: 0,
  },
  {
    id: 4,
    name: "Tresse à dessouder Goot CP-1515",
    slug: "goot-cp1515",
    price: 95,
    rating: 0,
    images: [],
    specs: [],
    stock: 18,
  },
];

/* ----------------------------------------------------------------------
   HeroUI v3 typed adapters
   ----------------------------------------------------------------------
   HeroUI v3 wraps react-aria primitives via `ComponentPropsWithRef<typeof
   X>`, but react-aria types Button/Switch/Input as plain callable signatures
   (`(props) => ReactElement | null`) rather than `ForwardRefExoticComponent`.
   TS can't recover children/isSelected/placeholder from that — so the .d.ts
   surface drops props the runtime actually destructures (verified by
   inspecting button.d.ts: `({ children, ...rest }: ButtonRootProps)`).
   We re-add the missing prop shapes here so the probe stays type-safe.
   Track upstream — when HeroUI ships a wrapped `forwardRef` typing or
   re-exports proper props, delete these adapters and import directly. */
type BtnProps = ComponentProps<typeof Button> & {
  children?: ReactNode;
  onPress?: () => void;
};
const Btn = Button as unknown as FC<BtnProps>;

type Sw = ComponentProps<typeof Switch> & {
  isSelected?: boolean;
  defaultSelected?: boolean;
  onChange?: (selected: boolean) => void;
};
const Switcher = Switch as unknown as FC<Sw>;

export default function ThemeProbe() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [s8Dir, setS8Dir] = useState<"ltr" | "rtl">("ltr");
  const [s9PhotoIdx, setS9PhotoIdx] = useState(0);
  const [s9SquareIdx, setS9SquareIdx] = useState(0);
  usePretextHeights();

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    root.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <I18nProvider locale="fr-MA">
      <main
        style={{
          minHeight: "100vh",
          background: "var(--vfx-bg)",
          color: "var(--vfx-ink)",
          padding: "48px 24px",
        }}
      >
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          {/* Probe header */}
          <header
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 32,
              paddingBottom: 16,
              borderBottom: "1px solid var(--vfx-rule)",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 11,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "var(--vfx-muted)",
                  marginBottom: 4,
                }}
              >
                M1 spike · theme probe
              </div>
              <h1 style={{ fontSize: 28, fontWeight: 500, lineHeight: 1.15 }}>
                HeroUI v3 + DESIGN.md tokens
              </h1>
              <p
                style={{
                  fontSize: 13,
                  color: "var(--vfx-muted)",
                  marginTop: 6,
                }}
              >
                Colors only. No fonts/spacing/motion yet. Toggle to verify
                both themes resolve correctly.
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                setTheme((t) => (t === "light" ? "dark" : "light"))
              }
              style={{
                fontFamily: "ui-monospace, monospace",
                fontSize: 11,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                padding: "8px 14px",
                background: "var(--vfx-surface)",
                color: "var(--vfx-ink)",
                border: "1px solid var(--vfx-rule)",
                borderRadius: 9999,
                cursor: "pointer",
              }}
            >
              Theme: {theme}
            </button>
          </header>

          {/* Token swatches — sanity check that variables resolve */}
          <section style={{ marginBottom: 40 }}>
            <h2
              style={{
                fontSize: 11,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "var(--vfx-muted)",
                marginBottom: 12,
              }}
            >
              01 · Canonical tokens
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
                gap: 1,
                background: "var(--vfx-rule)",
                border: "1px solid var(--vfx-rule)",
              }}
            >
              {[
                ["--vfx-bg", "background"],
                ["--vfx-surface", "surface"],
                ["--vfx-surface-2", "surface-2"],
                ["--vfx-ink", "ink"],
                ["--vfx-muted", "muted"],
                ["--vfx-rule", "rule"],
                ["--vfx-accent", "accent"],
                ["--vfx-in-stock", "in-stock"],
                ["--vfx-low-stock", "low-stock"],
                ["--vfx-out-stock", "out-stock"],
              ].map(([varName, label]) => (
                <div
                  key={varName}
                  style={{
                    background: `var(${varName})`,
                    color:
                      varName === "--vfx-ink" || varName === "--vfx-muted" || varName === "--vfx-accent" || varName.includes("stock")
                        ? "#FFFFFF"
                        : "var(--vfx-ink)",
                    padding: "20px 14px",
                    minHeight: 90,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    fontFamily: "ui-monospace, monospace",
                    fontSize: 11,
                  }}
                >
                  <span>{label}</span>
                  <span style={{ opacity: 0.75 }}>{varName}</span>
                </div>
              ))}
            </div>
          </section>

          {/* HeroUI primitives */}
          <section style={{ marginBottom: 40 }}>
            <h2
              style={{
                fontSize: 11,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "var(--vfx-muted)",
                marginBottom: 12,
              }}
            >
              02 · HeroUI Button (v3 variants)
            </h2>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {/* v3 Button has no `color` prop — variant encodes both look
                  and intent. The seven variants below are the entire surface
                  exposed by @heroui/styles → button.styles.js. */}
              <Btn variant="primary">Ajouter au panier</Btn>
              <Btn variant="secondary">Secondary</Btn>
              <Btn variant="tertiary">Tertiary</Btn>
              <Btn variant="outline">Outline</Btn>
              <Btn variant="ghost">Ghost</Btn>
              <Btn variant="danger">Out of stock</Btn>
              <Btn variant="danger-soft">Soft danger</Btn>
            </div>
          </section>

          <section style={{ marginBottom: 40 }}>
            <h2
              style={{
                fontSize: 11,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "var(--vfx-muted)",
                marginBottom: 12,
              }}
            >
              03 · HeroUI Chip
            </h2>
            <div
              style={{
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              {/* v2 → v3 Chip mapping (apply consistently across sections):
                    color="primary"      → color="accent"        (DESIGN.md blueprint blue)
                    variant="bordered"   → variant="tertiary"    (transparent bg + colored text; no border in v3)
                    variant="flat"       → variant="soft"        (muted tinted background)
                    no variant + solid   → variant="primary"     (solid filled chip) */}
              <Chip color="accent" variant="primary">REF · AIFEN-A902PRO</Chip>
              {/* Stock-status chips: tertiary variant + data-stock opt-in
                  border (DESIGN.md exception — see globals.css chip rule). */}
              <Chip color="success" variant="tertiary" data-stock="in">
                42 en stock
              </Chip>
              <Chip color="warning" variant="tertiary" data-stock="low">
                2 en stock · bientôt rupture
              </Chip>
              <Chip color="danger" variant="tertiary" data-stock="out">
                Rupture
              </Chip>
              <Chip color="default" variant="soft">
                Magma · C115
              </Chip>
            </div>
          </section>

          <section style={{ marginBottom: 40 }}>
            <h2
              style={{
                fontSize: 11,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "var(--vfx-muted)",
                marginBottom: 12,
              }}
            >
              04 · HeroUI Card · sample product layout
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                gap: 16,
              }}
            >
              <Card>
                <CardHeader
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    gap: 4,
                  }}
                >
                  <div
                    style={{
                      fontFamily: "ui-monospace, monospace",
                      fontSize: 10,
                      letterSpacing: "0.04em",
                      textTransform: "uppercase",
                      color: "var(--vfx-muted)",
                    }}
                  >
                    REF · AIFEN-A902PRO
                  </div>
                  <h3 style={{ fontSize: 14, fontWeight: 500, lineHeight: 1.35 }}>
                    Station Aifen A902 Pro
                  </h3>
                </CardHeader>
                <CardContent style={{ paddingTop: 0 }}>
                  <div
                    style={{
                      aspectRatio: "1 / 1",
                      background: "var(--vfx-photo-bg)",
                      border: "1px solid var(--vfx-rule)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--vfx-muted)",
                      fontSize: 12,
                    }}
                  >
                    photo well
                  </div>
                </CardContent>
                <CardFooter
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "ui-monospace, monospace",
                      fontSize: 15,
                      fontWeight: 500,
                      color: "var(--vfx-accent)",
                    }}
                  >
                    3 800,00 MAD
                  </div>
                  <Chip color="success" variant="tertiary" size="sm" data-stock="in">
                    3 en stock
                  </Chip>
                </CardFooter>
              </Card>
              <Card>
                <CardHeader
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    gap: 4,
                  }}
                >
                  <div
                    style={{
                      fontFamily: "ui-monospace, monospace",
                      fontSize: 10,
                      letterSpacing: "0.04em",
                      textTransform: "uppercase",
                      color: "var(--vfx-muted)",
                    }}
                  >
                    REF · MAGMA-C115-SET
                  </div>
                  <h3 style={{ fontSize: 14, fontWeight: 500, lineHeight: 1.35 }}>
                    Pannes Magma C115 — set K/IS/I
                  </h3>
                </CardHeader>
                <CardContent style={{ paddingTop: 0 }}>
                  <div
                    style={{
                      aspectRatio: "1 / 1",
                      background: "var(--vfx-photo-bg)",
                      border: "1px solid var(--vfx-rule)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--vfx-muted)",
                      fontSize: 12,
                    }}
                  >
                    photo well
                  </div>
                </CardContent>
                <CardFooter
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "ui-monospace, monospace",
                      fontSize: 15,
                      fontWeight: 500,
                      color: "var(--vfx-accent)",
                    }}
                  >
                    280,00 MAD
                  </div>
                  <Btn variant="primary" size="sm">
                    Ajouter
                  </Btn>
                </CardFooter>
              </Card>
            </div>
          </section>

          {/* Radius categories — three-tier spec side by side */}
          <section style={{ marginBottom: 40 }}>
            <h2
              style={{
                fontSize: 11,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "var(--vfx-muted)",
                marginBottom: 12,
              }}
            >
              05 · Radius categories (three-tier spec)
            </h2>

            {/* Tier 1: 2px override */}
            <div style={{ marginBottom: 24 }}>
              <div
                style={{
                  fontFamily: "ui-monospace, monospace",
                  fontSize: 10,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  color: "var(--vfx-accent)",
                  marginBottom: 8,
                }}
              >
                Tier 1 · 2px · rectangular primitives
              </div>
              <div
                style={{
                  display: "flex",
                  gap: 12,
                  flexWrap: "wrap",
                  alignItems: "center",
                }}
              >
                <Btn variant="primary">Button</Btn>
                {/* Plain <input className="input"> — HeroUI v3's Input.d.ts
                    drops `placeholder` (same `ComponentPropsWithRef` issue as
                    Button). For an internal probe demonstrating that
                    .input { border-radius: 2px } applies, a native input
                    with the class is simpler than wrapping in an adapter. */}
                <input
                  className="input"
                  placeholder="Input"
                  style={{
                    width: 180,
                    background: "var(--vfx-surface)",
                    border: "1px solid var(--vfx-rule)",
                    color: "var(--vfx-ink)",
                    padding: "8px 12px",
                    fontFamily: "var(--font-body)",
                    fontSize: 13,
                    outline: "none",
                  }}
                />
                <Card style={{ padding: "10px 14px", minWidth: 140 }}>
                  <span style={{ fontSize: 13 }}>Card</span>
                </Card>
              </div>
            </div>

            {/* Tier 2: HeroUI defaults */}
            <div style={{ marginBottom: 24 }}>
              <div
                style={{
                  fontFamily: "ui-monospace, monospace",
                  fontSize: 10,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  color: "var(--vfx-muted)",
                  marginBottom: 8,
                }}
              >
                Tier 2 · HeroUI defaults · conceptually round
              </div>
              <div
                style={{
                  display: "flex",
                  gap: 12,
                  flexWrap: "wrap",
                  alignItems: "center",
                }}
              >
                <Chip color="accent" variant="primary">Chip (pill)</Chip>
                <Chip color="success" variant="tertiary">
                  42 en stock
                </Chip>
                <Avatar name="MT" />
                <Switcher defaultSelected />
              </div>
            </div>

            {/* Tier 3: 9999px explicit, circular by intent */}
            <div>
              <div
                style={{
                  fontFamily: "ui-monospace, monospace",
                  fontSize: 10,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  color: "var(--vfx-muted)",
                  marginBottom: 8,
                }}
              >
                Tier 3 · 9999px · circular by intent
              </div>
              <div
                style={{
                  display: "flex",
                  gap: 18,
                  flexWrap: "wrap",
                  alignItems: "center",
                }}
              >
                {/* Cart badge */}
                <span
                  style={{
                    position: "relative",
                    padding: "8px 14px",
                    background: "var(--vfx-surface)",
                    border: "1px solid var(--vfx-rule)",
                    borderRadius: 2,
                    fontFamily: "ui-monospace, monospace",
                    fontSize: 11,
                    color: "var(--vfx-ink)",
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                  }}
                >
                  Panier
                  <span
                    style={{
                      position: "absolute",
                      top: -6,
                      right: -6,
                      minWidth: 18,
                      height: 18,
                      padding: "0 5px",
                      background: "var(--vfx-accent)",
                      color: "#fff",
                      border: "2px solid var(--vfx-bg)",
                      borderRadius: 9999,
                      fontSize: 10,
                      fontWeight: 600,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      lineHeight: 1,
                    }}
                  >
                    3
                  </span>
                </span>

                {/* Stock dots */}
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    fontFamily: "ui-monospace, monospace",
                    fontSize: 12,
                    color: "var(--vfx-muted)",
                  }}
                >
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 9999,
                      background: "var(--vfx-accent)",
                    }}
                  />
                  in
                </span>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    fontFamily: "ui-monospace, monospace",
                    fontSize: 12,
                    color: "var(--vfx-muted)",
                  }}
                >
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 9999,
                      background: "var(--vfx-low-stock)",
                    }}
                  />
                  low
                </span>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    fontFamily: "ui-monospace, monospace",
                    fontSize: 12,
                    color: "var(--vfx-muted)",
                  }}
                >
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 9999,
                      background: "var(--vfx-out-stock)",
                    }}
                  />
                  out
                </span>

                {/* Language toggle pill (mobile-style) */}
                <button
                  type="button"
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 9999,
                    background: "var(--vfx-surface)",
                    border: "1px solid var(--vfx-rule)",
                    fontFamily: "ui-monospace, monospace",
                    fontSize: 12,
                    fontWeight: 600,
                    color: "var(--vfx-ink)",
                    cursor: "pointer",
                  }}
                >
                  FR
                </button>
              </div>
            </div>
          </section>

          {/* Type specimens — verify next/font wired the four families */}
          <section style={{ marginBottom: 40 }}>
            <h2
              style={{
                fontSize: 11,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "var(--vfx-muted)",
                marginBottom: 12,
              }}
            >
              06 · Type specimens (next/font wired)
            </h2>

            {/* Fraunces — display only, large */}
            <div
              style={{
                borderTop: "1px solid var(--vfx-rule)",
                padding: "20px 0",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  color: "var(--vfx-muted)",
                  marginBottom: 10,
                  display: "flex",
                  gap: 12,
                }}
              >
                <span>Fraunces · display</span>
                <span style={{ color: "var(--vfx-accent)" }}>
                  variable + opsz + SOFT
                </span>
              </div>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 48,
                  fontWeight: 500,
                  lineHeight: 1.08,
                  letterSpacing: "-0.02em",
                  fontVariationSettings: '"opsz" 48, "SOFT" 30',
                  color: "var(--vfx-ink)",
                }}
              >
                Aifen A902 Pro — deux fers.
              </div>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 22,
                  fontWeight: 500,
                  lineHeight: 1.2,
                  letterSpacing: "-0.01em",
                  fontVariationSettings: '"opsz" 22, "SOFT" 30',
                  color: "var(--vfx-ink)",
                  marginTop: 10,
                }}
              >
                Récemment ajoutés · De nouveau disponibles
              </div>
            </div>

            {/* Geist — body Latin */}
            <div
              style={{
                borderTop: "1px solid var(--vfx-rule)",
                padding: "20px 0",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  color: "var(--vfx-muted)",
                  marginBottom: 10,
                  display: "flex",
                  gap: 12,
                }}
              >
                <span>Geist · body Latin</span>
                <span style={{ color: "var(--vfx-accent)" }}>
                  variable · 15px · tnum + ss01
                </span>
              </div>
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: 15,
                  fontWeight: 400,
                  lineHeight: 1.65,
                  color: "var(--vfx-ink)",
                  maxWidth: "64ch",
                  fontFeatureSettings: '"tnum" on, "ss01" on',
                }}
              >
                Station de soudage Aifen A902 Pro avec deux fers indépendants
                et neuf pannes Magma incluses. Compatible séries C115, C210,
                C245. Stock vérifié à l'instant à Casablanca, livraison sous
                48 heures, garantie 12 mois avec SAV local.
              </p>
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: 15,
                  fontWeight: 500,
                  lineHeight: 1.55,
                  color: "var(--vfx-ink)",
                  maxWidth: "64ch",
                  fontFeatureSettings: '"tnum" on, "ss01" on',
                  marginTop: 8,
                }}
              >
                Medium weight 500 — used for product card titles, section
                heads, and active states. 0123456789 (tabular alignment check).
              </p>
            </div>

            {/* IBM Plex Sans Arabic — body Arabic */}
            <div
              style={{
                borderTop: "1px solid var(--vfx-rule)",
                padding: "20px 0",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  color: "var(--vfx-muted)",
                  marginBottom: 10,
                  display: "flex",
                  gap: 12,
                }}
              >
                <span>IBM Plex Sans Arabic · body Arabic</span>
                <span style={{ color: "var(--vfx-accent)" }}>
                  static · 400/500/600 · 15px · RTL
                </span>
              </div>
              <p
                lang="ar"
                dir="rtl"
                style={{
                  fontFamily: "var(--font-arabic)",
                  fontSize: 15,
                  fontWeight: 400,
                  lineHeight: 1.85,
                  color: "var(--vfx-ink)",
                  maxWidth: "64ch",
                  direction: "rtl",
                  textAlign: "right",
                }}
              >
                محطة لحام أيفن A902 برو بمكويين مستقلين، تسع بكرات ماجما
                متضمنة. متوافقة مع سلاسل C115 وC210 وC245. مخزون متاح في الدار
                البيضاء، التوصيل خلال ٤٨ ساعة، ضمان ١٢ شهرًا مع خدمة ما بعد
                البيع محلية.
              </p>
              <p
                lang="ar"
                dir="rtl"
                style={{
                  fontFamily: "var(--font-arabic)",
                  fontSize: 15,
                  fontWeight: 500,
                  lineHeight: 1.75,
                  color: "var(--vfx-ink)",
                  maxWidth: "64ch",
                  direction: "rtl",
                  textAlign: "right",
                  marginTop: 8,
                }}
              >
                Medium 500 (RTL): عناوين البطاقات والأقسام النشطة.
                الأرقام: ٠١٢٣٤٥٦٧٨٩ — ٣٬٨٠٠٫٠٠ درهم.
              </p>
            </div>

            {/* JetBrains Mono — prices + SKUs */}
            <div
              style={{
                borderTop: "1px solid var(--vfx-rule)",
                borderBottom: "1px solid var(--vfx-rule)",
                padding: "20px 0",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  color: "var(--vfx-muted)",
                  marginBottom: 10,
                  display: "flex",
                  gap: 12,
                }}
              >
                <span>JetBrains Mono · numbers + identifiers</span>
                <span style={{ color: "var(--vfx-accent)" }}>
                  variable · tabular by default
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 36,
                    fontWeight: 500,
                    color: "var(--vfx-accent)",
                    fontFeatureSettings: '"tnum" on',
                    lineHeight: 1,
                  }}
                >
                  3 800,00{" "}
                  <span
                    style={{
                      fontSize: 14,
                      color: "var(--vfx-muted)",
                      fontWeight: 400,
                    }}
                  >
                    MAD
                  </span>{" "}
                  <span
                    style={{
                      fontSize: 14,
                      color: "var(--vfx-muted)",
                      textDecoration: "line-through",
                      fontWeight: 400,
                    }}
                  >
                    4 200,00
                  </span>
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 12,
                    fontWeight: 500,
                    color: "var(--vfx-ink)",
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                  }}
                >
                  REF · AIFEN-A902PRO · QT 03 · CAT STATIONS
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    color: "var(--vfx-muted)",
                    fontFeatureSettings: '"tnum" on',
                  }}>
                  Tabular check · 1 111,11 · 2 222,22 · 3 333,33 · 4 444,44
                </div>
              </div>
            </div>
          </section>

          {/* Pretext at work — uniform card-title heights */}
          <section style={{ marginBottom: 40 }}>
            <h2
              style={{
                fontSize: 11,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "var(--vfx-muted)",
                marginBottom: 12,
              }}
            >
              07 · Pretext at work (resize the window, click titles to edit)
            </h2>
            <p
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                letterSpacing: "0.04em",
                color: "var(--vfx-muted)",
                marginBottom: 14,
                lineHeight: 1.55,
              }}
            >
              Four product cards, titles of deliberately uneven length, all
              tagged{" "}
              <code
                style={{
                  background: "var(--vfx-surface-2)",
                  padding: "1px 5px",
                  borderRadius: 2,
                }}
              >
                data-pretext-group=&quot;s7-card&quot;
              </code>
              . Without Pretext, the four cards stagger by ~22px on desktop.
              With Pretext, every title slot snaps to the max-line-count
              height in the group. Resize the viewport — heights recompute
              live. Titles are contenteditable; click and edit one and watch
              the group reflow.
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 16,
              }}
            >
              {[
                {
                  ref: "AIFEN-A902PRO",
                  title:
                    "Station de soudage Aifen A902 Pro avec deux fers et neuf pannes Magma incluses",
                  price: "3 800,00",
                  stock: "3 en stock",
                },
                {
                  ref: "MAGMA-C115-K",
                  title: "Panne Magma C115-K",
                  price: "95,00",
                  stock: "42 en stock",
                },
                {
                  ref: "KAISI-TX350E",
                  title:
                    "Microscope trinoculaire Kaisi TX-350E avec bras articulé MRS-1",
                  price: "4 500,00",
                  stock: "2 en stock",
                },
                {
                  ref: "GOOT-CP1515",
                  title: "Tresse à dessouder Goot CP-1515",
                  price: "95,00",
                  stock: "18 en stock",
                },
              ].map((p) => (
                <div
                  key={p.ref}
                  style={{
                    background: "var(--vfx-surface)",
                    border: "1px solid var(--vfx-rule)",
                    borderRadius: 2,
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <div
                    style={{
                      aspectRatio: "1 / 1",
                      background: "var(--vfx-photo-bg)",
                      borderBottom: "1px solid var(--vfx-rule)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--vfx-muted)",
                      fontSize: 11,
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    photo well
                  </div>
                  <div
                    style={{
                      padding: "12px 14px 14px",
                      display: "flex",
                      flexDirection: "column",
                      gap: 6,
                    }}
                  >
                    <div
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 10,
                        letterSpacing: "0.04em",
                        textTransform: "uppercase",
                        color: "var(--vfx-muted)",
                      }}
                    >
                      REF · {p.ref}
                    </div>
                    {/* Pretext-managed title — group "s7-card" syncs heights */}
                    <h3
                      data-pretext
                      data-pretext-group="s7-card"
                      contentEditable="plaintext-only"
                      suppressContentEditableWarning
                      style={{
                        fontFamily: "var(--font-body)",
                        fontSize: 14,
                        fontWeight: 500,
                        color: "var(--vfx-ink)",
                        lineHeight: 1.35,
                        outline: "none",
                        overflow: "hidden",
                      }}
                    >
                      {p.title}
                    </h3>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "baseline",
                        marginTop: 2,
                        gap: 8,
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: 15,
                          fontWeight: 500,
                          color: "var(--vfx-accent)",
                        }}
                      >
                        {p.price}
                      </span>
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: 11,
                          color: "var(--vfx-muted)",
                        }}
                      >
                        {p.stock}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                marginTop: 16,
                padding: "12px 14px",
                background: "var(--vfx-bg)",
                border: "1px dashed var(--vfx-rule)",
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                color: "var(--vfx-muted)",
                letterSpacing: "0.04em",
                lineHeight: 1.55,
              }}
            >
              Implementation: <code>frontend/lib/pretext.ts</code> ·{" "}
              <code>usePretextHeights()</code> called at the page root ·
              awaits <code>document.fonts.ready</code> · ResizeObserver on{" "}
              <code>document.body</code> · MutationObserver per
              contenteditable element.
            </div>
          </section>

          {/* RTL flip — opt-in via data-rtl-flip attribute */}
          <section style={{ marginBottom: 40 }}>
            <h2
              style={{
                fontSize: 11,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "var(--vfx-muted)",
                marginBottom: 12,
              }}
            >
              08 · RTL flip (opt-in via data-rtl-flip)
            </h2>

            <p
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                letterSpacing: "0.04em",
                color: "var(--vfx-muted)",
                marginBottom: 14,
                lineHeight: 1.55,
              }}
            >
              Click the toggle to flip the framed region&apos;s{" "}
              <code
                style={{
                  background: "var(--vfx-surface-2)",
                  padding: "1px 5px",
                  borderRadius: 2,
                }}
              >
                dir
              </code>
              . Single global rule in <code>globals.css</code>:{" "}
              <code
                style={{
                  background: "var(--vfx-surface-2)",
                  padding: "1px 5px",
                  borderRadius: 2,
                }}
              >
                [dir=&quot;rtl&quot;] [data-rtl-flip] {`{ transform: scaleX(-1); }`}
              </code>
              . Elements without the attribute (wordmark, photo) stay put.
              The page&apos;s outer <code>dir</code> is untouched — this is
              section-local.
            </p>

            <div style={{ marginBottom: 12 }}>
              <button
                type="button"
                onClick={() => setS8Dir((d) => (d === "ltr" ? "rtl" : "ltr"))}
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  color: "var(--vfx-ink)",
                  background: "var(--vfx-surface)",
                  border: "1px solid var(--vfx-rule)",
                  padding: "8px 14px",
                  borderRadius: 9999,
                  cursor: "pointer",
                }}
              >
                Section dir: <strong style={{ color: "var(--vfx-accent)" }}>{s8Dir}</strong>
                {" "}· click to toggle
              </button>
            </div>

            <div
              dir={s8Dir}
              style={{
                background: "var(--vfx-surface)",
                border: "1px solid var(--vfx-rule)",
                borderRadius: 2,
                padding: 20,
                display: "flex",
                flexDirection: "column",
                gap: 14,
              }}
            >
              {/* Row 1 — Lucide ArrowRight, flips */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "8px 0",
                  borderBottom: "1px solid var(--vfx-rule)",
                }}
              >
                <ArrowRight
                  data-rtl-flip
                  size={22}
                  strokeWidth={1.8}
                  style={{ color: "var(--vfx-accent)", flexShrink: 0 }}
                />
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                  }}
                >
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      color: "var(--vfx-ink)",
                    }}
                  >
                    Lucide <code>ArrowRight</code>
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 10,
                      letterSpacing: "0.04em",
                      color: "var(--vfx-muted)",
                    }}
                  >
                    has data-rtl-flip · should mirror
                  </span>
                </div>
              </div>

              {/* Row 2 — Lucide ChevronRight, flips */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "8px 0",
                  borderBottom: "1px solid var(--vfx-rule)",
                }}
              >
                <ChevronRight
                  data-rtl-flip
                  size={22}
                  strokeWidth={1.8}
                  style={{ color: "var(--vfx-accent)", flexShrink: 0 }}
                />
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      color: "var(--vfx-ink)",
                    }}
                  >
                    Lucide <code>ChevronRight</code>
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 10,
                      letterSpacing: "0.04em",
                      color: "var(--vfx-muted)",
                    }}
                  >
                    has data-rtl-flip · should mirror
                  </span>
                </div>
              </div>

              {/* Row 3 — "Acheter →" CTA, only the arrow flips */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "8px 0",
                  borderBottom: "1px solid var(--vfx-rule)",
                }}
              >
                <a
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 14,
                    fontWeight: 500,
                    color: "var(--vfx-accent)",
                    borderBottom: "1px solid currentColor",
                    paddingBottom: 1,
                    textDecoration: "none",
                  }}
                >
                  Acheter
                  <ArrowRight data-rtl-flip size={14} strokeWidth={2} />
                </a>
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      color: "var(--vfx-ink)",
                    }}
                  >
                    Inline arrow link
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 10,
                      letterSpacing: "0.04em",
                      color: "var(--vfx-muted)",
                    }}
                  >
                    only the arrow has data-rtl-flip · text stays · visual
                    order swaps because dir=&quot;rtl&quot; reverses inline flow
                  </span>
                </div>
              </div>

              {/* Row 4 — v-fixer wordmark, NO data-rtl-flip */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "8px 0",
                  borderBottom: "1px solid var(--vfx-rule)",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: 22,
                    fontWeight: 500,
                    letterSpacing: "-0.01em",
                    fontVariationSettings: '"opsz" 22',
                    color: "var(--vfx-ink)",
                  }}
                >
                  v-fixer<span style={{ color: "var(--vfx-accent)" }}>.</span>
                </span>
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      color: "var(--vfx-ink)",
                    }}
                  >
                    Wordmark
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 10,
                      letterSpacing: "0.04em",
                      color: "var(--vfx-muted)",
                    }}
                  >
                    no data-rtl-flip · must stay unchanged
                  </span>
                </div>
              </div>

              {/* Row 5 — Photo placeholder with asymmetric marker, NO data-rtl-flip */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "8px 0",
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    background: "var(--vfx-photo-bg)",
                    border: "1px solid var(--vfx-rule)",
                    borderRadius: 2,
                    position: "relative",
                    flexShrink: 0,
                  }}
                >
                  {/* Corner marker — top-left "L" so we can see if the box flipped */}
                  <span
                    style={{
                      position: "absolute",
                      top: 4,
                      left: 4,
                      fontFamily: "var(--font-mono)",
                      fontSize: 10,
                      fontWeight: 600,
                      color: "var(--vfx-accent)",
                    }}
                  >
                    L
                  </span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      color: "var(--vfx-ink)",
                    }}
                  >
                    Photo well with corner marker
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 10,
                      letterSpacing: "0.04em",
                      color: "var(--vfx-muted)",
                    }}
                  >
                    no data-rtl-flip · &quot;L&quot; stays in top-left
                    regardless of dir
                  </span>
                </div>
              </div>
            </div>

            <div
              style={{
                marginTop: 16,
                padding: "12px 14px",
                background: "var(--vfx-bg)",
                border: "1px dashed var(--vfx-rule)",
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                color: "var(--vfx-muted)",
                letterSpacing: "0.04em",
                lineHeight: 1.55,
              }}
            >
              Note on the &quot;Acheter →&quot; row: in <code>dir=&quot;rtl&quot;</code>{" "}
              the inline order reverses (so the arrow visually sits left of
              the text), AND the arrow mirrors (so it now points left). That
              combination is correct RTL behavior — the CTA still reads
              &quot;forward toward the destination&quot; in the natural Arabic
              flow.
            </div>
          </section>

          {/* CrossFadeStack — M2 step 1 primitive */}
          <section style={{ marginBottom: 40 }}>
            <h2
              style={{
                fontSize: 11,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "var(--vfx-muted)",
                marginBottom: 12,
              }}
            >
              09 · CrossFadeStack (M2 step 1)
            </h2>
            <p
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                letterSpacing: "0.04em",
                color: "var(--vfx-muted)",
                marginBottom: 14,
                lineHeight: 1.55,
              }}
            >
              Controlled stack — parent owns activeIndex, one child visible at
              a time with a 320ms opacity cross-fade (
              <code>--dur-gallery</code> / <code>--ease-out</code>). Honors{" "}
              <code>prefers-reduced-motion</code>: the fade becomes instant.
              Click thumbnails / arrows to swap.
            </p>

            {/* Demo A — 4/5 product photo with thumbnails */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr",
                gap: 16,
                marginBottom: 28,
                maxWidth: 420,
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  color: "var(--vfx-muted)",
                }}
              >
                Demo A · 4/5 product photo · thumbnail switcher
              </div>
              <div
                style={{
                  border: "1px solid var(--vfx-rule)",
                  background: "var(--vfx-photo-bg)",
                }}
              >
                <CrossFadeStack
                  activeIndex={s9PhotoIdx}
                  aspectRatio="4/5"
                >
                  {[
                    { label: "Photo 1", bg: "#1E5A8A", fg: "#FFFFFF" },
                    { label: "Photo 2", bg: "#4F6B3A", fg: "#FFFFFF" },
                    { label: "Photo 3", bg: "#8B6F47", fg: "#FFFFFF" },
                  ].map((p) => (
                    <div
                      key={p.label}
                      style={{
                        width: "100%",
                        height: "100%",
                        background: p.bg,
                        color: p.fg,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontFamily: "var(--font-display)",
                        fontSize: 32,
                        fontWeight: 500,
                        letterSpacing: "-0.01em",
                      }}
                    >
                      {p.label}
                    </div>
                  ))}
                </CrossFadeStack>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: 8,
                }}
              >
                {[0, 1, 2].map((i) => {
                  const isActive = i === s9PhotoIdx;
                  const colors = ["#1E5A8A", "#4F6B3A", "#8B6F47"];
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setS9PhotoIdx(i)}
                      aria-label={`Show photo ${i + 1}`}
                      aria-pressed={isActive}
                      style={{
                        aspectRatio: "1 / 1",
                        background: colors[i],
                        color: "#FFFFFF",
                        border: isActive
                          ? "2px solid var(--vfx-accent)"
                          : "1px solid var(--vfx-rule)",
                        borderRadius: 2,
                        outlineOffset: 2,
                        cursor: "pointer",
                        fontFamily: "var(--font-mono)",
                        fontSize: 11,
                        fontWeight: 600,
                        opacity: isActive ? 1 : 0.55,
                        transition: "opacity 150ms ease, border-color 150ms ease",
                      }}
                    >
                      {i + 1}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Demo B — 1/1 square with arrow navigation */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr",
                gap: 12,
                maxWidth: 360,
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  color: "var(--vfx-muted)",
                }}
              >
                Demo B · 1/1 square · arrow navigation (4 frames)
              </div>
              <div
                style={{
                  border: "1px solid var(--vfx-rule)",
                  background: "var(--vfx-photo-bg)",
                }}
              >
                <CrossFadeStack
                  activeIndex={s9SquareIdx}
                  aspectRatio="1/1"
                >
                  {[
                    { label: "A", bg: "#1E5A8A" },
                    { label: "B", bg: "#4F6B3A" },
                    { label: "C", bg: "#8B6F47" },
                    { label: "D", bg: "#8A2A2A" },
                  ].map((f) => (
                    <div
                      key={f.label}
                      style={{
                        width: "100%",
                        height: "100%",
                        background: f.bg,
                        color: "#FFFFFF",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontFamily: "var(--font-display)",
                        fontSize: 80,
                        fontWeight: 500,
                      }}
                    >
                      {f.label}
                    </div>
                  ))}
                </CrossFadeStack>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <button
                  type="button"
                  onClick={() =>
                    setS9SquareIdx((i) => (i - 1 + 4) % 4)
                  }
                  aria-label="Previous frame"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "8px 14px",
                    background: "var(--vfx-surface)",
                    color: "var(--vfx-ink)",
                    border: "1px solid var(--vfx-rule)",
                    borderRadius: 2,
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                    cursor: "pointer",
                  }}
                >
                  <ChevronLeft data-rtl-flip size={14} strokeWidth={2} />
                  Prev
                </button>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 12,
                    color: "var(--vfx-muted)",
                    fontFeatureSettings: '"tnum" on',
                  }}
                >
                  {s9SquareIdx + 1} / 4
                </span>
                <button
                  type="button"
                  onClick={() => setS9SquareIdx((i) => (i + 1) % 4)}
                  aria-label="Next frame"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "8px 14px",
                    background: "var(--vfx-surface)",
                    color: "var(--vfx-ink)",
                    border: "1px solid var(--vfx-rule)",
                    borderRadius: 2,
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                    cursor: "pointer",
                  }}
                >
                  Next
                  <ChevronRight data-rtl-flip size={14} strokeWidth={2} />
                </button>
              </div>
            </div>

            <div
              style={{
                marginTop: 16,
                padding: "12px 14px",
                background: "var(--vfx-bg)",
                border: "1px dashed var(--vfx-rule)",
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                color: "var(--vfx-muted)",
                letterSpacing: "0.04em",
                lineHeight: 1.55,
              }}
            >
              Verify: (a) click any thumbnail / arrow — the active panel
              cross-fades over ~320ms with no layout shift; (b) inactive
              panels are pointer-events:none (clicks pass through to the
              active one); (c) DevTools &rarr; Rendering &rarr; Emulate{" "}
              <code>prefers-reduced-motion: reduce</code> &mdash; subsequent
              swaps are instant. Real product photos arrive in M3; placeholder
              colored panels here are intentional.
            </div>
          </section>

          {/* Motion duration scale — visible specimen of all 5 --dur-* tokens */}
          <section style={{ marginBottom: 40 }}>
            <h2
              style={{
                fontSize: 11,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "var(--vfx-muted)",
                marginBottom: 12,
              }}
            >
              09b · Motion duration scale (M2 step 1.5)
            </h2>
            <p
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                letterSpacing: "0.04em",
                color: "var(--vfx-muted)",
                marginBottom: 14,
                lineHeight: 1.55,
              }}
            >
              Five duration tokens from DESIGN.md, all wired to{" "}
              <code>--vfx-dur-*</code> in <code>globals.css</code>. Hover any
              box — background shifts from surface to accent over that
              token&apos;s duration with <code>--ease-out</code>. The 100ms
              tick is barely visible; 320ms feels deliberate. Under{" "}
              <code>prefers-reduced-motion: reduce</code> all five collapse
              to 0ms.
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(5, 1fr)",
                gap: 12,
                maxWidth: 720,
              }}
            >
              {[
                { name: "micro",   token: "--dur-micro",   ms: "100ms" },
                { name: "short",   token: "--dur-short",   ms: "150ms" },
                { name: "card",    token: "--dur-card",    ms: "180ms" },
                { name: "page",    token: "--dur-page",    ms: "240ms" },
                { name: "gallery", token: "--dur-gallery", ms: "320ms" },
              ].map((d) => (
                <div
                  key={d.name}
                  className="probe-motion-box"
                  data-dur={d.token}
                  style={{
                    aspectRatio: "1 / 1",
                    background: "var(--vfx-surface)",
                    color: "var(--vfx-ink)",
                    border: "1px solid var(--vfx-rule)",
                    borderRadius: 2,
                    padding: 12,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    cursor: "pointer",
                    transition: `background-color var(${d.token}) var(--ease-out), color var(${d.token}) var(--ease-out)`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "var(--vfx-accent)";
                    e.currentTarget.style.color = "#FFFFFF";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "var(--vfx-surface)";
                    e.currentTarget.style.color = "var(--vfx-ink)";
                  }}
                >
                  <div
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: 20,
                      fontWeight: 500,
                      letterSpacing: "-0.01em",
                      lineHeight: 1,
                    }}
                  >
                    {d.ms}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 2,
                    }}
                  >
                    <span
                      style={{
                        letterSpacing: "0.05em",
                        textTransform: "uppercase",
                        fontWeight: 600,
                      }}
                    >
                      {d.name}
                    </span>
                    <span style={{ fontSize: 9, opacity: 0.75 }}>
                      {d.token}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                marginTop: 16,
                padding: "12px 14px",
                background: "var(--vfx-bg)",
                border: "1px dashed var(--vfx-rule)",
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                color: "var(--vfx-muted)",
                letterSpacing: "0.04em",
                lineHeight: 1.55,
              }}
            >
              Easings (also wired): <code>--ease-out</code>{" "}
              <code style={{ color: "var(--vfx-accent)" }}>cubic-bezier(0.2, 0, 0, 1)</code>{" "}
              · <code>--ease-in</code>{" "}
              <code style={{ color: "var(--vfx-accent)" }}>cubic-bezier(0.4, 0, 1, 1)</code>{" "}
              · <code>--ease-in-out</code>{" "}
              <code style={{ color: "var(--vfx-accent)" }}>cubic-bezier(0.4, 0, 0.2, 1)</code>.
              Every primitive from M2 onwards should consume these by name —
              no hardcoded ms or cubic-bezier values.
            </div>
          </section>

          {/* ProductCard primitive — M2 step 3 */}
          <section style={{ marginBottom: 40 }}>
            <h2
              style={{
                fontSize: 11,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "var(--vfx-muted)",
                marginBottom: 12,
              }}
            >
              10 · ProductCard (M2 step 3)
            </h2>
            <p
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                letterSpacing: "0.04em",
                color: "var(--vfx-muted)",
                marginBottom: 14,
                lineHeight: 1.55,
              }}
            >
              Four real <code>Product</code> objects rendered through the
              same primitive that&apos;ll back ~40+ instances in M3. Titles
              share <code>data-pretext-group=&quot;s10-card&quot;</code> and
              snap to uniform height via{" "}
              <code>usePretextHeights()</code> at the page root. Card 1 has
              a discount (strikethrough); card 2 low stock (sand dot);
              card 3 out of stock (red dot); card 4 no image
              (Fraunces-glyph placeholder). Hover any card — background
              shifts <code>--surface</code> → <code>--surface-2</code> over
              150ms, no lift / no shadow.
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 16,
              }}
            >
              {S10_PRODUCTS.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  pretextGroup="s10-card"
                />
              ))}
            </div>

            <div
              style={{
                marginTop: 16,
                padding: "12px 14px",
                background: "var(--vfx-bg)",
                border: "1px dashed var(--vfx-rule)",
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                color: "var(--vfx-muted)",
                letterSpacing: "0.04em",
                lineHeight: 1.55,
              }}
            >
              Verify: (a) all 4 card titles render at the same height
              regardless of word count — Pretext is keying off{" "}
              <code>pretextGroup</code>; (b) click any card &rarr; URL
              changes to <code>/product/{`{slug}`}</code> (404 expected,
              we&apos;re testing linkage); (c) toggle theme &rarr; surfaces,
              accents, and stock dots all flip; (d) the no-image card
              shows a Fraunces capital glyph in muted color, not a broken
              image icon.
            </div>
          </section>

          {/* Findings note */}
          <section
            style={{
              borderLeft: "2px solid var(--vfx-accent)",
              background: "var(--vfx-surface)",
              padding: "14px 18px",
              fontSize: 13,
              color: "var(--vfx-ink)",
              lineHeight: 1.55,
            }}
          >
            <div
              style={{
                fontFamily: "ui-monospace, monospace",
                fontSize: 10,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--vfx-accent)",
                marginBottom: 4,
              }}
            >
              Spike checklist
            </div>
            Verify in both themes: (a) primary Button background = blueprint
            blue, foreground white; (b) Chip success border + text = sage
            in-stock; (c) Card background = surface linen / dark warm-black;
            (d) any unexpected radii or colors leaking through HeroUI defaults
            get logged in MIGRATION-PLAN.md before M1 step 2.
          </section>
        </div>
      </main>
    </I18nProvider>
  );
}
