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

import { useEffect, useState } from "react";
import {
  Avatar,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardFooter,
  Chip,
  I18nProvider,
  Input,
  Switch,
} from "@heroui/react";
import { usePretextHeights } from "@/lib/pretext";

export default function ThemeProbe() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
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
              02 · HeroUI Button (color=&quot;primary&quot;)
            </h2>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Button color="primary">Ajouter au panier</Button>
              <Button color="primary" variant="bordered">
                Comparer
              </Button>
              <Button color="primary" variant="light">
                Favoris
              </Button>
              <Button color="default">Default</Button>
              <Button color="success">In stock</Button>
              <Button color="warning">Low stock</Button>
              <Button color="danger">Out of stock</Button>
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
              <Chip color="primary">REF · AIFEN-A902PRO</Chip>
              <Chip color="success" variant="bordered">
                42 en stock
              </Chip>
              <Chip color="warning" variant="bordered">
                2 en stock · bientôt rupture
              </Chip>
              <Chip color="danger" variant="bordered">
                Rupture
              </Chip>
              <Chip color="default" variant="flat">
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
                  <Chip color="success" variant="bordered" size="sm">
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
                  <Button color="primary" size="sm">
                    Ajouter
                  </Button>
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
                <Button color="primary">Button</Button>
                <Input placeholder="Input" style={{ width: 180 }} />
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
                <Chip color="primary">Chip (pill)</Chip>
                <Chip color="success" variant="bordered">
                  42 en stock
                </Chip>
                <Avatar name="MT" />
                <Switch defaultSelected />
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
