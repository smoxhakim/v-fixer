/** Same default as `API_URL` in `@/lib/api` — keep in sync. */
function apiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8001/api";
}

/** Origin of the Django app (strip trailing `/api`). */
export function getApiOrigin(): string {
  return apiBaseUrl().replace(/\/api\/?$/i, "");
}

/**
 * Turn API image paths into absolute URLs the browser can load from the API host.
 * `next/image` treats other origins as "remote" and needs `remotePatterns` + absolute URLs.
 */
export function resolveMediaSrc(src: string | undefined | null): string {
  if (src == null || src === "") return "";
  const s = String(src).trim();
  if (/^https?:\/\//i.test(s) || s.startsWith("data:")) return s;
  if (s.startsWith("//")) return `https:${s}`;
  if (s.startsWith("/")) {
    const origin = getApiOrigin();
    return origin ? `${origin}${s}` : s;
  }
  return s;
}

export function normalizeProductImages<T extends { images?: string[] }>(p: T): T {
  if (!p?.images?.length) return p;
  return { ...p, images: p.images.map((u) => resolveMediaSrc(u)) };
}
