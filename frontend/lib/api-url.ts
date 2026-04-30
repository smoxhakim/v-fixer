/**
 * Django REST base (`…/api`).
 *
 * - **Server / loopback:** `NEXT_PUBLIC_API_URL`, or `http://localhost:8001/api`.
 * - **Phone / LAN browser** (`http://10.x.x.x:3000`): if env still targets localhost,
 *   uses the **same host** as the page with `NEXT_PUBLIC_API_PORT` (default `8001`)
 *   so fetches reach your dev machine without editing `.env` per device.
 */
export function getApiUrl(): string {
  const envRaw = process.env.NEXT_PUBLIC_API_URL;
  const fallback =
    envRaw != null && String(envRaw).trim() !== ""
      ? String(envRaw).trim()
      : "http://localhost:8001/api";

  if (typeof window === "undefined") {
    return fallback;
  }

  const host = window.location.hostname;
  const onLoopback = host === "localhost" || host === "127.0.0.1";
  if (onLoopback) {
    return fallback;
  }

  const envPointsToLoopback = !envRaw || /localhost|127\.0\.0\.1/.test(String(envRaw));
  if (!envPointsToLoopback) {
    return fallback;
  }

  const port = process.env.NEXT_PUBLIC_API_PORT || "8001";
  return `http://${host}:${port}/api`;
}
