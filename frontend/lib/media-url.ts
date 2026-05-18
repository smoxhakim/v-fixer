import { getApiUrl } from "@/lib/api-url";

function trimTrailingSlashes(s: string): string {
  return s.replace(/\/+$/, "");
}

function normalizeHttpBase(s: string): string {
  return trimTrailingSlashes(s.trim());
}

/** `/media/imports/` style prefix for `${base}${id}` (leading slash, trailing slash). */
function normalizePathPrefix(prefix: string): string {
  let p = prefix.trim();
  if (!p.startsWith("/")) p = `/${p}`;
  if (!p.endsWith("/")) p = `${p}/`;
  return p;
}

function isPathOnlyMediaBase(base: string): boolean {
  return base.startsWith("/") && !base.startsWith("//");
}

/** Django API origin (no `/api` suffix). */
export function getApiOrigin(): string {
  return normalizeHttpBase(getApiUrl().replace(/\/api\/?$/i, ""));
}

/**
 * Base for building media URLs.
 *
 * - **Path prefix** (starts with `/`, e.g. `/media/imports/`): same-origin URLs like
 *   `${NEXT_PUBLIC_MEDIA_BASE_URL}${fileId}` → `/media/imports/<id>`.
 * - **Absolute** (`https://…`): origin (or full base) for `${base}/media/...` joins.
 * - **Unset:** falls back to {@link getApiOrigin}.
 */
export function getMediaBaseUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_MEDIA_BASE_URL?.trim();
  if (!explicit) return getApiOrigin();
  if (/^https?:\/\//i.test(explicit)) return normalizeHttpBase(explicit);
  return normalizePathPrefix(explicit);
}

/**
 * Turn stored image paths into URLs the browser can load.
 *
 * With **`NEXT_PUBLIC_MEDIA_BASE_URL=/media/imports/`** and a bare id `0266e810-…`, resolves to
 * `/media/imports/0266e810-…` (same origin; put nginx/Next rewrites in front of Django if needed).
 *
 * Accepts:
 * - absolute `http(s):` / `data:` / `//` URLs (unchanged),
 * - paths starting with `/` (unchanged in path-prefix mode; with http base, `${base}${path}`),
 * - `media/...` relative,
 * - `imports/...` or bare filenames joined under a path-prefix base when applicable.
 */
export function resolveMediaSrc(src: string | undefined | null): string {
  if (src == null || src === "") return "";
  const s = String(src).trim();
  if (/^https?:\/\//i.test(s) || s.startsWith("data:")) return s;
  if (s.startsWith("//")) return `https:${s}`;

  const base = getMediaBaseUrl();
  if (!base) return s;

  if (isPathOnlyMediaBase(base)) {
    if (s.startsWith("/")) return s;
    if (/^media\//i.test(s)) return `/${s}`;
    if (/^imports\//i.test(s)) {
      const rest = s.replace(/^imports\//i, "");
      if (/\/imports\/?$/i.test(base)) {
        return `${base}${rest}`;
      }
      return `/media/${s}`;
    }
    return `${base}${s.replace(/^\/+/, "")}`;
  }

  if (s.startsWith("/")) {
    return `${base}${s}`;
  }

  if (/^media\//i.test(s)) {
    return `${base}/${s}`;
  }

  if (/^imports\//i.test(s)) {
    return `${base}/media/${s}`;
  }

  return s;
}

export function normalizeProductImages<T extends { images?: string[] }>(p: T): T {
  if (!p?.images?.length) return p;
  return { ...p, images: p.images.map((u) => resolveMediaSrc(u)) };
}
