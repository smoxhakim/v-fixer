/** Normalizes API payload (snake_case from tests or camelCase from browser) for the storefront. */

export type HomeHeroSlidePayload = {
  tag: string;
  title: string;
  description: string;
  imageUrl: string;
  linkHref: string;
  gradientClass: string;
};

function pickRow(row: Record<string, unknown>): HomeHeroSlidePayload {
  return {
    tag: String(row.tag ?? ""),
    title: String(row.title ?? ""),
    description: String(row.description ?? ""),
    imageUrl: String(row.imageUrl ?? row.image_url ?? ""),
    linkHref: String(row.linkHref ?? row.link_href ?? ""),
    gradientClass: String(row.gradientClass ?? row.gradient_class ?? ""),
  };
}

export function normalizeHomeHeroResponse(raw: unknown): {
  mainSlides: HomeHeroSlidePayload[];
  sidePromos: HomeHeroSlidePayload[];
} | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const main = (o.mainSlides ?? o.main_slides) as unknown;
  const side = (o.sidePromos ?? o.side_promos) as unknown;
  if (!Array.isArray(main) || !Array.isArray(side)) return null;
  return {
    mainSlides: main.map((r) => pickRow(r as Record<string, unknown>)),
    sidePromos: side.map((r) => pickRow(r as Record<string, unknown>)),
  };
}
